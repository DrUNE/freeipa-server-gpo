# Анализ GPO Editor Архитектуры

## Обзор

**GPO Editor** — это полнофункциональный веб-редактор групповых политик для FreeIPA. Написан на **Vanilla JS** с использованием **AMD модулей**.

## Текущая архитектура

### Технологический стек

```javascript
// Основные зависимости
define([
    'freeipa/ipa',           // FreeIPA core
    'freeipa/rpc',           // RPC клиент
    './locales/translations' // i18n
], function(IPA, rpc, translations) {
    // ...
});
```

**Технологии:**
- Vanilla JS (ES5 + AMD)
- jQuery (неявно через IPA)
- Custom ElementCreator utility
- Custom modal/dialog system
- Custom tree-view implementation

### Структура приложения

```
plugin/ui/grouppolicy/js/
├── app.js                    (877 строк) — Main entry point
├── components/
│   ├── header/               (Header component)
│   ├── main/                 (Main workspace with tree-view)
│   ├── footer/               (Footer with save/cancel)
│   ├── tree-view/            (Custom tree implementation)
│   ├── workspace/            (Workspace for policy editing)
│   ├── templates/            (Policy templates)
│   │   ├── admx-template.js          (Group Policy settings)
│   │   ├── security-template.js      (Security policies)
│   │   ├── script-template.js        (Scripts - 2200+ lines!)
│   │   ├── preference/               (Preferences - 2000+ lines!)
│   │   ├── advanced-audit-template.js
│   │   ├── all-policies-template.js
│   │   └── folder-template.js
│   ├── collection-dialog.js  (Collection editor modal)
│   ├── editor-dialog.js      (Base dialog implementation)
│   ├── editor-status.js      (Editor state management)
│   └── confirmation-dialog.js
├── locales/                  (Translations)
│   └── translations.js
└── util/
    ├── API.js                (RPC client wrapper)
    ├── editor-dto.js         (Data transfer objects)
    ├── element-creator.js    (DOM builder utility)
    ├── resizable.js          (Split-pane resizing)
    └── ...
```

### Компоненты интерфейса

#### 1. Header Component

```javascript
// plugin/ui/grouppolicy/js/components/header/header.js (262 строк)
renderHeader(container) {
  gp__header
  ├── gp__header-left
  │   ├── gp__search          (Search input)
  │   ├── gp__nav             (Navigation path)
  │   └── gp__control         (Action buttons: Create/Edit/Delete)
  └── gp__control-actions
      ├── gp__control-admx    (Apply/Cancel for ADMX)
      ├── gp__control-separator
      └── gp__control-help    (Information/help button)
}
```

#### 2. Main Component

```javascript
// plugin/ui/grouppolicy/js/components/main/main.js (130 строк)
renderMain(container, treeViewState) {
  gp__main (flex container)
  ├── tree-view              (432px width, scrollable)
  ├── divider                (Draggable splitter)
  └── workspace              (Remaining space)
}
```

#### 3. Workspace

```javascript
// plugin/ui/grouppolicy/js/components/workspace/workspace.js (19 строк)
renderWorkspace() {
  div.workspace
  // Content rendered dynamically based on selected item
}
```

#### 4. Tree View

```javascript
// plugin/ui/grouppolicy/js/components/tree-view/tree-view.js (168 строк)
renderTreeView(workspace, treeViewState) {
  div.tree-view
  ├── Loading spinner
  ├── Error state
  └── Tree structure
      ├── Folder nodes (expandable)
      └── Policy file nodes (clickable)
}
```

### Шаблоны редактирования

#### 1. ADMX Template (Group Policy)

**Файл:** `admx-template.js` (676 строк)

**Компоненты:**
- **Policy state selector** (Not Configured/Enabled/Disabled)
- **Parameter controls:**
  - Boolean checkboxes
  - Enum dropdowns
  - Text/number inputs
  - List/collection controls
  - Unsupported field indicators

**Структура:**
```javascript
function renderPolicyContents(root, policy, handlers) {
  // State radio buttons
  // Parameter controls map
  // Validation and dirty tracking
}
```

#### 2. Security Template

**Файл:** `security-template.js` (33640 строк)

**Компоненты:**
- **Security policy settings**
- **Explanation panel**
- **Tab-based UI** (Settings/Explanation)
- **Advanced security options**
- **Template management**

#### 3. Preference Template

**Файл:** `preferences-view-template.js` (2111 строк)

