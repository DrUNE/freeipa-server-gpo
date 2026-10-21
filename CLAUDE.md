# CLAUDE.md

Расширение FreeIPA для групповых политик (ALT Linux): серверные плагины на Python (`plugin/ipaserver`, `ipa_gpo_install`) и веб-редактор GPUI на JS. Полное описание: `README.ru.md`, `doc/README.ru.md`, `doc/DEV-SETUP.ru.md`.

## Окружение

- Node через **fnm**: он уже подключён через `~/.bashrc` (`BASH_ENV`), `node` и `npm` доступны сразу. **Не вызывать `eval "$(fnm env)"`**: именно эта команда печатает предупреждение в каждом выводе. Node ≥ 20.
- Dev-контейнер `freeipa-gpo-dev` (podman, настоящий FreeIPA): поднимает `bash frontend/scripts/ipa-up.sh`; в нём есть `ipalib`, `libadmix`, Chromium. Python-тесты и полный набор без пропусков идут только там (на хосте нет `ipalib`).
- Сначала `make ui-dev-install` и `npx --prefix frontend playwright install chromium`.

## Команды (из корня)

| Что | Команда |
|---|---|
| Стенд без FreeIPA | `make ui-dev` (http://127.0.0.1:8765/ipa/ui/) |
| Storybook | `make ui-storybook` (http://localhost:6006) |
| Тесты на моках (unit + integration + stories) | `make test-ui`; покрытие: `cd frontend && npm test -- --coverage` |
| Тесты на живом FreeIPA + всё без пропусков в контейнере | `make test-ui-ipa` |
| Lint / формат / типы | `make ui-lint`, `make ui-format-check`, `cd frontend && npm run typecheck` |
| Пересобрать бандл / проверить актуальность | `make ui-build`, `make ui-build-check` |
| Python-тесты | `podman exec freeipa-gpo-dev bash -c 'cd /workspaces/freeipa-server-gpo && python3 -m pytest --ignore=tests/integration -q'` |
| Перезагрузить Python-плагины в контейнере | `podman exec freeipa-gpo-dev ipa-dev-reload` |

Перед завершением работы над фронтендом: lint, `format:check`, `typecheck`, `build:check`, `npm test`; для CSS/диалогов ещё `make test-ui-ipa`.

## Фронтенд: устройство

- Исходники редактора: `frontend/src/` (ES-модули, без `require` и CommonJS). Сборка Vite даёт **закоммиченный** бандл `plugin/ui/grouppolicy/js/app.js` и `app.css`; руками их не править, после правок `src/` делать `make ui-build` и коммитить вместе. Причина: RPM собирается без сети и без Node.
- `plugin/ui/grouppolicy/{chain.js,gpo.js,css/,img/}` лежат вне `frontend/`, форматируются вручную. **Не запускать Prettier на `plugin/`** (`prettier` вызывать только в `frontend/` и только на `src dev scripts tests .storybook`).
- Тесты: `frontend/tests/{unit,integration,e2e}`, раннер Vitest. Integration работают с `frontend/.test-root` (каждый модуль `src` как отдельный AMD-модуль; строит `scripts/build-test-root.mjs`, CSS-модули через `postcss-modules`). Заменили файл в `src/` — `npm test` пересоберёт дерево сам.
- Тесты не должны пропускаться в CI (`scripts/assert-no-skips.mjs`). 22 теста на обычном хосте пропускаются (нужны `libadmix`, SDMX, jQuery FreeIPA, шрифты контейнера для снимков): их запускает `make test-ui-ipa` в контейнере.
- Корневой `.gitignore` игнорирует `lib/`; для `frontend/src/lib/` сделано исключение. Новые файлы проверять `git status`.
- Манифест установщика `UI_PLUGIN_FILES` в `ipa_gpo_install/actions.py` перечисляет файлы UI (сейчас `js/app.js`, `js/app.css`, css, img); при добавлении файлов обновлять (тест сверяет).

## Стиль новых компонентов (образец: `src/components/EditorStatus/`, `src/components/Dialog/`)

- Папка `<Name>/`: `<Name>.js` (`createX()` возвращает DOM-элемент, строится `h()` из `src/lib/dom.js`, без `innerHTML`), `<Name>.module.css` (приватные стили, camelCase), `<Name>.stories.js` (состояния + `play`-тесты).
- Снаружи компонент по классу не выбирают: публичные «крючки» — `data-*` атрибуты, перечислены в шапке файла (`[data-editor-status]`, `[data-dialog-part="body"]` и т. д.).
- Старый код использует `ElementCreator`; на границе оборачивать `ElementCreator.wrap(element)`, прежний модуль оставлять адаптером.
- **Порядок CSS важен:** `app.css` (модули) подключается **до** `main.css`/`other.css` (в `gpo.js`, тестовом дереве, стенде, Storybook), поэтому общий CSS при равной специфичности перебивает модуль.
- Классы `btn-ok`, `btn-cancel`, `close`, `button` на кнопках диалога — маркеры для кода и тестов без собственных стилей.
- Все модалки собираются через `Dialog` (`createDialogShell`); глобальных `.preference__modal*` для окон больше нет (остались `preference__modal-tabs`, `-filters`). Перед переносом общего CSS проверять, кто ещё использует те же классы.
- Вид форм предпочтения и таргетинга защищён снимками `tests/integration/dialogs-visual.browser.test.js` (только в контейнере; обновление: `UPDATE_SNAPSHOTS=1`).
- Story-тесты проверять мутацией (сломать код → тест должен упасть).

## Документация

- Каждый документ в двух языках: `X.md` (en) и `X.ru.md` (ru), с переключателем языка в начале и совпадающей структурой заголовков. Менять оба. Проверка ссылок и пар — скриптом по `git ls-files '*.md'`.
- Числа в доках (число тестов и т. п.) устаревают: при изменении числа тестов обновлять `frontend/README*`, `doc/DEV-SETUP*`, `doc/plans/FRONTEND-DX-PLAN*`.

## Правила работы

- Коммиты и PR делает пользователь; без просьбы не коммитить и не пушить. Сообщения коммитов пользователь пишет сам.
- Не доверять числам и фактам из прошлых сообщений и доков: проверять командой (`git status`, `wc -l`, прогон тестов). Незавершённое не помечать «готово».
- Экономия контекста: вывод команд обрезать (`head`, `grep`, `tail`), большие файлы читать кусками, широкий поиск делегировать субагенту.
