# Архитектура freeipa-server-gpo

## Обзор

**freeipa-server-gpo** — это расширение для FreeIPA, которое добавляет функциональность управления групповыми политиками (Group Policy Objects - GPO). Система использует принцип многоуровневого наследования настроек через три основных компонента: **Политики** → **Цепочки** → **Мастер групповых политик**.

## Концепция групповых политик

### Иерархия управления

```
Group Policy Master (GPMaster)
         ↓
    Chain 1 → GPO 1, GPO 2, GPO 3
    Chain 2 → GPO 4, GPO 5
    Chain 3 → GPO 6
```

**Три уровня приоритетов:**

1. **Master Level** — порядок цепочек в `ipaGpoChainList`
2. **Chain Level** — порядок политик в `ipaGpoLink`
3. **Policy Level** — приоритет внутри политики

### Принцип работы

При входе пользователя в систему политики применяются в строгой последовательности:

1. Система находит все цепочки, подходящие пользователю и компьютеру
2. Цепочки обрабатываются в порядке из `ipaGpoChainList`
3. Внутри каждой цепочки политики обрабатываются по порядку `ipaGpoLink`
4. При конфликте приоритет имеет последняя политика

## Архитектура

### Структура проекта

```
freeipa-server-gpo/
├── bin/
│   └── ipa-gpo-install          # Установщик и инициализация
├── plugin/
│   ├── ipaserver/plugins/
│   │   ├── gpo.py               # GPO CRUD и редактор
│   │   ├── chain.py             # Управление цепочками
│   │   └── gpmaster.py          # Управление мастером
│   ├── schema.d/                # LDAP схема (.ldif)
│   ├── update/                  # Миграции (.update)
│   ├── dbus_handlers/           # DBUS обработчики
│   └── ui/                      # UI плагины
│       └── grouppolicy/
│           ├── gpo.js           # GPO entity (FreeIPA UI)
│           ├── chain.js         # Chain entity (FreeIPA UI)
│           ├── css/             # Стили
│           ├── img/             # Иконки
│           └── js/              # JS компоненты редактора
├── ipa_gpo_install/             # Установщик
│   ├── cli.py                   # CLI интерфейс
│   ├── actions.py               # Установочные действия
│   ├── checks.py                # Проверки
│   └── filesystem.py            # Работа с файловой системой
├── PoliciesData/                # Шаблоны политик (ADMX)
├── tests/
│   ├── integration/             # Integration tests
│   └── *.py                     # Unit tests
└── doc/                         # Документация
```

### FreeIPA Plugins (LDAP API)

#### 1. gpo.py — Group Policy Objects

**Основные классы и функции:**

```python
# Основной класс GPO
@register()
class gpo(LDAPObject):
    object_class = ['ipaGpoContainer']
    default_attributes = [
        'cn', 'displayName', 'distinguishedName',
        'ipaGpoFlags', 'ipaGpoFileSysPath',
        'ipaGpoVersionNumber',
        'ipaGpoMachineExtensionNames',
        'ipaGpoUserExtensionNames'
    ]

# Команды (Commands):
- gpo_add      # Создание GPO
- gpo_mod      # Изменение GPO
- gpo_del      # Удаление GPO
- gpo_show     # Просмотр GPO
- gpo_find     # Поиск GPO
```

**Ключевые функции:**

```python
# Проверка схемы перед операциями
def verify_gpo_schema(ldap, api):

# Валидация GUID
def _canonical_guid(value):

# Валидация UNC пути
def _validate_unc(value, domain, guid):

# Определение контекста редактора
def _resolve_editor_context(ldap_backend, api_instance, displayname, write=False):

# Работа с каталогом админ. шаблонов
def _refresh_catalog(module=None):
def _get_catalog(module=None):
```

**Структура GPO в LDAP:**

```ldif
dn: cn={GUID},cn=Policies,cn=System,dc=example,dc=test
objectClass: ipaGpoContainer
cn: {GUID}
displayName: Policy Name
ipaGpoFileSysPath: \\server\SysVol\domain\Policies\{GUID}
ipaGpoVersionNumber: 1
ipaGpoMachineExtensionNames: {GUID1},{GUID2}
ipaGpoUserExtensionNames: {GUID3}
```

#### 2. chain.py — Group Policy Chains

**Основные классы:**