**Компоненты:**
- **Preference item list** (Table view)
- **Field controls:**
  - Boolean/optional boolean
  - Integer/unsigned byte
  - Text/list inputs
  - Action dropdowns (Create/Replace/Update/Delete)
  - Filter combine (AND/OR)
  - Choice select
- **Targeting editor** (44935 строк!)
- **Preference layouts** (Configurable column layouts)

#### 4. Script Template

**Файл:** `script-template.js` (2200+ строк)

**Компоненты:**
- **Script list** (Startup/Shutdown for computer, Logon/Logoff for user)
- **Script editor modal**
- **Script parameters**
- **Script execution order**

#### 5. Folder Template

**Файл:** `folder-template.js` (360 строк)

**Компоненты:**
- **Category path** (Breadcrumb navigation)
- **Search filter**
- **Child items list**
- **Help block**

### Модальные окна и диалоги

#### 1. Editor Dialog (Базовый класс)

```javascript
// plugin/ui/grouppolicy/js/components/editor-dialog.js (7991 строк!)
editorDialog.open(host, options) {
  // Modal container
  // Body content
  // Apply/Cancel buttons
  // Close button
  // Discard confirmation
}
```

**Функции:**
- Открытие/закрытие модальных окон
- Валидация перед сохранением
- Подтверждение отмены изменений
- Обработка Apply/Cancel
- Состояние "изменено"

#### 2. Collection Dialog

```javascript
// plugin/ui/grouppolicy/js/components/collection-dialog.js (24193 строк!)
// Специализированный редактор коллекций для списков
```

#### 3. Security Dialog

```javascript
// plugin/ui/grouppolicy/js/components/templates/security/dialog.js (433 строк)
tabs(settings, explanation) {
  // Tab bar (Settings/Explanation)
  // Panel switching
  // Keyboard navigation
}
```

### API Клиент

```javascript
// plugin/ui/grouppolicy/js/util/API.js (374 строк)
API.execute(method, args, options) {
  // RPC call to FreeIPA
  // Error handling
  // Response normalization
  // Authentication checks
}
```

**Поддерживаемые методы:**
- `editor_security` — Security policies
- `editor_advanced_audit` — Advanced audit settings
- `editor_script` — Script settings
- `editor_policy_index` — Policy index refresh
- `editor_all_policies` — All policies view

### Состояние приложения

```javascript
// treeViewState object
{
  selectedItem: null,
  selectedPath: [],
  workspace: null,
  header: null,
  isHelpOpen: false,
  currentViewCleanup: null,
  treeData: [],
  treeItemElements: WeakMap(),
  parentItems: WeakMap(),
  pendingNavigation: null,
  policyChangedModal: null,
  
  // Methods
  setWorkspace(),
  setTreeData(),
  setHeader(),
  initHelpControls(),
  renderCategoryPath(),
  toggleFolder(),
  openPathToItem(),
  toggleHelp(),
  cleanupCurrentView(),
  setCurrentView()
}
```

### Стили (CSS)

#### Основные классы

```css
/* main.css (1000+ строк) */
.gp__container         { min-width: 1200px; }
.gp__main              { display: flex; height: calc(100% - 64px - 48px); }
.gp__search            { width: 408px; }
.gp__nav               { width: 206px; }
.gp__control           { display: flex; gap: 20px; }
.gp__control-help      { margin-left: auto; }
.gp__control-admx      { display: flex; gap: 20px; }

.tree-view             { width: 432px; overflow: auto; }
.tree-view__status     { display: flex; flex-direction: column; }

/* other.css */
.modal-gpui            { width: 100%; height: 100vh; }
.modal-gpui .modal-dialog { min-width: 1210px; }
```

## Возможности переписи на PatternFly

### ✅ Что легко переписать

#### 1. **Поля ввода (Form Fields)**

**Текущий код:**
```javascript
// ADMX Template - Boolean
var checkbox = createElement('input', {
  attrs: { type: 'checkbox', disabled: disabled }
});

// ADMX Template - Enum
var select = createElement('select', {
  attrs: { disabled: disabled },
  children: choices.map(choice => /* ... */)
});

// ADMX Template - Text/Number
var input = createElement('input', {
  attrs: { 
    type: parameter.kind === 'decimal' ? 'number' : 'text',
    disabled: disabled
  }
});
```

