# План улучшения опыта фронтенд-разработки

**Дата:** 2026-10-18
**Область:** `plugin/ui/grouppolicy/` (≈20 тыс. строк JS, 2,4 тыс. строк CSS), `frontend/dev/`, `frontend/tests/`.
**Принцип:** улучшать инструментарий вокруг существующего кода, не переписывая редактор. Решение о смене фреймворка принимается после этапа 6 на основе измерений.

## 1. Исходное состояние (проверено по репозиторию)

| Область | Факт |
|---|---|
| Модульность | Все файлы `js/**` — AMD `define([...], function(__dep0){ var {x} = __dep0; ... return {x}; })`. ESM-исходников нет, обёртки поддерживаются вручную. |
| Язык | ES2015+ внутри AMD (`const`, `class`, стрелочные функции), смешан с `var` и jQuery-стилем в `chain.js`/`gpo.js`. |
| Линтинг, форматирование, типы | Нет. Корневого `package.json` нет. Для Python есть `ruff` и `pylint`. |
| Тесты | 40 файлов в `frontend/tests/`: Vitest и Playwright (`*.browser.test.js`). Без Chromium браузерные тесты молча пропускаются. |
| CI и сборка RPM | `python-backend.yml` и `.spec` запускают только pytest и покрытие Python. `make test-ui` нигде не вызывается. |
| Dev-стенд | `frontend/dev`: mock-бэкенд и `requirejs` без сборки, обновление по F5. Не покрывает `chain.js`/`gpo.js` (зависят от `freeipa/*`). |
| Размеры | Крупные файлы: `preferences-view-template.js` 2111, `script-template.js` 1449, `chain.js` 1193, `app.js` 876, `main.css` 2430. Остальной код разбит удовлетворительно. |
| RPC-контракт | `util/API.js` (373 строки) и `editor-dto.js` вручную согласованы с `gpo.py`; схемы нет. |

Ограничение развёртывания: RPM собирается в hasher без сети, в итоге нужны статические файлы в `/usr/share/ipa/ui/js/plugins/chain`.

## 2. Этапы

Оценки для одного разработчика, рабочие дни.

### Этап 1. Гигиена (1-2 дня) — делать первым

- Корневой `package.json`: `npm run lint | format | test | test:ui | dev`. Зависимости стенда (уже перенесены в `frontend/package.json`) переезжают в него (`npm ci` вместо `--prefix`). `Makefile` остаётся тонкой обёрткой.
- Линтер и форматтер: **ESLint flat config + Prettier** (тот же набор, что в `freeipa-webui`: `eslint.config.mjs`, `prettier`, `vitest`, `knip`; общие правила упростят перенос кода). Biome остаётся запасным вариантом, если скорость станет проблемой. Правила для AMD-кода: `no-undef`, `no-unused-vars`, `eqeqeq`. Первый прогон только `--fix`, без ручных переписываний. Форматирование отдельным коммитом, добавить в `.git-blame-ignore-revs`.
- `.vscode/extensions.json` и `settings.json`: расширение линтера, format-on-save для JS/CSS.
- `.editorconfig`.
- Убрать дубль `img/arrow.svg` ↔ `img/svg/arrow.svg` и `close.svg`, проверив ссылки в CSS и `tests/test_editor_icon_assets.py`.

**Готово, когда:** `npm run lint` чист на всём `plugin/ui` и `frontend/tests`.

### Этап 2. UI-тесты в CI (1-2 дня)

- Job `ui-tests` в `python-backend.yml`: `npm ci`, `npx playwright install --with-deps chromium`, `npm run test:ui`.
- Переменная `REQUIRE_BROWSER=1`: в CI отсутствие Chromium — ошибка, а не skip.
- `c8` для покрытия JS и порог на уровне текущего значения (по аналогии с `COVERAGE_THRESHOLD` для Python); трекать, не снижать.
- `frontend/tests/e2e/freeipa-plugin-menu.live.test.js` запускается локально через `npm run test:ipa`, в CI не запускается.

