# Фронтенд (редактор GPUI)

[English](./README.md) | **Русский**

Исходники в виде ES-модулей лежат в `src/` и собираются **Vite** в один закоммиченный бандл:
`dist/js/app.js` (UMD; под RequireJS FreeIPA регистрируется как AMD-модуль и
зависит от его `freeipa/ipa` и `freeipa/rpc`). RPM устанавливает закоммиченный бандл, поэтому Node для сборки
пакета не нужен. Весь каталог плагина собирается здесь и коммитится как `dist/` (его ставит RPM): в `public/` лежат `chain.js`, `gpo.js` (вручную, AMD) и `img/`, они копируются как есть; глобальные стили `src/styles/{main,other,icons}.css` попадают в `js/app.css` после CSS Modules (`src/app.js` импортирует их последними);
`gpo.js` и `chain.js` берут `translations` и `editorDialog` из бандла (`js/app`).

Импорты внутри `src/` (и из тестов в `src/`) используют алиас `@gpui/` (= `src/`) вместо относительных путей `../`; он настроен в `vite.config.mjs`, `vitest.config.mjs`, `.storybook/shared.mjs` и `tsconfig.json`, а сборщик тестового дерева превращает его обратно в относительные AMD-id.

Весь код в `frontend/` использует `import`/`export` (без CommonJS и без `.cjs`). Node управляется через fnm: `eval "$(fnm env)"` (или `fnm use`), Node ≥ 20.

## Команды (из корня репозитория)

| Команда | Назначение |
|---|---|
| `make ui-dev-install` | `npm install` в `frontend/` |
| `make ui-dev` | Стенд Vite на http://127.0.0.1:8765/ipa/ui/ (`?gpo=Имя&lang=ru`), FreeIPA не нужен |
| `make ui-build` | Пересобрать закоммиченный бандл (`npm run build`) |
| `make ui-build-check` | Завершается ошибкой, если закоммиченный бандл отличается от свежей сборки |
| `make ui-storybook` | Storybook на http://localhost:6006: компоненты в изоляции, переключатель языка (EN/RU) и настоящий CSS редактора |
| `make ui-lint` | ESLint (`eslint.config.mjs`) |
| `make ui-format` / `make ui-format-check` | Prettier (`.prettierrc.json`: 4 пробела, одинарные кавычки, ширина 120) форматирует / проверяет `src`, `dev`, `scripts`, `tests` и конфигурационные файлы; `*.md`, `*.html`, lock-файл и сгенерированный бандл не затрагиваются |
| `npm run typecheck` (в `frontend/`) | `tsc --noEmit` по всему `src/` (JSDoc, `checkJs`, нестрогий режим). `types/globals.d.ts` описывает динамические члены редактора открытыми записями; прежние заглушки `@ts-expect-error` заменены точными аннотациями |

Порядок работы: правка `src/`, проверка в стенде (перезагружается при сохранении), `make test-ui`, `make ui-build`,
коммит `src/` вместе с пересобранным `js/app.js`.

## Storybook: разработка компонентов по отдельности

Компоненты разрабатываются и тестируются по одному в Storybook (`.storybook/`, stories лежат рядом с компонентом как `*.stories.js`).
Story — это и документация, и тест: в `npm test` каждая story открывается в настоящем Chromium (проект Vitest `stories`),
и её функция `play` (действия пользователя и проверки через `storybook/test`) должна проходить.

Порядок работы с компонентом:

1. `make ui-storybook`, создайте `src/components/<name>.stories.js` рядом с `<name>.js`.
2. Отрисуйте компонент в функции `render`: она возвращает DOM-элемент (хост), в который монтируется компонент. Покройте важные
   состояния: по умолчанию, пустое, ошибка, занято, длинный текст и другой язык (в тулбаре переключатель EN/RU).
3. Опишите поведение в `play`: клик, ввод, клавиатура (`userEvent`), затем проверки (`expect`, шпионы `fn()` из `args`).
4. `npm test` запускает stories вместе с unit- и integration-тестами; `npm run build-storybook` собирает статический сайт.

Пример: `src/components/confirmation-dialog.stories.js`. Stories используют те же шимы `freeipa/*`, что и стенд
(`.storybook/shared.mjs`), и `src/styles/main.css`. Файлы stories не входят в бандл и исключены из покрытия.
Компоненты, которым нужен настоящий контекст редактора (всё дерево, RPC), по-прежнему проверяются integration-тестами; начинайте
со stories для самодостаточных частей (диалоги, контролы, дерево, header, footer).

## Стиль компонентов

Новые и переносимые компоненты устроены одинаково (образец — `src/components/EditorStatus/`):

