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

- Исходники редактора: `frontend/src/` (ES-модули, без `require` и CommonJS). **Импорты внутри `src/` и из тестов в `src/` пишутся через алиас `@gpui/` (= `frontend/src/`), без относительных `../`**; алиас настроен в `vite.config.mjs`, `vitest.config.mjs`, `.storybook/shared.mjs`, `tsconfig.json`, `scripts/read-amd.mjs` (в AMD-дереве превращается в относительный id), `tests/unit/helpers/load-module.js`. Сборка Vite даёт **закоммиченный** каталог плагина `frontend/dist/` (`chain.js`, `gpo.js`, `img/`, `js/app.js`, `js/app.css`); руками его не править, после правок `src/`, `public/` делать `make ui-build` и коммитить вместе (RPM и установщик берут файлы из `frontend/dist/`; в dev-контейнере он смонтирован в плагин, правка видна после сборки). Причина: RPM собирается без сети и без Node.
- Весь каталог плагина собирается в `frontend/`: `frontend/public/{chain.js,gpo.js,img/}` (вручную, копируются в dist как есть), `frontend/src/styles/*.css` (глобальные стили, форматируются вручную, в `.prettierignore`; Vite кладёт их в `js/app.css` после CSS Modules, `src/app.js` импортирует их последними), `url(/img/...)` в CSS — файл из `public/`. Каталога `plugin/ui/grouppolicy/` больше нет. **Не запускать Prettier на `public/` и `src/styles/`**.
- **TypeScript.** Рядом с JS можно писать `.ts`: сейчас так сделаны `src/util/{editor-dto,collection-value,targeting-tree-draft,API}.ts` (типы данных — `src/util/dto-types.d.ts`). `.ts`-файлы проверяются строго отдельным `tsc -p tsconfig.strict.json` (входит в `npm run typecheck`; ESLint `.ts` пропускает), остальной код — прежним нестрогим `tsconfig.json`. Импорты без расширения (`@gpui/util/editor-dto`), а не `.js`. В AMD-дереве тестов `.ts` превращается в `.js` через `transformWithOxc` из Vite (`scripts/read-amd.mjs`). Типы данных сервера выводятся из эталонов `tests/contracts/`.
- **Контракт с сервером.** `tests/contracts/gpo_editor/*.json` — эталонный ответ каждой команды `gpo_editor_*`: их проверяют `tests/test_gpo_editor_contract.py` (настоящие команды) и `frontend/tests/unit/gpo-editor-contract.test.js` (mock стенда и `API.js`). Новая команда без эталона роняет Python-тест. `frontend/types/rpc.d.ts` генерируется из эталонов (`npm run types:rpc`), руками не править. Сначала правят сервер, затем эталон, затем mock `dev/backend.mjs`.
- Тесты: `frontend/tests/{unit,integration,e2e}`, раннер Vitest. Integration работают с `frontend/.test-root` (каждый модуль `src` как отдельный AMD-модуль; строит `scripts/build-test-root.mjs`, CSS-модули через `postcss-modules`). Заменили файл в `src/` — `npm test` пересоберёт дерево сам.
- Тесты не должны пропускаться в CI (`scripts/assert-no-skips.mjs`). 22 теста на обычном хосте пропускаются (нужны `libadmix`, SDMX, jQuery FreeIPA, шрифты контейнера для снимков): их запускает `make test-ui-ipa` в контейнере.
- Корневой `.gitignore` игнорирует `lib/` и `dist/`; для `frontend/src/lib/` и `frontend/dist/` сделаны исключения. Новые файлы проверять `git status`.
- Манифест установщика `UI_PLUGIN_FILES` в `ipa_gpo_install/actions.py` перечисляет файлы UI (сейчас `chain.js`, `gpo.js`, `js/app.js`, `js/app.css`, img); при добавлении файлов обновлять (тест сверяет).

## Стиль новых компонентов (образец: `src/components/EditorStatus/`, `src/components/Dialog/`)

