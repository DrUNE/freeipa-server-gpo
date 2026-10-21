import { renderHeader } from '@gpui/components/header/header';
import { renderMain } from '@gpui/components/main/main';
import { renderFooter } from '@gpui/components/footer/footer';
import { resizable } from '@gpui/util/resizable';
import { attachFilter, render } from '@gpui/components/category-path';
import { renderDefaultTemplate } from '@gpui/components/templates/default-template';
import { openAdmxDialog } from '@gpui/components/templates/admx-template';
import { renderFolderTemplate, renderHelpBlock } from '@gpui/components/templates/folder-template';
import { renderScriptsTemplate } from '@gpui/components/templates/script-template';
import { renderPreferencesTemplate } from '@gpui/components/templates/preference/preferences-view-template';
import { renderSecurityTemplate } from '@gpui/components/templates/security-template';
import { renderAdvancedAuditTemplate } from '@gpui/components/templates/advanced-audit-template';
import { renderAllPoliciesTemplate, updateCachedSource } from '@gpui/components/templates/all-policies-template';
import {
    setTreeItemActive,
    setFolderOpenedState,
    ensureLazyChildren,
    hasVisibleChildren
} from '@gpui/components/tree-view/tree-view-list';
import { createElement } from '@gpui/util/element-creator';
import { renderPending } from '@gpui/components/editor-status';
import * as editorStatusModule from '@gpui/components/editor-status';
import { t } from '@gpui/locales/translations';
import { setLanguage } from '@gpui/locales/translations';
import * as translationsModule from '@gpui/locales/translations';
import * as API from '@gpui/util/API';
import * as editorDialogModule from '@gpui/components/editor-dialog';

