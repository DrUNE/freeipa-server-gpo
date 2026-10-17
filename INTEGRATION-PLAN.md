# План интеграции GPO в freeipa-webui

## Статус исследования

**Дата:** 2026-10-17  
**Проект:** freeipa-webui → freeipa-server-gpo  
**Цель:** Интеграция управления групповыми политиками в React-based веб-интерфейс

---

## 1. Архитектураfreeipa-server-gpo

### Компоненты

```
FreeIPA Server Extension
├── gpo.py (143KB) - GPO CRUD + Editor Backend
├── chain.py (47KB) - Chain Management
├── gpmaster.py (23KB) - Master Configuration
├── ipa_gpo_install/ - Установщик
└── plugin/ui/grouppolicy/ - Существующий UI (Vanilla JS)
```

### API Commands

| Команда | Описание |
|---------|----------|
| `gpo_add` | Создание GPO |
| `gpo_mod` | Изменение GPO (поддерживает rename) |
| `gpo_del` | Удаление GPO |
| `gpo_show` | Получение детальной информации |
| `gpo_find` | Поиск GPO |
| `chain_add` | Создание Chain |
| `chain_mod` | Изменение Chain (moveup_gpc/movedown_gpc) |
| `chain_del` | Удаление Chain |
| `chain_show` | Просмотр Chain |
| `chain_enable/disable` | Активация/деактивация Chain |
| `gpmaster_show` | Просмотр GPMaster |
| `gpmaster_mod` | Изменение GPMaster (add/remove/moveup/movedown chain) |

### Иерархия

```
GPMaster (ipaGpoChainList)
  ├── Chain 1 (ipaGpoLink) → GPO 1, GPO 2
  ├── Chain 2 (ipaGpoLink) → GPO 3, GPO 4
  └── Chain 3 (ipaGpoLink) → GPO 5, GPO 6
```

**Приоритеты:**
1. Порядок цепочек в GPMaster
2. Порядок политик в Chain
3. Последняя политика победит при конфликте

---

## 2. Существующий GPO Editor

### Архитектура

```
Vanilla JS + AMD
├── app.js (877 строк) - Main entry
├── components/
│   ├── header/ - Toolbar
│   ├── tree-view/ - Custom tree
│   ├── workspace/ - Policy editing
│   ├── templates/
│   │   ├── admx-template.js (676 lines)
│   │   ├── security-template.js (33640 lines!)
│   │   ├── preference/ (2111 lines)
│   │   └── script-template.js (2200+ lines)
│   └── editor-dialog.js (7991 lines)
└── util/API.js - RPC client
```

### Миграция на PatternFly

**Что переписать (HIGH):**
- ✅ Header (Toolbar)
- ✅ Tree View (PatternFly Tree)
- ✅ Modals (PatternFly Modal)
- ✅ Form fields (Checkbox, Select, NumberInput, TextInput)
- ✅ Tabs (PatternFly Tabs)
- ✅ Tables (PatternFly Table)
- ✅ Footer (ModalFooter)

**Что НЕ переписывать (LOW):**
- ❌ Targeting Editor (44935 lines) - создать отдельную library
- ❌ admix binding - оставить как-is (native Python)
- ❌ Advanced Audit - можно оставить

---

## 3. План реализации для freeipa-webui

### Phase 1: API Service (Приоритет: HIGH)

**Файл:** `src/services/rpcGPO.ts`

```typescript
// Эндпоинты для GPO
useGetGPOsQuery
useGetGPOByIdQuery
useAddGPOMutation
useUpdateGPOMutation
useDeleteGPOsMutation

// Эндпоинты для Chain
useGetChainsQuery
useGetChainByIdQuery
useAddChainMutation
useUpdateChainMutation
useDeleteChainsMutation
useMoveGPOInChainMutation

// Эндпоинты для GPMaster
useGetGPMasterQuery
useUpdateGPMasterMutation
useEnableChainMutation
useDisableChainMutation
```

**Срок:** 2-3 дня

---

### Phase 2: Type Definitions (Приоритет: HIGH)

**Файл:** `src/utils/datatypes/globalDataTypes.ts`