```
src/components/<Name>/
  <Name>.js            createX(options) -> DOM-элемент, строится через h() из src/lib/dom.js
  <Name>.module.css    приватные стили (CSS Modules, имена классов в camelCase)
  <Name>.stories.js    состояния и play-тесты
```

TypeScript необязателен и вводится постепенно: файл `.ts` лежит рядом с JavaScript (пилот — `src/util/editor-dto.ts`). `tsc -p tsconfig.strict.json`
(часть `npm run typecheck`) проверяет `.ts` строго, а JavaScript остаётся на нестрогом `tsconfig.json`; ESLint `.ts` пропускает. Импортировать
без расширения (`@gpui/util/editor-dto`); тестовое дерево превращает его в AMD-модуль `.js` через `transformWithOxc` из Vite.

Source maps: стенд и Storybook отдают их для скриптов (Vite) и для стилей (`css.devSourcemap`: в панели Styles видно `File.module.css:строка`).
`npm run watch` собирает dev-сборку (`--mode development`) с `app.js.map` и метками `data-source`; у стилей такой сборки карты нет (ограничение Vite), поэтому
перед правилами каждого исходного файла стоит комментарий с его именем (`/* src/styles/shell.css */`). В закоммиченной production-сборке карт нет, а `npm run build:check` падает на оставшемся `.map`.

Данные сервера Storybook берёт из поддельного `freeipa/rpc` (`.storybook/shims/rpc.js`): он вызывает mock-сервер стенда прямо на странице;
`parameters: { rpc: { scenario } }` истории или переключатель Scenario на панели задаёт его поведение (`normal`, `error`, `slow`, `empty`).
Каждая история — ещё и проверка доступности (`@storybook/addon-a11y`, `a11y.test: 'error'`: нарушение роняет тест истории). Пример —
`src/util/API.stories.js` и история Foundations/Tokens.

Внутри компонента: состояние в локальных переменных (объект `view`/`ui` в крупных шаблонах), одна функция `render`, которая пишет
состояние в DOM (её же вызывают один раз при создании), обработчики меняют состояние и вызывают `render`. В стенде и в Storybook
каждый элемент, созданный через `h()`, получает `data-source="src/путь/Файл.js:строка"` (флаг `__GPUI_DEV__`; в сборке, тестовом дереве
и Vitest его нет), так что узел в DevTools ведёт к исходнику; у элементов старого `ElementCreator` его нет.

- Компонент — функция, возвращающая обычный DOM-элемент. Его строит `h(tag, attrs, ...children)`: строки становятся текстовыми узлами,
  а не HTML (никакого `innerHTML`); дочерние `null`/`false` пропускаются, поэтому работает `cond && h(...)`. `cx()` склеивает имена классов.
- Стили приватны. Снаружи компонент по классу никто не выбирает: публичные «крючки» — атрибуты `data-*`, они перечислены в комментарии
  в начале файла (`[data-editor-status]`, `[data-editor-status-action]`, ...). Родителю, которому нужно управлять раскладкой, достаточно
  селектора по атрибуту в собственном CSS (`.gp__admx-wrapper > [data-editor-status]`). Контекст оболочки редактора в модуле
  записывается как `:global(.gp__container)`.
- Цвета, отступы и прочие значения остаются такими же, как были в `main.css`; story закрепляет их через `getComputedStyle`, чтобы
  перенос не изменил внешний вид незаметно.
- Старый код строит интерфейс через `ElementCreator`. Чтобы он работал во время переноса, прежний путь модуля остаётся адаптером,
  оборачивающим новые элементы через `ElementCreator.wrap(element)` (см. `components/editor-status.js`); вызывающие переходят на новый API по мере переноса.

Как стили попадают на страницу: `npm run build` выдаёт CSS Modules, а затем `src/styles/*.css` как `dist/js/app.css` рядом с `app.js`; `gpo.js`
подключает этот единственный файл (URL `/img/...` в CSS превращаются в `../img/...`), а манифест установщика (`UI_PLUGIN_FILES`) его перечисляет. Storybook и стенд
получают те же стили от Vite. Для браузерных тестов `npm test` превращает каждый `*.module.css` в AMD-модуль через `postcss-modules`
(`scripts/build-test-root.mjs`); `scripts/read-amd.mjs` понимает `import x from`, именованные импорты и `export function`,
но не `export default`.

Статус: перенесены `EditorStatus` и хром диалогов редактора (`Dialog`, его использует `editor-dialog.js`). Диалог принимает параметры
`width` и `fill` вместо переопределения его классов потребителями и отдаёт «крючки» `[data-dialog]` и `[data-dialog-part="..."]`
(header, title, close, body, error, footer, cancel, apply) для раскладки содержимого потребителями; на нём теперь построены все модалки редактора (глобальных правил окон
`.preference__modal*` больше нет).