function createTreeViewState() {
    return {
        selectedItem: null,
        selectedPath: [],
        workspace: null,
        header: null,
        isHelpOpen: false,
        currentViewCleanup: null,
        renderRequestId: 0,
        navigationRequestId: 0,
        treeData: [],
        treeItemElements: new WeakMap(),
        treeListItemElements: new WeakMap(),
        parentItems: new WeakMap(),
        currentView: null,
        pendingNavigation: null,
        policyChangedModal: null,
        searchReturnButton: null,

        setWorkspace: function (workspace) {
            this.workspace = workspace;
            const node = workspace && workspace.getElement();
            if (!node) return;
            node.setAttribute('role', 'region');
            node.setAttribute('aria-label', t('navigation.catalog'));
            const container = node.closest('.gp__container');
            if (!container) return;
            if (container._gpoPaneNavigation) container.removeEventListener('keydown', container._gpoPaneNavigation);
            const state = this;
            container._gpoPaneNavigation = function (event) {
                if (event.key !== 'F6' || event.defaultPrevented || event.ctrlKey || event.metaKey || event.altKey)
                    return;
                const target = event.target;
                if (target.closest('input, textarea, select, [contenteditable]:not([contenteditable="false"])')) return;
                const ownerDialog = target.closest('[role="dialog"], [role="alertdialog"]');
                if (ownerDialog && !ownerDialog.matches('.modal-gpui')) return;
                if (
                    Array.from(
                        container.querySelectorAll('[role="dialog"], [role="alertdialog"], .policy-changed__modal')
                    ).some(function (modal) {
                        return (
                            modal.classList.contains('active') ||
                            (modal.getClientRects().length &&
                                modal.getBoundingClientRect().width > 0 &&
                                getComputedStyle(modal).opacity !== '0' &&
                                getComputedStyle(modal).visibility !== 'hidden')
                        );
                    })
                )
                    return;
                const fromTree = Boolean(target.closest('.tree-view'));
                const destination = fromTree
                    ? node.querySelector(
                          '[data-list-navigation] [tabindex="0"], [data-list-navigation][tabindex="0"]'
                      ) ||
                      node.querySelector('[data-policy-filter]') ||
                      node.querySelector('.gpo-category-path__segment[tabindex="0"]')
                    : container.querySelector('.tree-view .tree-item[tabindex="0"]');
                if (destination && state.workspace === workspace) {
                    event.preventDefault();
                    destination.focus({ preventScroll: true });
                }
            };
            container.addEventListener('keydown', container._gpoPaneNavigation);
        },

        setTreeData: function (treeData) {
            this.treeData = Array.isArray(treeData) ? treeData : [];
        },

        setHeader: function (header) {
            this.header = header;
        },

        initHelpControls: function () {
            const btnInformation =
                this.header && this.header.getElement && this.header.getElement()
                    ? this.header.getElement().querySelector('.gp__control-help .btn-information')
                    : null;

            if (!btnInformation) {
                return;
            }

            btnInformation.addEventListener('click', this.toggleHelp.bind(this));
            this.syncHelpButtonState();
        },

        registerTreeNode: function (item, options) {
            const config = options || {};
            const treeItemElement = config.treeItemElement || null;
            const listItemElement = config.listItemElement || null;
            const parentItem = config.parentItem || null;

            if (!item) {
                return;
            }

            if (treeItemElement instanceof Element) {
                this.treeItemElements.set(item, treeItemElement);
            }

            if (listItemElement instanceof Element) {
                this.treeListItemElements.set(item, listItemElement);
            }

            if (parentItem) {
                this.parentItems.set(item, parentItem);
                return;
            }

            this.parentItems.delete(item);
        },

        getPathToItem: function (item) {
            if (!item) {
                return [];
            }

            const path = [];
            let currentItem = item;

            while (currentItem) {
                path.unshift(currentItem);
                currentItem = this.parentItems.get(currentItem) || null;
            }

            return path;
        },

        getCategoryHeading: function (item) {
            if (item && Array.isArray(item.categoryPath)) return item.categoryPath.join(' / ');
            const path = this.getPathToItem(item);
            return path
                .map(function (node) {
                    return node.title || '';
                })
                .filter(Boolean)
                .join(' / ');
        },

        renderCategoryPath: function (item) {
            const path = this.getPathToItem(item);
            return render(
                path.map(function (node) {
                    return { title: node.title || '', item: node };
                }),
                function (node) {
                    this.navigateToNode(node, { openPath: true });
                }.bind(this)
            );
        },

        updateCachedSecurityModels: function (model) {
            const updated = new Set();
            function visit(nodes) {
                (nodes || []).forEach(function (node) {
                    const cached = node.securityModel;
                    if (cached && cached !== model && !updated.has(cached)) {
                        Object.keys(model).forEach(function (key) {
                            cached[key] = model[key];
                        });
                        updated.add(cached);
                    }
                    if (node.children) visit(node.children);
                });
            }
            visit(this.treeData);
        },

        updateCachedPolicySource: function (name, response) {
            function visit(nodes) {
                (nodes || []).forEach(function (node) {
                    if (node.template === 'all_policies' && node.scope === 'computer') {
                        updateCachedSource(node, name, response);
                    }
                    if (name === 'audit' && node.advancedAuditResponse) {
                        node.advancedAuditResponse = response;
                    }
                    if (node.children) visit(node.children);
                });
            }
            visit(this.treeData);
        },

        setFolderOpened: function (item, opened) {
            if (!item || item.type !== 'folder') {
                return Boolean(item && item.opened);
            }

            const listItemElement = this.treeListItemElements.get(item) || null;
            return setFolderOpenedState(listItemElement, item, opened);
        },

        toggleFolder: function (item) {
            if (!item || item.type !== 'folder' || !hasVisibleChildren(item)) {
                return Boolean(item && item.opened);
            }
            const opened = this.setFolderOpened(item, !item.opened);
            if (opened && item.lazy && !item.loaded) {
                const element = this.treeListItemElements.get(item);
                if (element)
                    return ensureLazyChildren(item, element, this)
                        .then(function () {
                            return item.opened;
                        })
                        .catch(function () {
                            return item.opened;
                        });
            }
            return opened;
        },

        openPathToItem: function (item) {
            const path = this.getPathToItem(item);

            path.slice(0, -1).forEach(function (pathItem) {
                if (pathItem && pathItem.type === 'folder') {
                    this.setFolderOpened(pathItem, true);
                }
            }, this);

            return path;
        },

        activateTreeItem: function (item, treeItemElement) {
            let nextTreeItemElement = treeItemElement || this.treeItemElements.get(item) || null;

            if (
                !nextTreeItemElement &&
                item &&
                item.showInTree === false &&
                (item.template === 'admx' || item.searchReturnTo)
            ) {
                let parentItem = this.parentItems.get(item) || null;
                while (parentItem && !nextTreeItemElement) {
                    nextTreeItemElement = this.treeItemElements.get(parentItem) || null;
                    parentItem = this.parentItems.get(parentItem) || null;
                }
            }

            if (!nextTreeItemElement) {
                return null;
            }

            const treeContainer = nextTreeItemElement.closest('.tree-view') || document;
            return setTreeItemActive(nextTreeItemElement, treeContainer);
        },

        cleanupCurrentView: function () {
            if (typeof this.currentViewCleanup === 'function') {
                this.currentViewCleanup();
            }

            if (this.searchReturnButton) {
                this.searchReturnButton.remove();
                this.searchReturnButton = null;
            }

            this.currentViewCleanup = null;
        },

        setCurrentView: function (view) {
            this.currentViewCleanup = view && typeof view.cleanup === 'function' ? view.cleanup : null;
            this.currentView = view || null;
        },

        isFolderItemSelected: function () {
            return this.selectedItem && this.selectedItem.item && this.selectedItem.item.type === 'folder';
        },

        isAdmxItemSelected: function () {
            return (
                this.selectedItem &&
                this.selectedItem.item &&
                this.selectedItem.item.type === 'file' &&
                this.selectedItem.item.template === 'admx'
            );
        },

        isPreferencesItemSelected: function () {
            return (
                this.selectedItem &&
                this.selectedItem.item &&
                this.selectedItem.item.type === 'file' &&
                this.selectedItem.item.template === 'preferences'
            );
        },

        isHelpToggleAvailable: function () {
            return this.isFolderItemSelected() || this.isAdmxItemSelected() || this.isPreferencesItemSelected();
        },

        getCurrentHelpSourceItem: function () {
            if (this.isFolderItemSelected()) {
                return this.selectedItem && this.selectedItem.item ? this.selectedItem.item : null;
            }

            return (
                this.selectedPath
                    .slice()
                    .reverse()
                    .find(function (pathItem) {
                        return pathItem && pathItem.type === 'folder';
                    }) || null
            );
        },

        buildViewWithPersistentHelp: function (view) {
            if (!this.isHelpOpen) {
                return view;
            }

            const helpSourceItem = this.getCurrentHelpSourceItem();
            const helpBlock = renderHelpBlock({
                help: helpSourceItem ? helpSourceItem.help : undefined,
                isOpen: this.isHelpOpen
            });

            if (!helpBlock) {
                return view;
            }

            return createElement('div', {
                className: 'gp__list-children-wrapper',
                children: [view, helpBlock]
            });
        },

        syncHelpButtonState: function () {
            const btnInformation =
                this.header && this.header.getElement && this.header.getElement()
                    ? this.header.getElement().querySelector('.gp__control-help .btn-information')
                    : null;

            if (!btnInformation) {
                return;
            }

            btnInformation.classList.toggle('active', this.isHelpToggleAvailable());
        },

        syncHelpBlockState: function () {
            const workspaceEl = this.workspace && this.workspace.getElement ? this.workspace.getElement() : null;
            const helpBlocks = workspaceEl
                ? workspaceEl.querySelectorAll('.gp__list-children-help, .gp__admx-help, .preference__info')
                : null;

            if (!helpBlocks || helpBlocks.length === 0) {
                return;
            }

            helpBlocks.forEach(function (helpBlock) {
                helpBlock.classList.toggle('is-open', this.isHelpOpen);
            }, this);
        },

        setHelpOpen: function (opened) {
            this.isHelpOpen = Boolean(opened);
            this.syncHelpBlockState();
            return this.isHelpOpen;
        },

        toggleHelp: function () {
            if (!this.isHelpToggleAvailable()) {
                return this.isHelpOpen;
            }

            return this.setHelpOpen(!this.isHelpOpen);
        },

        renderSelectedItem: async function (item, element) {
            const renderRequestId = ++this.renderRequestId;

            this.cleanupCurrentView();

            const headerElement = this.header && this.header.getElement ? this.header.getElement() : null;
            const preferenceControls = headerElement ? headerElement.querySelector('.gp__control') : null;
            const editorActions = headerElement ? headerElement.querySelector('.gp__control-actions') : null;
            if (preferenceControls) preferenceControls.style.display = 'none';
            if (editorActions) editorActions.style.display = 'none';
            const admxActions = headerElement ? headerElement.querySelector('.gp__control-admx') : null;
            const helpSeparator = headerElement ? headerElement.querySelector('.gp__control-separator') : null;
            if (admxActions) admxActions.style.display = '';
            if (helpSeparator) helpSeparator.style.display = '';

            if (this.workspace) {
                this.workspace.clear();
            }

            this.setCurrentView(null);
            this.selectedPath = this.getPathToItem(item);
            this.selectedItem = { item: item, element: element };
            const categoryPath = this.getCategoryHeading(item);
            if (this.workspace) this.workspace.append(this.renderCategoryPath(item));

            let templateResult = null;
            let renderedWorkspaceView = null;

            if (item && item.template === 'all_policies') {
                if (editorActions) editorActions.style.display = 'flex';
                if (admxActions) admxActions.style.display = 'none';
                if (helpSeparator) helpSeparator.style.display = 'none';
                templateResult = renderAllPoliciesTemplate({
                    item: item,
                    header: this.header,
                    hideHeading: true,
                    onSecuritySaved: function (model, response) {
                        this.updateCachedSecurityModels(model);
                        this.updateCachedPolicySource('security', response);
                    }.bind(this),
                    onAuditSaved: this.updateCachedPolicySource.bind(this, 'audit'),
                    onNavigate: function (target) {
                        target.searchReturnTo = item;
                        this.registerTreeNode(target, { parentItem: item });
                        this.navigateToNode(target, { openPath: true });
                    }.bind(this),
                    isCurrent: function () {
                        return (
                            renderRequestId === this.renderRequestId &&
                            this.selectedItem &&
                            this.selectedItem.item === item
                        );
                    }.bind(this)
                });
                renderedWorkspaceView = templateResult;
            } else if (item && (item.template === 'security' || item.template === 'advanced_audit')) {
                if (admxActions) admxActions.style.display = 'none';
                if (helpSeparator) helpSeparator.style.display = 'none';
                templateResult = await (
                    item.template === 'security' ? renderSecurityTemplate : renderAdvancedAuditTemplate
                )({
                    item: item,
                    categoryPath: categoryPath,
                    header: this.header,
                    hideHeading: true,
                    onSaved: function (response) {
                        if (item.template === 'security') this.updateCachedSecurityModels(item.securityModel);
                        this.updateCachedPolicySource(item.template === 'security' ? 'security' : 'audit', response);
                    }.bind(this),
                    onNavigate: function (child) {
                        this.navigateToNode(child, { openPath: true, openCurrentFolder: true });
                    }.bind(this),
                    isCurrent: function () {
                        return (
                            renderRequestId === this.renderRequestId &&
                            this.selectedItem &&
                            this.selectedItem.item === item
                        );
                    }.bind(this)
                });
                renderedWorkspaceView = templateResult;
            } else if (item && item.type === 'folder') {
                if (editorActions) editorActions.style.display = 'flex';
                if (admxActions) admxActions.style.display = 'none';
                if (helpSeparator) helpSeparator.style.display = 'none';
                templateResult = renderFolderTemplate({
                    categoryPath: categoryPath,
                    hideHeading: true,
                    children: item.children || [],
                    help: item.help,
                    isHelpOpen: this.isHelpOpen,
                    listState: item.listState || (item.listState = {}),
                    onItemClick: function (childItem) {
                        this.navigateToNode(childItem, {
                            openPath: true,
                            openCurrentFolder: childItem && childItem.type === 'folder' ? true : undefined
                        });
                    }.bind(this)
                });
                renderedWorkspaceView = templateResult;
            } else if (item && item.type === 'file') {
                if (item.template === 'admx') {
                    if (admxActions) admxActions.style.display = 'none';
                    if (helpSeparator) helpSeparator.style.display = 'none';
                    const parentCategory = this.parentItems.get(item);
                    const state = this;
                    let policyDialog = null,
                        policyEditor = null;
                    templateResult = renderFolderTemplate({
                        hideHeading: true,
                        children: (parentCategory && parentCategory.children) || [item],
                        help: parentCategory && parentCategory.help,
                        isHelpOpen: this.isHelpOpen,
                        listState: parentCategory && (parentCategory.listState || (parentCategory.listState = {})),
                        onItemClick: function (child) {
                            state.navigateToNode(child, { openPath: true });
                        }
                    });
                    const catalog = templateResult;
                    const cleanupCatalog = catalog.cleanup;
                    const mountCatalog = catalog.onMounted;
                    catalog.onMounted = function () {
                        if (mountCatalog) mountCatalog();
                        const opened = openAdmxDialog(catalog, {
                            item: item,
                            isCurrent: function () {
                                return renderRequestId === state.renderRequestId;
                            },
                            restoreFocus: function () {
                                return catalog
                                    .getElement()
                                    .querySelector('.workspace-list-item.active, .workspace-list-item');
                            },
                            onClose: function () {
                                policyDialog = null;
                                policyEditor = null;
                            }
                        });
                        if (opened) {
                            policyDialog = opened.dialog;
                            policyEditor = opened.editor;
                        }
                    };
                    catalog.hasUnsavedChanges = function () {
                        return Boolean(policyEditor && policyEditor.hasUnsavedChanges());
                    };
                    catalog.applyChanges = async function () {
                        if (!policyEditor) return true;
                        const saved = await policyEditor.applyChanges();
                        if (saved && policyDialog) policyDialog.close();
                        return saved;
                    };
                    catalog.cancelChanges = function () {
                        if (policyDialog) policyDialog.close();
                        return true;
                    };
                    catalog.cleanup = function () {
                        if (policyEditor) policyEditor.cleanup();
                        if (policyDialog) policyDialog.close();
                        if (cleanupCatalog) cleanupCatalog();
                    };
                } else if (item.template === 'preferences') {
                    templateResult = await renderPreferencesTemplate({
                        categoryPath: categoryPath,
                        header: this.header,
                        hideHeading: true,
                        item: item,
                        isHelpOpen: this.isHelpOpen,
                        isCurrent: function () {
                            return (
                                renderRequestId === this.renderRequestId &&
                                this.selectedItem &&
                                this.selectedItem.item === item
                            );
                        }.bind(this)
                    });
                } else if (item.template === 'scripts') {
                    if (admxActions) admxActions.style.display = 'none';
                    if (helpSeparator) helpSeparator.style.display = 'none';
                    templateResult = renderScriptsTemplate({
                        categoryPath: categoryPath,
                        item: item,
                        header: this.header,
                        hideHeading: true,
                        isCurrent: function () {
                            return (
                                renderRequestId === this.renderRequestId &&
                                this.selectedItem &&
                                this.selectedItem.item === item
                            );
                        }.bind(this)
                    });
                } else {
                    templateResult = renderDefaultTemplate();
                }

                renderedWorkspaceView = templateResult;
            }

            if (renderRequestId !== this.renderRequestId) {
                if (templateResult && typeof templateResult.cleanup === 'function') {
                    templateResult.cleanup();
                }
                return;
            }

            if (this.workspace && renderedWorkspaceView) {
                this.workspace.append(renderedWorkspaceView);
                attachFilter(
                    this.workspace.getElement().querySelector('.gpo-category-path'),
                    renderedWorkspaceView.getElement()
                );
                this.setCurrentView(templateResult);
                if (typeof templateResult.onMounted === 'function') {
                    templateResult.onMounted();
                }
            }

            if (item && item.searchReturnTo && editorActions) {
                const back = createElement('button', {
                    className: ['button', 'active', 'gpo-policy-search__back'],
                    attrs: { type: 'button', 'data-policy-search-back': '' },
                    text: t('policySearch.back'),
                    events: {
                        click: function () {
                            this.navigateToNode(item.searchReturnTo, {
                                openPath: true,
                                openCurrentFolder: true
                            });
                        }.bind(this)
                    }
                });
                editorActions.prepend(back.getElement());
                editorActions.style.display = 'flex';
                this.searchReturnButton = back.getElement();
            }

            this.syncHelpButtonState();
            this.syncHelpBlockState();
        },

        navigateToNode: function (item, options) {
            if (this.pendingNavigation) {
                return false;
            }

            const config = Object.assign({}, options || {}, {
                navigationRequestId: ++this.navigationRequestId
            });

            return this.guardNavigation(item, config);
        },

        guardNavigation: function (item, config) {
            if (!config || config.navigationRequestId !== this.navigationRequestId) {
                return false;
            }

            const currentView = this.currentView;
            if (currentView && typeof currentView.hasUnsavedChanges === 'function' && currentView.hasUnsavedChanges()) {
                this.pendingNavigation = { item: item, options: config };
                this.showPolicyChangedModal();
                return false;
            }

            return this.proceedWithNavigation(item, config);
        },

        proceedWithNavigation: function (item, config) {
            config = config || {};
            if (config.navigationRequestId !== this.navigationRequestId) {
                return false;
            }
            const treeItemElement = config.treeItemElement || null;
            const openPath = config.openPath !== undefined ? config.openPath : true;
            const openCurrentFolder = config.openCurrentFolder;

            if (!item) {
                return false;
            }

            if (item.type === 'folder' && item.lazy && !item.loaded && !config.lazyLoadComplete) {
                const listItemElement = this.treeListItemElements.get(item) || null;
                if (!listItemElement) {
                    return Promise.resolve(false);
                }
                if (openCurrentFolder !== undefined) this.setFolderOpened(item, openCurrentFolder);

                return ensureLazyChildren(item, listItemElement, this)
                    .then(
                        function () {
                            if (config.navigationRequestId !== this.navigationRequestId) {
                                return false;
                            }
                            const nextConfig = Object.assign({}, config, { lazyLoadComplete: true });
                            // Expansion may have changed while the request was pending.
                            delete nextConfig.openCurrentFolder;
                            return this.guardNavigation(item, nextConfig);
                        }.bind(this)
                    )
                    .catch(function () {
                        return false;
                    });
            }

            if (openPath) {
                this.openPathToItem(item);
            }

            if (item.type === 'folder' && openCurrentFolder !== undefined) {
                this.setFolderOpened(item, openCurrentFolder);
            }

            const activeTreeItemElement = this.activateTreeItem(item, treeItemElement);
            return this.renderSelectedItem(item, activeTreeItemElement);
        },

        showPolicyChangedModal: function () {
            if (this.policyChangedModal) {
                this.policyChangedModal.classList.add('active');
            }
        },

        hidePolicyChangedModal: function () {
            if (this.policyChangedModal) {
                this.policyChangedModal.classList.remove('active');
            }
        },

        handlePolicyChangedYes: async function () {
            this.hidePolicyChangedModal();

            const currentView = this.currentView;
            if (currentView && typeof currentView.applyChanges === 'function') {
                const success = await currentView.applyChanges();
                if (!success) {
                    this.pendingNavigation = null;
                    return;
                }
            }

            const nav = this.pendingNavigation;
            this.pendingNavigation = null;
            if (nav) {
                return this.guardNavigation(nav.item, nav.options);
            }
            return false;
        },

        handlePolicyChangedNo: function () {
            this.hidePolicyChangedModal();

            const currentView = this.currentView;
            if (currentView && typeof currentView.cancelChanges === 'function') {
                if (currentView.cancelChanges() === false) {
                    this.pendingNavigation = null;
                    return false;
                }
            }

            const nav = this.pendingNavigation;
            this.pendingNavigation = null;
            if (nav) {
                return this.guardNavigation(nav.item, nav.options);
            }
            return false;
        },

        initializeSelection: function () {
            if (this.selectedItem && this.selectedItem.item) {
                return;
            }

            const firstRootItem = this.treeData[0] || null;

            if (!firstRootItem) {
                return;
            }

            this.navigateToNode(firstRootItem, {
                openPath: true,
                openCurrentFolder: firstRootItem.type === 'folder' ? true : undefined
            });
        }
    };
}