```python
@register()
class chain(LDAPObject):
    object_class = ['ipaGpoChain']
    default_attributes = [
        'cn', 'description',
        'ipaGpoUserGroup',
        'ipaGpoComputerGroup',
        'ipaGpoLink'
    ]

# Команды:
- chain_add        # Создание цепочки
- chain_mod        # Изменение цепочки
- chain_del        # Удаление цепочки
- chain_show       # Просмотр цепочки
- chain_find       # Поиск цепочек
- chain_enable     # Активация цепочки
- chain_disable    # Деактивация цепочки
```

**Особенности:**

- Автоматически добавляет новую цепочку в GPMaster
- Конвертация имен групп в DNs
- Поддержка перемещения GPO внутри цепочки (`--moveup-gpc`, `--movedown-gpc`)

**Структура Chain в LDAP:**

```ldif
dn: cn=dev-chain,cn=Chains,cn=System,dc=example,dc=test
objectClass: ipaGpoChain
cn: dev-chain
description: Development Chain
ipaGpoUserGroup: cn=developers,cn=groups,cn=accounts,dc=example,dc=test
ipaGpoComputerGroup: cn=dev-workstations,cn=hostgroups,cn=accounts,dc=example,dc=test
ipaGpoLink: cn={GUID1},cn=Policies,cn=System,dc=example,dc=test
ipaGpoLink: cn={GUID2},cn=Policies,cn=System,dc=example,dc=test
```

#### 3. gpmaster.py — Group Policy Master

**Основные классы:**

```python
@register()
class gpmaster(LDAPObject):
    object_class = ['ipaGpoMaster']
    default_attributes = [
        'cn', 'ipaGpoChainList', 'ipaGpoPdcEmulator'
    ]

# Команды:
- gpmaster_show    # Просмотр мастера
- gpmaster_mod     # Изменение мастера

# Опции gpmaster_mod:
- --add-chain      # Добавить цепочку
- --remove-chain   # Удалить цепочку
- --moveup-chain   # Повысить приоритет
- --movedown-chain # Понизить приоритет
```

**Структура Master в LDAP:**

```ldif
dn: cn=grouppolicymaster,cn=etc,dc=example,dc=test
objectClass: ipaGpoMaster
cn: grouppolicymaster
ipaGpoChainList: cn=dev-chain,cn=Chains,cn=System,dc=example,dc=test
ipaGpoChainList: cn=office-chain,cn=Chains,cn=System,dc=example,dc=test
ipaGpoPdcEmulator: server1.example.test
```

### Установщик (ipa_gpo_install)

**Основные компоненты:**

```python
# ipa_gpo_install/cli.py
def main():
    # 1. Парсинг аргументов
    options = parse_options()
    
    # 2. Настройка окружения
    setup_environment(options)
    
    # 3. Проверки
    checker = IPAChecker(logger, api)
    check_critical_requirements(checker)
    check_results = perform_configuration_checks(checker)
    
    # 4. Выполнение действий
    actions = IPAActions(logger, api)
    execute_required_actions(actions, check_results)
```

**Что делает установщик:**

1. **Проверки:**
   - Kerberos ticket
   - Admin privileges
   - IPA services status
   - LDAP schema completeness
   - SYSVOL directory and share
   - GPO editor filesystem permissions

2. **Действия:**
   - Установка AD Trust (если не установлен)
   - Создание SYSVOL directory
   - Настройка SYSVOL share
   - Настройка прав доступа для редактора
   - Активация FreeIPA plugins
   - Перезапуск служб (oddjobd, httpd)
   - Выполнение `ipa-server-upgrade`

**Файловая структура SYSVOL:**

```
/var/lib/freeipa/sysvol/
└── domain.example.com/
    └── Policies/
        ├── {GUID-1}/
        │   ├── GPT.INI
        │   ├── Machine/
        │   │   ├── Registry.pol
        │   │   └── comment.cmtx
        │   └── User/
        │       ├── Registry.pol
        │       └── comment.cmtx
        └── {GUID-2}/
            └── ...
```

### GPO Editor Backend

**Архитектура редактора:**

```python
# Ключевые компоненты:
1. admix Python binding — native library for policy editing
2. TemplateCatalog — кэширование ADML/ADMX шаблонов
3. SecurityDefinitionCatalog — кэширование security policies
4. GroupPolicyWorkspace — работа с GPO файлами
5. EditorContext — безопасный контекст с проверками

# Поток операций:
1. Resolve context → _resolve_editor_context()
2. Validate permissions → _authorize_editor()
3. Verify filesystem → _trusted_gpo_root()
4. Create workspace → _open_workspace()
5. Apply changes → _apply_publication_plan()
6. Commit to LDAP → _read_gpc_snapshot()
```

**Каталог шаблонов:**

