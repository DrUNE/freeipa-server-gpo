# GPUI dev harness

[English](./README.md) | **Русский**

Автономный стенд для разработки веб-редактора групповых политик
(`frontend/src`) без сервера FreeIPA.

Стенд работает на Vite: он раздаёт исходники `frontend/src` напрямую (перезагрузка страницы при сохранении),
подменяет `freeipa/ipa` и `freeipa/rpc` ES-шимами из `shims/`, а JSON-RPC `POST /ipa/session/json` обслуживает
mock-бэкенд `backend.mjs` (фикстуры в памяти) через плагин в `../vite.config.mjs`. Настоящий `util/API.js` не меняется.

## Запуск

```bash
make ui-dev-install   # один раз: npm install в frontend (requirejs, playwright)
make ui-dev           # http://127.0.0.1:8765/ipa/ui/
```

Порт и хост: `npx --prefix frontend vite --port 9000 --host 0.0.0.0` (из корня репозитория: `cd frontend && npx vite ...`).

Параметры URL: `?gpo=Имя&lang=ru&scenario=error`. Сценарии mock-сервера (есть и переключатель **Scenario** в верхней панели): `normal`; `error` — каждый вызов `gpo_editor_*` падает, как у недоступного сервера (`ServerUnavailable`); `slow` — каждый ответ задерживается на 1,5 с (состояния загрузки); `empty` — списки (элементы, файлы, дочерние узлы, политики, документы предпочтений, записи скриптов) приходят пустыми. Кнопка **Reset fixtures** сбрасывает
состояние mock-бэкенда. Правка в `src/` перезапускает редактор на той же странице (HMR: вкладка не перезагружается, стили применяются без перезапуска). Сборка не нужна: правьте файлы в `frontend/src/`.

## Тесты UI

Описаны в `../README.ru.md` (раздел «Тесты»): `npm test` (юнит и интеграционные на моках) и
`npm run test:ipa` (e2e на настоящем FreeIPA в dev-контейнере).

## Что покрывает стенд

- редактор GPUI целиком: дерево, ADMX-политики, предпочтения, скрипты,
  параметры безопасности, расширенный аудит;
- реальные `API.js`, нормализация ошибок, локали;
- ошибки сервера: неизвестный метод возвращает `CommandError`, неизвестная
  политика `NotFound`, чтобы проверять состояния ошибок в UI.

Не покрывает `chain.js` и `gpo.js` (списки цепочек и GPO, модалка запуска
редактора): они зависят от фреймворка Web UI FreeIPA и в стенде не отрисовываются. Их действия и
регистрация покрыты юнит-тестами с подменами `freeipa/*` (`tests/unit/chain-actions.test.js`,
`gpo-page.test.js`); сами страницы проверяются на живом сервере.

## Как расширять

- Новый метод `gpo_editor_*`: добавьте функцию в `methods` в `backend.mjs`.
  Сигнатура: `(displayname, ...args, options)`, где `options` это второй
  элемент `params` запроса (`request`, `locales`, `category_id` и т.д.).
  Ответ оборачивается в `{result: {result: ...}}`, как делает FreeIPA.
- Новая зависимость `freeipa/<module>`: добавьте ES-шим `shims/<module>.js` и alias в `../vite.config.mjs`.
- Ошибка для UI: `throw new RpcError('message', {category: 'validation', field: 'id'})`.
