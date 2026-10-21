/**
 * In-memory fixture backend for the GPUI editor.
 *
 * Implements the `gpo_editor_*` JSON-RPC methods that
 * frontend/src/util/API.js calls, with the response shapes of
 * plugin/ipaserver/plugins/gpo.py.  State lives in process memory; restart the
 * server or POST /__dev/reset to start over.
 */

function clone(value) {
    return value === undefined ? undefined : JSON.parse(JSON.stringify(value));
}

class RpcError extends Error {
    constructor(message, extra) {
        super(message);
        Object.assign(this, { name: 'CommandError', code: 3007 }, extra || {});
    }
}

/* ---------------------------------------------------------------- fixtures */

function gpoEnvelope(displayname) {
    return {
        gpo: {
            displayname: displayname,
            guid: '{6AC1786C-016F-11D2-945F-00C04FB984F9}',
            distinguished_name: 'cn={6AC1786C-016F-11D2-945F-00C04FB984F9},cn=Policies,cn=System,dc=ipa,dc=test'
        },
        snapshot: {
            identity: {
                guid: '{6AC1786C-016F-11D2-945F-00C04FB984F9}',
                distinguished_name: 'cn={6AC1786C-016F-11D2-945F-00C04FB984F9},cn=Policies,cn=System,dc=ipa,dc=test'
            },
            version_number: 7,
            machine_extension_names: '',
            user_extension_names: ''
        },
        template: { revision: 'dev-fixture', diagnostics: [] },
        security_catalog_status: null,
        locales: ['ru-RU', 'en-US'],
        diagnostics: [],
        pending_publication: null
    };
}

function preferenceDocuments() {
    const system = { category_id: 'system_settings', category_label: null, category_order: 1 };
    const control = { category_id: 'control_panel_settings', category_label: null, category_order: 2 };
    const docs = [];
    for (const scope of ['computer', 'user']) {
        docs.push(
            { scope, kind: 'registry', label: 'Registry', editable: true, display_order: 1, ...system },
            { scope, kind: 'files', label: 'Files', editable: true, display_order: 2, ...system },
            { scope, kind: 'folders', label: 'Folders', editable: true, display_order: 3, ...system },
            { scope, kind: 'ini_files', label: 'Ini Files', editable: true, display_order: 4, ...system },
            { scope, kind: 'environment_variables', label: 'Environment', editable: true, display_order: 5, ...system },
            { scope, kind: 'scheduled_tasks', label: 'Scheduled Tasks', editable: true, display_order: 1, ...control }
        );
    }
    return docs;
}

function policyNode(id, label) {
    return { kind: 'policy', id, label };
}
function categoryNode(id, label) {
    return { kind: 'category', id, label };
}

/* Catalog tree: categoryId → children.  `null` is the root. */
function catalogTree(scope) {
    const machineOnly = scope === 'computer';
    return {
        null: [
            categoryNode('alt', 'ALT Linux'),
            categoryNode('system', machineOnly ? 'System' : 'Desktop'),
            categoryNode('empty', 'Empty category'),
            policyNode('root-policy', 'Root level policy')
        ],
        alt: [
            categoryNode('alt-packages', 'Package management'),
            categoryNode('alt-security', 'Security'),
            policyNode('alt-banner', 'Login banner text')
        ],
        'alt-packages': [
            policyNode('alt-install', 'Install packages'),
            policyNode('alt-remove', 'Remove packages'),
            policyNode('alt-repo', 'Package repository')
        ],
        'alt-security': [
            policyNode('alt-devices', 'Allowed security devices'),
            policyNode('alt-raw', 'Policy with preserved raw value')
        ],
        system: [policyNode('sys-timeout', 'Session timeout'), policyNode('sys-mode', 'Processing mode')],
        empty: []
    };
}

function catalogIndex(scope) {
    const tree = catalogTree(scope);
    const policies = [];
    const walk = (categoryId, path) => {
        for (const node of tree[categoryId] || []) {
            if (node.kind === 'category') walk(node.id, path.concat(node.label));
            else policies.push({ id: node.id, label: node.label, path });
        }
    };
    walk(null, []);
    return policies;
}