- Папка `<Name>/`: `<Name>.js` (`createX()` возвращает DOM-элемент, строится `h()` из `src/lib/dom.js`, без `innerHTML`), `<Name>.module.css` (приватные стили, camelCase), `<Name>.stories.js` (состояния + `play`-тесты).
- Снаружи компонент по классу не выбирают: публичные «крючки» — `data-*` атрибуты, перечислены в шапке файла (`[data-editor-status]`, `[data-dialog-part="body"]` и т. д.).
- Старый код использует `ElementCreator`; на границе оборачивать `ElementCreator.wrap(element)`, прежний модуль оставлять адаптером.
- **Порядок CSS важен:** `app.css` (модули) подключается **до** `main.css`/`other.css` (в `gpo.js`, тестовом дереве, стенде, Storybook), поэтому общий CSS при равной специфичности перебивает модуль.
- **Порядок внутри компонента** (как в `vanilla-ts`): состояние — локальные переменные (или объект `view`/`ui` в крупных шаблонах), единственная функция `render`, которая пишет состояние в DOM и вызывается один раз при создании, обработчики меняют состояние и вызывают `render`.
- **Source maps:** в стенде и Storybook — для скриптов (Vite) и стилей (`css.devSourcemap`: в Styles видно `File.module.css:строка`); `npm run watch` собирает dev-сборку (`--mode development`) со script-картой `app.js.map` и метками `data-source`; у стилей в dev-сборке карты нет (ограничение Vite), вместо неё перед кодом каждого исходного файла стоит комментарий `/* src/styles/shell.css */`. Закоммиченная production-сборка карт не содержит, `build:check` не пропустит оставшиеся `.map`.
- **Отладка:** в стенде (`make ui-dev`) и в Storybook каждый элемент, созданный через `h()`, получает `data-source="src/путь/Файл.js:строка"` (флаг `__GPUI_DEV__`, в сборке, тестах и Vitest его нет). `[data-source]` в DevTools показывает, где создан узел; старый `ElementCreator` атрибута не ставит.
- Классы `btn-ok`, `btn-cancel`, `close`, `button` на кнопках диалога — маркеры для кода и тестов без собственных стилей.
- Все модалки собираются через `Dialog` (`createDialogShell`); глобальных `.preference__modal*` для окон больше нет (остались `preference__modal-tabs`, `-filters`). Перед переносом общего CSS проверять, кто ещё использует те же классы.
- Вид форм предпочтения и таргетинга защищён снимками `tests/integration/dialogs-visual.browser.test.js` (только в контейнере; обновление: `UPDATE_SNAPSHOTS=1`).
- **Storybook и данные сервера.** `freeipa/rpc` в историях — `frontend/.storybook/shims/rpc.js`: он вызывает mock стенда (`dev/backend.mjs`, ответы сверены с эталонами контракта) прямо на странице. Поведение сервера задаёт `parameters: { rpc: { scenario: 'error' } }` у истории (или переключатель Scenario на панели): `normal`, `error`, `slow`, `empty`. Каждая история — ещё и проверка доступности (`@storybook/addon-a11y`, `a11y.test: 'error'`: нарушение роняет тест). `play`-тесты писать через роли и подписи, не через наши классы.
- Story-тесты проверять мутацией (сломать код → тест должен упасть).

## Документация

- Каждый документ в двух языках: `X.md` (en) и `X.ru.md` (ru), с переключателем языка в начале и совпадающей структурой заголовков. Менять оба. Проверка ссылок и пар — скриптом по `git ls-files '*.md'`.
- Числа в доках (число тестов и т. п.) устаревают: при изменении числа тестов обновлять `frontend/README*`, `doc/DEV-SETUP*`, `doc/plans/FRONTEND-DX-PLAN*`.

## Правила работы

- Коммиты и PR делает пользователь; без просьбы не коммитить и не пушить. Сообщения коммитов пользователь пишет сам.
- Не доверять числам и фактам из прошлых сообщений и доков: проверять командой (`git status`, `wc -l`, прогон тестов). Незавершённое не помечать «готово».
- Экономия контекста: вывод команд обрезать (`head`, `grep`, `tail`), большие файлы читать кусками, широкий поиск делегировать субагенту.