```typescript
interface GPO {
  displayName: string[];
  cn: string[];
  distinguishedName?: string[];
  ipagpofilesyspath?: string[];
  ipagpoversionnumber?: string[];
  ipagpomachineextensionnames?: string[];
  ipagpouserextensionnames?: string[];
  ipagpoflags?: string[];
}

interface Chain {
  cn: string[];
  description?: string[];
  ipagpousergroup?: string[];
  ipagpocomputergroup?: string[];
  ipagpolink?: string[];
  ipagpolink_gpo?: string[];
  active?: boolean[];
}

interface GPMaster {
  cn: string[];
  ipagpochainlist?: string[];
  ipagpopdcemulator?: string[];
}
```

**Срок:** 1 день

---

### Phase 3: Pages (Приоритет: HIGH)

#### 3.1 GPO Page

**Файл:** `src/pages/GPO/GPO.tsx`

**Компоненты:**
- List view с search
- Pagination
- Add/Delete buttons
- Table: displayName, cn, version, flags
- Kebab menu (edit, delete)
- Details facet

**Срок:** 3-4 дня

#### 3.2 GPO Details

**Файл:** `src/pages/GPO/GPODetails.tsx`

**Компоненты:**
- Basic information (displayName, cn, version)
- File system path display
- Extension names display
- GPO Editor integration (modal)

**Срок:** 2 дня

#### 3.3 Chains Page

**Файл:** `src/pages/Chains/Chains.tsx`

**Компоненты:**
- List view с search
- Status (active/inactive)
- Priority controls (move up/down)
- GPO links display
- Enable/Disable buttons

**Срок:** 3 дня

#### 3.4 Master Page

**Файл:** `src/pages/GPMaster/GPMaster.tsx`

**Компоненты:**
- Chain list with priority
- Move up/down controls
- Add/remove chains
- PDC Emulator configuration

**Срок:** 2 дня

---

### Phase 4: Navigation (Приоритет: MEDIUM)

**Файл:** `src/navigation/NavRoutes.ts`

```typescript
{
  label: "Group Policy",
  group: "group-policy",
  path: "group-policy",
  items: [
    {
      label: "Group Policy Objects",
      group: "gpo",
      path: "group-policy/gpo",
    },
    {
      label: "Chains",
      group: "chain",
      path: "group-policy/chains",
    },
    {
      label: "Master",
      group: "gpmaster",
      path: "group-policy/master",
    },
  ],
}
```

**Срок:** 1 день

---

### Phase 5: App Routes (Приоритет: MEDIUM)

**Файл:** `src/navigation/AppRoutes.tsx`

```typescript
<Route path="group-policy">
  <Route path="gpo">
    <Route path="" element={<GPO />} />
    <Route path=":displayName" element={<GPODetails />} />
  </Route>
  <Route path="chains">
    <Route path="" element={<Chains />} />
    <Route path=":cn" element={<ChainDetails />} />
  </Route>
  <Route path="master" element={<GPMaster />} />
</Route>
```

**Срок:** 1 день

---

### Phase 6: Components (Приоритет: HIGH)

#### 6.1 Tables

**Файлы:**
- `src/pages/GPO/GPOsTable.tsx`
- `src/pages/Chains/ChainsTable.tsx`

**Компоненты:**
- Bulk selection
- Checkbox selection
- Sortable columns
- Empty state

**Срок:** 2 дня

#### 6.2 Modals

**Файлы:**
- `src/components/modals/GPO/AddGPO.tsx`
- `src/components/modals/GPO/EditGPO.tsx`
- `src/components/modals/GPO/DeleteGPOs.tsx`
- `src/components/modals/Chain/AddChain.tsx`
- `src/components/modals/Chain/EditChain.tsx`
- `src/components/modals/Chain/DeleteChains.tsx`
- `src/components/modals/GPO/MoveGPO.tsx`

**Компоненты:**
- Form validation
- Error handling
- Loading states
- Success notifications

**Срок:** 3 дня

#### 6.3 Layouts

**Файлы:**
- `src/components/layouts/GPOEditorModal.tsx`
- `src/components/layouts/ChainPriorityControl.tsx`

**Компоненты:**
- GPO Editor integration
- Priority move controls

**Срок:** 2 дня

---

### Phase 7: GPO Editor Integration (Приоритет: MEDIUM)

**Интеграция с существующим React editor:**

```typescript
// src/components/modals/GPO/GPOEditor.tsx
const openGPOEditor = (policyName: string) => {
  // Load existing React app from plugin/ui/grouppolicy/js/app.js
  // Open as modal dialog
  // Pass policyName as prop
  // Handle save/apply/cancel
};
```