**На PatternFly:**
```typescript
// PatternFly + React
import { 
  Checkbox, 
  Select, 
  SelectOption, 
  NumberInput,
  TextInput
} from '@patternfly/react-core';

// Boolean
<Checkbox 
  label={parameter.label} 
  isChecked={value} 
  isDisabled={disabled} 
/>

// Enum
<Select
  onSelect={(_, value) => setValue(value as string)}
  selections={selectedValue}
  isDisabled={disabled}
>
  {choices.map(choice => (
    <SelectOption key={choice.value} value={choice.value}>
      {choice.label}
    </SelectOption>
  ))}
</Select>

// Number/Text
<NumberInput
  value={value}
  onChange={(_, val) => setValue(val)}
  min={parameter.min_value}
  max={parameter.max_value}
  isDisabled={disabled}
/>
```

#### 2. **Модальные окна (Modals)**

**Текущий код:**
```javascript
editorDialog.open(host, options) {
  // Custom modal implementation
  // Apply/Cancel buttons
  // Discard confirmation
}
```

**На PatternFly:**
```typescript
import { 
  Modal, 
  ModalVariant, 
  Button, 
  ModalFooter 
} from '@patternfly/react-core';

<Modal
  title="Edit Policy"
  isOpen={isOpen}
  onClose={onClose}
  variant={ModalVariant.medium}
  actions={[
    <Button key="apply" variant="primary" onClick={onApply}>
      Apply
    </Button>,
    <Button key="cancel" variant="link" onClick={onClose}>
      Cancel
    </Button>
  ]}
>
  {/* Modal body content */}
</Modal>
```

#### 3. **Tree View**

**Текущий код:**
```javascript
// Custom tree implementation
function renderTreeViewList(treeData, workspace, treeViewState) {
  // ul > li elements
  // Expand/collapse handlers
  // Selection management
}
```

**На PatternFly:**
```typescript
import { Tree } from '@patternfly/react-tree';

<Tree
  data={treeData}
  onSelect={onSelect}
  onExpand={onExpand}
  aria-label="GPO Tree"
/>
```

**Преимущества PatternFly Tree:**
- Встроенная поддержка ARIA
- Keyboard navigation
- Expand/collapse animations
- Type-safe

#### 4. **Табы (Tabs)**

**Текущий код:**
```javascript
// Custom tab implementation in security dialog
var bar = create('div', { className: 'tab-buttons' });
var buttons = [];
var panels = [];
```

**На PatternFly:**
```typescript
import { Tabs, Tab, TabTitleText } from '@patternfly/react-core';

<Tabs activeKey={activeTab} onSelect={onTabSelect}>
  <Tab eventKey={0} title={<TabTitleText>Settings</TabTitleText>}>
    {/* Settings content */}
  </Tab>
  <Tab eventKey={1} title={<TabTitleText>Explanation</TabTitleText>}>
    {/* Explanation content */}
  </Tab>
</Tabs>
```

#### 5. **Header/Navigation**

**Текущий код:**
```javascript
gp__header
├── gp__search (plain input)
├── gp__nav (plain div)
└── gp__control (plain buttons)
```

**На PatternFly:**
```typescript
import { 
  Toolbar, 
  ToolbarContent, 
  ToolbarItem,
  SearchInput,
  Button
} from '@patternfly/react-core';

<Toolbar>
  <ToolbarContent>
    <ToolbarItem>
      <SearchInput 
        placeholder="Search GPOs" 
        value={searchValue}
        onChange={onSearchChange}
      />
    </ToolbarItem>
    <ToolbarItem>
      <Button onClick={onAdd}>Add</Button>
    </ToolbarItem>
    <ToolbarItem>
      <Button onClick={onEdit}>Edit</Button>
    </ToolbarItem>
  </ToolbarContent>
</Toolbar>
```

#### 6. **Footer**

**Текущий код:**
```javascript
gp__footer with Apply/Cancel buttons
```

**На PatternFly:**
```typescript
import { ModalFooter, Button } from '@patternfly/react-core';

<ModalFooter>
  <Button variant="primary" onClick={onApply}>
    Apply
  </Button>
  <Button variant="link" onClick={onClose}>
    Cancel
  </Button>
</ModalFooter>
```

#### 7. **Tables**

**Текущий код (Preferences):**
```javascript
// Custom table implementation
createElement('table', {
  children: items.map(item => /* ... */)
})
```