function stateActions(overrides) {
    return Object.assign(
        {
            enabled: { available: true, mode: 'dynamic_list_values', requires_parameters: true },
            disabled: { available: true, mode: 'clear_list_values', requires_parameters: false },
            not_configured: { available: true, mode: 'remove_owned_records', requires_parameters: false }
        },
        overrides || {}
    );
}

const capabilities = {
    enable: true,
    disable: true,
    clear: true,
    inspect_parameters: true,
    edit_parameters: true,
    edit_comments: true
};

function dword(value) {
    return { kind: 'registry', value: { kind: 'dword', value } };
}

function policyDefinition(scope, id) {
    const base = {
        scope,
        policy_id: id,
        state: 'not_configured',
        comment: null,
        capabilities: clone(capabilities),
        state_actions: stateActions(),
        supported_on: 'ALT systems\nGroup Policy client',
        explain_text: 'Fixture policy served by frontend/dev/backend.mjs.\n\nEdit the fixture to change this text.'
    };
    const simple = (label, parameters) => Object.assign(base, { label, parameters });

    switch (id) {
        case 'alt-install':
            return simple('Install packages', [
                {
                    id: 'InstallPackagesList',
                    label: 'Packages',
                    kind: 'list',
                    editable: true,
                    collection: {
                        mode: 'list',
                        unique_keys: true,
                        key_case_sensitive: false,
                        allow_empty_values: false,
                        min_items: 1
                    },
                    value: null,
                    default_value: { kind: 'text_list', value: ['vim', 'git'] }
                }
            ]);
        case 'alt-remove':
            return simple('Remove packages', [
                {
                    id: 'RemovePackagesList',
                    label: 'Packages',
                    kind: 'list',
                    editable: true,
                    collection: {
                        mode: 'list',
                        unique_keys: true,
                        key_case_sensitive: false,
                        allow_empty_values: false,
                        min_items: 1
                    },
                    value: null,
                    default_value: { kind: 'text_list', value: [] }
                }
            ]);
        case 'alt-devices':
            return simple('Allowed security devices', [
                {
                    id: 'Devices',
                    label: 'Security devices',
                    kind: 'list',
                    editable: true,
                    collection: {
                        mode: 'key_value',
                        unique_keys: true,
                        key_case_sensitive: false,
                        allow_empty_values: true,
                        min_items: 1
                    },
                    value: null,
                    default_value: {
                        kind: 'key_value_list',
                        value: [{ key: 'OpenSC', value: 'C:\\modules\\opensc.dll' }]
                    }
                }
            ]);
        case 'alt-repo':
            return simple('Package repository', [
                {
                    id: 'url',
                    label: 'Repository URL',
                    kind: 'text',
                    editable: true,
                    required: true,
                    value: null,
                    default_value: { kind: 'text', value: 'http://ftp.altlinux.org/pub/distributions/ALTLinux' }
                },
                {
                    id: 'enabled',
                    label: 'Enable repository',
                    kind: 'boolean',
                    editable: true,
                    value: null,
                    default_value: { kind: 'boolean', value: true }
                }
            ]);
        case 'alt-raw':
            return Object.assign(
                simple('Policy with preserved raw value', [
                    {
                        id: 'raw',
                        label: 'Preserved raw value',
                        kind: 'text',
                        editable: false,
                        value: { kind: 'unsupported', value: { type: 'binary', value: [0, 255] } }
                    }
                ]),
                { state: 'unknown_raw_values' }
            );
        case 'sys-timeout':
            return simple('Session timeout', [
                {
                    id: 'limit',
                    label: 'Timeout, minutes',
                    kind: 'decimal',
                    editable: true,
                    min_value: 1,
                    max_value: 1440,
                    value: null,
                    default_value: { kind: 'integer', value: 20 }
                }
            ]);
        case 'sys-mode':
            return simple('Processing mode', [
                {
                    id: 'mode',
                    label: 'Mode',
                    kind: 'enum',
                    editable: true,
                    value: null,
                    choices: [
                        { label: 'Automatic', value: dword(1) },
                        { label: 'Manual', value: dword(2) },
                        { label: 'Disabled', value: dword(0) }
                    ],
                    default_value: dword(1)
                }
            ]);
        case 'alt-banner':
            return simple('Login banner text', [
                {
                    id: 'text',
                    label: 'Banner',
                    kind: 'text',
                    editable: true,
                    value: null,
                    default_value: { kind: 'text', value: 'Authorized access only' }
                }
            ]);
        case 'root-policy':
            return Object.assign(simple('Root level policy', []), {
                state_actions: stateActions({
                    enabled: { available: true, mode: 'static_values', requires_parameters: false }
                })
            });
        default:
            return null;
    }
}

