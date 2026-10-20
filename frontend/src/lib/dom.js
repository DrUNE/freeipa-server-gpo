/**
 * Minimal DOM helpers for components written in the "component = function returning an element" style
 * (see components/EditorStatus). Strings become text nodes, never HTML.
 */

/** @typedef {Node | string | null | undefined | false} Child */

/**
 * Creates an element with attributes and children. `null`, `undefined` and `false` children are skipped,
 * so conditional parts can be written inline: `cond && h('p', {}, 'text')`.
 * @template {keyof HTMLElementTagNameMap} K
 * @param {K} tag
 * @param {Record<string, string | boolean | null | undefined>} [attrs] `class` takes a string; a falsy value omits the attribute.
 * @param {...Child} children
 * @returns {HTMLElementTagNameMap[K]}
 */
export function h(tag, attrs = {}, ...children) {
    const element = document.createElement(tag);
    for (const [name, value] of Object.entries(attrs)) {
        if (value === false || value === null || value === undefined) continue;
        element.setAttribute(name, value === true ? '' : value);
    }
    element.append(
        .../** @type {(Node | string)[]} */ (
            children.filter(child => child !== null && child !== undefined && child !== false)
        )
    );
    return element;
}

/**
 * Joins class names, skipping falsy values.
 * @param {...(string | false | null | undefined)} names
 */
export function cx(...names) {
    return names.filter(Boolean).join(' ');
}
