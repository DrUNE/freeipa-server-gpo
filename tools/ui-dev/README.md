# GPUI dev harness

Автономный стенд для разработки веб-редактора групповых политик
(`plugin/ui/grouppolicy/js`) без сервера FreeIPA.

Сервер раздаёт исходники плагина напрямую из рабочей копии и подменяет две
зависимости FreeIPA (`freeipa/ipa`, `freeipa/rpc`) шимами. Настоящий
`util/API.js` остаётся без изменений: его JSON-RPC вызовы уходят на
`POST /ipa/session/json`, где на них отвечает mock-бэкенд `backend.js`
с фикстурами в памяти.

## Запуск

```bash
make ui-dev-install   # один раз: npm install в tools/ui-dev (requirejs, playwright)
make ui-dev           # http://127.0.0.1:8765/ipa/ui/
```

Переменные: `PORT=9000 make ui-dev` или `node tools/ui-dev/server.js --port 9000 --host 0.0.0.0`.

Параметры URL: `?gpo=Имя&lang=ru`. Кнопка **Reset fixtures** сбрасывает
состояние mock-бэкенда. Сборка не нужна: правьте файлы в `plugin/ui/grouppolicy/`
и обновляйте страницу, кэш отключён через `urlArgs`.

## Тесты UI

```bash
make test-ui            # node --test "tests/ui/*.test.js" с NODE_PATH на tools/ui-dev/node_modules
npx --prefix tools/ui-dev playwright install chromium   # один раз для *.browser.test.js
```

Без установленного Chromium браузерные тесты помечаются как пропущенные.

`tests/ui/freeipa-plugin-menu.live.test.js` работает не с моками, а с настоящим
FreeIPA (dev container из `.devcontainer/`): проверяет, что плагин подключён к
приложению: модули отдаются, в меню **Policy → Group Policy** есть «Chains» и
«Group Policy Objects», а их страницы открываются. Адрес и учётные данные берутся
из `IPA_URL` (по умолчанию `https://server.ipa.test`), `IPA_ADMIN_USER` и
`IPA_ADMIN_PASSWORD`. Если сервер недоступен, тест пропускается.

## Что покрывает стенд

- редактор GPUI целиком: дерево, ADMX-политики, предпочтения, скрипты,
  параметры безопасности, расширенный аудит;
- реальные `API.js`, нормализация ошибок, локали;
- ошибки сервера: неизвестный метод возвращает `CommandError`, неизвестная
  политика `NotFound`, чтобы проверять состояния ошибок в UI.

Не покрывает `chain.js` и `gpo.js` (списки цепочек и GPO, модалка запуска
редактора): они зависят от фреймворка Web UI FreeIPA и проверяются только на
живом сервере.

## Как расширять

- Новый метод `gpo_editor_*`: добавьте функцию в `methods` в `backend.js`.
  Сигнатура: `(displayname, ...args, options)`, где `options` это второй
  элемент `params` запроса (`request`, `locales`, `category_id` и т.д.).
  Ответ оборачивается в `{result: {result: ...}}`, как делает FreeIPA.
- Новая зависимость `freeipa/<module>`: положите AMD-модуль в `shims/<module>.js`.
- Ошибка для UI: `throw new RpcError('message', {category: 'validation', field: 'id'})`.