Перенос общего хрома рискован, потому что от одних и тех же имён классов зависит много мест. Помог временный регрессионный харнес:
setup-файл Vitest подменял `chromium.launch` и записывал каждый диалог, который открывают интеграционные тесты (размеры и вычисленные
стили окна, шапки, заголовка, крестика, тела, подвала, а также кнопок и полей внутри) по структуре, а не по классам, до и после изменения;
72 снимка должны были остаться идентичными. В репозитории харнеса нет.

## Стенд (`dev/`)

Vite раздаёт `src/` напрямую. `freeipa/ipa` и `freeipa/rpc` разрешаются в ES-шимы из `dev/shims/`;
`vite.config.mjs` отвечает на `POST /ipa/session/json` из mock-бэкенда `dev/backend.mjs` и отдаёт `css/` и `img/` плагина
по адресу `/ipa/ui/js/plugins/chain/`. Подробности — в `dev/README.ru.md`. `chain.js` и `gpo.js` в стенде не работают
(им нужны собственные модули FreeIPA); проверяйте их на живом сервере (`.devcontainer/`).

## Тесты

Запускает тесты **Vitest** (`vitest.config.mjs`, три проекта: `unit`, `integration`, `e2e`). Две npm-задачи (обе доступны как цели make):

| Задача | Make | Что запускает |
|---|---|---|
| `npm test` | `make test-ui` | `tests/unit`, `tests/integration` и stories Storybook (проект `stories`) на моках; FreeIPA не нужен |
| `npm run test:watch` | | юнит-тесты в режиме наблюдения |
| `npm test -- --coverage` | | добавляет V8-покрытие `src/` (отчёт в `coverage/`); используется в CI |
| `npm run test:ipa` | `make test-ui-ipa` | `tests/e2e` на настоящем сервере FreeIPA в dev-контейнере podman, а также тесты, которым нужно ПО серверной стороны FreeIPA (см. ниже) |

Структура `tests/` (всё в `frontend/` — ES-модули с `import`; Node-овский `require` не используется. Оставшиеся в браузерных тестах вызовы `require(...)` — это RequireJS внутри тестируемой страницы; браузерные тесты управляются через Playwright):

- `unit/` — импортируют модули из `src/` напрямую. Зависимости, одинаковые для всего файла, заменяются через
  `vi.mock`; тесты, которым нужны новые подмены (или глобалы вроде `document`, `navigator`) на каждый тест, используют
  `helpers/load-module.js`: `await loadModule('util/API.js', { 'freeipa/rpc': {...} }, { navigator })` загружает новый
  экземпляр с этими подменами и по умолчанию подставляет заглушки `freeipa/ipa` и `freeipa/rpc`. Vitest выбрасывает ошибку, если код
  читает экспорт, не определённый в подмене, поэтому такие экспорты нужно задавать явно (`getLanguage: undefined`).
  `types/rpc.d.ts` генерируется из тех же эталонов (`npm run types:rpc`; `rpc-types.test.js` падает, если файл устарел).
  `helpers/contract.js` читает эталонные ответы серверных команд из `../tests/contracts/gpo_editor/*.json` (те же файлы использует `tests/test_gpo_editor_contract.py` для проверки настоящих команд); `gpo-editor-contract.test.js` сверяет с ними mock-сервер и `util/API.js`.
  `helpers/load-plugin.js` делает то же для написанных вручную страниц `public/chain.js` и `public/gpo.js` (AMD поверх `freeipa/*` FreeIPA): `loadPlugin('chain.js', { 'freeipa/rpc': createRpcDouble() })` возвращает экспорты модуля и подмены (`tests/unit/chain-actions.test.js`, `gpo-page.test.js`).
- `integration/` (`*.browser.test.js`) — настоящие Chromium и DOM, RPC на моках. Работают с
  `frontend/.test-root/` (в `.gitignore`, пересоздаётся командой `npm test`): каждый модуль из `src` отдельным AMD-модулем
  плюс ссылки на `css/`, `img/`, `chain.js`, `gpo.js`. `bundle.browser.test.js` вместо этого загружает
  закоммиченный боевой бандл через RequireJS.
- `scripts/read-amd.mjs` теперь используется только в `scripts/build-test-root.mjs` для создания дерева AMD-модулей для браузерных тестов.
- `e2e/` — входит в настоящий Web UI, проверяет меню и фасеты, создаёт GPO через CLI `ipa` контейнера,
  открывает редактор со страницы GPO и снова удаляет GPO.

