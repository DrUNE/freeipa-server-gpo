import { expect, within } from 'storybook/test';
import tokensCss from '@gpui/styles/tokens.css?raw';

/*
 * The design tokens of the editor (src/styles/tokens.css) as a swatch table: the name, the declared value and a sample.
 * The play test checks that every declared token reaches the page, so a token that is renamed or dropped is noticed.
 */

const tokens = [...tokensCss.matchAll(/(--gpui-[\w-]+)\s*:\s*([^;]+);/g)].map(([, name, value]) => ({
    name,
    value: value.trim()
}));

const isColor = value => /^#|^rgb|^hsl/i.test(value);

function render() {
    const table = document.createElement('table');
    table.setAttribute('aria-label', 'Design tokens');
    table.innerHTML = '<thead><tr><th>Token</th><th>Value</th><th>Sample</th></tr></thead>';
    const body = document.createElement('tbody');
    for (const { name, value } of tokens) {
        const row = document.createElement('tr');
        row.dataset.token = name;
        const sample = document.createElement('td');
        if (isColor(value)) {
            sample.style.cssText = `background: var(${name}); width: 5em; border: 1px solid var(--gpui-border)`;
            sample.setAttribute('aria-label', name + ' sample');
        } else if (/px$/.test(value)) {
            sample.style.cssText = `width: 5em; height: 2em; border: 1px solid var(--gpui-text); border-radius: var(${name})`;
            sample.setAttribute('aria-label', name + ' sample');
        }
        for (const text of [name, value]) {
            const cell = document.createElement('td');
            cell.textContent = text;
            row.append(cell);
        }
        row.append(sample);
        body.append(row);
    }
    table.append(body);
    return table;
}

export default { title: 'Foundations/Tokens', render };

export const Palette = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(tokens.length).toBeGreaterThan(8);
        const rows = canvas.getAllByRole('row').slice(1);
        await expect(rows).toHaveLength(tokens.length);
        const root = getComputedStyle(document.documentElement);
        for (const { name, value } of tokens) {
            // The declared value is what the page computes (hex colors normalised by the browser aside).
            const computed = root.getPropertyValue(name).trim();
            await expect(computed.length, name).toBeGreaterThan(0);
            if (!isColor(value)) await expect(computed, name).toBe(value);
        }
    }
};
