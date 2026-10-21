import { expect, fn, userEvent, within } from 'storybook/test';
import { createDataTable, rowId, setSelectedRows, tableRows } from '@gpui/components/DataTable/DataTable';

const columns = [
    { id: 'name', label: 'Name' },
    { id: 'size', label: 'Size' }
];

const files = [
    { id: 'logon.cmd', size: '128 bytes' },
    { id: 'drives.ps1', size: '2 KB' },
    { id: 'a-very-long-name-that-has-to-wrap-or-be-cut-somewhere-sensible-startup-script.cmd', size: '12 bytes' }
];

/** A host with the editor's root class, as the templates mount it. */
function mount(table) {
    const host = document.createElement('div');
    host.className = 'gp__container gp__preference';
    host.append(table);
    return host;
}

/** A table whose rows select themselves the way the screens do: single selection, or several with Ctrl. */
function render({ rows = files, multiple = false, onActivate }) {
    const selected = new Set();
    const table = createDataTable({
        label: 'Files',
        columns,
        multiple,
        emptyText: 'No files.',
        className: 'preference__table gpo-catalog-table',
        rows: rows.map(file => ({
            id: file.id,
            cells: [file.id, file.size],
            onClick: event => {
                if (!(multiple && event.ctrlKey)) selected.clear();
                if (selected.has(file.id) && multiple) selected.delete(file.id);
                else selected.add(file.id);
                setSelectedRows(table, selected);
            },
            onDoubleClick: () => onActivate && onActivate(file.id)
        }))
    });
    return mount(table);
}

export default { title: 'Primitives/DataTable', args: { onActivate: fn() }, render };

export const Default = {
    play: async ({ canvasElement }) => {
        const table = within(canvasElement).getByRole('table', { name: 'Files' });
        await expect(table).toHaveAttribute('data-table');
        await expect(
            within(table)
                .getAllByRole('columnheader')
                .map(header => header.textContent)
        ).toEqual(['Name', 'Size']);
        const rows = tableRows(table);
        await expect(rows.map(rowId)).toEqual(files.map(file => file.id));
        // Nothing is selected, and every row can take the focus from the keyboard navigation.
        await expect(rows.map(row => row.getAttribute('aria-selected'))).toEqual(['false', 'false', 'false']);
        await expect(rows.map(row => row.tabIndex)).toEqual([-1, -1, -1]);
        await expect(table).not.toHaveAttribute('data-table-multiple');
    }
};

export const SingleSelection = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const first = canvas.getByRole('row', { name: /logon\.cmd/ });
        const second = canvas.getByRole('row', { name: /drives\.ps1/ });
        await userEvent.click(first);
        await expect(first).toHaveAttribute('aria-selected', 'true');
        await expect(first).toHaveClass('active');
        await userEvent.click(second);
        await expect(first).toHaveAttribute('aria-selected', 'false');
        await expect(first).not.toHaveClass('active');
        await expect(second).toHaveAttribute('aria-selected', 'true');
    }
};

export const MultipleSelection = {
    args: { multiple: true },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.getByRole('table', { name: 'Files' })).toHaveAttribute('data-table-multiple');
        const [first, second, third] = tableRows(canvasElement.querySelector('table'));
        await userEvent.click(first);
        // A click with Ctrl held (dispatched, so that it does not depend on how the browser tracks held keys).
        third.dispatchEvent(new MouseEvent('click', { bubbles: true, ctrlKey: true }));
        await expect([first, second, third].map(row => row.getAttribute('aria-selected'))).toEqual([
            'true',
            'false',
            'true'
        ]);
    }
};

export const DoubleClick = {
    play: async ({ canvasElement, args }) => {
        await userEvent.dblClick(within(canvasElement).getByRole('row', { name: /drives\.ps1/ }));
        await expect(args.onActivate).toHaveBeenCalledWith('drives.ps1');
    }
};

export const Empty = {
    args: { rows: [] },
    play: async ({ canvasElement }) => {
        const table = within(canvasElement).getByRole('table', { name: 'Files' });
        await expect(tableRows(table)).toHaveLength(0);
        const empty = table.querySelector('[data-table-empty]');
        await expect(empty).toHaveTextContent('No files.');
        // The message spans all columns.
        await expect(empty.firstElementChild).toHaveAttribute('colspan', '2');
    }
};

export const SelectionFromOutside = {
    play: async ({ canvasElement }) => {
        const table = canvasElement.querySelector('table');
        setSelectedRows(table, ['drives.ps1']);
        const rows = tableRows(table);
        await expect(rows.map(row => row.getAttribute('aria-selected'))).toEqual(['false', 'true', 'false']);
        setSelectedRows(table, []);
        await expect(rows.map(row => row.classList.contains('active'))).toEqual([false, false, false]);
    }
};