**Опции:**
1. **Reuse existing editor** - интегрировать `plugin/ui/grouppolicy/js/app.js`
2. **Rewrite editor** - создать новый на PatternFly (Phase 8)
3. **Hybrid approach** - reuse basic editor, rewrite complex parts

**Срок:** 3-5 дней

---

### Phase 8: PatternFly GPO Editor (Опционально)

**Если переписываем editor:**

```typescript
// src/pages/GPO/editor/
├── GPOEditor.tsx
├── components/
│   ├── Header.tsx (Toolbar)
│   ├── TreeView.tsx (PatternFly Tree)
│   ├── Workspace.tsx
│   └── templates/
│       ├── AdmxPolicy.tsx
│       ├── SecurityPolicy.tsx
│       ├── PreferencePolicy.tsx
│       └── ScriptPolicy.tsx
└── hooks/
    ├── useAdmixWorkspace.ts
    └── usePolicyState.ts
```

**Срок:** 2-3 недели

---

### Phase 9: Testing (Приоритет: HIGH)

#### 9.1 Unit Tests

**Файлы:**
- `src/pages/GPO/GPO.test.tsx`
- `src/pages/Chains/Chains.test.tsx`
- `src/pages/GPMaster/GPMaster.test.tsx`
- `src/components/modals/GPO/*.test.tsx`

**Срок:** 3 дня

#### 9.2 Integration Tests (Cypress)

**Файлы:**
- `cypress/e2e/group-policy/gpo.feature`
- `cypress/e2e/group-policy/chains.feature`
- `cypress/e2e/group-policy/master.feature`

**Сценарии:**
```gherkin
Feature: GPO Management

  Scenario: Create GPO
    Given the user is on the GPO page
    When the user clicks "Add"
    And enters "Test Policy" as name
    And clicks "Add" in modal
    Then GPO "Test Policy" appears in list

  Scenario: Delete GPO
    Given GPO "Test Policy" exists
    When user selects it and clicks "Delete"
    And confirms deletion
    Then GPO "Test Policy" is removed

  Scenario: Move Chain Priority
    Given chains exist
    When user moves "chain-1" up
    Then "chain-1" appears first in list
```

**Срок:** 4 дня

---

## 4. Оценка трудозатрат

| Фаза | Описание | Время |
|------|----------|-------|
| 1 | API Service | 2-3 дня |
| 2 | Type Definitions | 1 день |
| 3 | Pages (3 pages) | 8-10 дней |
| 4 | Navigation | 1 день |
| 5 | App Routes | 1 день |
| 6 | Components | 7 дней |
| 7 | GPO Editor Integration | 3-5 дней |
| 8 | PatternFly Editor (опционально) | 2-3 недели |
| 9 | Testing | 7 дней |
| **ИТОГО** | **Основной функционал** | **25-35 дней** |
| **ИТОГО** | **С PatternFly Editor** | **45-60 дней** |

---

## 5. Рекомендации

### Приоритет 1: Быстрый запуск (1-2 месяца)

1. ✅ API Service (Phase 1)
2. ✅ Type Definitions (Phase 2)
3. ✅ Pages с существующим editor (Phase 3, 6, 7)
4. ✅ Testing (Phase 9)

**Результат:** Полноценный UI для GPO/Chain/Master с существующим редактором

### Приоритет 2: Улучшенный UI (3-4 месяца)

1. ✅ Все из Phase 1-9
2. ✅ PatternFly GPO Editor (Phase 8)

**Результат:** Консистентный UI с freeipa-webui

### Приоритет 3: Advanced Features (4+ месяцев)

1. ✅ Targeting Editor library
2. ✅ Performance optimization
3. ✅ Advanced features (versioning, history)

**Результат:** Enterprise-grade GPO management

---

## 6. Ключевые решения

### Решение 1: Использовать существующий GPO Editor

**Плюсы:**
- ✅ Уже работает
- ✅ Проверено в production
- ✅ Все функции уже реализованы

**Минусы:**
- ❌ Написан на Vanilla JS
- ❌ Нет type safety
- ❌ Сложно поддерживать

**Рекомендация:** Использовать как-is для MVP, переписать потом

### Решение 2: PatternFly + React в freeipa-webui

**Плюсы:**
- ✅ Консистентный UI
- ✅ Type safety (TypeScript)
- ✅ Легко поддерживать
- ✅ Тестируемость