**На PatternFly:**
```typescript
import { 
  Table, 
  Thead, 
  Tbody, 
  Tr, 
  Th, 
  Td 
} from '@patternfly/react-table';

<Table variant="compact" aria-label="Preferences Table">
  <Thead>
    <Tr>
      <Th>Name</Th>
      <Th>Value</Th>
      <Th>Status</Th>
    </Tr>
  </Thead>
  <Tbody>
    {items.map((item, index) => (
      <Tr key={index}>
        <Td>{item.name}</Td>
        <Td>{item.value}</Td>
        <Td>{item.status}</Td>
      </Tr>
    ))}
  </Tbody>
</Table>
```

#### 8. **Form Layout**

**Текущий код:**
```javascript
// Custom form layout with divs
createElement('div', { className: 'gp__admx-options' }, [
  inputElement,
  helpText
])
```

**На PatternFly:**
```typescript
import { Form, FormGroup, FormFieldGroup, FormFieldGroupHeader } from '@patternfly/react-core';

<Form>
  <FormGroup label="Policy Setting">
    <Checkbox label="Enable feature" isChecked={value} />
  </FormGroup>
  <FormGroup label="Description">
    <Text content={description} />
  </FormGroup>
</Form>
```

### ⚠️ Что сложно переписать

#### 1. **Совместимость с admix binding**

**Проблема:**
- Существующий редактор напрямую использует `admix` Python binding
- Сложная интеграция с libadmix
- НATIVE code через DBUS

**Решение:**
```typescript
// Оставить admix backend, переписать только UI
// UI взаимодействует через существующий RPC API

import { useAdmixWorkspace } from './hooks/useAdmixWorkspace';

const [workspace, error] = useAdmixWorkspace(policyName);
// Работает с admix внутри
```

#### 2. **Targeting Editor (44935 строк!)**

**Проблема:**
- Огромная сложность логики
- Drag-and-drop
- Вложенные фильтры
- Условия AND/OR

**Решение:**
```typescript
// Использовать PatternFly Tree + Custom components
// Либо создать отдельный library на базе PatternFly

import { Tree, TreeData } from '@patternfly/react-tree';

// Создать custom TargetingEditor component
<TargetingEditor
  target={target}
  onUpdate={onTargetUpdate}
  availableFilters={availableFilters}
/>
```

**Рекомендация:** Не переписывать targeting editor в 1-й итерации. Оставить как-is или создать отдельный mini-library.

#### 3. **Advanced Audit Template**

**Проблема:**
- Сложная структура
- Множественные вкладки
- Дерево настроек

**Решение:**
```typescript
// Разбить на компоненты
<AdvancedAuditEditor>
  <Tabs>
    <Tab label="Policy Settings">
      <AuditTree />
    </Tab>
    <Tab label="Advanced">
      <AuditAdvanced />
    </Tab>
  </Tabs>
</AdvancedAuditEditor>
```

#### 4. **Script Editor (2200+ строк)**

**Проблема:**
- Список скриптов
- Редактор параметров
- Порядок выполнения

**Решение:**
```typescript
// Использовать PatternFly Table + Modal
<ScriptEditor>
  <Table items={scripts} />
  <Modal title="Edit Script" isOpen={showEditor}>
    {/* Script editor form */}
  </Modal>
</ScriptEditor>
```

### 🎯 Рекомендуемая стратегия

#### Phase 1: UI Layer Rewrite (PatternFly + React)

**Приоритет: HIGH**

```typescript
// Новая структура
src/pages/GPO/
├── editor/                  // Новый редактор на PatternFly
│   ├── GPOEditor.tsx       // Main container
│   ├── components/
│   │   ├── Header.tsx
│   │   ├── TreeView.tsx    // PatternFly Tree
│   │   ├── Workspace.tsx
│   │   └── templates/
│   │       ├── AdmxPolicy.tsx
│   │       ├── SecurityPolicy.tsx
│   │       ├── PreferencePolicy.tsx
│   │       └── ScriptPolicy.tsx
│   └── hooks/
│       ├── useAdmixWorkspace.ts
│       └── usePolicyState.ts
└── ...
```

**Что переписать в Phase 1:**
1. ✅ Header (PatternFly Toolbar)
2. ✅ Tree View (PatternFly Tree)
3. ✅ Modal dialogs (PatternFly Modal)
4. ✅ Form fields (PatternFly inputs)
5. ✅ Tabs (PatternFly Tabs)
6. ✅ Tables (PatternFly Table)
7. ✅ Footer (PatternFly ModalFooter)