function preferenceItem(kind, index) {
    const labels = {
        registry: ['HKLM\\Software\\Example', 'HKCU\\Software\\Other'],
        files: ['Example file', 'Second file'],
        folders: ['Shared folder'],
        ini_files: ['app.ini'],
        environment_variables: ['PATH'],
        scheduled_tasks: ['Nightly backup']
    };
    const label = (labels[kind] || ['Item'])[index];
    return label === undefined ? null : { identity: [kind, 'opaque-' + index], label, has_filters: index === 0 };
}

function field(id, label, kind, value, required) {
    return { id, label, value: { kind, value }, editable: true, required: !!required };
}

function preferenceDetail(kind, identity) {
    const commonFilterFields = () => [
        field('filter.bool', 'Operator', 'filter_combine', 'and'),
        field('filter.not', 'Not', 'boolean', false)
    ];
    const fileFilterFields = value => commonFilterFields().concat(field('filter.path', 'Path', 'text', value, true));

    const fields = [
        field('properties.action', 'Action', 'action', 'update'),
        field('properties.fromPath', 'Source', 'text', 'source.txt'),
        field('properties.targetPath', 'Target', 'text', '/etc/example.conf', true),
        field('metadata.desc', 'Description', 'text', 'Fixture item'),
        field('metadata.bypassErrors', 'Bypass errors', 'boolean', false),
        field('metadata.removePolicy', 'Remove when no longer applied', 'boolean', false),
        field('properties.disabled', 'Disabled', 'boolean', false)
    ];
    const isNew = identity === null || identity === undefined;
    const item = isNew ? null : { identity, label: 'Example ' + kind, has_filters: true };
    return {
        item,
        fields,
        new_item_fields: fields,
        filters: isNew
            ? []
            : [
                  {
                      path: [0],
                      kind: 'collection',
                      label: 'Primary Collection',
                      supports_children: true,
                      child_count: 1
                  },
                  {
                      path: [0, 0],
                      kind: 'file',
                      label: 'File match',
                      detail: 'alpha.cmd',
                      supports_children: false,
                      child_count: 0
                  },
                  {
                      path: [1],
                      kind: 'file',
                      label: 'File match',
                      detail: 'root.cmd',
                      supports_children: false,
                      child_count: 0
                  }
              ],
        filter_fields: isNew
            ? []
            : [
                  { path: [0], fields: commonFilterFields(), available: true },
                  { path: [0, 0], fields: fileFilterFields('alpha.cmd'), available: true },
                  { path: [1], fields: fileFilterFields('root.cmd'), available: true }
              ],
        filter_kinds: [
            { kind: 'collection', label: 'Collection', supports_children: true, fields: commonFilterFields() },
            { kind: 'file', label: 'File match', supports_children: false, fields: fileFilterFields('') }
        ],
        parent_candidates: [{ identity: null, label: 'Root', parent_identity: null, depth: 0 }]
    };
}

function scriptsFixture(scope, event) {
    return {
        scope,
        event,
        execution_order: 'unspecified',
        assets: [
            {
                name: 'hello.sh',
                byte_size: 32,
                revision: 'r1',
                references: [{ event, executable_group: 'classic', index: 0 }]
            },
            { name: 'unused.ps1', byte_size: 12, revision: 'r1', references: [] }
        ],
        classic: {
            editable: true,
            entries: [
                {
                    identity: 'entry-0',
                    command_line: 'hello.sh',
                    parameters: '--verbose',
                    kind: 'managed_asset',
                    managed_asset_name: 'hello.sh'
                }
            ],
            snapshot: {},
            diagnostics: []
        },
        powershell: { editable: true, entries: [], snapshot: {}, diagnostics: [] },
        upload_limit_bytes: 16 * 1024 * 1024
    };
}