`npm run test:ipa` выполняет три шага:

1. `scripts/ipa-up.sh` запускает контейнер `freeipa-gpo-dev`, если он остановлен, и повторно выполняет `.devcontainer/scripts/setup-ipa.sh`
   (подключает исходники рабочей копии, перезапускает httpd). Нужно один раз выполнить `.devcontainer/host-setup.sh` и один раз создать
   контейнер из VS Code.
2. `tests/e2e` на хосте против живого Web UI. С `REQUIRE_IPA=1` (задаётся задачей) недоступный сервер приводит к ошибке,
   а не к пропуску. Настройки: `IPA_URL`, `IPA_ADMIN_USER`, `IPA_ADMIN_PASSWORD`, `IPA_CONTAINER`.
3. `scripts/ipa-native.sh` запускает весь набор на моках (unit + integration) **внутри контейнера**, где есть то, чего нет
   на обычном хосте: настоящая libadmix, каталог SDMX, определения политик, jQuery FreeIPA и Chromium. Там ничего не
   пропускается; `scripts/assert-no-skips.mjs` завершает запуск ошибкой, если что-то пропущено. Рабочая копия смонтирована в контейнер,
   поэтому он использует `node_modules` хоста; браузер Playwright устанавливается в контейнер при первом использовании.

Образ контейнера должен содержать `python3-module-admix` 0.3.x (как требует `ipa-gpo-install.spec`), `chromium` и TTF-шрифт
(`fonts-ttf-open-sans`); их ставит `.devcontainer/Containerfile`. Скрипт проверяет admix и chromium и подсказывает исправление.
Более старый образ можно обновить на месте, например командой
`podman exec freeipa-gpo-dev bash -c 'mkdir -p /var/lib/apt/lists/partial && apt-get update && apt-get install -y python3-module-admix chromium'`.
Chromium также нужны настоящий `/dev/shm` и высокий лимит процессов: `devcontainer.json` задаёт `--shm-size=2g --pids-limit=-1`
(для контейнеров, созданных раньше, скрипт перемонтирует `/dev/shm`). По той же причине интеграционные тесты идут в 2 потока.

На обычном хосте `npm test` пропускает тесты, которым нужно это ПО (20 тестов: нативный контракт, каталог SDMX, GUID аудита,
jQuery FreeIPA, живые дескрипторы фильтров).

Покрытие учитывает только юнит-тесты (интеграционные тесты выполняют код внутри Chromium, а V8-покрытие Node его не видит), поэтому
порог в `vitest.config.mjs` — это нижняя граница, а не цель: поднимайте его, когда покрытие юнит-тестами растёт. Он рассчитан на обычный хост
(около 17% операторов); в CI, где выполняются тесты нативного контракта, достигается около 19%.

Браузер нужно установить один раз: `npx playwright install chromium` (в `frontend/`).

## Визуальные эталоны

`tests/integration/dialogs-visual.browser.test.js` сравнивает снимки формы предпочтения, модалки таргетинга (в том числе поверх формы),
режима только для чтения и вопроса о сбросе правок с PNG из `tests/integration/__snapshots__/dialogs/`. Это вид диалогов до рефакторинга на
Dialog и CSS-модули: шаг рефакторинга не должен их менять. Пиксели зависят от шрифтов, поэтому тест выполняется только в контейнере
(dev-контейнер, CI) и пропускается на обычном хосте (отсюда 22 пропущенных теста там). При падении фактический снимок сохраняется в
`.test-root/visual-diff/`. После намеренного визуального изменения выполнить в контейнере `UPDATE_SNAPSHOTS=1 npx vitest run --project
integration tests/integration/dialogs-visual` и просмотреть разницу PNG перед коммитом.

## CI

Задача `frontend` в `.forgejo/workflows/python-backend.yml` выполняется в `altlinux.space/actions/runner/containers:sisyphus` (образ,
который использует интеграционная задача). Она устанавливает `python3-module-admix sdmx-basealt sdmx-schemas admx-basealt freeipa-server-common chromium
fonts-ttf-open-sans`, настраивает fontconfig, затем выполняет lint, `format:check`, typecheck, `build:check`, `npm test -- --coverage` (один повтор для
браузерных тестов, чувствительных к времени) и `scripts/assert-no-skips.mjs`: **выполняются все 419 тестов, и ни один не может быть пропущен**.

fontconfig настроен игнорировать `/usr/share/fonts/type1`: иначе он сопоставляет Arial шрифтам Type 1 URW, которые Chromium не умеет
отрисовывать (ширина текста 0), и проверки раскладки падают. Шаги задачи проверены выполнением её скриптов `run:` в этом образе.
