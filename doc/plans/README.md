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
| Редактор GPUI | исходники `frontend/src/` (около 20 тыс. строк), сборка `js/app.js`, `css/` (около 2,4 тыс. строк) | Vanilla JS, ES-модули, один UMD/AMD-бандл (Vite), самописный `ElementCreator`, EN/RU-локали |

Редактор открывается из `gpo.js` в модальном окне и разбит на header, tree-view, workspace, footer и шаблоны:
ADMX, Preferences (22 layout'а, targeting editor), Scripts, Security, Advanced Audit, All Policies.
Он общается с сервером только типизированным JSON-RPC `gpo_editor_*` через `util/API.js` (~29 методов);
`libadmix` работает на сервере, пути SYSVOL браузеру не передаются.

**Выводы:**
- Структура приемлема: компоненты разнесены по файлам, а часть шаблонов (`security/`, `all-policies/`) уже разделена на model, dialog и view.
- Слабые места: крупные файлы (`preferences-view-template.js` 2111 строк, `script-template.js` 1449, `chain.js` 1193, `main.css` 2430);
  императивный рендер с ручной защитой от гонок (`renderRequestId`, `currentViewCleanup`); состояние в замыканиях.
- Граница с бэкендом чистая, но формат ответов нигде не описан схемой: он выведен вручную (`editor-dto.js`).
- Исходники редактора теперь ES-модули в `frontend/src/`; в `plugin/ui/grouppolicy/js/` лежит один собранный бандл `app.js` (коммитится).

## 2. Как ведётся разработка сейчас

| Что | Как |
|---|---|
| Запуск редактора без FreeIPA | `make ui-dev-install`, затем `make ui-dev`: Vite-стенд (`frontend/dev`: mock-бэкенд, ES-шимы `freeipa/*`), перезагрузка при сохранении |
| Проверка на живом FreeIPA | devcontainer `.devcontainer/` (podman), перезагрузка плагинов `ipa-dev-reload`, живой тест меню `tests/ui/freeipa-plugin-menu.live.test.js` |
| UI-тесты | `make test-ui` (`frontend/tests/unit` и `integration`, моки) и `make test-ui-ipa` (`frontend/tests/e2e`, живой FreeIPA в контейнере); без Chromium браузерные тесты пропускаются |
| Бэкенд-тесты | `make test-python`, `make test-coverage` (порог 93,90%), `make test-integration` |
| Линтер, форматтер, типы для JS | ESLint (`make ui-lint`), Prettier (`make ui-format-check`), `tsc --noEmit` по JSDoc (`npm run typecheck`), покрытие юнит-тестами с порогом (`npm test -- --coverage`) |
| CI | `python-backend.yml`: сборка RPM, pytest, интеграция во FreeIPA, публикация. job `frontend`: lint, проверка бандла, UI-тесты |
| Ограничение стенда | `chain.js` и `gpo.js` в `frontend/dev` не работают (нужны модули FreeIPA), проверяются только на живом сервере |

Подробности стенда: [../../frontend/dev/README.md](../../frontend/dev/README.md), CI: [../CI.md](../CI.md).

## 3. Планы

**Улучшение опыта разработки** ([FRONTEND-DX-PLAN.md](FRONTEND-DX-PLAN.md)), 16-26 рабочих дней на этапы 1-6:
1. гигиена: корневой `package.json`, ESLint + Prettier, `.editorconfig`;
2. UI-тесты в CI;
3. типы через JSDoc и `tsc --noEmit`, общие JSON-примеры RPC-ответов для pytest и JS;
4. ✅ выполнено: ESM-исходники, сборка Vite в один бандл (коммитится), проверка `make ui-build-check`;
5. ✅ частично: Vite-стенд; шимы для `chain.js` и `gpo.js` не сделаны;
6. разбиение крупных файлов, CSS-переменные, скриншотные тесты;
7. пилот на выбор фреймворка по измерениям.

**Миграция UI в freeipa-webui** ([WEBUI-MIGRATION.md](WEBUI-MIGRATION.md)): три страницы (GPO, Chain, GPMaster) на React + PatternFly,
редактор GPUI подключается как есть. Оценка 36-50 дней на MVP; переписывание самого редактора на React ещё 3-5 месяцев и
принимается только по итогам пилота.

## 4. Порядок и зависимости

1. Этапы 1-2 DX-плана безопасны и дают пользу сразу.
2. Этап 4 (ESM-сборка, выполнен) нужен и для разработки, и для встраивания редактора в webui.
3. Прототип страницы GPO в `freeipa-webui` уточнит остальные оценки миграции.
4. Решение о переписывании редактора откладывается до этапа 7 DX-плана.