```python
# Кэширование
_catalog = None
_catalog_state = None
_catalog_last_refresh = 0.0

# Background refresh thread
_catalog_monitor_thread

# Обновление каждые 5 секунд
GPO_CATALOG_REFRESH_INTERVAL = 5.0

# Ограничения
GPO_POLICY_INDEX_MAX_NODES = 100000
GPO_SCRIPT_UPLOAD_MAX_BYTES = 16 * 1024 * 1024
```

**Безопасность:**

```python
# Строгая валидация путей
def _trusted_gpo_root(domain, guid):
    # 1. Проверка на symlinks
    # 2. Проверка resolve()
    # 3. Проверка containment
    # 4. Запрет выхода за Policies root

# Авторизация
def _authorize_editor(ldap_backend, dn, write=False):
    # Проверка прав на ipagpoversionnumber
    # Проверка прав на ipagpomachineextensionnames
    # Проверка прав на ipagpouserextensionnames
```

### FreeIPA UI Integration

**Архитектура UI плагинов:**

```
plugin/ui/grouppolicy/
├── gpo.js           # GPO entity (search, details, gpui action)
├── chain.js         # Chain entity (search, details, actions)
├── css/
│   ├── main.css
│   └── other.css
├── img/
└── js/
    ├── app.js       # React-based GPO editor
    ├── components/
    │   └── editor-dialog.js
    └── locales/
        └── translations.js
```

**GPO UI Components:**

```javascript
// gpo.js
define([
    'freeipa/ipa',
    'freeipa/phases',
    'freeipa/reg',
    './js/components/editor-dialog'
], function(IPA, phases, reg, editorDialog) {

    // Actions
    - gpo_save    // Сохранение изменений
    - gpui        // Открытие GPO editor

    // Facets
    - search      // Поиск и список GPO
    - details     // Детальная информация

    // GPO Editor Modal
    - Открывается как modal dialog
    - Загружает React app из ./js/app.js
    - Передает policyName в контейнер
});
```

**Команды FreeIPA UI:**

```javascript
// register() function
exp.register = function() {
    var e = reg.entity;
    var a = reg.action;

    // Register actions
    a.register('gpo_save', exp.save_action);
    a.register('gpui', exp.gpui_action);
    
    // Register entity
    e.register({type: 'gpo', spec: exp.gpo_entity_spec});
};
```

### Работа с файлами политик

**Структура GPO:**

```
{GUID}/
├── GPT.INI                 # Metadata file
├── GPO.cmt                 # Comment file
├── Machine/
│   ├── Registry.pol        # Machine policies (binary)
│   ├── comment.cmtx        # Machine comment (XML)
│   └── [policy-path]/
│       └── [policy-file]
└── User/
    ├── Registry.pol        # User policies (binary)
    ├── comment.cmtu        # User comment (XML)
    └── [policy-path]/
        └── [policy-file]
```

**Формат GPT.INI:**

```ini
[General]
Version=1
displayName=Policy Name
gPCFunctionalityVersion=1
gPCMachineExtensionNames={GUID1},{GUID2}
gPCUserExtensionNames={GUID3},{GUID4}
```

**Типы политики:**

1. **Registry.pol** — бинарный файл с настройками реестра
2. **comment.cmtx/cmtu** — XML файлы с комментариями
3. **Policy definitions** — ADMX/ADML файлы (кэшируются)

### Тестирование

**Unit Tests:**

```bash
# Запуск unit тестов
pytest tests/ --ignore=tests/integration

# Покрытие кода
coverage run -m pytest --ignore=tests/integration
coverage report --fail-under=93.90
```

**Типы тестов:**

```python
# tests/test_gpo_crud_unit.py
- test_gpo_json_delegates_when_schema_metadata_is_available
- test_gpo_json_falls_back_when_schema_metadata_is_missing
- test_find_gpo_by_displayname_uses_policy_container

# tests/test_chain_unit.py
- test_chain_convert_names_to_dns
- test_chain_resolve_object_name
- test_chain_add

# tests/test_gpmaster_unit.py
- test_gpmaster_convert_chain_names_to_dns
- test_gpmaster_mod_add_chain
- test_gpmaster_mod_moveup_chain

# tests/test_gpo_editor_backend.py
- test_workspace_operations
- test_catalog_refresh
- test_editor_authorization
```

**Integration Tests:**

```python
# tests/integration/
- conftest.py          # Настройка интеграционного тестирования
- test_gpo_editor_389ds.py  # Тесты редактора с 389-DS
```

### Безопасность

**Компоненты безопасности:**