function resolveContainer(options) {
    if (options && options.container instanceof Element) {
        return options.container;
    }

    const containerId = options && options.containerId ? options.containerId : 'gp__container';
    return document.getElementById(containerId);
}

function init(options) {
    const container = resolveContainer(options || {});

    if (!container) {
        return null;
    }

    container.innerHTML = '';

    const policyName = (options || {}).policyName;

    const browserLang = (navigator.language || 'en').slice(0, 2).toLowerCase();
    setLanguage(browserLang);

    API.initialize(policyName)
        .then(function (openResult) {
            const treeViewState = createTreeViewState();
            const header = renderHeader(container);
            const headerElement = header.getElement();
            const initialPreferenceControls = headerElement.querySelector('.gp__control');
            const initialEditorActions = headerElement.querySelector('.gp__control-actions');
            if (initialPreferenceControls) initialPreferenceControls.style.display = 'none';
            if (initialEditorActions) initialEditorActions.style.display = 'none';
            treeViewState.setHeader(header);
            treeViewState.initHelpControls();

            function reconcilePending(event) {
                const button = event.currentTarget;
                button.disabled = true;
                API.reconcile()
                    .then(function (result) {
                        const recovery = result.recovery || result.result || result;
                        if (recovery && recovery.kind === 'conflict') {
                            throw new API.EditorError('Publication reconciliation found a third state.', {
                                category: 'publication_conflict',
                                conflict: recovery.conflict
                            });
                        }
                        const notice = button.closest('[data-editor-status]');
                        if (notice) notice.remove();
                    })
                    .catch(function (error) {
                        const notice = button.closest('[data-editor-status]');
                        if (notice) {
                            notice.replaceWith(
                                editorStatusModule
                                    .renderError(error, {
                                        onReconcile: reconcilePending
                                    })
                                    .getElement()
                            );
                        }
                    })
                    .finally(function () {
                        button.disabled = false;
                    });
            }
            const pendingNotice = renderPending(openResult && openResult.pending_publication, reconcilePending);
            if (pendingNotice) container.appendChild(pendingNotice.getElement());

            const renderedMain = renderMain(container, treeViewState);
            renderFooter(container);

            const policyChangedModal = createElement('div', {
                className: 'policy-changed__modal',
                children: [
                    createElement('div', {
                        className: 'policy-changed__modal-wrapper',
                        children: [
                            createElement('div', {
                                className: 'policy-changed__modal-header',
                                children: [
                                    createElement('div', {
                                        className: 'title',
                                        text: t('policyChangedModal.title')
                                    })
                                ]
                            }),
                            createElement('div', {
                                className: 'policy-changed__modal-content',
                                text: t('policyChangedModal.message')
                            }),
                            createElement('div', {
                                className: 'policy-changed__modal-footer',
                                children: [
                                    createElement('div', {
                                        className: ['btn', 'btn-no'],
                                        text: t('policyChangedModal.no')
                                    }),
                                    createElement('div', {
                                        className: ['btn', 'btn-yes'],
                                        text: t('policyChangedModal.yes')
                                    })
                                ]
                            })
                        ]
                    })
                ]
            });

            container.appendChild(policyChangedModal.getElement());
            treeViewState.policyChangedModal = policyChangedModal.getElement();

            const policyBtnNo = treeViewState.policyChangedModal.querySelector('.btn-no');
            const policyBtnYes = treeViewState.policyChangedModal.querySelector('.btn-yes');
            policyBtnNo.addEventListener('click', treeViewState.handlePolicyChangedNo.bind(treeViewState));
            policyBtnYes.addEventListener('click', treeViewState.handlePolicyChangedYes.bind(treeViewState));

            resizable(
                renderedMain.divider.getElement(),
                renderedMain.treeView.getElement(),
                renderedMain.main.getElement()
            );
        })
        .catch(function (error) {
            container.innerHTML = '';
            container.appendChild(
                editorStatusModule
                    .renderError(error, {
                        onRefresh: function () {
                            init(options);
                        }
                    })
                    .getElement()
            );
        });

    return {
        container: container
    };
}

const _test = {
    createTreeViewState: createTreeViewState
};

// The FreeIPA-side entry points (gpo.js, chain.js) share these module instances
// with the editor, because the whole editor ships as one bundle (js/app.js).
export { init, _test, translationsModule as translations, editorDialogModule as editorDialog };