function securityCatalog() {
    return {
        semantic_revision: 'dev-fixture',
        categories: [
            { namespace: 'fixture', id: 'account', display_name: 'Account Policies' },
            { namespace: 'fixture', id: 'local', display_name: 'Local Policies' }
        ],
        policies: [
            {
                namespace: 'fixture',
                policy_id: 'min-password-length',
                display_name: 'Minimum password length',
                category: ['fixture', 'account'],
                elements: [{ id: 'value', value_type: 'integer' }]
            },
            {
                namespace: 'fixture',
                policy_id: 'lockout',
                display_name: 'Account lockout threshold',
                category: ['fixture', 'account'],
                elements: [{ id: 'value', value_type: 'integer' }]
            },
            {
                namespace: 'fixture',
                policy_id: 'audit-logon',
                display_name: 'Audit logon events',
                category: ['fixture', 'local'],
                elements: [{ id: 'enabled', value_type: 'boolean' }]
            }
        ]
    };
}

/* ------------------------------------------------------------------- state */

function createState() {
    return {
        policies: {}, // `${scope}:${id}` → policy with user edits
        preferenceItems: {}, // `${scope}:${kind}` → items array
        securitySnapshots: {},
        auditRows: [],
        scripts: {} // `${scope}:${event}` → scripts fixture
    };
}

let state = createState();

function reset() {
    state = createState();
}

function policyFor(scope, id) {
    const key = scope + ':' + id;
    if (!state.policies[key]) {
        const definition = policyDefinition(scope, id);
        if (!definition)
            throw new RpcError('Unknown policy "' + id + '"', { name: 'NotFound', code: 4001, category: 'not_found' });
        state.policies[key] = definition;
    }
    return state.policies[key];
}

function itemsFor(scope, kind) {
    const key = scope + ':' + kind;
    if (!state.preferenceItems[key]) {
        const items = [];
        for (let index = 0; ; index += 1) {
            const item = preferenceItem(kind, index);
            if (!item) break;
            items.push(item);
        }
        state.preferenceItems[key] = items;
    }
    return state.preferenceItems[key];
}

function scriptsFor(scope, event) {
    const key = scope + ':' + event;
    if (!state.scripts[key]) state.scripts[key] = scriptsFixture(scope, event);
    return state.scripts[key];
}

function securityResult() {
    return {
        security_catalog: securityCatalog(),
        security_snapshot: { policies: Object.values(state.securitySnapshots), diagnostics: [] }
    };
}

/* ----------------------------------------------------------------- methods */