**Минусы:**
- ❌ Работа в 2 репозиториях
- ❌ Дублирование кода

**Рекомендация:** Использовать PatternFly + React в freeipa-webui

### Решение 3: Targeting Editor

**Плюсы:**
- ✅ Очень сложная логика
- ✅ Нельзя просто переписать за 1 день

**Минусы:**
- ❌ 44935 строк кода
- ❌ Drag-and-drop
- ❌ Вложенные фильтры

**Рекомендация:** Создать отдельную library на базе PatternFly

---

## 7. Интеграция с существующим UI

### Текущее состояние

```
FreeIPA UI (existing)
├── plugin/ui/grouppolicy/
│   ├── gpo.js - GPO entity
│   ├── chain.js - Chain entity
│   └── js/
│       └── app.js - GPO Editor
└── ...

freeipa-webui (new)
├── src/pages/GPO/ - Новые страницы
├── src/pages/Chains/ - Новые страницы
├── src/pages/GPMaster/ - Новые страницы
└── src/services/rpcGPO.ts - API service
```

### Режимы интеграции

**Режим 1: Двойной UI (temporarily)**
```
FreeIPA: plugin/ui/grouppolicy/ (existing)
freeipa-webui: src/pages/GPO/ (new)

User can choose which to use
```

**Режим 2: Замена (recommended)**
```
FreeIPA: plugin/ui/grouppolicy/ (deprecated)
freeipa-webui: src/pages/GPO/ (primary)

Users migrated to new UI
```

**Режим 3: Proxy (complex)**
```
freeipa-webui proxies FreeIPA API
GPO editor runs in iframe or separate process
```

**Рекомендация:** Режим 2 (замена существующего UI)

---

## 8. Критерии успеха

### MVP (Phase 1-7)
- ✅ CRUD операции для GPO
- ✅ CRUD операции для Chain
- ✅ CRUD операции для GPMaster
- ✅ Приоритеты Chain и GPO
- ✅ Enable/Disable Chain
- ✅ GPO Editor доступен
- ✅ Basic testing

### Production Ready (Phase 1-9)
- ✅ All MVP features
- ✅ Unit tests > 80% coverage
- ✅ Cypress integration tests
- ✅ Accessibility audit
- ✅ Performance optimization
- ✅ Documentation

---

## 9. Следующие шаги

### Week 1
- [ ] Создать `src/services/rpcGPO.ts`
- [ ] Добавить type definitions
- [ ] Создать `src/pages/GPO/GPO.tsx` (list view)
- [ ] Создать modals (Add, Delete)

### Week 2
- [ ] Создать `src/pages/GPO/GPODetails.tsx`
- [ ] Создать `src/pages/Chains/Chains.tsx`
- [ ] Интегрировать существующий GPO editor

### Week 3
- [ ] Создать `src/pages/GPMaster/GPMaster.tsx`
- [ ] Добавить navigation
- [ ] Написать unit tests

### Week 4
- [ ] Cypress integration tests
- [ ] Accessibility audit
- [ ] Performance optimization

### Week 5
- [ ] Documentation
- [ ] User testing
- [ ] Final polish

---

## 10. Ресурсы

### Документация
- `ARCHITECTURE.md` - freeipa-server-gpo architecture
- `GPO-EDITOR-ANALYSIS.md` - Migration analysis
- `gpo-integration-guide.md` - Code examples
- `gpo-editor-patternfly.md` - PatternFly migration guide

### Тестирование
- `cypress/e2e/group-policy/` - Integration tests (создать)
- `src/pages/GPO/*.test.tsx` - Unit tests (создать)

### Ссылки
- [FreeIPA API Docs](https://freeipa.readthedocs.io/)
- [PatternFly React](https://www.patternfly.org/components)
- [RTK Query](https://redux-toolkit.js.org/rtk-query/)

---

## Заключение

**Интеграция GPO в freeipa-webui выполнима и рекомендована.**

**Стратегия:**
1. Создать API service (Phase 1)
2. Создать страницы с существующим editor (Phase 2-7)
3. Написать тесты (Phase 9)
4. Опционально: переписать editor на PatternFly (Phase 8)

**Срок:** 1-2 месяца для MVP, 3-4 месяца для production-ready

**Результат:** Полноценное управление групповыми политиками в freeipa-webui

---

**Следующее действие:** Начать с Phase 1 (API Service) или создать PoC для одного компонента.