1. **Kerberos Authentication** — все операции требуют валидного билета
2. **ACL Checks** — проверка прав через `ldap_backend.can_write()`
3. **Filesystem Validation** — запрет symlinks и path traversal
4. **Schema Validation** — проверка наличия необходимых object classes
5. **Input Validation** — валидация GUID, UNC paths, DN

**Роли и привилегии:**

```python
# Managed permissions
managed_permissions = {
    'System: Read Group Policy Chains': {...},
    'System: Add Group Policy Chains': {
        'default_privileges': {'Group Policy Administrators'}
    },
    'System: Modify Group Policy Chains': {
        'default_privileges': {'Group Policy Administrators'}
    }
}
```

### Дебаг и логирование

**Логирование:**

```python
import logging
logger = logging.getLogger(__name__)

# Уровни логирования
# 0 = errors
# 1 = warnings
# 2 = debug
```

**Ключевые точки логирования:**

```python
logger.info("Administrative template catalog ready: generation=%s", generation)
logger.warning("Failed to %s chain '%s': %s", action, cn, str(exc))
logger.debug("GPO schema check error: %s", str(e))
```

### CI/CD

**Makefile commands:**

```makefile
# Тесты
test-python      # Unit tests
test-coverage    # С отчетом о покрытии
test-integration # Integration tests

# UI
test-ui          # UI tests (Node.js)
ui-dev           # Dev server для UI
ui-dev-install   # Установка зависимостей

# Сборка
build            # Сборка пакета
install          # Установка
rpm              # RPM пакет
```

**Покрытие кода:**

```
Coverage threshold: 93.90%
Includes:
- ipa_gpo_install/*.py
- plugin/ipaserver/plugins/*.py
```

### Зависимости

**Python зависимости:**

```python
# Основные библиотеки
from ipalib import Command, Str, Int, _, api, errors
from ipapython.dn import DN
from ipaserver.plugins.baseldap import LDAPObject, LDAPCreate, LDAPUpdate

# DBUS для асинхронных операций
import dbus
import dbus.mainloop.glib

# Native admix binding
import admix
```

**System dependencies:**

```
- FreeIPA server
- 389 Directory Server
- Samba (for SYSVOL)
- oddjobd (for async operations)
- admix Python binding
- ADML/ADMX templates
```

### Итерация развития

**Текущее состояние:**

✅ Базовая CRUD операции для GPO
✅ Управление цепочками
✅ Управление мастером
✅ GPO редактор (React UI)
✅ CLI инструменты
✅ Integration tests

**Потенциальные улучшения:**

- [ ] Поддержка preferences внутри политик
- [ ] Продвинутые фильтры политик
- [ ] Drag-and-drop для порядка политик
- [ ] Version history для GPO
- [ ] Rollback functionality

## Интеграция с freeipa-webui

### Текущая интеграция

**Существующий UI плагин:**

```
plugin/ui/grouppolicy/
├── gpo.js          # Встроен в FreeIPA UI
└── chain.js        # Встроен в FreeIPA UI
```

### Дополнительная интеграция с freeipa-webui

**Возможные подходы:**

1. **Модульный плагин** — создать отдельный UI на базе freeipa-webui
2. **Backend API** — добавить REST API endpoints для внешних UI
3. **Proxy mode** — freeipa-webui проксирует запросы к FreeIPA API

**Рекомендуемая архитектура для freeipa-webui:**

```
┌─────────────────────────────────────────────┐
│         freeipa-webui (React)               │
│  ┌───────────────────────────────────────┐  │
│  │  /gpo (New Page)                      │  │
│  │  - GPO list, search, filter           │  │
│  │  - Chain list, priority management    │  │
│  │  - Master configuration               │  │
│  └───────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
              ↓ (RTK Query)
┌─────────────────────────────────────────────┐
│     FreeIPA API (JSON-RPC)                  │
│  - gpo_add, gpo_mod, gpo_del               │
│  - chain_add, chain_mod, chain_del         │
│  - gpmaster_mod                            │
└─────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────┐
│      freeipa-server-gpo Plugins             │
│  - gpo.py, chain.py, gpmaster.py           │
└─────────────────────────────────────────────┘
```

### API endpoints (FreeIPA JSON-RPC)