const methods = {
    gpo_editor_open(displayname) {
        return Object.assign(gpoEnvelope(displayname), { preference_documents: preferenceDocuments() });
    },

    gpo_editor_children(displayname, scope, options) {
        const categoryId = options.category_id === undefined ? null : options.category_id;
        const tree = catalogTree(scope);
        if (!(categoryId in tree))
            throw new RpcError('Unknown category "' + categoryId + '"', { category: 'not_found' });
        return Object.assign(gpoEnvelope(displayname), { children: tree[categoryId] });
    },

    gpo_editor_policy_index(displayname, scope) {
        return Object.assign(gpoEnvelope(displayname), { policies: catalogIndex(scope) });
    },

    gpo_editor_policy_show(displayname, scope, policyId) {
        const policy = clone(policyFor(scope, policyId));
        // Fields of the real answer that the editor does not read but that belong to the contract.
        policy.representability = policy.representability || { enabled: true };
        policy.unknown_raw_values = policy.state === 'unknown_raw_values';
        for (const parameter of policy.parameters || []) parameter.choices = parameter.choices || [];
        return Object.assign(gpoEnvelope(displayname), { policy });
    },

    gpo_editor_policy_update(displayname, scope, policyId, options) {
        const request = options.request || {};
        const policy = policyFor(scope, policyId);
        if (request.state) policy.state = request.state;
        for (const update of request.set_parameters || []) {
            const parameter = policy.parameters.find(entry => entry.id === update.parameter_id);
            if (!parameter)
                throw new RpcError('Unknown parameter "' + update.parameter_id + '"', {
                    category: 'validation',
                    field: update.parameter_id
                });
            parameter.value = update.value;
        }
        if (request.state === 'not_configured')
            policy.parameters.forEach(parameter => {
                parameter.value = null;
            });
        if (request.comment) {
            policy.comment =
                request.comment.action === 'clear' ? null : { source: 'embedded', text: request.comment.text || '' };
        }
        return Object.assign(gpoEnvelope(displayname), { policy: clone(policy), publication: { changed: true } });
    },

    gpo_editor_preference_documents(displayname) {
        return Object.assign(gpoEnvelope(displayname), { documents: preferenceDocuments() });
    },

    gpo_editor_preference_items(displayname, scope, kind) {
        return Object.assign(gpoEnvelope(displayname), { items: clone(itemsFor(scope, kind)) });
    },

    gpo_editor_preference_show(displayname, scope, kind, options) {
        const identity = (options.request || {}).identity;
        return Object.assign(
            gpoEnvelope(displayname),
            preferenceDetail(kind, identity === undefined ? null : identity)
        );
    },

    gpo_editor_preference_create(displayname, scope, kind, options) {
        const items = itemsFor(scope, kind);
        const request = options.request || {};
        const labelField = (request.fields || []).find(entry => /targetPath|desc|label/.test(entry.id));
        const label = (labelField && labelField.value && labelField.value.value) || 'New ' + kind + ' item';
        const item = { identity: [kind, 'opaque-' + Date.now()], label, has_filters: false };
        items.push(item);
        // Like the real command, answer with the detail of the item that was written.
        return Object.assign(gpoEnvelope(displayname), preferenceDetail(kind, item.identity), {
            item: clone(item),
            publication: { changed: true }
        });
    },

    gpo_editor_preference_update(displayname, scope, kind, options) {
        const request = options.request || {};
        const items = itemsFor(scope, kind);
        const item =
            items.find(entry => JSON.stringify(entry.identity) === JSON.stringify(request.identity)) || items[0];
        return Object.assign(gpoEnvelope(displayname), preferenceDetail(kind, item.identity), {
            item: clone(item),
            publication: { changed: true }
        });
    },

    gpo_editor_preference_delete(displayname, scope, kind, options) {
        const identity = (options.request || {}).identity;
        const key = scope + ':' + kind;
        state.preferenceItems[key] = itemsFor(scope, kind).filter(
            entry => JSON.stringify(entry.identity) !== JSON.stringify(identity)
        );
        return Object.assign(gpoEnvelope(displayname), { deleted_identity: identity, publication: { changed: true } });
    },

    gpo_editor_scripts_show(displayname, scope, event) {
        return Object.assign(gpoEnvelope(displayname), { scripts: clone(scriptsFor(scope, event)) });
    },

    gpo_editor_script_files(displayname, scope, event) {
        // The real command answers with the whole event view, like scripts_show.
        return Object.assign(gpoEnvelope(displayname), { scripts: clone(scriptsFor(scope, event)) });
    },

    gpo_editor_script_entry_add(displayname, scope, event, options) {
        const request = options.request || {};
        const scripts = scriptsFor(scope, event);
        const group = scripts[request.executable_group || 'classic'];
        group.entries.push({
            identity: 'entry-' + Date.now(),
            command_line: request.name,
            parameters: request.parameters || '',
            kind: 'managed_asset',
            managed_asset_name: request.name
        });
        const asset = scripts.assets.find(entry => entry.name === request.name);
        if (asset)
            asset.references.push({
                event,
                executable_group: request.executable_group || 'classic',
                index: group.entries.length - 1
            });
        return Object.assign(gpoEnvelope(displayname), { scripts: clone(scripts), publication: { changed: true } });
    },

    gpo_editor_script_entry_update(displayname, scope, event, options) {
        const request = options.request || {};
        const scripts = scriptsFor(scope, event);
        for (const group of [scripts.classic, scripts.powershell]) {
            const entry = group.entries.find(candidate => candidate.identity === request.identity);
            if (entry)
                Object.assign(entry, {
                    parameters: request.parameters === undefined ? entry.parameters : request.parameters
                });
        }
        return Object.assign(gpoEnvelope(displayname), { scripts: clone(scripts), publication: { changed: true } });
    },

    gpo_editor_script_entry_remove(displayname, scope, event, options) {
        const request = options.request || {};
        const scripts = scriptsFor(scope, event);
        for (const group of [scripts.classic, scripts.powershell]) {
            group.entries = group.entries.filter(entry => entry.identity !== request.identity);
        }
        return Object.assign(gpoEnvelope(displayname), { scripts: clone(scripts), publication: { changed: true } });
    },

    gpo_editor_script_entries_reorder(displayname, scope, event, options) {
        const request = options.request || {};
        const scripts = scriptsFor(scope, event);
        const group = scripts[request.executable_group || 'classic'];
        if (Array.isArray(request.order)) {
            group.entries.sort(
                (left, right) => request.order.indexOf(left.identity) - request.order.indexOf(right.identity)
            );
        }
        return Object.assign(gpoEnvelope(displayname), { scripts: clone(scripts), publication: { changed: true } });
    },

    gpo_editor_script_order_update(displayname, scope, event, options) {
        const scripts = scriptsFor(scope, event);
        scripts.execution_order = (options.request || {}).execution_order || scripts.execution_order;
        return Object.assign(gpoEnvelope(displayname), { scripts: clone(scripts), publication: { changed: true } });
    },

    gpo_editor_script_asset_upload(displayname, scope, event, options) {
        const request = options.request || {};
        const scripts = scriptsFor(scope, event);
        scripts.assets.push({
            name: request.name,
            byte_size: Buffer.from(request.content_base64 || '', 'base64').length,
            revision: 'r' + Date.now(),
            references: []
        });
        return Object.assign(gpoEnvelope(displayname), { scripts: clone(scripts), publication: { changed: true } });
    },

    gpo_editor_script_upload_and_add(displayname, scope, event, options) {
        methods.gpo_editor_script_asset_upload(displayname, scope, event, options);
        return methods.gpo_editor_script_entry_add(displayname, scope, event, options);
    },

    gpo_editor_script_asset_replace(displayname, scope, event, options) {
        const request = options.request || {};
        const scripts = scriptsFor(scope, event);
        const asset = scripts.assets.find(entry => entry.name === request.name);
        if (asset)
            Object.assign(asset, {
                byte_size: Buffer.from(request.content_base64 || '', 'base64').length,
                revision: 'r' + Date.now()
            });
        return Object.assign(gpoEnvelope(displayname), { scripts: clone(scripts), publication: { changed: true } });
    },

    gpo_editor_script_asset_delete(displayname, scope, event, options) {
        const request = options.request || {};
        const scripts = scriptsFor(scope, event);
        scripts.assets = scripts.assets.filter(entry => entry.name !== request.name);
        return Object.assign(gpoEnvelope(displayname), { scripts: clone(scripts), publication: { changed: true } });
    },

    gpo_editor_script_asset_download(displayname, scope, event, options) {
        const request = options.request || {};
        const content = Buffer.from('#!/bin/sh\necho "' + request.name + '"\n');
        return Object.assign(gpoEnvelope(displayname), {
            asset: {
                name: request.name,
                revision: request.revision || 'r1',
                byte_size: content.length,
                content_base64: content.toString('base64')
            }
        });
    },

    gpo_editor_reconcile(displayname) {
        return Object.assign(gpoEnvelope(displayname), { recovery: { kind: 'clean', plan: null, conflict: null } });
    },

    gpo_editor_security_definitions_show(displayname) {
        return Object.assign(gpoEnvelope(displayname), securityResult());
    },

    gpo_editor_security_definitions_update(displayname, options) {
        const request = options.request || options || {};
        for (const update of request.policies || []) {
            const before = state.securitySnapshots[update.policy_id] || {
                namespace: update.namespace,
                policy_id: update.policy_id,
                state: 'defined',
                elements: {}
            };
            if (update.transition) before.state = update.transition === 'define' ? 'defined' : 'undefined';
            for (const element of update.elements || []) {
                before.elements[element.element_id] =
                    element.action === 'unset' ? { state: 'unset' } : { state: 'set', value: element.value };
            }
            state.securitySnapshots[update.policy_id] = before;
        }
        return Object.assign(gpoEnvelope(displayname), securityResult());
    },

    gpo_editor_advanced_audit_show(displayname) {
        return Object.assign(gpoEnvelope(displayname), {
            advanced_audit: {
                rows: clone(state.auditRows),
                subcategory_catalog: [
                    { guid: '0cce9210-69ae-11d9-bed3-505054503030', display_name: 'Account Logon' },
                    { guid: '0cce9215-69ae-11d9-bed3-505054503030', display_name: 'Logon' },
                    { guid: '0cce9222-69ae-11d9-bed3-505054503030', display_name: 'Process Creation' }
                ]
            }
        });
    },

    gpo_editor_advanced_audit_update(displayname, options) {
        const request = options.request || options || {};
        if (Array.isArray(request.rows)) state.auditRows = clone(request.rows);
        return methods.gpo_editor_advanced_audit_show(displayname);
    }
};