**Что НЕ переписывать в Phase 1:**
1. ❌ Targeting Editor (слишком сложный)
2. ❌ Advanced Audit (можно оставить)
3. ❌ admix binding (native code)

#### Phase 2: Advanced Components

**Приоритет: MEDIUM**

- Переписать Targeting Editor как отдельная library
- Улучшить Script Editor
- Оптимизировать Performance

#### Phase 3: Testing & Polish

**Приоритет: HIGH**

- Cypress integration tests
- Unit tests for all components
- Accessibility audit
- Performance optimization

### Код-сравнение: До/После

#### Пример 1:ADMXX Template

**До (Vanilla JS):**
```javascript
// plugin/ui/grouppolicy/js/components/templates/admx-template.js
function createParameterControl(parameter, editable) {
  var input;
  var inputElement = null;
  
  if (parameter.kind === 'boolean') {
    var checkbox = createElement('input', {
      attrs: { type: 'checkbox', disabled: disabled ? 'disabled' : null }
    });
    inputElement = checkbox.getElement();
    input = createElement('span', {
      className: 'gpo-editor-boolean',
      children: [checkbox, createElement('label', { /* ... */ })]
    });
  } else if (parameter.kind === 'enum') {
    input = createElement('select', {
      attrs: { disabled: disabled ? 'disabled' : null },
      children: choices.map(choice => /* ... */)
    });
  }
  
  return {
    element: createElement('div', { /* ... */ }),
    read: function() { /* ... */ }
  };
}
```

**После (PatternFly + React):**
```typescript
// src/pages/GPO/editor/components/templates/AdmxPolicy.tsx
interface AdmxParameterProps {
  parameter: Parameter;
  editable: boolean;
  onChange: (value: any) => void;
}

const AdmxParameter: React.FC<AdmxParameterProps> = ({ 
  parameter, 
  editable,
  onChange 
}) => {
  const [value, setValue] = useState(parameter.value);
  
  const handleChange = useCallback((newValue: any) => {
    setValue(newValue);
    onChange(newValue);
  }, [onChange]);
  
  const isDisabled = !editable || parameter.editable === false;
  
  if (parameter.kind === 'boolean') {
    return (
      <Checkbox
        label={parameter.label}
        isChecked={value}
        isDisabled={isDisabled}
        onChange={(_, checked) => handleChange(checked)}
      />
    );
  }
  
  if (parameter.kind === 'enum') {
    return (
      <Select
        onToggle={onToggle}
        onSelect={(_, selected) => {
          const index = choices.findIndex(c => c.value === selected);
          handleChange(index >= 0 ? choices[index].value : null);
        }}
        selections={selectedChoice}
        isDisabled={isDisabled}
      >
        {choices.map(choice => (
          <SelectOption key={choice.value} value={choice.value}>
            {choice.label}
          </SelectOption>
        ))}
      </Select>
    );
  }
  
  if (parameter.kind === 'decimal') {
    return (
      <NumberInput
        value={value}
        onChange={(_, val) => handleChange(val)}
        min={parameter.min_value}
        max={parameter.max_value}
        isDisabled={isDisabled}
      />
    );
  }
  
  // ... остальные типы
};
```

**Преимущества нового подхода:**
- ✅ Type safety (TypeScript)
- ✅ Better performance (React memoization)
- ✅ Accessibility (PatternFly ARIA)
- ✅ Easier testing (pure components)
- ✅ Easier maintenance (clear separation)

#### Пример 2: Modal Dialog

**До (Custom):**
```javascript
editorDialog.open(host, options) {
  // 200+ lines of custom modal logic
  // Custom button handling
  // Custom state management
}
```

**После (PatternFly):**
```typescript
const [isOpen, setIsOpen] = useState(false);
const [dirty, setDirty] = useState(false);

return (
  <>
    <Button onClick={() => setIsOpen(true)}>Edit</Button>
    
    <Modal
      title="Edit Policy"
      isOpen={isOpen}
      onClose={() => {
        if (dirty) {
          // Show confirmation
        } else {
          setIsOpen(false);
        }
      }}
      actions={[
        <Button 
          key="apply" 
          variant="primary" 
          onClick={onApply}
          isDisabled={!dirty}
        >
          Apply
        </Button>,
        <Button 
          key="cancel" 
          variant="link"
          onClick={() => setIsOpen(false)}
        >
          Cancel
        </Button>
      ]}
    >
      <Form>
        {/* Form fields */}
      </Form>
    </Modal>
  </>
);
```