**Готово, когда:** PR с поломкой UI-теста краснеет в CI.

### Этап 3. Типы без смены языка (3-5 дней)

- `// @ts-check` + `tsc --noEmit` (`allowJs`, `checkJs`, `noEmit`). Порядок: `util/` → `editor-dto.js` → `locales/` → компоненты. Новые файлы сразу с аннотациями JSDoc.
- Типы RPC-ответов по возможности вести так, чтобы их можно было переиспользовать в `freeipa-webui` (`utils/datatypes/globalDataTypes.ts`), см. [WEBUI-MIGRATION.md](WEBUI-MIGRATION.md).
- Описать RPC-ответы в `types/rpc.d.ts` (`@typedef`), по одному на метод `API.js`.
- Зафиксировать контракт с бэкендом: golden-файлы JSON (ответы `gpo_editor_*`), которые читают и pytest (`tests/test_gpo_editor_backend.py`), и `node:test`. Расхождение формата ловится в CI до живого сервера.

**Готово, когда:** `npm run typecheck` в CI; `util/` и `editor-dto.js` без `any`.

### Этап 4. ESM как источник правды (4-6 дней) — главный выигрыш

Проблема: ручные AMD-обёртки блокируют IDE-навигацию, автоматический рефакторинг, tree-shaking и npm-зависимости.

- Исходники в `plugin/ui/grouppolicy/src/**` как ES-модули.
- Сборка esbuild или Rollup (`format: 'amd'` / `iife`) в `plugin/ui/grouppolicy/js/`. `chain.js` и `gpo.js` остаются внешними AMD-входами и подтягивают сборку через `require`.
- Сначала автоматическая конвертация существующих `define(...)` → `import/export` кодмодом (jscodeshift; шаблон обёртки регулярный). Затем проверка: собранный вывод проходит все 40 тестов без изменений в тестах.
- Выбор между «коммитить сборку» и «собирать в RPM»: hasher без сети → **коммитить собранный `js/` и проверять в CI, что `npm run build` не меняет дерево** (`git diff --exit-code`). Альтернатива (BuildRequires на node + vendored `node_modules`) тяжелее для ALT.
- Source maps включить; в RPM не ставить.

**Риск:** остаточные `require(['./js/app'])` в `gpo.js` и динамические загрузки — проверить вручную. **Готово, когда:** сборка детерминирована, все тесты зелёные, правка в `src/` отображается в devtools с исходными именами.

### Этап 5. Dev-цикл (2-3 дня)

- Заменить `server.js` + `requirejs` на Vite (или esbuild `--serve`): ESM напрямую, HMR/live-reload, прокси `/ipa/session/json` на mock `backend.js` либо на живой FreeIPA из devcontainer (`IPA_URL`).
- Расширить шимы `freeipa/*` (`menu`, `phases`, `reg`, `text`, `jquery`), чтобы `chain.js` и `gpo.js` работали в стенде. Это закрывает самое слабое место: сегодня эти страницы проверяются только на живом сервере.
- Режим `?scenario=error|slow|empty` в mock-бэкенде для проверки состояний ошибки и загрузки.

**Готово, когда:** `npm run dev` показывает редактор и страницы Chains/GPO без FreeIPA; сохранение файла обновляет страницу без F5.

### Этап 6. Структура кода и стили (5-8 дней, итеративно)

**Статус (выполнена первая часть).** Вынесены модульные функции, не зависящие от замыканий: из `preferences-view-template.js` (2108 → 1385 строк) в `preference/view/{common,field-control,field-dependencies,field-tabs}.js`, из `script-template.js` (1455 → 1411) в `script/helpers.js`. Это механический перенос по AST без изменения логики; тесты (280 из 280 в контейнере) и бандл подтверждают.
**Осталось:** сами крупные функции — `renderPreferencesTemplate` (1222 строки, 74 общие переменные, 39 вложенных функций; `openForm` 378 строк), `renderScriptEventEditor` (1002 строки, 58 переменных, 30 вложенных функций, состояние в основном в одном объекте `state`; `openForm` 148, `renderAssets` 145, `openPicker` 87) и `renderScriptsTemplate` (285). Их разбиение требует общего контекста (`ctx`) и отдельных модулей по областям (таблица, форма, панель, дискард-диалог), то есть уже рефакторинг, а не перенос.