```javascript
// Пример вызовов из freeipa-webui

// 1. Get GPO list
{
  "method": "gpo_find",
  "params": [[""], {
    "sizelimit": 0,
    "version": "2.247"
  }]
}

// 2. Get GPO details
{
  "method": "gpo_show",
  "params": [["Policy Name"], {
    "all": true,
    "version": "2.247"
  }]
}

// 3. Create GPO
{
  "method": "gpo_add",
  "params": [["New Policy"], {
    "version": "2.247"
  }]
}

// 4. Update GPO
{
  "method": "gpo_mod",
  "params": [["Policy Name"], {
    "rename": "New Name",
    "version": "2.247"
  }]
}

// 5. Delete GPO
{
  "method": "gpo_del",
  "params": [["Policy Name"], {
    "version": "2.247"
  }]
}

// 6. Get chain list
{
  "method": "chain_find",
  "params": [[""], {
    "sizelimit": 0,
    "version": "2.247"
  }]
}

// 7. Get GPMaster
{
  "method": "gpmaster_show",
  "params": [[], {
    "version": "2.247"
  }]
}

// 8. Update GPMaster chain order
{
  "method": "gpmaster_mod",
  "params": [["grouppolicymaster"], {
    "moveup_chain": ["chain-name"],
    "version": "2.247"
  }]
}
```

### Рекомендации по интеграции

**1. Создать API сервис (services/rpcGPO.ts):**

```typescript
//services/rpcGPO.ts
const extendedApi = api.injectEndpoints({
  endpoints: (build) => ({
    getGPOs: build.query<BatchRPCResponse, any>({
      query: (payload) => {
        return getCommand({
          method: 'gpo_find',
          params: [[payload.searchValue], {
            sizelimit: payload.sizeLimit,
            version: API_VERSION_BACKUP
          }]
        });
      }
    }),
    addGPO: build.mutation<FindRPCResponse, any>({
      query: (payload) => {
        return getCommand({
          method: 'gpo_add',
          params: [[payload.displayName], {
            version: API_VERSION_BACKUP
          }]
        });
      }
    }),
    // ... остальные эндпоинты
  })
});
```

**2. Создать страницу GPO (pages/GPO/GPO.tsx):**

```typescript
// follow existing patterns from Hosts, UserGroups
// - Search, Add, Delete, Refresh buttons
// - Table with columns: displayName, cn, version
// - Details facet on click
// - GPO editor integration
```

**3. Добавить навигацию (navigation/NavRoutes.ts):**

```typescript
{
  label: "Group Policy",
  group: "grouppolicy",
  path: "group-policy",
  items: [
    {
      label: "Policies",
      group: "gpo",
      path: "group-policy/gpo"
    },
    {
      label: "Chains",
      group: "chain",
      path: "group-policy/chains"
    },
    {
      label: "Master",
      group: "gpmaster",
      path: "group-policy/master"
    }
  ]
}
```

**4. Компоненты:**

```bash
components/
├── modals/
│   ├── GPO/
│   │   ├── AddGPO.tsx
│   │   ├── EditGPO.tsx
│   │   └── DeleteGPO.tsx
│   └── Chain/
│       ├── AddChain.tsx
│       ├── EditChain.tsx
│       ├── MoveUpGPO.tsx
│       └── MoveDownGPO.tsx
└── tables/
    ├── GPOsTable.tsx
    └── ChainsTable.tsx
```

### Ключевые особенности интеграции

**1. GPO Editor Integration:**

```javascript
// Вызов существующего GPO editor из freeipa-webui
const openGpoEditor = (policyName) => {
  // Используем existing gpo.js plugin
  // Открываем modal с React app из plugin/ui/grouppolicy/js/app.js
};
```

**2. Chain Priority Management:**

```javascript
// Перемещение GPO внутри цепочки
ipa.command({
  method: 'chain_mod',
  params: [[chainName], {
    moveup_gpc: [gpoDisplayName],
    version: API_VERSION_BACKUP
  }]
});
```

**3. Batch Operations:**

```javascript
// Пакетное создание/удаление
ipa.command({
  method: 'batch',
  params: [[
    { method: 'gpo_add', params: [...] },
    { method: 'chain_add', params: [...] }
  ], { version: API_VERSION_BACKUP }]
});
```

## Заключение

**freeipa-server-gpo** — это полноценное расширение для управления групповыми политиками в FreeIPA с:

- ✅ REST API через FreeIPA JSON-RPC
- ✅ CLI инструменты
- ✅ Встроенный React редактор GPO
- ✅ Управление иерархией: Master → Chain → GPO
- ✅ Интеграция с 389-DS и SYSVOL
- ✅ Валидация и безопасность
- ✅ Тестирование (unit + integration)

**Для freeipa-webui интеграции** рекомендуется:

1. Создать API сервис (RTK Query endpoints)
2. Создать страницы GPO, Chain, Master
3. Интегрировать GPO editor modal
4. Добавить навигацию
5. Написать Cypress integration tests