/* ---------------------------------------------------------------- dispatch */

/** The scenarios of the dev stand (`?scenario=` on the page): how the mock server behaves, to see the UI states. */
const SCENARIOS = ['normal', 'error', 'slow', 'empty'];
// The top-level lists of the `gpo_editor_*` answers that `empty` empties.
const LISTS = ['items', 'assets', 'children', 'policies', 'preference_documents', 'documents'];

function emptied(result) {
    if (!result || typeof result !== 'object') return result;
    const copy = { ...result };
    for (const key of LISTS) if (Array.isArray(copy[key])) copy[key] = [];
    if (copy.scripts && typeof copy.scripts === 'object') {
        copy.scripts = Object.fromEntries(
            Object.entries(copy.scripts).map(([key, value]) => [key, Array.isArray(value) ? [] : value])
        );
    }
    return copy;
}

/**
 * Answers one JSON-RPC request. `scenario` changes the answer: `error` fails every `gpo_editor_*` call like an
 * unavailable server, `empty` returns the lists empty, `slow` is delayed by the stand (see the dev server plugin).
 */
function dispatch(body, scenario) {
    const method = body && body.method;
    const params = Array.isArray(body && body.params) ? body.params : [[], {}];
    const args = Array.isArray(params[0]) ? params[0] : [];
    const options = params[1] && typeof params[1] === 'object' ? params[1] : {};
    const handler = methods[method];

    if (!handler) {
        return {
            result: null,
            error: {
                code: 907,
                name: 'CommandError',
                message: 'Dev backend does not implement ' + method,
                data: { method }
            },
            id: body && body.id
        };
    }
    if (scenario === 'error' && String(method).startsWith('gpo_editor_')) {
        return {
            result: null,
            error: {
                code: 4301,
                name: 'ServerUnavailable',
                message: 'Dev scenario "error": the server does not answer',
                data: { category: 'unavailable' }
            },
            id: body.id
        };
    }
    try {
        let result = handler(...args, options);
        if (scenario === 'empty') result = emptied(result);
        return { result: { result, value: args[0] || null, summary: null }, error: null, id: body.id };
    } catch (error) {
        const data = {};
        for (const key of ['category', 'field', 'path', 'details', 'pending_publication']) {
            if (error[key] !== undefined) data[key] = error[key];
        }
        return {
            result: null,
            error: { code: error.code || 903, name: error.name || 'InternalError', message: error.message, data },
            id: body.id
        };
    }
}

export { dispatch, reset, methods, RpcError, SCENARIOS };