- Разделить крупнейшие файлы по образцу `security/` (model + dialog + view): `preferences-view-template.js`, `script-template.js`, `chain.js`. Критерий: файл > 600 строк требует обоснования. Каждый шаг сопровождается существующими тестами.
- CSS: вынести токены (цвета, отступы, радиусы, тени) в custom properties; `main.css` разбить по компонентам (`header`, `tree`, `dialogs`, `preferences`...). Подключение через `@import` на этапе сборки.
- Визуальные регрессии: Playwright `toHaveScreenshot` для 6-8 ключевых экранов (дерево, ADMX, preferences, scripts, security, targeting), снимки фиксируются **до** этапа 6.
- Общий примитив реактивности (минимальный `createStore`/сигналы) вместо ручных `renderRequestId`/`cleanup`-флагов в `app.js`, начиная с одного экрана.

### Этап 7. Решение о фреймворке (1-2 дня оценки + пилот 5-10 дней)

После этапов 1-6 редактор типизирован, собран из ESM и покрыт снимками. Только теперь осмысленно сравнить варианты на одном экране (список скриптов — самый изолированный):

| Вариант | Объём | Когда выбирать |
|---|---|---|
| Остаться на vanilla + `createStore` | 0 | если этапы 1-6 сняли основные болевые точки |
| Preact/Lit + htm, постепенно | 2-3 мес. | нужен декларативный рендер, но не стек freeipa-webui |
| React + PatternFly (`WEBUI-MIGRATION.md`, блок 8) | 3-5 мес. | нужен единый UI с `freeipa-webui` и есть владелец этого проекта. В webui нет UI упорядочивания и слитой плагинной инфраструктуры: часть компонентов придётся создавать |

Критерии пилота: число строк против vanilla-версии, время сборки, прохождение портированных тестов, клавиатурная доступность. Утверждение «50-70% меньше кода» измерить, а не принимать.

## 3. Итоговая оценка и порядок

| Этап | Дни | Зависит от |
|---|---|---|
| 1. Гигиена | 1-2 | — |
| 2. UI-тесты в CI | 1-2 | 1 |
| 3. Типы и контракт | 3-5 | 1 |
| 4. ESM + сборка | 4-6 | 1, 2 |
| 5. Dev-цикл | 2-3 | 4 |
| 6. Структура и стили | 5-8 | 2, 4 |
| 7. Пилот фреймворка | 6-12 | 1-6 |

Этапы 1-5: **11-18 дней**, 1-6: 16-26 дней. Этапы 1 и 2 безопасны и дают пользу сразу; 3 можно вести параллельно с 4.

## 4. Риски

- **Сборка в RPM.** Нет сети в hasher → коммитим результат и проверяем актуальность в CI (этап 4).
- **Расхождение собранного и исходного кода** в ревью → `git diff --exit-code` после сборки.
- **Регрессии при разделении файлов** → снимки и 40 существующих тестов до начала рефакторинга.
- **Форматирование засоряет историю** → отдельный коммит + `.git-blame-ignore-revs`.
- **Совместимость с FreeIPA UI:** `chain.js`/`gpo.js` зависят от версии `freeipa/*`; шимы стенда нужно сверять с настоящими модулями (live-тест меню уже есть).

### Открытая проблема: образ для CI без установки Chromium и без доступа в интернет

**Состояние.** Задача `frontend` (`.forgejo/workflows/python-backend.yml`) работает в образе `altlinux.space/actions/runner/containers:sisyphus`
и при каждом запуске выкачивает всё нужное из сети:

| Что | Откуда | Объём |
|---|---|---|
| `python3-module-admix`, `sdmx-*`, `admx-basealt`, `freeipa-server-common`, `fonts-ttf-open-sans` | `apt-get` (Sisyphus) | десятки пакетов |
| `chromium` (нужен ради системных библиотек) | `apt-get` | около 140 пакетов |
| браузер Playwright | CDN Playwright (`playwright install chromium`) | около 120 МБ |
| npm-зависимости | `npm ci` (npm-реестр) | 174 пакета в `package-lock.json` |

Цена: задача зависит от доступности трёх внешних источников, дольше выполняется и ломается при недоступности сети или смене версий в Sisyphus (образ без `apt-get update` не работает, а версии `admix` и `chromium` плавают). В hasher сети нет вообще, поэтому та же схема не годится для сборки пакета.

**Требования к решению:**
- в образе уже есть всё, что нужно тестам: Node (≥ 20), `python3-module-admix` 0.3.x, `sdmx-basealt`, `sdmx-schemas`, `admx-basealt`, jQuery FreeIPA (`/usr/share/ipa/ui/js/libs/jquery.js`), Chromium вместе с TTF-шрифтом и правилом fontconfig, которое отбрасывает шрифты Type 1;
- в задаче нет `apt-get` и `playwright install`; `npm ci` работает из кэша или из закоммиченного/vendored набора зависимостей;
- версия Chromium закреплена и совпадает с той, под которую выпущена версия Playwright из `package-lock.json`, иначе она ломается молча;
- образ собирается и публикуется воспроизводимо (из репозитория, например из `.devcontainer/Containerfile` или отдельного `ci/Containerfile`) и обновляется осознанно, а не при каждом запуске.

**Что нужно исследовать и выбрать:**
1. Есть ли готовый образ в `altlinux.space/actions/runner/*` (или в `registry.altlinux.org`) с Node и Chromium; проверено только `containers:sisyphus` — Chromium в нём нет, `apt` требует `apt-get update`.
2. Как подключить Chromium без `playwright install`: системный `chromium` через `executablePath` / `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`-подобный способ (в тестах 23 вызова `chromium.launch`, потребуется общая обёртка), либо образ с заранее загруженным `PLAYWRIGHT_BROWSERS_PATH`. Нужно проверить, что Playwright работает с системным Chromium ALT той версии, что в Sisyphus (сейчас 155 против 156 у Playwright).
3. Как обеспечить npm-зависимости без сети: кэш в образе (`npm ci --offline`), `node_modules` в образе с проверкой по `package-lock.json`, либо внутренний npm-прокси.
4. Где хранить и как обновлять образ (реестр Forgejo; триггер пересборки при изменении `package-lock.json`, `Containerfile` или версии `admix` в spec).
5. Вариант полностью автономный: образ, собранный из `.devcontainer/Containerfile` без части FreeIPA, плюс `chromium` и браузер Playwright; сверить, что он воспроизводит результат dev-контейнера (280 тестов, нет пропусков).

**Критерий готовности:** задача `frontend` проходит в runner'е без доступа в интернет (проверка: запуск с отключённой сетью), `assert-no-skips.mjs` зелёный (280 тестов, ноль пропусков), время задачи не больше текущего.

## 5. Связь с миграцией в freeipa-webui

Этапы 1-4 этого плана — предусловие блока «Подключение существующего редактора» в [WEBUI-MIGRATION.md](WEBUI-MIGRATION.md): без автономной ESM-сборки редактор нельзя встроить в webui без AMD-шимов (+1 неделя).

## 6. Первые шаги

1. Этапы 1 и 2 одним PR: `package.json`, линтер, job в CI.
2. Снять базовые снимки Playwright и порог покрытия JS.
3. Прототип кодмода для этапа 4 на `util/` и `components/header/` с проверкой, что тесты проходят без правок.
