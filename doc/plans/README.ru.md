# Фронтенд: архитектура, текущая разработка, планы

[English](./README.md) | **Русский**

Сводка по состоянию на 2026-10-18. Детали и оценки лежат в планах:
[FRONTEND-DX-PLAN.ru.md](FRONTEND-DX-PLAN.ru.md) (улучшение опыта разработки) и
[WEBUI-MIGRATION.ru.md](WEBUI-MIGRATION.ru.md) (управление GPO в `freeipa-webui`).
Описание серверной части: [../ARCHITECTURE.ru.md](../ARCHITECTURE.ru.md) ([English](../ARCHITECTURE.md)).
Что изменилось в ветке `dev-setup` и как теперь работать: [../DEV-SETUP.ru.md](../DEV-SETUP.ru.md).

## 1. Архитектура фронтенда

Каталог `frontend/dist/` (собранный плагин; вручную написаны `frontend/public/chain.js` и `gpo.js`) ставится в `/usr/share/ipa/ui/js/plugins/chain` и состоит из двух слоёв.

| Слой | Файлы | Технологии |
|---|---|---|
| Страницы в Web UI FreeIPA | `chain.js` (1194 строки), `gpo.js` (396) | AMD, jQuery-фасеты `IPA.facet`, `reg`, `phases`; зависят от модулей `freeipa/*` |
| Редактор GPUI | исходники `frontend/src/` (около 20 тыс. строк), сборка `js/app.js`, стили `frontend/src/styles/` (около 2,4 тыс. строк, собираются в `js/app.css`) | Vanilla JS, ES-модули, один UMD/AMD-бандл (Vite), самописный `ElementCreator`, EN/RU-локали |

Редактор открывается из `gpo.js` в модальном окне и разбит на header, tree-view, workspace, footer и шаблоны:
ADMX, Preferences (22 layout'а, targeting editor), Scripts, Security, Advanced Audit, All Policies.
Он общается с сервером только типизированным JSON-RPC `gpo_editor_*` через `util/API.js` (~28 методов);
`libadmix` работает на сервере, пути SYSVOL браузеру не передаются.

**Выводы:**
- Структура приемлема: компоненты разнесены по файлам, а часть шаблонов (`security/`, `all-policies/`) уже разделена на model, dialog и view.
- Слабые места: крупные файлы (`preferences-view-template.js` 1501 строка, `script-template.js` 2113, `chain.js` 1194, `main.css` 2430; Prettier переносит длинные строки, поэтому размеры отличаются от прежних);
  императивный рендер с ручной защитой от гонок (`renderRequestId`, `currentViewCleanup`); состояние в замыканиях.
- Граница с бэкендом чистая, но формат ответов нигде не описан схемой: он выведен вручную (`editor-dto.js`).
- Исходники редактора теперь ES-модули в `frontend/src/`; в `frontend/dist/` лежит собранный каталог плагина (коммитится): `js/app.js`, `js/app.css`, `chain.js`, `gpo.js`, `img/`.

## 2. Как ведётся разработка сейчас

| Что | Как |
|---|---|
| Запуск редактора без FreeIPA | `make ui-dev-install`, затем `make ui-dev`: Vite-стенд (`frontend/dev`: mock-бэкенд, ES-шимы `freeipa/*`), перезагрузка при сохранении |
| Проверка на живом FreeIPA | devcontainer `.devcontainer/` (podman), перезагрузка плагинов `ipa-dev-reload`, e2e-тесты `frontend/tests/e2e/` |
| UI-тесты | `make test-ui` (`frontend/tests/unit` и `integration`, моки) и `make test-ui-ipa` (`frontend/tests/e2e`, живой FreeIPA в контейнере); без Chromium браузерные тесты пропускаются |
| Бэкенд-тесты | `make test-python`, `make test-coverage` (порог 93,90%), `make test-integration` |
| Линтер, форматтер, типы для JS | ESLint (`make ui-lint`), Prettier (`make ui-format-check`), `tsc --noEmit` по JSDoc (`npm run typecheck`), покрытие юнит-тестами с порогом (`npm test -- --coverage`) |
| CI | `python-backend.yml`: сборка RPM, pytest, интеграция во FreeIPA, публикация. задача `frontend`: lint, форматирование, типы, проверка бандла, тесты с покрытием, запрет пропущенных тестов |
| Ограничение стенда | `chain.js` и `gpo.js` в `frontend/dev` не работают (нужны модули FreeIPA), проверяются только на живом сервере |

Подробности стенда: [../../frontend/dev/README.ru.md](../../frontend/dev/README.ru.md), CI: [../CI.ru.md](../CI.ru.md).

## 3. Планы

**Улучшение опыта разработки** ([FRONTEND-DX-PLAN.ru.md](FRONTEND-DX-PLAN.ru.md)), 16-26 рабочих дней на этапы 1-6; статус:
1. ✅ гигиена: проект `frontend/` с `package.json`, ESLint, Prettier (`.editorconfig` не добавлен);
2. ✅ UI-тесты в CI (задача `frontend`; на сервере Forgejo ещё не запускалась);
3. ✅ частично: типы через JSDoc и `tsc --noEmit`; общие JSON-примеры RPC-ответов для pytest и JS не сделаны;
4. ✅ ESM-исходники, сборка Vite в один бандл (коммитится), проверка `make ui-build-check`;
5. ✅ частично: Vite-стенд; шимы для `chain.js` и `gpo.js` не сделаны;
6. ✅ частично: вынесены модульные функции из двух самых больших файлов; сами гигантские функции, CSS-переменные и скриншотные тесты не сделаны;
7. пилот на выбор фреймворка по измерениям — не начат.

**Миграция UI в freeipa-webui** ([WEBUI-MIGRATION.md](WEBUI-MIGRATION.md)): три страницы (GPO, Chain, GPMaster) на React + PatternFly,
редактор GPUI подключается как есть. Оценка 36-50 дней на MVP; переписывание самого редактора на React ещё 3-5 месяцев и
принимается только по итогам пилота.

## 4. Порядок и зависимости

1. Этапы 1-2 DX-плана выполнены; остальные этапы можно делать независимо.
2. Этап 4 (ESM-сборка, выполнен) нужен и для разработки, и для встраивания редактора в webui.
3. Прототип страницы GPO в `freeipa-webui` уточнит остальные оценки миграции.
4. Решение о переписывании редактора откладывается до этапа 7 DX-плана.
