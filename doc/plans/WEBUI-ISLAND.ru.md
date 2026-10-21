# Редактор «островом»: что должен предоставить хост

[English](./WEBUI-ISLAND.md) | **Русский**

Часть [WEBUI-MIGRATION.ru.md](WEBUI-MIGRATION.ru.md) (этапы 0 и 3). Редактор собирается как ES-модуль, который может подключить любая
страница: `npm run build:esm` в `frontend/` пишет `dist-esm/` (не коммитится): `gpui.js`, `gpui.css`, `gpui.d.ts` и `gpui-host.d.ts`.
`tests/integration/esm-island.browser.test.js` доказывает, что это работает: обычная страница без скриптов FreeIPA, два модуля хоста
сопоставлены import map'ом, JSON-RPC отвечает mock-сервер стенда.

## 1. Что хост импортирует

```js
import { init } from './gpui.js'; // и <link rel="stylesheet" href="./gpui.css">
const handle = init({ container, policyName: 'Default Domain Policy' });
// ... когда контейнер убирают:
handle?.cleanup();
```

- `init({ container | containerId, policyName })` отрисовывает весь редактор (заголовок, дерево, рабочую область) в элемент и возвращает
  `{ container, cleanup }` или `null`, если контейнера нет. Повторный вызов для того же контейнера останавливает прежний редактор.
- `cleanup()` снимает то, что редактор поставил вне своего контейнера (обработчики на `document`, собственную очистку открытого
  экрана). React-хост вызывает его из очистки эффекта.
- Типы лежат в `gpui.d.ts`.

## 2. Что предоставляет хост

В бандле остаются два голых импорта; хост сопоставляет их сам (import map на странице, alias в сборщике). Их типы — в
`gpui-host.d.ts`.

| Модуль | Как используется | Что нужно редактору |
|---|---|---|
| `freeipa/ipa` | экспорт по умолчанию | `api_version` (уходит как `version` в каждой команде), `notify(message, type)`, `notify_success(message)` |
| `freeipa/rpc` | экспорт по умолчанию | `command({ entity: 'gpo', method, args, options, retry, on_success, on_error }).execute()` |

`command` отправляет JSON-RPC-команду `<entity>_<method>` с `[args, options]` через сессию хоста. Каждый вызов — команда
`gpo_editor_*` (см. `tests/contracts/gpo_editor/`); `on_success(data)` получает `result` ответа, `on_error(xhr, textStatus, thrown)` —
ошибку. Для команд, ошибки которых редактор показывает сам, он ставит `retry: false`. В freeipa-webui это небольшой адаптер над его
клиентом RTK Query (этап 1); образцовый есть в стенде, `frontend/dev/shims/`.

## 3. Что ещё учесть

- **Изображения.** Стили ссылаются на `/img/...` (значки в `frontend/public/img/`). Хост отдаёт эту папку по `/img/` либо пути
  переписываются при его сборке.
- **Стили.** В `gpui.css` лежат CSS Modules и собственные листы редактора, ограниченные классами его контейнера; базовые стили хоста
  (шрифты, `box-sizing`, элементы форм) всё равно действуют внутри острова. Проверить при первой интеграции.
- **Язык.** Редактор берёт язык из браузера (`navigator.language`, `en` или `ru`).
- **Версия.** Модуль и серверный плагин идут вместе: контракт — это `API_VERSION` и эталонные ответы в
  `tests/contracts/gpo_editor/`.
