# Опыт разработки: что изменилось в ветке `dev-setup`

[English](./DEV-SETUP.md) | **Русский**

Документ описывает, в каком состоянии был проект в точке ответвления ветки, что в ней изменилось, почему и как теперь работать с проектом — и бэкендеру, и фронтендеру, в VS Code или в vim.
Состояние на 2026-10-18. Точка ответвления — коммит `dfc4816` (merge PR #17 в `master`, 2026-10-09); в ветке 18 коммитов (все — Andrey Litvinov, 15–19 октября).

## 1. Кратко

Главное изменение — не фронтенд-инструменты сами по себе, а то, что у проекта появилась **воспроизводимая среда разработки с настоящим FreeIPA** (podman dev-контейнер). Она полезна всем:

| Роль | Было | Стало |
|---|---|---|
| Бэкендер (Python-плагины, установщик) | Python-тесты на моках; проверить плагин вживую можно было только на самостоятельно развёрнутом FreeIPA; полный набор pytest локально не запускался (нужны `ipalib` и другие пакеты FreeIPA) | контейнер с настоящим FreeIPA (ALT Sisyphus, как в CI); правки Python-плагинов подхватываются командой `ipa-dev-reload`; в контейнере проходят все 863 Python-теста |
| Фронтендер (редактор GPUI) | 69 AMD-модулей правились прямо в `plugin/ui/grouppolicy/js/` (до переноса в `frontend/`); проверить можно было только на установленном FreeIPA | ES-модули в `frontend/src/`, стенд без FreeIPA (`make ui-dev`), линтер, форматтер, типы, 338 тестов, сборка в один бандл |
| Тестировщик, ревьюер | JS-тесты без цели в Makefile, без CI, с ручным `NODE_PATH` | `make test-ui` и `make test-ui-ipa`; задача CI `frontend` |
| Новый участник | собрать окружение самостоятельно | `host-setup.sh` один раз и «Reopen in Container» (или `podman`-команды для vim); учётные данные и адреса заданы |
| CI | сборка RPM, интеграция во FreeIPA, публикация | то же + задача `frontend` (lint, format, typecheck, проверка бандла, тесты с покрытием, запрет пропусков) |

## 2. Что было в начале ветки

- **Редактор GPO (GPUI)** — vanilla JS, около 17,2 тыс. строк (71 файл вместе с `chain.js` и `gpo.js`), AMD для RequireJS FreeIPA. ES-исходников не было: обёртки `define([...])` и списки зависимостей поддерживались вручную.
- **Страницы Chains и GPO** (`chain.js`, `gpo.js`) — jQuery-фасеты FreeIPA, тоже AMD.
- **JS-тесты:** 38 файлов в `tests/ui/` (юнит-тесты через `vm` с подменой `define` и браузерные на Playwright). Цели `make test-ui` не было, в CI они не запускались, нужен был `NODE_PATH` на `playwright` и `requirejs`; без Chromium браузерные тесты молча пропускались.
- **Среды с настоящим FreeIPA в репозитории не было.** Интеграционные тесты (`tests/integration`) гонялись в CI в минимальном домене (`doc/CI.ru.md`); локально сервер приходилось разворачивать самостоятельно.
- **Автономного стенда редактора не было.**
- **Линтера, форматтера и проверки типов для JS не было.** Для Python — `ruff`, `pylint`, pytest с порогом покрытия (не менялись).
- **CI** (`python-backend.yml`): сборка RPM, интеграция во FreeIPA, публикация; про JS — ничего.

## 3. Что произошло в ветке

| Дата (2026) | Коммит | Содержание |
|---|---|---|
| 10-15 | `5569b1c` | mock dev-сервер для редактора (`tools/ui-dev`) |
| 10-16 | `66367f8`, `78fcd3f` | **podman dev-контейнер** с живым FreeIPA, конфиг VS Code |
| 10-16 | `6942226` | живой тест: плагин подключён к FreeIPA |
| 10-17 | `9d9a1ec` | анализ редактора и план интеграции в freeipa-webui |
| 10-18 | `bf2c061`, `d4c0f5b`, `eec3c8a`, `4f4afef` | перестройка документации; планы разделены на `FRONTEND-DX-PLAN` и `WEBUI-MIGRATION`; корневой индекс планов |
| 10-18 | `9e0516a` | отдельный проект `frontend/`: ESM-исходники, сборка в один бандл, Vite-стенд |
| 10-18 | `04f20e1` | ESLint, CI-задача (в сообщении упомянут Prettier; в самом коммите его не было, подключён позже) |
| 10-18 | `423a18a` | все JS-тесты перенесены в `frontend/tests/`, разбиты на unit / integration / e2e |
| 10-18 | `e3f626f` | тесты переведены на Vitest, юнит-тесты на настоящие `import`, покрытие |
| 10-18 | `647eb28` | в dev-контейнере проходят все тесты (Chromium, `admix` 0.3.x) |
| 10-18 | `ba9f2e0` | первая часть разбиения больших файлов (вынесены функции без замыканий) |
| 10-18 | `4124b62` | Prettier: переформатирование `frontend/`, исправление манифеста установщика `UI_PLUGIN_FILES` и сопутствующие правки |
| 10-18 | `5b117e1` | обновление документации |

Документы анализа (`ARCHITECTURE.md`, `INTEGRATION-PLAN.md`, `GPO-EDITOR-ANALYSIS.md`) содержали ошибки (размеры файлов в байтах вместо строк, выдуманная связь с `admix`, неверная версия `admix` в README и man-страницах, неточные оценки). Они исправлены, корневой `ARCHITECTURE.md` удалён как дубль `doc/ARCHITECTURE*.md`, два плана объединены в `doc/plans/WEBUI-MIGRATION.ru.md`.

## 4. Dev-контейнер

Контейнер `freeipa-gpo-dev` (`.devcontainer/`): ALT Sisyphus с systemd как PID 1 и **настоящим FreeIPA** — 389-DS, KDC, Apache, oddjob, Samba для SYSVOL — домен `ipa.test`, сервер `server.ipa.test`. Исходники репозитория подключены поверх установленных копий, так что плагин работает прямо из вашей рабочей копии.

### Что в нём хорошего

- **Реальное окружение вместо моков.** Плагины, схема LDAP, oddjob-обработчики и Web UI выполняются так, как на проде; ошибки интеграции видны сразу, а не в CI.
- **Живые исходники.** `frontend/dist/` (собранный каталог плагина), три Python-плагина (`gpo.py`, `chain.py`, `gpmaster.py`) и пакет `ipa_gpo_install` смонтированы поверх установленных (`dev-mounts.sh`). Не нужно пересобирать RPM и переустанавливать. UI-кэш Apache для плагина отключён: правка видна после перезагрузки страницы.
- **Быстрая перезагрузка Python.** `ipa-dev-reload` очищает `__pycache__`, сбрасывает кэш схемы команд `ipa` и перезапускает Apache (около 4 секунд).
- **Готов к работе сразу.** Администратор получает билет Kerberos при старте, CLI `ipa` работает (`ipa gpo-add …`), пароли и адреса фиксированы (`devcontainer.json`), CA-сертификат выгружается в `.devcontainer/.state/ipa-ca.crt` для браузера.
- **Единый набор тестов с CI.** В образе есть всё для Python-тестов (`ipalib`, pytest, coverage, `ldap`, `dbus`), для фронтенд-тестов (Node, Chromium, шрифт, `libadmix`, каталог SDMX, jQuery FreeIPA) и для e2e. В контейнере выполняются все 863 Python-теста (около 6 секунд) и все 338 тестов фронтенда без пропусков.
- **Одноразовая и изолированная.** FreeIPA живёт внутри контейнера и не загрязняет хост; сломанное состояние — `podman rm` и заново.
- **Идемпотентный старт.** `setup-ipa.sh` при первом запуске ставит FreeIPA (около 10 минут), затем при каждом старте лишь заново подключает исходники и обновляет билет.
- **Стабильные имена и сеть:** выделенная сеть `ipa-gpo-dev` (10.89.77.0/24, сервер 10.89.77.10), Web UI на `https://server.ipa.test/` через порт 443 хоста.

### Цена и ограничения

- Один раз нужна подготовка хоста с sudo (`.devcontainer/host-setup.sh`): диапазоны subuid/subgid для rootless podman, порты от 443 без root, запись `server.ipa.test` в `/etc/hosts`.
- Контейнер привилегированный, нужен podman с systemd; первый старт — около 10 минут.
- Образ собирается из репозитория пакетов на момент сборки и может устареть: так, в образе обнаружился `admix` 0.1.1 при требуемом 0.3.x. `frontend/scripts/ipa-native.sh` проверяет версию и подсказывает команду обновления; `Containerfile` теперь ставит `chromium` и шрифт, а `devcontainer.json` — `--shm-size=2g` и `--pids-limit=-1` (без них Chromium падает).
- Для редактора в контейнере в `devcontainer.json` перечислены расширения Python, ruff, shellcheck, YAML, gettext, ESLint и Prettier.

### Как поднять

Один раз на машине:

```bash
sudo .devcontainer/host-setup.sh
```

**VS Code.** Установите «Dev Containers» (есть в рекомендациях `.vscode/extensions.json`) и выполните «Dev Containers: Reopen in Container». Первый запуск ставит FreeIPA; потом контейнер стартует за минуты, а `postStartCommand` (`setup-ipa.sh`) приводит его в рабочее состояние.

**vim (и любой редактор без Dev Containers).** Правьте файлы на хосте — рабочая копия смонтирована в контейнер (`/workspaces/freeipa-server-gpo`), поэтому правки видны внутри сразу. Контейнер запускается скриптом:

```bash
bash frontend/scripts/ipa-up.sh        # стартует контейнер, подключает исходники, перезапускает Apache
podman exec -it freeipa-gpo-dev bash   # оболочка внутри (там есть только vi; vim используйте на хосте)
```

Создать контейнер впервые без VS Code можно через Dev Containers CLI (`npx @devcontainers/cli up --workspace-folder . --docker-path podman`; не проверялось) или повторив параметры `devcontainer.json` вручную командами `podman build`/`podman run` (имя `freeipa-gpo-dev`, сеть `ipa-gpo-dev`, IP 10.89.77.10, `--privileged --systemd=always`, `--hosts-file=image`, `--shm-size=2g --pids-limit=-1`, порт `127.0.0.1:443:443`, монтирование репозитория в `/workspaces/freeipa-server-gpo`).

Браузер: `https://server.ipa.test/ipa/ui/`, логин `admin`, пароль из `devcontainer.json` (`IPA_ADMIN_PASSWORD`); для доверия сертификату импортируйте `.devcontainer/.state/ipa-ca.crt`.

## 5. Как работать

Node берётся через fnm (`eval "$(fnm env)"` или `fnm use`), версия ≥ 20 (`frontend/.node-version`: 24).

### Бэкендер (Python)

В **VS Code** внутри контейнера интерпретатор — системный `/usr/bin/python3` с `ipalib` и `ipaserver`, поэтому подсказки и переходы по определениям работают для пакетов FreeIPA; pytest, ruff, форматирование и организация импортов настроены в `.vscode/settings.json` и `devcontainer.json`.

В **vim** правьте на хосте, а запускайте через `podman exec`. Цикл:

```bash
# правка plugin/ipaserver/plugins/*.py или ipa_gpo_install/*.py на хосте
podman exec freeipa-gpo-dev ipa-dev-reload                      # подхватить Python-плагины
podman exec freeipa-gpo-dev bash -c 'kinit admin <<< "$IPA_ADMIN_PASSWORD"; ipa gpo-find'   # проверить командой ipa
podman exec freeipa-gpo-dev bash -c 'cd /workspaces/freeipa-server-gpo && python3 -m pytest --ignore=tests/integration'
podman exec freeipa-gpo-dev bash -c 'cd /workspaces/freeipa-server-gpo && make test-coverage'
```

Те же команды работают из терминала VS Code внутри контейнера, без `podman exec`. `make test-coverage` в контейнере проходит (94,5% при пороге 93,9%). Целевая `make test-integration` (тесты с 389-DS) существует, но не проверялась.

### Фронтендер (редактор GPUI)

Два варианта, их можно сочетать.

1. **На хосте, без FreeIPA** (быстрее всего): правка `frontend/src/` → `make ui-dev` (`http://127.0.0.1:8765/ipa/ui/`, `?gpo=Имя&lang=ru`, перезагрузка при сохранении, mock-бэкенд) → `make test-ui`.
2. **На настоящем FreeIPA:** правка → `make ui-build` (пересобирает `frontend/dist/`) → перезагрузить `https://server.ipa.test/ipa/ui/` (бандл смонтирован в контейнер). Для `chain.js` и `gpo.js` это единственный способ проверки: в стенде они не работают.

Стенд Vite в контейнере не доступен с хоста (порты не пробрасываются); для работы в VS Code внутри контейнера пробросьте порт 8765 вручную («Forward a Port») или запускайте стенд на хосте. `node_modules` общий для хоста и контейнера (один и тот же каталог): оба на ALT с одной версией glibc, конфликтов нет.

Ежедневный цикл (из корня репозитория):

1. Правьте `frontend/src/` (`frontend/dist/` руками не меняйте — это сгенерированный каталог плагина).
2. `make ui-dev` — стенд; `make test-ui` — unit и integration на моках (`npm test -- --coverage` из `frontend/` добавляет покрытие).
3. `make ui-lint`, `make ui-format-check` (или `make ui-format`, чтобы исправить), `npm run typecheck` в `frontend/`. В VS Code при сохранении `.js` в `frontend/` форматирует Prettier (`prettier.requireConfig` не трогает файлы вне `frontend/`); в vim — `make ui-format`.
4. `make ui-build`, затем `make ui-build-check` (бандл актуален).
5. Коммитьте `frontend/src/` вместе с пересобранным `js/app.js`.

Первый раз: `make ui-dev-install`; `npx --prefix frontend playwright install chromium`.

### Проверка всего вместе

- `make test-ui-ipa` (`npm run test:ipa`): поднимает контейнер, гоняет e2e в настоящем Web UI (меню, списки, открытие редактора на реальном GPO) и весь набор unit + integration внутри контейнера без пропусков.
- **CI** (`.forgejo/workflows/python-backend.yml`, задача `frontend`): зависимости и Chromium, lint, `format:check`, typecheck, `build:check`, `npm test -- --coverage`, запрет пропущенных тестов. Порог покрытия на уровне текущего значения (около 17% на обычной машине, около 19% в CI): он не даёт покрытию падать, но не является целью, потому что покрытие считают только юнит-тесты, а UI проверяют интеграционные.

### Типовые задачи

- *Новый модуль:* создайте файл в `frontend/src/` с `import`/`export`, подключите к `app.js` или шаблону, добавьте тест рядом по образцу.
- *Новая серверная команда `gpo_editor_*`:* Python в `plugin/ipaserver/plugins/gpo.py`, метод в `frontend/dev/backend.mjs` для стенда, вызов в `frontend/src/util/API.js`.
- *Новая зависимость `freeipa/<модуль>`:* ES-шим в `frontend/dev/shims/` и alias в `vite.config.mjs`; заглушка типов в `frontend/types/freeipa/`.
- *Подмена зависимостей в тесте:* `vi.mock` на весь файл или `loadModule(...)` из `tests/unit/helpers/load-module.js`.
- *Новый или удалённый файл UI* (css, img, `chain.js`): обновить манифест `UI_PLUGIN_FILES` в `ipa_gpo_install/actions.py` (его сверяет тест).

## 6. Структура фронтенда

```
frontend/
  src/                ES-модули редактора (import/export)        <- править здесь
  dev/                стенд: mock-бэкенд, ES-шимы freeipa/*, index.html
  tests/unit/         юнит-тесты (читают src/, зависимости подменены)
  tests/integration/  Chromium + настоящий DOM, RPC на моках
  tests/e2e/          живой FreeIPA в dev-контейнере
  scripts/            сборка тестового корня, проверка бандла, запуск в контейнере
  types/              заглушки типов freeipa/* и открытые типы редактора
frontend/public/    chain.js, gpo.js (страницы FreeIPA, AMD, пишутся вручную) и img/ — копируются в dist как есть
frontend/src/styles/  глобальные стили main.css, other.css, icons.css (попадают в js/app.css)
frontend/dist/      СГЕНЕРИРОВАНО (Vite), коммитится, ставится RPM: chain.js, gpo.js, img/, js/app.js, js/app.css
```

Все файлы в `frontend/` — ES-модули (`import`/`export`), CommonJS и `.cjs` не используются. Бандл — UMD: под RequireJS FreeIPA он регистрируется как AMD-модуль и зависит от `freeipa/ipa` и `freeipa/rpc`; `gpo.js` и `chain.js` берут `translations` и `editorDialog` из `js/app`.

## 7. Почему так

- **Контейнер с настоящим FreeIPA.** Плагины сильно завязаны на FreeIPA (LDAP-схема, oddjob, SYSVOL), моки не доказывают, что они работают. Контейнер даёт одинаковую среду всем и повторяет окружение CI.
- **Живые исходники вместо переустановки.** Цикл «правка → проверка» занимает секунды, а не минуты сборки и установки RPM.
- **ESM вместо ручного AMD.** Ручные обёртки блокировали навигацию в IDE, рефакторинг и npm-пакеты. Автоматический перевод 69 файлов не изменил поведение.
- **Один закоммиченный бандл.** Пакет RPM собирается в hasher без сети и без Node, поэтому результат сборки лежит в git, а `build:check` в CI проверяет его актуальность.
- **Vite.** Один инструмент для стенда, сборки и тестов (Vitest использует тот же конфиг).
- **Тесты внутри `frontend/`, два сценария:** `npm test` (на моках, без FreeIPA) и `npm run test:ipa` (с живым сервером).
- **Тесты в контейнере без пропусков.** 20 тестов сверяют UI с настоящими серверными компонентами (`libadmix`, каталог SDMX, jQuery FreeIPA) и на обычной машине пропускались. Теперь они выполняются в контейнере, а CI-задача падает при любом пропуске.
- **Проверка типов без смены языка:** JSDoc и `tsc --noEmit` ловят расхождения аннотаций, не требуя переписывать код на TypeScript.
- **Планы.** Анализ нужен, чтобы решить, переписывать ли редактор на React/PatternFly при переходе на freeipa-webui; решение отложено до пилота (`doc/plans/`).

## 8. Найденное по пути и ограничения

**Найденная и исправленная регрессия.** Установщик `ipa-gpo-install` проверяет наличие каждого файла UI по списку `UI_PLUGIN_FILES` в `ipa_gpo_install/actions.py`; в нём остались 69 путей прежних модулей `js/…`, которых после перехода на один бандл нет. Установщик сообщал бы об отсутствующих файлах UI, а тест `test_ui_plugin_manifest_matches_all_runtime_source_assets` падал бы в `%check` сборки RPM. Это не замечалось, потому что Python-тесты не запускались на хосте (нет `ipalib`); в dev-контейнере они сразу выявили проблему. Манифест исправлен (вместо 69 путей `js/app.js`), тест иконок теперь требует `js/app.js`; в контейнере проходят все 863 Python-теста.

**Blame.** Форматирование Prettier вошло в коммит `4124b62`; его хэш занесён в `.git-blame-ignore-revs` (включить один раз: `git config blame.ignoreRevsFile .git-blame-ignore-revs`), поэтому `git blame` с этой настройкой его пропускает.

**Ограничения:**

- ESLint даёт 73 предупреждения (в основном неиспользуемые переменные в тестах); типизация нестрогая (`strict: false`), динамические члены описаны открытыми типами в `types/globals.d.ts`.
- Большие функции `renderPreferencesTemplate` (около 1360 строк) и `renderScriptEventEditor` (около 1570, после форматирования Prettier) не разбиты — отдельный рефакторинг, который при переходе на freeipa-webui, вероятно, потеряет смысл (`doc/plans/WEBUI-MIGRATION.ru.md`).
- `chain.js` и `gpo.js` без ES-исходников и вне стенда, проверяются только на живом сервере; `chain.js`, `gpo.js` не форматируются Prettier.
- CI-задачу `frontend` ни разу не запускали на сервере Forgejo: шаги выполнялись локально в том же образе. Образ каждый раз ставит пакеты и браузер из сети — открытая проблема в `doc/plans/FRONTEND-DX-PLAN.ru.md`.
- Один тест (`integration/targeting-editor`, проверка живых дескрипторов) на обычной машине пропускается: нужен `libadmix` в Python хоста; в контейнере и CI он выполняется.
- Вне фронтенда менялись также `Makefile`, dev-контейнер и CI, README и man-страницы (версия `admix`), `doc/ARCHITECTURE*.md` (размеры файлов), манифест установщика.

## 9. Ссылки

Документация:

- [README.ru.md](../README.ru.md) — обзор проекта, установка, команды (английская версия: [README.md](../README.md)).
- [doc/README.ru.md](./README.ru.md) — оглавление всех документов.
- [ARCHITECTURE.ru.md](./ARCHITECTURE.ru.md) — архитектура серверной части; [CI.ru.md](./CI.ru.md) — конвейер CI.
- [frontend/README.ru.md](../frontend/README.ru.md) — команды фронтенда, тесты, CI; [frontend/dev/README.ru.md](../frontend/dev/README.ru.md) — стенд без FreeIPA.
- [plans/README.ru.md](./plans/README.ru.md) — архитектура фронтенда и текущая разработка; [plans/FRONTEND-DX-PLAN.ru.md](./plans/FRONTEND-DX-PLAN.ru.md) — план улучшений и открытые проблемы; [plans/WEBUI-MIGRATION.ru.md](./plans/WEBUI-MIGRATION.ru.md) — миграция в freeipa-webui.

Файлы dev-контейнера (`.devcontainer/`):

- [devcontainer.json](../.devcontainer/devcontainer.json) — параметры контейнера, расширения VS Code, монтирования.
- [Containerfile](../.devcontainer/Containerfile) — образ (FreeIPA, Node, Chromium, шрифты).
- [host-setup.sh](../.devcontainer/host-setup.sh) — разовая подготовка хоста (нужен sudo).
- [scripts/setup-ipa.sh](../.devcontainer/scripts/setup-ipa.sh) — ставит FreeIPA при первом запуске и приводит контейнер в рабочее состояние.
- [scripts/dev-mounts.sh](../.devcontainer/scripts/dev-mounts.sh) — монтирует рабочую копию поверх установленных плагинов и отключает кэш UI.
- [scripts/ipa-dev-reload](../.devcontainer/scripts/ipa-dev-reload) — перезагружает Python-плагины.
- [frontend/scripts/ipa-up.sh](../frontend/scripts/ipa-up.sh) и [frontend/scripts/ipa-native.sh](../frontend/scripts/ipa-native.sh) — запускают контейнер и тесты внутри него.
- [.vscode/settings.json](../.vscode/settings.json) и [.vscode/extensions.json](../.vscode/extensions.json) — настройки редактора и рекомендуемые расширения.

Английская версия этого документа: [DEV-SETUP.md](./DEV-SETUP.md).