### Дополнительные преимущества PatternFly

#### 1. **Accessibility**

```typescript
// PatternFly автоматически добавляет ARIA attributes
<Checkbox label="Enable feature" />
// → <input aria-label="Enable feature" />

<Table aria-label="GPO List" />
// → <table aria-label="GPO List" />
```

#### 2. **Responsive Design**

```css
/* PatternFly встроенная responsive */
@media (max-width: 768px) {
  .pf-c-toolbar {
    flex-direction: column;
  }
}
```

#### 3. **Dark Mode Support**

```typescript
// PatternFly поддерживает dark mode из коробки
<Provider theme={darkTheme}>
  <GPOEditor />
</Provider>
```

#### 4. **Icon Library**

```typescript
import { 
  PlusIcon, 
  EditIcon, 
  TrashIcon, 
  SaveIcon 
} from '@patternfly/react-icons';

<Button icon={<PlusIcon />}>Add</Button>
```

#### 5. **Keyboard Navigation**

PatternFly компоненты уже имеют:
- Tab navigation
- Arrow keys for select/dropdown
- Enter/Space for actions
- Escape to close modals

### Миграционный план

#### Week 1-2: Core UI

```bash
# День 1-2: Setup
- Create new PatternFly + React project structure
- Setup TypeScript configuration
- Install PatternFly dependencies

# День 3-5: Basic components
- Rewrite Header (Toolbar)
- Rewrite TreeView (PatternFly Tree)
- Rewrite Modal system (PatternFly Modal)
```

#### Week 3-4: Templates

```bash
# День 1-2: Form fields
- All input types (Checkbox, Select, NumberInput, TextInput)
- Validation and error handling

# День 3-4: Policy templates
- AdmxPolicy component
- SecurityPolicy component
- ScriptPolicy component (basic)
```

#### Week 5: Advanced Features

```bash
# День 1-2: Workspaces
- Workspace rendering
- State management
- Persistence

# День 3-5: Testing
- Unit tests
- Integration tests
- Accessibility audit
```

### Тестирование

#### Unit Tests

```typescript
// __tests__/AdmxPolicy.test.tsx
describe('AdmxPolicy', () => {
  it('renders boolean field correctly', () => {
    render(<AdmxParameter parameter={booleanParam} editable />);
    expect(screen.getByRole('checkbox')).toBeInTheDocument();
  });
  
  it('calls onChange when value changes', () => {
    const onChange = jest.fn();
    render(<AdmxParameter parameter={param} editable onChange />);
    fireEvent.click(screen.getByRole('checkbox'));
    expect(onChange).toHaveBeenCalledWith(true);
  });
});
```

#### Integration Tests (Cypress)

```gherkin
Feature: GPO Editor PatternFly

  Scenario: User can edit boolean policy
    Given the GPO editor is open
    When the user clicks the "Enable feature" checkbox
    Then the policy state should be "enabled"
    And the "Apply" button should be enabled

  Scenario: User can cancel changes
    Given the GPO editor is open with unsaved changes
    When the user clicks "Cancel"
    And confirms discard
    Then the changes should be discarded
```

### Заключение

**Вопрос:** Можно ли переписать GPO editor используя PatternFly?

**Ответ:** ✅ **ДА, и это рекомендуется!**

**ПочемуPatternFly:**
1. ✅ Уже используется в freeipa-webui
2. ✅ Согласованность UI/UX
3. ✅ Type safety (TypeScript)
4. ✅ Accessibility (ARIA)
5. ✅ Better maintenance
6. ✅ Easier testing

**Стратегия:**
1. **Phase 1:** Переписать UI layer (Header, Tree, Modals, Forms)
2. **Phase 2:** Улучшить сложные компоненты (Targeting, Audit)
3. **Phase 3:** Testing & Polish

**Риск:** Targeting Editor (44935 строк) — оставить как-is или создать отдельную library

**Потенциальный выигрыш:**
- 🔥 50-70% меньше кода
- 🔥 Легче поддерживать
- 🔥 Легче тестировать
- 🔥 Лучшая accessibility
- 🔥 Консистентный UI с freeipa-webui

**Следующие шаги:**
1. Создать PoC (Proof of Concept)
2. Переписать один шаблон (например, AdmxPolicy)
3. Тестирование
4. Масштабирование на остальные компоненты
