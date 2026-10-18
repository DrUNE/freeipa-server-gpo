# Фронтенд: что изменилось в ветке `dev-setup`

Документ описывает, в каком состоянии был проект в точке ответвления ветки, что в ней изменилось, почему и как теперь работать с фронтендом.
Состояние на 2026-10-18. Точка ответвления — коммит `dfc4816` (merge PR #17 в `master`, 2026-10-09); в ветке 15 коммитов (все — Andrey Litvinov, 15–18 октября), плюс несохранённые в коммит правки (см. раздел 6).

## 1. Кратко

| | Было (`dfc4816`) | Стало |
|---|---|---|
| Исходники редактора | 69 AMD-модулей в `plugin/ui/grouppolicy/js/` (ручные обёртки `define([...])`), редактировались прямо там | ES-модули в `frontend/src/` (74 файла), сборка Vite в один файл `plugin/ui/grouppolicy/js/app.js` (коммитится, RPM ставит его) |
| Запуск без FreeIPA | не было | `make ui-dev`: Vite со стендом (mock RPC, шимы `freeipa/*`) |
| Проверка на живом сервере | вручную | podman dev-контейнер с FreeIPA, живые и e2e-тесты |
| JS-тесты | 38 файлов в `tests/ui/`, `node:test`, без цели в Makefile и без CI | 40 файлов в `frontend/tests/` на Vitest: 17 unit, 22 integration, 1 e2e; 280 тестов |
| Линтер и типы | нет | ESLint, `tsc --noEmit` по JSDoc |
| CI для фронтенда | нет | задача `frontend`: lint, typecheck, проверка бандла, тесты с покрытием, запрет пропусков |
| Документация фронтенда | нет | `frontend/README.md`, `doc/plans/*`, этот документ |

## 2. Что было в начале ветки

- Редактор GPO (GPUI) — vanilla JS, около 17,2 тыс. строк (71 файл вместе с `chain.js` и `gpo.js`), модули в формате AMD для RequireJS FreeIPA. Исходных ES-модулей не было: обёртки и список зависимостей поддерживались вручную.
- Страницы Chains и GPO (`chain.js`, `gpo.js`) — jQuery-фасеты FreeIPA, тоже AMD.
- В `tests/ui/` лежало 38 файлов тестов: юнит-тесты через `vm` с подменой `define`, браузерные на Playwright. Цели `make test-ui` не было, в CI они не запускались, для запуска требовался `NODE_PATH` на установленные `playwright` и `requirejs`. Без Chromium браузерные тесты молча пропускались.
- Автономного стенда не было: проверить редактор можно было только на установленном FreeIPA.
- Линтера, форматтера и проверки типов для JS не было. Python-часть (`ruff`, `pylint`, pytest с порогом покрытия) уже была и не менялась.
- CI (`python-backend.yml`): сборка RPM, интеграция во FreeIPA, публикация; про JS — ничего.

## 3. Что произошло в ветке

Хронология по коммитам (все 2026):

| Дата | Коммит | Содержание |
|---|---|---|
| 10-15 | `5569b1c` | mock dev-сервер для редактора (`tools/ui-dev`) |
| 10-16 | `66367f8`, `78fcd3f` | podman dev-контейнер с живым FreeIPA, конфиг VS Code |
| 10-16 | `6942226` | живой тест: плагин подключён к FreeIPA |
| 10-17 | `9d9a1ec` | анализ редактора и план интеграции в freeipa-webui |
| 10-18 | `bf2c061`, `d4c0f5b`, `eec3c8a`, `4f4afef` | перестройка документации; планы разделены на `FRONTEND-DX-PLAN` и `WEBUI-MIGRATION`; корневой индекс планов |
| 10-18 | `9e0516a` | отдельный проект `frontend/`: ESM-исходники, сборка в один бандл, Vite-стенд |
| 10-18 | `04f20e1` | ESLint, CI-задача (в сообщении упомянут Prettier; в самом коммите его не было, он подключён позже, см. раздел 6) |
| 10-18 | `423a18a` | все JS-тесты перенесены в `frontend/tests/`, разбиты на unit / integration / e2e |
| 10-18 | `e3f626f` | тесты переведены на Vitest, юнит-тесты на настоящие `import`, покрытие |
| 10-18 | `647eb28` | в dev-контейнере проходят все тесты (Chromium, `admix` 0.3.x) |

Документы анализа (`ARCHITECTURE.md`, `INTEGRATION-PLAN.md`, `GPO-EDITOR-ANALYSIS.md`) при проверке содержали ошибки (размеры файлов в байтах вместо строк, выдуманная связь с `admix`, неверная версия `admix` в README и man-страницах, неточные оценки). Они исправлены, корневой `ARCHITECTURE.md` удалён как дубль `doc/ARCHITECTURE*.md`, два плана объединены в `doc/plans/WEBUI-MIGRATION.md`.

## 4. Как устроено сейчас

```
frontend/
  src/                ES-модули редактора (import/export)        <- править здесь
  dev/                стенд: mock-бэкенд, ES-шимы freeipa/*, index.html
  tests/unit/         юнит-тесты (читают src/, зависимости подменены)
  tests/integration/  Chromium + настоящий DOM, RPC на моках
  tests/e2e/          живой FreeIPA в dev-контейнере
  scripts/            сборка тестового корня, проверка бандла, запуск в контейнере
  types/              заглушки типов freeipa/* и открытые типы редактора
  vite.config.mjs, vitest.config.mjs, eslint.config.mjs, tsconfig.json
plugin/ui/grouppolicy/
  js/app.js           СГЕНЕРИРОВАНО (Vite): единственный файл редактора, не править
  chain.js, gpo.js    страницы FreeIPA (как раньше, без ESM-исходников)
  css/, img/          как раньше
```

Все файлы в `frontend/` — ES-модули (`import`/`export`), CommonJS и `.cjs` не используются. Единственный артефакт сборки — UMD-бандл: под RequireJS FreeIPA он регистрируется как AMD-модуль и зависит от `freeipa/ipa` и `freeipa/rpc`. `gpo.js` и `chain.js` берут `translations` и `editorDialog` из `js/app`.

## 5. Почему так

- **ESM вместо ручного AMD.** Ручные обёртки блокировали навигацию в IDE, рефакторинг и подключение npm-пакетов. Автоматический перевод 69 файлов дал ES-исходники без изменения поведения.
- **Один бандл, закоммиченный в репозиторий.** Пакет RPM собирается в hasher без доступа в сеть, Node там не нужен. Поэтому результат сборки лежит в git, а `npm run build:check` в CI проверяет, что он совпадает с исходниками.
- **Vite.** Dev-сервер перезагружает страницу при сохранении, один инструмент для стенда, сборки и тестов (Vitest использует тот же конфиг).
- **Тесты внутри `frontend/`.** Всё, что относится к редактору, лежит в одном проекте с одним `package.json`. Два сценария: `npm test` (на моках, без FreeIPA) и `npm run test:ipa` (с живым сервером).
- **Тесты в контейнере без пропусков.** 20 тестов сверяют UI с настоящими серверными компонентами (`libadmix`, каталог SDMX, jQuery FreeIPA) и на обычной машине пропускались. Теперь они выполняются в dev-контейнере, а CI-задача падает, если пропущен хотя бы один тест (`assert-no-skips.mjs`).
- **Проверка типов без смены языка.** JSDoc и `tsc --noEmit` ловят расхождения аннотаций, не требуя переписывать код на TypeScript.
- **Документы и планы.** Анализ нужен, чтобы решить, переписывать ли редактор на React/PatternFly при переходе на freeipa-webui; решение отложено до пилота (см. `doc/plans/`).

## 6. Как работать

Node берётся через fnm (`eval "$(fnm env)"` или `fnm use`), версия ≥ 20 (`frontend/.node-version`: 24).

**Первый раз**

```bash
make ui-dev-install                      # npm install в frontend/
npx --prefix frontend playwright install chromium
```

**Ежедневный цикл** (из корня репозитория):

1. Правьте файлы в `frontend/src/`. Файлы в `plugin/ui/grouppolicy/js/` руками не меняйте.
2. `make ui-dev` и откройте `http://127.0.0.1:8765/ipa/ui/` (`?gpo=Имя&lang=ru`): редактор на mock-данных, без FreeIPA. `chain.js` и `gpo.js` в стенде не работают.
3. `make test-ui` — unit и integration на моках; `npm test -- --coverage` из `frontend/` добавляет покрытие.
4. `make ui-lint`, `make ui-format-check` (или `make ui-format`, чтобы исправить) и `npm run typecheck` в `frontend/`. В VS Code при сохранении `.js` в `frontend/` форматирует Prettier (`prettier.requireConfig`), поэтому файлы вне `frontend/` и бандл не затрагиваются.
5. `make ui-build` пересобирает `plugin/ui/grouppolicy/js/app.js`; `make ui-build-check` проверяет, что он актуален.
6. Коммитьте `frontend/src/` вместе с пересобранным `js/app.js`.

**Проверка на настоящем FreeIPA**

- Один раз: `sudo .devcontainer/host-setup.sh` и создание контейнера `freeipa-gpo-dev` из VS Code («Dev Containers: Reopen in Container», около 10 минут на установку FreeIPA).
- `make test-ui-ipa` (`npm run test:ipa`): поднимает контейнер, гоняет e2e в Web UI (меню, списки, открытие редактора на реальном GPO) и весь набор unit + integration внутри контейнера без пропусков.
- Изменения в `plugin/ui/grouppolicy/` в контейнере видны сразу (`dev-mounts.sh`), Python-плагины — после `ipa-dev-reload`.
- Образ контейнера должен содержать `python3-module-admix` 0.3.x, `chromium` и TTF-шрифт; `Containerfile` их ставит, `ipa-native.sh` проверяет и подсказывает команду обновления для старого образа.

**CI** (`.forgejo/workflows/python-backend.yml`, задача `frontend`): установка зависимостей и Chromium, lint, `format:check`, typecheck, `build:check`, `npm test -- --coverage`, запрет пропущенных тестов. Порог покрытия на уровне текущего значения (около 17% на обычной машине, около 19% в CI); он не даёт покрытию падать, но не является целью: покрытие считают только юнит-тесты, а UI проверяют интеграционные.

**Типовые задачи**

- *Новый модуль:* создайте файл в `frontend/src/` с `import`/`export`, подключите к `app.js` или нужному шаблону, добавьте тест рядом по образцу (`tests/unit` или `tests/integration`).
- *Новая серверная команда `gpo_editor_*`:* метод в `frontend/dev/backend.mjs` для стенда и вызов в `frontend/src/util/API.js`.
- *Новая зависимость `freeipa/<модуль>`:* ES-шим в `frontend/dev/shims/` и alias в `vite.config.mjs`; для типов — заглушка в `frontend/types/freeipa/`.
- *Подмена зависимостей в тесте:* `vi.mock` на весь файл или `loadModule(...)` из `tests/unit/helpers/load-module.js` (свежие моки и глобалы на каждый тест).

Подробности: `frontend/README.md`, `frontend/dev/README.md`.

## 7. Что не сделано и известные ограничения

- **Не закоммичено:** первая часть разбиения больших файлов (`preference/view/*`, `script/helpers.js`, пересобранный бандл, обновление `FRONTEND-DX-PLAN.md`) лежит в индексе git.
- **Prettier подключён, но форматирование ещё не закоммичено:** переформатирование затронуло 125 файлов, и его нужно оформить отдельным коммитом, а хэш занести в `.git-blame-ignore-revs`. ESLint даёт 73 предупреждения (в основном неиспользуемые переменные в тестах). `chain.js` и `gpo.js` вне `frontend/` не форматируются.
- **Типизация нестрогая** (`strict: false`), динамические члены `ElementCreator` и результатов `querySelector` описаны открытыми типами в `types/globals.d.ts`.
- **Большие функции остаются:** `renderPreferencesTemplate` (около 1220 строк), `renderScriptEventEditor` (около 1000). Их разбиение — отдельный рефакторинг; при переходе на freeipa-webui он, вероятно, потеряет смысл (см. `doc/plans/WEBUI-MIGRATION.md`).
- **`chain.js` и `gpo.js`** без ES-исходников и вне стенда; проверяются только на живом сервере.
- **CI-задачу `frontend` ни разу не запускали на сервере Forgejo:** её шаги выполнялись локально в том же образе. Образ каждый раз ставит пакеты и браузер из сети — открытая проблема описана в `doc/plans/FRONTEND-DX-PLAN.md`.
- **Тест `integration/targeting-editor` (одна проверка) на обычной машине пропускается:** ему нужен `libadmix` в Python хоста; в контейнере и CI он выполняется.
- Серверный Python-код (`plugin/ipaserver`, `ipa_gpo_install`) в ветке не менялся; добавлен лишь один тест в `tests/test_package_contract.py` (версия `admix` в документации совпадает со spec). Python-тесты в этом окружении не запускались (нет `ipalib`). Вне фронтенда менялись также `Makefile`, dev-контейнер, CI, README и man-страницы (версия `admix`), `doc/ARCHITECTURE*.md` (размеры файлов).

## 8. Ссылки

- `frontend/README.md` — команды, тесты, CI.
- `frontend/dev/README.md` — стенд без FreeIPA.
- `doc/plans/README.md` — архитектура фронтенда и как ведётся разработка.
- `doc/plans/FRONTEND-DX-PLAN.md` — план улучшений и открытые проблемы.
- `doc/plans/WEBUI-MIGRATION.md` — миграция управления GPO в freeipa-webui.
- `doc/CI.md`, `doc/ARCHITECTURE.md` — CI-конвейер и серверная архитектура.
