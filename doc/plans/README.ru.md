# Фронтенд: архитектура, текущая разработка, планы

[English](./README.md) | **Русский**

Сводка по состоянию на 2026-10-21. Детали и оценки лежат в планах:
[FRONTEND-DX-PLAN.ru.md](FRONTEND-DX-PLAN.ru.md) (улучшение опыта разработки),
[WEBUI-MIGRATION.ru.md](WEBUI-MIGRATION.ru.md) (управление GPO в `freeipa-webui`) и
[COMPONENTS-PLAN.ru.md](COMPONENTS-PLAN.ru.md) (компоненты и Storybook); что хост предоставляет редактору-острову: [WEBUI-ISLAND.ru.md](WEBUI-ISLAND.ru.md).
Описание серверной части: [../ARCHITECTURE.ru.md](../ARCHITECTURE.ru.md) ([English](../ARCHITECTURE.md)).
Что изменилось в ветке `dev-setup` и как теперь работать: [../DEV-SETUP.ru.md](../DEV-SETUP.ru.md).

## 1. Архитектура фронтенда

Каталог `frontend/dist/` (закоммиченная сборка `frontend/`) ставится в `/usr/share/ipa/ui/js/plugins/chain` и состоит из двух слоёв.

| Слой | Файлы | Технологии |
|---|---|---|
| Страницы в Web UI FreeIPA | `frontend/public/chain.js` (1194 строки), `gpo.js` (394) | AMD, jQuery-фасеты `IPA.facet`, `reg`, `phases`; зависят от модулей `freeipa/*`; действия покрыты юнит-тестами с подменами |
| Редактор GPUI | исходники `frontend/src/` (≈19,9 тыс. строк без локалей), сборка `js/app.js`; стили `frontend/src/styles/` и CSS Modules, собираются в `js/app.css` | ES-модули (4 на TypeScript), один UMD/AMD-бандл (Vite), `h()` из `src/lib/dom.js` для новых компонентов и прежний `ElementCreator`, EN/RU-локали |

Редактор открывается из `gpo.js` в модальном окне и разбит на header, tree-view, workspace, footer и шаблоны:
ADMX, Preferences (22 layout'а, targeting editor), Scripts, Security, Advanced Audit, All Policies.
Он общается с сервером только типизированным JSON-RPC `gpo_editor_*` через `util/API.ts` (28 команд);
`libadmix` работает на сервере, пути SYSVOL браузеру не передаются.

**Выводы:**
- Крупные шаблоны разбиты на модули по областям (`preference/view/*`, `script/*`, `security/*`, `admx/*`, `advanced-audit/*`);
  состояние больших экранов — один объект (`view`, `ui`). Больше 600 строк остаются `targeting-operand-editor.js` 740 и
  `targeting-editor.js` 674 (круговые вызовы между их функциями, см. DX-план) и `chain.js` 1194.
- Граница с бэкендом закреплена: эталонный ответ каждой команды (`tests/contracts/gpo_editor/`), сверяемый с обеих сторон, и
  сгенерированные из них типы `frontend/types/rpc.d.ts`.
- ≈5,3 тыс. строк (≈27%) не трогают DOM; именно эта часть переходит в `freeipa-webui` без изменений.
- Два компонента в целевом формате (`Dialog`, `EditorStatus`); `ElementCreator` используется в 49 файлах.

## 2. Как ведётся разработка сейчас

| Что | Как |
|---|---|
| Запуск редактора без FreeIPA | `make ui-dev-install`, затем `make ui-dev`: Vite-стенд (`frontend/dev`: mock-бэкенд с режимами `?scenario=error\|slow\|empty`, ES-шимы `freeipa/*`), горячее обновление без перезагрузки страницы |
| Компоненты отдельно | `make ui-storybook` (Storybook 10, каждая история — тест) |
| Проверка на живом FreeIPA | devcontainer `.devcontainer/` (podman), перезагрузка плагинов `ipa-dev-reload`, e2e-тесты `frontend/tests/e2e/`, `npm run watch` для dev-сборки с source maps |
| UI-тесты | `make test-ui` (unit, integration, stories, моки) и `make test-ui-ipa` (плюс e2e и всё без пропусков, в контейнере) |
| Бэкенд-тесты | `make test-python`, `make test-coverage` (порог 93,90%), `make test-integration` |
| Линтер, форматтер, типы для JS | ESLint (`make ui-lint`), Prettier (`make ui-format-check`), `npm run typecheck` (проверка JS по JSDoc и строгая проверка TypeScript), покрытие юнит-тестами с порогом |
| CI | `python-backend.yml`: сборка RPM, pytest, интеграция во FreeIPA, публикация. Задача `frontend`: lint, форматирование, типы, проверка бандла, тесты с покрытием, запрет пропущенных тестов (на сервере Forgejo ещё не запускалась) |

Подробности стенда: [../../frontend/dev/README.ru.md](../../frontend/dev/README.ru.md), CI: [../CI.ru.md](../CI.ru.md).

## 3. Планы

**Улучшение опыта разработки** ([FRONTEND-DX-PLAN.ru.md](FRONTEND-DX-PLAN.ru.md)); статус:
1. ✅ гигиена: проект `frontend/`, ESLint, Prettier, `.editorconfig`;
2. ✅ UI-тесты в CI (задача `frontend`; на сервере Forgejo ещё не запускалась);
3. ✅ типы и контракт: эталонные ответы всех команд, сгенерированные типы RPC, TypeScript для `util/`;
4. ✅ ESM-исходники, сборка Vite (коммитится), `make ui-build-check`;
5. ✅ dev-цикл: стенд со сценариями, горячее обновление, тесты для `chain.js`/`gpo.js`;
6. ✅ частично: крупные файлы разбиты, CSS-токены и листы по областям, два компонента, снимки формы предпочтения и таргетинга;
   продолжается в [COMPONENTS-PLAN.ru.md](COMPONENTS-PLAN.ru.md);
7. решение о фреймворке — принято как стратегия [WEBUI-MIGRATION.ru.md](WEBUI-MIGRATION.ru.md): React + PatternFly в `freeipa-webui`,
   редактор сначала встраивается как есть, затем заменяется экран за экраном после пилота.

**Миграция UI в freeipa-webui** ([WEBUI-MIGRATION.ru.md](WEBUI-MIGRATION.ru.md)): этап 0 здесь (код без DOM в
`frontend/src/core/`, выход сборки в виде ES-модуля), затем три страницы (GPO, Chain, GPMaster) и редактор «островом» в webui.
36-50 дней на MVP; замена экранов редактора необязательна, ещё 40-70 дней, решается после пилотного экрана.

**Компоненты и Storybook** ([COMPONENTS-PLAN.ru.md](COMPONENTS-PLAN.ru.md)): девять компонентов по образцу PatternFly, истории с
данными из эталонных ответов и `play`-тестами по ролям, которые без изменений переходят на React. 22-29 дней.

## 4. Порядок и зависимости

1. Этапы 1-5 DX-плана выполнены; этап 6 продолжается планом компонентов.
2. Этап 0 миграции и шаги 1-3 плана компонентов можно вести параллельно, webui для них не нужен.
3. Прототип страницы GPO и «острова» редактора в `freeipa-webui` уточнит оценки миграции.
4. Решение о замене экранов редактора принимается после пилотного экрана («Расширенный аудит»), этап 4 миграции.
