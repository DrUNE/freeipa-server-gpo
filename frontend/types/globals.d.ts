// The editor attaches ad-hoc members (cleanup, applyChanges, hasUnsavedChanges, ...)
// to ElementCreator instances and to their DOM elements; model both as open records
// until those contracts are replaced by explicit types.
type ElementCreator = import('../src/util/element-creator.js').ElementCreator & Record<string, any>;
type GpuiElement = HTMLElement & Record<string, any>;
type GpuiCreator = ElementCreator;

// Transitional: the editor treats querySelector results as form controls
// without narrowing. This overload takes precedence over lib.dom's Element.
interface ParentNode {
    querySelector(selectors: string): GpuiElement;
}
