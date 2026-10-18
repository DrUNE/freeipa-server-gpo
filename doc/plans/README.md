# Фронтенд: архитектура, текущая разработка, планы

Сводка по состоянию на 2026-10-18. Детали и оценки лежат в планах:
[FRONTEND-DX-PLAN.md](FRONTEND-DX-PLAN.md) (улучшение опыта разработки) и
[WEBUI-MIGRATION.md](WEBUI-MIGRATION.md) (управление GPO в `freeipa-webui`).
Описание серверной части: [../ARCHITECTURE.md](../ARCHITECTURE.md), [../ARCHITECTURE.ru.md](../ARCHITECTURE.ru.md).

## 1. Архитектура фронтенда

Каталог `plugin/ui/grouppolicy/` ставится в `/usr/share/ipa/ui/js/plugins/chain` и состоит из двух слоёв.

| Слой | Файлы | Технологии |
|---|---|---|
| Страницы в Web UI FreeIPA | `chain.js` (1193 строки), `gpo.js` (395) | AMD, jQuery-фасеты `IPA.facet`, `reg`, `phases`; зависят от модулей `freeipa/*` |
| Редактор GPUI | `js/` (около 20 тыс. строк), `css/` (около 2,4 тыс. строк) | Vanilla JS (ES2015+ внутри AMD-обёрток), самописный `ElementCreator`, EN/RU-локали |

Редактор открывается из `gpo.js` в модальном окне и разбит на header, tree-view, workspace, footer и шаблоны:
ADMX, Preferences (22 layout'а, targeting editor), Scripts, Security, Advanced Audit, All Policies.
Он общается с сервером только типизированным JSON-RPC `gpo_editor_*` через `util/API.js` (~29 методов);
`libadmix` работает на сервере, пути SYSVOL браузеру не передаются.

**Выводы:**
- Структура приемлема: компоненты разнесены по файлам, а часть шаблонов (`security/`, `all-policies/`) уже разделена на model, dialog и view.
- Слабые места: крупные файлы (`preferences-view-template.js` 2111 строк, `script-template.js` 1449, `chain.js` 1193, `main.css` 2430);
  императивный рендер с ручной защитой от гонок (`renderRequestId`, `currentViewCleanup`); состояние в замыканиях.
- Граница с бэкендом чистая, но формат ответов нигде не описан схемой: он выведен вручную (`editor-dto.js`).
- AMD-файлы выглядят как вывод конвертера из ESM (`var {x} = __dep0`), а ESM-исходников в репозитории нет.

## 2. Как ведётся разработка сейчас

| Что | Как |
|---|---|
| Запуск редактора без FreeIPA | `make ui-dev-install`, затем `make ui-dev` (`tools/ui-dev`: mock-бэкенд, шимы `freeipa/ipa` и `freeipa/rpc`, `requirejs`). Сборки нет, обновление страницы вручную |
| Проверка на живом FreeIPA | devcontainer `.devcontainer/` (podman), перезагрузка плагинов `ipa-dev-reload`, живой тест меню `tests/ui/freeipa-plugin-menu.live.test.js` |
| UI-тесты | `make test-ui`: 39 файлов в `tests/ui/` на `node:test` и Playwright; без Chromium браузерные тесты пропускаются |
| Бэкенд-тесты | `make test-python`, `make test-coverage` (порог 93,90%), `make test-integration` |
| Линтер, форматтер, типы для JS | отсутствуют (для Python есть `ruff` и `pylint`) |
| CI | `python-backend.yml`: сборка RPM, pytest, интеграция во FreeIPA, публикация. **UI-тесты в CI не запускаются** |
| Ограничение стенда | `chain.js` и `gpo.js` в `tools/ui-dev` не работают (нужны модули FreeIPA), проверяются только на живом сервере |

Подробности стенда: [../../tools/ui-dev/README.md](../../tools/ui-dev/README.md), CI: [../CI.md](../CI.md).

## 3. Планы

**Улучшение опыта разработки** ([FRONTEND-DX-PLAN.md](FRONTEND-DX-PLAN.md)), 16-26 рабочих дней на этапы 1-6:
1. гигиена: корневой `package.json`, ESLint + Prettier, `.editorconfig`;
2. UI-тесты в CI;
3. типы через JSDoc и `tsc --noEmit`, общие JSON-примеры RPC-ответов для pytest и JS;
4. ESM-исходники и сборка в AMD (собранный результат коммитится);
5. Vite-стенд с HMR, шимы для `chain.js` и `gpo.js`;
6. разбиение крупных файлов, CSS-переменные, скриншотные тесты;
7. пилот на выбор фреймворка по измерениям.

**Миграция UI в freeipa-webui** ([WEBUI-MIGRATION.md](WEBUI-MIGRATION.md)): три страницы (GPO, Chain, GPMaster) на React + PatternFly,
редактор GPUI подключается как есть. Оценка 36-50 дней на MVP; переписывание самого редактора на React ещё 3-5 месяцев и
принимается только по итогам пилота.

## 4. Порядок и зависимости

1. Этапы 1-2 DX-плана безопасны и дают пользу сразу.
2. Этап 4 (ESM-сборка) нужен и для разработки, и для встраивания редактора в webui.
3. Прототип страницы GPO в `freeipa-webui` уточнит остальные оценки миграции.
4. Решение о переписывании редактора откладывается до этапа 7 DX-плана.
