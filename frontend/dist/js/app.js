(function(global, factory) {
	typeof exports === "object" && typeof module !== "undefined" ? factory(exports, require("freeipa/ipa"), require("freeipa/rpc")) : typeof define === "function" && define.amd ? define([
		"exports",
		"freeipa/ipa",
		"freeipa/rpc"
	], factory) : (global = typeof globalThis !== "undefined" ? globalThis : global || self, factory(global.gpui = {}, global.IPA, global.IPA_rpc));
})(this, function(exports, freeipa_ipa, freeipa_rpc) {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	//#region \0rolldown/runtime.js
	var __create = Object.create;
	var __defProp = Object.defineProperty;
	var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
	var __getOwnPropNames = Object.getOwnPropertyNames;
	var __getProtoOf = Object.getPrototypeOf;
	var __hasOwnProp = Object.prototype.hasOwnProperty;
	var __exportAll = (all, no_symbols) => {
		let target = {};
		for (var name in all) __defProp(target, name, {
			get: all[name],
			enumerable: true
		});
		if (!no_symbols) __defProp(target, Symbol.toStringTag, { value: "Module" });
		return target;
	};
	var __copyProps = (to, from, except, desc) => {
		if (from && typeof from === "object" || typeof from === "function") for (var keys = __getOwnPropNames(from), i = 0, n = keys.length, key; i < n; i++) {
			key = keys[i];
			if (!__hasOwnProp.call(to, key) && key !== except) __defProp(to, key, {
				get: ((k) => from[k]).bind(null, key),
				enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
			});
		}
		return to;
	};
	var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(isNodeMode || !mod || !mod.__esModule || !__hasOwnProp.call(mod, "default") ? __defProp(target, "default", {
		value: mod,
		enumerable: true
	}) : target, mod));
	//#endregion
	freeipa_ipa = __toESM(freeipa_ipa, 1);
	freeipa_rpc = __toESM(freeipa_rpc, 1);
	//#region src/util/element-creator.js
	function classTokens(className) {
		const values = Array.isArray(className) ? className : [className];
		const tokens = [];
		values.forEach((value) => {
			if (typeof value !== "string") return;
			value.split(/\s+/).forEach((token) => {
				if (token) tokens.push(token);
			});
		});
		return tokens;
	}
	/**
	* General-purpose DOM element creation class.
	* Supports attributes, classes, events, and nested elements.
	*/
	var ElementCreator = class ElementCreator {
		/**
		* Creates an ElementCreator instance.
		* @param {string} tagName Element tag (div, span, button, etc.).
		* @param {Object} [options] Element creation options.
		* @param {string|string[]} [options.className] CSS class or classes.
		* @param {string} [options.id] Element ID.
		* @param {Object} [options.attrs] Additional attributes (data-*, aria-*, etc.).
		* @param {string} [options.text] Text content.
		* @param {string} [options.html] HTML content (mutually exclusive with text).
		* @param {Object} [options.style] Inline styles.
		* @param {Object} [options.events] Event handlers, for example {click: handler, mouseover: handler}.
		* @param {ElementCreator[]|Element[]|string[]} [options.children] Child elements.
		*/
		constructor(tagName = "div", options = {}) {
			this.element = document.createElement(tagName);
			this.applyOptions(options);
		}
		/**
		* Applies options to the element.
		* @private
		*/
		applyOptions(options) {
			const { className, id, attrs = {}, text, html, style = {}, events = {}, children = [] } = options;
			if (id) this.element.id = id;
			const classes = classTokens(className);
			if (classes.length > 0) this.element.classList.add(...classes);
			Object.entries(attrs).forEach(([key, value]) => {
				if (value !== null && value !== void 0) this.element.setAttribute(key, value);
			});
			Object.entries(style).forEach(([key, value]) => {
				this.element.style[key] = value;
			});
			if (text !== void 0 && text !== null) this.element.textContent = text;
			if (html !== void 0 && html !== null) this.element.innerHTML = html;
			Object.entries(events).forEach(([eventName, handler]) => {
				if (typeof handler === "function") this.element.addEventListener(eventName, handler);
			});
			if (Array.isArray(children) && children.length > 0) children.forEach((child) => {
				this.append(child);
			});
		}
		/**
		* Adds one or more classes to the element.
		* @param {string|string[]} className Class or classes to add.
		* @returns {ElementCreator} This instance for method chaining.
		*/
		addClass(className) {
			const classes = classTokens(className);
			if (classes.length > 0) this.element.classList.add(...classes);
			return this;
		}
		/**
		* Removes one or more classes from the element.
		* @param {string|string[]} className Class or classes to remove.
		* @returns {ElementCreator} This instance for method chaining.
		*/
		removeClass(className) {
			const classes = classTokens(className);
			if (classes.length > 0) this.element.classList.remove(...classes);
			return this;
		}
		/**
		* Toggles a class on the element.
		* @param {string} className Class to toggle.
		* @returns {ElementCreator} This instance for method chaining.
		*/
		toggleClass(className) {
			this.element.classList.toggle(className);
			return this;
		}
		/**
		* Sets an element attribute.
		* @param {string} name Attribute name.
		* @param {string} value Attribute value.
		* @returns {ElementCreator} This instance for method chaining.
		*/
		setAttr(name, value) {
			if (value !== null && value !== void 0) this.element.setAttribute(name, value);
			return this;
		}
		/**
		* Removes an element attribute.
		* @param {string} name Attribute name.
		* @returns {ElementCreator} This instance for method chaining.
		*/
		removeAttr(name) {
			this.element.removeAttribute(name);
			return this;
		}
		/**
		* Sets the text content.
		* @param {string} text Text content.
		* @returns {ElementCreator} This instance for method chaining.
		*/
		setText(text) {
			this.element.textContent = text;
			return this;
		}
		/**
		* Sets the HTML content.
		* @param {string} html HTML string.
		* @returns {ElementCreator} This instance for method chaining.
		*/
		setHTML(html) {
			this.element.innerHTML = html;
			return this;
		}
		/**
		* Sets inline styles.
		* @param {Object|string} style Style object or CSS string.
		* @returns {ElementCreator} This instance for method chaining.
		*/
		setStyle(style) {
			if (typeof style === "string") this.element.style.cssText = style;
			else Object.entries(style).forEach(([key, value]) => {
				this.element.style[key] = value;
			});
			return this;
		}
		/**
		* Adds an event listener.
		* @param {string} eventName Event name.
		* @param {Function} handler Event handler.
		* @param {Object} options addEventListener options.
		* @returns {ElementCreator} This instance for method chaining.
		*/
		/** @param {string} eventName @param {any} handler @param {any} [options] */
		on(eventName, handler, options) {
			if (typeof handler === "function") this.element.addEventListener(eventName, handler, options);
			return this;
		}
		/**
		* Removes an event listener.
		* @param {string} eventName Event name.
		* @param {Function} handler Event handler.
		* @returns {ElementCreator} This instance for method chaining.
		*/
		/** @param {string} eventName @param {any} handler */
		off(eventName, handler) {
			if (typeof handler === "function") this.element.removeEventListener(eventName, handler);
			return this;
		}
		/**
		* Appends a child.
		* @param {ElementCreator|Element|string} child Child element or text.
		* @returns {ElementCreator} This instance for method chaining.
		*/
		append(child) {
			if (child instanceof ElementCreator) this.element.appendChild(child.getElement());
			else if (child instanceof Element) this.element.appendChild(child);
			else if (typeof child === "string") this.element.appendChild(document.createTextNode(child));
			return this;
		}
		/**
		* Prepends a child.
		* @param {ElementCreator|Element|string} child Child element or text.
		* @returns {ElementCreator} This instance for method chaining.
		*/
		prepend(child) {
			if (child instanceof ElementCreator) this.element.insertBefore(child.getElement(), this.element.firstChild);
			else if (child instanceof Element) this.element.insertBefore(child, this.element.firstChild);
			else if (typeof child === "string") this.element.insertBefore(document.createTextNode(child), this.element.firstChild);
			return this;
		}
		/**
		* Clears the element content.
		* @returns {ElementCreator} This instance for method chaining.
		*/
		clear() {
			this.element.innerHTML = "";
			return this;
		}
		/**
		* Returns the created DOM element.
		* @returns {GpuiElement} DOM element.
		*/
		getElement() {
			return this.element;
		}
		/**
		* Creates an element.
		* @param {string} tagName Element tag.
		* @param {Object} options Element creation options.
		* @returns {ElementCreator} ElementCreator instance.
		*/
		static create(tagName = "div", options = {}) {
			return new ElementCreator(tagName, options);
		}
		/**
		* Wraps an existing DOM element (for example one made by a component written with `h()`), so it can be
		* used wherever an ElementCreator is expected: `getElement()`, `append()`, `on()`.
		* @param {Element} element
		* @returns {ElementCreator}
		*/
		static wrap(element) {
			const wrapper = Object.create(ElementCreator.prototype);
			wrapper.element = element;
			return wrapper;
		}
		/**
		* Creates an element from an HTML string.
		* @param {string} html HTML string.
		* @returns {GpuiElement} DOM element.
		*/
		static fromHTML(html) {
			const template = document.createElement("template");
			template.innerHTML = html.trim();
			return template.content.firstChild;
		}
	};
	/**
	* Convenience function for creating elements.
	* @param {string} tagName Element tag.
	* @param {Object} [options] Element creation options.
	* @returns {GpuiCreator} ElementCreator instance.
	*/
	function createElement(tagName = "div", options = {}) {
		return new ElementCreator(tagName, options);
	}
	if (typeof window !== "undefined")
 /** @type {any} */ window.createElement = createElement;
	//#endregion
	//#region src/locales/en.js
	var en_exports = /* @__PURE__ */ __exportAll({
		chain: () => chain$1,
		collections: () => collections$1,
		common: () => common$1,
		confirmModal: () => confirmModal$1,
		editorStatus: () => editorStatus$1,
		gpo: () => gpo$1,
		header: () => header$2,
		menu: () => menu$1,
		navigation: () => navigation$1,
		policies: () => policies$1,
		policyChangedModal: () => policyChangedModal$1,
		policySearch: () => policySearch$1,
		preferences: () => preferences$1,
		security: () => security$1,
		systemSettings: () => systemSettings$1,
		tree: () => tree$1,
		treeView: () => treeView$1
	});
	var navigation$1 = {
		path: "Current location",
		tree: "Policy navigation",
		catalog: "Policy catalog",
		keyboardHelp: "Arrow keys select items; Enter edits; Delete removes an item when allowed. F6 switches between the tree and catalog."
	};
	var tree$1 = {
		expand: "Expand category",
		collapse: "Collapse category"
	};
	var editorStatus$1 = {
		errors: {
			authorization: "You do not have permission to work with this Group Policy.",
			validation: "Check the values in the affected fields.",
			unsupported: "These settings cannot be safely changed yet.",
			unsupported_content: "These settings cannot be safely changed yet.",
			storage_conflict: "Another editor has changed this policy. Refresh the data.",
			publication_conflict: "Policy files were saved, but publication to the directory conflicts with another change.",
			publication_recovery: "Policy publication requires recovery.",
			publication_pending: "Policy publication has not completed.",
			recovery_operator_action: "An operator must intervene to recover policy publication.",
			not_found: "The requested object no longer exists.",
			operational: "The editor operation could not be completed."
		},
		details: {
			securityActionsList: "Security policy actions must be a list.",
			securityElementActionsList: "Security element actions must be a list.",
			securityRowActionsList: "Keyed-row actions must be a list.",
			listRequiresEntry: "Add at least one non-empty item.",
			collectionInvalidEntry: "Open the list editor and correct the highlighted entries."
		},
		refresh: "Refresh",
		reconcile: "Reconcile publication",
		field: "Field",
		technicalDetails: "Technical details",
		pending: "The previous policy publication has not completed."
	};
	var security$1 = {
		dependency: {
			title: "Related policy settings",
			intro: "To save this policy, apply the following related settings as well.",
			policy: "Policy",
			value: "Value",
			notConfigured: "Not configured",
			apply: "Apply changes",
			cancel: "Cancel",
			days: "day(s)",
			minutes: "minute(s)",
			hours: "hour(s)",
			attempts: "attempt(s)"
		},
		addRow: "Add row",
		removeRow: "Remove row",
		damaged: "Damaged record",
		securityDescriptor: "Security descriptor (SDDL)",
		saclHelp: "Supply the complete SACL in SDDL format. Applying replaces the global audit descriptor for this object type.",
		advancedAudit: {
			subcategories: {
				"0cce9210-69ae-11d9-bed3-505054503030": "Security State Change",
				"0cce9211-69ae-11d9-bed3-505054503030": "Security System Extension",
				"0cce9212-69ae-11d9-bed3-505054503030": "System Integrity",
				"0cce9213-69ae-11d9-bed3-505054503030": "IPsec Driver",
				"0cce9214-69ae-11d9-bed3-505054503030": "Other System Events",
				"0cce9215-69ae-11d9-bed3-505054503030": "Logon",
				"0cce9216-69ae-11d9-bed3-505054503030": "Logoff",
				"0cce9217-69ae-11d9-bed3-505054503030": "Account Lockout",
				"0cce9218-69ae-11d9-bed3-505054503030": "IPsec Main Mode",
				"0cce9219-69ae-11d9-bed3-505054503030": "IPsec Quick Mode",
				"0cce921a-69ae-11d9-bed3-505054503030": "IPsec Extended Mode",
				"0cce921b-69ae-11d9-bed3-505054503030": "Special Logon",
				"0cce921c-69ae-11d9-bed3-505054503030": "Other Logon/Logoff Events",
				"0cce921d-69ae-11d9-bed3-505054503030": "File System",
				"0cce921e-69ae-11d9-bed3-505054503030": "Registry",
				"0cce921f-69ae-11d9-bed3-505054503030": "Kernel Object",
				"0cce9220-69ae-11d9-bed3-505054503030": "SAM",
				"0cce9221-69ae-11d9-bed3-505054503030": "Certification Services",
				"0cce9222-69ae-11d9-bed3-505054503030": "Application Generated",
				"0cce9223-69ae-11d9-bed3-505054503030": "Handle Manipulation",
				"0cce9224-69ae-11d9-bed3-505054503030": "File Share",
				"0cce9225-69ae-11d9-bed3-505054503030": "Filtering Platform Packet Drop",
				"0cce9226-69ae-11d9-bed3-505054503030": "Filtering Platform Connection",
				"0cce9227-69ae-11d9-bed3-505054503030": "Other Object Access Events",
				"0cce9228-69ae-11d9-bed3-505054503030": "Sensitive Privilege Use",
				"0cce9229-69ae-11d9-bed3-505054503030": "Non Sensitive Privilege Use",
				"0cce922a-69ae-11d9-bed3-505054503030": "Other Privilege Use Events",
				"0cce922b-69ae-11d9-bed3-505054503030": "Process Creation",
				"0cce922c-69ae-11d9-bed3-505054503030": "Process Termination",
				"0cce922d-69ae-11d9-bed3-505054503030": "DPAPI Activity",
				"0cce922e-69ae-11d9-bed3-505054503030": "RPC Events",
				"0cce922f-69ae-11d9-bed3-505054503030": "Audit Policy Change",
				"0cce9230-69ae-11d9-bed3-505054503030": "Authentication Policy Change",
				"0cce9231-69ae-11d9-bed3-505054503030": "Authorization Policy Change",
				"0cce9232-69ae-11d9-bed3-505054503030": "MPSSVC Rule-Level Policy Change",
				"0cce9233-69ae-11d9-bed3-505054503030": "Filtering Platform Policy Change",
				"0cce9234-69ae-11d9-bed3-505054503030": "Other Policy Change Events",
				"0cce9235-69ae-11d9-bed3-505054503030": "User Account Management",
				"0cce9236-69ae-11d9-bed3-505054503030": "Computer Account Management",
				"0cce9237-69ae-11d9-bed3-505054503030": "Security Group Management",
				"0cce9238-69ae-11d9-bed3-505054503030": "Distribution Group Management",
				"0cce9239-69ae-11d9-bed3-505054503030": "Application Group Management",
				"0cce923a-69ae-11d9-bed3-505054503030": "Other Account Management Events",
				"0cce923b-69ae-11d9-bed3-505054503030": "Directory Service Access",
				"0cce923c-69ae-11d9-bed3-505054503030": "Directory Service Changes",
				"0cce923d-69ae-11d9-bed3-505054503030": "Directory Service Replication",
				"0cce923e-69ae-11d9-bed3-505054503030": "Detailed Directory Service Replication",
				"0cce923f-69ae-11d9-bed3-505054503030": "Credential Validation",
				"0cce9240-69ae-11d9-bed3-505054503030": "Kerberos Service Ticket Operations",
				"0cce9241-69ae-11d9-bed3-505054503030": "Other Account Logon Events",
				"0cce9242-69ae-11d9-bed3-505054503030": "Kerberos Authentication Service",
				"0cce9243-69ae-11d9-bed3-505054503030": "Network Policy Server",
				"0cce9244-69ae-11d9-bed3-505054503030": "Detailed File Share",
				"0cce9245-69ae-11d9-bed3-505054503030": "Removable Storage",
				"0cce9246-69ae-11d9-bed3-505054503030": "Central Access Policy Staging",
				"0cce9247-69ae-11d9-bed3-505054503030": "User/Device Claims",
				"0cce9248-69ae-11d9-bed3-505054503030": "PNP Activity",
				"0cce9249-69ae-11d9-bed3-505054503030": "Group Membership"
			},
			title: "Advanced Audit Policy Configuration",
			systemPolicies: "System Audit Policies",
			globalAccess: "Global Object Access Auditing",
			options: "Audit Options",
			preservedSettings: "Preserved Settings",
			registrySacl: "Registry global SACL",
			fileSacl: "File global SACL",
			preserved: "Preserved source row",
			none: "No auditing",
			includeSuccess: "Include success",
			excludeSuccess: "Exclude success",
			includeFailure: "Include failure",
			excludeFailure: "Exclude failure",
			opaqueSddl: "Opaque SDDL (preserved)",
			unknownPreserved: "Unknown row preserved",
			unchanged: "Leave unchanged",
			success: "Success",
			failure: "Failure",
			successAndFailure: "Success and failure",
			machineName: "Policy name in audit file",
			target: "Target",
			system: "System",
			user: "User SID",
			auditSetting: "Audit setting",
			enableOption: "Enable this audit option",
			include_success: "Include success",
			exclude_success: "Exclude success",
			include_failure: "Include failure",
			exclude_failure: "Exclude failure",
			crash_on_audit_fail: "Audit: Shut down system immediately if unable to log security audits",
			full_privilege_auditing: "Audit: Audit the use of Backup and Restore privilege",
			audit_base_objects: "Audit: Audit the access of global system objects",
			audit_base_directories: "Audit: Audit the access of global directory service objects"
		},
		validationType: "The value type does not match the definition.",
		validationInteger: "Enter a whole number.",
		validationRange: "Enter a value in the allowed range.",
		validationChoice: "Select a value supplied by the definition.",
		validationDescriptor: "Enter one security descriptor without line breaks.",
		unresolvedElement: "This setting cannot be displayed:",
		validationRows: "Add at least one item, or leave this policy not configured.",
		validationKey: "Every row requires its unique key.",
		validationDuplicate: "Collection row keys must be unique.",
		readOnlyCollection: "This collection is read-only.",
		value: "Value",
		title: "Security Settings",
		policy: "Policy",
		policySetting: "Policy setting",
		apply: "Apply",
		save: "Save",
		saving: "Saving…",
		cancel: "Cancel",
		close: "Close",
		keepEditing: "Keep editing",
		discardQuestion: "Discard unsaved changes?",
		discard: "Discard",
		properties: "Properties",
		remove: "Remove",
		removeItem: "Remove item",
		removeQuestion: "Remove this item from the policy?",
		addItem: "Add item",
		item: "Item",
		actions: "Actions",
		folder: "Folder",
		filter: "Filter settings",
		noMatches: "No matching settings.",
		noItems: "No items are configured.",
		notConfigured: "Not configured",
		configured: "Configured",
		enabled: "Enabled",
		disabled: "Disabled",
		emptyValue: "Empty list",
		permissionsDefined: "Permissions defined",
		definePolicy: "Define this policy setting",
		defineSetting: "Define this policy setting",
		explanationTab: "Explanation",
		settingTab: "Security Policy Setting",
		noExplanation: "No explanation is available for this setting.",
		validationRequired: "A value is required.",
		serviceCatalogMissing: "The service catalog has not been supplied. Configured services are shown here; additional services can be added by name.",
		preservedReadOnly: "This setting is preserved and is read-only.",
		preservedTitle: "Preserved and diagnostic records",
		missingPolicy: "The security definition is no longer available.",
		auditUnavailable: "Advanced Audit is temporarily unavailable. Other security settings remain available.",
		validationGroupRelationship: "Define Members or Member of. An explicitly empty list is allowed."
	};
	var common$1 = {
		help: "Help:",
		description: "Description:",
		options: "Options:",
		comment: "Comment:",
		edit: "Edit",
		save: "Save"
	};
	var menu$1 = {
		groupPolicy: "GROUP Policy",
		chains: "Chains",
		groupPolicyObjects: "Group Policy Objects"
	};
	var chain$1 = {
		enable: "Enable",
		disable: "Disable",
		moveUp: "Move Up",
		moveDown: "Move Down",
		moveGpcUp: "Move GPC Up",
		moveGpcDown: "Move GPC Down",
		title: "Group Policy Chain",
		titlePlural: "Group Policy Chains",
		gpoTab: "Group Policy Objects",
		statusActive: "Active",
		statusInactive: "Inactive",
		statusUnknown: "Unknown",
		enableConfirm: "Are you sure you want to enable the selected chain?",
		disableConfirm: "Are you sure you want to disable the selected chain?",
		selectOneChainEnable: "Please select exactly one chain to enable",
		selectOneChainDisable: "Please select exactly one chain to disable",
		selectOneGpc: "Please select exactly one GPC to move",
		selectOneChainMove: "Please select exactly one chain to move",
		enabledSuccessfully: "Chain \"%s\" enabled successfully",
		disabledSuccessfully: "Chain \"%s\" disabled successfully",
		enableFailed: "Failed to enable chain",
		disableFailed: "Failed to disable chain",
		movedUpSuccessfully: "Chain moved up successfully",
		movedDownSuccessfully: "Chain moved down successfully",
		moveUpFailed: "Failed to move chain up: %s",
		moveDownFailed: "Failed to move chain down: %s",
		movedSuccessfully: "Chain \"%s\" moved successfully",
		moveFailed: "Failed to move chain",
		reorderFailed: "Failed to reorder chains",
		unableToDetermineChainUp: "Unable to determine chain name for move up",
		unableToDetermineChainDown: "Unable to determine chain name for move down",
		gpcMovedUp: "GPC \"%s\" moved up successfully",
		gpcMovedDown: "GPC \"%s\" moved down successfully",
		gpcMoveUpFailed: "Failed to move GPC up",
		gpcMoveDownFailed: "Failed to move GPC down",
		gpoMovedSuccessfully: "Group Policy Object \"%s\" moved successfully",
		gpoMoveFailed: "Failed to move group policy object",
		gpoReorderFailed: "Failed to reorder group policy objects",
		unableToDetermineGpo: "Unable to determine group policy object name",
		addTitle: "Add Group Policy Chain",
		noChanges: "No changes made",
		updatedSuccessfully: "Chain \"%s\" updated successfully",
		fields: {
			cn: "Chain name",
			description: "Description",
			usergroup: "User group",
			computergroup: "Computer group",
			active: "Active",
			gplink: "Group Policy Links",
			chainNameDoc: "Unique name for the Group Policy Chain",
			descriptionDoc: "Human-readable description for the chain (optional)",
			userGroupDoc: "Select a user group for this chain",
			computerGroupDoc: "Select a computer group for this chain",
			gplinkDoc: "Select Group Policy Objects to link to this chain"
		}
	};
	var gpo$1 = {
		title: "Group Policy Objects",
		titleSingular: "Group Policy Object",
		addTitle: "Add Group Policy Object",
		fields: {
			policyName: "Policy Name",
			guid: "GUID",
			version: "Version",
			flags: "Flags",
			identity: "Identity",
			distinguishedName: "Distinguished Name",
			versionNumber: "Version Number",
			containerName: "Container Name"
		},
		noChanges: "No changes made",
		updatedSuccessfully: "GPO \"%s\" updated successfully",
		renamedSuccessfully: "GPO renamed from \"%s\" to \"%s\" successfully",
		updateFailed: "Failed to update GPO",
		patternError: "Policy name may only include letters, numbers, _, -, . and $, refer to 'ipa help Group Policy Object' for complete format description",
		cannotDetermineName: "Cannot determine GPO name",
		gpuiInitializeFailed: "Failed to initialize GPUI module",
		gpuiLoadFailed: "Failed to load GPUI module",
		addToChainTitle: "Add Group Policy Objects to Chain",
		removeFromChainTitle: "Remove Group Policy Objects from Chain"
	};
	var collections$1 = {
		edit: "Edit…",
		view: "View…",
		editLabel: "Edit {label}",
		viewLabel: "View {label}",
		add: "Add",
		remove: "Remove",
		cancel: "Cancel",
		ok: "OK",
		close: "Close",
		key: "Key",
		value: "Value",
		index: "No.",
		empty: "No items",
		emptyValue: "(empty)",
		noMatches: "No matching items",
		itemsCount: "Items: {count}",
		pairsCount: "Pairs: {count}",
		shownCount: "Shown: {shown} of {total}",
		search: "Search items",
		cellLabel: "{column}, row {index}",
		reorder: "Order",
		reorderRow: "Move row {index}",
		reorderHelp: "Drag to reorder. On this handle, Ctrl+Up/Down moves the row.",
		clearSearchToReorder: "Clear the search to reorder items.",
		moved: "Row moved to position {index}.",
		added: "New row added at the end.",
		removed: "Selected row removed.",
		discardQuestion: "Discard unsaved changes?",
		errors: {
			minItems: "Add at least one item.",
			requiredKey: "Enter a key.",
			requiredValue: "Enter a value.",
			duplicateKey: "This name is already used.",
			invalidKey: "This name is not allowed.",
			invalidText: "The value contains a NUL character.",
			tooLong: "The value exceeds the allowed length.",
			keyTooLong: "The name exceeds the allowed length.",
			invalidValue: "The collection contains an unsupported value."
		}
	};
	var policySearch$1 = {
		description: "Find policies and preference settings by name without opening each category.",
		categoryPlaceholder: "Search in this category",
		computerPlaceholder: "Search computer policies",
		userPlaceholder: "Search user policies",
		noMatches: "No matching policies.",
		loading: "Loading policies…",
		incomplete: "The list is incomplete: some policy sources could not be loaded.",
		retry: "Retry",
		refresh: "Refresh",
		name: "Policy",
		path: "Category / type",
		count: "Results: {matched} / {total}",
		page: "Page {page} / {pages}",
		previous: "Previous",
		next: "Next",
		back: "Back to All Policies",
		invalidIndex: "The policy index has an invalid response. Refresh the list or try again.",
		targetUnavailable: "This setting is no longer available. Refresh the list."
	};
	var policies$1 = {
		parametersTab: "Parameters",
		allPolicies: "All Policies",
		title: "Policies",
		localGroupPolicy: "[Local Group Policy]",
		machine: "Computer",
		machineLevelPolicies: "Machine level policies",
		user: "User",
		userLevelPolicies: "User level policies",
		windowsSettings: "System Settings",
		scriptsComputer: "Scripts (Startup/Shutdown)",
		scriptsUser: "Scripts (Logon/Logoff)",
		startup: "Startup",
		shutdown: "Shutdown",
		logon: "Logon",
		logoff: "Logoff",
		adminTemplates: "Administrative Templates",
		machineAdminTemplates: "Machine administrative templates",
		userAdminTemplates: "User administrative templates",
		localGroupPolicies: "Local group policies templates",
		policy: "Policy:",
		policyState: "Policy State",
		notConfigured: "Not Configured",
		enabled: "Enabled",
		disabled: "Disabled",
		listOnePerLine: "One item per line",
		unsupportedDefault: "The template default is unsupported; choose a value explicitly.",
		unsupportedSource: "This policy contains unsupported source values and is read-only.",
		supportedOn: "Supported on:"
	};
	var preferences$1 = {
		title: "Preferences",
		description: "Preferences policies.",
		windowsSettings: "System Settings",
		controlPanelSettings: "Component Settings",
		otherSettings: "Other settings",
		systemSettings: "System settings",
		systemSettingsDesc: "Policies that set system settings.",
		shortcuts: "Shortcuts",
		environment: "Environment",
		folders: "Folders",
		registry: "Registry",
		driveMaps: "Drive Maps",
		networkShares: "Network Shares",
		files: "Files",
		iniFiles: "Ini File",
		editor: {
			documentEditable: "This document can be edited",
			documentReadOnly: "This document is read-only",
			emptyItems: "This document does not contain any items.",
			itemColumn: "Item",
			filtersColumn: "Targeting",
			actionsColumn: "Actions",
			statusColumn: "Status",
			yes: "Yes",
			no: "No",
			createTitle: "Create preference item",
			editTitle: "Edit preference item",
			viewTitle: "Preference item details",
			readonly: "Read-only",
			specified: "Specified",
			unspecified: "Not specified",
			userContext: "Run in logged-on user's security context (user policy option)",
			applyOnce: "Apply only once",
			itemSelection: "Item selection",
			filtersHeading: "Item-level targeting",
			tabBasic: "Basic settings",
			tabGeneral: "General",
			targettingButton: "Targeting",
			targettingTitle: "Targeting Editor",
			selectFilter: "Select an item to edit its settings.",
			filterType: "Filter type",
			addFilter: "Add filter",
			replaceFilter: "Replace type",
			removeFilter: "Remove filter",
			createTargetingItem: "Create Item",
			addTargetingCollection: "Add Collection",
			moveTargetingItem: "Move",
			dragTargetingItem: "Drag to move; Ctrl+Up/Down reorders, Ctrl+Left/Right changes nesting.",
			targetingOperator: "Operator",
			targetingKeyboardHelp: "Ctrl+Up/Down: reorder. Ctrl+Right: move into the preceding collection. Ctrl+Left: move out of the parent collection.",
			targetingKeyboardMoveUnavailable: "Use Ctrl+Up/Down to place the item after a collection before nesting it.",
			expandTargetingCollection: "Expand collection",
			collapseTargetingCollection: "Collapse collection",
			targetingDestination: "Destination",
			targetingPosition: "Position",
			targetingRoot: "Root level",
			targetingRootDrop: "Move to the end of the root level",
			targetingMoved: "Item moved in the draft.",
			targetingAnd: "AND",
			targetingOr: "OR",
			targetingNot: "NOT",
			invalidTargetingMove: "An item cannot be moved into itself or its descendants.",
			targetingDepthLimit: "This placement exceeds the supported collection nesting depth (64).",
			targetingEmpty: "Use Create Item or Add Collection to begin.",
			targetingOk: "OK",
			unsupportedFilterFields: "This item's fields are not supported. Its data is preserved when moved.",
			rename: "Name",
			parent: "Parent folder",
			validationRequired: "This field is required.",
			validationInvalidNumber: "Enter a valid number.",
			validationUnsignedByteRange: "Enter a number from 0 through 255.",
			validationDate: "Choose a valid date.",
			validationTime: "Enter a valid time.",
			validationIp: "Enter a valid IPv4 address.",
			validationIpv6: "Enter a valid IPv6 address, such as 2001:db8::1.",
			validationMac: "Enter a MAC address in the form 00:11:22:33:44:55.",
			validationVersion: "Enter a version such as 1.2.3.4.",
			validationGuid: "Enter a GUID in the form {12345678-1234-1234-1234-123456789ABC}.",
			validationRange: "The lower bound must not exceed the upper bound.",
			validationValue: "Choose a supported value.",
			validationFixErrors: "Fix the highlighted fields before saving.",
			save: "Save",
			saving: "Saving…",
			cancel: "Cancel",
			close: "Close",
			delete: "Delete",
			refresh: "Refresh",
			confirmSave: "Save these changes?",
			confirmCancelDiscard: "Cancel and discard unsaved changes?",
			confirmCloseDiscard: "Close and discard unsaved changes?",
			confirmDelete: "Delete the selected preference item?",
			confirmRefreshDiscard: "Refresh from the server and discard the current draft?",
			confirmDiscardChanges: "Discard unsaved changes?",
			reconcileSucceededRefresh: "Publication recovery succeeded. Refresh the item before editing it again.",
			settingsTitle: "Settings:",
			descriptionTitle: "Description:",
			noDescription: "No description",
			settingBypassErrors: "Ignore errors",
			settingRemovePolicy: "Remove policy",
			settingDisabled: "Disabled",
			columnName: "Name",
			columnOrder: "Order",
			columnAction: "Action",
			columnTarget: "Target",
			columnPath: "Path",
			columnSourcePath: "Source path",
			columnTargetPath: "Target path",
			columnShortcutPath: "Shortcut path",
			columnHive: "Hive",
			columnKey: "Key",
			columnUserLimit: "User limit",
			columnAbe: "Access-based enumeration",
			columnSection: "Section",
			columnProperty: "Property",
			columnValue: "Value",
			columnLetter: "Letter",
			columnDriver: "Driver",
			columnServer: "Server",
			columnDatabase: "Database",
			columnDeviceClass: "Device class",
			columnDeviceId: "Device ID",
			columnLocation: "Location",
			columnStartupType: "Startup type",
			columnServiceAction: "Service action",
			columnApplication: "Application",
			columnUserName: "User name",
			columnIpAddress: "IP address",
			columnSystemLocale: "System locale",
			actionCreate: "Create",
			actionReplace: "Replace",
			actionUpdate: "Update",
			actionDelete: "Delete"
		}
	};
	var treeView$1 = {
		loadingPolicies: "Loading policies...",
		unableToLoadPolicies: "Unable to load policies."
	};
	var header$2 = {
		create: "Create",
		edit: "Edit",
		delete: "Delete",
		apply: "Apply",
		cancel: "Cancel",
		information: "Information"
	};
	var systemSettings$1 = {
		systemSettings: "System settings",
		scripts: "Scripts",
		startupScript: "Startup script",
		shutdownScript: "Shutdown script",
		logonScript: "Logon scripts",
		logoffScript: "Logoff scripts",
		startupScripts: "Startup scripts",
		shutdownScripts: "Shutdown scripts",
		eventTitle: "Scripts for {event}",
		eventColumn: "Event",
		scriptsColumn: "Scripts",
		powershellColumn: "PowerShell",
		openEvent: "Open",
		openFolder: "Open scripts folder…",
		showFiles: "Show files…",
		folderTitle: "Scripts folder",
		folderForEvent: "Files: {event}",
		eventSelector: "Event",
		refresh: "Refresh",
		selectFromSysvol: "Select a file from SYSVOL",
		usedBy: "Used by",
		closeDialog: "Close",
		savingImmediately: "Changes are saved to this policy immediately.",
		saving: "Saving…",
		saved: "Saved.",
		loading: "Loading scripts…",
		emptyEntries: "No scripts added.",
		emptyAssets: "No files. Upload a script to this folder.",
		classic: "Scripts",
		powershell: "PowerShell scripts",
		managedFiles: "Script files",
		columnSize: "Size",
		columnReferences: "References",
		bytes: "bytes",
		externalCommand: "Command or external path",
		existingAsset: "File in this policy",
		sourceLabel: "Script source",
		selectFile: "Select file",
		browseFiles: "Browse policy files…",
		addSelectedScript: "Add selected script…",
		upload: "Upload",
		replaceFile: "Replace file",
		download: "Download",
		deleteFile: "Delete file",
		applyOrder: "Apply order",
		orderUnspecified: "Not configured",
		orderClassicFirst: "Scripts first",
		orderPowershellFirst: "PowerShell first",
		removeEntryConfirm: "Remove the selected script entry from this policy?",
		deleteFileConfirm: "Delete the selected unreferenced script file from this policy?",
		deleteSelectedFilesConfirm: "Delete the selected unreferenced script files from this policy?",
		replaceFileConfirm: "Replace the contents of the selected script file?",
		fileInUse: "This file is used by a script entry. Remove the references before deleting it.",
		readOnlyScripts: "This script list cannot be edited.",
		discardFormConfirm: "Discard the unsaved script entry changes?",
		uploadTooLarge: "The selected file exceeds the allowed upload size.",
		invalidDownload: "The downloaded script data is invalid.",
		chooseFile: "Choose a file first.",
		chooseCommand: "Enter a command or select a file.",
		close: "Close",
		dialogTitle: "Settings dialog",
		tabScript: "Script",
		tabPowershell: "PowerShell scripts",
		scriptsForStartup: "Scripts: “Startup” for Local Group Policy",
		scriptsForShutdown: "Scripts: “Shutdown” for Local Group Policy",
		columnName: "Script name",
		columnArguments: "Arguments",
		up: "Up",
		down: "Down",
		add: "Add",
		edit: "Edit",
		remove: "Remove",
		scriptsPathLabel: "The script files stored in this Group Policy object are located at the following path: -",
		psOrderLabel: "Execution order:",
		psOrderNotConfigured: "Not configured",
		psRequirement: "PowerShell scripts require Windows 7 or Windows Server 2008 R2 at a minimum",
		addTitle: "Add script",
		editTitle: "Edit script",
		nameLabel: "Script name:",
		argumentsLabel: "Script arguments:",
		nameRequired: "Enter a script name.",
		ok: "OK"
	};
	var policyChangedModal$1 = {
		title: "Save settings dialog",
		message: "Policy settings were modified do you want to save them?",
		no: "No",
		yes: "Yes"
	};
	var confirmModal$1 = { title: "Confirmation" };
	//#endregion
	//#region src/locales/ru.js
	var ru_exports = /* @__PURE__ */ __exportAll({
		chain: () => chain,
		collections: () => collections,
		common: () => common,
		confirmModal: () => confirmModal,
		editorStatus: () => editorStatus,
		gpo: () => gpo,
		header: () => header$1,
		menu: () => menu,
		navigation: () => navigation,
		policies: () => policies,
		policyChangedModal: () => policyChangedModal,
		policySearch: () => policySearch,
		preferences: () => preferences,
		security: () => security,
		systemSettings: () => systemSettings,
		tree: () => tree,
		treeView: () => treeView
	});
	var navigation = {
		path: "Текущее расположение",
		tree: "Навигация по политикам",
		catalog: "Каталог политик",
		keyboardHelp: "Стрелки переключают выделение; Enter открывает редактор; Delete удаляет элемент, если это разрешено. F6 переключает дерево и каталог."
	};
	var tree = {
		expand: "Раскрыть категорию",
		collapse: "Свернуть категорию"
	};
	var editorStatus = {
		errors: {
			authorization: "Недостаточно прав для работы с этой групповой политикой.",
			validation: "Проверьте значения отмеченных полей.",
			unsupported: "Эти данные пока нельзя безопасно изменить.",
			unsupported_content: "Эти данные пока нельзя безопасно изменить.",
			storage_conflict: "Политика была изменена другим редактором. Обновите данные.",
			publication_conflict: "Файлы политики сохранены, но публикация в каталоге конфликтует.",
			publication_recovery: "Публикация политики требует восстановления.",
			publication_pending: "Публикация политики не завершена.",
			recovery_operator_action: "Для восстановления публикации требуется действие оператора.",
			not_found: "Запрошенный объект больше не существует.",
			operational: "Не удалось выполнить операцию редактора."
		},
		details: {
			securityActionsList: "Действия над политиками безопасности должны быть переданы списком.",
			securityElementActionsList: "Действия над элементами политики безопасности должны быть переданы списком.",
			securityRowActionsList: "Действия над строками списка безопасности должны быть переданы списком.",
			listRequiresEntry: "Добавьте хотя бы один непустой элемент.",
			collectionInvalidEntry: "Откройте редактор списка и исправьте отмеченные элементы."
		},
		refresh: "Обновить",
		reconcile: "Согласовать публикацию",
		field: "Поле",
		technicalDetails: "Технические сведения",
		pending: "Предыдущая публикация политики не завершена."
	};
	var security = {
		dependency: {
			title: "Связанные параметры политик",
			intro: "Для сохранения этой политики необходимо также применить следующие связанные параметры.",
			policy: "Политика",
			value: "Значение",
			notConfigured: "Не настроено",
			apply: "Применить изменения",
			cancel: "Отмена",
			days: "дн.",
			minutes: "мин.",
			hours: "ч.",
			attempts: "попыток"
		},
		addRow: "Добавить строку",
		removeRow: "Удалить строку",
		damaged: "Повреждённая запись",
		securityDescriptor: "Дескриптор безопасности (SDDL)",
		saclHelp: "Введите полный список SACL в формате SDDL. Применение заменяет глобальный дескриптор аудита для этого типа объектов.",
		advancedAudit: {
			subcategories: {
				"0cce9210-69ae-11d9-bed3-505054503030": "Изменение состояния безопасности",
				"0cce9211-69ae-11d9-bed3-505054503030": "Расширение системы безопасности",
				"0cce9212-69ae-11d9-bed3-505054503030": "Целостность системы",
				"0cce9213-69ae-11d9-bed3-505054503030": "Драйвер IPsec",
				"0cce9214-69ae-11d9-bed3-505054503030": "Другие системные события",
				"0cce9215-69ae-11d9-bed3-505054503030": "Вход в систему",
				"0cce9216-69ae-11d9-bed3-505054503030": "Выход из системы",
				"0cce9217-69ae-11d9-bed3-505054503030": "Блокировка учётной записи",
				"0cce9218-69ae-11d9-bed3-505054503030": "Основной режим IPsec",
				"0cce9219-69ae-11d9-bed3-505054503030": "Быстрый режим IPsec",
				"0cce921a-69ae-11d9-bed3-505054503030": "Расширенный режим IPsec",
				"0cce921b-69ae-11d9-bed3-505054503030": "Специальный вход",
				"0cce921c-69ae-11d9-bed3-505054503030": "Другие события входа и выхода",
				"0cce921d-69ae-11d9-bed3-505054503030": "Файловая система",
				"0cce921e-69ae-11d9-bed3-505054503030": "Реестр",
				"0cce921f-69ae-11d9-bed3-505054503030": "Объект ядра",
				"0cce9220-69ae-11d9-bed3-505054503030": "SAM",
				"0cce9221-69ae-11d9-bed3-505054503030": "Службы сертификации",
				"0cce9222-69ae-11d9-bed3-505054503030": "События, инициированные приложением",
				"0cce9223-69ae-11d9-bed3-505054503030": "Операции с дескрипторами",
				"0cce9224-69ae-11d9-bed3-505054503030": "Общий файловый ресурс",
				"0cce9225-69ae-11d9-bed3-505054503030": "Отбрасывание пакетов платформой фильтрации",
				"0cce9226-69ae-11d9-bed3-505054503030": "Подключение платформы фильтрации",
				"0cce9227-69ae-11d9-bed3-505054503030": "Другие события доступа к объектам",
				"0cce9228-69ae-11d9-bed3-505054503030": "Использование конфиденциальных привилегий",
				"0cce9229-69ae-11d9-bed3-505054503030": "Использование неконфиденциальных привилегий",
				"0cce922a-69ae-11d9-bed3-505054503030": "Другие события использования привилегий",
				"0cce922b-69ae-11d9-bed3-505054503030": "Создание процесса",
				"0cce922c-69ae-11d9-bed3-505054503030": "Завершение процесса",
				"0cce922d-69ae-11d9-bed3-505054503030": "Действия DPAPI",
				"0cce922e-69ae-11d9-bed3-505054503030": "События RPC",
				"0cce922f-69ae-11d9-bed3-505054503030": "Изменение политики аудита",
				"0cce9230-69ae-11d9-bed3-505054503030": "Изменение политики проверки подлинности",
				"0cce9231-69ae-11d9-bed3-505054503030": "Изменение политики авторизации",
				"0cce9232-69ae-11d9-bed3-505054503030": "Изменение политики на уровне правил MPSSVC",
				"0cce9233-69ae-11d9-bed3-505054503030": "Изменение политики платформы фильтрации",
				"0cce9234-69ae-11d9-bed3-505054503030": "Другие события изменения политики",
				"0cce9235-69ae-11d9-bed3-505054503030": "Управление учётными записями пользователей",
				"0cce9236-69ae-11d9-bed3-505054503030": "Управление учётными записями компьютеров",
				"0cce9237-69ae-11d9-bed3-505054503030": "Управление группами безопасности",
				"0cce9238-69ae-11d9-bed3-505054503030": "Управление группами рассылки",
				"0cce9239-69ae-11d9-bed3-505054503030": "Управление группами приложений",
				"0cce923a-69ae-11d9-bed3-505054503030": "Другие события управления учётными записями",
				"0cce923b-69ae-11d9-bed3-505054503030": "Доступ к службе каталогов",
				"0cce923c-69ae-11d9-bed3-505054503030": "Изменения службы каталогов",
				"0cce923d-69ae-11d9-bed3-505054503030": "Репликация службы каталогов",
				"0cce923e-69ae-11d9-bed3-505054503030": "Подробная репликация службы каталогов",
				"0cce923f-69ae-11d9-bed3-505054503030": "Проверка учётных данных",
				"0cce9240-69ae-11d9-bed3-505054503030": "Операции с билетами службы Kerberos",
				"0cce9241-69ae-11d9-bed3-505054503030": "Другие события входа в учётную запись",
				"0cce9242-69ae-11d9-bed3-505054503030": "Служба проверки подлинности Kerberos",
				"0cce9243-69ae-11d9-bed3-505054503030": "Сервер политики сети",
				"0cce9244-69ae-11d9-bed3-505054503030": "Подробный аудит общих файловых ресурсов",
				"0cce9245-69ae-11d9-bed3-505054503030": "Съёмные носители",
				"0cce9246-69ae-11d9-bed3-505054503030": "Промежуточная политика центрального доступа",
				"0cce9247-69ae-11d9-bed3-505054503030": "Утверждения пользователя или устройства",
				"0cce9248-69ae-11d9-bed3-505054503030": "Действия PNP",
				"0cce9249-69ae-11d9-bed3-505054503030": "Членство в группах"
			},
			title: "Конфигурация расширенной политики аудита",
			systemPolicies: "Политики аудита системы",
			globalAccess: "Аудит глобального доступа к объектам",
			options: "Параметры аудита",
			preservedSettings: "Сохранённые параметры",
			registrySacl: "Глобальный SACL реестра",
			fileSacl: "Глобальный SACL файлов",
			preserved: "Сохранённая исходная запись",
			none: "Без аудита",
			includeSuccess: "Включить успех",
			excludeSuccess: "Исключить успех",
			includeFailure: "Включить отказ",
			excludeFailure: "Исключить отказ",
			opaqueSddl: "Исходный SDDL (сохранён)",
			unknownPreserved: "Неизвестная запись сохранена",
			unchanged: "Оставить без изменений",
			success: "Успех",
			failure: "Отказ",
			successAndFailure: "Успех и отказ",
			machineName: "Название политики в файле аудита",
			target: "Объект",
			system: "Система",
			user: "SID пользователя",
			auditSetting: "Параметр аудита",
			enableOption: "Включить этот параметр аудита",
			include_success: "Включить успех",
			exclude_success: "Исключить успех",
			include_failure: "Включить отказ",
			exclude_failure: "Исключить отказ",
			crash_on_audit_fail: "Аудит: немедленно отключать систему, если не удаётся записать события аудита безопасности",
			full_privilege_auditing: "Аудит: использование привилегий архивации и восстановления",
			audit_base_objects: "Аудит: доступ к глобальным системным объектам",
			audit_base_directories: "Аудит: доступ к глобальным объектам службы каталогов"
		},
		validationType: "Тип значения не соответствует определению.",
		validationInteger: "Введите целое число.",
		validationRange: "Введите значение из допустимого диапазона.",
		validationChoice: "Выберите значение из списка.",
		validationDescriptor: "Введите дескриптор безопасности без переносов строк.",
		unresolvedElement: "Не удалось отобразить параметр:",
		validationRows: "Добавьте хотя бы один элемент или оставьте политику ненастроенной.",
		validationKey: "Для каждого элемента требуется уникальный идентификатор.",
		validationDuplicate: "Идентификаторы элементов должны быть уникальными.",
		readOnlyCollection: "Этот список доступен только для чтения.",
		value: "Значение",
		title: "Параметры безопасности",
		policy: "Политика",
		policySetting: "Параметр политики",
		apply: "Применить",
		save: "Сохранить",
		saving: "Сохранение…",
		cancel: "Отмена",
		close: "Закрыть",
		keepEditing: "Продолжить редактирование",
		discardQuestion: "Отбросить несохранённые изменения?",
		discard: "Отбросить",
		properties: "Свойства",
		remove: "Удалить",
		removeItem: "Удаление элемента",
		removeQuestion: "Удалить этот элемент из политики?",
		addItem: "Добавить элемент",
		item: "Элемент",
		actions: "Действия",
		folder: "Папка",
		filter: "Поиск параметров",
		noMatches: "Подходящие параметры не найдены.",
		noItems: "Элементы ещё не настроены.",
		notConfigured: "Не задано",
		configured: "Задано",
		enabled: "Включено",
		disabled: "Выключено",
		emptyValue: "Пустой список",
		permissionsDefined: "Разрешения заданы",
		definePolicy: "Определить этот параметр политики",
		defineSetting: "Определить этот параметр политики",
		explanationTab: "Объяснение",
		settingTab: "Параметр политики безопасности",
		noExplanation: "Описание этого параметра отсутствует.",
		validationRequired: "Требуется значение.",
		serviceCatalogMissing: "Каталог служб ещё не предоставлен. Здесь показаны уже настроенные службы; дополнительные службы можно добавить по имени.",
		preservedReadOnly: "Этот параметр сохраняется без изменений и доступен только для чтения.",
		preservedTitle: "Сохранённые записи и диагностика",
		missingPolicy: "Определение политики безопасности больше недоступно.",
		auditUnavailable: "Расширенный аудит временно недоступен. Остальные параметры безопасности доступны.",
		validationGroupRelationship: "Задайте «Участники» или «Членство в группах». Допускается явно пустой список."
	};
	var common = {
		help: "Помощь:",
		description: "Описание:",
		options: "Опции:",
		comment: "Комментарий:",
		edit: "Редактировать",
		save: "Сохранить"
	};
	var menu = {
		groupPolicy: "Групповые политики",
		chains: "Цепочки",
		groupPolicyObjects: "Объекты групповых политик"
	};
	var chain = {
		enable: "Включить",
		disable: "Отключить",
		moveUp: "Переместить вверх",
		moveDown: "Переместить вниз",
		moveGpcUp: "Переместить GPC вверх",
		moveGpcDown: "Переместить GPC вниз",
		title: "Цепочка групповых политик",
		titlePlural: "Цепочки групповых политик",
		gpoTab: "Объекты групповых политик",
		statusActive: "Активна",
		statusInactive: "Неактивна",
		statusUnknown: "Неизвестно",
		enableConfirm: "Вы уверены, что хотите включить выбранную цепочку?",
		disableConfirm: "Вы уверены, что хотите отключить выбранную цепочку?",
		selectOneChainEnable: "Выберите ровно одну цепочку для включения",
		selectOneChainDisable: "Выберите ровно одну цепочку для отключения",
		selectOneGpc: "Выберите ровно один объект групповой политики",
		selectOneChainMove: "Выберите ровно одну цепочку для перемещения",
		enabledSuccessfully: "Цепочка «%s» успешно включена",
		disabledSuccessfully: "Цепочка «%s» успешно отключена",
		enableFailed: "Не удалось включить цепочку",
		disableFailed: "Не удалось отключить цепочку",
		movedUpSuccessfully: "Цепочка успешно перемещена вверх",
		movedDownSuccessfully: "Цепочка успешно перемещена вниз",
		moveUpFailed: "Не удалось переместить цепочку вверх: %s",
		moveDownFailed: "Не удалось переместить цепочку вниз: %s",
		movedSuccessfully: "Цепочка «%s» успешно перемещена",
		moveFailed: "Не удалось переместить цепочку",
		reorderFailed: "Не удалось изменить порядок цепочек",
		unableToDetermineChainUp: "Не удалось определить имя цепочки для перемещения вверх",
		unableToDetermineChainDown: "Не удалось определить имя цепочки для перемещения вниз",
		gpcMovedUp: "Объект групповой политики «%s» успешно перемещён вверх",
		gpcMovedDown: "Объект групповой политики «%s» успешно перемещён вниз",
		gpcMoveUpFailed: "Не удалось переместить объект групповой политики вверх",
		gpcMoveDownFailed: "Не удалось переместить объект групповой политики вниз",
		gpoMovedSuccessfully: "Объект групповой политики «%s» успешно перемещён",
		gpoMoveFailed: "Не удалось переместить объект групповой политики",
		gpoReorderFailed: "Не удалось изменить порядок объектов групповых политик",
		unableToDetermineGpo: "Не удалось определить имя объекта групповой политики",
		addTitle: "Добавить цепочку групповых политик",
		noChanges: "Изменений нет",
		updatedSuccessfully: "Цепочка «%s» успешно обновлена",
		fields: {
			cn: "Имя цепочки",
			description: "Описание",
			usergroup: "Группа пользователей",
			computergroup: "Группа компьютеров",
			active: "Активна",
			gplink: "Ссылки групповых политик",
			chainNameDoc: "Уникальное имя для цепочки групповых политик",
			descriptionDoc: "Человекочитаемое описание цепочки (необязательно)",
			userGroupDoc: "Выберите группу пользователей для этой цепочки",
			computerGroupDoc: "Выберите группу компьютеров для этой цепочки",
			gplinkDoc: "Выберите объекты групповых политик для связывания с этой цепочкой"
		}
	};
	var gpo = {
		title: "Объекты групповых политик",
		titleSingular: "Объект групповой политики",
		addTitle: "Добавить объект групповой политики",
		fields: {
			policyName: "Имя политики",
			guid: "GUID",
			version: "Версия",
			flags: "Флаги",
			identity: "Идентификация",
			distinguishedName: "Различающееся имя",
			versionNumber: "Номер версии",
			containerName: "Имя контейнера"
		},
		noChanges: "Изменений нет",
		updatedSuccessfully: "Объект групповой политики «%s» успешно обновлён",
		renamedSuccessfully: "Объект групповой политики переименован с «%s» на «%s» успешно",
		updateFailed: "Не удалось обновить объект групповой политики",
		patternError: "Имя политики может содержать только латинские буквы, цифры, «_», «-», «.» и «$»; см. 'ipa help Group Policy Object' для полного описания формата",
		cannotDetermineName: "Не удалось определить имя объекта групповой политики",
		gpuiInitializeFailed: "Не удалось инициализировать модуль GPUI",
		gpuiLoadFailed: "Не удалось загрузить модуль GPUI",
		addToChainTitle: "Добавить объекты групповых политик в цепочку",
		removeFromChainTitle: "Удалить объекты групповых политик из цепочки"
	};
	var collections = {
		edit: "Изменить…",
		view: "Просмотреть…",
		editLabel: "Изменить: {label}",
		viewLabel: "Просмотреть: {label}",
		add: "Добавить",
		remove: "Удалить",
		cancel: "Отмена",
		ok: "ОК",
		close: "Закрыть",
		key: "Ключ",
		value: "Значение",
		index: "№",
		empty: "Нет элементов",
		emptyValue: "(пусто)",
		noMatches: "Ничего не найдено",
		itemsCount: "Элементов: {count}",
		pairsCount: "Пар: {count}",
		shownCount: "Показано: {shown} из {total}",
		search: "Поиск элементов",
		cellLabel: "{column}, строка {index}",
		reorder: "Порядок",
		reorderRow: "Переместить строку {index}",
		reorderHelp: "Перетащите для изменения порядка. На этой кнопке Ctrl+↑/↓ перемещает строку.",
		clearSearchToReorder: "Очистите поиск, чтобы изменить порядок элементов.",
		moved: "Строка перемещена на позицию {index}.",
		added: "Новая строка добавлена в конец.",
		removed: "Выбранная строка удалена.",
		discardQuestion: "Отбросить несохранённые изменения?",
		errors: {
			minItems: "Добавьте хотя бы один элемент.",
			requiredKey: "Укажите ключ.",
			requiredValue: "Укажите значение.",
			duplicateKey: "Это имя уже используется.",
			invalidKey: "Это имя недопустимо.",
			invalidText: "Значение содержит нулевой символ.",
			tooLong: "Значение превышает допустимую длину.",
			keyTooLong: "Имя превышает допустимую длину.",
			invalidValue: "В коллекции есть неподдерживаемое значение."
		}
	};
	var policySearch = {
		description: "Поиск политик и параметров настройки по имени без раскрытия категорий.",
		categoryPlaceholder: "Поиск в этой категории",
		computerPlaceholder: "Поиск политик компьютера",
		userPlaceholder: "Поиск политик пользователя",
		noMatches: "Совпадающих политик нет.",
		loading: "Загрузка политик…",
		incomplete: "Список неполный: не удалось загрузить часть источников политик.",
		retry: "Повторить",
		refresh: "Обновить",
		name: "Политика",
		path: "Категория / тип",
		count: "Результаты: {matched} / {total}",
		page: "Страница {page} / {pages}",
		previous: "Назад",
		next: "Далее",
		back: "Ко всем политикам",
		invalidIndex: "Некорректный ответ каталога политик. Обновите список или повторите попытку.",
		targetUnavailable: "Этот параметр больше недоступен. Обновите список."
	};
	var policies = {
		parametersTab: "Параметры",
		allPolicies: "Все политики",
		title: "Политики",
		localGroupPolicy: "[Локальная групповая политика]",
		machine: "Компьютер",
		machineLevelPolicies: "Политики настройки компьютера",
		user: "Пользователь",
		userLevelPolicies: "Политики настройки пользователей",
		windowsSettings: "Конфигурация системы",
		scriptsComputer: "Сценарии (запуск/завершение)",
		scriptsUser: "Сценарии (вход/выход)",
		startup: "Запуск",
		shutdown: "Завершение работы",
		logon: "Вход в систему",
		logoff: "Выход из системы",
		adminTemplates: "Административные шаблоны",
		machineAdminTemplates: "Административные шаблоны компьютера",
		userAdminTemplates: "Пользовательские административные шаблоны",
		localGroupPolicies: "Шаблон локальных групповых политик",
		policy: "Политика:",
		policyState: "Состояние политики:",
		notConfigured: "Не сконфигурировано",
		enabled: "Включено",
		disabled: "Отключено",
		listOnePerLine: "Один элемент на строку",
		unsupportedDefault: "Значение по умолчанию шаблона не поддерживается; выберите значение явно.",
		unsupportedSource: "Политика содержит неподдерживаемые исходные значения и доступна только для чтения.",
		supportedOn: "Поддерживается на:"
	};
	var preferences = {
		title: "Настройки",
		description: "Политики настроек.",
		windowsSettings: "Конфигурация системы",
		controlPanelSettings: "Параметры компонентов",
		otherSettings: "Другие настройки",
		systemSettings: "Настройки Системы",
		systemSettingsDesc: "Политики устанавливающие настройки системы.",
		shortcuts: "Значки",
		environment: "Окружение",
		folders: "Папки",
		registry: "Реестр",
		driveMaps: "Сетевые диски",
		networkShares: "Сетевые папки",
		files: "Файлы",
		iniFiles: "Ini файлы",
		editor: {
			documentEditable: "Документ доступен для изменения",
			documentReadOnly: "Документ доступен только для чтения",
			emptyItems: "В этом документе нет элементов.",
			itemColumn: "Элемент",
			filtersColumn: "Выбор элементов",
			actionsColumn: "Действия",
			statusColumn: "Состояние",
			yes: "Да",
			no: "Нет",
			createTitle: "Создание элемента настройки",
			editTitle: "Изменение элемента настройки",
			viewTitle: "Сведения об элементе настройки",
			readonly: "Только чтение",
			specified: "Задано",
			unspecified: "Не задано",
			userContext: "Выполнять в контексте безопасности вошедшего пользователя (параметр политики пользователя)",
			applyOnce: "Применить только один раз",
			itemSelection: "Выбор элементов",
			filtersHeading: "Выбор элементов",
			tabBasic: "Основные настройки",
			tabGeneral: "Общие",
			targettingButton: "Нацеливание",
			targettingTitle: "Редактор нацеливания",
			selectFilter: "Выберите элемент для изменения его параметров.",
			filterType: "Тип фильтра",
			addFilter: "Добавить фильтр",
			replaceFilter: "Заменить тип",
			removeFilter: "Удалить фильтр",
			createTargetingItem: "Создать элемент",
			addTargetingCollection: "Добавить коллекцию",
			moveTargetingItem: "Переместить",
			dragTargetingItem: "Перетащите для перемещения; Ctrl+Вверх/Вниз — порядок, Ctrl+Влево/Вправо — вложенность.",
			targetingOperator: "Оператор",
			targetingKeyboardHelp: "Ctrl+Вверх/Вниз — порядок. Ctrl+Вправо — внутрь предыдущей коллекции. Ctrl+Влево — из родительской коллекции.",
			targetingKeyboardMoveUnavailable: "Сначала разместите элемент после коллекции с помощью Ctrl+Вверх/Вниз, затем переместите его внутрь.",
			expandTargetingCollection: "Раскрыть коллекцию",
			collapseTargetingCollection: "Свернуть коллекцию",
			targetingDestination: "Назначение",
			targetingPosition: "Позиция",
			targetingRoot: "Корневой уровень",
			targetingRootDrop: "Переместить в конец корневого уровня",
			targetingMoved: "Элемент перемещён в черновике.",
			targetingAnd: "И",
			targetingOr: "ИЛИ",
			targetingNot: "НЕ",
			invalidTargetingMove: "Нельзя переместить элемент внутрь него самого или его потомков.",
			targetingDepthLimit: "Такое размещение превышает допустимую глубину вложенных коллекций (64).",
			targetingEmpty: "Нажмите «Создать элемент» или «Добавить коллекцию».",
			targetingOk: "ОК",
			unsupportedFilterFields: "Поля этого элемента не поддерживаются. Его данные сохраняются при перемещении.",
			rename: "Имя",
			parent: "Родительская папка",
			validationRequired: "Это поле обязательно.",
			validationInvalidNumber: "Введите корректное число.",
			validationUnsignedByteRange: "Введите число от 0 до 255.",
			validationDate: "Выберите допустимую дату.",
			validationTime: "Введите корректное время.",
			validationIp: "Введите корректный IPv4-адрес.",
			validationIpv6: "Введите корректный IPv6-адрес, например 2001:db8::1.",
			validationMac: "Введите MAC-адрес в формате 00:11:22:33:44:55.",
			validationVersion: "Введите версию, например 1.2.3.4.",
			validationGuid: "Введите GUID в формате {12345678-1234-1234-1234-123456789ABC}.",
			validationRange: "Нижняя граница не должна превышать верхнюю.",
			validationValue: "Выберите поддерживаемое значение.",
			validationFixErrors: "Исправьте выделенные поля перед сохранением.",
			save: "Сохранить",
			saving: "Сохранение…",
			cancel: "Отмена",
			close: "Закрыть",
			delete: "Удалить",
			refresh: "Обновить",
			confirmSave: "Сохранить изменения?",
			confirmCancelDiscard: "Отменить и отбросить несохранённые изменения?",
			confirmCloseDiscard: "Закрыть и отбросить несохранённые изменения?",
			confirmDelete: "Удалить выбранный элемент настройки?",
			confirmRefreshDiscard: "Обновить данные с сервера и отбросить текущий черновик?",
			confirmDiscardChanges: "Отбросить несохранённые изменения?",
			reconcileSucceededRefresh: "Восстановление публикации завершено. Обновите элемент перед дальнейшим изменением.",
			settingsTitle: "Настройки:",
			descriptionTitle: "Описание:",
			noDescription: "Без описания",
			settingBypassErrors: "Игнорировать ошибки",
			settingRemovePolicy: "Remove policy",
			settingDisabled: "Disabled",
			columnName: "Название",
			columnOrder: "Очередность",
			columnAction: "Действие",
			columnTarget: "Target",
			columnPath: "Путь",
			columnSourcePath: "Source path",
			columnTargetPath: "Target path",
			columnShortcutPath: "Shortcut path",
			columnHive: "Куст",
			columnKey: "Ключ",
			columnUserLimit: "Лимит пользователей",
			columnAbe: "Перечисление на основе доступа",
			columnSection: "Секция",
			columnProperty: "Свойство",
			columnValue: "Значение",
			columnLetter: "Буква",
			columnDriver: "Драйвер",
			columnServer: "Сервер",
			columnDatabase: "База данных",
			columnDeviceClass: "Класс устройства",
			columnDeviceId: "ИД устройства",
			columnLocation: "Расположение",
			columnStartupType: "Тип запуска",
			columnServiceAction: "Действие службы",
			columnApplication: "Приложение",
			columnUserName: "Имя пользователя",
			columnIpAddress: "IP-адрес",
			columnSystemLocale: "Системный язык",
			actionCreate: "Создать",
			actionReplace: "Заменить",
			actionUpdate: "Обновить",
			actionDelete: "Удалить"
		}
	};
	var treeView = {
		loadingPolicies: "Loading policies...",
		unableToLoadPolicies: "Не удалось загрузить политики."
	};
	var header$1 = {
		create: "Создать",
		edit: "Изменить",
		delete: "Удалить",
		apply: "Применить",
		cancel: "Отмена",
		information: "Сведения"
	};
	var systemSettings = {
		systemSettings: "Настройки Системы",
		scripts: "Скрипты",
		startupScript: "Сценарий запуска",
		shutdownScript: "Сценарий завершения работы",
		logonScript: "Сценарии входа",
		logoffScript: "Сценарии выхода",
		startupScripts: "Сценарии запуска",
		shutdownScripts: "Сценарии завершения работы",
		eventTitle: "Сценарии: {event}",
		eventColumn: "Событие",
		scriptsColumn: "Сценарии",
		powershellColumn: "PowerShell",
		openEvent: "Открыть",
		openFolder: "Открыть каталог скриптов…",
		showFiles: "Показать файлы…",
		folderTitle: "Каталог скриптов",
		folderForEvent: "Файлы: {event}",
		eventSelector: "Событие",
		refresh: "Обновить",
		selectFromSysvol: "Выбрать файл на SYSVOL",
		usedBy: "Используется",
		closeDialog: "Закрыть",
		savingImmediately: "Изменения сразу сохраняются в этой политике.",
		saving: "Сохранение…",
		saved: "Сохранено.",
		loading: "Загрузка сценариев…",
		emptyEntries: "Сценарии не добавлены.",
		emptyAssets: "Нет файлов. Загрузите скрипт в эту папку.",
		classic: "Сценарии",
		powershell: "Сценарии PowerShell",
		managedFiles: "Файлы скриптов",
		columnSize: "Размер",
		columnReferences: "Ссылки",
		bytes: "байт",
		externalCommand: "Команда или внешний путь",
		existingAsset: "Файл этой политики",
		sourceLabel: "Источник сценария",
		selectFile: "Выбрать файл",
		browseFiles: "Обзор файлов политики…",
		addSelectedScript: "Добавить выбранный сценарий…",
		upload: "Загрузить",
		replaceFile: "Заменить файл",
		download: "Скачать",
		deleteFile: "Удалить файл",
		applyOrder: "Применить порядок",
		orderUnspecified: "Не настроено",
		orderClassicFirst: "Сначала сценарии",
		orderPowershellFirst: "Сначала PowerShell",
		removeEntryConfirm: "Удалить выбранный сценарий из этой политики?",
		deleteFileConfirm: "Удалить выбранный неиспользуемый файл сценария из этой политики?",
		deleteSelectedFilesConfirm: "Удалить выбранные неиспользуемые файлы сценариев из этой политики?",
		replaceFileConfirm: "Заменить содержимое выбранного файла сценария?",
		fileInUse: "Этот файл используется сценарием. Перед удалением уберите все ссылки на него.",
		readOnlyScripts: "Этот список сценариев нельзя изменить.",
		discardFormConfirm: "Отменить несохранённые изменения записи сценария?",
		uploadTooLarge: "Выбранный файл превышает допустимый размер загрузки.",
		invalidDownload: "Полученные данные сценария некорректны.",
		chooseFile: "Сначала выберите файл.",
		chooseCommand: "Введите команду или выберите файл.",
		close: "Закрыть",
		dialogTitle: "Диалог настроек",
		tabScript: "Сценарий",
		tabPowershell: "Скрипты PowerShell",
		scriptsForStartup: "Сценарии: “Запуск” для локальной групповой политики",
		scriptsForShutdown: "Сценарии: “Завершение работы” для локальной групповой политики",
		columnName: "Имя скрипта",
		columnArguments: "Аргументы",
		up: "Вверх",
		down: "Вниз",
		add: "Добавить",
		edit: "Изменить",
		remove: "Удалить",
		scriptsPathLabel: "Файлы сценариев, хранящиеся в этом объекте групповой политики, расположены по следующему пути: -",
		psOrderLabel: "Порядок выполнения:",
		psOrderNotConfigured: "Не настроено",
		psRequirement: "Для сценариев Powershell требуется как минимум Windows 7 или Windows Server 2008 R2",
		addTitle: "Добавить скрипт",
		editTitle: "Редактировать скрипт",
		nameLabel: "Имя скрипта:",
		argumentsLabel: "Аргументы скрипта:",
		nameRequired: "Введите имя скрипта.",
		ok: "Ок"
	};
	var policyChangedModal = {
		title: "Состояние настроек",
		message: "Настройки политики были изменены, хотите сохранить их?",
		no: "Нет",
		yes: "Да"
	};
	var confirmModal = { title: "Подтверждение" };
	//#endregion
	//#region src/locales/translations.js
	var translations_exports = /* @__PURE__ */ __exportAll({
		getLanguage: () => getLanguage,
		setLanguage: () => setLanguage,
		t: () => t
	});
	var translations = {
		en: en_exports,
		ru: ru_exports
	};
	var currentLang = "en";
	/**
	* Возвращает перевод по ключу для текущего языка (см. setLanguage).
	* Ключ — путь через точки во вложенном словаре локали, например 'dialog.title'.
	* Если ключ не найден (или путь обрывается на несуществующем уровне),
	* возвращается сам ключ, чтобы в интерфейсе было видно, чего не хватает.
	* Ключ должен указывать на строку: путь к вложенному словарю вернул бы объект, а не текст.
	*
	* @param {string} key Ключ перевода, например 'dialog.title'.
	* @returns {string} Перевод или сам ключ, если перевод не найден.
	*/
	function t(key) {
		const keys = key.split(".");
		let value = translations[currentLang];
		for (const k of keys) if (value && value[k] !== void 0) value = value[k];
		else return key;
		return value;
	}
	function setLanguage(lang) {
		if (translations[lang]) currentLang = lang;
	}
	function getLanguage() {
		return currentLang;
	}
	//#endregion
	//#region src/components/header/header.js
	function renderHeader(container) {
		const element = createElement("div", {
			className: "gp__header",
			children: [createElement("div", {
				className: "gp__header-left",
				children: [
					createElement("div", { className: "gp__search" }),
					createElement("div", { className: "gp__nav" }),
					createElement("div", {
						className: "gp__control",
						children: [
							createElement("button", {
								className: ["button", "preferences__btn-create"],
								text: t("header.create")
							}),
							createElement("button", {
								className: ["button", "preferences__btn-edit"],
								text: t("header.edit")
							}),
							createElement("button", {
								className: ["button", "preferences__btn-delete"],
								text: t("header.delete")
							})
						]
					})
				]
			}), createElement("div", {
				className: "gp__control-actions",
				children: [
					createElement("div", {
						className: "gp__control-admx",
						children: [createElement("button", {
							className: ["button", "admx__btn-apply"],
							text: t("header.apply")
						}), createElement("button", {
							className: ["button", "admx__btn-cancel"],
							text: t("header.cancel")
						})]
					}),
					createElement("div", { className: "gp__control-separator" }),
					createElement("div", {
						className: "gp__control-help",
						children: [createElement("button", {
							className: ["button", "btn-information"],
							text: t("header.information")
						})]
					})
				]
			})]
		});
		container.appendChild(element.getElement());
		return element;
	}
	//#endregion
	//#region src/components/tree-view/tree-view-list.js
	var expansionRuns = /* @__PURE__ */ new WeakMap();
	var selectionScrollRuns = /* @__PURE__ */ new WeakMap();
	function scrollTreeItemIntoView(element) {
		const pane = element && element.closest(".tree-view");
		if (!pane || !element.isConnected) return;
		const view = element.ownerDocument.defaultView;
		const run = {};
		selectionScrollRuns.set(pane, run);
		function reveal() {
			if (selectionScrollRuns.get(pane) !== run || !element.isConnected || !element.classList.contains("active") || !element.getClientRects().length) return;
			const bounds = element.getBoundingClientRect();
			const viewport = pane.getBoundingClientRect();
			const top = viewport.top + pane.clientTop;
			const left = viewport.left + pane.clientLeft;
			const bottom = top + pane.clientHeight;
			const right = left + pane.clientWidth;
			if (!pane.clientHeight || !pane.clientWidth || !bounds.height) return;
			const inset = 4;
			if (bounds.top - inset < top) pane.scrollTop += bounds.top - inset - top;
			else if (bounds.bottom + inset > bottom) pane.scrollTop += bounds.bottom + inset - bottom;
			let labelRight = (element.querySelector(".tree-item__title") || element).getBoundingClientRect().right + inset;
			const rowLeft = bounds.left - inset;
			if (labelRight - rowLeft > pane.clientWidth) labelRight = rowLeft + Math.min(80, pane.clientWidth);
			if (rowLeft < left) pane.scrollLeft += rowLeft - left;
			else if (labelRight > right) pane.scrollLeft += labelRight - right;
		}
		view.requestAnimationFrame(function() {
			if (selectionScrollRuns.get(pane) !== run) return;
			reveal();
			let animations = [], fallbackDuration = 0;
			let ancestor = element.parentElement;
			while (ancestor && ancestor !== pane) {
				if (ancestor.classList.contains("is-expanding")) {
					if (typeof ancestor.getAnimations === "function") animations = animations.concat(ancestor.getAnimations().filter(function(animation) {
						return animation.transitionProperty === "grid-template-rows";
					}));
					else fallbackDuration = Math.max(fallbackDuration, expansionDuration(ancestor));
				}
				ancestor = ancestor.parentElement;
			}
			if (animations.length) Promise.all(animations.map(function(animation) {
				return animation.finished.catch(function() {});
			})).then(function() {
				view.requestAnimationFrame(reveal);
			});
			else if (fallbackDuration > 0) view.setTimeout(function() {
				view.requestAnimationFrame(reveal);
			}, fallbackDuration + 50);
		});
	}
	function finishExpansion(element, run) {
		if (expansionRuns.get(element) !== run) return;
		expansionRuns.delete(element);
		element.classList.remove("is-expanding");
	}
	function watchExpansion(element, run, duration) {
		const view = element.ownerDocument.defaultView;
		view.requestAnimationFrame(function() {
			if (expansionRuns.get(element) !== run) return;
			if (typeof element.getAnimations === "function") {
				const animations = element.getAnimations().filter(function(animation) {
					return animation.transitionProperty === "grid-template-rows";
				});
				Promise.all(animations.map(function(animation) {
					return animation.finished.catch(function() {});
				})).then(function() {
					finishExpansion(element, run);
				});
			} else view.setTimeout(function() {
				finishExpansion(element, run);
			}, duration + 50);
		});
	}
	function expansionDuration(element) {
		const view = element.ownerDocument.defaultView;
		if (view.matchMedia("(prefers-reduced-motion: reduce)").matches) return 0;
		const style = view.getComputedStyle(element);
		function milliseconds(value) {
			return parseFloat(value) * (value.trim().endsWith("ms") ? 1 : 1e3) || 0;
		}
		const delays = style.transitionDelay.split(",").map(milliseconds);
		return Math.max.apply(null, style.transitionDuration.split(",").map(function(value, index) {
			return milliseconds(value) + delays[index % delays.length];
		}));
	}
	function visibleRows(root) {
		return Array.from(root.querySelectorAll(".tree-item")).filter(function(row) {
			let current = row.parentElement;
			while (current && current !== root) {
				if (current.matches("ul.tree-view__list") && current.style.display === "none") return false;
				current = current.parentElement;
			}
			return true;
		});
	}
	function syncTreeTabStop(root, previousFocus) {
		if (!root) return;
		const rows = visibleRows(root);
		let chosen = root.querySelector(".tree-item.active");
		while (chosen && rows.indexOf(chosen) === -1) {
			const group = chosen.parentElement.parentElement;
			const parent = group && group.closest("li.view");
			chosen = parent && parent.querySelector(":scope > .tree-item");
		}
		chosen = chosen || rows[0];
		root.tabIndex = rows.length ? -1 : 0;
		Array.from(root.querySelectorAll(".tree-item")).forEach(function(row) {
			row.tabIndex = row === chosen ? 0 : -1;
		});
		const focus = previousFocus || root.ownerDocument.activeElement;
		if (chosen && root.contains(focus) && !rows.some(function(row) {
			return row.contains(focus);
		})) chosen.focus({ preventScroll: true });
	}
	function syncSwitcher(switcher, item) {
		if (!switcher) return;
		const expandable = hasVisibleChildren(item);
		switcher.classList.toggle("icon-switcher--empty", !expandable);
		switcher.setAttribute("tabindex", "-1");
		switcher.setAttribute("aria-hidden", String(!expandable));
		switcher.setAttribute("aria-expanded", String(Boolean(item.opened)));
		switcher.setAttribute("aria-label", t(item.opened ? "tree.collapse" : "tree.expand") + ": " + item.title);
	}
	function hasVisibleChildren(item) {
		return Boolean(item && (item.lazy && !item.loaded || (item.children || []).some(function(child) {
			return child.showInTree !== false;
		})));
	}
	function setTreeItemActive(treeItemElement, container) {
		if (!treeItemElement) return null;
		(container || treeItemElement.closest("[role=\"tree\"]") || document).querySelectorAll(".tree-item").forEach(function(current) {
			current.classList.toggle("active", current === treeItemElement);
			current.setAttribute("aria-selected", String(current === treeItemElement));
			current.tabIndex = current === treeItemElement ? 0 : -1;
		});
		syncTreeTabStop(treeItemElement.closest("[role=\"tree\"]"));
		scrollTreeItemIntoView(treeItemElement);
		return treeItemElement;
	}
	function setFolderOpenedState(listItemElement, item, opened) {
		if (!item || item.type !== "folder") return Boolean(item && item.opened);
		const shouldOpen = Boolean(opened);
		item.opened = shouldOpen;
		if (!listItemElement) return shouldOpen;
		const nested = listItemElement.querySelector(":scope > ul.tree-view__list");
		const changed = listItemElement.classList.contains(shouldOpen ? "closed" : "opened");
		const duration = shouldOpen && changed && listItemElement.isConnected && nested ? expansionDuration(listItemElement) : 0;
		const continuing = shouldOpen && !changed && expansionRuns.has(listItemElement);
		const run = continuing ? expansionRuns.get(listItemElement) : {};
		if (!continuing) {
			expansionRuns.set(listItemElement, run);
			listItemElement.classList.toggle("is-expanding", duration > 0);
		}
		if (duration > 0) {
			nested.style.display = "";
			listItemElement.getBoundingClientRect();
		}
		listItemElement.classList.toggle("opened", shouldOpen);
		listItemElement.classList.toggle("closed", !shouldOpen);
		syncSwitcher(listItemElement.querySelector(":scope > .tree-item > .icon-switcher"), item);
		const treeItem = listItemElement.querySelector(":scope > .tree-item");
		if (treeItem && hasVisibleChildren(item)) treeItem.setAttribute("aria-expanded", String(shouldOpen));
		else if (treeItem) treeItem.removeAttribute("aria-expanded");
		const root = listItemElement.closest("[role=\"tree\"]");
		const previousFocus = root && root.ownerDocument.activeElement;
		if (nested) nested.style.display = shouldOpen ? "" : "none";
		syncTreeTabStop(root, previousFocus);
		if (duration > 0) watchExpansion(listItemElement, run, duration);
		else if (!continuing) finishExpansion(listItemElement, run);
		return shouldOpen;
	}
	function renderTreeList(items, treeViewState, parentItem) {
		(items || []).forEach(function(item) {
			if (item.showInTree === false && treeViewState) treeViewState.registerTreeNode(item, { parentItem: parentItem || null });
		});
		return createElement("ul", {
			className: "tree-view__list",
			attrs: {
				role: parentItem ? "group" : "tree",
				"aria-label": parentItem ? null : t("navigation.tree"),
				title: parentItem ? null : t("navigation.keyboardHelp")
			},
			children: (items || []).filter(function(item) {
				return item.showInTree !== false;
			}).map(function(item) {
				return renderTreeItem(item, treeViewState, parentItem || null);
			})
		});
	}
	function renderLoadError() {
		return createElement("li", {
			className: ["view", "tree-view__lazy-error"],
			text: "Не удалось загрузить раздел"
		});
	}
	function ensureLazyChildren(item, listItem, treeViewState) {
		if (!item || !item.lazy || item.loaded) return Promise.resolve(item && item.children || []);
		if (item.loadingPromise) return item.loadingPromise;
		listItem.classList.add("loading");
		item.loadingPromise = Promise.resolve().then(function() {
			return item.loadChildren();
		}).then(function(children) {
			item.children = Array.isArray(children) ? children : [];
			item.loaded = true;
			syncSwitcher(listItem.querySelector(":scope > .tree-item > .icon-switcher"), item);
			const oldNested = listItem.querySelector(":scope > ul.tree-view__list");
			if (oldNested) oldNested.remove();
			listItem.appendChild(renderTreeList(item.children, treeViewState, item).getElement());
			setFolderOpenedState(listItem, item, item.opened);
			return item.children;
		}).catch(function(error) {
			console.error("[tree-view] Failed to load children.", error);
			const oldNested = listItem.querySelector(":scope > ul.tree-view__list");
			if (oldNested) oldNested.remove();
			listItem.appendChild(createElement("ul", {
				className: "tree-view__list",
				children: [renderLoadError()]
			}).getElement());
			setFolderOpenedState(listItem, item, item.opened);
			throw error;
		}).finally(function() {
			listItem.classList.remove("loading");
			item.loadingPromise = null;
		});
		return item.loadingPromise;
	}
	function renderTreeItem(item, treeViewState, parentItem) {
		const isFolder = item.type === "folder";
		const classes = ["view", isFolder ? "folder" : "file"];
		if (isFolder) classes.push(item.opened ? "opened" : "closed");
		const treeItem = createElement("span", {
			className: "tree-item",
			attrs: {
				role: "treeitem",
				tabindex: parentItem ? "-1" : "0",
				"aria-selected": "false",
				"aria-label": item.title,
				"aria-expanded": isFolder && hasVisibleChildren(item) ? String(Boolean(item.opened)) : null
			},
			children: [
				isFolder ? createElement("span", {
					className: ["icon-switcher", hasVisibleChildren(item) ? null : "icon-switcher--empty"],
					attrs: { role: "button" }
				}) : null,
				isFolder ? createElement("span", {
					className: "tree-view__status-spinner",
					attrs: { "aria-hidden": "true" }
				}) : null,
				item.icon ? createElement("span", { className: ["icon", item.icon] }) : null,
				createElement("span", {
					className: "tree-item__title",
					text: item.title
				})
			]
		});
		const listItem = createElement("li", {
			className: classes,
			children: [treeItem]
		});
		const listElement = listItem.getElement();
		const switcher = isFolder ? treeItem.getElement().querySelector(".icon-switcher") : null;
		syncSwitcher(switcher, item);
		function toggleExpansion() {
			if (!hasVisibleChildren(item)) return;
			if (treeViewState) treeViewState.toggleFolder(item);
			else setFolderOpenedState(listElement, item, !item.opened);
		}
		function selectFromKeyboard(element) {
			if (!element) return;
			if (!treeViewState) {
				setTreeItemActive(element);
				element.focus({ preventScroll: true });
				return;
			}
			const target = element._gpoTreeItem;
			if (!target) return;
			const result = treeViewState.navigateToNode(target, {
				treeItemElement: element,
				openPath: true
			});
			Promise.resolve(result).then(function(selected) {
				if (selected === false || treeViewState.pendingNavigation || !element.isConnected) return;
				if (treeViewState.selectedItem && treeViewState.selectedItem.item === target) element.focus({ preventScroll: true });
			});
		}
		treeItem.getElement()._gpoTreeItem = item;
		treeItem.on("keydown", function(event) {
			if (event.defaultPrevented || event.ctrlKey || event.altKey || event.metaKey || event.shiftKey) return;
			if (event.target.closest("button, input, textarea, select, a, [contenteditable]")) return;
			const root = treeItem.getElement().closest("[role=\"tree\"]");
			if (!root) return;
			const rows = visibleRows(root);
			const index = rows.indexOf(treeItem.getElement());
			let next = null;
			if (event.key === "ArrowUp") next = rows[Math.max(0, index - 1)];
			else if (event.key === "ArrowDown") next = rows[Math.min(rows.length - 1, index + 1)];
			else if (event.key === "Home") next = rows[0];
			else if (event.key === "End") next = rows[rows.length - 1];
			else if (event.key === "ArrowRight") {
				if (isFolder && hasVisibleChildren(item)) {
					if (!item.opened) toggleExpansion();
					else next = listElement.querySelector(":scope > ul > li > .tree-item");
				}
			} else if (event.key === "ArrowLeft") {
				if (isFolder && item.opened && hasVisibleChildren(item)) toggleExpansion();
				else next = listElement.parentElement && listElement.parentElement.closest("li.view") && listElement.parentElement.closest("li.view").querySelector(":scope > .tree-item");
			} else if (event.key === "Enter") {
				if (treeViewState && treeViewState.selectedItem && treeViewState.selectedItem.item === item && isFolder) toggleExpansion();
				else next = treeItem.getElement();
			} else if (event.key === " " || event.key === "Spacebar") next = treeItem.getElement();
			else return;
			event.preventDefault();
			event.stopPropagation();
			if (next) selectFromKeyboard(next);
		});
		if (switcher) switcher.addEventListener("keydown", function(event) {
			if (event.key !== "Enter" && event.key !== " ") return;
			event.preventDefault();
			event.stopPropagation();
			toggleExpansion();
		});
		if (treeViewState) treeViewState.registerTreeNode(item, {
			treeItemElement: treeItem.getElement(),
			listItemElement: listElement,
			parentItem: parentItem || null
		});
		if (isFolder && !item.lazy && hasVisibleChildren(item)) {
			listItem.append(renderTreeList(item.children, treeViewState, item));
			setFolderOpenedState(listElement, item, item.opened);
		}
		treeItem.on("click", function(event) {
			event.stopPropagation();
			const clicked = event.currentTarget;
			if (isFolder && event.target instanceof Element && event.target.closest(".icon-switcher")) {
				toggleExpansion();
				return;
			}
			if (!treeViewState) {
				setTreeItemActive(clicked);
				return;
			}
			if (isFolder && treeViewState.selectedItem && treeViewState.selectedItem.item === item) {
				toggleExpansion();
				clicked.focus({ preventScroll: true });
				return;
			}
			treeViewState.navigateToNode(item, {
				treeItemElement: clicked,
				openPath: true
			});
		});
		return listItem;
	}
	function renderTreeViewList(data, workspace, treeViewState) {
		const treeData = Array.isArray(data) ? data : [];
		if (workspace && treeViewState) {
			treeViewState.setWorkspace(workspace);
			treeViewState.setTreeData(treeData);
		}
		return renderTreeList(treeData, treeViewState, null);
	}
	//#endregion
	//#region src/util/API.ts
	/**
	* High-level GPO editor RPC client.
	*
	* The browser intentionally retains only the selected GPO display name and
	* opaque identifiers returned by the server.  Filesystem, registry and
	* libadmix binding details never cross this boundary.
	*/
	var selectedDisplayName = null;
	var editorOpenPromise = null;
	var editorOpenResult = null;
	function clone$4(value) {
		if (value === void 0) return void 0;
		return JSON.parse(JSON.stringify(value));
	}
	/** What the FreeIPA transport hands over: a JSON-RPC answer, possibly wrapped once more, or nothing. */
	function unwrapResponse(data) {
		const outer = data && data.result !== void 0 ? data.result : data;
		const payload = outer && outer.result !== void 0 ? outer.result : outer;
		return payload === null || payload === void 0 ? {} : payload;
	}
	function firstObject(candidates) {
		for (let i = 0; i < candidates.length; i += 1) {
			const candidate = candidates[i];
			if (candidate && typeof candidate === "object") return candidate;
		}
		return {};
	}
	/** The error of an editor call, in one shape whatever FreeIPA or the server reported (see `normalizeError`). */
	var EditorError = class extends Error {
		category;
		code;
		field;
		path;
		details;
		pendingPublication;
		constructor(message, details) {
			super(message || "GPO editor request failed");
			const info = details || {};
			this.name = "GpoEditorError";
			let inferredCategory = info.category || info.error_category || null;
			const errorName = String(info.name || info.error_name || "");
			if (!inferredCategory && /ACIError|Authorization|NotAllowed/i.test(errorName + " " + (message || ""))) inferredCategory = "authorization";
			this.category = inferredCategory || (typeof info.code === "string" ? info.code : null) || "operational";
			this.code = info.code || this.category;
			this.field = info.field || null;
			this.path = info.path || null;
			let parsedDetails = info.details;
			if (typeof parsedDetails === "string") try {
				parsedDetails = JSON.parse(parsedDetails);
			} catch {}
			this.details = parsedDetails && typeof parsedDetails === "object" ? parsedDetails : info;
			this.pendingPublication = info.pending_publication || info.pendingPublication || this.details && this.details.pending_publication || null;
		}
	};
	function normalizeError(xhr, textStatus, thrown) {
		if (thrown instanceof EditorError) return thrown;
		const response = xhr && (xhr.responseJSON || xhr.response || xhr.data);
		const responseError = response && response.error ? response.error : response;
		const thrownData = thrown && (thrown.data || thrown.details || thrown.error);
		const details = firstObject([
			thrownData && thrownData.error && thrownData.error.data,
			thrownData && thrownData.data,
			responseError && responseError.data,
			thrownData,
			responseError,
			thrown
		]);
		const message = details.message || thrown && thrown.message || responseError && responseError.message || textStatus || "GPO editor request failed";
		return new EditorError(String(message), details);
	}
	function normalizeLocale(locale) {
		const parts = String(locale || "").replace("_", "-").split("-").filter(Boolean);
		if (parts.length === 0) return "en-US";
		const language = parts[0].toLowerCase();
		if (parts.length === 1) {
			if (language === "ru") return "ru-RU";
			if (language === "en") return "en-US";
			return language;
		}
		return language + "-" + parts[1].toUpperCase();
	}
	function localePreferences() {
		const uiLocale = getLanguage();
		let browserLocales = [];
		if (typeof navigator !== "undefined") browserLocales = Array.isArray(navigator.languages) && navigator.languages.length ? [...navigator.languages] : [navigator.language];
		const result = [];
		[uiLocale].concat(browserLocales, ["en-US"]).forEach(function(locale) {
			const normalized = normalizeLocale(locale);
			if (normalized && result.indexOf(normalized) === -1) result.push(normalized);
		});
		return result;
	}
	function requireDisplayName() {
		if (!selectedDisplayName) throw new EditorError("No GPO is selected", {
			category: "validation",
			field: "displayname"
		});
		return selectedDisplayName;
	}
	function execute(method, args, options) {
		let displayName;
		try {
			displayName = requireDisplayName();
		} catch (error) {
			return Promise.reject(error);
		}
		return new Promise(function(resolve, reject) {
			const commandOptions = Object.assign({ version: freeipa_ipa.default.api_version }, clone$4(options || {}));
			freeipa_rpc.default.command({
				entity: "gpo",
				method,
				retry: !/^editor_(security|advanced_audit|script|policy_index)/.test(method),
				args: [displayName].concat(clone$4(args || [])),
				options: commandOptions,
				on_success: function(data) {
					resolve(unwrapResponse(data));
				},
				on_error: function(xhr, textStatus, thrown) {
					reject(normalizeError(xhr, textStatus, thrown));
				}
			}).execute();
		});
	}
	function withLocales(options) {
		return Object.assign({}, options || {}, { locales: localePreferences() });
	}
	function rememberEnvelope(result) {
		const cached = editorOpenResult;
		if (!cached || !result || typeof result !== "object") return result;
		const target = cached;
		[
			"gpo",
			"template",
			"diagnostics",
			"pending_publication"
		].forEach(function(key) {
			if (Object.prototype.hasOwnProperty.call(result, key)) target[key] = clone$4(result[key]);
		});
		return result;
	}
	function initialize$1(displayName) {
		selectedDisplayName = displayName ? String(displayName) : null;
		editorOpenResult = null;
		editorOpenPromise = selectedDisplayName ? execute("editor_open", [], withLocales()).then(function(result) {
			editorOpenResult = result;
			return result;
		}) : Promise.reject(new EditorError("No GPO is selected", {
			category: "validation",
			field: "displayname"
		}));
		return editorOpenPromise;
	}
	function open$4(options) {
		if (!options && editorOpenResult) return Promise.resolve(editorOpenResult);
		if (!options && editorOpenPromise) return editorOpenPromise;
		return execute("editor_open", [], withLocales(options)).then(function(result) {
			editorOpenResult = result;
			return result;
		});
	}
	function children(scope, categoryId) {
		const options = {};
		if (categoryId !== null && categoryId !== void 0) options.category_id = categoryId;
		return execute("editor_children", [scope], withLocales(options));
	}
	function policyIndex(scope) {
		return execute("editor_policy_index", [scope], withLocales());
	}
	function policyShow(scope, policyId) {
		return execute("editor_policy_show", [scope, policyId], withLocales());
	}
	function policyUpdate(scope, policyId, request) {
		return execute("editor_policy_update", [scope, policyId], withLocales({ request: clone$4(request || {}) })).then(rememberEnvelope);
	}
	function preferenceItems(scope, kind) {
		return execute("editor_preference_items", [scope, kind], {});
	}
	function preferenceShow(scope, kind, identity) {
		return execute("editor_preference_show", [scope, kind], { request: { identity: identity === void 0 ? null : clone$4(identity) } });
	}
	function preferenceCreate(scope, kind, request) {
		return execute("editor_preference_create", [scope, kind], { request: clone$4(request || {}) }).then(rememberEnvelope);
	}
	function preferenceUpdate(scope, kind, request) {
		return execute("editor_preference_update", [scope, kind], { request: clone$4(request || {}) }).then(rememberEnvelope);
	}
	function preferenceDelete(scope, kind, identity) {
		return execute("editor_preference_delete", [scope, kind], { request: { identity: clone$4(identity) } }).then(rememberEnvelope);
	}
	function scriptsShow(scope, event) {
		return execute("editor_scripts_show", [scope, event], {});
	}
	function scriptEntryAdd(scope, event, request) {
		return execute("editor_script_entry_add", [scope, event], { request: clone$4(request || {}) }).then(rememberEnvelope);
	}
	function scriptEntryUpdate(scope, event, request) {
		return execute("editor_script_entry_update", [scope, event], { request: clone$4(request || {}) }).then(rememberEnvelope);
	}
	function scriptEntryRemove(scope, event, request) {
		return execute("editor_script_entry_remove", [scope, event], { request: clone$4(request || {}) }).then(rememberEnvelope);
	}
	function scriptEntriesReorder(scope, event, request) {
		return execute("editor_script_entries_reorder", [scope, event], { request: clone$4(request || {}) }).then(rememberEnvelope);
	}
	function scriptOrderUpdate(scope, event, request) {
		return execute("editor_script_order_update", [scope, event], { request: clone$4(request || {}) }).then(rememberEnvelope);
	}
	function scriptAssetUpload(scope, event, request) {
		return execute("editor_script_asset_upload", [scope, event], { request: clone$4(request || {}) }).then(rememberEnvelope);
	}
	function scriptAssetReplace(scope, event, request) {
		return execute("editor_script_asset_replace", [scope, event], { request: clone$4(request || {}) }).then(rememberEnvelope);
	}
	function scriptAssetDelete(scope, event, request) {
		return execute("editor_script_asset_delete", [scope, event], { request: clone$4(request || {}) }).then(rememberEnvelope);
	}
	function scriptAssetDownload(scope, event, request) {
		return execute("editor_script_asset_download", [scope, event], { request: clone$4(request || {}) });
	}
	function reconcile() {
		return execute("editor_reconcile", [], {}).then(rememberEnvelope);
	}
	function securityDefinitionsShow() {
		return execute("editor_security_definitions_show", [], withLocales());
	}
	function securityDefinitionsUpdate(request) {
		return execute("editor_security_definitions_update", [], withLocales({ request: clone$4(request || {}) })).then(rememberEnvelope);
	}
	function advancedAuditShow() {
		return execute("editor_advanced_audit_show", [], {});
	}
	function advancedAuditUpdate(request) {
		return execute("editor_advanced_audit_update", [], { request: clone$4(request || {}) }).then(rememberEnvelope);
	}
	var getDisplayName = function() {
		return selectedDisplayName;
	};
	//#endregion
	//#region src/components/templates/security/model.js
	function identity$1(namespace, id) {
		return String(namespace || "") + "\0" + String(id || "");
	}
	function reference$1(value) {
		if (Array.isArray(value)) return {
			namespace: value[0],
			id: value[1]
		};
		return value || {
			namespace: "",
			id: ""
		};
	}
	function inferredControl(element) {
		return {
			kind: element.value_type === "string" ? "text_box" : element.value_type,
			element_id: element.id,
			label: element.id,
			read_only: false,
			children: []
		};
	}
	function buildSecurityModel(response) {
		const result = response || {};
		const catalog = result.security_catalog || {};
		const snapshot = result.security_snapshot || {};
		const states = /* @__PURE__ */ new Map();
		(snapshot.policies || []).forEach(function(state) {
			states.set(identity$1(state.namespace, state.policy_id), state);
		});
		const categories = /* @__PURE__ */ new Map();
		(catalog.categories || []).forEach(function(category) {
			categories.set(identity$1(category.namespace, category.id), {
				namespace: category.namespace,
				id: category.id,
				label: category.display_name || category.id,
				parent: category.parent ? reference$1(category.parent) : null,
				categories: [],
				policies: []
			});
		});
		const policies = /* @__PURE__ */ new Map();
		(catalog.policies || []).forEach(function(definition) {
			const key = identity$1(definition.namespace, definition.policy_id);
			const category = reference$1(definition.category);
			const policy = {
				namespace: definition.namespace,
				policyId: definition.policy_id,
				definition,
				state: states.get(key) || {
					namespace: definition.namespace,
					policy_id: definition.policy_id,
					state: "undefined"
				},
				controls: (definition.controls || []).length ? definition.controls : (definition.elements || []).map(inferredControl),
				diagnostics: (snapshot.diagnostics || []).filter(function(diagnostic) {
					return !diagnostic.policy_id || diagnostic.policy_id === definition.policy_id;
				})
			};
			policies.set(key, policy);
			const owner = categories.get(identity$1(category.namespace, category.id));
			if (owner) owner.policies.push(policy);
		});
		const roots = [];
		categories.forEach(function(category) {
			const parent = category.parent && categories.get(identity$1(category.parent.namespace, category.parent.id));
			if (parent && parent !== category) parent.categories.push(category);
			else roots.push(category);
		});
		function compare(left, right) {
			return String(left.label || left.definition && left.definition.display_name || "").localeCompare(String(right.label || right.definition && right.definition.display_name || ""));
		}
		categories.forEach(function(category) {
			category.categories.sort(compare);
			category.policies.sort(compare);
		});
		roots.sort(compare);
		return {
			response: result,
			catalog,
			snapshot,
			categories: roots,
			policies,
			preserved: snapshot.preserved || [],
			diagnostics: snapshot.diagnostics || []
		};
	}
	function policyNode$1(model, policy) {
		const collection = collectionElement(policy);
		return {
			title: policy.definition.display_name || policy.policyId,
			type: collection ? "folder" : "file",
			icon: collection ? "ico-folder" : "ico-file",
			template: "security",
			showInTree: Boolean(collection),
			children: collection ? [] : void 0,
			securityCollection: collection ? collection.id : void 0,
			securityModel: model,
			securityPolicy: {
				namespace: policy.namespace,
				policy_id: policy.policyId
			},
			help: policy.definition.explain_text || void 0
		};
	}
	function collectionElement(policy) {
		const elements = policy && policy.definition.elements || [];
		return elements.length === 1 && elements[0].value_type === "collection" ? elements[0] : null;
	}
	function writableElement(policy, id) {
		let matched = false, writable = false;
		function visit(controls, inherited) {
			(controls || []).forEach(function(control) {
				const readOnly = inherited || control.read_only;
				if (control.element_id === id) {
					matched = true;
					writable = writable || !readOnly;
				}
				visit(control.children, readOnly);
			});
		}
		visit(policy.controls, false);
		return !matched || writable;
	}
	function categoryNodes(model, categories) {
		const groups = /* @__PURE__ */ new Map();
		(categories || []).forEach(function(category) {
			const namespace = String(category.namespace || "");
			const key = namespace.indexOf("urn:altlinux:sdmx:policies:") === 0 ? "basealt\0" + identity$1(category.id, category.label) : "qualified\0" + identity$1(namespace, category.id);
			let group = groups.get(key);
			if (!group) {
				group = {
					label: category.label,
					categories: [],
					policies: []
				};
				groups.set(key, group);
			}
			group.categories.push.apply(group.categories, category.categories);
			group.policies.push.apply(group.policies, category.policies);
		});
		return Array.from(groups.values()).map(function(group) {
			group.policies.sort(function(left, right) {
				return String(left.definition.display_name || left.policyId).localeCompare(String(right.definition.display_name || right.policyId));
			});
			if (!group.categories.length && group.policies.length === 1 && collectionElement(group.policies[0])) {
				const collectionNode = policyNode$1(model, group.policies[0]);
				collectionNode.title = group.label;
				return collectionNode;
			}
			return {
				title: group.label,
				type: "folder",
				opened: false,
				icon: "ico-folder",
				template: "security",
				securityCategory: true,
				securityModel: model,
				children: categoryNodes(model, group.categories).concat(group.policies.map(function(policy) {
					return policyNode$1(model, policy);
				}))
			};
		}).sort(function(left, right) {
			return left.title.localeCompare(right.title);
		});
	}
	function navigationNodes(response) {
		const model = buildSecurityModel(response);
		const nodes = categoryNodes(model, model.categories);
		if (model.preserved.length || model.diagnostics.length) nodes.push({
			title: t("security.preservedTitle"),
			type: "file",
			icon: "ico-file",
			template: "security",
			showInTree: true,
			securityModel: model,
			securityPreserved: true,
			readOnly: true
		});
		return nodes.sort(function(left, right) {
			return left.title.localeCompare(right.title);
		});
	}
	function policy(model, ref) {
		return model && ref ? model.policies.get(identity$1(ref.namespace, ref.policy_id)) || null : null;
	}
	function elementState(policyModel, elementId) {
		if (!policyModel || policyModel.state.state !== "defined") return { state: "unset" };
		return policyModel.state.elements && policyModel.state.elements[elementId] || { state: "unset" };
	}
	//#endregion
	//#region src/components/templates/advanced-audit/model.js
	var OPTION_LABELS = {
		crash_on_audit_fail: "Audit: Shut down system immediately if unable to log security audits",
		full_privilege_auditing: "Audit: Audit the use of Backup and Restore privilege",
		audit_base_objects: "Audit: Audit the access of global system objects",
		audit_base_directories: "Audit: Audit the access of global directory service objects"
	};
	function tr$7(key, fallback) {
		const value = t("security.advancedAudit." + key);
		return value && value !== "security.advancedAudit." + key ? value : fallback;
	}
	function state(response) {
		return response && response.advanced_audit || {
			rows: [],
			subcategory_catalog: []
		};
	}
	function configuredRows$1(response) {
		return Array.isArray(state(response).rows) ? state(response).rows : [];
	}
	function normalizedGuid(guid) {
		return String(guid || "").replace(/^\{|\}$/g, "").toLowerCase();
	}
	function localizedSubcategory(row) {
		return Object.assign({}, row, { display_name: tr$7("subcategories." + normalizedGuid(row.guid), row.display_name || row.guid) });
	}
	function subcategories(response) {
		const rows = configuredRows$1(response).filter(function(row) {
			return row.kind === "subcategory";
		}).map(localizedSubcategory);
		const systemGuids = new Set(rows.filter(function(row) {
			return row.target && row.target.kind === "system";
		}).map(function(row) {
			return normalizedGuid(row.guid);
		}));
		(state(response).subcategory_catalog || []).forEach(function(entry) {
			if (systemGuids.has(normalizedGuid(entry.guid))) return;
			rows.push(localizedSubcategory({
				kind: "subcategory",
				guid: entry.guid,
				machine_name: entry.machine_name,
				display_name: entry.display_name,
				target: { kind: "system" },
				setting: {
					kind: "system",
					value: "unchanged"
				},
				configured: false,
				editable: true
			}));
		});
		return rows;
	}
	function options(response) {
		const rows = configuredRows$1(response).filter(function(row) {
			return row.kind === "option";
		}).map(function(row) {
			return Object.assign({}, row, { display_name: Object.prototype.hasOwnProperty.call(OPTION_LABELS, row.option) ? tr$7(row.option, OPTION_LABELS[row.option]) : row.display_name || row.machine_name || row.option });
		});
		const byOption = new Set(rows.map(function(row) {
			return row.option;
		}));
		Object.keys(OPTION_LABELS).forEach(function(option) {
			if (!byOption.has(option)) rows.push({
				kind: "option",
				option,
				machine_name: state(response).suggested_machine_name || "",
				display_name: tr$7(option, OPTION_LABELS[option]),
				enabled: false,
				configured: false,
				editable: true
			});
		});
		return rows;
	}
	function globalSacls(response) {
		const rows = configuredRows$1(response).filter(function(row) {
			return row.kind === "global_sacl";
		});
		const kinds = new Set(rows.map(function(row) {
			return row.object_kind;
		}));
		["file", "registry"].forEach(function(kind) {
			if (!kinds.has(kind)) rows.push({
				kind: "global_sacl",
				object_kind: kind,
				sddl: "",
				semantic_acl_editor: false,
				configured: false,
				editable: true
			});
		});
		return rows;
	}
	function preserved(response) {
		return configuredRows$1(response).filter(function(row) {
			return row.kind === "preserved";
		});
	}
	function families(response) {
		return [
			{
				id: "system_audit_policies",
				label: tr$7("systemPolicies", "System Audit Policies"),
				rows: subcategories(response)
			},
			{
				id: "global_object_access_auditing",
				label: tr$7("globalAccess", "Global Object Access Auditing"),
				rows: globalSacls(response)
			},
			{
				id: "audit_options",
				label: tr$7("options", "Audit Options"),
				rows: options(response)
			},
			{
				id: "preserved_advanced_audit",
				label: tr$7("preservedSettings", "Preserved Settings"),
				rows: preserved(response)
			}
		].filter(function(family) {
			return family.rows.length > 0;
		});
	}
	function navigationNode(response) {
		return {
			title: tr$7("title", "Advanced Audit Policy Configuration"),
			type: "folder",
			opened: false,
			icon: "ico-folder",
			children: families(response).map(function(family) {
				return {
					title: family.label,
					type: "file",
					icon: "ico-folder",
					showInTree: true,
					template: "advanced_audit",
					advancedAuditFamilyId: family.id,
					advancedAuditResponse: response
				};
			}).sort(function(a, b) {
				return a.title.localeCompare(b.title);
			})
		};
	}
	function familyById(response, id) {
		return families(response).find(function(family) {
			return family.id === id;
		}) || null;
	}
	//#endregion
	//#region src/components/editor-icons.js
	/** Semantic, presentation-only icons shared by the tree and editor catalogs. */
	var preferenceIcons = Object.freeze({
		applications: "applications",
		control_panel: "components",
		data_sources: "database",
		devices: "device",
		drives: "drive",
		environment_variables: "environment",
		files: "files",
		folder_options: "folder-settings",
		folders: "folder",
		ini_files: "ini",
		internet_settings: "browser",
		local_users_and_groups: "users",
		network_options: "network",
		network_shares: "shared-folder",
		power_options: "power",
		printers: "printer",
		regional_options: "globe",
		registry: "registry",
		scheduled_tasks: "scheduled-task",
		services: "services",
		shortcuts: "shortcut",
		start_menu: "start-menu"
	});
	var targetingIcons = Object.freeze({
		battery: "battery",
		computer: "computer",
		cpu: "cpu",
		date: "calendar",
		disk: "drive",
		domain: "domain",
		dun: "connection",
		file: "file-match",
		ip_range: "ip-range",
		language: "language",
		ldap: "directory-query",
		mac_range: "network-card",
		msi: "package-query",
		org_unit: "org-unit",
		pcmcia: "expansion-card",
		portable: "laptop",
		proc_mode: "processing",
		ram: "memory",
		run_once: "run-once",
		site: "site",
		terminal: "terminal",
		time: "clock",
		user: "user",
		variable: "environment",
		os: "system",
		registry: "registry",
		wmi: "system-query",
		group: "security-group",
		collection: "collection"
	});
	var categories = Object.freeze({
		system_settings: "system-settings",
		control_panel_settings: "components",
		other_settings: "other-settings"
	});
	var scriptEvents = Object.freeze({
		startup: "script-start",
		shutdown: "script-stop",
		logon: "script-logon",
		logoff: "script-logoff"
	});
	function icon(name) {
		return "gpo-icon gpo-icon-" + name;
	}
	function mapped(table, key, fallback) {
		return icon(Object.prototype.hasOwnProperty.call(table, key) ? table[key] : fallback);
	}
	Object.freeze(Object.keys(preferenceIcons));
	Object.freeze(Object.keys(targetingIcons));
	var preference = function(kind) {
		return mapped(preferenceIcons, kind, "preferences");
	};
	var preferenceCategory$1 = function(category) {
		return mapped(categories, category, "other-settings");
	};
	var preferencesRoot = function() {
		return icon("preferences");
	};
	var targeting = function(kind) {
		return mapped(targetingIcons, kind, "filter-unknown");
	};
	var scripts = function() {
		return icon("script");
	};
	var scriptEvent = function(event) {
		return mapped(scriptEvents, event, "script");
	};
	var scriptFile = function(group) {
		return icon(group === "powershell" ? "powershell" : "script");
	};
	//#endregion
	//#region src/components/tree-view/tree-view-list-data.js
	function payloadList(result, key) {
		if (Array.isArray(result)) return result;
		return result && Array.isArray(result[key]) ? result[key] : [];
	}
	function policyChildren(scope, result) {
		const language = typeof getLanguage === "function" ? getLanguage() : void 0;
		return payloadList(result, "children").map(function(node) {
			return policyNode(scope, node);
		}).sort(function(left, right) {
			if (left.type !== right.type) return left.type === "folder" ? -1 : 1;
			return left.title.localeCompare(right.title, language);
		});
	}
	function policyNode(scope, node) {
		if (node.kind === "category") return {
			title: node.label || node.id,
			type: "folder",
			opened: false,
			icon: "ico-folder",
			scope,
			categoryId: node.id,
			lazy: true,
			help: node.explain_text || void 0,
			children: [],
			loadChildren: function() {
				return children(scope, node.id).then(function(result) {
					return policyChildren(scope, result);
				});
			}
		};
		return {
			title: node.label || node.id,
			type: "file",
			showInTree: false,
			icon: "ico-file",
			template: "admx",
			scope,
			policyId: node.id
		};
	}
	function administrativeTemplates(scope) {
		return {
			title: t("policies.adminTemplates"),
			type: "folder",
			opened: false,
			icon: "ico-folder",
			scope,
			lazy: true,
			help: t(scope === "computer" ? "policies.machineAdminTemplates" : "policies.userAdminTemplates"),
			children: [],
			loadChildren: function() {
				return children(scope, null).then(function(result) {
					return policyChildren(scope, result);
				});
			}
		};
	}
	function preferenceNode(document) {
		return {
			title: document.label || document.kind,
			type: "file",
			icon: preference(document.kind),
			template: "preferences",
			scope: document.scope,
			preferenceKind: document.kind,
			document,
			readOnly: !document.editable || document.applicable === false
		};
	}
	function scriptsNode(scope) {
		return {
			title: t(scope === "computer" ? "policies.scriptsComputer" : "policies.scriptsUser"),
			type: "file",
			icon: scripts(),
			template: "scripts",
			scope
		};
	}
	function windowsPolicySettingsNode(scope) {
		/** @type {any[]} */
		const children = [scriptsNode(scope)];
		if (scope === "computer") children.push(securityNode());
		return {
			title: t("policies.windowsSettings"),
			type: "folder",
			opened: false,
			icon: "ico-folder",
			scope,
			children
		};
	}
	function securityNode() {
		return {
			title: t("security.title"),
			type: "folder",
			opened: false,
			icon: "ico-folder",
			lazy: true,
			children: [],
			loadChildren: function() {
				return Promise.all([securityDefinitionsShow(), advancedAuditShow().then(function(value) {
					return { value };
				}, function(error) {
					return { error };
				})]).then(function(responses) {
					const nodes = navigationNodes(responses[0]);
					if (responses[1].value) nodes.push(navigationNode(responses[1].value));
					else nodes.push({
						title: t("security.auditUnavailable"),
						type: "file",
						icon: "ico-file",
						showInTree: false,
						template: "advanced_audit",
						advancedAuditError: responses[1].error
					});
					return nodes.sort(function(left, right) {
						return left.title.localeCompare(right.title);
					});
				});
			}
		};
	}
	function preferenceCategoryTitle(category) {
		if (category.id === "system_settings") return t("preferences.windowsSettings");
		if (category.id === "control_panel_settings") return t("preferences.controlPanelSettings");
		if (category.id === "other_settings") return t("preferences.otherSettings");
		return category.label || category.id;
	}
	function preferenceOrder(value) {
		return value === void 0 || value === null || value === "" || !Number.isFinite(Number(value)) ? 999 : Number(value);
	}
	function preferenceCategories(scope, documents) {
		const categories = /* @__PURE__ */ new Map();
		documents.filter(function(document) {
			return document.scope === scope;
		}).forEach(function(document) {
			const id = document.category_id || "other_settings";
			let category = categories.get(id);
			if (!category) {
				category = {
					id,
					label: document.category_label,
					order: preferenceOrder(document.category_order),
					documents: []
				};
				categories.set(id, category);
			}
			category.documents.push(document);
		});
		return Array.from(categories.values()).sort(function(left, right) {
			return left.order - right.order || preferenceCategoryTitle(left).localeCompare(preferenceCategoryTitle(right));
		}).map(function(category) {
			category.documents.sort(function(left, right) {
				return preferenceOrder(left.display_order) - preferenceOrder(right.display_order) || (left.label || left.kind).localeCompare(right.label || right.kind);
			});
			return {
				title: preferenceCategoryTitle(category),
				type: "folder",
				opened: false,
				icon: preferenceCategory$1(category.id),
				scope,
				preferenceCategoryId: category.id,
				children: category.documents.map(preferenceNode)
			};
		});
	}
	function scopeNode(scope, documents) {
		const isComputer = scope === "computer";
		const preferenceChildren = preferenceCategories(scope, documents);
		/** @type {any[]} */
		const children = [{
			title: t("policies.allPolicies"),
			type: "folder",
			opened: false,
			icon: "ico-folder",
			template: "all_policies",
			scope,
			children: [],
			preferenceDocuments: documents.filter(function(document) {
				return document.scope === scope;
			}),
			includePreferences: true,
			help: t("policySearch.description")
		}, {
			title: t("policies.title"),
			type: "folder",
			opened: false,
			icon: "ico-folder",
			scope,
			children: [windowsPolicySettingsNode(scope), administrativeTemplates(scope)]
		}];
		if (preferenceChildren.length) children.push({
			title: t("preferences.title"),
			type: "folder",
			opened: false,
			icon: preferencesRoot(),
			scope,
			children: preferenceChildren,
			help: t("preferences.description")
		});
		return {
			title: isComputer ? t("policies.machine") : t("policies.user"),
			type: "folder",
			opened: false,
			icon: isComputer ? "ico-computer" : "ico-user",
			help: isComputer ? t("policies.machineLevelPolicies") : t("policies.userLevelPolicies"),
			children
		};
	}
	function buildTreeViewList(openResult) {
		const result = openResult || {};
		const documents = payloadList(result, "preference_documents");
		return [{
			title: (result.gpo || {}).displayname || getDisplayName() || t("policies.localGroupPolicy"),
			type: "folder",
			opened: true,
			help: t("policies.localGroupPolicies"),
			children: [scopeNode("computer", documents), scopeNode("user", documents)]
		}];
	}
	function loadTreeViewList() {
		return open$4().then(buildTreeViewList);
	}
	//#endregion
	//#region src/components/tree-view/tree-view.js
	var TREE_VIEW_MESSAGES = {
		loading: "treeView.loadingPolicies",
		error: "treeView.unableToLoadPolicies"
	};
	function renderTreeViewStatus(type = "loading") {
		const isError = type === "error";
		const children = [];
		if (!isError) children.push(createElement("span", {
			className: "tree-view__status-spinner",
			attrs: { "aria-hidden": "true" }
		}));
		children.push(createElement("span", {
			className: "tree-view__status-text",
			text: isError ? t(TREE_VIEW_MESSAGES.error) : t(TREE_VIEW_MESSAGES.loading)
		}));
		return createElement("div", {
			className: ["tree-view__status", isError ? "tree-view__status--error" : "tree-view__status--loading"],
			attrs: {
				role: isError ? "alert" : "status",
				"aria-live": isError ? "assertive" : "polite"
			},
			children
		});
	}
	async function initializeTreeView(element, workspace = null, treeViewState = null) {
		if (workspace && treeViewState) {
			treeViewState.setWorkspace(workspace);
			treeViewState.setTreeData([]);
		}
		element.clear();
		element.append(renderTreeViewStatus("loading"));
		try {
			const treeData = await loadTreeViewList();
			element.clear();
			element.append(renderTreeViewList(treeData, workspace, treeViewState));
			treeViewState?.initializeSelection?.();
		} catch (error) {
			console.error("[tree-view] Failed to load data.", error);
			if (workspace) workspace.clear();
			if (treeViewState) {
				treeViewState.setTreeData([]);
				treeViewState.syncHelpButtonState?.();
				treeViewState.syncHelpBlockState?.();
			}
			element.clear();
			element.append(renderTreeViewStatus("error"));
		}
	}
	/**
	* Renders the tree container with content from tree-view-list.js.
	* @param {ElementCreator} workspace Workspace used to display the selected item.
	* @param {Object} treeViewState Tree state (selectedItem, workspace, setWorkspace, setSelectedItem).
	* @returns {ElementCreator} Tree container.
	*/
	function renderTreeView(workspace = null, treeViewState = null) {
		const element = createElement("div", { className: "tree-view" });
		initializeTreeView(element, workspace, treeViewState);
		return element;
	}
	//#endregion
	//#region src/components/divider/divider.js
	function renderDivider() {
		return createElement("div", {
			className: "divider",
			children: [createElement("div", { className: "divider__line" })]
		});
	}
	//#endregion
	//#region src/components/workspace/workspace.js
	function renderWorkspace() {
		return createElement("div", { className: "workspace" });
	}
	//#endregion
	//#region src/components/main/main.js
	function renderMain(container, treeViewState) {
		const workspace = renderWorkspace();
		const treeView = renderTreeView(workspace, treeViewState);
		const divider = renderDivider();
		const main = createElement("div", {
			className: "gp__main",
			children: [
				treeView,
				divider,
				workspace
			]
		});
		container.appendChild(main.getElement());
		return {
			main,
			treeView,
			divider,
			workspace
		};
	}
	//#endregion
	//#region src/components/footer/footer.js
	function renderFooter(container) {
		const element = createElement("div", { className: "gp__footer" });
		container.appendChild(element.getElement());
		return element.getElement();
	}
	//#endregion
	//#region src/util/resizable.js
	function resizable(divider, panel, container, options = {}) {
		if (!divider || !panel || !container) return () => {};
		const minWidth = options.minWidth || 50;
		const maxWidth = options.maxWidth || container.offsetWidth - 50;
		let isResizing = false;
		let startX = 0;
		let startWidth = 0;
		const handleMouseDown = (e) => {
			isResizing = true;
			startX = e.clientX;
			startWidth = panel.offsetWidth;
			document.body.style.cursor = "col-resize";
			document.body.style.userSelect = "none";
			e.preventDefault();
		};
		const handleMouseMove = (e) => {
			if (!isResizing) return;
			const newWidth = startWidth + (e.clientX - startX);
			const calculatedMaxWidth = maxWidth === container.offsetWidth - 50 ? container.offsetWidth - 50 : maxWidth;
			if (newWidth >= minWidth && newWidth <= calculatedMaxWidth) panel.style.width = `${newWidth}px`;
		};
		const stopResizing = () => {
			isResizing = false;
			document.body.style.cursor = "";
			document.body.style.userSelect = "";
		};
		divider.addEventListener("mousedown", handleMouseDown);
		document.addEventListener("mousemove", handleMouseMove);
		document.addEventListener("mouseup", stopResizing);
		return () => {
			divider.removeEventListener("mousedown", handleMouseDown);
			document.removeEventListener("mousemove", handleMouseMove);
			document.removeEventListener("mouseup", stopResizing);
			stopResizing();
		};
	}
	//#endregion
	//#region src/components/category-path.js
	function render$4(segments, onNavigate) {
		const parts = (segments || []).filter(function(segment) {
			return segment && segment.title;
		});
		const list = createElement("ol", { className: "gpo-category-path__list" });
		let focused = Math.max(0, parts.length - 1);
		function syncFocus() {
			const buttons = list.getElement().querySelectorAll("button");
			Array.from(buttons).forEach(function(button, index) {
				button.tabIndex = index === focused ? 0 : -1;
			});
		}
		parts.forEach(function(segment, index) {
			const last = index === parts.length - 1;
			const label = createElement(segment.item && onNavigate ? "button" : "span", {
				className: "gpo-category-path__segment",
				attrs: {
					type: segment.item && onNavigate ? "button" : null,
					title: segment.title,
					"aria-current": last ? "page" : null
				},
				text: segment.title
			});
			if (segment.item && onNavigate) {
				label.on("click", function() {
					onNavigate(segment.item);
				});
				label.on("focus", function() {
					focused = index;
					syncFocus();
				});
			}
			list.append(createElement("li", { children: [index ? createElement("span", {
				className: "gpo-category-path__separator",
				attrs: { "aria-hidden": "true" },
				text: " / "
			}) : null, label] }));
		});
		list.on("keydown", function(event) {
			if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
			const buttons = Array.from(list.getElement().querySelectorAll("button"));
			const index = buttons.indexOf(event.target);
			if (index < 0) return;
			const next = event.key === "ArrowLeft" ? index - 1 : event.key === "ArrowRight" ? index + 1 : event.key === "Home" ? 0 : event.key === "End" ? buttons.length - 1 : null;
			if (next === null) return;
			event.preventDefault();
			focused = Math.max(0, Math.min(buttons.length - 1, next));
			syncFocus();
			buttons[focused].focus({ preventScroll: true });
		});
		syncFocus();
		return createElement("nav", {
			className: "gpo-category-path",
			attrs: {
				"data-category-path": "",
				"aria-label": t("navigation.path")
			},
			children: [list]
		});
	}
	function attachFilter(header, view) {
		if (!header || !view) return;
		const input = Array.from(view.querySelectorAll("[data-policy-filter]")).find(function(candidate) {
			const owner = candidate.closest("[role=\"dialog\"]");
			return !owner || !view.contains(owner);
		});
		if (!input) return;
		const toolbar = input.parentElement;
		input.classList.add("gpo-category-path__filter");
		header.appendChild(input);
		if (toolbar && toolbar.classList.contains("gpo-security-workbench__toolbar") && !toolbar.children.length) toolbar.remove();
	}
	//#endregion
	//#region src/components/templates/default-template.js
	/**
	* Renders the fallback template when no template is defined.
	* @returns {ElementCreator} Element containing a template-not-defined message.
	*/
	function renderDefaultTemplate() {
		return createElement("div", {
			className: "gp__default-template",
			children: [createElement("div", {
				className: "default-template__message",
				text: "Шаблон не определен"
			})]
		});
	}
	//#endregion
	//#region src/util/collection-value.ts
	function clone$3(value) {
		return JSON.parse(JSON.stringify(value));
	}
	function mode(parameter, value) {
		if (parameter.collection && parameter.collection.mode) return parameter.collection.mode;
		return value && value.kind === "key_value_list" ? "key_value" : "list";
	}
	function constraints(parameter, value) {
		const declared = parameter.collection || {};
		return {
			mode: mode(parameter, value),
			unique_keys: declared.unique_keys === true || mode(parameter, value) === "key_value",
			key_case_sensitive: declared.key_case_sensitive === true,
			key_comparison: declared.key_comparison,
			allow_empty_values: declared.allow_empty_values !== false,
			min_items: Number(declared.min_items || 0),
			max_length: parameter.max_length,
			max_key_length: declared.max_key_length,
			max_value_length: declared.max_value_length,
			length_unit: declared.length_unit
		};
	}
	function folded(key, rules) {
		if (rules.key_case_sensitive) return key;
		return rules.key_comparison === "unicode_uppercase" ? key.toUpperCase() : key.replace(/[A-Z]/g, function(letter) {
			return letter.toLowerCase();
		});
	}
	function validate(parameter, value) {
		const rules = constraints(parameter, value);
		const errors = [];
		const entries = value && value.value;
		if (!value || !Array.isArray(entries) || value.kind !== (rules.mode === "key_value" ? "key_value_list" : "text_list")) return [{
			index: null,
			field: null,
			code: "invalidValue"
		}];
		if (entries.length < rules.min_items) errors.push({
			index: null,
			field: null,
			code: "minItems"
		});
		const seen = /* @__PURE__ */ new Map();
		entries.forEach(function(entry, index) {
			const key = rules.mode === "key_value" ? entry && entry.key : entry;
			const text = rules.mode === "key_value" ? entry && entry.value : entry;
			const keyField = rules.mode === "key_value" ? "key" : "value";
			if (typeof text !== "string" || rules.mode === "key_value" && typeof key !== "string") {
				errors.push({
					index,
					field: typeof text !== "string" ? "value" : keyField,
					code: "invalidValue"
				});
				return;
			}
			if (text.indexOf("\0") !== -1) errors.push({
				index,
				field: "value",
				code: "invalidText"
			});
			if (!rules.allow_empty_values && !text.trim()) errors.push({
				index,
				field: "value",
				code: "requiredValue"
			});
			if (rules.max_length !== null && rules.max_length !== void 0 && Array.from(text).length > rules.max_length) errors.push({
				index,
				field: "value",
				code: "tooLong"
			});
			const valueLength = rules.length_unit === "utf16" ? text.length : Array.from(text).length;
			if (rules.max_value_length !== null && rules.max_value_length !== void 0 && valueLength > rules.max_value_length) errors.push({
				index,
				field: "value",
				code: "tooLong"
			});
			if (!rules.unique_keys) return;
			if (!key.trim()) errors.push({
				index,
				field: keyField,
				code: rules.mode === "key_value" ? "requiredKey" : "requiredValue"
			});
			if (/[\0\r\n]/.test(key) || key.indexOf("**") === 0) errors.push({
				index,
				field: keyField,
				code: "invalidKey"
			});
			const keyLength = rules.length_unit === "utf16" ? key.length : Array.from(key).length;
			if (rules.max_key_length !== null && rules.max_key_length !== void 0 && keyLength > rules.max_key_length) errors.push({
				index,
				field: keyField,
				code: "keyTooLong"
			});
			const name = folded(key, rules);
			if (seen.has(name)) {
				errors.push({
					index,
					field: keyField,
					code: "duplicateKey"
				});
				const previous = seen.get(name);
				if (!errors.some(function(error) {
					return error.index === previous && error.code === "duplicateKey";
				})) errors.push({
					index: previous,
					field: keyField,
					code: "duplicateKey"
				});
			} else seen.set(name, index);
		});
		return errors;
	}
	function empty(parameter, value) {
		return {
			kind: mode(parameter, value) === "key_value" ? "key_value_list" : "text_list",
			value: []
		};
	}
	function summary$1(parameter, value) {
		const entries = value && Array.isArray(value.value) ? value.value : [];
		return {
			mode: mode(parameter, value),
			count: entries.length,
			preview: entries.slice(0, 3).map(function(entry) {
				const text = mode(parameter, value) === "key_value" ? entry.key : entry;
				return String(text).replace(/[\r\n\t]+/g, " ");
			}),
			more: entries.length > 3
		};
	}
	function session(parameter, value) {
		const initial = value && Array.isArray(value.value) ? clone$3(value) : empty(parameter, value);
		const rules = constraints(parameter, initial);
		let sequence = 0;
		const rows = initial.value.map(function(entry) {
			return rules.mode === "key_value" ? {
				id: "row-" + ++sequence,
				key: entry.key,
				value: entry.value,
				fresh: false
			} : {
				id: "row-" + ++sequence,
				value: entry,
				fresh: false
			};
		});
		function effectiveRows(pending) {
			return rows.map(function(row) {
				if (!pending || pending.id !== row.id) return row;
				const copy = Object.assign({}, row);
				copy[pending.field] = pending.value;
				return copy;
			}).filter(function(row) {
				return !row.fresh || row.value !== "" || rules.mode === "key_value" && row.key !== "";
			});
		}
		function read(pending) {
			return {
				kind: rules.mode === "key_value" ? "key_value_list" : "text_list",
				value: effectiveRows(pending).map(function(row) {
					return rules.mode === "key_value" ? {
						key: row.key,
						value: row.value
					} : row.value;
				})
			};
		}
		const state = {
			rows,
			mode: rules.mode,
			selectedId: null,
			read,
			isDirty: function(pending) {
				return JSON.stringify(read(pending)) !== JSON.stringify(initial);
			},
			find: function(id) {
				return rows.find(function(row) {
					return row.id === id;
				});
			},
			select: function(id) {
				state.selectedId = state.find(id) ? id : null;
			},
			add: function() {
				const row = {
					id: "row-" + ++sequence,
					value: "",
					fresh: true
				};
				if (rules.mode === "key_value") row.key = "";
				rows.push(row);
				state.selectedId = null;
				return row.id;
			},
			removeSelected: function() {
				const index = rows.findIndex(function(row) {
					return row.id === state.selectedId;
				});
				if (index < 0) return false;
				rows.splice(index, 1);
				state.selectedId = null;
				return true;
			},
			edit: function(id, field, text) {
				const row = state.find(id);
				if (!row || field !== "value" && !(rules.mode === "key_value" && field === "key")) return false;
				row[field] = String(text);
				return true;
			},
			move: function(id, index) {
				const from = rows.findIndex(function(row) {
					return row.id === id;
				});
				if (from < 0 || !Number.isInteger(index)) return false;
				const to = Math.max(0, Math.min(rows.length - 1, index));
				if (to === from) return false;
				const row = rows.splice(from, 1)[0];
				rows.splice(to, 0, row);
				return true;
			},
			visible: function(query) {
				const needle = String(query || "").toLocaleLowerCase();
				return rows.filter(function(row) {
					return !needle || ((row.key || "") + "\n" + row.value).toLocaleLowerCase().indexOf(needle) !== -1;
				});
			},
			errors: function(pending) {
				const effective = effectiveRows(pending);
				return validate(parameter, read(pending)).map(function(error) {
					return Object.assign({}, error, { id: error.index === null ? null : effective[error.index].id });
				});
			}
		};
		return state;
	}
	//#endregion
	//#region src/util/editor-dto.ts
	/** Pure helpers for preserving libadmix discriminated values in browser forms. */
	function clone$2(value) {
		if (value === void 0) return void 0;
		return JSON.parse(JSON.stringify(value));
	}
	function equal(left, right) {
		return JSON.stringify(left) === JSON.stringify(right);
	}
	/** The plain payload of a typed value; its type depends on `kind`, so callers narrow it. */
	function valuePayload(value) {
		if (!value || typeof value !== "object") return value;
		if (value.kind === "registry") return value.value ? value.value.value : null;
		if (value.kind === "unsupported") return null;
		return value.value;
	}
	function typedValueFromInput(original, kind, raw, checked) {
		if (original && original.kind === "unsupported") return clone$2(original);
		if (kind === "boolean") return {
			kind: "boolean",
			value: Boolean(checked)
		};
		if (kind === "decimal") return {
			kind: "integer",
			value: raw === "" ? null : Number(raw)
		};
		if (kind === "list") return {
			kind: "text_list",
			value: String(raw || "").split(/\r?\n/).filter(function(item) {
				return item !== "";
			})
		};
		return {
			kind: "text",
			value: String(raw === void 0 || raw === null ? "" : raw)
		};
	}
	function preferenceValueFromInput(original, raw, checked) {
		const value = clone$2(original || {
			kind: "text",
			value: ""
		});
		switch (value.kind) {
			case "boolean":
				value.value = Boolean(checked);
				break;
			case "optional_boolean":
				value.value = raw === "" ? null : raw === "true";
				break;
			case "integer":
			case "unsigned_byte":
				value.value = raw === "" ? null : Number(raw);
				break;
			case "optional_unsigned_byte":
				value.value = raw === "" ? null : Number(raw);
				break;
			case "text_list":
				value.value = String(raw || "").split(/\r?\n/).filter(function(item) {
					return item !== "";
				});
				break;
			case "optional_text":
				value.value = raw === "" ? null : String(raw);
				break;
			default: value.value = String(raw === void 0 || raw === null ? "" : raw);
		}
		return value;
	}
	function buildPolicyUpdate(policy, draft, baselineDraft) {
		const request = {};
		const originalState = baselineDraft ? baselineDraft.state : policy.state;
		if (draft.state !== originalState) request.state = draft.state;
		const baseline = new Map(baselineDraft ? (baselineDraft.parameters || []).map(function(parameter) {
			return [parameter.parameter_id, parameter.value];
		}) : (policy.parameters || []).map(function(parameter) {
			return [parameter.id, parameter.value];
		}));
		const sets = [];
		const clears = [];
		if (draft.state === "enabled") {
			(draft.parameters || []).forEach(function(parameter) {
				if (equal(baseline.get(parameter.parameter_id), parameter.value)) return;
				if (parameter.value === null) clears.push(parameter.parameter_id);
				else sets.push({
					parameter_id: parameter.parameter_id,
					value: clone$2(parameter.value)
				});
			});
			const enableAction = policyStateAction(policy, "enabled");
			if (draft.state !== originalState && enableAction.requires_parameters) {
				const alreadyEdited = new Set(sets.map(function(item) {
					return item.parameter_id;
				}));
				clears.forEach(function(parameterId) {
					alreadyEdited.add(parameterId);
				});
				const draftById = new Map((draft.parameters || []).map(function(parameter) {
					return [parameter.parameter_id, parameter.value];
				}));
				(policy.parameters || []).forEach(function(parameter) {
					if (parameter.editable === false) return;
					if (parameter.value !== null && parameter.value !== void 0) return;
					if (parameter.default_value === null || parameter.default_value === void 0) return;
					if (parameter.default_value.kind === "unsupported") return;
					if (alreadyEdited.has(parameter.id)) return;
					const value = draftById.get(parameter.id);
					if (value === null || value === void 0) return;
					if (value.kind === "unsupported") return;
					sets.push({
						parameter_id: parameter.id,
						value: clone$2(value)
					});
					alreadyEdited.add(parameter.id);
				});
			}
		}
		if (sets.length) request.set_parameters = sets;
		if (clears.length) request.clear_parameters = clears;
		const oldComment = baselineDraft ? baselineDraft.comment : policy.comment ? policy.comment.text : "";
		if (draft.comment !== oldComment) {
			const target = (policy.comment && policy.comment.source) === "locale" ? {
				kind: "locale",
				locale: policy.comment && policy.comment.locale
			} : "embedded";
			request.comment = draft.comment === "" ? {
				action: "clear",
				target
			} : {
				action: "set",
				target,
				text: draft.comment
			};
		}
		return request;
	}
	function hasOperations(request) {
		return Boolean(request) && Object.keys(request).length > 0;
	}
	function policyChoiceValue(choices, selectedIndex) {
		const index = Number(selectedIndex);
		return selectedIndex === "" || !Array.isArray(choices) || !choices[index] ? null : clone$2(choices[index].value);
	}
	function legacyStateCapability(policy, state) {
		const capability = state === "not_configured" ? "clear" : state === "enabled" ? "enable" : "disable";
		return Boolean(policy && policy.capabilities && policy.capabilities[capability]);
	}
	function policyStateAction(policy, state) {
		const hasStateActions = Boolean(policy && Object.prototype.hasOwnProperty.call(policy, "state_actions"));
		const action = policy && hasStateActions && policy.state_actions ? policy.state_actions[state] : null;
		if (action && typeof action === "object") return {
			available: Boolean(action.available),
			mode: action.mode || null,
			requires_parameters: Boolean(action.requires_parameters)
		};
		if (hasStateActions) return {
			available: false,
			mode: null,
			requires_parameters: false
		};
		return {
			available: legacyStateCapability(policy, state),
			mode: null,
			requires_parameters: false
		};
	}
	function canSelectPolicyState(policy, state) {
		return Boolean(policy && policy.state !== "unknown_raw_values" && policyStateAction(policy, state).available);
	}
	function canEditPolicyParameters(policy, draftState) {
		const selectedState = draftState === void 0 ? policy && policy.state : draftState;
		const hasStateActions = Boolean(policy && Object.prototype.hasOwnProperty.call(policy, "state_actions"));
		return Boolean(policy && policy.state !== "unknown_raw_values" && selectedState === "enabled" && (!hasStateActions || policyStateAction(policy, "enabled").available) && policy.capabilities && policy.capabilities.edit_parameters);
	}
	function validatePolicyDraft(policy, draft) {
		if (!draft || !canEditPolicyParameters(policy, draft.state)) return null;
		const values = new Map((draft.parameters || []).map(function(parameter) {
			return [parameter.parameter_id, parameter.value];
		}));
		const lists = (policy.parameters || []).filter(function(parameter) {
			return parameter.kind === "list";
		});
		for (let index = 0; index < lists.length; index++) {
			let list = lists[index];
			if (!list.collection && policyStateAction(policy, "enabled").mode === "dynamic_list_values") list = Object.assign({}, list, { collection: {
				mode: "list",
				unique_keys: true,
				key_case_sensitive: false,
				allow_empty_values: false,
				min_items: 1
			} });
			const value = values.get(list.id);
			if (list.editable === false || value && value.kind === "unsupported") continue;
			if (value === null && !list.required && !(list.collection && list.collection.min_items)) continue;
			const problems = validate(list, value);
			if (problems.length) return {
				category: "validation",
				field: list.id,
				message: problems.some(function(problem) {
					return problem.code === "minItems" || problem.code === "requiredValue";
				}) ? "At least one non-empty list entry is required" : "Invalid collection entries"
			};
		}
		return null;
	}
	function preferenceFieldIds(fields) {
		const seen = /* @__PURE__ */ new Set();
		const duplicates = /* @__PURE__ */ new Set();
		(fields || []).forEach(function(field) {
			if (!field || typeof field.id !== "string") return;
			if (seen.has(field.id)) duplicates.add(field.id);
			seen.add(field.id);
		});
		return {
			seen,
			duplicates: Array.from(duplicates)
		};
	}
	function preferenceValueIsEmpty(value) {
		if (!value || typeof value !== "object") return true;
		if (value.value === null || value.value === void 0) return true;
		if (typeof value.value === "string") return value.value.trim() === "";
		if (Array.isArray(value.value)) return value.value.length === 0;
		return false;
	}
	function validatePreferenceField(field, value) {
		if (!field || !value || typeof value !== "object" || typeof value.kind !== "string") return "invalid_value";
		if (field.control === "choice") {
			if (!Array.isArray(field.choices) || !field.choices.every(function(choice) {
				return choice && typeof choice.key === "string" && choice.key !== "" && typeof choice.label === "string";
			}) || value.kind !== "text" || !field.choices.some(function(choice) {
				return choice.key === value.value;
			})) return "invalid_value";
		}
		if (field.required && preferenceValueIsEmpty(value)) return "required";
		if (value.kind === "integer" || value.kind === "unsigned_byte" || value.kind === "optional_unsigned_byte") {
			if (value.value === null && value.kind === "optional_unsigned_byte") return null;
			if (!Number.isFinite(value.value) || !Number.isInteger(value.value)) return "invalid_number";
			if ((value.kind === "unsigned_byte" || value.kind === "optional_unsigned_byte") && (value.value < 0 || value.value > 255)) return "unsigned_byte_range";
		}
		if (value.kind === "action" && [
			"create",
			"replace",
			"update",
			"delete"
		].indexOf(value.value) === -1) return "invalid_value";
		if (value.kind === "filter_combine" && ["and", "or"].indexOf(value.value) === -1) return "invalid_value";
		return null;
	}
	function preferenceFieldEdits(descriptors, draftFields, changedOnly) {
		const draft = new Map((draftFields || []).map(function(field) {
			return [field.id, field.value];
		}));
		const result = [];
		(descriptors || []).forEach(function(field) {
			if (!field || !field.editable) return;
			const value = draft.has(field.id) ? draft.get(field.id) : field.value;
			if (!changedOnly || !equal(value, field.value)) result.push({
				id: field.id,
				value: clone$2(value)
			});
		});
		return result;
	}
	function preferenceParentIdentity(candidates, selectedIndex) {
		const index = Number(selectedIndex);
		if (!Number.isInteger(index) || index < 0) return null;
		const candidate = (candidates || [])[index];
		if (!candidate || candidate.identity === null) return null;
		return Array.isArray(candidate.identity) && candidate.identity.length ? clone$2(candidate.identity) : null;
	}
	function buildPreferenceRequest(options) {
		const config = options || {};
		const descriptors = config.descriptors || [];
		const ids = preferenceFieldIds(descriptors);
		const draftFields = config.fields || [];
		const draft = new Map(draftFields.map(function(field) {
			return [field.id, field.value];
		}));
		const exemptions = config.validationExemptions instanceof Set ? config.validationExemptions : new Set(Array.isArray(config.validationExemptions) ? config.validationExemptions : []);
		const errors = ids.duplicates.map(function(id) {
			return {
				id,
				code: "duplicate_descriptor"
			};
		});
		descriptors.forEach(function(field) {
			if (!field || !field.editable || ids.duplicates.indexOf(field.id) !== -1) return;
			if (exemptions.has(field.id)) return;
			const code = validatePreferenceField(field, draft.has(field.id) ? draft.get(field.id) : field.value);
			if (code) errors.push({
				id: field.id,
				code
			});
		});
		const creating = Boolean(config.creating);
		const nextName = config.name === void 0 || config.name === null ? null : String(config.name);
		const originalName = config.originalName === void 0 || config.originalName === null ? null : String(config.originalName);
		if (!creating && nextName !== null && nextName !== originalName && nextName.trim() === "") errors.push({
			id: "name",
			code: "required"
		});
		if (errors.length) return {
			request: null,
			errors,
			changed: false
		};
		const request = creating ? {} : { identity: clone$2(config.identity) };
		const edits = preferenceFieldEdits(descriptors, draftFields, !creating);
		if (creating || edits.length) request.fields = edits;
		if (creating && Array.isArray(config.parent) && config.parent.length) request.parent = clone$2(config.parent);
		if (!creating && nextName !== null && nextName !== originalName) request.name = nextName;
		const filters = clone$2(config.filters || []);
		if (filters.length) request.filters = filters;
		const changed = creating || Object.keys(request).some(function(key) {
			return key !== "identity";
		});
		return {
			request: changed ? request : null,
			errors: [],
			changed
		};
	}
	function submitPreservingDraft(draft, submit) {
		const preservedDraft = clone$2(draft);
		return Promise.resolve().then(submit).then(function(response) {
			return {
				ok: true,
				response,
				draft: preservedDraft
			};
		}).catch(function(error) {
			return {
				ok: false,
				error,
				draft: preservedDraft
			};
		});
	}
	function errorCategory(error) {
		return String(error && (error.category || error.code) || "operational").toLowerCase();
	}
	//#endregion
	//#region src/lib/dom.js
	/**
	* Creates an element with attributes and children. `null`, `undefined` and `false` children are skipped,
	* so conditional parts can be written inline: `cond && h('p', {}, 'text')`.
	* @template {keyof HTMLElementTagNameMap} K
	* @param {K} tag
	* @param {Record<string, string | boolean | null | undefined>} [attrs] `class` takes a string; a falsy value omits the attribute.
	* @param {...Child} children
	* @returns {HTMLElementTagNameMap[K]}
	*/
	function h(tag, attrs = {}, ...children) {
		const element = document.createElement(tag);
		for (const [name, value] of Object.entries(attrs)) {
			if (value === false || value === null || value === void 0) continue;
			element.setAttribute(name, value === true ? "" : value);
		}
		element.append(...children.filter((child) => child !== null && child !== void 0 && child !== false));
		return element;
	}
	/**
	* Joins class names, skipping falsy values.
	* @param {...(string | false | null | undefined)} names
	*/
	function cx(...names) {
		return names.filter(Boolean).join(" ");
	}
	var EditorStatus_module_default = {
		status: "_status_1fqo6_1",
		error: "_error_1fqo6_9",
		pending: "_pending_1fqo6_15",
		unsupported: "_unsupported_1fqo6_16",
		actions: "_actions_1fqo6_22",
		action: "_action_1fqo6_22",
		message: "_message_1fqo6_57",
		field: "_field_1fqo6_57",
		diagnostics: "_diagnostics_1fqo6_57"
	};
	//#endregion
	//#region src/components/EditorStatus/EditorStatus.js
	/**
	* What the editor passes as an error: an `EditorError` from util/API.js, or any object with the same fields.
	* @typedef {{ message?: string, category?: string, field?: string, pendingPublication?: boolean } | null | undefined} EditorStatusError
	*/
	var DETAILS = {
		"Security policy actions must be a list": "securityActionsList",
		"Security element actions must be a list": "securityElementActionsList",
		"Keyed-row actions must be a list": "securityRowActionsList",
		"At least one non-empty list entry is required": "listRequiresEntry",
		"Invalid collection entries": "collectionInvalidEntry"
	};
	function text$1(key) {
		return t("editorStatus." + key);
	}
	/** Localized message for an error: its category's text plus a translated detail when the server message is known. */
	/** @param {EditorStatusError} error */
	function messageForError(error) {
		const key = "editorStatus.errors." + errorCategory(error).replace(/-/g, "_");
		let prefix = t(key);
		if (prefix === key) prefix = text$1("errors.operational");
		const detail = DETAILS[(error && error.message ? String(error.message) : "").replace(/[.]$/, "")];
		return detail ? prefix + " " + text$1("details." + detail) : prefix;
	}
	function createAction(label, onClick) {
		const button = h("button", {
			class: cx("button", EditorStatus_module_default.action),
			type: "button",
			"data-editor-status-action": true
		}, label);
		button.addEventListener("click", onClick);
		return button;
	}
	/**
	* @param {EditorStatusError} error
	* @param {{ onRefresh?: (event: Event) => void, onReconcile?: (event: Event) => void }} [options]
	*   actions are shown only for the callbacks that are given (reconcile also needs a publication error)
	*/
	function createErrorStatus(error, options = {}) {
		const category = errorCategory(error).replace(/-/g, "_");
		const actions = [];
		if (typeof options.onRefresh === "function") actions.push(createAction(text$1("refresh"), options.onRefresh));
		if ((category.indexOf("publication") !== -1 || error && error.pendingPublication) && typeof options.onReconcile === "function") actions.push(createAction(text$1("reconcile"), options.onReconcile));
		return h("div", {
			class: cx(EditorStatus_module_default.status, EditorStatus_module_default.error),
			role: "alert",
			"data-editor-status": "error",
			"data-error-category": category
		}, h("div", { class: EditorStatus_module_default.message }, messageForError(error)), error && error.field && h("div", { class: EditorStatus_module_default.field }, text$1("field") + ": " + error.field), actions.length > 0 && h("div", { class: EditorStatus_module_default.actions }, ...actions));
	}
	/** The "publication is pending" notice, or `null` when nothing is pending. */
	function createPendingStatus(pending, onReconcile) {
		if (!pending) return null;
		return h("div", {
			class: cx(EditorStatus_module_default.status, EditorStatus_module_default.pending),
			role: "status",
			"data-editor-status": "pending"
		}, h("div", { class: EditorStatus_module_default.message }, text$1("pending")), typeof onReconcile === "function" && createAction(text$1("reconcile"), onReconcile));
	}
	/** A notice that the policy source is not supported by the editor. */
	function createUnsupportedStatus(message) {
		return h("div", {
			class: cx(EditorStatus_module_default.status, EditorStatus_module_default.unsupported),
			role: "status",
			"data-editor-status": "unsupported"
		}, message);
	}
	/** Collapsible technical details: one line per diagnostic, `code: message`. */
	function createDiagnostics(diagnostics) {
		return h("details", {
			class: EditorStatus_module_default.diagnostics,
			"data-editor-status-diagnostics": true
		}, h("summary", {}, text$1("technicalDetails")), ...(diagnostics || []).map((diagnostic) => h("pre", {}, [diagnostic.code, diagnostic.message].filter(Boolean).join(": "))));
	}
	//#endregion
	//#region src/components/editor-status.js
	function wrap$5(element) {
		return element && ElementCreator.wrap(element);
	}
	function renderError(error, options) {
		return wrap$5(createErrorStatus(error, options));
	}
	function renderPending(pending, onReconcile) {
		return wrap$5(createPendingStatus(pending, onReconcile));
	}
	function renderDiagnostics(diagnostics) {
		return wrap$5(createDiagnostics(diagnostics));
	}
	function renderUnsupported(message) {
		return wrap$5(createUnsupportedStatus(message));
	}
	//#endregion
	//#region src/components/confirmation-dialog.js
	var nextId = 0;
	function open$3(host, options) {
		const config = options || {};
		const container = host && host.getElement ? host.getElement() : host;
		if (!container || typeof container.appendChild !== "function") throw new TypeError("A confirmation dialog host is required.");
		const previous = document.activeElement;
		const id = "gpo-confirmation-" + ++nextId;
		let closed = false;
		const no = createElement("button", {
			className: ["btn", "btn-no"],
			attrs: { type: "button" },
			text: config.cancelLabel || t("policyChangedModal.no")
		});
		const yes = createElement("button", {
			className: ["btn", "btn-yes"],
			attrs: { type: "button" },
			text: config.confirmLabel || t("policyChangedModal.yes")
		});
		const content = createElement("div", {
			id: id + "-message",
			className: "policy-changed__modal-content",
			text: config.message || ""
		});
		if (config.content) content.getElement().appendChild(config.content.getElement ? config.content.getElement() : config.content);
		const modal = createElement("div", {
			className: ["policy-changed__modal", "policy-changed__modal--discard"],
			attrs: {
				role: "alertdialog",
				"aria-modal": "true",
				"aria-labelledby": id + "-title",
				"aria-describedby": id + "-message"
			},
			children: [createElement("div", {
				className: "policy-changed__modal-wrapper",
				children: [
					createElement("div", {
						className: "policy-changed__modal-header",
						children: [createElement("div", {
							id: id + "-title",
							className: "title",
							text: config.title || t("confirmModal.title")
						})]
					}),
					content,
					createElement("div", {
						className: "policy-changed__modal-footer",
						children: [no, yes]
					})
				]
			})]
		});
		function close() {
			if (closed) return;
			closed = true;
			modal.getElement().remove();
			if (previous && previous.isConnected && previous.focus) previous.focus();
		}
		function choose(confirmed) {
			if (closed) return;
			close();
			const callback = confirmed ? config.onConfirm : config.onCancel;
			if (typeof callback === "function") callback();
		}
		no.on("click", function() {
			choose(false);
		});
		yes.on("click", function() {
			choose(true);
		});
		modal.on("keydown", function(event) {
			if (event.key === "Escape") {
				event.preventDefault();
				event.stopPropagation();
				choose(false);
			} else if (event.key === "Tab") {
				if (event.shiftKey && document.activeElement === no.getElement()) {
					event.preventDefault();
					yes.getElement().focus();
				} else if (!event.shiftKey && document.activeElement === yes.getElement()) {
					event.preventDefault();
					no.getElement().focus();
				}
			}
		});
		container.appendChild(modal.getElement());
		modal.getElement().offsetHeight;
		modal.getElement().classList.add("active");
		no.getElement().focus();
		return {
			close,
			root: modal.getElement()
		};
	}
	var Dialog_module_default = {
		host: "_host_19o5h_11",
		dialog: "_dialog_19o5h_18",
		fill: "_fill_19o5h_39",
		wrapper: "_wrapper_19o5h_48",
		header: "_header_19o5h_68",
		title: "_title_19o5h_79",
		close: "_close_19o5h_87",
		body: "_body_19o5h_100",
		error: "_error_19o5h_108",
		footer: "_footer_19o5h_116"
	};
	//#endregion
	//#region src/components/Dialog/Dialog.js
	/** The window's own attributes; `data-dialog-confirming` is toggled with {@link setConfirming}. */
	function setConfirming(dialog, confirming) {
		if (confirming) dialog.setAttribute("data-dialog-confirming", "");
		else dialog.removeAttribute("data-dialog-confirming");
	}
	/**
	* The content area. Extra classes belong to the consumer.
	* @param {Node | string | null} content
	* @param {string} [className]
	*/
	function createBody(content, className) {
		return h("div", {
			class: cx(Dialog_module_default.body, className),
			"data-dialog-part": "body"
		}, content);
	}
	/**
	* The always-present, initially empty region that shows an error on top of the body.
	* @param {string} [className]
	*/
	function createErrorRegion(className) {
		return h("div", {
			class: cx(Dialog_module_default.error, className),
			role: "alert",
			"data-dialog-part": "error"
		});
	}
	/**
	* A footer button. `button` and `btn-ok` / `btn-cancel` are legacy markers kept for code that queries them;
	* the look comes from the dialog's content-scope rules.
	* @param {'cancel' | 'apply'} kind
	* @param {string} label
	* @param {string} [className]
	*/
	function createButton(kind, label, className) {
		return h("button", {
			class: cx("button", kind === "apply" ? "btn-ok" : "btn-cancel", className),
			type: "button",
			"data-dialog-part": kind
		}, label);
	}
	/**
	* The close button in the header (`close` is a legacy marker for code that queries it; it carries no styles).
	* @param {string} label accessible name
	* @param {string} [className]
	*/
	function createCloseButton(label, className) {
		return h("button", {
			class: cx(Dialog_module_default.close, "close", className),
			type: "button",
			"aria-label": label,
			"data-dialog-part": "close"
		});
	}
	/**
	* Assembles the dialog around ready parts.
	* @param {{ titleId: string, title: string, body: HTMLElement, closeButton: HTMLElement, buttons: HTMLElement[],
	*   width?: string, fill?: boolean, className?: string, hostClassName?: string }} options
	*/
	function createDialogShell({ titleId, title, body, closeButton, buttons, width, fill, className, hostClassName }) {
		const dialog = h("div", {
			class: cx(Dialog_module_default.dialog, fill && Dialog_module_default.fill, className),
			role: "dialog",
			"aria-modal": "true",
			"aria-labelledby": titleId,
			tabindex: "-1",
			"data-dialog": true
		}, h("div", {
			class: Dialog_module_default.wrapper,
			"data-dialog-part": "wrapper"
		}, h("div", {
			class: Dialog_module_default.header,
			"data-dialog-part": "header"
		}, h("div", {
			id: titleId,
			class: Dialog_module_default.title,
			"data-dialog-part": "title"
		}, title), closeButton), body, h("div", {
			class: Dialog_module_default.footer,
			"data-dialog-part": "footer"
		}, ...buttons)));
		if (width) dialog.style.setProperty("--dialog-width", width);
		return {
			host: h("div", {
				class: cx("gp__preference", Dialog_module_default.host, hostClassName),
				"data-dialog-host": true
			}, dialog),
			dialog
		};
	}
	//#endregion
	//#region src/components/editor-dialog.js
	var editor_dialog_exports = /* @__PURE__ */ __exportAll({
		open: () => open$2,
		trapTab: () => trapTab
	});
	var sequence$4 = 0;
	function trapTab(event, modal) {
		if (event.key !== "Tab" || event.defaultPrevented || event.target.closest("[role=\"dialog\"], [role=\"alertdialog\"]") !== modal) return;
		const focusable = Array.from(modal.querySelectorAll("button, input, select, textarea, summary, a[href], [contenteditable=\"true\"], [tabindex]")).filter(function(element) {
			const style = element.ownerDocument.defaultView.getComputedStyle(element);
			return element.tabIndex >= 0 && !element.disabled && !element.hidden && element.getClientRects().length && !element.closest("[hidden], [inert]") && style.visibility !== "hidden" && style.visibility !== "collapse" && element.closest("[role=\"dialog\"], [role=\"alertdialog\"]") === modal;
		});
		if (!focusable.length) {
			event.preventDefault();
			modal.focus();
			return;
		}
		const first = focusable[0], last = focusable[focusable.length - 1];
		if (focusable.indexOf(document.activeElement) === -1) {
			event.preventDefault();
			(event.shiftKey ? last : first).focus();
		} else if (event.shiftKey && document.activeElement === first) {
			event.preventDefault();
			last.focus();
		} else if (!event.shiftKey && document.activeElement === last) {
			event.preventDefault();
			first.focus();
		}
	}
	function open$2(host, options) {
		const previous = document.activeElement;
		const titleId = "editor-dialog-" + ++sequence$4;
		let busy = false;
		let closed = false;
		let applyDisabled = Boolean(options.applyDisabled);
		let confirmation = null;
		const wrap = ElementCreator.wrap;
		const classes = function(value) {
			return [].concat(value || []).join(" ");
		};
		const body = wrap(createBody(null, classes(options.bodyClassName)));
		body.append(options.content);
		const failure = wrap(createErrorRegion(classes(options.errorClassName)));
		body.getElement().prepend(failure.getElement());
		const cancel = wrap(createButton("cancel", options.cancelLabel || t("collections.cancel")));
		const apply = wrap(createButton("apply", options.applyLabel || t("collections.ok"), classes(options.applyClassName)));
		apply.getElement().disabled = applyDisabled;
		const closeButton = wrap(createCloseButton(options.closeLabel || t("collections.close"), classes(options.closeClassName)));
		const shell = createDialogShell({
			titleId,
			title: options.title,
			body: body.getElement(),
			closeButton: closeButton.getElement(),
			buttons: options.readOnly ? [cancel.getElement()] : [cancel.getElement(), apply.getElement()],
			width: options.width,
			fill: options.fill,
			className: classes(options.className),
			hostClassName: classes(options.hostClassName)
		});
		const modal = wrap(shell.dialog);
		const backdrop = wrap(shell.host);
		function close() {
			if (closed) return;
			closed = true;
			if (confirmation) {
				confirmation.close();
				confirmation = null;
			}
			backdrop.getElement().remove();
			if (options.onClose) options.onClose();
			const restored = previous && previous.isConnected ? previous : options.restoreFocus && options.restoreFocus();
			if (restored && restored.isConnected && restored.focus) restored.focus({ preventScroll: true });
		}
		function requestClose() {
			if (busy || confirmation) return false;
			if (options.canClose && options.canClose() === false) return false;
			if (!options.isDirty || !options.isDirty()) {
				close();
				return true;
			}
			modal.getElement().inert = true;
			setConfirming(modal.getElement(), true);
			confirmation = open$3(backdrop, {
				message: options.discardMessage || t("collections.discardQuestion"),
				onConfirm: close,
				onCancel: function() {
					confirmation = null;
					modal.getElement().inert = false;
					setConfirming(modal.getElement(), false);
					cancel.getElement().focus();
				}
			});
			return false;
		}
		[
			cancel,
			apply,
			closeButton
		].forEach(function(button) {
			button.on("mousedown", function(event) {
				if (event.button === 0) event.preventDefault();
			});
		});
		cancel.on("click", requestClose);
		closeButton.on("click", requestClose);
		apply.on("click", async function() {
			if (busy || applyDisabled || options.readOnly) return;
			busy = true;
			apply.getElement().disabled = true;
			cancel.getElement().disabled = true;
			closeButton.getElement().disabled = true;
			body.getElement().inert = true;
			modal.getElement().setAttribute("aria-busy", "true");
			try {
				if (!options.onApply || await options.onApply() !== false) close();
			} catch (error) {
				failure.getElement().replaceChildren();
				failure.append(renderError(error));
			} finally {
				busy = false;
				apply.getElement().disabled = applyDisabled;
				cancel.getElement().disabled = false;
				closeButton.getElement().disabled = false;
				body.getElement().inert = false;
				modal.getElement().setAttribute("aria-busy", "false");
				if (!closed && (!document.activeElement || document.activeElement === document.body)) apply.getElement().focus();
			}
		});
		modal.on("keydown", function(event) {
			if (event.defaultPrevented) return;
			if (event.target.closest("[role=\"dialog\"], [role=\"alertdialog\"]") !== modal.getElement()) return;
			if (event.key === "Escape") {
				event.preventDefault();
				event.stopPropagation();
				requestClose();
			}
			trapTab(event, modal.getElement());
		});
		host.append(backdrop);
		Promise.resolve().then(function() {
			if (closed) return;
			(options.initialFocus && options.initialFocus() || modal.getElement()).focus();
		});
		return {
			close,
			requestClose,
			root: modal,
			isBusy: function() {
				return busy;
			},
			setApplyDisabled: function(disabled) {
				applyDisabled = Boolean(disabled);
				apply.getElement().disabled = busy || applyDisabled;
			}
		};
	}
	//#endregion
	//#region src/components/list-navigation.js
	var sequence$3 = 0;
	function neighbor(beforeIds, removedIds, afterIds) {
		const removed = new Set(removedIds || []);
		const remaining = new Set(afterIds || []);
		const anchor = (beforeIds || []).findIndex(function(id) {
			return removed.has(id);
		});
		if (anchor < 0) return null;
		for (let previous = anchor - 1; previous >= 0; previous -= 1) if (!removed.has(beforeIds[previous]) && remaining.has(beforeIds[previous])) return beforeIds[previous];
		for (let next = anchor + 1; next < beforeIds.length; next += 1) if (!removed.has(beforeIds[next]) && remaining.has(beforeIds[next])) return beforeIds[next];
		return null;
	}
	function bind$1(container, options) {
		let disposed = false;
		let observer;
		let pointerSelecting = false;
		const owner = String(++sequence$3);
		container.setAttribute("data-list-navigation", owner);
		function rows() {
			return Array.from(options.rows() || []);
		}
		function selected() {
			return options.selected ? options.selected() : null;
		}
		function blocked() {
			return disposed || Boolean(options.busy && options.busy());
		}
		function interactive(target) {
			return Boolean(target && target.closest && target.closest("input,select,textarea,button,a,summary,[contenteditable]:not([contenteditable=\"false\"]),[role=\"textbox\"]"));
		}
		function rowFor(target, current) {
			return current.find(function(row) {
				return row === target || row.contains(target);
			}) || null;
		}
		function sync() {
			if (disposed) return;
			const current = rows();
			const chosen = selected();
			const entry = current.indexOf(chosen) !== -1 ? chosen : current[0];
			container.tabIndex = current.length ? -1 : 0;
			current.forEach(function(row) {
				row.tabIndex = row === entry ? 0 : -1;
				row.setAttribute("aria-selected", String(options.isSelected ? Boolean(options.isSelected(row)) : row === chosen));
			});
		}
		function focus(row) {
			if (!row) {
				container.focus({ preventScroll: true });
				return;
			}
			row.focus({ preventScroll: true });
			if (row.scrollIntoView) row.scrollIntoView({
				block: "nearest",
				inline: "nearest"
			});
		}
		function selectAndFocus(row, event, index) {
			if (!row) return;
			options.select(row, event);
			sync();
			const current = rows();
			const chosen = selected();
			focus(current.indexOf(chosen) !== -1 ? chosen : current[index] || null);
		}
		function focusSelected() {
			if (blocked()) return;
			const current = rows();
			const chosen = selected();
			if (current.indexOf(chosen) === -1) {
				if (current.length) {
					selectAndFocus(current[0], null, 0);
					return;
				}
				sync();
				focus(null);
				return;
			}
			sync();
			focus(chosen);
		}
		function pageSize(row) {
			let scroller = container;
			const view = container.ownerDocument && container.ownerDocument.defaultView;
			while (scroller.parentElement && view && view.getComputedStyle) {
				const style = view.getComputedStyle(scroller);
				if (/auto|scroll/.test(style.overflowY)) break;
				scroller = scroller.parentElement;
			}
			const height = row && row.getBoundingClientRect ? row.getBoundingClientRect().height : 0;
			return height && scroller.clientHeight ? Math.max(1, Math.floor(scroller.clientHeight / height) - 1) : 10;
		}
		function onKey(event) {
			if (event.defaultPrevented || blocked() || event.ctrlKey || event.altKey || event.metaKey || event.shiftKey || interactive(event.target)) return;
			const current = rows();
			if (!current.length) return;
			const row = rowFor(event.target, current) || selected() || current[0];
			const index = current.indexOf(row);
			if (index < 0) return;
			let next = index;
			if (event.key === "ArrowUp") next -= 1;
			else if (event.key === "ArrowDown") next += 1;
			else if (event.key === "Home") next = 0;
			else if (event.key === "End") next = current.length - 1;
			else if (event.key === "PageUp") next -= pageSize(row);
			else if (event.key === "PageDown") next += pageSize(row);
			else if (event.key === " " || event.key === "Spacebar") next = index;
			else if (event.key === "Enter" || event.key === "F2") {
				if (!options.activate || options.canActivate && !options.canActivate(row)) return;
				event.preventDefault();
				event.stopPropagation();
				if (selected() !== row) options.select(row, event);
				sync();
				options.activate(selected() || row, event);
				return;
			} else if (event.key === "Delete") {
				if (!options.remove || options.canRemove && !options.canRemove(row)) return;
				event.preventDefault();
				event.stopPropagation();
				if (selected() !== row) options.select(row, event);
				sync();
				options.remove(selected() || row, event);
				return;
			} else return;
			event.preventDefault();
			event.stopPropagation();
			next = Math.max(0, Math.min(current.length - 1, next));
			selectAndFocus(current[next], event, next);
		}
		function onFocus(event) {
			if (pointerSelecting || blocked() || interactive(event.target)) return;
			const current = rows();
			const row = rowFor(event.target, current);
			if (row && row !== selected()) selectAndFocus(row, event, current.indexOf(row));
		}
		function onPointerDown() {
			pointerSelecting = true;
			const view = container.ownerDocument && container.ownerDocument.defaultView;
			if (view && view.setTimeout) view.setTimeout(function() {
				pointerSelecting = false;
			}, 0);
		}
		container.addEventListener("keydown", onKey);
		container.addEventListener("focusin", onFocus);
		container.addEventListener("pointerdown", onPointerDown);
		const view = container.ownerDocument && container.ownerDocument.defaultView;
		if (view && view.MutationObserver) {
			observer = new view.MutationObserver(sync);
			observer.observe(container, {
				childList: true,
				subtree: true
			});
		}
		sync();
		return {
			sync,
			focusSelected,
			cleanup: function() {
				disposed = true;
				if (container.getAttribute("data-list-navigation") === owner) container.removeAttribute("data-list-navigation");
				container.removeEventListener("keydown", onKey);
				container.removeEventListener("focusin", onFocus);
				container.removeEventListener("pointerdown", onPointerDown);
				if (observer) observer.disconnect();
			}
		};
	}
	//#endregion
	//#region src/components/collection-dialog.js
	var sequence$2 = 0;
	function tr$6(key, values) {
		let text = t("collections." + key);
		Object.keys(values || {}).forEach(function(name) {
			text = text.replace("{" + name + "}", values[name]);
		});
		return text;
	}
	function open$1(host, options) {
		const state = session(options.parameter, options.value);
		const readOnly = Boolean(options.readOnly);
		const fields = state.mode === "key_value" ? ["key", "value"] : ["value"];
		const rules = constraints(options.parameter, options.value);
		const prefix = "collection-" + ++sequence$2;
		let activeCell = {
			id: state.rows[0] && state.rows[0].id,
			field: fields[0]
		};
		let editing = null;
		let drag = null;
		let scrollFrame = null;
		let dialog;
		const add = createElement("button", {
			className: "button",
			attrs: {
				type: "button",
				"data-collection-add": ""
			},
			text: tr$6("add")
		});
		const remove = createElement("button", {
			className: "button",
			attrs: {
				type: "button",
				"data-collection-remove": ""
			},
			text: tr$6("remove")
		});
		const search = createElement("input", { attrs: {
			type: "search",
			placeholder: tr$6("search"),
			"aria-label": tr$6("search")
		} });
		const toolbar = createElement("div", {
			className: "gpo-collection-editor__toolbar",
			children: [
				readOnly ? null : add,
				readOnly ? null : remove,
				search
			]
		});
		const errors = createElement("div", {
			className: "gpo-collection-editor__validation",
			attrs: { role: "alert" }
		});
		const count = createElement("div", { className: "gpo-collection-editor__count" });
		const live = createElement("div", {
			className: "gpo-collection-editor__live",
			attrs: {
				role: "status",
				"aria-live": "polite",
				"aria-atomic": "true"
			}
		});
		const body = createElement("tbody");
		const table = createElement("table", {
			className: ["preference__table", "gpo-collection-table"],
			attrs: {
				"aria-label": options.parameter.label || options.parameter.id,
				tabindex: "0",
				"data-collection-mode": state.mode
			},
			children: [
				createElement("colgroup", { children: [
					readOnly ? null : createElement("col", { className: "gpo-collection-table__handle-column" }),
					createElement("col", { className: state.mode === "key_value" ? "gpo-collection-table__key-column" : "gpo-collection-table__index-column" }),
					createElement("col")
				] }),
				createElement("thead", { children: [createElement("tr", { children: [
					readOnly ? null : createElement("th", { attrs: {
						scope: "col",
						"aria-label": tr$6("reorder")
					} }),
					createElement("th", {
						attrs: { scope: "col" },
						text: state.mode === "key_value" ? tr$6("key") : tr$6("index")
					}),
					createElement("th", {
						attrs: { scope: "col" },
						text: tr$6("value")
					})
				] })] }),
				body
			]
		});
		const scroll = createElement("div", {
			className: "gpo-collection-editor__table-scroll",
			children: [table]
		});
		const content = createElement("div", {
			className: "gpo-collection-editor",
			children: [
				toolbar,
				errors,
				scroll,
				count,
				live
			]
		});
		[add, remove].forEach(function(button) {
			button.on("mousedown", function(event) {
				if (event.button === 0) event.preventDefault();
			});
		});
		function pending() {
			return editing ? {
				id: editing.id,
				field: editing.field,
				value: editing.input.value
			} : null;
		}
		function busy() {
			return Boolean(dialog && (dialog.isBusy() || dialog.root.getElement().inert));
		}
		function cellFor(id, field) {
			return body.getElement().querySelector("[data-collection-row=\"" + id + "\"] [data-collection-field=\"" + field + "\"]");
		}
		function announce(text) {
			live.getElement().textContent = text;
		}
		function updateSelection() {
			Array.from(body.getElement().querySelectorAll("[data-collection-row]")).forEach(function(row) {
				const id = row.getAttribute("data-collection-row");
				row.classList.toggle("active", state.selectedId === id);
				row.setAttribute("aria-selected", String(state.selectedId === id));
				const handle = row.querySelector(".gpo-collection-table__handle");
				if (handle) handle.tabIndex = -1;
				/** @type {HTMLElement[]} */ Array.from(row.querySelectorAll("[data-collection-field]")).forEach(function(cell) {
					cell.tabIndex = id === activeCell.id && cell.getAttribute("data-collection-field") === activeCell.field ? 0 : -1;
				});
			});
			table.getElement().tabIndex = body.getElement().querySelector("[data-collection-row]") ? -1 : 0;
			remove.getElement().disabled = readOnly || busy() || !state.selectedId;
		}
		function updateValidation() {
			const problems = readOnly ? [] : state.errors(pending());
			errors.getElement().textContent = problems.filter(function(problem) {
				return !problem.id;
			}).map(function(problem) {
				return tr$6("errors." + problem.code);
			}).join(" ");
			Array.from(body.getElement().querySelectorAll("[data-collection-field]")).forEach(function(cell) {
				const id = cell.parentElement.getAttribute("data-collection-row");
				const field = cell.getAttribute("data-collection-field");
				const problem = problems.find(function(error) {
					return error.id === id && error.field === field;
				});
				const prior = cell.querySelector(".gpo-collection-cell__error");
				if (prior) prior.remove();
				cell.classList.toggle("gpo-collection-cell--invalid", Boolean(problem));
				const input = cell.querySelector("[data-collection-input]");
				if (problem) {
					const errorId = prefix + "-" + id + "-" + field + "-error";
					cell.appendChild(createElement("span", {
						id: errorId,
						className: "gpo-collection-cell__error",
						text: tr$6("errors." + problem.code)
					}).getElement());
					if (input) {
						input.setAttribute("aria-invalid", "true");
						input.setAttribute("aria-describedby", errorId);
					}
				} else if (input) {
					input.removeAttribute("aria-invalid");
					input.removeAttribute("aria-describedby");
				}
			});
			const size = state.read(pending()).value.length;
			count.getElement().textContent = search.getElement().value ? tr$6("shownCount", {
				shown: state.visible(search.getElement().value).length,
				total: state.rows.length
			}) : tr$6(state.mode === "key_value" ? "pairsCount" : "itemsCount", { count: size });
			if (dialog) dialog.setApplyDisabled(problems.length !== 0);
			return problems;
		}
		function showCell(cell, row, field) {
			cell.classList.remove("gpo-collection-cell--editing");
			cell.replaceChildren(createElement("span", {
				className: "gpo-collection-cell__text",
				text: row[field] || "\xA0"
			}).getElement());
		}
		function finishEdit(commit) {
			if (!editing) return;
			const current = editing;
			editing = null;
			if (commit) state.edit(current.id, current.field, current.input.value);
			const row = state.find(current.id);
			if (row) showCell(current.cell, row, current.field);
			updateValidation();
		}
		function focusCell(id, field) {
			activeCell = {
				id,
				field
			};
			updateSelection();
			const cell = cellFor(id, field);
			if (cell) {
				cell.focus({ preventScroll: true });
				cell.scrollIntoView({
					block: "nearest",
					inline: "nearest"
				});
			}
		}
		function editCell(id, field) {
			if (readOnly || drag || busy()) return;
			finishEdit(true);
			const cell = cellFor(id, field);
			const row = state.find(id);
			if (!cell || !row) return;
			activeCell = {
				id,
				field
			};
			updateSelection();
			const singleLine = field === "key" || state.mode === "list" && rules.unique_keys;
			const input = createElement(singleLine ? "input" : "textarea", { attrs: {
				type: singleLine ? "text" : null,
				rows: singleLine ? null : "1",
				spellcheck: "false",
				"aria-label": tr$6("cellLabel", {
					column: tr$6(field),
					index: state.rows.indexOf(row)
				}),
				"data-collection-input": field
			} }).getElement();
			input.value = row[field];
			cell.replaceChildren(input);
			cell.classList.add("gpo-collection-cell--editing");
			editing = {
				id,
				field,
				input,
				cell
			};
			input.addEventListener("click", function(event) {
				event.stopPropagation();
			});
			input.addEventListener("dblclick", function(event) {
				event.stopPropagation();
			});
			function resizeEditor() {
				if (singleLine) return;
				input.style.height = "auto";
				input.style.height = Math.min(128, Math.max(28, input.scrollHeight)) + "px";
			}
			input.addEventListener("input", function() {
				resizeEditor();
				updateValidation();
			});
			input.addEventListener("blur", function() {
				if (editing && editing.input === input) finishEdit(true);
			});
			input.addEventListener("keydown", function(event) {
				if (event.key === "Escape") {
					event.preventDefault();
					event.stopPropagation();
					finishEdit(false);
					focusCell(id, field);
				} else if (event.key === "Enter" && !event.shiftKey) {
					event.preventDefault();
					event.stopPropagation();
					finishEdit(true);
					focusCell(id, field);
				} else if (event.key === "Tab") {
					const visible = state.visible(search.getElement().value);
					const position = visible.findIndex(function(item) {
						return item.id === id;
					}) * fields.length + fields.indexOf(field) + (event.shiftKey ? -1 : 1);
					finishEdit(true);
					if (position >= 0 && position < visible.length * fields.length) {
						event.preventDefault();
						event.stopPropagation();
						editCell(visible[Math.floor(position / fields.length)].id, fields[position % fields.length]);
					} else {
						event.preventDefault();
						event.stopPropagation();
						(event.shiftKey ? !search.getElement().hidden ? search.getElement() : add.getElement() : dialog.root.getElement().querySelector(".btn-cancel")).focus();
					}
				}
			});
			input.focus();
			input.setSelectionRange(0, input.value.length);
			resizeEditor();
			cell.scrollIntoView({
				block: "nearest",
				inline: "nearest"
			});
			updateValidation();
		}
		function selectCell(id, field) {
			if (busy()) return;
			finishEdit(true);
			state.select(id);
			focusCell(id, field);
		}
		function clearDrag() {
			if (scrollFrame !== null) {
				cancelAnimationFrame(scrollFrame);
				scrollFrame = null;
			}
			drag = null;
			Array.from(body.getElement().querySelectorAll("tr")).forEach(function(row) {
				row.classList.remove("gpo-collection-row--dragging", "gpo-collection-row--before", "gpo-collection-row--after");
			});
		}
		function focusHandle(id) {
			activeCell.id = id;
			updateSelection();
			const row = body.getElement().querySelector("[data-collection-row=\"" + id + "\"]");
			if (row && row.querySelector(".gpo-collection-table__handle")) focusCell(id, activeCell.field);
		}
		function autoScroll() {
			if (!drag) {
				scrollFrame = null;
				return;
			}
			const rect = scroll.getElement().getBoundingClientRect();
			if (drag.y >= rect.top && drag.y <= rect.bottom) {
				if (drag.y < rect.top + 28) scroll.getElement().scrollTop -= 8;
				else if (drag.y > rect.bottom - 28) scroll.getElement().scrollTop += 8;
			}
			scrollFrame = requestAnimationFrame(autoScroll);
		}
		function render() {
			finishEdit(true);
			body.getElement().replaceChildren();
			const visible = state.visible(search.getElement().value);
			if (!visible.some(function(row) {
				return row.id === activeCell.id;
			})) activeCell.id = visible[0] && visible[0].id;
			search.getElement().hidden = state.rows.length < 20 && !search.getElement().value;
			if (!visible.length) body.append(createElement("tr", {
				className: "gpo-collection-table__empty",
				children: [createElement("td", {
					attrs: { colspan: readOnly ? 2 : 3 },
					text: tr$6(state.rows.length ? "noMatches" : "empty")
				})]
			}));
			visible.forEach(function(row) {
				const index = state.rows.indexOf(row);
				const record = createElement("tr", { attrs: { "data-collection-row": row.id } });
				if (!readOnly) {
					const handle = createElement("button", {
						className: "gpo-collection-table__handle",
						attrs: {
							type: "button",
							draggable: search.getElement().value ? "false" : "true",
							"aria-label": tr$6("reorderRow", { index }),
							"aria-describedby": prefix + "-reorder-help",
							tabindex: "-1",
							title: tr$6(search.getElement().value ? "clearSearchToReorder" : "reorderHelp")
						},
						text: "⋮"
					});
					handle.getElement().disabled = Boolean(search.getElement().value);
					handle.on("click", function() {
						finishEdit(true);
						state.select(row.id);
						activeCell.id = row.id;
						updateSelection();
					});
					handle.on("dragstart", function(event) {
						if (search.getElement().value) {
							event.preventDefault();
							return;
						}
						finishEdit(true);
						state.select(row.id);
						activeCell.id = row.id;
						updateSelection();
						drag = {
							id: row.id,
							targetId: row.id,
							after: false,
							y: event.clientY
						};
						event.dataTransfer.effectAllowed = "move";
						event.dataTransfer.setData("text/plain", row.id);
						record.getElement().classList.add("gpo-collection-row--dragging");
						scrollFrame = requestAnimationFrame(autoScroll);
					});
					handle.on("dragend", clearDrag);
					handle.on("keydown", function(event) {
						if (!busy() && !search.getElement().value && event.ctrlKey && !event.altKey && !event.metaKey && (event.key === "ArrowUp" || event.key === "ArrowDown")) {
							event.preventDefault();
							event.stopPropagation();
							finishEdit(true);
							state.move(row.id, state.rows.indexOf(row) + (event.key === "ArrowUp" ? -1 : 1));
							render();
							focusHandle(row.id);
							announce(tr$6("moved", { index: state.rows.indexOf(row) }));
						}
					});
					record.append(createElement("td", {
						className: "gpo-collection-table__handle-cell",
						children: [handle]
					}));
				}
				if (state.mode === "list") record.append(createElement("td", {
					className: "gpo-collection-table__index",
					text: index
				}));
				fields.forEach(function(field) {
					const cell = createElement("td", {
						className: ["gpo-collection-cell", "field__element"],
						attrs: {
							"data-collection-field": field,
							tabindex: "-1"
						}
					});
					showCell(cell.getElement(), row, field);
					cell.on("click", function() {
						selectCell(row.id, field);
					});
					cell.on("dblclick", function(event) {
						event.preventDefault();
						editCell(row.id, field);
					});
					record.append(cell);
				});
				record.on("click", function(event) {
					if (!event.target.closest("[data-collection-field], button, input, textarea")) selectCell(row.id, fields[0]);
				});
				body.append(record);
			});
			updateSelection();
			updateValidation();
		}
		add.on("click", function() {
			if (readOnly || busy()) return;
			finishEdit(true);
			search.getElement().value = "";
			const id = state.add();
			activeCell = {
				id,
				field: fields[0]
			};
			render();
			editCell(id, fields[0]);
			announce(tr$6("added"));
		});
		function removeSelected() {
			if (readOnly || busy() || !state.selectedId) return;
			finishEdit(true);
			const before = Array.from(body.getElement().querySelectorAll("[data-collection-row]")).map(function(row) {
				return row.getAttribute("data-collection-row");
			});
			const removedId = state.selectedId;
			if (!state.removeSelected()) return;
			const after = state.visible(search.getElement().value).map(function(row) {
				return row.id;
			});
			const nextId = neighbor(before, [removedId], after);
			state.select(nextId);
			activeCell.id = nextId;
			render();
			if (nextId) focusCell(nextId, activeCell.field);
			else table.getElement().focus({ preventScroll: true });
			announce(tr$6("removed"));
		}
		remove.on("click", removeSelected);
		search.on("input", function() {
			finishEdit(true);
			state.select(null);
			render();
		});
		table.on("focusin", function(event) {
			if (busy() || event.target.closest("input,select,textarea,button,a,[contenteditable]:not([contenteditable=\"false\"])")) return;
			const cell = event.target.closest("[data-collection-field]");
			if (!cell) return;
			activeCell = {
				id: cell.parentElement.getAttribute("data-collection-row"),
				field: cell.getAttribute("data-collection-field")
			};
			state.select(activeCell.id);
			updateSelection();
		});
		content.on("keydown", function(event) {
			if (event.defaultPrevented || busy() || !table.getElement().contains(event.target) || event.target.closest("input,select,textarea,button,a,summary,[contenteditable]:not([contenteditable=\"false\"])")) return;
			if (drag && event.key === "Escape") {
				event.preventDefault();
				event.stopPropagation();
				clearDrag();
				return;
			}
			if (event.ctrlKey && !event.altKey && !event.metaKey && !readOnly && !search.getElement().value && (event.key === "ArrowUp" || event.key === "ArrowDown") && activeCell.id) {
				event.preventDefault();
				event.stopPropagation();
				finishEdit(true);
				state.select(activeCell.id);
				state.move(activeCell.id, state.rows.findIndex(function(row) {
					return row.id === activeCell.id;
				}) + (event.key === "ArrowUp" ? -1 : 1));
				render();
				focusCell(activeCell.id, activeCell.field);
				announce(tr$6("moved", { index: state.rows.findIndex(function(row) {
					return row.id === activeCell.id;
				}) }));
				return;
			}
			if (event.ctrlKey || event.altKey || event.metaKey || event.shiftKey) return;
			if (event.key === "Delete" && !readOnly) {
				event.preventDefault();
				removeSelected();
				return;
			}
			if ((event.key === "Enter" || event.key === "F2") && activeCell.id && !readOnly && !event.target.matches("button")) {
				event.preventDefault();
				editCell(activeCell.id, activeCell.field);
				return;
			}
			const visible = state.visible(search.getElement().value);
			const index = visible.findIndex(function(row) {
				return row.id === activeCell.id;
			});
			if (index < 0) return;
			if (event.key === " " || event.key === "Spacebar") {
				event.preventDefault();
				selectCell(activeCell.id, activeCell.field);
			} else if ([
				"ArrowUp",
				"ArrowDown",
				"Home",
				"End",
				"PageUp",
				"PageDown"
			].indexOf(event.key) !== -1) {
				event.preventDefault();
				let position = index;
				const row = body.getElement().querySelector("[data-collection-row=\"" + activeCell.id + "\"]");
				const pageSize = Math.max(1, Math.floor(scroll.getElement().clientHeight / Math.max(1, row.getBoundingClientRect().height)) - 1);
				if (event.key === "Home") position = 0;
				else if (event.key === "End") position = visible.length - 1;
				else position += (event.key === "ArrowUp" || event.key === "PageUp" ? -1 : 1) * (event.key === "PageUp" || event.key === "PageDown" ? pageSize : 1);
				const next = visible[Math.max(0, Math.min(visible.length - 1, position))];
				selectCell(next.id, activeCell.field);
			} else if (state.mode === "key_value" && (event.key === "ArrowLeft" || event.key === "ArrowRight")) {
				event.preventDefault();
				selectCell(activeCell.id, event.key === "ArrowLeft" ? "key" : "value");
			}
		});
		scroll.on("dragover", function(event) {
			if (!drag) return;
			event.preventDefault();
			event.dataTransfer.dropEffect = "move";
			drag.y = event.clientY;
			let target = event.target.closest("[data-collection-row]");
			Array.from(body.getElement().querySelectorAll("tr")).forEach(function(row) {
				row.classList.remove("gpo-collection-row--before", "gpo-collection-row--after");
			});
			if (!target) target = body.getElement().lastElementChild;
			if (!target || !target.hasAttribute("data-collection-row")) return;
			drag.targetId = target.getAttribute("data-collection-row");
			const rect = target.getBoundingClientRect();
			drag.after = event.clientY > rect.top + rect.height / 2;
			if (drag.targetId !== drag.id) target.classList.add(drag.after ? "gpo-collection-row--after" : "gpo-collection-row--before");
		});
		scroll.on("drop", function(event) {
			if (!drag) return;
			event.preventDefault();
			event.stopPropagation();
			const from = state.rows.findIndex(function(row) {
				return row.id === drag.id;
			});
			let to = state.rows.findIndex(function(row) {
				return row.id === drag.targetId;
			}) + (drag.after ? 1 : 0);
			if (from < to) to -= 1;
			const id = drag.id;
			state.move(id, to);
			clearDrag();
			render();
			focusHandle(id);
			announce(tr$6("moved", { index: state.rows.findIndex(function(row) {
				return row.id === id;
			}) }));
		});
		content.append(createElement("span", {
			id: prefix + "-reorder-help",
			className: "gpo-collection-editor__live",
			text: tr$6("reorderHelp")
		}));
		render();
		dialog = open$2(host, {
			title: options.parameter.label || options.parameter.id,
			className: ["gpo-collection-dialog"],
			width: "640px",
			fill: true,
			content,
			readOnly,
			cancelLabel: tr$6(readOnly ? "close" : "cancel"),
			isDirty: function() {
				return !readOnly && state.isDirty(pending());
			},
			onApply: function() {
				finishEdit(true);
				const problems = updateValidation();
				if (problems.length) {
					if (problems[0].id) focusCell(problems[0].id, problems[0].field);
					else add.getElement().focus();
					return false;
				}
				options.onAccept(state.read());
				return true;
			},
			onClose: function() {
				clearDrag();
				editing = null;
				if (options.onClose) options.onClose();
			}
		});
		updateValidation();
		dialog.isDirty = function() {
			return !readOnly && state.isDirty(pending());
		};
		return dialog;
	}
	//#endregion
	//#region src/components/collection-control.js
	function tr$5(key, values) {
		let text = t("collections." + key);
		Object.keys(values || {}).forEach(function(name) {
			text = text.replace("{" + name + "}", values[name]);
		});
		return text;
	}
	function createControl(parameter, initial, editable) {
		let value = initial ? JSON.parse(JSON.stringify(initial)) : empty(parameter, initial);
		let canEdit = Boolean(editable);
		let modal = null;
		const button = createElement("button", {
			className: ["button", "gpo-collection-control__button"],
			attrs: { type: "button" }
		});
		const count = createElement("span", { className: "gpo-collection-control__count" });
		const preview = createElement("span", {
			className: "gpo-collection-control__preview",
			attrs: { "aria-hidden": "true" }
		});
		const host = createElement("div", { className: "gpo-collection-control__dialog-host" });
		const root = createElement("div", {
			className: "gpo-collection-control",
			children: [
				createElement("div", {
					className: "gpo-collection-control__summary",
					children: [count, preview]
				}),
				button,
				host
			]
		});
		function refresh() {
			const summary = summary$1(parameter, value);
			button.getElement().textContent = tr$5("edit");
			button.getElement().setAttribute("aria-label", tr$5("editLabel", { label: parameter.label || parameter.id }));
			button.getElement().disabled = !canEdit;
			count.getElement().textContent = summary.count ? tr$5(summary.mode === "key_value" ? "pairsCount" : "itemsCount", { count: summary.count }) : tr$5("empty");
			preview.getElement().textContent = summary.preview.map(function(text) {
				return text || tr$5("emptyValue");
			}).join(", ") + (summary.more ? ", …" : "");
		}
		button.on("click", function() {
			if (modal || !canEdit) return;
			modal = open$1(host, {
				parameter,
				value,
				readOnly: false,
				onAccept: function(next) {
					value = JSON.parse(JSON.stringify(next));
					refresh();
					root.getElement().dispatchEvent(new Event("change", { bubbles: true }));
				},
				onClose: function() {
					modal = null;
				}
			});
		});
		refresh();
		return {
			element: root,
			button: button.getElement(),
			read: function() {
				return JSON.parse(JSON.stringify(value));
			},
			hasOpenDialog: function() {
				return Boolean(modal);
			},
			hasUnsavedChanges: function() {
				return Boolean(modal && modal.isDirty());
			},
			setEditable: function(enabled) {
				canEdit = Boolean(enabled);
				refresh();
			},
			destroy: function() {
				if (modal) modal.close();
			}
		};
	}
	//#endregion
	//#region src/components/templates/security/dialog.js
	var sequence$1 = 0;
	function tr$4(key, fallback) {
		const value = t("security." + key);
		return value && value !== "security." + key ? value : fallback;
	}
	function tabs(settings, explanation) {
		const id = "security-tabs-" + ++sequence$1;
		const panels = [settings, explanation];
		const buttons = [];
		function select(index, focus) {
			panels.forEach(function(panel, position) {
				const active = position === index;
				panel.getElement().hidden = !active;
				panel.getElement().classList.toggle("active", active);
				buttons[position].getElement().classList.toggle("active", active);
				buttons[position].getElement().setAttribute("aria-selected", String(active));
				buttons[position].getElement().tabIndex = active ? 0 : -1;
			});
			if (focus) buttons[index].getElement().focus();
		}
		const bar = createElement("div", {
			className: "tab-buttons",
			attrs: {
				role: "tablist",
				"aria-label": tr$4("properties", "Properties")
			}
		});
		[tr$4("settingTab", "Security Policy Setting"), tr$4("explanationTab", "Explanation")].forEach(function(label, index) {
			const button = createElement("button", {
				id: id + "-tab-" + index,
				className: "preference__tab-button",
				attrs: {
					type: "button",
					role: "tab",
					"aria-controls": id + "-panel-" + index
				},
				text: label
			});
			button.on("click", function() {
				select(index);
			});
			button.on("keydown", function(event) {
				let next;
				if (event.key === "ArrowLeft" || event.key === "ArrowRight") next = 1 - index;
				else if (event.key === "Home") next = 0;
				else if (event.key === "End") next = 1;
				if (next !== void 0) {
					event.preventDefault();
					select(next, true);
				}
			});
			buttons.push(button);
			bar.append(button);
			const panel = panels[index].getElement();
			panel.id = id + "-panel-" + index;
			panel.setAttribute("role", "tabpanel");
			panel.setAttribute("aria-labelledby", id + "-tab-" + index);
			panel.setAttribute("tabindex", "0");
			panel.classList.add("tab-content");
		});
		select(0);
		return createElement("div", {
			className: ["preference__modal-tabs", "gpo-security-tabs"],
			children: [
				bar,
				settings,
				explanation
			]
		});
	}
	function open(host, options) {
		return open$2(host, Object.assign({}, options, {
			className: ["gpo-security-dialog"],
			hostClassName: ["gpo-security-dialog-host"],
			bodyClassName: "gpo-security-dialog__body",
			errorClassName: "gpo-security-error",
			applyClassName: "gpo-security-dialog__apply",
			closeClassName: "gpo-security-dialog__close",
			cancelLabel: options.cancelLabel || tr$4("cancel", "Cancel"),
			closeLabel: tr$4("close", "Close"),
			applyLabel: options.applyLabel || tr$4("apply", "Apply"),
			discardMessage: tr$4("discardQuestion", "Discard unsaved changes?")
		}));
	}
	//#endregion
	//#region src/components/templates/admx/policy-contents.js
	var nextParameterControlId = 1;
	function appendLines(container, text) {
		String(text || "").split(/\r?\n/).forEach(function(line, index) {
			if (index) container.appendChild(document.createElement("br"));
			container.appendChild(document.createTextNode(line));
		});
	}
	function inputValue(value) {
		const payload = valuePayload(value);
		return Array.isArray(payload) ? payload.join("\n") : payload === null || payload === void 0 ? "" : payload;
	}
	function createParameterControl(parameter, editable) {
		const knownKinds = [
			"boolean",
			"decimal",
			"enum",
			"text",
			"list"
		];
		const unsupportedValue = parameter.value && parameter.value.kind === "unsupported";
		const unsupportedDefault = (parameter.value === null || parameter.value === void 0) && parameter.default_value && parameter.default_value.kind === "unsupported";
		const unsupported = unsupportedValue || knownKinds.indexOf(parameter.kind) === -1;
		const disabled = !editable || parameter.editable === false || unsupported;
		let input;
		let inputElement = null;
		let collectionControl = null;
		const renderedValue = parameter.value === null || parameter.value === void 0 ? unsupportedDefault ? null : parameter.default_value : parameter.value;
		const choices = parameter.choices || [];
		if (unsupported) input = createElement("pre", {
			className: ["gpo-editor-unsupported", "field__element"],
			text: JSON.stringify(renderedValue && renderedValue.value !== void 0 ? renderedValue.value : {
				kind: parameter.kind,
				value: renderedValue
			}, null, 2)
		});
		else if (parameter.kind === "boolean") {
			const checkboxId = "gpo-editor-parameter-" + nextParameterControlId++;
			const checkbox = createElement("input", { attrs: {
				id: checkboxId,
				type: "checkbox",
				disabled: disabled ? "disabled" : null
			} });
			inputElement = checkbox.getElement();
			inputElement.checked = Boolean(inputValue(renderedValue));
			input = createElement("span", {
				className: "gpo-editor-boolean",
				children: [checkbox, createElement("label", { attrs: {
					for: checkboxId,
					"aria-label": parameter.label || parameter.id
				} })]
			});
		} else if (parameter.kind === "enum") {
			input = createElement("select", {
				attrs: { disabled: disabled ? "disabled" : null },
				children: [!parameter.required ? createElement("option", {
					attrs: { value: "" },
					text: "—"
				}) : null].concat(choices.map(function(choice, index) {
					return createElement("option", {
						attrs: {
							value: String(index),
							disabled: choice.value && choice.value.kind === "unsupported" ? "disabled" : null
						},
						text: choice.label || String(valuePayload(choice.value))
					});
				}))
			});
			const selectedIndex = choices.findIndex(function(choice) {
				return equal(choice.value, renderedValue);
			});
			input.getElement().value = selectedIndex < 0 ? "" : String(selectedIndex);
		} else if (parameter.kind === "list") {
			collectionControl = createControl(parameter, renderedValue, !disabled);
			input = collectionControl.element;
			inputElement = collectionControl.button;
		} else input = createElement("input", { attrs: {
			type: parameter.kind === "decimal" ? "number" : "text",
			min: parameter.min_value,
			max: parameter.max_value,
			maxlength: parameter.max_length,
			required: parameter.required ? "required" : null,
			disabled: disabled ? "disabled" : null,
			value: inputValue(renderedValue)
		} });
		if (!inputElement) inputElement = input.getElement();
		if (!unsupported && !collectionControl) inputElement.setAttribute("aria-label", parameter.label || parameter.id);
		let stateDisabled = false;
		function syncControlState() {
			const unavailable = disabled || unsupported || stateDisabled;
			if (collectionControl) collectionControl.setEditable(!unavailable);
			else inputElement.disabled = unavailable;
		}
		syncControlState();
		function read() {
			if (unsupported) return clone$2(parameter.value);
			if (collectionControl) return collectionControl.read();
			if (parameter.kind === "enum") return policyChoiceValue(choices, inputElement.value);
			return typedValueFromInput(parameter.value, parameter.kind, inputElement.value, inputElement.checked);
		}
		return {
			element: createElement("div", {
				className: [
					"gp__admx-options",
					collectionControl ? "gp__admx-options--collection" : null,
					unsupported ? "gpo-editor-field--unsupported" : null,
					unsupportedDefault ? "gpo-editor-field--unsupported-default" : null
				],
				attrs: { "data-field-id": parameter.id },
				children: [input, unsupportedDefault ? createElement("span", {
					className: "gpo-editor-field__diagnostic",
					text: t("policies.unsupportedDefault")
				}) : null]
			}),
			read,
			input: inputElement,
			destroy: function() {
				if (collectionControl) collectionControl.destroy();
			},
			hasOpenDialog: function() {
				return Boolean(collectionControl && collectionControl.hasOpenDialog());
			},
			hasUnsavedDialogChanges: function() {
				return Boolean(collectionControl && collectionControl.hasUnsavedChanges());
			},
			setDisabled: function(shouldDisable) {
				stateDisabled = Boolean(shouldDisable);
				syncControlState();
			}
		};
	}
	function renderPolicyContents(root, policy, handlers) {
		const capabilities = policy.capabilities || {};
		const unknown = policy.state === "unknown_raw_values";
		const controls = /* @__PURE__ */ new Map();
		const stateNames = {
			not_configured: t("policies.notConfigured"),
			enabled: t("policies.enabled"),
			disabled: t("policies.disabled")
		};
		const stateControls = Object.keys(stateNames).map(function(state) {
			const allowed = canSelectPolicyState(policy, state);
			const radio = createElement("input", { attrs: {
				type: "radio",
				name: "admx-state",
				value: state,
				checked: policy.state === state ? "checked" : null,
				disabled: allowed ? null : "disabled"
			} });
			return createElement("label", {
				className: ["gp__admx-radio", allowed ? null : "gpo-editor-control--disabled"],
				children: [radio, createElement("span", { text: stateNames[state] })]
			});
		});
		const parameterRows = (capabilities.inspect_parameters ? policy.parameters || [] : []).map(function(parameter) {
			if (parameter.kind === "list" && !parameter.collection && policyStateAction(policy, "enabled").mode === "dynamic_list_values") parameter = Object.assign({}, parameter, { collection: {
				mode: parameter.value && parameter.value.kind === "key_value_list" ? "key_value" : "list",
				unique_keys: true,
				key_case_sensitive: false,
				allow_empty_values: false,
				min_items: 1
			} });
			const control = createParameterControl(parameter, Boolean(capabilities.edit_parameters) && !unknown);
			if (handlers.modalLayout) control.element.addClass("field__element");
			controls.set(parameter.id, control);
			return createElement("div", {
				className: "gp__admx-item",
				children: [createElement("div", {
					className: "gp__admx-description",
					text: parameter.label || parameter.id
				}), control.element]
			});
		});
		const comment = createElement("textarea", {
			attrs: {
				name: "comment",
				disabled: capabilities.edit_comments && !unknown ? null : "disabled"
			},
			text: policy.comment ? policy.comment.text : ""
		});
		const errorSlot = createElement("div", { className: "gpo-editor-form__error" });
		const wrapper = createElement("div", {
			className: "gp__admx-wrapper",
			children: [
				handlers.categoryPath ? createElement("div", {
					className: "gpo-security-workbench__toolbar",
					children: [createElement("h2", {
						text: handlers.categoryPath,
						attrs: { "data-category-path": "" }
					})]
				}) : null,
				errorSlot,
				unknown ? renderUnsupported(t("policies.unsupportedSource")) : null,
				createElement("div", {
					className: ["gp__admx", (policy.parameters || []).some(function(parameter) {
						return parameter.kind === "list";
					}) ? "gp__admx--collections" : null],
					children: [createElement("div", {
						className: "gp__admx-settings",
						children: [
							createElement("div", {
								className: "title",
								children: [t("policies.policy") + " ", createElement("span", {
									className: "title__name",
									text: policy.label || policy.policy_id
								})]
							}),
							createElement("div", {
								className: "gp__admx-state-policy-title",
								text: t("policies.policyState")
							}),
							createElement("div", {
								className: "gp__admx-state-policy",
								children: stateControls
							}),
							createElement("div", { className: "field__line" })
						]
					}), createElement("div", {
						className: "gp__admx-info",
						children: parameterRows.length ? [createElement("div", {
							className: "gp__admx-item",
							children: [createElement("div", {
								className: "gp__admx-description",
								text: t("common.description")
							}), createElement("div", {
								className: "gp__admx-options",
								text: t("common.options")
							})]
						})].concat(parameterRows) : []
					})]
				}),
				createElement("div", {
					className: ["gp__admx-help", handlers.isHelpOpen ? "is-open" : null],
					children: [
						createElement("div", {
							className: "gp__admx-supported",
							children: [createElement("div", {
								className: "title",
								text: t("policies.supportedOn")
							}), createElement("div", {
								className: "gp__admx-content",
								text: policy.supported_on || ""
							})]
						}),
						createElement("div", {
							className: "gp__admx-comment",
							children: [createElement("div", {
								className: "title",
								text: t("common.comment")
							}), comment]
						}),
						createElement("div", {
							className: "gp__admx-text-help",
							children: [createElement("div", {
								className: "title",
								text: t("common.help")
							}), createElement("div", { className: "gp__admx-content" })]
						})
					]
				})
			]
		});
		root.innerHTML = "";
		if (handlers.modalLayout) {
			const settings = createElement("div", {
				className: "gpo-admx-dialog__settings",
				children: [
					errorSlot,
					unknown ? renderUnsupported(t("policies.unsupportedSource")) : null,
					createElement("div", {
						className: "gp__admx-settings",
						children: [createElement("div", {
							className: "gp__admx-state-policy-title",
							text: t("policies.policyState")
						}), createElement("div", {
							className: "gp__admx-state-policy",
							children: stateControls
						})]
					})
				].concat(parameterRows, [createElement("div", {
					className: "gpo-admx-dialog__comment",
					children: [createElement("label", {
						text: t("common.comment"),
						attrs: { for: "admx-comment-" + nextParameterControlId }
					}), createElement("div", {
						className: "field__element",
						children: [comment]
					})]
				})])
			});
			comment.getElement().id = "admx-comment-" + nextParameterControlId++;
			const supported = createElement("p");
			appendLines(supported.getElement(), policy.supported_on || "—");
			const help = createElement("p");
			appendLines(help.getElement(), policy.explain_text || t("security.noExplanation"));
			const tabs$1 = tabs(settings, createElement("div", {
				className: "gpo-admx-dialog__explanation",
				children: [
					createElement("h3", { text: t("policies.supportedOn") }),
					supported,
					createElement("h3", { text: t("security.explanationTab") }),
					help
				]
			}));
			tabs$1.getElement().querySelector("[role=\"tab\"]").textContent = t("policies.parametersTab");
			root.appendChild(tabs$1.getElement());
		} else {
			root.appendChild(wrapper.getElement());
			appendLines(root.querySelector(".gp__admx-text-help .gp__admx-content"), policy.explain_text || "");
		}
		function selectedState() {
			const selected = root.querySelector("input[name=\"admx-state\"]:checked");
			return selected ? selected.value : policy.state;
		}
		function syncPolicyState() {
			const editable = canEditPolicyParameters(policy, selectedState());
			controls.forEach(function(control) {
				control.setDisabled(!editable);
			});
			return editable;
		}
		syncPolicyState();
		function readDraft() {
			return {
				state: selectedState(),
				parameters: (policy.parameters || []).map(function(parameter) {
					return {
						parameter_id: parameter.id,
						value: controls.has(parameter.id) ? controls.get(parameter.id).read() : clone$2(parameter.value)
					};
				}),
				comment: comment.getElement().value
			};
		}
		return {
			readDraft,
			syncPolicyState,
			errorSlot: errorSlot.getElement(),
			controls,
			hasOpenDialog: function() {
				return Array.from(controls.values()).some(function(control) {
					return control.hasOpenDialog();
				});
			},
			hasUnsavedDialogChanges: function() {
				return Array.from(controls.values()).some(function(control) {
					return control.hasUnsavedDialogChanges();
				});
			},
			destroy: function() {
				controls.forEach(function(control) {
					control.destroy();
				});
			}
		};
	}
	//#endregion
	//#region src/components/templates/admx-template.js
	async function renderAdmxTemplate(options) {
		const config = options || {};
		const item = config.item || {};
		const root = createElement("div", { className: "gpo-editor-policy" });
		const headerElement = config.header && config.header.getElement ? config.header.getElement() : null;
		const actions = headerElement ? headerElement.querySelector(".gp__control-actions") : null;
		const preferenceActions = headerElement ? headerElement.querySelector(".gp__control") : null;
		const applyButton = headerElement ? headerElement.querySelector(".admx__btn-apply") : null;
		const cancelButton = headerElement ? headerElement.querySelector(".admx__btn-cancel") : null;
		let policy;
		let view;
		let baseline;
		let saving = false;
		if (actions) actions.style.display = "flex";
		if (preferenceActions) preferenceActions.style.display = "none";
		try {
			const response = await policyShow(item.scope, item.policyId);
			policy = response.policy || response;
		} catch (error) {
			root.append(renderError(error, {
				onRefresh: config.onLoadRefresh || function() {
					window.location.reload();
				},
				onReconcile: function() {
					reconcile();
				}
			}));
			root.cleanup = function() {
				if (actions) actions.style.display = "none";
			};
			return root;
		}
		if (typeof config.isCurrent === "function" && !config.isCurrent()) {
			if (actions) actions.style.display = "none";
			return root;
		}
		function render() {
			if (view) view.destroy();
			view = renderPolicyContents(root.getElement(), policy, {
				isHelpOpen: config.isHelpOpen,
				categoryPath: config.categoryPath,
				modalLayout: config.modalLayout
			});
			baseline = view.readDraft();
			refreshButtons();
			if (config.onRendered) config.onRendered(policy);
		}
		function hasUnsavedPolicyChanges() {
			return Boolean(view) && !equal(view.readDraft(), baseline);
		}
		function hasUnsavedChanges() {
			return hasUnsavedPolicyChanges() || Boolean(view && view.hasUnsavedDialogChanges());
		}
		function refreshButtons() {
			const active = !saving && hasUnsavedPolicyChanges();
			if (applyButton) applyButton.classList.toggle("active", active);
			if (cancelButton) cancelButton.classList.toggle("active", active);
		}
		function showError(error) {
			if (!view || !view.errorSlot) return;
			view.errorSlot.innerHTML = "";
			const category = errorCategory(error);
			const errorActions = { onReconcile: async function(event) {
				event.currentTarget.disabled = true;
				try {
					await reconcile();
				} catch (reconcileError) {
					showError(reconcileError);
				} finally {
					event.currentTarget.disabled = false;
				}
			} };
			if (category === "storage_conflict" || category === "publication_conflict" || category === "not_found") errorActions.onRefresh = async function() {
				if (!(config.confirmRefresh ? await config.confirmRefresh() : window.confirm(t("collections.discardQuestion")))) return;
				try {
					const response = await policyShow(item.scope, item.policyId);
					policy = response.policy || response;
					render();
				} catch (refreshError) {
					showError(refreshError);
				}
			};
			view.errorSlot.appendChild(renderError(error, errorActions).getElement());
			if (error && error.field) view.controls.forEach(function(control, id) {
				if (error.field === id || String(error.field).indexOf(id) !== -1) control.element.getElement().classList.add("gpo-editor-field--error");
			});
		}
		async function applyChanges() {
			if (saving) return false;
			if (view.hasOpenDialog()) return false;
			const draft = view.readDraft();
			const validationError = validatePolicyDraft(policy, draft);
			if (validationError) {
				showError(validationError);
				return false;
			}
			const request = buildPolicyUpdate(policy, draft, baseline);
			if (!hasOperations(request)) return true;
			saving = true;
			root.getElement().inert = true;
			refreshButtons();
			try {
				/** @type {{ ok: boolean, response?: any, error?: any, draft?: any }} */
				const outcome = await submitPreservingDraft(draft, function() {
					return policyUpdate(item.scope, item.policyId, request);
				});
				if (!outcome.ok) {
					showError(outcome.error);
					return false;
				}
				policy = outcome.response.policy || outcome.response;
				render();
				if (config.onSaved) config.onSaved(outcome.response);
				return true;
			} finally {
				saving = false;
				root.getElement().inert = false;
				refreshButtons();
			}
		}
		function cancelChanges() {
			render();
		}
		function handleChange() {
			if (view && typeof view.syncPolicyState === "function") view.syncPolicyState();
			refreshButtons();
			if (config.onDraftChange) config.onDraftChange();
		}
		function handleApply() {
			if (applyButton && applyButton.classList.contains("active")) applyChanges();
		}
		function handleCancel() {
			if (cancelButton && cancelButton.classList.contains("active")) cancelChanges();
		}
		root.getElement().addEventListener("input", handleChange);
		root.getElement().addEventListener("change", handleChange);
		if (applyButton) applyButton.addEventListener("click", handleApply);
		if (cancelButton) cancelButton.addEventListener("click", handleCancel);
		root.hasUnsavedChanges = hasUnsavedChanges;
		root.applyChanges = applyChanges;
		root.cancelChanges = cancelChanges;
		root.canApply = function() {
			return Boolean(policy && policy.state !== "unknown_raw_values" && (policy.capabilities && policy.capabilities.edit_comments || [
				"enabled",
				"disabled",
				"not_configured"
			].some(function(state) {
				return canSelectPolicyState(policy, state);
			}) || canEditPolicyParameters(policy)));
		};
		root.cleanup = function() {
			if (view) view.destroy();
			root.getElement().removeEventListener("input", handleChange);
			root.getElement().removeEventListener("change", handleChange);
			if (applyButton) applyButton.removeEventListener("click", handleApply);
			if (cancelButton) cancelButton.removeEventListener("click", handleCancel);
			if (actions) actions.style.display = "none";
			if (applyButton) applyButton.classList.remove("active");
			if (cancelButton) cancelButton.classList.remove("active");
		};
		render();
		return root;
	}
	function openAdmxDialog(host, options) {
		const config = options || {};
		const item = config.item || {};
		const content = createElement("div", {
			className: "gpo-admx-dialog__content",
			children: [createElement("div", {
				className: "gpo-admx-dialog__loading",
				attrs: { role: "status" },
				text: t("treeView.loadingPolicies")
			})]
		});
		let currentEditor = null;
		let closed = false;
		let refreshConfirmation = null;
		let finishRefreshConfirmation = null;
		let loadSequence = 0;
		function isCurrent() {
			return !closed && (!config.isCurrent || config.isCurrent());
		}
		function cleanupEditor() {
			if (closed) return;
			closed = true;
			if (refreshConfirmation) refreshConfirmation.close();
			if (finishRefreshConfirmation) finishRefreshConfirmation(false);
			if (currentEditor && currentEditor.cleanup) currentEditor.cleanup();
			currentEditor = null;
			if (config.onClose) config.onClose();
		}
		const editor = {
			getElement: function() {
				return content.getElement();
			},
			hasUnsavedChanges: function() {
				return Boolean(!closed && currentEditor && currentEditor.hasUnsavedChanges && currentEditor.hasUnsavedChanges());
			},
			applyChanges: function() {
				return isCurrent() && currentEditor && currentEditor.applyChanges ? currentEditor.applyChanges() : Promise.resolve(false);
			},
			cancelChanges: function() {
				if (currentEditor && currentEditor.cancelChanges) currentEditor.cancelChanges();
			},
			isReady: function() {
				return Boolean(currentEditor && currentEditor.applyChanges);
			},
			cleanup: function() {
				dialog.close();
			}
		};
		const dialog = open$2(host, {
			title: item.title || item.label || item.policyId,
			className: ["gpo-admx-dialog"],
			width: "640px",
			fill: true,
			content,
			applyLabel: t("security.apply"),
			cancelLabel: t("security.cancel"),
			applyDisabled: true,
			restoreFocus: config.restoreFocus,
			isDirty: editor.hasUnsavedChanges,
			onApply: editor.applyChanges,
			onClose: cleanupEditor
		});
		function confirmRefresh() {
			if (!isCurrent() || refreshConfirmation) return Promise.resolve(false);
			return new Promise(function(resolve) {
				const modal = dialog.root.getElement();
				const previousFocus = document.activeElement;
				modal.inert = true;
				setConfirming(modal, true);
				finishRefreshConfirmation = function(confirmed) {
					refreshConfirmation = null;
					finishRefreshConfirmation = null;
					modal.inert = false;
					setConfirming(modal, false);
					if (!closed && previousFocus && previousFocus.isConnected) previousFocus.focus();
					resolve(confirmed);
				};
				refreshConfirmation = open$3(modal.parentElement, {
					message: t("collections.discardQuestion"),
					onConfirm: function() {
						finishRefreshConfirmation(true);
					},
					onCancel: function() {
						finishRefreshConfirmation(false);
					}
				});
			});
		}
		function load() {
			const sequence = ++loadSequence;
			function ownsLoad() {
				return isCurrent() && sequence === loadSequence;
			}
			return renderAdmxTemplate({
				item,
				modalLayout: true,
				isCurrent: ownsLoad,
				confirmRefresh,
				onSaved: function(response) {
					if (ownsLoad() && config.onSaved) config.onSaved(response);
				},
				onLoadRefresh: function() {
					if (!ownsLoad()) return;
					if (currentEditor && currentEditor.cleanup) currentEditor.cleanup();
					currentEditor = null;
					dialog.setApplyDisabled(true);
					content.getElement().replaceChildren(createElement("div", {
						className: "gpo-admx-dialog__loading",
						attrs: { role: "status" },
						text: t("treeView.loadingPolicies")
					}).getElement());
					editor.ready = load();
				},
				onRendered: function(policy) {
					if (!ownsLoad()) return;
					const title = dialog.root.getElement().querySelector("[data-dialog-part=\"title\"]");
					title.textContent = policy.label || item.title || policy.policy_id;
				}
			}).then(function(loaded) {
				if (!ownsLoad()) {
					if (loaded.cleanup) loaded.cleanup();
					if (!closed && !isCurrent()) dialog.close();
					return false;
				}
				currentEditor = loaded;
				content.getElement().replaceChildren(loaded.getElement());
				dialog.setApplyDisabled(!loaded.canApply || !loaded.canApply());
				return Boolean(loaded.applyChanges);
			}).catch(function(error) {
				if (ownsLoad()) content.getElement().replaceChildren(renderError(error).getElement());
				else if (!closed && !isCurrent()) dialog.close();
				return false;
			});
		}
		editor.ready = load();
		return {
			editor,
			dialog
		};
	}
	//#endregion
	//#region src/components/templates/folder-template.js
	function renderChildRow(item, onItemClick, onSelect) {
		const row = createElement("span", {
			className: "workspace-list-item",
			attrs: typeof onItemClick === "function" ? {
				role: "button",
				tabindex: "-1"
			} : {},
			children: [createElement("span", { className: ["icon", item.icon] }), createElement("span", {
				className: "gp__list-children__item__title",
				text: item.title
			})]
		});
		if (typeof onItemClick === "function") {
			row.on("click", () => {
				onSelect(item);
				if (item.type === "folder") onItemClick(item);
			});
			row.on("dblclick", () => {
				if (item.type !== "folder") {
					onSelect(item);
					onItemClick(item);
				}
			});
		}
		return createElement("li", {
			className: ["gp__list-children__item", item.type],
			children: [row]
		});
	}
	function renderHelpBlock({ help = void 0, isOpen = false } = {}) {
		if (!help) return null;
		return createElement("div", {
			className: ["gp__list-children-help", isOpen ? "is-open" : null],
			children: [createElement("div", {
				className: "title",
				text: t("common.help")
			}), createElement("div", {
				className: "content",
				text: help
			})]
		});
	}
	/**
	* @param {{ categoryPath?: string, hideHeading?: boolean, children?: any[], help?: any, onItemClick?: any,
	*   isHelpOpen?: boolean, listState?: { selectedItem?: any, query?: string, scrollTop?: number } }} [options]
	*/
	function renderFolderTemplate({ categoryPath = "", hideHeading = false, children = [], help = void 0, onItemClick = null, isHelpOpen = false, listState = {} } = {}) {
		const folderChildren = Array.isArray(children) ? children : [];
		const helpBlock = renderHelpBlock({
			help,
			isOpen: isHelpOpen
		});
		const list = createElement("ul", { className: "gp__list-children__list" });
		let rowItems = /* @__PURE__ */ new Map();
		let navigation = null;
		function select(item) {
			listState.selectedItem = item;
			rowItems.forEach((value, row) => {
				row.classList.toggle("active", value === item);
			});
			if (navigation) navigation.sync();
		}
		const search = createElement("input", { attrs: {
			type: "search",
			value: listState.query || "",
			placeholder: t("policySearch.categoryPlaceholder"),
			"aria-label": t("policySearch.categoryPlaceholder"),
			"data-policy-filter": ""
		} });
		const empty = createElement("p", {
			text: t("policySearch.noMatches"),
			attrs: { role: "status" }
		});
		function filter() {
			listState.query = search.getElement().value;
			const query = listState.query.trim().toLocaleLowerCase();
			const visible = folderChildren.filter((child) => String(child.title || "").toLocaleLowerCase().includes(query));
			rowItems = /* @__PURE__ */ new Map();
			list.getElement().replaceChildren(...visible.map((child) => {
				const record = renderChildRow(child, onItemClick, select);
				const row = record.getElement().querySelector(".workspace-list-item");
				rowItems.set(row, child);
				row.classList.toggle("active", listState.selectedItem === child);
				return record.getElement();
			}));
			if (navigation) navigation.sync();
			empty.getElement().hidden = visible.length !== 0 || !query;
		}
		search.on("input", filter);
		search.on("keydown", (event) => {
			if (event.key === "Escape") {
				search.getElement().value = "";
				filter();
			}
		});
		const content = createElement("div", {
			className: "gp__list-children",
			children: [
				createElement("div", {
					className: "gpo-security-workbench__toolbar",
					children: [!hideHeading && categoryPath ? createElement("h2", {
						text: categoryPath,
						attrs: {
							"data-category-path": "",
							title: categoryPath
						}
					}) : null, search]
				}),
				list,
				empty
			]
		});
		const root = createElement("div", {
			className: "gp__list-children-wrapper",
			children: [content, helpBlock]
		});
		filter();
		navigation = bind$1(list.getElement(), {
			rows: () => Array.from(rowItems.keys()),
			selected: () => Array.from(rowItems.keys()).find((row) => rowItems.get(row) === listState.selectedItem) || null,
			select: (row) => select(rowItems.get(row)),
			activate: (row) => {
				if (onItemClick) onItemClick(rowItems.get(row));
			},
			busy: () => Boolean(root.getElement().querySelector("[role=\"dialog\"]"))
		});
		root.onMounted = () => {
			content.getElement().scrollTop = listState.scrollTop || 0;
		};
		root.cleanup = () => {
			listState.scrollTop = content.getElement().scrollTop;
			navigation.cleanup();
		};
		return root;
	}
	//#endregion
	//#region src/components/templates/script/helpers.js
	function st(key) {
		return t("systemSettings." + key);
	}
	function eventLabel(event) {
		return st({
			startup: "startupScripts",
			shutdown: "shutdownScripts",
			logon: "logonScript",
			logoff: "logoffScript"
		}[event]);
	}
	/** The icon and the name in a table cell (the content of a `td`). */
	function nameContent(label, icon) {
		return createElement("span", {
			className: "gpo-catalog-name",
			children: [createElement("span", {
				className: ["icon", icon],
				attrs: { "aria-hidden": "true" }
			}), createElement("span", { text: label })]
		}).getElement();
	}
	function nameCell(label, icon) {
		return createElement("td", { children: [nameContent(label, icon)] });
	}
	function assetIcon(name) {
		return scriptFile(/\.ps(?:1|m1|d1)$/i.test(name) ? "powershell" : "classic");
	}
	function button(label, action, disabled, extraClass) {
		return createElement("button", {
			className: [
				"button",
				disabled ? null : "active",
				extraClass
			],
			attrs: {
				type: "button",
				disabled: disabled ? "disabled" : null
			},
			text: label,
			events: { click: action }
		});
	}
	function fileBase64(file) {
		return new Promise(function(resolve, reject) {
			const reader = new FileReader();
			reader.onerror = function() {
				reject(reader.error || /* @__PURE__ */ new Error("File reading failed."));
			};
			reader.onload = function() {
				const value = String(reader.result || "");
				const comma = value.indexOf(",");
				if (comma < 0) reject(/* @__PURE__ */ new Error("File reading failed."));
				else resolve(value.slice(comma + 1));
			};
			reader.readAsDataURL(file);
		});
	}
	function saveDownloadedAsset(asset) {
		if (!asset || typeof asset.name !== "string" || !asset.name || asset.name === "." || asset.name === ".." || asset.name.trim() !== asset.name || /[\\/\u0000]/.test(asset.name) || typeof asset.content_base64 !== "string" || !Number.isSafeInteger(asset.byte_size) || asset.byte_size < 0) throw new Error(st("invalidDownload"));
		let binary;
		try {
			binary = atob(asset.content_base64);
		} catch (_error) {
			throw new Error(st("invalidDownload"));
		}
		if (binary.length !== asset.byte_size) throw new Error(st("invalidDownload"));
		const bytes = new Uint8Array(binary.length);
		for (let index = 0; index < binary.length; index++) bytes[index] = binary.charCodeAt(index);
		const url = URL.createObjectURL(new Blob([bytes], { type: "application/octet-stream" }));
		const link = document.createElement("a");
		link.href = url;
		link.download = asset.name;
		document.body.appendChild(link);
		link.click();
		link.remove();
		setTimeout(function() {
			URL.revokeObjectURL(url);
		}, 0);
	}
	var headerOwners = 1;
	function nextHeaderOwner() {
		return "scripts-" + headerOwners++;
	}
	//#endregion
	//#region src/components/DataTable/DataTable.js
	/**
	* @typedef {{ id: string, label: string }} Column
	* @typedef {{
	*   id: string,
	*   cells: (Node | string | null)[],
	*   selected?: boolean,
	*   attrs?: Record<string, string>,
	*   onClick?: (event: MouseEvent) => void,
	*   onDoubleClick?: (event: MouseEvent) => void
	* }} Row
	*/
	/**
	* @param {{
	*   label: string,
	*   columns: Column[],
	*   rows: Row[],
	*   emptyText: string,
	*   multiple?: boolean,
	*   className?: string,
	*   emptyClassName?: string
	* }} options
	* @returns {HTMLTableElement}
	*/
	function createDataTable({ label, columns, rows, emptyText, multiple = false, className, emptyClassName }) {
		const head = h("tr", {}, ...columns.map((column) => h("th", { scope: "col" }, column.label)));
		const body = h("tbody", {}, ...rows.length ? rows.map((row) => createRow(row)) : [createEmptyRow(columns.length, emptyText, emptyClassName)]);
		return h("table", {
			class: className,
			"aria-label": label,
			"data-table-multiple": multiple ? true : null,
			"data-table": true
		}, h("thead", {}, head), body);
	}
	/** @param {Row} row */
	function createRow({ id, cells, selected = false, attrs = {}, onClick, onDoubleClick }) {
		const tr = h("tr", {
			...attrs,
			class: cx(selected && "active"),
			tabindex: "-1",
			"aria-selected": String(selected),
			"data-table-row": true,
			"data-row-id": id
		}, ...cells.map((cell) => h("td", {}, cell)));
		if (onClick) tr.addEventListener("click", onClick);
		if (onDoubleClick) tr.addEventListener("dblclick", onDoubleClick);
		return tr;
	}
	function createEmptyRow(span, text, className) {
		return h("tr", {
			class: className,
			"data-table-empty": true
		}, h("td", { colspan: String(span) }, text));
	}
	/** The body rows (not the empty-state row). @param {HTMLElement} table @returns {HTMLTableRowElement[]} */
	function tableRows(table) {
		return Array.from(table.querySelectorAll("tbody tr[data-table-row]"));
	}
	/** The id of a row. @param {Element} row */
	function rowId(row) {
		return row.getAttribute("data-row-id");
	}
	/**
	* Marks exactly the given rows as selected.
	* @param {HTMLElement} table
	* @param {Iterable<string>} ids
	*/
	function setSelectedRows(table, ids) {
		const selected = new Set(ids);
		for (const row of tableRows(table)) {
			const on = selected.has(rowId(row));
			row.classList.toggle("active", on);
			row.setAttribute("aria-selected", String(on));
		}
	}
	var Toolbar_module_default = {
		toolbar: "_toolbar_1svso_5",
		item: "_item_1svso_11"
	};
	//#endregion
	//#region src/components/Toolbar/Toolbar.js
	/**
	* @typedef {{ id: string, label: string, onClick: (event: MouseEvent) => void, disabled?: boolean, title?: string, className?: string }} ToolbarItem
	*/
	/**
	* @param {{ label: string, items: ToolbarItem[], className?: string }} options
	* @returns {HTMLElement}
	*/
	function createToolbar({ label, items, className }) {
		return h("div", {
			class: cx(Toolbar_module_default.toolbar, className),
			role: "group",
			"aria-label": label,
			"data-toolbar": true
		}, ...items.map(createItem));
	}
	/** @param {ToolbarItem} item */
	function createItem({ id, label, onClick, disabled = false, title, className }) {
		const button = h("button", {
			class: cx("button", Toolbar_module_default.item, className),
			type: "button",
			"data-toolbar-item": id,
			title
		}, label);
		button.addEventListener("click", onClick);
		applyState(button, { disabled });
		return button;
	}
	/** @param {HTMLButtonElement} button @param {{ disabled?: boolean, title?: string }} state */
	function applyState(button, { disabled, title }) {
		if (disabled !== void 0) {
			button.disabled = disabled;
			button.classList.toggle("active", !disabled);
		}
		if (title !== void 0) {
			if (title) button.title = title;
			else button.removeAttribute("title");
		}
	}
	/** The button of an item, or `null`. @param {HTMLElement} toolbar @param {string} id */
	function toolbarItem(toolbar, id) {
		return toolbar.querySelector(`[data-toolbar-item="${id}"]`);
	}
	/**
	* Enables or disables an item (and sets its tooltip). An unknown id is ignored: a screen may show fewer items than it updates.
	* @param {HTMLElement} toolbar
	* @param {string} id
	* @param {{ disabled?: boolean, title?: string }} state
	*/
	function setToolbarItem(toolbar, id, state) {
		const button = toolbarItem(toolbar, id);
		if (button) applyState(button, state);
	}
	//#endregion
	//#region src/components/templates/script/assets-panel.js
	var wrap$4 = ElementCreator.wrap;
	/**
	* The files table of the event page with its toolbar (upload, replace, download, delete).
	* @param {any} context the editor's state and operations (see renderScriptEventEditor)
	*/
	function createAssetsPanel({ assets, bindTable, config, deleteAsset, downloadAsset, groupView, loadEvent, navigations, openForm, replaceInput, selectedAsset, state, uploadInput }) {
		function renderAssets() {
			const all = assets();
			const mayChange = !state.busy && Boolean(groupView().editable);
			const explorer = config.mode === "assets";
			/** The checkbox of an explorer row; it follows the selection like the row does. */
			const checkboxes = /* @__PURE__ */ new Map();
			/** What a row does when it is chosen: by a click, a key or its checkbox. */
			const selectors = /* @__PURE__ */ new Map();
			function applySelection() {
				if (explorer) {
					setSelectedRows(tableElement, state.selectedAssets);
					tableRows(tableElement).forEach(function(row) {
						checkboxes.get(rowId(row)).checked = state.selectedAssets.has(rowId(row));
					});
				} else setSelectedRows(tableElement, [state.selectedAsset]);
			}
			function selectAsset(asset, selected, exclusive, range) {
				if (explorer) {
					if (range && state.assetFocus) {
						const from = all.findIndex(function(entry) {
							return entry.name === state.assetFocus;
						});
						const to = all.indexOf(asset);
						if (exclusive) state.selectedAssets.clear();
						all.slice(Math.min(from, to), Math.max(from, to) + 1).forEach(function(entry) {
							state.selectedAssets.add(entry.name);
						});
					} else if (exclusive) state.selectedAssets.clear();
					if (selected) state.selectedAssets.add(asset.name);
					else state.selectedAssets.delete(asset.name);
					state.selectedAsset = state.selectedAssets.size === 1 ? Array.from(state.selectedAssets)[0] : null;
				} else state.selectedAsset = asset.name;
				applySelection();
				state.assetFocus = asset.name;
				syncButtons();
				if (navigations.assets) navigations.assets.sync();
			}
			const tableElement = createDataTable({
				label: st("managedFiles"),
				multiple: explorer,
				columns: (explorer ? [{
					id: "select",
					label: ""
				}] : []).concat([
					{
						id: "name",
						label: st("columnName")
					},
					{
						id: "size",
						label: st("columnSize")
					},
					{
						id: "references",
						label: st(explorer ? "usedBy" : "columnReferences")
					}
				]),
				emptyText: st("emptyAssets"),
				className: "preference__table gpo-catalog-table",
				emptyClassName: "gpo-editor-scripts__empty-row",
				rows: all.map(function(asset) {
					let checkbox = null;
					if (explorer) {
						checkbox = createElement("input", { attrs: {
							type: "checkbox",
							tabindex: "-1",
							"aria-label": st("selectFile") + ": " + asset.name
						} });
						checkbox.getElement().checked = state.selectedAssets.has(asset.name);
						checkbox.on("click", function(event) {
							event.stopPropagation();
						});
						checkbox.on("change", function() {
							selectAsset(asset, checkbox.getElement().checked);
						});
						checkboxes.set(asset.name, checkbox.getElement());
					}
					selectors.set(asset.name, function(event) {
						selectAsset(asset, true, !event || !event.ctrlKey, Boolean(event && event.shiftKey));
					});
					return {
						id: asset.name,
						attrs: { "data-script-asset": asset.name },
						cells: [
							checkbox ? checkbox.getElement() : null,
							nameContent(asset.name, assetIcon(asset.name)),
							String(asset.byte_size) + " " + st("bytes"),
							String((asset.references || []).length)
						].filter(function(cell, index) {
							return explorer || index > 0;
						}),
						selected: explorer ? state.selectedAssets.has(asset.name) : asset.name === state.selectedAsset,
						onClick: function(event) {
							selectAsset(asset, explorer && !event.shiftKey ? !state.selectedAssets.has(asset.name) : true, false, event.shiftKey);
							navigations.assets.sync();
							/** @type {HTMLElement} */ event.currentTarget.focus();
						},
						onDoubleClick: function(event) {
							if (event.target.closest("input, select, textarea, button, a, summary, [contenteditable]")) return;
							if (state.busy || state.form || state.picker || state.confirmation) return;
							selectAsset(asset, true, true);
							if (explorer) downloadAsset();
							else openForm("select");
						}
					};
				})
			});
			tableRows(tableElement).forEach(function(row) {
				row.__select = selectors.get(rowId(row));
			});
			const table = wrap$4(tableElement);
			const open = function(name) {
				return function() {
					if (name === "upload") uploadInput.getElement().click();
					else if (name === "select") openForm("select");
					else if (name === "replace") replaceInput.getElement().click();
					else if (name === "download") downloadAsset();
					else if (name === "delete") deleteAsset();
					else loadEvent();
				};
			};
			const items = {
				upload: {
					id: "upload",
					label: st("upload"),
					onClick: open("upload"),
					disabled: !mayChange
				},
				select: {
					id: "select",
					label: st("addSelectedScript"),
					onClick: open("select"),
					disabled: true
				},
				replace: {
					id: "replace",
					label: st("replaceFile"),
					onClick: open("replace"),
					disabled: true
				},
				download: {
					id: "download",
					label: st("download"),
					onClick: open("download"),
					disabled: true
				},
				delete: {
					id: "delete",
					label: st("deleteFile"),
					onClick: open("delete"),
					disabled: true
				},
				refresh: {
					id: "refresh",
					label: st("refresh"),
					onClick: open("refresh"),
					disabled: state.busy
				}
			};
			const toolbar = createToolbar({
				label: st("managedFiles"),
				className: "gpo-editor-scripts__toolbar",
				items: explorer ? all.length ? [
					items.upload,
					items.replace,
					items.download,
					items.delete,
					items.refresh
				] : [items.upload] : [
					items.upload,
					items.select,
					items.replace,
					items.download,
					items.delete
				]
			});
			function syncButtons() {
				const asset = selectedAsset();
				const selected = explorer ? all.filter(function(item) {
					return state.selectedAssets.has(item.name);
				}) : asset ? [asset] : [];
				const referenced = selected.some(function(item) {
					return item.references && item.references.length;
				});
				setToolbarItem(toolbar, "upload", { disabled: !mayChange });
				setToolbarItem(toolbar, "select", { disabled: !(mayChange && Boolean(asset)) });
				setToolbarItem(toolbar, "replace", { disabled: !(mayChange && Boolean(asset)) });
				setToolbarItem(toolbar, "download", { disabled: !(!state.busy && Boolean(asset)) });
				setToolbarItem(toolbar, "delete", {
					disabled: !(mayChange && selected.length > 0 && !referenced),
					title: referenced ? st("fileInUse") : ""
				});
				setToolbarItem(toolbar, "refresh", { disabled: state.busy });
			}
			syncButtons();
			bindTable(table, "assets", {
				rows: function() {
					return tableRows(tableElement);
				},
				selected: function() {
					return tableRows(tableElement).find(function(row) {
						return rowId(row) === (state.assetFocus || state.selectedAsset);
					}) || null;
				},
				isSelected: explorer ? function(row) {
					return state.selectedAssets.has(rowId(row));
				} : void 0,
				select: function(row, event) {
					row.__select(event);
				},
				activate: function(row, event) {
					row.__select();
					if (!explorer) openForm("select");
					else if (event && event.key === "F2") {
						if (groupView().editable) replaceInput.getElement().click();
					} else downloadAsset();
				},
				remove: deleteAsset,
				canActivate: function() {
					return explorer || Boolean(groupView().editable);
				},
				canRemove: function() {
					const selected = explorer ? all.filter(function(asset) {
						return state.selectedAssets.has(asset.name);
					}) : [selectedAsset()].filter(Boolean);
					return Boolean(groupView().editable) && selected.length > 0 && selected.every(function(asset) {
						return !(asset.references && asset.references.length);
					});
				}
			});
			const list = createElement("div", {
				className: "gpo-editor-scripts__list",
				children: [table]
			});
			return createElement("section", {
				className: "gpo-editor-scripts__assets",
				children: [
					explorer ? null : createElement("h3", { text: st("managedFiles") }),
					explorer ? toolbar : list,
					explorer ? list : toolbar,
					selectedAsset() && selectedAsset().references && selectedAsset().references.length ? createElement("p", {
						className: "gpo-editor-scripts__hint",
						text: st("fileInUse")
					}) : null
				]
			});
		}
		return renderAssets;
	}
	//#endregion
	//#region src/components/templates/script/entries-panel.js
	var wrap$3 = ElementCreator.wrap;
	/**
	* The script entries table of the event page with its toolbar (add, edit, remove, move).
	* @param {any} context the editor's state and operations (see renderScriptEventEditor)
	*/
	function createEntriesPanel({ bindTable, config, entries, groupView, moveEntry, navigations, openForm, removeEntry, setHeaderState, state }) {
		function renderEntries() {
			const rows = entries();
			const editable = Boolean(groupView().editable) && !state.busy;
			function selectEntry(id) {
				state.selectedEntry[state.group] = id;
				setSelectedRows(tableElement, [id]);
				syncButtons();
				setHeaderState();
				if (navigations.entries) navigations.entries.sync();
			}
			const tableElement = createDataTable({
				label: st(state.group),
				columns: [{
					id: "name",
					label: st("columnName")
				}, {
					id: "arguments",
					label: st("columnArguments")
				}],
				emptyText: st("emptyEntries"),
				className: "preference__table gpo-catalog-table",
				emptyClassName: "gpo-editor-scripts__empty-row",
				rows: rows.map(function(entry) {
					return {
						id: entry.identity,
						attrs: { "data-script-entry": entry.identity },
						cells: [nameContent(entry.command_line, scriptFile(state.group)), entry.parameters],
						selected: entry.identity === state.selectedEntry[state.group],
						onClick: function() {
							selectEntry(entry.identity);
							navigations.entries.focusSelected();
						},
						onDoubleClick: function() {
							if (!state.busy && !state.form && !state.picker && !state.confirmation) {
								selectEntry(entry.identity);
								openForm("edit");
							}
						}
					};
				})
			});
			tableRows(tableElement).forEach(function(row) {
				row.__select = function() {
					selectEntry(rowId(row));
				};
			});
			const table = wrap$3(tableElement);
			const move = function(delta) {
				return function() {
					moveEntry(delta);
				};
			};
			const toolbar = createToolbar({
				label: st(state.group),
				className: "gpo-editor-scripts__toolbar",
				items: [{
					id: "up",
					label: st("up"),
					onClick: move(-1),
					disabled: true
				}, {
					id: "down",
					label: st("down"),
					onClick: move(1),
					disabled: true
				}].concat(config.mode === "event" ? [
					{
						id: "add",
						label: st("add"),
						onClick: function() {
							openForm("add");
						},
						disabled: !editable
					},
					{
						id: "edit",
						label: st("edit"),
						onClick: function() {
							openForm("edit");
						},
						disabled: true
					},
					{
						id: "remove",
						label: st("remove"),
						onClick: removeEntry,
						disabled: true
					}
				] : [])
			});
			function syncButtons() {
				const index = rows.findIndex(function(entry) {
					return entry.identity === state.selectedEntry[state.group];
				});
				const selected = editable && index >= 0;
				setToolbarItem(toolbar, "edit", { disabled: !selected });
				setToolbarItem(toolbar, "remove", { disabled: !selected });
				setToolbarItem(toolbar, "up", { disabled: !(editable && index >= 1) });
				setToolbarItem(toolbar, "down", { disabled: !(editable && index >= 0 && index < rows.length - 1) });
			}
			syncButtons();
			bindTable(table, "entries", {
				rows: function() {
					return tableRows(tableElement);
				},
				selected: function() {
					return tableRows(tableElement).find(function(row) {
						return rowId(row) === state.selectedEntry[state.group];
					}) || null;
				},
				select: function(row) {
					row.__select();
				},
				activate: function() {
					openForm("edit");
				},
				remove: removeEntry,
				canActivate: function() {
					return Boolean(groupView().editable);
				},
				canRemove: function() {
					return Boolean(groupView().editable);
				}
			});
			return createElement("section", {
				className: "gpo-editor-scripts__entries",
				children: [createElement("div", {
					className: "gpo-editor-scripts__list",
					children: [table]
				}), toolbar]
			});
		}
		return renderEntries;
	}
	//#endregion
	//#region src/components/templates/script/picker.js
	var wrap$2 = ElementCreator.wrap;
	/**
	* The SYSVOL file picker of the script form: a dialog over the form that lists the event's files.
	* @param {{ state: any, assets: () => any[], current: () => boolean, rootElement: HTMLElement, setHeaderState: () => void }} context
	*/
	function createAssetPicker({ state, assets, current, rootElement, setHeaderState }) {
		function closePicker() {
			if (state.pickerNavigation) {
				state.pickerNavigation.cleanup();
				state.pickerNavigation = null;
			}
			if (state.picker) {
				state.picker.remove();
				state.picker = null;
			}
			if (state.pickerOverlay) {
				state.pickerOverlay.remove();
				state.pickerOverlay = null;
			}
			if (state.pickerFocus && state.pickerFocus.isConnected) state.pickerFocus.focus();
			state.pickerFocus = null;
			setHeaderState();
		}
		function openPicker(initialName, onSelect) {
			if (state.busy || state.picker) return;
			state.pickerFocus = document.activeElement;
			let chosen = assets().some(function(asset) {
				return asset.name === initialName;
			}) ? initialName : null;
			const selectButton = button(st("selectFile"), function() {
				choose();
			}, !chosen, "btn-ok");
			selectButton.addClass("gpo-editor-scripts__picker-select");
			const rows = assets().map(function(asset) {
				const row = createElement("tr", {
					className: asset.name === chosen ? "active" : null,
					attrs: {
						tabindex: "-1",
						"data-script-asset": asset.name
					},
					children: [nameCell(asset.name, assetIcon(asset.name)), createElement("td", { text: String(asset.byte_size) + " " + st("bytes") })]
				});
				function select() {
					chosen = asset.name;
					Array.prototype.forEach.call(table.getElement().querySelectorAll("tbody tr"), function(candidate) {
						candidate.classList.toggle("active", candidate === row.getElement());
					});
					selectButton.getElement().disabled = false;
					selectButton.addClass("active");
					if (state.pickerNavigation) state.pickerNavigation.sync();
				}
				row.getElement().__select = select;
				row.on("click", function() {
					select();
					if (state.pickerNavigation) state.pickerNavigation.focusSelected();
				});
				row.on("dblclick", function() {
					select();
					choose();
				});
				return row;
			});
			const table = createElement("table", {
				className: ["preference__table", "gpo-catalog-table"],
				children: [createElement("thead", { children: [createElement("tr", { children: [createElement("th", { text: st("columnName") }), createElement("th", { text: st("columnSize") })] })] }), createElement("tbody", { children: rows })]
			});
			function choose() {
				if (!chosen || state.busy) return;
				closePicker();
				onSelect(chosen);
			}
			const pickerContent = assets().length ? table : createElement("div", {
				className: "gpo-editor-empty",
				text: st("emptyAssets")
			});
			const cancelButton = wrap$2(createButton("cancel", t("header.cancel")));
			cancelButton.on("click", closePicker);
			const closeButton = wrap$2(createCloseButton(st("close")));
			closeButton.on("click", closePicker);
			const shell = createDialogShell({
				titleId: "gpo-editor-scripts-picker-title",
				title: st("browseFiles"),
				body: createBody(pickerContent.getElement()),
				closeButton: closeButton.getElement(),
				buttons: [cancelButton.getElement(), selectButton.getElement()],
				className: "gpo-editor-scripts__picker",
				hostClassName: "gpo-editor-scripts__picker-overlay"
			});
			const picker = wrap$2(shell.dialog);
			shell.dialog.setAttribute("aria-label", st("browseFiles"));
			shell.host.addEventListener("click", function(event) {
				if (event.target === shell.host) closePicker();
			});
			picker.on("keydown", function(event) {
				if (event.defaultPrevented || event.target.closest("[role=\"dialog\"], [role=\"alertdialog\"]") !== shell.dialog) return;
				if (event.key === "Escape") {
					event.preventDefault();
					event.stopPropagation();
					closePicker();
				}
				trapTab(event, shell.dialog);
			});
			rootElement.appendChild(shell.host);
			state.pickerOverlay = shell.host;
			state.picker = shell.dialog;
			state.pickerNavigation = bind$1(table.getElement(), {
				rows: function() {
					return Array.from(table.getElement().querySelectorAll("[data-script-asset]"));
				},
				selected: function() {
					return Array.from(table.getElement().querySelectorAll("[data-script-asset]")).find(function(row) {
						return row.getAttribute("data-script-asset") === chosen;
					}) || null;
				},
				select: function(row) {
					row.__select();
				},
				activate: choose,
				busy: function() {
					return state.busy || !current();
				}
			});
			setHeaderState();
			if (chosen && rows.length) rows.find(function(row) {
				return row.getElement().classList.contains("active");
			}).getElement().focus();
			else picker.getElement().querySelector(".btn-cancel").focus();
		}
		return {
			open: openPicker,
			close: closePicker
		};
	}
	//#endregion
	//#region src/components/templates/script/entry-form.js
	var wrap$1 = ElementCreator.wrap;
	/**
	* The add/edit dialog of one script entry.
	* @param {any} context the editor's state and operations (see renderScriptEventEditor)
	*/
	function createEntryForm({ config, scope, state, groupView, selectedEntry, selectedAsset, assets, rootElement, mutate, setHeaderState, openPicker, closeForm, requestCloseForm }) {
		function openForm(kind) {
			if (state.busy || state.loading || !groupView().editable) return;
			const entry = kind === "edit" ? selectedEntry() : null;
			if (kind === "edit" && !entry) return;
			if (kind === "select" && !selectedAsset()) return;
			closeForm();
			state.formFocus = document.activeElement;
			const isEdit = kind === "edit";
			const modern = Boolean(config.mode);
			const sourceSelect = createElement("select", { children: [createElement("option", {
				attrs: { value: "existing_asset" },
				text: st("existingAsset")
			}), createElement("option", {
				attrs: { value: "external_command" },
				text: st("externalCommand")
			})] });
			sourceSelect.getElement().value = entry ? entry.managed_asset_name ? "existing_asset" : "external_command" : kind === "select" || assets().length ? "existing_asset" : "external_command";
			const assetInput = createElement("input", { attrs: {
				type: "text",
				readonly: "readonly",
				value: entry && entry.managed_asset_name || kind === "select" && selectedAsset() && selectedAsset().name || ""
			} });
			const browseButton = button(config.mode ? "…" : st("browseFiles"), function() {
				const input = modern ? commandInput : assetInput;
				openPicker(input.getElement().value, function(name) {
					input.getElement().value = name;
					markDirty();
					browseButton.getElement().focus();
				});
			}, false, config.mode ? "gpo-editor-scripts__ellipsis" : "gpo-editor-scripts__browse");
			if (config.mode) {
				browseButton.getElement().setAttribute("aria-label", st("selectFromSysvol"));
				browseButton.getElement().title = st("selectFromSysvol");
			}
			const commandInput = createElement("input", { attrs: {
				type: "text",
				value: entry ? entry.command_line : "",
				placeholder: modern ? st("externalCommand") : null
			} });
			const parametersInput = createElement("input", { attrs: {
				type: "text",
				value: entry ? entry.parameters : ""
			} });
			const assetRow = field(st("nameLabel"), createElement("div", {
				className: "gpo-editor-scripts__asset-field",
				children: [modern ? commandInput : assetInput, browseButton]
			}));
			const commandRow = modern ? null : field(st("nameLabel"), commandInput);
			const formError = createElement("div", { className: "gpo-editor-scripts__form-error" });
			function values() {
				if (modern) return [commandInput.getElement().value, parametersInput.getElement().value];
				return [
					sourceSelect.getElement().value,
					assetInput.getElement().value,
					commandInput.getElement().value,
					parametersInput.getElement().value
				];
			}
			const initialValues = JSON.stringify(values());
			function markDirty() {
				setHeaderState();
			}
			function syncSource() {
				if (modern) return;
				const existing = sourceSelect.getElement().value === "existing_asset";
				assetRow.getElement().hidden = !existing;
				commandRow.getElement().hidden = existing;
				markDirty();
			}
			sourceSelect.on("change", syncSource);
			commandInput.on("input", markDirty);
			parametersInput.on("input", markDirty);
			const formBody = wrap$1(createBody(null));
			(modern ? [
				assetRow,
				field(st("argumentsLabel"), parametersInput),
				formError
			] : [
				field(st("sourceLabel"), sourceSelect),
				assetRow,
				commandRow,
				field(st("argumentsLabel"), parametersInput),
				formError
			]).forEach(function(child) {
				formBody.append(child);
			});
			const formCancel = wrap$1(createButton("cancel", t("header.cancel")));
			formCancel.on("click", requestCloseForm);
			const formApply = wrap$1(createButton("apply", t("header.apply")));
			formApply.on("click", function() {
				submit();
			});
			const formClose = wrap$1(createCloseButton(st("close")));
			formClose.on("click", requestCloseForm);
			const shell = createDialogShell({
				titleId: "gpo-editor-scripts-form-title",
				title: st(isEdit ? "editTitle" : "addTitle"),
				body: formBody.getElement(),
				closeButton: formClose.getElement(),
				buttons: [formCancel.getElement(), formApply.getElement()],
				className: "gpo-editor-scripts__form"
			});
			const form = wrap$1(shell.dialog);
			shell.host.addEventListener("click", function(event) {
				if (event.target === shell.host) requestCloseForm();
			});
			form.on("keydown", function(event) {
				if (event.defaultPrevented || event.target.closest("[role=\"dialog\"], [role=\"alertdialog\"]") !== shell.dialog) return;
				if (event.key === "Escape") {
					event.preventDefault();
					event.stopPropagation();
					requestCloseForm();
				}
				trapTab(event, shell.dialog);
			});
			async function submit() {
				if (state.busy) return false;
				formError.setText("");
				const command = modern ? commandInput.getElement().value.trim() : sourceSelect.getElement().value === "existing_asset" ? assetInput.getElement().value : commandInput.getElement().value.trim();
				const matchedAsset = modern && assets().find(function(asset) {
					return asset.name.toLowerCase() === command.toLowerCase();
				});
				const source = modern ? matchedAsset ? "existing_asset" : "external_command" : sourceSelect.getElement().value;
				const name = modern && matchedAsset ? matchedAsset.name : assetInput.getElement().value;
				if (!modern && source === "existing_asset" && !assets().some(function(asset) {
					return asset.name === name;
				})) {
					formError.setText(st("chooseFile"));
					return false;
				}
				if (!command) {
					formError.setText(st("chooseCommand"));
					return false;
				}
				const parameters = parametersInput.getElement().value.trim();
				const group = state.group;
				const event = state.event;
				const snapshot = groupView().snapshot;
				const ok = await mutate(function() {
					if (isEdit) return scriptEntryUpdate(scope, event, {
						executable_group: group,
						identity: entry.identity,
						command_line: command,
						parameters
					});
					const request = {
						mode: source,
						executable_group: group,
						snapshot,
						parameters
					};
					if (source === "existing_asset") request.name = name;
					else request.command_line = command;
					return scriptEntryAdd(scope, event, request);
				}, formError.getElement());
				if (ok) closeForm(true);
				return ok;
			}
			rootElement.appendChild(shell.host);
			state.formHost = shell.host;
			state.form = shell.dialog;
			state.formState = {
				dirty: function() {
					return JSON.stringify(values()) !== initialValues;
				},
				submit
			};
			syncSource();
			setHeaderState();
			(modern ? commandInput : sourceSelect).getElement().focus();
		}
		function field(label, input) {
			return createElement("div", {
				className: "gpo-editor-field",
				children: [createElement("div", {
					className: "gpo-editor-field__label",
					text: label
				}), input]
			});
		}
		return { open: openForm };
	}
	//#endregion
	//#region src/components/templates/script/order-panel.js
	/**
	* The order block of the event page: the draft order of the entries and its save.
	* @param {any} context the editor's state and operations
	*/
	function createOrderPanel({ mutate, scope, state }) {
		function renderOrder() {
			const select = createElement("select", { children: [
				createElement("option", {
					attrs: { value: "unspecified" },
					text: st("orderUnspecified")
				}),
				createElement("option", {
					attrs: { value: "classic_first" },
					text: st("orderClassicFirst")
				}),
				createElement("option", {
					attrs: { value: "powershell_first" },
					text: st("orderPowershellFirst")
				})
			] });
			select.getElement().value = state.orderDraft || state.view.execution_order || "unspecified";
			const canApply = !state.busy && Boolean(state.view.powershell.editable) && state.orderDraft !== state.view.execution_order;
			const apply = button(st("applyOrder"), function() {
				saveOrderDraft();
			}, !canApply);
			select.on("change", function() {
				state.orderDraft = select.getElement().value;
				const available = !state.busy && state.view.powershell.editable && state.orderDraft !== state.view.execution_order;
				apply.getElement().disabled = !available;
				apply.getElement().classList.toggle("active", available);
			});
			select.getElement().disabled = state.busy || !state.view.powershell.editable;
			return createElement("div", {
				className: "gpo-editor-scripts__order",
				children: [
					createElement("label", { text: st("psOrderLabel") }),
					select,
					apply
				]
			});
		}
		function saveOrderDraft() {
			if (!state.view || state.busy || !state.view.powershell.editable || state.orderDraft === state.view.execution_order) return Promise.resolve(true);
			const snapshot = state.view.powershell.snapshot;
			const order = state.orderDraft;
			return mutate(function() {
				return scriptOrderUpdate(scope, state.event, {
					snapshot,
					execution_order: order
				});
			});
		}
		return {
			renderOrder,
			saveOrderDraft
		};
	}
	//#endregion
	//#region src/components/templates/script/asset-actions.js
	/**
	* Operations on the event's files: upload, replace, download and delete.
	* @param {any} context the editor's state and operations
	*/
	function createAssetActions({ applyResponse, confirm, assets, config, current, mutate, navigations, renderBody, scope, selectedAsset, setError, state }) {
		async function uploadChosen(event, replace) {
			const file = event.target.files && event.target.files[0];
			event.target.value = "";
			if (!file || state.busy || !state.view) return;
			const asset = replace ? selectedAsset() : null;
			if (replace && !asset) return;
			if (file.size > state.view.upload_limit_bytes) {
				setError({
					category: "size_limit",
					message: st("uploadTooLarge")
				});
				return;
			}
			async function upload() {
				try {
					const content = await fileBase64(file);
					if (!current() || !state.event) return;
					await mutate(function() {
						return replace ? scriptAssetReplace(scope, state.event, {
							name: asset.name,
							revision: asset.revision,
							content_base64: content
						}) : scriptAssetUpload(scope, state.event, {
							name: file.name,
							content_base64: content
						});
					});
				} catch (error) {
					if (current()) setError(error);
				}
			}
			if (replace) confirm(st("replaceFileConfirm"), function() {
				upload();
			});
			else await upload();
		}
		function deleteAsset() {
			const selected = config.mode === "assets" ? assets().filter(function(asset) {
				return state.selectedAssets.has(asset.name);
			}) : [selectedAsset()].filter(Boolean);
			if (!selected.length || state.busy) return;
			if (selected.some(function(asset) {
				return asset.references && asset.references.length;
			})) {
				setError({
					category: "validation",
					message: st("fileInUse")
				});
				return;
			}
			const event = state.event;
			confirm(st(selected.length > 1 ? "deleteSelectedFilesConfirm" : "deleteFileConfirm"), function() {
				state.removal = {
					assets: true,
					before: assets().map(function(asset) {
						return asset.name;
					}),
					removed: selected.map(function(asset) {
						return asset.name;
					})
				};
				mutate(async function() {
					let response = null;
					try {
						for (let index = 0; index < selected.length; index++) response = await scriptAssetDelete(scope, event, {
							name: selected[index].name,
							revision: selected[index].revision
						});
						return response;
					} catch (error) {
						if (response) {
							applyResponse(response);
							if (typeof config.onSaved === "function") config.onSaved(response);
						}
						throw error;
					}
				});
			});
		}
		async function downloadAsset() {
			const asset = selectedAsset();
			if (!asset || state.busy) return;
			state.busy = true;
			renderBody();
			try {
				const response = await scriptAssetDownload(scope, state.event, {
					name: asset.name,
					revision: asset.revision
				});
				if (current()) saveDownloadedAsset(response && response.asset);
			} catch (error) {
				if (current()) setError(error);
			} finally {
				state.busy = false;
				if (current()) {
					renderBody();
					if (document.activeElement === document.body && navigations.assets) navigations.assets.focusSelected();
				}
			}
		}
		return {
			deleteAsset,
			uploadChosen,
			downloadAsset
		};
	}
	//#endregion
	//#region src/components/templates/script/event-loader.js
	var GROUPS$1 = ["classic", "powershell"];
	/**
	* Loading the event view and publishing mutations: the request counters, the busy state and the answers that replace the view.
	* @param {any} context the editor's state and operations
	*/
	function createEventLoader({ assets, config, current, navigations, renderBody, rootElement, scope, setError, state, syncModalBusy }) {
		function applyResponse(response) {
			const previousOrder = state.view && state.view.execution_order;
			state.envelope = response;
			state.view = response && response.scripts || null;
			state.error = null;
			if (state.view && (state.orderDraft === null || state.orderDraft === previousOrder)) state.orderDraft = state.view.execution_order || "unspecified";
			GROUPS$1.forEach(function(group) {
				const rows = state.view && state.view[group] && state.view[group].entries || [];
				if (state.removal && state.removal.group === group) state.selectedEntry[group] = neighbor(state.removal.before, state.removal.removed, rows.map(function(entry) {
					return entry.identity;
				}));
				if (!rows.some(function(entry) {
					return entry.identity === state.selectedEntry[group];
				})) state.selectedEntry[group] = null;
			});
			if (!assets().some(function(asset) {
				return asset.name === state.selectedAsset;
			})) state.selectedAsset = null;
			state.selectedAssets.forEach(function(name) {
				if (!assets().some(function(asset) {
					return asset.name === name;
				})) state.selectedAssets.delete(name);
			});
			if (state.removal && state.removal.assets) {
				const surviving = assets().map(function(asset) {
					return asset.name;
				});
				const removed = state.removal.removed.filter(function(name) {
					return surviving.indexOf(name) === -1;
				});
				if (removed.length) {
					const neighbor$2 = neighbor(state.removal.before, removed, surviving);
					state.selectedAssets = new Set(neighbor$2 ? [neighbor$2] : []);
					state.selectedAsset = neighbor$2;
					state.assetFocus = neighbor$2;
				}
			}
			if (!assets().some(function(asset) {
				return asset.name === state.assetFocus;
			})) state.assetFocus = state.selectedAsset;
			renderBody();
		}
		async function loadEvent() {
			const requestId = ++state.requestId;
			const event = state.event;
			state.loading = true;
			state.error = null;
			renderBody();
			try {
				const response = await scriptsShow(scope, event);
				if (!current() || requestId !== state.requestId || event !== state.event) return;
				state.loading = false;
				applyResponse(response);
			} catch (error) {
				if (!current() || requestId !== state.requestId) return;
				state.loading = false;
				setError(error);
			}
		}
		async function mutate(operation, errorSlot) {
			if (state.busy || !current()) return false;
			const focusedTable = document.activeElement && document.activeElement.closest("[data-script-list]");
			const returnList = focusedTable && rootElement.contains(focusedTable) ? focusedTable.getAttribute("data-script-list") : null;
			const returnGroup = state.group;
			state.busy = true;
			state.error = null;
			state.saveStatus = "saving";
			syncModalBusy();
			renderBody();
			try {
				const response = await operation();
				if (!current()) return false;
				applyResponse(response);
				state.saveStatus = "saved";
				if (typeof config.onSaved === "function") config.onSaved(response);
				return true;
			} catch (error) {
				if (current()) {
					state.saveStatus = null;
					if (errorSlot && errorSlot.isConnected) {
						errorSlot.textContent = "";
						errorSlot.appendChild(renderError(error, { onRefresh: function() {
							loadEvent();
						} }).getElement());
					} else setError(error);
				}
				return false;
			} finally {
				state.busy = false;
				state.removal = null;
				if (current()) {
					syncModalBusy();
					renderBody();
				}
				if (current() && returnList && returnGroup === state.group && !state.form && !state.picker && document.activeElement === document.body && navigations[returnList]) navigations[returnList].focusSelected();
			}
		}
		return {
			applyResponse,
			loadEvent,
			mutate
		};
	}
	//#endregion
	//#region src/components/templates/script/event-editor.js
	var GROUPS = ["classic", "powershell"];
	var EVENTS = {
		computer: ["startup", "shutdown"],
		user: ["logon", "logoff"]
	};
	function renderScriptEventEditor(options) {
		const config = options || {};
		const scope = config.item && config.item.scope === "user" ? "user" : "computer";
		let event = config.item && config.item.event;
		if (EVENTS[scope].indexOf(event) === -1) event = EVENTS[scope][0];
		const state = {
			event,
			group: "classic",
			view: null,
			envelope: null,
			loading: false,
			busy: false,
			error: null,
			selectedEntry: {
				classic: null,
				powershell: null
			},
			selectedAsset: null,
			selectedAssets: /* @__PURE__ */ new Set(),
			requestId: 0,
			disposed: false,
			form: null,
			formState: null,
			picker: null,
			confirmation: null,
			orderDraft: null,
			saveStatus: null
		};
		const navigations = {};
		state.pickerNavigation = null;
		state.assetFocus = null;
		state.removal = null;
		const root = createElement("div", { className: [
			"gp__scripts",
			"gp__preference",
			"gpo-editor-scripts"
		] });
		const rootElement = root.getElement();
		const headerElement = config.header && config.header.getElement ? config.header.getElement() : null;
		const headerControls = headerElement && headerElement.querySelector(".gp__control");
		const headerActions = headerElement && headerElement.querySelector(".gp__control-actions");
		const admxActions = headerElement && headerElement.querySelector(".gp__control-admx");
		const helpSeparator = headerElement && headerElement.querySelector(".gp__control-separator");
		const createButton = headerControls && headerControls.querySelector(".preferences__btn-create");
		const editButton = headerControls && headerControls.querySelector(".preferences__btn-edit");
		const deleteButton = headerControls && headerControls.querySelector(".preferences__btn-delete");
		const headerOwner = nextHeaderOwner();
		const headerLabels = [
			createButton,
			editButton,
			deleteButton
		].map(function(control) {
			return control ? control.textContent : null;
		});
		const headerListeners = [];
		const modalDisabledStates = /* @__PURE__ */ new WeakMap();
		if (headerControls) {
			headerControls.setAttribute("data-script-owner", headerOwner);
			headerControls.style.display = "flex";
		}
		if (headerActions) {
			headerActions.setAttribute("data-script-owner", headerOwner);
			headerActions.style.display = "flex";
		}
		if (admxActions) admxActions.style.display = "none";
		if (helpSeparator) helpSeparator.style.display = "none";
		[
			createButton,
			editButton,
			deleteButton
		].forEach(function(control, index) {
			if (control) control.textContent = st([
				"add",
				"edit",
				"remove"
			][index]);
		});
		const modalBody = createElement("div", { className: "scripts__modal-content" });
		const uploadInput = createElement("input", {
			className: "gpo-editor-scripts__file-input",
			attrs: {
				type: "file",
				hidden: "hidden",
				"aria-label": st("upload")
			},
			style: { display: "none" },
			events: { change: function(event) {
				uploadChosen(event, false);
			} }
		});
		const replaceInput = createElement("input", {
			className: "gpo-editor-scripts__file-input",
			attrs: {
				type: "file",
				hidden: "hidden",
				"aria-label": st("replaceFile")
			},
			style: { display: "none" },
			events: { change: function(event) {
				uploadChosen(event, true);
			} }
		});
		if (!config.mode) root.append(createElement("h2", {
			className: "gpo-editor-scripts__title",
			text: eventLabel(event)
		}));
		root.append(modalBody).append(uploadInput).append(replaceInput);
		function ownsHeader() {
			return Boolean(headerControls && headerControls.getAttribute("data-script-owner") === headerOwner);
		}
		function setHeaderState() {
			if (!ownsHeader()) return;
			const editable = Boolean(groupView().editable) && !state.busy && !state.loading && !state.form && !state.picker;
			[
				createButton,
				editButton,
				deleteButton
			].forEach(function(control, index) {
				if (!control) return;
				control.classList.toggle("active", editable && (index === 0 || Boolean(selectedEntry())));
			});
		}
		function listenHeader(control, handler) {
			if (!control) return;
			control.addEventListener("click", handler);
			headerListeners.push(function() {
				control.removeEventListener("click", handler);
			});
		}
		listenHeader(createButton, function() {
			if (ownsHeader() && createButton.classList.contains("active")) openForm("add");
		});
		listenHeader(editButton, function() {
			if (ownsHeader() && editButton.classList.contains("active")) openForm("edit");
		});
		listenHeader(deleteButton, function() {
			if (ownsHeader() && deleteButton.classList.contains("active")) removeEntry();
		});
		function current() {
			return !state.disposed && (typeof config.isCurrent !== "function" || config.isCurrent());
		}
		function groupView() {
			return state.view && state.view[state.group] || {
				entries: [],
				editable: false
			};
		}
		function entries() {
			return groupView().entries || [];
		}
		function selectedEntry() {
			return entries().find(function(entry) {
				return entry.identity === state.selectedEntry[state.group];
			}) || null;
		}
		function assets() {
			return state.view && state.view.assets || [];
		}
		function selectedAsset() {
			return assets().find(function(asset) {
				return asset.name === state.selectedAsset;
			}) || null;
		}
		function setError(error) {
			state.error = error;
			renderBody();
		}
		const { applyResponse, loadEvent, mutate } = createEventLoader({
			assets,
			config,
			current,
			navigations,
			renderBody,
			rootElement,
			scope,
			setError,
			state,
			syncModalBusy
		});
		function syncModalBusy() {
			[state.form, state.picker].forEach(function(modal) {
				if (!modal) return;
				modal.setAttribute("aria-busy", state.busy ? "true" : "false");
				Array.prototype.forEach.call(modal.querySelectorAll("input, select, button"), function(control) {
					if (state.busy) {
						if (!modalDisabledStates.has(control)) modalDisabledStates.set(control, {
							disabled: control.disabled,
							active: control.classList.contains("active")
						});
						control.disabled = true;
						control.classList.remove("active");
					} else if (modalDisabledStates.has(control)) {
						const original = modalDisabledStates.get(control);
						control.disabled = original.disabled;
						control.classList.toggle("active", original.active);
						modalDisabledStates.delete(control);
					}
				});
			});
		}
		function closeConfirmation() {
			if (state.confirmation) {
				state.confirmation.close();
				state.confirmation = null;
			}
		}
		function confirm(message, onConfirm) {
			closeConfirmation();
			state.confirmation = open$3(rootElement, {
				message,
				onCancel: function() {
					state.confirmation = null;
				},
				onConfirm: function() {
					state.confirmation = null;
					onConfirm();
				}
			});
		}
		function closeForm(force) {
			if (state.busy && !force) return false;
			closePicker();
			if (state.form) {
				state.formHost.remove();
				state.form = null;
				state.formHost = null;
			}
			state.formState = null;
			if (current()) {
				if (state.formFocus && state.formFocus.isConnected) state.formFocus.focus();
				else if (navigations.entries) navigations.entries.focusSelected();
			}
			state.formFocus = null;
			setHeaderState();
			return true;
		}
		function requestCloseForm() {
			if (state.busy || state.picker) return false;
			if (state.formState && state.formState.dirty()) {
				confirm(st("discardFormConfirm"), function() {
					closeForm(true);
				});
				return false;
			}
			return closeForm();
		}
		const picker = createAssetPicker({
			state,
			assets,
			current,
			rootElement,
			setHeaderState
		});
		const openPicker = picker.open;
		const closePicker = picker.close;
		const openForm = createEntryForm({
			config,
			scope,
			state,
			groupView,
			selectedEntry,
			selectedAsset,
			assets,
			rootElement,
			mutate,
			setHeaderState,
			openPicker,
			closeForm,
			requestCloseForm
		}).open;
		function removeEntry() {
			const entry = selectedEntry();
			if (!entry || !groupView().editable || state.busy) return;
			const group = state.group;
			const event = state.event;
			confirm(st("removeEntryConfirm"), function() {
				state.removal = {
					group,
					before: entries().map(function(row) {
						return row.identity;
					}),
					removed: [entry.identity]
				};
				mutate(function() {
					return scriptEntryRemove(scope, event, {
						executable_group: group,
						identity: entry.identity
					});
				});
			});
		}
		function moveEntry(delta) {
			const group = state.group;
			const rows = entries();
			const index = rows.findIndex(function(entry) {
				return entry.identity === state.selectedEntry[group];
			});
			const target = index + delta;
			if (!groupView().editable || state.busy || index < 0 || target < 0 || target >= rows.length) return;
			const order = rows.map(function(entry) {
				return entry.identity;
			});
			const moved = order[index];
			order[index] = order[target];
			order[target] = moved;
			const snapshot = groupView().snapshot;
			mutate(function() {
				return scriptEntriesReorder(scope, state.event, {
					executable_group: group,
					snapshot,
					identities: order
				});
			});
		}
		const { deleteAsset, uploadChosen, downloadAsset } = createAssetActions({
			applyResponse,
			confirm,
			assets,
			config,
			current,
			mutate,
			navigations,
			renderBody,
			scope,
			selectedAsset,
			setError,
			state
		});
		const renderEntries = createEntriesPanel({
			bindTable,
			config,
			entries,
			groupView,
			moveEntry,
			navigations,
			openForm,
			removeEntry,
			setHeaderState,
			state
		});
		const renderAssets = createAssetsPanel({
			assets,
			bindTable,
			config,
			deleteAsset,
			downloadAsset,
			groupView,
			loadEvent,
			navigations,
			openForm,
			replaceInput,
			selectedAsset,
			state,
			uploadInput
		});
		const { renderOrder, saveOrderDraft } = createOrderPanel({
			mutate,
			scope,
			state
		});
		function renderBody() {
			if (!current()) return;
			setHeaderState();
			const slot = modalBody.getElement();
			const activeTable = document.activeElement && document.activeElement.closest("[data-script-list]");
			const heldList = activeTable && slot.contains(activeTable) ? activeTable.getAttribute("data-script-list") : null;
			const heldGroupTab = slot.contains(document.activeElement) && document.activeElement.getAttribute("data-script-group");
			Object.keys(navigations).forEach(function(kind) {
				navigations[kind].cleanup();
			});
			Object.keys(navigations).forEach(function(key) {
				delete navigations[key];
			});
			slot.textContent = "";
			if (state.loading) {
				slot.appendChild(createElement("div", {
					className: "gpo-editor-empty",
					text: st("loading")
				}).getElement());
				return;
			}
			if (state.error) slot.appendChild(renderError(state.error, {
				onRefresh: function() {
					loadEvent();
				},
				onReconcile: function() {
					reconcile().then(loadEvent, setError);
				}
			}).getElement());
			if (!state.view) return;
			if (state.envelope && state.envelope.pending_publication) {
				const pending = renderPending(state.envelope.pending_publication, function() {
					reconcile().then(loadEvent, setError);
				});
				if (pending) slot.appendChild(pending.getElement());
			}
			const diagnostics = groupView().diagnostics || [];
			if (!groupView().editable) slot.appendChild(createElement("p", {
				className: "gpo-editor-scripts__hint",
				text: st("readOnlyScripts")
			}).getElement());
			if (diagnostics.length) slot.appendChild(renderDiagnostics(diagnostics).getElement());
			if (state.saveStatus) slot.appendChild(createElement("p", {
				className: "gpo-editor-scripts__save-status",
				attrs: {
					role: "status",
					"aria-live": "polite"
				},
				text: state.saveStatus === "saving" ? st("saving") : state.saveStatus === "saved" ? st("saved") : ""
			}).getElement());
			if (config.mode !== "assets") {
				slot.appendChild(createElement("div", {
					className: "preference__modal-tabs",
					children: [createElement("div", {
						className: "tab-buttons",
						attrs: { role: "tablist" },
						children: GROUPS.map(function(group) {
							return createElement("button", {
								className: ["preference__tab-button", group === state.group ? "active" : null],
								attrs: {
									type: "button",
									role: "tab",
									"data-script-group": group,
									"aria-selected": group === state.group ? "true" : "false"
								},
								text: st(group),
								events: { click: function() {
									state.group = group;
									renderBody();
								} }
							});
						})
					}), renderEntries()]
				}).getElement());
				slot.appendChild(renderOrder().getElement());
				if (config.mode === "event" && typeof config.openFolder === "function") slot.appendChild(button(st("showFiles"), config.openFolder, state.busy, "gpo-editor-scripts__show-files").getElement());
			}
			if (config.mode !== "event") slot.appendChild(renderAssets().getElement());
			if (heldGroupTab) {
				const restoredTab = slot.querySelector("[data-script-group=\"" + heldGroupTab + "\"]");
				if (restoredTab) restoredTab.focus({ preventScroll: true });
			} else if (heldList && navigations[heldList]) navigations[heldList].focusSelected();
		}
		function bindTable(table, kind, options) {
			table.getElement().setAttribute("data-script-list", kind);
			navigations[kind] = bind$1(table.getElement(), Object.assign({}, options, { busy: function() {
				return !current() || state.busy || state.loading || Boolean(state.form || state.picker || state.confirmation);
			} }));
			return navigations[kind];
		}
		root.hasUnsavedChanges = function() {
			return state.busy || Boolean(state.formState && state.formState.dirty()) || Boolean(state.view && state.orderDraft !== state.view.execution_order);
		};
		root.isBusy = function() {
			return state.busy;
		};
		root.updateResponse = function(response) {
			if (current()) applyResponse(response);
		};
		root.applyChanges = async function() {
			if (state.busy) return false;
			if (state.formState && state.formState.dirty()) {
				if (!await state.formState.submit()) return false;
			}
			return saveOrderDraft();
		};
		root.cancelChanges = function() {
			if (state.busy) return false;
			closeForm(true);
			if (state.view) state.orderDraft = state.view.execution_order;
			renderBody();
			return true;
		};
		root.cleanup = function() {
			state.disposed = true;
			Object.keys(navigations).forEach(function(kind) {
				navigations[kind].cleanup();
			});
			++state.requestId;
			closeForm(true);
			closeConfirmation();
			headerListeners.forEach(function(remove) {
				remove();
			});
			if (ownsHeader()) {
				headerControls.style.display = "none";
				headerControls.removeAttribute("data-script-owner");
				[
					createButton,
					editButton,
					deleteButton
				].forEach(function(control, index) {
					if (!control) return;
					control.classList.remove("active");
					control.textContent = headerLabels[index];
				});
			}
			if (headerActions && headerActions.getAttribute("data-script-owner") === headerOwner) {
				headerActions.removeAttribute("data-script-owner");
				headerActions.style.display = "";
				if (admxActions) admxActions.style.display = "";
				if (helpSeparator) helpSeparator.style.display = "";
			}
		};
		loadEvent();
		return root;
	}
	//#endregion
	//#region src/components/templates/script-template.js
	var wrap = ElementCreator.wrap;
	function renderScriptsTemplate(options) {
		const config = options || {};
		if (config.item && config.item.event) return renderScriptEventEditor(config);
		const scope = config.item && config.item.scope === "user" ? "user" : "computer";
		const events = EVENTS[scope];
		const state = {
			selectedEvent: events.indexOf(config.item && config.item.scriptEvent) !== -1 ? config.item.scriptEvent : events[0],
			summaries: {},
			errors: {},
			generations: {},
			modal: null,
			confirmation: null,
			disposed: false
		};
		let overviewNavigation = null;
		const root = createElement("div", { className: [
			"gp__scripts",
			"gp__preference",
			"gpo-editor-scripts"
		] });
		const rootElement = root.getElement();
		const overview = createElement("div", { className: ["preference__data-table", "gpo-editor-scripts__overview"] });
		if (!config.hideHeading) root.append(createElement("h2", {
			className: "gpo-editor-scripts__title",
			text: config.categoryPath || st("scripts"),
			attrs: { "data-category-path": "" }
		}));
		root.append(overview);
		const headerElement = config.header && config.header.getElement ? config.header.getElement() : null;
		const headerControls = headerElement && headerElement.querySelector(".gp__control");
		const headerActions = headerElement && headerElement.querySelector(".gp__control-actions");
		const admxActions = headerElement && headerElement.querySelector(".gp__control-admx");
		const helpSeparator = headerElement && headerElement.querySelector(".gp__control-separator");
		const createButton$1 = headerControls && headerControls.querySelector(".preferences__btn-create");
		const editButton = headerControls && headerControls.querySelector(".preferences__btn-edit");
		const deleteButton = headerControls && headerControls.querySelector(".preferences__btn-delete");
		const headerOwner = nextHeaderOwner();
		const oldHeader = [
			createButton$1,
			editButton,
			deleteButton
		].map(function(control) {
			return control ? {
				text: control.textContent,
				display: control.style.display,
				disabled: control.disabled,
				active: control.classList.contains("active")
			} : null;
		});
		const folderButton = button(st("openFolder"), function() {
			openModal("assets");
		}, false);
		folderButton.addClass("gpo-editor-scripts__folder-button");
		if (headerControls) {
			headerControls.setAttribute("data-script-owner", headerOwner);
			headerControls.style.display = "flex";
			if (createButton$1) createButton$1.style.display = "none";
			if (deleteButton) deleteButton.style.display = "none";
			if (editButton) {
				editButton.textContent = st("openEvent");
				editButton.classList.add("active");
				editButton.addEventListener("click", onOpenEvent);
			}
			headerControls.appendChild(folderButton.getElement());
		}
		if (headerActions) {
			headerActions.setAttribute("data-script-owner", headerOwner);
			headerActions.style.display = "flex";
		}
		if (admxActions) admxActions.style.display = "none";
		if (helpSeparator) helpSeparator.style.display = "none";
		function current() {
			return !state.disposed && (typeof config.isCurrent !== "function" || config.isCurrent());
		}
		function ownsHeader() {
			return Boolean(headerControls && headerControls.getAttribute("data-script-owner") === headerOwner);
		}
		function updateHeader() {
			if (!ownsHeader()) return;
			const enabled = !state.modal;
			if (editButton) {
				editButton.disabled = !enabled;
				editButton.classList.toggle("active", enabled);
			}
			folderButton.getElement().disabled = !enabled;
			folderButton.getElement().classList.toggle("active", enabled);
		}
		function refreshEvent(event) {
			const generation = (state.generations[event] || 0) + 1;
			state.generations[event] = generation;
			return scriptsShow(scope, event).then(function(response) {
				if (!current() || state.generations[event] !== generation) return;
				state.summaries[event] = response && response.scripts || null;
				delete state.errors[event];
				renderOverview();
			}, function(error) {
				if (!current() || state.generations[event] !== generation) return;
				state.errors[event] = error;
				renderOverview();
			});
		}
		function renderOverview() {
			if (!current()) return;
			const heldFocus = overview.getElement().contains(document.activeElement);
			if (overviewNavigation) overviewNavigation.cleanup();
			function selectRow(row, event) {
				state.selectedEvent = event;
				Array.prototype.forEach.call(table.getElement().querySelectorAll("tbody tr"), function(candidate) {
					candidate.classList.toggle("active", candidate === row.getElement());
				});
				renderOverviewError();
				if (overviewNavigation) overviewNavigation.sync();
			}
			const table = createElement("table", {
				className: [
					"preference__table",
					"gpo-catalog-table",
					"gpo-editor-scripts__event-table"
				],
				children: [createElement("thead", { children: [createElement("tr", { children: [
					createElement("th", { text: st("eventColumn") }),
					createElement("th", { text: st("scriptsColumn") }),
					createElement("th", { text: st("powershellColumn") })
				] })] }), createElement("tbody", { children: events.map(function(event) {
					const view = state.summaries[event];
					const row = createElement("tr", {
						className: event === state.selectedEvent ? "active" : null,
						attrs: {
							tabindex: "-1",
							"data-script-event": event
						},
						children: [
							nameCell(eventLabel(event), scriptEvent(event)),
							createElement("td", { text: view ? String(view.classic.entries.length) : "—" }),
							createElement("td", { text: view ? String(view.powershell.entries.length) : "—" })
						]
					});
					row.getElement().__select = function() {
						selectRow(row, event);
					};
					row.on("click", function() {
						selectRow(row, event);
						overviewNavigation.focusSelected();
					});
					row.on("dblclick", function() {
						if (!state.modal) {
							selectRow(row, event);
							openModal("event");
						}
					});
					return row;
				}) })]
			});
			overview.getElement().replaceChildren(table.getElement());
			overviewNavigation = bind$1(table.getElement(), {
				rows: function() {
					return Array.from(table.getElement().querySelectorAll("[data-script-event]"));
				},
				selected: function() {
					return Array.from(table.getElement().querySelectorAll("[data-script-event]")).find(function(row) {
						return row.getAttribute("data-script-event") === state.selectedEvent;
					}) || null;
				},
				select: function(row) {
					row.__select();
				},
				activate: function() {
					openModal("event");
				},
				busy: function() {
					return !current() || Boolean(state.modal);
				}
			});
			renderOverviewError();
			if (heldFocus) overviewNavigation.focusSelected();
		}
		function renderOverviewError() {
			const slot = overview.getElement();
			const prior = slot.querySelector(".gpo-editor-scripts__overview-error");
			if (prior) prior.remove();
			if (state.errors[state.selectedEvent]) {
				const error = createElement("div", { className: "gpo-editor-scripts__overview-error" });
				error.append(renderError(state.errors[state.selectedEvent], { onRefresh: function() {
					refreshEvent(state.selectedEvent);
				} }));
				slot.appendChild(error.getElement());
			}
		}
		function onOpenEvent() {
			if (ownsHeader() && !state.modal) openModal("event");
		}
		function closeModal(force, afterClose) {
			const active = state.modal;
			if (!active || active.detail && active.detail.isBusy()) return false;
			if (!force && active.detail && active.detail.hasUnsavedChanges()) {
				if (!state.confirmation) state.confirmation = open$3(rootElement, {
					message: st("discardFormConfirm"),
					onCancel: function() {
						state.confirmation = null;
					},
					onConfirm: function() {
						state.confirmation = null;
						closeModal(true, afterClose);
					}
				});
				return false;
			}
			if (active.detail) active.detail.cleanup();
			active.dialog.remove();
			active.overlay.remove();
			state.modal = null;
			updateHeader();
			refreshEvent(active.event);
			if (current()) {
				if (active.previousFocus && active.previousFocus.isConnected) active.previousFocus.focus();
				else if (overviewNavigation) overviewNavigation.focusSelected();
			}
			if (typeof afterClose === "function") afterClose();
			return true;
		}
		function openModal(mode) {
			if (!current() || state.modal) return;
			const event = state.selectedEvent;
			const previousFocus = document.activeElement;
			const host = createElement("div", { className: "gpo-editor-scripts__detail-host" });
			const title = mode === "assets" ? st("folderForEvent").replace("{event}", eventLabel(event)) : eventLabel(event);
			const detailBody = createBody(null);
			detailBody.append(host.getElement());
			const closeAction = wrap(createButton("cancel", st("closeDialog")));
			closeAction.on("click", function() {
				closeModal();
			});
			const closeX = wrap(createCloseButton(st("close")));
			closeX.on("click", function() {
				closeModal();
			});
			const shell = createDialogShell({
				titleId: "gpo-editor-scripts-modal-title",
				title,
				body: detailBody,
				closeButton: closeX.getElement(),
				buttons: [closeAction.getElement()],
				width: mode === "assets" ? "min(620px, calc(100vw - 32px))" : "min(600px, calc(100vw - 32px))",
				className: mode === "assets" ? "gpo-editor-scripts__explorer" : "gpo-editor-scripts__event-dialog"
			});
			const dialog = wrap(shell.dialog);
			shell.host.addEventListener("click", function(clickEvent) {
				if (clickEvent.target === shell.host) closeModal();
			});
			dialog.on("keydown", function(keyEvent) {
				if (keyEvent.defaultPrevented || keyEvent.target.closest("[role=\"dialog\"], [role=\"alertdialog\"]") !== shell.dialog) return;
				if (keyEvent.key === "Escape") {
					keyEvent.preventDefault();
					keyEvent.stopPropagation();
					closeModal();
				}
				trapTab(keyEvent, shell.dialog);
			});
			rootElement.appendChild(shell.host);
			state.modal = {
				mode,
				event,
				detail: null,
				dialog: dialog.getElement(),
				overlay: shell.host,
				previousFocus
			};
			updateHeader();
			mountDetail();
			dialog.getElement().querySelector(".btn-cancel").focus();
			function mountDetail() {
				const active = state.modal;
				if (!active || active.dialog !== dialog.getElement()) return;
				if (active.detail) active.detail.cleanup();
				active.detail = renderScriptEventEditor({
					item: {
						scope,
						event
					},
					mode,
					isCurrent: function() {
						return current() && state.modal === active;
					},
					openFolder: function() {
						closeModal(false, function() {
							openModal("assets");
						});
					}
				});
				host.getElement().replaceChildren(active.detail.getElement());
				renderOverview();
			}
		}
		root.hasUnsavedChanges = function() {
			return Boolean(state.modal && state.modal.detail && state.modal.detail.hasUnsavedChanges());
		};
		root.applyChanges = function() {
			return state.modal && state.modal.detail ? state.modal.detail.applyChanges() : Promise.resolve(true);
		};
		root.cancelChanges = function() {
			if (state.modal && state.modal.detail && state.modal.detail.isBusy()) return false;
			if (state.modal) closeModal(true);
			return true;
		};
		root.cleanup = function() {
			state.disposed = true;
			if (overviewNavigation) overviewNavigation.cleanup();
			if (state.confirmation) {
				state.confirmation.close();
				state.confirmation = null;
			}
			if (state.modal && state.modal.detail) state.modal.detail.cleanup();
			if (state.modal) {
				state.modal.dialog.remove();
				state.modal.overlay.remove();
				state.modal = null;
			}
			if (ownsHeader()) {
				editButton && editButton.removeEventListener("click", onOpenEvent);
				folderButton.getElement().remove();
				[
					createButton$1,
					editButton,
					deleteButton
				].forEach(function(control, index) {
					if (!control) return;
					control.textContent = oldHeader[index].text;
					control.style.display = oldHeader[index].display;
					control.disabled = oldHeader[index].disabled;
					control.classList.toggle("active", oldHeader[index].active);
				});
				headerControls.removeAttribute("data-script-owner");
				headerControls.style.display = "none";
			}
			if (headerActions && headerActions.getAttribute("data-script-owner") === headerOwner) {
				headerActions.removeAttribute("data-script-owner");
				headerActions.style.display = "";
				if (admxActions) admxActions.style.display = "";
				if (helpSeparator) helpSeparator.style.display = "";
			}
		};
		root.onMounted = function() {
			if (config.item && config.item.openPolicyDialog && current()) openModal("event");
		};
		renderOverview();
		events.forEach(function(event) {
			refreshEvent(event);
		});
		return root;
	}
	function openScriptsDialog(host, options) {
		const config = options || {};
		const item = config.item || {};
		const scope = item.scope === "user" ? "user" : "computer";
		let event = item.scriptEvent || item.event;
		if (EVENTS[scope].indexOf(event) === -1) event = EVENTS[scope][0];
		let closed = false;
		let explorer = null;
		const detailHost = createElement("div", { className: "gpo-editor-scripts__detail-host" });
		const editor = renderScriptEventEditor({
			item: {
				scope,
				event
			},
			mode: "event",
			isCurrent: current,
			onSaved: config.onSaved,
			openFolder
		});
		detailHost.append(editor);
		const dialog = open$2(host, {
			title: eventLabel(event),
			className: ["gpo-editor-scripts__event-dialog"],
			width: "min(600px, calc(100vw - 32px))",
			hostClassName: ["gpo-editor-scripts"],
			content: detailHost,
			readOnly: true,
			cancelLabel: st("closeDialog"),
			closeLabel: st("close"),
			canClose: function() {
				return !editor.isBusy() && !explorer;
			},
			isDirty: editor.hasUnsavedChanges,
			discardMessage: st("discardFormConfirm"),
			onClose: function() {
				cleanup();
				if (config.onClose) config.onClose();
			},
			restoreFocus: config.restoreFocus
		});
		function current() {
			return !closed && (typeof config.isCurrent !== "function" || config.isCurrent());
		}
		function openFolder() {
			if (!current() || explorer || editor.isBusy()) return;
			const filesHost = createElement("div", { className: "gpo-editor-scripts__detail-host" });
			const files = renderScriptEventEditor({
				item: {
					scope,
					event
				},
				mode: "assets",
				isCurrent: function() {
					return current() && Boolean(explorer);
				},
				onSaved: function(response) {
					editor.updateResponse(response);
					if (typeof config.onSaved === "function") config.onSaved(response);
				}
			});
			filesHost.append(files);
			dialog.root.getElement().inert = true;
			explorer = {
				editor: files,
				dialog: open$2(host, {
					title: st("folderForEvent").replace("{event}", eventLabel(event)),
					className: ["gpo-editor-scripts__explorer"],
					width: "min(620px, calc(100vw - 32px))",
					hostClassName: ["gpo-editor-scripts"],
					content: filesHost,
					readOnly: true,
					cancelLabel: st("closeDialog"),
					closeLabel: st("close"),
					canClose: function() {
						return !files.isBusy();
					},
					isDirty: files.hasUnsavedChanges,
					onClose: function() {
						files.cleanup();
						explorer = null;
						if (!closed) dialog.root.getElement().inert = false;
					}
				})
			};
		}
		function cleanup() {
			if (closed) return;
			closed = true;
			if (explorer) explorer.dialog.close();
			editor.cleanup();
		}
		return {
			editor: {
				hasUnsavedChanges: function() {
					return editor.hasUnsavedChanges() || Boolean(explorer && explorer.editor.hasUnsavedChanges());
				},
				isBusy: function() {
					return editor.isBusy() || Boolean(explorer && explorer.editor.isBusy());
				},
				applyChanges: async function() {
					if (explorer && !await explorer.editor.applyChanges()) return false;
					return editor.applyChanges();
				},
				cancelChanges: function() {
					if (editor.isBusy() || explorer && explorer.editor.isBusy()) return false;
					if (explorer) explorer.dialog.close();
					return editor.cancelChanges();
				},
				cleanup,
				getElement: function() {
					return editor.getElement();
				}
			},
			dialog
		};
	}
	//#endregion
	//#region src/components/templates/preference/layouts/shortcuts.js
	var shortcuts_exports = /* @__PURE__ */ __exportAll({
		basic: () => basic$21,
		columns: () => columns$17,
		dependencies: () => dependencies$10,
		filters: () => filters$21,
		general: () => general$21
	});
	var basic$21 = [
		{ field: "properties.action" },
		{ line: true },
		{ field: "properties.targetType" },
		{ field: "properties.shortcutPath" },
		{ line: true },
		{ field: "properties.targetPath" },
		{ field: "properties.arguments" },
		{ line: true },
		{ field: "properties.iconPath" },
		{ field: "properties.iconIndex" },
		{ line: true },
		{ field: "properties.startIn" },
		{ field: "properties.shortcutKey" },
		{ field: "properties.run" }
	];
	var general$21 = [
		{
			field: "properties.comment",
			textarea: true
		},
		{ field: "metadata.bypassErrors" },
		{ field: "metadata.userContext" },
		{ field: "metadata.removePolicy" },
		{ field: "properties.disabled" },
		{
			field: "metadata.desc",
			textarea: true
		}
	];
	var filters$21 = "general";
	var dependencies$10 = [
		{
			field: "properties.targetPath",
			enabledWhen: [{
				source: "properties.action",
				notEquals: "delete"
			}]
		},
		{
			field: "properties.arguments",
			enabledWhen: [{
				source: "properties.action",
				notEquals: "delete"
			}, {
				source: "properties.targetType",
				notIn: ["URL", "SHELL"]
			}]
		},
		{
			field: "properties.iconPath",
			enabledWhen: [{
				source: "properties.action",
				notEquals: "delete"
			}]
		},
		{
			field: "properties.iconIndex",
			enabledWhen: [
				{
					source: "properties.action",
					notEquals: "delete"
				},
				{
					source: "properties.iconPath",
					nonEmpty: true
				},
				{
					source: "properties.iconPath",
					suffix: ".dll"
				}
			]
		},
		{
			field: "properties.startIn",
			enabledWhen: [{
				source: "properties.action",
				notEquals: "delete"
			}, {
				source: "properties.targetType",
				notIn: ["URL", "SHELL"]
			}]
		},
		{
			field: "properties.shortcutKey",
			enabledWhen: [{
				source: "properties.action",
				notEquals: "delete"
			}]
		},
		{
			field: "properties.run",
			enabledWhen: [{
				source: "properties.action",
				notEquals: "delete"
			}, {
				source: "properties.targetType",
				notEquals: "URL"
			}]
		},
		{
			field: "properties.comment",
			enabledWhen: [{
				source: "properties.action",
				notEquals: "delete"
			}, {
				source: "properties.targetType",
				notEquals: "URL"
			}]
		}
	];
	var columns$17 = [
		{
			source: "name",
			labelKey: "columnName"
		},
		{
			source: "order",
			labelKey: "columnOrder"
		},
		{
			source: "field",
			field: "properties.action",
			labelKey: "columnAction",
			format: "action"
		},
		{
			source: "field",
			field: "properties.shortcutPath",
			labelKey: "columnShortcutPath"
		}
	];
	//#endregion
	//#region src/components/templates/preference/layouts/folders.js
	var folders_exports = /* @__PURE__ */ __exportAll({
		basic: () => basic$20,
		columns: () => columns$16,
		dependencies: () => dependencies$9,
		filters: () => filters$20,
		general: () => general$20
	});
	var basic$20 = [
		{ field: "properties.action" },
		{ line: true },
		{ field: "properties.path" },
		{ line: true },
		{ field: "properties.readOnly" },
		{ field: "properties.archive" },
		{ field: "properties.hidden" },
		{ line: true },
		{ field: "properties.deleteReadOnly" },
		{ field: "properties.deleteAll" },
		{ field: "properties.deleteSubFolders" }
	];
	var general$20 = [
		{ field: "metadata.bypassErrors" },
		{ field: "metadata.userContext" },
		{ field: "metadata.removePolicy" },
		{ field: "properties.disabled" },
		{
			field: "metadata.desc",
			textarea: true
		}
	];
	var filters$20 = "general";
	var dependencies$9 = [
		{
			field: "properties.readOnly",
			enabledWhen: [{
				source: "properties.action",
				notEquals: "delete"
			}]
		},
		{
			field: "properties.archive",
			enabledWhen: [{
				source: "properties.action",
				notEquals: "delete"
			}]
		},
		{
			field: "properties.hidden",
			enabledWhen: [{
				source: "properties.action",
				notEquals: "delete"
			}]
		},
		{
			field: "properties.deleteReadOnly",
			enabledWhen: [{
				source: "properties.action",
				in: ["replace", "delete"]
			}]
		},
		{
			field: "properties.deleteAll",
			enabledWhen: [{
				source: "properties.action",
				in: ["replace", "delete"]
			}]
		},
		{
			field: "properties.deleteSubFolders",
			enabledWhen: [{
				source: "properties.action",
				in: ["replace", "delete"]
			}]
		}
	];
	var columns$16 = [
		{
			source: "name",
			labelKey: "columnName"
		},
		{
			source: "order",
			labelKey: "columnOrder"
		},
		{
			source: "field",
			field: "properties.action",
			labelKey: "columnAction",
			format: "action"
		},
		{
			source: "field",
			field: "properties.path",
			labelKey: "columnPath"
		}
	];
	//#endregion
	//#region src/components/templates/preference/layouts/applications.js
	var applications_exports = /* @__PURE__ */ __exportAll({
		basic: () => basic$19,
		filters: () => filters$19,
		general: () => general$19
	});
	var basic$19 = [];
	var general$19 = [
		{ field: "metadata.bypassErrors" },
		{ field: "metadata.userContext" },
		{ field: "metadata.removePolicy" },
		{ field: "properties.disabled" },
		{
			field: "metadata.desc",
			textarea: true
		}
	];
	var filters$19 = "general";
	//#endregion
	//#region src/components/templates/preference/layouts/control-panel.js
	var control_panel_exports = /* @__PURE__ */ __exportAll({
		basic: () => basic$18,
		filters: () => filters$18,
		general: () => general$18
	});
	var basic$18 = [];
	var general$18 = [
		{ field: "metadata.bypassErrors" },
		{ field: "metadata.userContext" },
		{ field: "metadata.removePolicy" },
		{ field: "properties.disabled" },
		{
			field: "metadata.desc",
			textarea: true
		}
	];
	var filters$18 = "general";
	//#endregion
	//#region src/components/templates/preference/layouts/data-sources.js
	var data_sources_exports = /* @__PURE__ */ __exportAll({
		basic: () => basic$17,
		columns: () => columns$15,
		dependencies: () => dependencies$8,
		filters: () => filters$17,
		general: () => general$17
	});
	var basic$17 = [
		{ field: "properties.action" },
		{ line: true },
		{ field: "properties.dsn" },
		{ field: "properties.driver" },
		{ field: "properties.description" },
		{ field: "properties.server" },
		{ field: "properties.database" },
		{ line: true },
		{ field: "properties.lastUser" },
		{ field: "properties.username" }
	];
	var general$17 = [
		{ field: "metadata.bypassErrors" },
		{ field: "metadata.userContext" },
		{ field: "metadata.removePolicy" },
		{ field: "properties.disabled" },
		{
			field: "metadata.desc",
			textarea: true
		}
	];
	var filters$17 = "general";
	var dependencies$8 = [{
		field: "properties.dsn",
		enabledWhen: [{
			source: "properties.action",
			notEquals: "delete"
		}]
	}, {
		field: "properties.username",
		enabledWhen: [{
			source: "properties.action",
			notEquals: "delete"
		}]
	}];
	var columns$15 = [
		{
			source: "name",
			labelKey: "columnName"
		},
		{
			source: "order",
			labelKey: "columnOrder"
		},
		{
			source: "field",
			field: "properties.action",
			labelKey: "columnAction",
			format: "action"
		},
		{
			source: "field",
			field: "properties.driver",
			labelKey: "columnDriver"
		},
		{
			source: "field",
			field: "properties.server",
			labelKey: "columnServer"
		},
		{
			source: "field",
			field: "properties.database",
			labelKey: "columnDatabase"
		}
	];
	//#endregion
	//#region src/components/templates/preference/layouts/devices.js
	var devices_exports = /* @__PURE__ */ __exportAll({
		basic: () => basic$16,
		columns: () => columns$14,
		filters: () => filters$16,
		general: () => general$16
	});
	var basic$16 = [
		{ field: "properties.action" },
		{ line: true },
		{ field: "properties.deviceName" },
		{ field: "properties.deviceAction" },
		{ line: true },
		{ field: "properties.deviceId" },
		{ field: "properties.deviceClass" },
		{ field: "properties.classGuid" }
	];
	var general$16 = [
		{ field: "metadata.bypassErrors" },
		{ field: "metadata.userContext" },
		{ field: "metadata.removePolicy" },
		{ field: "properties.disabled" },
		{
			field: "metadata.desc",
			textarea: true
		}
	];
	var filters$16 = "general";
	var columns$14 = [
		{
			source: "name",
			labelKey: "columnName"
		},
		{
			source: "order",
			labelKey: "columnOrder"
		},
		{
			source: "field",
			field: "properties.action",
			labelKey: "columnAction",
			format: "action"
		},
		{
			source: "field",
			field: "properties.deviceClass",
			labelKey: "columnDeviceClass"
		},
		{
			source: "field",
			field: "properties.deviceId",
			labelKey: "columnDeviceId"
		}
	];
	//#endregion
	//#region src/components/templates/preference/layouts/drives.js
	var drives_exports = /* @__PURE__ */ __exportAll({
		basic: () => basic$15,
		columns: () => columns$13,
		filters: () => filters$15,
		general: () => general$15
	});
	var basic$15 = [
		{ field: "properties.action" },
		{ line: true },
		{ field: "properties.path" },
		{ field: "properties.thisDrive" },
		{ field: "properties.allDrives" },
		{ line: true },
		{ field: "properties.userName" },
		{ field: "properties.label" },
		{ line: true },
		{ field: "properties.persistent" },
		{ field: "properties.useLetter" },
		{ field: "properties.letter" }
	];
	var general$15 = [
		{ field: "metadata.bypassErrors" },
		{ field: "metadata.userContext" },
		{ field: "metadata.removePolicy" },
		{ field: "properties.disabled" },
		{
			field: "metadata.desc",
			textarea: true
		}
	];
	var filters$15 = "general";
	var columns$13 = [
		{
			source: "name",
			labelKey: "columnName"
		},
		{
			source: "order",
			labelKey: "columnOrder"
		},
		{
			source: "field",
			field: "properties.action",
			labelKey: "columnAction",
			format: "action"
		},
		{
			source: "field",
			field: "properties.letter",
			labelKey: "columnLetter"
		},
		{
			source: "field",
			field: "properties.path",
			labelKey: "columnPath"
		}
	];
	//#endregion
	//#region src/components/templates/preference/layouts/environment-variables.js
	var environment_variables_exports = /* @__PURE__ */ __exportAll({
		basic: () => basic$14,
		columns: () => columns$12,
		dependencies: () => dependencies$7,
		filters: () => filters$14,
		general: () => general$14
	});
	var basic$14 = [
		{ field: "properties.action" },
		{ line: true },
		{ field: "properties.name" },
		{ field: "properties.value" },
		{ line: true },
		{ field: "properties.user" },
		{ field: "properties.partial" }
	];
	var general$14 = [
		{ field: "metadata.bypassErrors" },
		{ field: "metadata.userContext" },
		{ field: "metadata.removePolicy" },
		{ field: "properties.disabled" },
		{
			field: "metadata.desc",
			textarea: true
		}
	];
	var filters$14 = "general";
	var dependencies$7 = [{
		field: "properties.value",
		enabledWhen: [{
			source: "properties.action",
			notEquals: "delete"
		}]
	}, {
		field: "properties.partial",
		enabledWhen: [{
			source: "properties.user",
			equals: false
		}]
	}];
	var columns$12 = [
		{
			source: "name",
			labelKey: "columnName"
		},
		{
			source: "order",
			labelKey: "columnOrder"
		},
		{
			source: "field",
			field: "properties.action",
			labelKey: "columnAction",
			format: "action"
		},
		{
			source: "field",
			field: "properties.value",
			labelKey: "columnValue"
		}
	];
	//#endregion
	//#region src/components/templates/preference/layouts/files.js
	var files_exports = /* @__PURE__ */ __exportAll({
		basic: () => basic$13,
		columns: () => columns$11,
		dependencies: () => dependencies$6,
		filters: () => filters$13,
		general: () => general$13
	});
	var basic$13 = [
		{ field: "properties.action" },
		{ line: true },
		{ field: "properties.fromPath" },
		{ field: "properties.targetPath" },
		{ line: true },
		{ field: "properties.readOnly" },
		{ field: "properties.archive" },
		{ field: "properties.hidden" },
		{ field: "properties.suppress" },
		{ line: true },
		{ field: "properties.deleteReadOnly" },
		{ field: "properties.deleteAll" },
		{ field: "properties.deleteSubFolders" }
	];
	var general$13 = [
		{ field: "metadata.bypassErrors" },
		{ field: "metadata.userContext" },
		{ field: "metadata.removePolicy" },
		{ field: "properties.disabled" },
		{
			field: "metadata.desc",
			textarea: true
		}
	];
	var filters$13 = "general";
	var dependencies$6 = [
		{
			field: "properties.fromPath",
			enabledWhen: [{
				source: "properties.action",
				notEquals: "delete"
			}]
		},
		{
			field: "properties.readOnly",
			enabledWhen: [{
				source: "properties.action",
				notEquals: "delete"
			}]
		},
		{
			field: "properties.archive",
			enabledWhen: [{
				source: "properties.action",
				notEquals: "delete"
			}]
		},
		{
			field: "properties.hidden",
			enabledWhen: [{
				source: "properties.action",
				notEquals: "delete"
			}]
		},
		{
			field: "properties.suppress",
			enabledWhen: [{
				source: "properties.action",
				notEquals: "create"
			}]
		},
		{
			field: "properties.deleteReadOnly",
			enabledWhen: [{
				source: "properties.action",
				in: ["replace", "delete"]
			}]
		},
		{
			field: "properties.deleteAll",
			enabledWhen: [{
				source: "properties.action",
				in: ["replace", "delete"]
			}]
		},
		{
			field: "properties.deleteSubFolders",
			enabledWhen: [{
				source: "properties.action",
				in: ["replace", "delete"]
			}]
		}
	];
	var columns$11 = [
		{
			source: "name",
			labelKey: "columnName"
		},
		{
			source: "order",
			labelKey: "columnOrder"
		},
		{
			source: "field",
			field: "properties.action",
			labelKey: "columnAction",
			format: "action"
		},
		{
			source: "field",
			field: "properties.fromPath",
			labelKey: "columnSourcePath"
		},
		{
			source: "field",
			field: "properties.targetPath",
			labelKey: "columnTargetPath"
		}
	];
	//#endregion
	//#region src/components/templates/preference/layouts/folder-options.js
	var folder_options_exports = /* @__PURE__ */ __exportAll({
		basic: () => basic$12,
		filters: () => filters$12,
		general: () => general$12
	});
	var basic$12 = [];
	var general$12 = [
		{ field: "metadata.bypassErrors" },
		{ field: "metadata.userContext" },
		{ field: "metadata.removePolicy" },
		{ field: "properties.disabled" },
		{
			field: "metadata.desc",
			textarea: true
		}
	];
	var filters$12 = "general";
	//#endregion
	//#region src/components/templates/preference/layouts/ini-files.js
	var ini_files_exports = /* @__PURE__ */ __exportAll({
		basic: () => basic$11,
		columns: () => columns$10,
		dependencies: () => dependencies$5,
		filters: () => filters$11,
		general: () => general$11
	});
	var basic$11 = [
		{ field: "properties.action" },
		{ line: true },
		{ field: "properties.path" },
		{ line: true },
		{ field: "properties.section" },
		{ field: "properties.property" },
		{ field: "properties.value" }
	];
	var general$11 = [
		{ field: "metadata.bypassErrors" },
		{ field: "metadata.userContext" },
		{ field: "metadata.removePolicy" },
		{ field: "properties.disabled" },
		{
			field: "metadata.desc",
			textarea: true
		}
	];
	var filters$11 = "general";
	var dependencies$5 = [
		{
			field: "properties.section",
			enabledWhen: [{
				source: "properties.path",
				nonEmpty: true
			}]
		},
		{
			field: "properties.property",
			enabledWhen: [{
				source: "properties.section",
				nonEmpty: true
			}]
		},
		{
			field: "properties.value",
			enabledWhen: [{
				source: "properties.property",
				nonEmpty: true
			}, {
				source: "properties.action",
				notEquals: "delete"
			}]
		}
	];
	var columns$10 = [
		{
			source: "name",
			labelKey: "columnName"
		},
		{
			source: "order",
			labelKey: "columnOrder"
		},
		{
			source: "field",
			field: "properties.action",
			labelKey: "columnAction",
			format: "action"
		},
		{
			source: "field",
			field: "properties.path",
			labelKey: "columnPath"
		},
		{
			source: "field",
			field: "properties.section",
			labelKey: "columnSection"
		},
		{
			source: "field",
			field: "properties.property",
			labelKey: "columnProperty"
		},
		{
			source: "field",
			field: "properties.value",
			labelKey: "columnValue"
		}
	];
	//#endregion
	//#region src/components/templates/preference/layouts/internet-settings.js
	var internet_settings_exports = /* @__PURE__ */ __exportAll({
		basic: () => basic$10,
		filters: () => filters$10,
		general: () => general$10
	});
	var basic$10 = [];
	var general$10 = [
		{ field: "metadata.bypassErrors" },
		{ field: "metadata.userContext" },
		{ field: "metadata.removePolicy" },
		{ field: "properties.disabled" },
		{
			field: "metadata.desc",
			textarea: true
		}
	];
	var filters$10 = "general";
	//#endregion
	//#region src/components/templates/preference/layouts/local-users-and-groups.js
	var local_users_and_groups_exports = /* @__PURE__ */ __exportAll({
		basic: () => basic$9,
		columns: () => columns$9,
		dependencies: () => dependencies$4,
		filters: () => filters$9,
		general: () => general$9
	});
	var basic$9 = [
		{ field: "properties.element" },
		{ field: "properties.action" },
		{ line: true },
		{ field: "properties.userName" },
		{ field: "properties.newName" },
		{ field: "properties.fullName" },
		{ field: "properties.description" },
		{ line: true },
		{ field: "properties.changeLogon" },
		{ field: "properties.noChange" },
		{ field: "properties.neverExpires" },
		{ field: "properties.acctDisabled" },
		{ field: "properties.expires" }
	];
	var general$9 = [
		{ field: "metadata.bypassErrors" },
		{ field: "metadata.userContext" },
		{ field: "metadata.removePolicy" },
		{
			field: "metadata.desc",
			textarea: true
		}
	];
	var filters$9 = "general";
	var dependencies$4 = [
		{
			field: "properties.newName",
			enabledWhen: [{ anyOf: [{
				source: "properties.element",
				notEquals: "Group"
			}, {
				source: "properties.action",
				notEquals: "delete"
			}] }]
		},
		{
			field: "properties.fullName",
			enabledWhen: [{ anyOf: [{
				source: "properties.element",
				notEquals: "Group"
			}, {
				source: "properties.action",
				notEquals: "delete"
			}] }]
		},
		{
			field: "properties.description",
			enabledWhen: [{ anyOf: [{
				source: "properties.element",
				notEquals: "Group"
			}, {
				source: "properties.action",
				notEquals: "delete"
			}] }]
		},
		{
			field: "properties.changeLogon",
			enabledWhen: [{ anyOf: [{
				source: "properties.element",
				notEquals: "Group"
			}, {
				source: "properties.action",
				notEquals: "delete"
			}] }]
		},
		{
			field: "properties.noChange",
			enabledWhen: [{ anyOf: [{
				source: "properties.element",
				notEquals: "Group"
			}, {
				source: "properties.action",
				notEquals: "delete"
			}] }]
		},
		{
			field: "properties.neverExpires",
			enabledWhen: [{ anyOf: [{
				source: "properties.element",
				notEquals: "Group"
			}, {
				source: "properties.action",
				notEquals: "delete"
			}] }]
		},
		{
			field: "properties.acctDisabled",
			enabledWhen: [{ anyOf: [{
				source: "properties.element",
				notEquals: "Group"
			}, {
				source: "properties.action",
				notEquals: "delete"
			}] }]
		},
		{
			field: "properties.expires",
			enabledWhen: [{ anyOf: [{
				source: "properties.element",
				notEquals: "Group"
			}, {
				source: "properties.action",
				notEquals: "delete"
			}] }, {
				source: "properties.neverExpires",
				notEquals: true
			}]
		}
	];
	var columns$9 = [
		{
			source: "name",
			labelKey: "columnName"
		},
		{
			source: "order",
			labelKey: "columnOrder"
		},
		{
			source: "field",
			field: "properties.action",
			labelKey: "columnAction",
			format: "action"
		},
		{
			source: "field",
			field: "properties.userName",
			labelKey: "columnUserName"
		}
	];
	//#endregion
	//#region src/components/templates/preference/layouts/network-options.js
	var network_options_exports = /* @__PURE__ */ __exportAll({
		basic: () => basic$8,
		columns: () => columns$8,
		dependencies: () => dependencies$3,
		filters: () => filters$8,
		general: () => general$8
	});
	var basic$8 = [
		{ field: "properties.element" },
		{ field: "properties.action" },
		{ line: true },
		{ field: "properties.user" },
		{ field: "properties.name" },
		{ field: "properties.ipAddress" },
		{ field: "properties.useDNS" },
		{ field: "properties.useIPv6" },
		{ line: true },
		{ field: "properties.dialFirst" },
		{ field: "properties.trayIcon" },
		{ field: "properties.showProgress" },
		{ field: "properties.showPassword" },
		{ field: "properties.showDomain" },
		{ field: "properties.redialCount" },
		{ field: "properties.redialPause" },
		{ field: "properties.idleDisconnect" },
		{ field: "properties.reconnect" },
		{ line: true },
		{ field: "properties.customSettings" },
		{ field: "properties.securePassword" },
		{ field: "properties.secureData" },
		{ field: "properties.useLogon" },
		{ field: "properties.vpnStrategy" },
		{ field: "properties.encryptionType" },
		{ line: true },
		{ field: "properties.eap" },
		{ field: "properties.pap" },
		{ field: "properties.spap" },
		{ field: "properties.chap" },
		{ field: "properties.msChap" },
		{ field: "properties.oldMsChap" },
		{ field: "properties.msChapV2" }
	];
	var general$8 = [
		{ field: "metadata.bypassErrors" },
		{ field: "metadata.userContext" },
		{ field: "metadata.removePolicy" },
		{ field: "properties.disabled" },
		{
			field: "metadata.desc",
			textarea: true
		}
	];
	var filters$8 = "general";
	var dependencies$3 = [
		{
			field: "properties.ipAddress",
			enabledWhen: [{
				source: "properties.action",
				notEquals: "delete"
			}]
		},
		{
			field: "properties.useDNS",
			enabledWhen: [{
				source: "properties.action",
				notEquals: "delete"
			}]
		},
		{
			field: "properties.useIPv6",
			enabledWhen: [{
				source: "properties.action",
				notEquals: "delete"
			}]
		},
		{
			field: "properties.dialFirst",
			enabledWhen: [{
				source: "properties.action",
				notEquals: "delete"
			}]
		},
		{
			field: "properties.trayIcon",
			enabledWhen: [{
				source: "properties.action",
				notEquals: "delete"
			}]
		},
		{
			field: "properties.eap",
			enabledWhen: [{
				source: "properties.customSettings",
				equals: true
			}]
		},
		{
			field: "properties.pap",
			enabledWhen: [{
				source: "properties.customSettings",
				equals: true
			}]
		},
		{
			field: "properties.spap",
			enabledWhen: [{
				source: "properties.customSettings",
				equals: true
			}]
		},
		{
			field: "properties.chap",
			enabledWhen: [{
				source: "properties.customSettings",
				equals: true
			}]
		},
		{
			field: "properties.msChap",
			enabledWhen: [{
				source: "properties.customSettings",
				equals: true
			}]
		},
		{
			field: "properties.oldMsChap",
			enabledWhen: [{
				source: "properties.customSettings",
				equals: true
			}, {
				source: "properties.msChap",
				equals: true
			}]
		},
		{
			field: "properties.msChapV2",
			enabledWhen: [{
				source: "properties.customSettings",
				equals: true
			}]
		}
	];
	var columns$8 = [
		{
			source: "name",
			labelKey: "columnName"
		},
		{
			source: "order",
			labelKey: "columnOrder"
		},
		{
			source: "field",
			field: "properties.action",
			labelKey: "columnAction",
			format: "action"
		},
		{
			source: "field",
			field: "properties.ipAddress",
			labelKey: "columnIpAddress"
		}
	];
	//#endregion
	//#region src/components/templates/preference/layouts/network-shares.js
	var network_shares_exports = /* @__PURE__ */ __exportAll({
		basic: () => basic$7,
		columns: () => columns$7,
		dependencies: () => dependencies$2,
		filters: () => filters$7,
		general: () => general$7
	});
	var basic$7 = [
		{ field: "properties.action" },
		{ line: true },
		{ field: "properties.name" },
		{ field: "properties.path" },
		{ line: true },
		{ field: "properties.allRegular" },
		{ field: "properties.allHidden" },
		{ field: "properties.allAdminDrive" },
		{ line: true },
		{ field: "properties.limitUsers" },
		{ field: "properties.userLimit" },
		{ field: "properties.abe" }
	];
	var general$7 = [
		{
			field: "properties.comment",
			textarea: true
		},
		{ field: "metadata.bypassErrors" },
		{ field: "metadata.userContext" },
		{ field: "metadata.removePolicy" },
		{ field: "properties.disabled" },
		{
			field: "metadata.desc",
			textarea: true
		}
	];
	var filters$7 = "general";
	var dependencies$2 = [
		{
			field: "properties.path",
			enabledWhen: [{
				source: "properties.action",
				notEquals: "delete"
			}]
		},
		{
			field: "properties.comment",
			enabledWhen: [{
				source: "properties.action",
				notEquals: "delete"
			}]
		},
		{
			field: "properties.allRegular",
			enabledWhen: [{
				source: "properties.action",
				in: ["update", "delete"]
			}]
		},
		{
			field: "properties.allHidden",
			enabledWhen: [{
				source: "properties.action",
				in: ["update", "delete"]
			}]
		},
		{
			field: "properties.allAdminDrive",
			enabledWhen: [{
				source: "properties.action",
				in: ["update", "delete"]
			}]
		},
		{
			field: "properties.limitUsers",
			enabledWhen: [{
				source: "properties.action",
				notEquals: "delete"
			}]
		},
		{
			field: "properties.userLimit",
			enabledWhen: [{
				source: "properties.action",
				notEquals: "delete"
			}, {
				source: "properties.limitUsers",
				equals: true
			}]
		},
		{
			field: "properties.abe",
			enabledWhen: [{
				source: "properties.action",
				notEquals: "delete"
			}]
		}
	];
	var columns$7 = [
		{
			source: "name",
			labelKey: "columnName"
		},
		{
			source: "order",
			labelKey: "columnOrder"
		},
		{
			source: "field",
			field: "properties.action",
			labelKey: "columnAction",
			format: "action"
		},
		{
			source: "field",
			field: "properties.path",
			labelKey: "columnPath"
		},
		{
			source: "field",
			field: "properties.userLimit",
			labelKey: "columnUserLimit"
		},
		{
			source: "field",
			field: "properties.abe",
			labelKey: "columnAbe"
		}
	];
	//#endregion
	//#region src/components/templates/preference/layouts/power-options.js
	var power_options_exports = /* @__PURE__ */ __exportAll({
		basic: () => basic$6,
		columns: () => columns$6,
		filters: () => filters$6,
		general: () => general$6
	});
	var basic$6 = [
		{ field: "properties.element" },
		{ field: "properties.action" },
		{ line: true },
		{ field: "properties.name" }
	];
	var general$6 = [];
	var filters$6 = "basic";
	var columns$6 = [
		{
			source: "name",
			labelKey: "columnName"
		},
		{
			source: "order",
			labelKey: "columnOrder"
		},
		{
			source: "field",
			field: "properties.action",
			labelKey: "columnAction",
			format: "action"
		}
	];
	//#endregion
	//#region src/components/templates/preference/layouts/printers.js
	var printers_exports = /* @__PURE__ */ __exportAll({
		basic: () => basic$5,
		columns: () => columns$5,
		filters: () => filters$5,
		general: () => general$5
	});
	var basic$5 = [
		{ field: "properties.element" },
		{ field: "properties.action" },
		{ line: true },
		{ field: "properties.path" },
		{ field: "properties.location" },
		{ line: true },
		{ field: "properties.default" },
		{ field: "properties.deleteAll" }
	];
	var general$5 = [
		{
			field: "properties.comment",
			textarea: true
		},
		{ field: "metadata.bypassErrors" },
		{ field: "metadata.userContext" },
		{ field: "metadata.removePolicy" },
		{ field: "properties.disabled" },
		{
			field: "metadata.desc",
			textarea: true
		}
	];
	var filters$5 = "general";
	var columns$5 = [
		{
			source: "name",
			labelKey: "columnName"
		},
		{
			source: "order",
			labelKey: "columnOrder"
		},
		{
			source: "field",
			field: "properties.action",
			labelKey: "columnAction",
			format: "action"
		},
		{
			source: "field",
			field: "properties.path",
			labelKey: "columnPath"
		},
		{
			source: "field",
			field: "properties.location",
			labelKey: "columnLocation"
		}
	];
	//#endregion
	//#region src/components/templates/preference/layouts/regional-options.js
	var regional_options_exports = /* @__PURE__ */ __exportAll({
		basic: () => basic$4,
		columns: () => columns$4,
		filters: () => filters$4,
		general: () => general$4
	});
	var basic$4 = [
		{ field: "properties.action" },
		{ line: true },
		{ field: "properties.systemLocale" },
		{ field: "properties.userLocale" },
		{ line: true },
		{ field: "properties.inputLocale" },
		{ field: "properties.userInputLocale" }
	];
	var general$4 = [
		{ field: "metadata.bypassErrors" },
		{ field: "metadata.userContext" },
		{ field: "metadata.removePolicy" },
		{
			field: "metadata.desc",
			textarea: true
		}
	];
	var filters$4 = "general";
	var columns$4 = [
		{
			source: "name",
			labelKey: "columnName"
		},
		{
			source: "order",
			labelKey: "columnOrder"
		},
		{
			source: "field",
			field: "properties.action",
			labelKey: "columnAction",
			format: "action"
		},
		{
			source: "field",
			field: "properties.systemLocale",
			labelKey: "columnSystemLocale"
		}
	];
	//#endregion
	//#region src/components/templates/preference/layouts/registry.js
	var registry_exports = /* @__PURE__ */ __exportAll({
		basic: () => basic$3,
		columns: () => columns$3,
		dependencies: () => dependencies$1,
		filters: () => filters$3,
		general: () => general$3
	});
	var basic$3 = [
		{ field: "properties.action" },
		{ line: true },
		{ field: "properties.hive" },
		{ field: "properties.key" },
		{ line: true },
		{ field: "properties.name" },
		{ field: "properties.type" },
		{ field: "properties.value" },
		{ line: true },
		{ field: "properties.default" },
		{ field: "properties.displayDecimal" },
		{ field: "properties.defaultValue" },
		{ field: "properties.bitfield" }
	];
	var general$3 = [
		{ field: "metadata.bypassErrors" },
		{ field: "metadata.userContext" },
		{ field: "metadata.removePolicy" },
		{ field: "properties.disabled" },
		{
			field: "metadata.desc",
			textarea: true
		}
	];
	var filters$3 = "general";
	var dependencies$1 = [
		{
			field: "properties.name",
			enabledWhen: [{
				source: "properties.default",
				notEquals: true
			}]
		},
		{
			field: "properties.type",
			enabledWhen: [{
				source: "properties.action",
				notEquals: "delete"
			}]
		},
		{
			field: "properties.value",
			enabledWhen: [{
				source: "properties.action",
				notEquals: "delete"
			}]
		},
		{
			field: "properties.displayDecimal",
			enabledWhen: [{
				source: "properties.action",
				notEquals: "delete"
			}]
		},
		{
			field: "properties.defaultValue",
			enabledWhen: [{
				source: "properties.action",
				notEquals: "delete"
			}]
		},
		{
			field: "properties.bitfield",
			enabledWhen: [{
				source: "properties.action",
				notEquals: "delete"
			}]
		}
	];
	var columns$3 = [
		{
			source: "name",
			labelKey: "columnName"
		},
		{
			source: "order",
			labelKey: "columnOrder"
		},
		{
			source: "field",
			field: "properties.action",
			labelKey: "columnAction",
			format: "action"
		},
		{
			source: "field",
			field: "properties.hive",
			labelKey: "columnHive"
		},
		{
			source: "field",
			field: "properties.key",
			labelKey: "columnKey"
		}
	];
	//#endregion
	//#region src/components/templates/preference/layouts/scheduled-tasks.js
	var scheduled_tasks_exports = /* @__PURE__ */ __exportAll({
		basic: () => basic$2,
		columns: () => columns$2,
		dependencies: () => dependencies,
		filters: () => filters$2,
		general: () => general$2
	});
	var basic$2 = [
		{ field: "properties.element" },
		{ field: "properties.action" },
		{ line: true },
		{ field: "properties.name" },
		{ field: "properties.appName" },
		{ field: "properties.args" },
		{ field: "properties.startIn" },
		{ field: "properties.comment" },
		{ line: true },
		{ field: "properties.runAs" },
		{ field: "properties.enabled" },
		{ field: "properties.deleteWhenDone" },
		{ line: true },
		{ field: "properties.startOnlyIfIdle" },
		{ field: "properties.stopOnIdleEnd" },
		{ field: "properties.noStartIfOnBatteries" },
		{ field: "properties.stopIfGoingOnBatteries" },
		{ field: "properties.systemRequired" },
		{ field: "properties.maxRunTime" },
		{ field: "properties.idleMinutes" },
		{ field: "properties.deadlineMinutes" }
	];
	var general$2 = [];
	var filters$2 = "basic";
	var dependencies = [{
		field: "properties.idleMinutes",
		enabledWhen: [{
			source: "properties.startOnlyIfIdle",
			equals: true
		}]
	}, {
		field: "properties.deadlineMinutes",
		enabledWhen: [{
			source: "properties.startOnlyIfIdle",
			equals: true
		}]
	}];
	var columns$2 = [
		{
			source: "name",
			labelKey: "columnName"
		},
		{
			source: "order",
			labelKey: "columnOrder"
		},
		{
			source: "field",
			field: "properties.action",
			labelKey: "columnAction",
			format: "action"
		},
		{
			source: "field",
			field: "properties.appName",
			labelKey: "columnApplication"
		}
	];
	//#endregion
	//#region src/components/templates/preference/layouts/services.js
	var services_exports = /* @__PURE__ */ __exportAll({
		basic: () => basic$1,
		columns: () => columns$1,
		filters: () => filters$1,
		general: () => general$1
	});
	var basic$1 = [
		{ field: "properties.action" },
		{ line: true },
		{ field: "properties.serviceName" },
		{ field: "properties.startupType" },
		{ field: "properties.serviceAction" },
		{ line: true },
		{ field: "properties.timeout" },
		{ field: "properties.accountName" },
		{ field: "properties.interact" },
		{ line: true },
		{ field: "properties.firstFailure" },
		{ field: "properties.secondFailure" },
		{ field: "properties.thirdFailure" },
		{ line: true },
		{ field: "properties.resetFailCountDelay" },
		{ field: "properties.restartServiceDelay" },
		{ field: "properties.restartComputerDelay" },
		{ field: "properties.restartComputerMessage" },
		{ line: true },
		{ field: "properties.program" },
		{ field: "properties.args" },
		{ field: "properties.append" }
	];
	var general$1 = [
		{ field: "metadata.bypassErrors" },
		{ field: "metadata.userContext" },
		{ field: "metadata.removePolicy" },
		{ field: "properties.disabled" },
		{
			field: "metadata.desc",
			textarea: true
		}
	];
	var filters$1 = "general";
	var columns$1 = [
		{
			source: "name",
			labelKey: "columnName"
		},
		{
			source: "order",
			labelKey: "columnOrder"
		},
		{
			source: "field",
			field: "properties.action",
			labelKey: "columnAction",
			format: "action"
		},
		{
			source: "field",
			field: "properties.startupType",
			labelKey: "columnStartupType"
		},
		{
			source: "field",
			field: "properties.serviceAction",
			labelKey: "columnServiceAction"
		}
	];
	//#endregion
	//#region src/components/templates/preference/layouts/start-menu.js
	var start_menu_exports = /* @__PURE__ */ __exportAll({
		basic: () => basic,
		columns: () => columns,
		filters: () => filters,
		general: () => general
	});
	var basic = [
		{ field: "properties.element" },
		{ field: "properties.action" },
		{ line: true },
		{ field: "properties.pinCCPN" },
		{ field: "properties.pinHelp" },
		{ field: "properties.pinNetwork" },
		{ field: "properties.pinSystem" },
		{ field: "properties.pinDefault" },
		{ field: "properties.largeMSC" }
	];
	var general = [
		{ field: "metadata.bypassErrors" },
		{ field: "metadata.userContext" },
		{ field: "metadata.removePolicy" },
		{
			field: "metadata.desc",
			textarea: true
		}
	];
	var filters = "general";
	var columns = [
		{
			source: "name",
			labelKey: "columnName"
		},
		{
			source: "order",
			labelKey: "columnOrder"
		},
		{
			source: "field",
			field: "properties.action",
			labelKey: "columnAction",
			format: "action"
		}
	];
	//#endregion
	//#region src/components/templates/preference/layouts/index.js
	var layouts_exports = /* @__PURE__ */ __exportAll({
		applications: () => applications_exports,
		control_panel: () => control_panel_exports,
		data_sources: () => data_sources_exports,
		devices: () => devices_exports,
		drives: () => drives_exports,
		environment_variables: () => environment_variables_exports,
		files: () => files_exports,
		folder_options: () => folder_options_exports,
		folders: () => folders_exports,
		ini_files: () => ini_files_exports,
		internet_settings: () => internet_settings_exports,
		local_users_and_groups: () => local_users_and_groups_exports,
		network_options: () => network_options_exports,
		network_shares: () => network_shares_exports,
		power_options: () => power_options_exports,
		printers: () => printers_exports,
		regional_options: () => regional_options_exports,
		registry: () => registry_exports,
		scheduled_tasks: () => scheduled_tasks_exports,
		services: () => services_exports,
		shortcuts: () => shortcuts_exports,
		start_menu: () => start_menu_exports
	});
	//#endregion
	//#region src/components/templates/preference/view/common.js
	var PREFERENCE_LAYOUTS$2 = layouts_exports;
	function pt(key) {
		return t("preferences.editor." + key);
	}
	function validationMessage(code) {
		if (code === "required") return pt("validationRequired");
		if (code === "invalid_number") return pt("validationInvalidNumber");
		if (code === "unsigned_byte_range") return pt("validationUnsignedByteRange");
		const targetingCodes = {
			invalid_date: "validationDate",
			invalid_time: "validationTime",
			invalid_ip: "validationIp",
			invalid_ipv6: "validationIpv6",
			invalid_mac: "validationMac",
			invalid_version: "validationVersion",
			invalid_guid: "validationGuid",
			invalid_range: "validationRange",
			invalid_value: "validationValue"
		};
		if (targetingCodes[code]) return pt(targetingCodes[code]);
		return pt("validationFixErrors");
	}
	function listFrom(result, key) {
		if (Array.isArray(result)) return result;
		return result && Array.isArray(result[key]) ? result[key] : [];
	}
	function parentCandidateLabel(candidate) {
		const depth = Math.max(0, Math.floor(Number(candidate && candidate.depth) || 0));
		let prefix = "";
		for (let index = 0; index < depth; index += 1) prefix += "\xA0\xA0";
		return prefix + String(candidate && candidate.label || "");
	}
	function scopeField(field, scope) {
		const result = clone$2(field);
		if (!result || result.id !== "metadata.userContext") return result;
		if (scope === "user") result.label = pt("userContext");
		else {
			result.hidden = true;
			result.editable = false;
		}
		return result;
	}
	function actionLabel(value) {
		const key = {
			create: "actionCreate",
			replace: "actionReplace",
			update: "actionUpdate",
			delete: "actionDelete"
		}[value];
		return key ? pt(key) : value === null || value === void 0 ? "" : String(value);
	}
	function itemFieldValue(item, fieldId) {
		if (!item || !fieldId) return "";
		if (Array.isArray(item.fields)) {
			for (let index = 0; index < item.fields.length; index++) if (item.fields[index] && item.fields[index].id === fieldId) return valuePayload(item.fields[index].value);
		}
		if (item.properties && typeof item.properties === "object") {
			const key = String(fieldId).indexOf("properties.") === 0 ? String(fieldId).slice(11) : String(fieldId);
			if (Object.prototype.hasOwnProperty.call(item.properties, key)) {
				const raw = item.properties[key];
				if (raw && typeof raw === "object" && "kind" in raw) return valuePayload(raw);
				return raw === null || raw === void 0 ? "" : String(raw);
			}
		}
		return "";
	}
	function tableColumns(kind) {
		const layout = PREFERENCE_LAYOUTS$2[kind];
		if (layout && Array.isArray(layout.columns) && layout.columns.length) return layout.columns;
		return null;
	}
	//#endregion
	//#region src/components/templates/preference/view/items-table.js
	/**
	* The items table of the preferences page and everything that feeds it: the list request, the per-item field cache
	* and the selection (which drives the info panel). The page's mutable state is `view`.
	* @param {any} context the page's state and operations (see renderPreferencesTemplate)
	*/
	function createItemsTable({ config, documentDto, infoPanel, item, itemFieldsCache, openForm, rootElement, setHeaderState, showPageError, view }) {
		function renderTable() {
			const tableSlot = rootElement.querySelector(".gpo-editor-preferences__table");
			if (!tableSlot) return;
			const heldFocus = tableSlot.contains(document.activeElement);
			tableSlot.innerHTML = "";
			if (!view.items.length) {
				tableSlot.appendChild(createElement("div", {
					className: "gpo-editor-empty",
					text: pt("emptyItems")
				}).getElement());
				if (view.tableNavigation) {
					view.tableNavigation.sync();
					if (heldFocus) view.tableNavigation.focusSelected();
				}
				return;
			}
			const columns = tableColumns(item.preferenceKind);
			const useTemplate = Boolean(columns);
			const headerCells = useTemplate ? columns.map(function(column) {
				return createElement("th", { text: pt(column.labelKey) });
			}) : [
				createElement("th", { text: pt("itemColumn") }),
				createElement("th", { text: pt("filtersColumn") }),
				createElement("th", { text: pt("actionsColumn") })
			];
			function buildDataCells(preferenceItem, index) {
				if (!useTemplate) return [createElement("td", { text: preferenceItem.label }), createElement("td", { text: preferenceItem.has_filters ? pt("yes") : pt("no") })];
				return columns.map(function(column) {
					let text = "";
					if (column.source === "name") text = preferenceItem.label;
					else if (column.source === "order") text = String(index + 1);
					else if (column.source === "field") {
						const value = cachedFieldValue(preferenceItem.identity, column.field);
						text = column.format === "action" ? actionLabel(value) : value === null || value === void 0 ? "" : String(value);
					}
					return createElement("td", { text });
				});
			}
			function buildActionsCell(preferenceItem) {
				return createElement("td", {
					className: "gpo-editor-preference-table__actions",
					children: [createElement("button", {
						className: "button",
						attrs: {
							type: "button",
							disabled: view.opening ? "disabled" : null
						},
						text: documentDto.editable ? t("header.edit") : pt("viewTitle"),
						events: { click: function(event) {
							event.stopPropagation();
							selectItem(preferenceItem.identity);
							openForm(view.selectedIdentity);
						} }
					})]
				});
			}
			const bodyRows = view.items.map(function(preferenceItem, index) {
				const selected = view.selectedIdentity !== null && equal(view.selectedIdentity, preferenceItem.identity);
				const cells = buildDataCells(preferenceItem, index);
				if (!useTemplate) cells.push(buildActionsCell(preferenceItem));
				const row = createElement("tr", {
					className: selected ? "active" : null,
					attrs: {
						tabindex: "-1",
						"data-preference-identity": cacheKey(preferenceItem.identity),
						"aria-selected": selected ? "true" : "false"
					},
					children: cells,
					events: {
						click: function() {
							selectItem(preferenceItem.identity);
							if (view.tableNavigation) view.tableNavigation.focusSelected();
						},
						dblclick: function() {
							if (view.modalState || view.opening || view.deleting) return;
							selectItem(preferenceItem.identity);
							openForm(view.selectedIdentity);
						}
					}
				});
				row.getElement().__preferenceIdentity = preferenceItem.identity;
				return row;
			});
			const table = createElement("table", {
				className: ["preference__table", "gpo-catalog-table"],
				children: [createElement("thead", { children: [createElement("tr", { children: headerCells })] }), createElement("tbody", { children: bodyRows })]
			});
			tableSlot.appendChild(table.getElement());
			if (view.tableNavigation) {
				view.tableNavigation.sync();
				if (heldFocus) view.tableNavigation.focusSelected();
			}
		}
		function selectItem(identity) {
			view.selectedIdentity = clone$2(identity);
			Array.prototype.forEach.call(rootElement.querySelectorAll("[data-preference-identity]"), function(row) {
				const selected = equal(row.__preferenceIdentity, view.selectedIdentity);
				row.classList.toggle("active", selected);
				row.setAttribute("aria-selected", selected ? "true" : "false");
			});
			if (view.tableNavigation) view.tableNavigation.sync();
			setHeaderState();
			infoPanel.request(view.selectedIdentity);
		}
		function focusTable() {
			if (!view.disposed && (typeof config.isCurrent !== "function" || config.isCurrent()) && view.tableNavigation) view.tableNavigation.focusSelected();
		}
		function cacheKey(identity) {
			return JSON.stringify(identity);
		}
		function cachedFieldValue(identity, fieldId) {
			const fields = itemFieldsCache.get(cacheKey(identity));
			if (!fields) return "";
			return itemFieldValue({ fields }, fieldId);
		}
		function scheduleTableRefresh() {
			if (view.tableRefreshScheduled) return;
			view.tableRefreshScheduled = true;
			const run = function() {
				view.tableRefreshScheduled = false;
				if (typeof config.isCurrent === "function" && !config.isCurrent()) return;
				renderTable();
			};
			if (typeof window !== "undefined" && typeof window.requestAnimationFrame === "function") window.requestAnimationFrame(run);
			else setTimeout(run, 16);
		}
		function ensureItemFields(identity) {
			const key = cacheKey(identity);
			if (itemFieldsCache.has(key)) return Promise.resolve(itemFieldsCache.get(key));
			const startedGeneration = view.fieldsRequestId;
			return preferenceShow(item.scope, item.preferenceKind, clone$2(identity)).then(function(response) {
				if (startedGeneration !== view.fieldsRequestId) return null;
				const fields = clone$2(response.fields || response.new_item_fields || []).map(function(field) {
					return scopeField(field, item.scope);
				});
				itemFieldsCache.set(key, fields);
				return fields;
			});
		}
		function prefetchTableFields() {
			const generation = ++view.fieldsRequestId;
			view.items.forEach(function(preferenceItem) {
				if (preferenceItem.identity === null || preferenceItem.identity === void 0) return;
				if (itemFieldsCache.has(cacheKey(preferenceItem.identity))) return;
				ensureItemFields(preferenceItem.identity).then(function(fields) {
					if (!fields) return;
					if (generation !== view.fieldsRequestId) return;
					if (typeof config.isCurrent === "function" && !config.isCurrent()) return;
					scheduleTableRefresh();
				});
			});
		}
		function invalidateCachedFields(identity) {
			itemFieldsCache.delete(cacheKey(identity));
			view.fieldsRequestId += 1;
		}
		async function loadItems() {
			const requestId = ++view.itemsRequestId;
			try {
				const response = await preferenceItems(item.scope, item.preferenceKind);
				if (requestId !== view.itemsRequestId || typeof config.isCurrent === "function" && !config.isCurrent()) return;
				view.items = listFrom(response, "items");
				if (view.selectedIdentity !== null && !view.items.some(function(entry) {
					return equal(entry.identity, view.selectedIdentity);
				})) view.selectedIdentity = null;
				const errorSlot = rootElement.querySelector(".gpo-editor-preferences__error");
				if (errorSlot) errorSlot.innerHTML = "";
				renderTable();
				setHeaderState();
				prefetchTableFields();
				if (view.selectedIdentity !== null) infoPanel.request(view.selectedIdentity);
				else infoPanel.reset();
			} catch (error) {
				if (requestId !== view.itemsRequestId || typeof config.isCurrent === "function" && !config.isCurrent()) return;
				showPageError(error);
			}
		}
		return {
			renderTable,
			selectItem,
			focusTable,
			cacheKey,
			cachedFieldValue,
			scheduleTableRefresh,
			ensureItemFields,
			prefetchTableFields,
			invalidateCachedFields,
			loadItems
		};
	}
	//#endregion
	//#region src/components/templates/preference/view/form-lifecycle.js
	/**
	* Closing the preference form: the discard question for unsaved changes and the removal of the form's dialogs from
	* the shared host. `closeForm(force, action)` returns false when the form stays open (busy or waiting for the answer).
	* @param {any} context the page's state and operations (see renderPreferencesTemplate)
	*/
	function createFormLifecycle({ config, rootElement, view, focusTable, setHeaderState }) {
		function showDiscardModal(action) {
			if (view.discardModal) return;
			view.pendingDiscard = { action };
			if (view.modalState && view.modalState.formElement) {
				view.modalState.formElement.classList.add("gpo-editor-preference-form--confirming");
				if (view.modalState.formElement.closest("[data-dialog-host]")) {
					const targettingModal = view.modalState.formElement.closest("[data-dialog-host]").parentNode.querySelector(".targetting__modal");
					if (targettingModal) targettingModal.classList.add("gpo-editor-preference-form--confirming");
				}
			}
			view.discardModal = open$3(config.modalHost || rootElement, {
				message: pt(action === "cancel" ? "confirmCancelDiscard" : "confirmCloseDiscard"),
				onCancel: function() {
					handleDiscardModalChoice(false);
				},
				onConfirm: function() {
					handleDiscardModalChoice(true);
				}
			});
		}
		function hideDiscardModal() {
			if (view.discardModal) {
				view.discardModal.close();
				view.discardModal = null;
			}
			const confirmingForms = (config.modalHost || rootElement).querySelectorAll(".gpo-editor-preference-form--confirming");
			Array.prototype.forEach.call(confirmingForms, function(formElement) {
				formElement.classList.remove("gpo-editor-preference-form--confirming");
			});
		}
		function handleDiscardModalChoice(confirmed) {
			const pending = view.pendingDiscard;
			view.pendingDiscard = null;
			hideDiscardModal();
			if (!confirmed || !pending) return;
			closeForm(true, pending.action);
		}
		function closeHostModals(host) {
			host.classList.remove("active");
			const modals = Array.prototype.slice.call(host.children);
			modals.forEach(function(element) {
				Array.prototype.forEach.call(element.querySelectorAll("[data-dialog].active"), function(dialog) {
					dialog.classList.remove("active");
				});
			});
			setTimeout(function() {
				modals.forEach(function(element) {
					if (!element.querySelector("[data-dialog].active") && element.parentNode === host) host.removeChild(element);
				});
			}, 500);
		}
		function closeForm(force, action) {
			const state = view.modalState;
			if (state && (state.saving || state.reconciling) && action !== "saved" && action !== "cleanup") return false;
			if (!force && state && state.formState.dirty) {
				if (view.pendingDiscard) return false;
				showDiscardModal(action);
				return false;
			}
			view.pendingDiscard = null;
			hideDiscardModal();
			view.formRequestId += 1;
			const host = config.modalHost || rootElement.querySelector(".gpo-editor-preferences__modal-host");
			if (host) closeHostModals(host);
			view.modalState = null;
			setHeaderState();
			if (action !== "cleanup" && action !== "navigation") focusTable();
			return true;
		}
		return { closeForm };
	}
	//#endregion
	//#region src/components/templates/preference/view/form-state.js
	function formInteractiveElements(state) {
		const elements = [];
		const roots = [state.formElement];
		if (state.formElement.closest("[data-dialog-host]")) {
			const targettingModal = state.formElement.closest("[data-dialog-host]").parentNode.querySelector(".targetting__modal");
			if (targettingModal) roots.push(targettingModal);
		}
		roots.forEach(function(root) {
			[
				"input",
				"select",
				"textarea",
				"button"
			].forEach(function(selector) {
				Array.prototype.forEach.call(root.querySelectorAll(selector), function(element) {
					if (elements.indexOf(element) === -1) elements.push(element);
				});
			});
		});
		return elements;
	}
	function isRefreshSafeAction(state, element) {
		return state.closeButtons.indexOf(element) !== -1 || Boolean(element.hasAttribute && element.hasAttribute("data-editor-status-action"));
	}
	function syncFormBusy(state) {
		if (!state) return;
		const busy = Boolean(state.saving || state.reconciling);
		const elements = formInteractiveElements(state);
		if (busy) elements.forEach(function(element) {
			if (!state.busyDisabledStates.has(element)) state.busyDisabledStates.set(element, Boolean(element.disabled));
			element.disabled = true;
		});
		else {
			state.busyDisabledStates.forEach(function(disabled, element) {
				element.disabled = disabled;
			});
			state.busyDisabledStates.clear();
		}
		const refreshLocked = Boolean(state.requiresRefresh);
		state.formState.busy = busy || refreshLocked;
		state.formElement.classList.toggle("gpo-editor-preference-form--busy", busy);
		state.formElement.classList.toggle("gpo-editor-preference-form--refresh-required", refreshLocked);
		if (busy) state.formElement.setAttribute("aria-busy", "true");
		else state.formElement.removeAttribute("aria-busy");
		if (!busy && refreshLocked) formInteractiveElements(state).forEach(function(element) {
			element.disabled = !isRefreshSafeAction(state, element);
		});
		(state.closeButtons || []).forEach(function(button) {
			button.disabled = busy;
		});
		if (state.saveButton) state.saveButton.disabled = Boolean(busy || state.requiresRefresh || state.blockedDescriptors);
	}
	function setNameError(state, message) {
		if (!state.nameField || !state.nameError || !state.nameInput) return;
		state.nameField.classList.toggle("gpo-editor-field--error", Boolean(message));
		state.nameError.textContent = message || "";
		if (message) state.nameInput.setAttribute("aria-invalid", "true");
		else state.nameInput.removeAttribute("aria-invalid");
	}
	function clearFormErrors(state) {
		state.controls.forEach(function(control) {
			control.setError("");
		});
		setNameError(state, "");
		state.formElement.classList.remove("gpo-editor-preference-form--invalid");
		state.validationSlot.textContent = "";
		state.errorSlot.innerHTML = "";
	}
	function markServerFieldError(state, error) {
		if (!error || !error.field) return;
		const field = String(error.field);
		const message = error.message || pt("validationFixErrors");
		if (field === "name" || field.indexOf("name") !== -1) setNameError(state, message);
		state.controlsById.forEach(function(controls, id) {
			if (field === id || field.indexOf(id) !== -1) controls.forEach(function(control) {
				control.setError(message);
			});
		});
	}
	//#endregion
	//#region src/components/templates/preference/view/page-actions.js
	/**
	* The page's actions that talk to the server and report the outcome: saving the form, deleting the selected item,
	* the recovery (reconcile) path and the error panels of the page and of the form.
	* @param {any} context the page's state and operations (see renderPreferencesTemplate)
	*/
	function createPageActions({ cacheKey, closeForm, config, deleteButton, documentDto, focusTable, invalidateCachedFields, item, loadItems, ownsHeader, renderTable, rootElement, setHeaderState, view }) {
		function recoveryConflict(response) {
			const recovery = response && response.recovery;
			if (!recovery || recovery.kind !== "conflict") return null;
			const error = /* @__PURE__ */ new Error("Preference publication reconciliation is still conflicted.");
			error.category = "publication_conflict";
			error.details = recovery.conflict || null;
			return error;
		}
		async function reconcilePage(event) {
			if (event && event.currentTarget) event.currentTarget.disabled = true;
			try {
				const conflict = recoveryConflict(await reconcile());
				if (conflict) throw conflict;
				await loadItems();
			} catch (error) {
				showPageError(error);
			} finally {
				if (event && event.currentTarget) event.currentTarget.disabled = false;
			}
		}
		function showPageError(error) {
			const slot = rootElement.querySelector(".gpo-editor-preferences__error");
			if (!slot) return;
			slot.innerHTML = "";
			slot.appendChild(renderError(error, {
				onRefresh: loadItems,
				onReconcile: reconcilePage
			}).getElement());
		}
		function renderFormError(state, error) {
			if (view.modalState !== state) return;
			state.errorSlot.innerHTML = "";
			const category = errorCategory(error).replace(/-/g, "_");
			const actions = { onReconcile: async function(event) {
				if (state.reconciling || state.saving) return;
				const button = event && event.currentTarget;
				if (button) button.disabled = true;
				state.reconciling = true;
				syncFormBusy(state);
				try {
					const conflict = recoveryConflict(await reconcile());
					if (conflict) throw conflict;
					if (view.modalState === state) {
						state.requiresRefresh = true;
						renderReconcileSuccess(state);
						await loadItems();
					}
				} catch (reconcileError) {
					renderFormError(state, reconcileError);
				} finally {
					state.reconciling = false;
					syncFormBusy(state);
					if (button && view.modalState === state) button.disabled = false;
				}
			} };
			if (category === "storage_conflict" || category === "publication_conflict" || category === "not_found") actions.onRefresh = function() {
				if (!window.confirm(pt("confirmRefreshDiscard"))) return;
				closeForm(true);
				loadItems();
			};
			state.errorSlot.appendChild(renderError(error, actions).getElement());
			markServerFieldError(state, error);
			syncFormBusy(state);
		}
		function renderReconcileSuccess(state) {
			if (view.modalState !== state) return;
			state.errorSlot.innerHTML = "";
			state.errorSlot.appendChild(createElement("div", {
				className: ["gpo-editor-preference-notice", "gpo-editor-preference-notice--info"],
				attrs: { role: "status" },
				children: [createElement("span", { text: pt("reconcileSucceededRefresh") }), createElement("button", {
					className: "button",
					attrs: {
						type: "button",
						"data-editor-status-action": ""
					},
					text: pt("refresh"),
					events: { click: function() {
						if (!window.confirm(pt("confirmRefreshDiscard"))) return;
						closeForm(true, "refresh");
						loadItems();
					} }
				})]
			}).getElement());
			syncFormBusy(state);
		}
		async function saveForm() {
			if (!view.modalState || view.modalState.readonly) return true;
			const state = view.modalState;
			if (state.saving || state.reconciling || state.requiresRefresh || state.blockedDescriptors) return false;
			clearFormErrors(state);
			const draftFields = state.controls.map(function(control) {
				return {
					id: control.id,
					value: control.read()
				};
			});
			const filterResult = state.formState.readFilterResult();
			const result = buildPreferenceRequest({
				creating: state.creating,
				identity: state.identity,
				descriptors: state.descriptors,
				fields: draftFields,
				name: state.nameInput ? state.nameInput.value : null,
				originalName: state.originalName,
				parent: state.parentSelect ? preferenceParentIdentity(state.parentCandidates, state.parentSelect.value) : null,
				filters: filterResult.operations,
				validationExemptions: state.dependencyDisabledIds || []
			});
			const errors = result.errors.concat(filterResult.errors || []);
			if (errors.length) {
				state.formElement.classList.add("gpo-editor-preference-form--invalid");
				state.validationSlot.textContent = pt("validationFixErrors");
				let firstControl = null;
				errors.forEach(function(error) {
					if (error.path) return;
					if (error.id === "name") {
						setNameError(state, validationMessage(error.code));
						if (!firstControl && state.nameInput) firstControl = state.nameInput;
						return;
					}
					(state.controlsById.get(error.id) || []).forEach(function(control) {
						control.setError(validationMessage(error.code));
						if (!firstControl) firstControl = control;
					});
				});
				if (firstControl && typeof firstControl.focus === "function") firstControl.focus();
				return false;
			}
			if (!result.request) {
				closeForm(true, "saved");
				return true;
			}
			state.saving = true;
			syncFormBusy(state);
			state.saveButton.textContent = pt("saving");
			try {
				const response = state.creating ? await preferenceCreate(item.scope, item.preferenceKind, result.request) : await preferenceUpdate(item.scope, item.preferenceKind, result.request);
				const conflict = recoveryConflict(response);
				if (conflict) throw conflict;
				if (!state.creating) invalidateCachedFields(state.identity);
				closeForm(true, "saved");
				await loadItems();
				if (typeof config.onSaved === "function") config.onSaved(response);
				return true;
			} catch (error) {
				renderFormError(state, error);
				return false;
			} finally {
				state.saving = false;
				if (view.modalState === state) {
					state.saveButton.textContent = pt("save");
					syncFormBusy(state);
				}
			}
		}
		async function deleteSelected() {
			if (!documentDto.editable || view.selectedIdentity === null || view.modalState || view.opening || view.deleting || view.disposed) return;
			if (!window.confirm(pt("confirmDelete"))) return;
			const identity = clone$2(view.selectedIdentity);
			const before = view.items.map(function(entry) {
				return cacheKey(entry.identity);
			});
			let removed = false;
			view.deleting = true;
			setHeaderState();
			if (deleteButton) deleteButton.disabled = true;
			try {
				const response = await preferenceDelete(item.scope, item.preferenceKind, identity);
				invalidateCachedFields(identity);
				await loadItems();
				if (view.disposed || typeof config.isCurrent === "function" && !config.isCurrent()) return;
				const next = neighbor(before, [cacheKey(identity)], view.items.map(function(entry) {
					return cacheKey(entry.identity);
				}));
				const survivor = view.items.find(function(entry) {
					return cacheKey(entry.identity) === next;
				});
				view.selectedIdentity = survivor ? clone$2(survivor.identity) : null;
				renderTable();
				setHeaderState();
				removed = true;
				if (typeof config.onSaved === "function") config.onSaved(response);
			} catch (error) {
				showPageError(error);
			} finally {
				view.deleting = false;
				setHeaderState();
				if (deleteButton && ownsHeader()) deleteButton.disabled = false;
				if (removed && !view.disposed && (typeof config.isCurrent !== "function" || config.isCurrent())) focusTable();
			}
		}
		return {
			recoveryConflict,
			reconcilePage,
			showPageError,
			renderFormError,
			renderReconcileSuccess,
			saveForm,
			deleteSelected
		};
	}
	function copy(value) {
		return clone$2(value);
	}
	function pathKey(path) {
		return JSON.stringify(path);
	}
	function comparePaths(left, right) {
		for (let index = 0; index < Math.min(left.length, right.length); index++) if (left[index] !== right[index]) return left[index] - right[index];
		return left.length - right.length;
	}
	function validIndex(index, length) {
		return Number.isInteger(index) && index >= 0 && index <= length;
	}
	function flattenRoots(roots) {
		const result = [];
		function visit(nodes, parentPath) {
			nodes.forEach(function(node, index) {
				const path = parentPath.concat(index);
				result.push({
					node,
					path,
					depth: path.length - 1
				});
				visit(node.children, path);
			});
		}
		visit(roots, []);
		return result;
	}
	function locate(roots, id) {
		let result = null;
		function visit(nodes, parent, parentPath) {
			for (let index = 0; index < nodes.length && !result; index++) {
				const path = parentPath.concat(index);
				const node = nodes[index];
				if (node.id === id) result = {
					node,
					siblings: nodes,
					index,
					parent,
					path
				};
				else visit(node.children, node, path);
			}
		}
		visit(roots, null, []);
		return result;
	}
	function subtreeCollectionHeight(node) {
		return (node.supports_children ? 1 : 0) + node.children.reduce(function(height, child) {
			return Math.max(height, subtreeCollectionHeight(child));
		}, 0);
	}
	function collectionDepth(roots, path) {
		let nodes = roots;
		let depth = 0;
		path.forEach(function(index) {
			const node = nodes[index];
			if (node.supports_children) depth++;
			nodes = node.children;
		});
		return depth;
	}
	function contains(node, id) {
		return node.id === id || node.children.some(function(child) {
			return contains(child, id);
		});
	}
	function inventory(showResult) {
		const result = /* @__PURE__ */ new Map();
		const raw = showResult.filter_fields || [];
		if (Array.isArray(raw)) raw.forEach(function(entry) {
			if (entry && Array.isArray(entry.path)) result.set(pathKey(entry.path), {
				fields: entry.fields || [],
				available: entry.available !== false
			});
		});
		else if (raw && typeof raw === "object") Object.keys(raw).forEach(function(key) {
			result.set(key, {
				fields: raw[key] || [],
				available: true
			});
		});
		return result;
	}
	function defaults(showResult, kind) {
		const raw = showResult.new_filter_fields || {};
		if (Array.isArray(raw)) {
			const entry = raw.find(function(candidate) {
				return candidate.kind === kind;
			});
			if (entry) return entry.fields || [];
		} else if (raw[kind]) return raw[kind];
		const descriptor = (showResult.filter_kinds || []).find(function(candidate) {
			return candidate.kind === kind;
		});
		return descriptor ? descriptor.fields || [] : [];
	}
	var Draft = class Draft {
		roots;
		_showResult;
		_kinds;
		_original;
		_nextId;
		constructor(showResult, restored) {
			this._showResult = copy(showResult || {});
			this._kinds = new Map((this._showResult.filter_kinds || []).map(function(kind) {
				return [kind.kind, kind];
			}));
			if (restored) {
				this.roots = copy(restored.roots);
				this._original = copy(restored.original);
				this._nextId = restored.nextId;
				return;
			}
			this.roots = [];
			this._nextId = 1;
			const fieldsByPath = inventory(this._showResult);
			const nodesByPath = /* @__PURE__ */ new Map();
			const self = this;
			copy(this._showResult.filters || []).sort(function(left, right) {
				return comparePaths(left.path || [], right.path || []);
			}).forEach(function(filter) {
				const path = filter.path;
				if (!Array.isArray(path) || !path.length || !path.every(function(index) {
					return Number.isInteger(index) && index >= 0;
				}) || nodesByPath.has(pathKey(path))) throw new Error("Invalid targeting filter snapshot");
				const descriptor = fieldsByPath.get(pathKey(path)) || {
					fields: filter.fields || [],
					available: Boolean(filter.kind)
				};
				const node = {
					id: "filter-" + self._nextId++,
					originalPath: copy(path),
					kind: filter.kind || null,
					element_name: filter.element_name || "",
					label: filter.label || filter.kind || filter.element_name || "",
					detail: filter.detail || "",
					combine: filter.combine,
					negate: filter.negate,
					hidden: filter.hidden,
					supports_children: Boolean(filter.supports_children),
					available: descriptor.available !== false && Boolean(filter.kind),
					fields: copy(descriptor.fields || []),
					children: []
				};
				const parent = path.length > 1 ? nodesByPath.get(pathKey(path.slice(0, -1))) : null;
				const siblings = parent ? parent.children : self.roots;
				if (path.length > 1 && !parent || path[path.length - 1] !== siblings.length) throw new Error("Invalid targeting filter snapshot");
				siblings.push(node);
				nodesByPath.set(pathKey(path), node);
			});
			this._original = copy(this.roots);
		}
		find(id) {
			const found = locate(this.roots, id);
			return found ? found.node : null;
		}
		clone() {
			return new Draft(this._showResult, {
				roots: this.roots,
				original: this._original,
				nextId: this._nextId
			});
		}
		flatten() {
			return flattenRoots(this.roots);
		}
		add(kind, parentId, index) {
			const descriptor = this._kinds.get(kind);
			const parent = parentId === null || parentId === void 0 ? null : locate(this.roots, parentId);
			if (!descriptor || parentId !== null && parentId !== void 0 && !parent || parent && !parent.node.supports_children) return null;
			const siblings = parent ? parent.node.children : this.roots;
			const position = index === void 0 || index === null ? siblings.length : index;
			if (!validIndex(position, siblings.length) || (parent ? collectionDepth(this.roots, parent.path) : 0) + (descriptor.supports_children ? 1 : 0) > 64) return null;
			const node = {
				id: "filter-" + this._nextId++,
				originalPath: null,
				kind,
				element_name: descriptor.element_name || "",
				label: descriptor.label || kind,
				detail: "",
				supports_children: Boolean(descriptor.supports_children),
				available: true,
				fields: copy(defaults(this._showResult, kind)),
				children: []
			};
			siblings.splice(position, 0, node);
			return node;
		}
		remove(id) {
			const found = locate(this.roots, id);
			if (!found) return false;
			found.siblings.splice(found.index, 1);
			return true;
		}
		/** Both identities are stable; index addresses destination siblings after source removal. */
		move(id, parentId, index) {
			const source = locate(this.roots, id);
			const parent = parentId === null || parentId === void 0 ? null : locate(this.roots, parentId);
			if (!source || parentId !== null && parentId !== void 0 && !parent || parent && (!parent.node.supports_children || contains(source.node, parentId))) return false;
			const siblings = parent ? parent.node.children : this.roots;
			const length = siblings.length - (siblings === source.siblings ? 1 : 0);
			const position = index === void 0 || index === null ? length : index;
			if (!validIndex(position, length) || (parent ? collectionDepth(this.roots, parent.path) : 0) + subtreeCollectionHeight(source.node) > 64) return false;
			if (siblings === source.siblings && position === source.index) return false;
			source.siblings.splice(source.index, 1);
			siblings.splice(position, 0, source.node);
			return true;
		}
		updateFields(id, fields) {
			const node = this.find(id);
			if (!node || !node.available || !Array.isArray(fields)) return false;
			const values = new Map(fields.map(function(field) {
				return [field.id, field.value];
			}));
			let changed = false;
			node.fields = node.fields.map(function(field) {
				if (!field.editable || !values.has(field.id) || equal(field.value, values.get(field.id))) return field;
				changed = true;
				return Object.assign({}, field, { value: copy(values.get(field.id)) });
			});
			return changed;
		}
		/** Replacing a kind is an intentional new node; its former descendants are discarded. */
		replace(id, kind) {
			const source = locate(this.roots, id);
			if (!source || !this._kinds.has(kind)) return null;
			const node = this.add(kind, source.parent ? source.parent.id : null, source.index);
			if (!node) return null;
			this.remove(id);
			return node;
		}
		compile(options) {
			const opts = options || {};
			const desired = this.flatten();
			const desiredById = new Map(desired.map(function(entry) {
				return [entry.node.id, entry.node];
			}));
			const wanted = new Set(desired.map(function(entry) {
				return entry.node.id;
			}));
			const wantedParents = /* @__PURE__ */ new Map();
			function rememberParents(nodes, parentId) {
				nodes.forEach(function(node) {
					wantedParents.set(node.id, parentId);
					rememberParents(node.children, node.id);
				});
			}
			rememberParents(this.roots, null);
			const errors = [];
			const roots = this.roots;
			desired.forEach(function(entry) {
				const node = entry.node;
				if (collectionDepth(roots, entry.path) > 64) errors.push({
					id: node.id,
					fieldId: null,
					code: "max_depth"
				});
				if (!node.available) return;
				const duplicates = preferenceFieldIds(node.fields).duplicates;
				duplicates.forEach(function(id) {
					errors.push({
						id: node.id,
						fieldId: id,
						code: "duplicate_descriptor"
					});
				});
				const specificErrors = typeof opts.validateNode === "function" ? opts.validateNode(node) : null;
				if (Array.isArray(specificErrors)) {
					specificErrors.forEach(function(error) {
						errors.push({
							id: node.id,
							fieldId: error.fieldId,
							code: error.code
						});
					});
					return;
				}
				node.fields.forEach(function(field) {
					if (!field.editable || duplicates.indexOf(field.id) !== -1) return;
					const code = validatePreferenceField(field, field.value);
					if (code) errors.push({
						id: node.id,
						fieldId: field.id,
						code
					});
				});
			});
			if (errors.length) return {
				operations: [],
				errors
			};
			const working = copy(this._original);
			const originalById = new Map(flattenRoots(this._original).map(function(entry) {
				return [entry.node.id, entry.node];
			}));
			const operations = [];
			function removeAt(found) {
				operations.push({
					op: "remove",
					path: copy(found.path)
				});
				found.siblings.splice(found.index, 1);
			}
			function moveAt(found, parentId, index) {
				const parent = parentId === null ? null : locate(working, parentId);
				const destination = parent ? parent.node.children : working;
				operations.push({
					op: "move",
					source_path: copy(found.path),
					collection_path: parent ? copy(parent.path) : [],
					index
				});
				found.siblings.splice(found.index, 1);
				destination.splice(index, 0, found.node);
			}
			function hasWanted(node) {
				return wanted.has(node.id) || node.children.some(hasWanted);
			}
			function prune(nodes) {
				nodes.slice().forEach(function(node) {
					if (!hasWanted(node)) removeAt(locate(working, node.id));
					else prune(node.children);
				});
			}
			prune(working);
			function detachDepartingDescendants(source) {
				flattenRoots(source.node.children).reverse().forEach(function(entry) {
					if (!wanted.has(entry.node.id)) return;
					const found = locate(working, entry.node.id);
					if (found.parent && wantedParents.get(found.node.id) !== found.parent.id) moveAt(found, null, working.length);
				});
			}
			function reconcile(nodes, parentId) {
				nodes.forEach(function(node, index) {
					let found = locate(working, node.id);
					const parent = parentId === null ? null : locate(working, parentId);
					const siblings = parent ? parent.node.children : working;
					if (!found) {
						operations.push({
							op: "insert",
							collection_path: parent ? copy(parent.path) : [],
							index,
							filter_kind: node.kind,
							fields: preferenceFieldEdits(node.fields, node.fields, false)
						});
						const inserted = copy(node);
						inserted.children = [];
						siblings.splice(index, 0, inserted);
					} else if (found.siblings !== siblings || found.index !== index) {
						if ((parent ? collectionDepth(working, parent.path) : 0) + subtreeCollectionHeight(found.node) > 64) {
							detachDepartingDescendants(found);
							found = locate(working, node.id);
						}
						moveAt(found, parentId, index);
					}
					reconcile(node.children, node.id);
				});
			}
			reconcile(this.roots, null);
			prune(working);
			flattenRoots(working).forEach(function(entry) {
				const original = originalById.get(entry.node.id);
				const node = desiredById.get(entry.node.id);
				if (!original || !node || !node.available) return;
				const fields = preferenceFieldEdits(original.fields, node.fields, true);
				if (fields.length) operations.push({
					op: "edit",
					path: copy(entry.path),
					fields
				});
			});
			return {
				operations,
				errors: []
			};
		}
	};
	var create = function(showResult) {
		return new Draft(showResult);
	};
	//#endregion
	//#region src/components/templates/preference/targeting-presentations.js
	/**
	* Presentation-only adapters for the 29 native item-level targeting kinds.
	*
	* Tokens and numeric widths follow the active libadmix/gpreface schemas. They
	* are not new persistence types: selectors retain each native field envelope.
	* Sources: MS-GPPREF 2.2.1.22 and Appendix A, plus the GPMC targeting help.
	*/
	function pair(en, ru) {
		return [en, ru];
	}
	var kinds = {
		battery: pair("Battery", "Наличие батареи"),
		computer: pair("Computer name", "Имя компьютера"),
		cpu: pair("CPU speed", "Скорость ЦП"),
		date: pair("Date match", "Сопоставление дат"),
		disk: pair("Disk space", "Место на диске"),
		domain: pair("Domain", "Домен"),
		dun: pair("Network connection", "Сетевое подключение"),
		file: pair("File match", "Соответствие файлов"),
		ip_range: pair("IP address range", "Диапазон IP-адресов"),
		language: pair("Language", "Язык"),
		ldap: pair("LDAP query", "Запрос LDAP"),
		mac_range: pair("MAC address range", "Диапазон MAC-адресов"),
		msi: pair("MSI query", "Запрос MSI"),
		org_unit: pair("Organizational unit", "Подразделение"),
		pcmcia: pair("PCMCIA present", "Присутствие PCMCIA"),
		portable: pair("Portable computer", "Переносной компьютер"),
		proc_mode: pair("Processing mode", "Режим обработки"),
		ram: pair("RAM", "Оперативная память"),
		run_once: pair("Run once", "Однократное выполнение"),
		site: pair("Site", "Сайт"),
		terminal: pair("Terminal session", "Терминальный сеанс"),
		time: pair("Time range", "Диапазон времени"),
		user: pair("User", "Пользователь"),
		variable: pair("Environment variable", "Переменная среды"),
		os: pair("Operating system", "Операционная система"),
		registry: pair("Registry match", "Сопоставление реестра"),
		wmi: pair("WMI query", "Запрос WMI"),
		group: pair("Security group", "Группа безопасности"),
		collection: pair("Collection", "Коллекция")
	};
	var fields = {
		battery: {},
		computer: {
			type: pair("Name type", "Тип имени"),
			name: pair("Computer name", "Имя компьютера")
		},
		cpu: { speedMHz: pair("Minimum CPU speed (MHz)", "Минимальная скорость ЦП (МГц)") },
		date: {
			period: pair("Period", "Период"),
			dow: pair("Day of week", "День недели"),
			day: pair("Day of month", "Число месяца"),
			month: pair("Month", "Месяц"),
			year: pair("Year", "Год")
		},
		disk: {
			drive: pair("Drive", "Диск"),
			freeSpace: pair("Minimum free space (KB)", "Минимальное свободное место (КБ)")
		},
		domain: {
			name: pair("Domain name", "Имя домена"),
			userContext: pair("Context", "Контекст")
		},
		dun: { type: pair("Connection type", "Тип подключения") },
		file: {
			path: pair("Path", "Путь"),
			type: pair("Match type", "Тип соответствия"),
			folder: pair("Match a folder", "Проверять папку"),
			min: pair("Minimum version", "Минимальная версия"),
			max: pair("Maximum version", "Максимальная версия"),
			gte: pair("Include minimum version", "Включая минимальную версию"),
			lte: pair("Include maximum version", "Включая максимальную версию")
		},
		ip_range: {
			useIPv6: pair("Use IPv6", "Использовать IPv6"),
			min: pair("First IP address", "Начальный IP-адрес"),
			max: pair("Last IP address", "Конечный IP-адрес")
		},
		language: {
			languageLocale: pair("Language", "Язык"),
			default: pair("User", "Пользователь"),
			system: pair("System", "Системный"),
			native: pair("Native", "Собственный")
		},
		ldap: {
			binding: pair("LDAP binding", "Привязка LDAP"),
			searchFilter: pair("LDAP filter", "Фильтр LDAP"),
			variableName: pair("Environment variable name", "Имя переменной среды"),
			attribute: pair("Attribute to return", "Возвращаемый атрибут")
		},
		mac_range: {
			min: pair("First MAC address", "Начальный MAC-адрес"),
			max: pair("Last MAC address", "Конечный MAC-адрес")
		},
		msi: {
			type: pair("Installer object", "Объект установщика"),
			subtype: pair("Match type", "Тип соответствия"),
			code: pair("Product, patch or component code", "Код продукта, исправления или компонента"),
			item: pair("Property or information item", "Свойство или элемент сведений"),
			value: pair("Value to match", "Значение для сравнения"),
			min: pair("Minimum version", "Минимальная версия"),
			max: pair("Maximum version", "Максимальная версия"),
			gte: pair("Include minimum version", "Включая минимальную версию"),
			lte: pair("Include maximum version", "Включая максимальную версию")
		},
		org_unit: {
			name: pair("Organizational unit", "Подразделение"),
			userContext: pair("Context", "Контекст"),
			directMember: pair("Direct member only", "Только непосредственное членство")
		},
		pcmcia: {},
		portable: {
			unknown: pair("Docking state is unknown", "Состояние подключения к док-станции неизвестно"),
			docked: pair("Docked", "Подключён к док-станции"),
			undocked: pair("Undocked", "Не подключён к док-станции")
		},
		proc_mode: {
			synchFore: pair("Synchronous foreground processing", "Синхронная обработка на переднем плане"),
			asynchFore: pair("Asynchronous foreground processing", "Асинхронная обработка на переднем плане"),
			backRefr: pair("Background refresh", "Фоновое обновление"),
			forceRefr: pair("Forced refresh", "Принудительное обновление"),
			linkTrns: pair("Link speed has changed", "Скорость подключения изменилась"),
			noChg: pair("No changes during processing", "При обработке не было изменений"),
			rsopTrns: pair("RSoP transaction", "Транзакция результирующей политики (RSoP)"),
			safeBoot: pair("Safe boot", "Безопасная загрузка"),
			slowLink: pair("Slow network link", "Медленное сетевое подключение"),
			verbLog: pair("Verbose logging enabled", "Подробное журналирование включено"),
			rsopEnbl: pair("RSoP enabled", "Результирующая политика (RSoP) включена")
		},
		ram: { totalMB: pair("Minimum memory (MB)", "Минимальный объём памяти (МБ)") },
		run_once: {
			id: pair("Tracking identifier", "Идентификатор выполнения"),
			userContext: pair("Context", "Контекст"),
			comments: pair("Description", "Описание")
		},
		site: { name: pair("Site name", "Имя сайта") },
		terminal: {
			type: pair("Session type", "Тип сеанса"),
			option: pair("Session property", "Свойство сеанса"),
			value: pair("Value to match", "Значение для сравнения"),
			min: pair("First client IP address", "Начальный IP-адрес клиента"),
			max: pair("Last client IP address", "Конечный IP-адрес клиента")
		},
		time: {
			begin: pair("From", "С"),
			end: pair("Until", "До")
		},
		user: {
			name: pair("User name", "Имя пользователя"),
			sid: pair("User SID", "SID пользователя")
		},
		variable: {
			variableName: pair("Variable name", "Имя переменной"),
			value: pair("Value to match", "Значение для сравнения")
		},
		os: {
			class: pair("System family", "Семейство систем"),
			version: pair("Operating system", "Операционная система"),
			type: pair("Product type", "Тип продукта"),
			edition: pair("Edition", "Редакция"),
			sp: pair("Service pack", "Пакет обновления")
		},
		registry: {
			type: pair("Match type", "Тип соответствия"),
			subtype: pair("Comparison", "Сравнение"),
			valueName: pair("Value name", "Имя параметра"),
			valueType: pair("Value type", "Тип параметра"),
			valueData: pair("Value data", "Значение параметра"),
			variableName: pair("Environment variable name", "Имя переменной среды"),
			key: pair("Key path", "Путь раздела"),
			hive: pair("Hive", "Куст реестра"),
			min: pair("Minimum version", "Минимальная версия"),
			max: pair("Maximum version", "Максимальная версия"),
			gte: pair("Include minimum version", "Включая минимальную версию"),
			lte: pair("Include maximum version", "Включая максимальную версию"),
			version: pair("Version to match", "Версия для сравнения")
		},
		wmi: {
			query: pair("WMI query", "Запрос WMI"),
			nameSpace: pair("Namespace", "Пространство имён"),
			property: pair("Property to return", "Возвращаемое свойство"),
			variableName: pair("Environment variable name", "Имя переменной среды")
		},
		group: {
			name: pair("Group name", "Имя группы"),
			sid: pair("Group SID", "SID группы"),
			userContext: pair("Context", "Контекст"),
			primaryGroup: pair("Primary group", "Основная группа"),
			localGroup: pair("Local group", "Локальная группа")
		},
		collection: { name: pair("Collection name", "Имя коллекции") }
	};
	function option(key, en, ru) {
		return {
			key,
			label: pair(en, ru)
		};
	}
	var any = function() {
		return option("NE", "Any", "Любой");
	};
	var enumerations = {
		computer: { type: [option("NETBIOS", "NetBIOS name", "NetBIOS-имя"), option("DNS", "DNS name", "DNS-имя")] },
		date: {
			period: [
				option("WEEKLY", "Weekly", "Еженедельно"),
				option("MONTHLY", "Monthly", "Ежемесячно"),
				option("YEARLY", "Date", "Дата")
			],
			dow: [
				option("MON", "Monday", "Понедельник"),
				option("TUE", "Tuesday", "Вторник"),
				option("WED", "Wednesday", "Среда"),
				option("THU", "Thursday", "Четверг"),
				option("FRI", "Friday", "Пятница"),
				option("SAT", "Saturday", "Суббота"),
				option("SUN", "Sunday", "Воскресенье")
			]
		},
		dun: { type: [
			option("", "Any connection", "Любое подключение"),
			option("modem", "Modem", "Модем"),
			option("isdn", "ISDN", "ISDN"),
			option("x25", "X.25", "X.25"),
			option("vpn", "VPN", "VPN"),
			option("pad", "Packet assembler/disassembler (PAD)", "Сборщик/разборщик пакетов (PAD)"),
			option("GENERIC", "Generic network", "Обычная сеть"),
			option("SERIAL", "Serial connection", "Последовательное подключение"),
			option("FRAMERELAY", "Frame Relay", "Frame Relay"),
			option("ATM", "ATM", "ATM"),
			option("SONET", "SONET", "SONET"),
			option("SW56", "Switched 56K", "Коммутируемое подключение 56K"),
			option("IRDA", "Infrared (IrDA)", "Инфракрасное подключение (IrDA)"),
			option("PARALLEL", "Parallel connection", "Параллельное подключение"),
			option("PPPoE", "PPPoE", "PPPoE")
		] },
		file: { type: [option("EXISTS", "File exists", "Файл существует"), option("VERSION", "File version", "Версия файла")] },
		msi: {
			type: [
				option("PRODUCT", "Product", "Продукт"),
				option("PATCH", "Patch", "Исправление"),
				option("FILECOMPONENT", "File component", "Файловый компонент")
			],
			subtype: [
				option("EXISTS", "Exists", "Существует"),
				option("VERSION", "Version", "Версия"),
				option("GET_PROPERTY", "Get property", "Получить свойство"),
				option("GET_INFORMATION", "Get information", "Получить сведения"),
				option("MATCH_PROPERTY", "Match property", "Сравнить свойство"),
				option("MATCH_INFORMATION", "Match information", "Сравнить сведения")
			]
		},
		terminal: {
			type: [
				any(),
				option("TS", "Remote Desktop", "Удалённый рабочий стол"),
				option("CONSOLE", "Console", "Консоль")
			],
			option: [
				option("APPLICATION", "Application name", "Имя приложения"),
				option("PROGRAM", "Initial program", "Начальная программа"),
				option("CLIENT", "Client product ID", "Идентификатор продукта клиента"),
				option("SESSION", "Session information", "Сведения о сеансе"),
				option("DIRECTORY", "Client directory", "Каталог клиента"),
				option("IP", "Client IP address range", "Диапазон IP-адресов клиента"),
				any()
			]
		},
		os: {
			class: [
				any(),
				option("9X", "Windows 9x", "Windows 9x"),
				option("NT", "Windows NT family", "Семейство Windows NT")
			],
			version: [
				any(),
				option("95", "Windows 95", "Windows 95"),
				option("98", "Windows 98", "Windows 98"),
				option("ME", "Windows Me", "Windows Me"),
				option("NT", "Windows NT", "Windows NT"),
				option("2K", "Windows 2000", "Windows 2000"),
				option("XP", "Windows XP", "Windows XP"),
				option("2K3", "Windows Server 2003", "Windows Server 2003"),
				option("2K3R2", "Windows Server 2003 R2", "Windows Server 2003 R2"),
				option("VISTA", "Windows Vista", "Windows Vista"),
				option("Vista", "Windows Vista (Vista)", "Windows Vista (Vista)"),
				option("2K8", "Windows Server 2008", "Windows Server 2008"),
				option("WIN7", "Windows 7", "Windows 7"),
				option("2K8R2", "Windows Server 2008 R2", "Windows Server 2008 R2"),
				option("WIN8", "Windows 8", "Windows 8"),
				option("WIN8S", "Windows Server 2012", "Windows Server 2012"),
				option("WINBLUE", "Windows 8.1", "Windows 8.1"),
				option("WINBLUESRV", "Windows Server 2012 R2", "Windows Server 2012 R2"),
				option("WINTHRESHOLD", "Windows 10", "Windows 10"),
				option("WINTHRESHOLDSRV", "Windows Server 2016 and later", "Windows Server 2016 и новее")
			],
			type: [
				any(),
				option("R2", "R2", "R2"),
				option("SE", "Standard Edition", "Стандартная редакция"),
				option("WS", "Workstation", "Рабочая станция"),
				option("SV", "Server", "Сервер"),
				option("DC", "Domain controller", "Контроллер домена"),
				option("PRO", "Professional", "Профессиональная редакция"),
				option("PR", "Professional (PR)", "Профессиональная редакция (PR)")
			],
			edition: [
				any(),
				option("64EP", "64-bit Enterprise", "Корпоративная, 64-разрядная"),
				option("64DC", "64-bit Datacenter", "Центр обработки данных, 64-разрядная"),
				option("AS", "Advanced Server", "Расширенный сервер"),
				option("DTC", "Datacenter", "Центр обработки данных"),
				option("EP", "Enterprise", "Корпоративная"),
				option("WEB", "Web", "Веб-сервер"),
				option("64", "64-bit", "64-разрядная"),
				option("HM", "Home", "Домашняя"),
				option("MC", "Media Center", "Медиацентр"),
				option("TPC", "Tablet PC", "Планшетный ПК"),
				option("SRV", "Server", "Сервер"),
				option("STD", "Standard", "Стандартная"),
				option("TSE", "Terminal Server", "Терминальный сервер"),
				option("SBS", "Small Business Server", "Сервер для малого бизнеса"),
				option("PRO", "Professional", "Профессиональная"),
				option("64STGSTD", "64-bit Storage Server Standard", "Сервер хранения, стандартная, 64-разрядная"),
				option("64STGWKGRP", "64-bit Storage Server (64STGWKGRP)", "Сервер хранения, 64-разрядная (64STGWKGRP)"),
				option("64MPSTD", "64-bit MultiPoint Server Standard", "Сервер MultiPoint, стандартная, 64-разрядная"),
				option("64MPPREM", "64-bit MultiPoint Server Premium", "Сервер MultiPoint, расширенная, 64-разрядная"),
				option("64ESSSOL", "64-bit Essentials", "Essentials, 64-разрядная")
			],
			sp: [
				any(),
				option("Gold", "No service pack", "Без пакета обновления"),
				option("Service Pack 1", "Service Pack 1", "Пакет обновления 1"),
				option("Service Pack 2", "Service Pack 2", "Пакет обновления 2"),
				option("Service Pack 3", "Service Pack 3", "Пакет обновления 3"),
				option("Service Pack 4", "Service Pack 4", "Пакет обновления 4"),
				option("Service Pack 5", "Service Pack 5", "Пакет обновления 5"),
				option("Service Pack 6", "Service Pack 6", "Пакет обновления 6")
			]
		},
		registry: {
			type: [
				option("VALUEEXISTS", "Value exists", "Параметр существует"),
				option("KEYEXISTS", "Key exists", "Раздел существует"),
				option("MATCHVALUE", "Match value", "Сравнить значение"),
				option("GETVALUE", "Get value", "Получить значение")
			],
			subtype: [
				option("EQUALHEX", "Equal (hexadecimal)", "Равно (шестнадцатеричное)"),
				option("EQUALDEC", "Equal (decimal)", "Равно (десятичное)"),
				option("SUBSTRING", "Contains text", "Содержит текст"),
				option("VERSION", "Version range", "Диапазон версий")
			],
			valueType: [
				option("REG_SZ", "String (REG_SZ)", "Строка (REG_SZ)"),
				option("REG_EXPAND_SZ", "Expandable string (REG_EXPAND_SZ)", "Расширяемая строка (REG_EXPAND_SZ)"),
				option("REG_MULTI_SZ", "Multi-string (REG_MULTI_SZ)", "Многострочное значение (REG_MULTI_SZ)"),
				option("REG_DWORD", "32-bit integer (REG_DWORD)", "32-разрядное число (REG_DWORD)"),
				option("REG_BINARY", "Binary (REG_BINARY)", "Двоичное значение (REG_BINARY)"),
				option("", "Any value type", "Любой тип параметра")
			],
			hive: [
				option("HKEY_LOCAL_MACHINE", "Local machine (HKEY_LOCAL_MACHINE)", "Компьютер (HKEY_LOCAL_MACHINE)"),
				option("HKEY_CLASSES_ROOT", "Classes root (HKEY_CLASSES_ROOT)", "Классы (HKEY_CLASSES_ROOT)"),
				option("HKEY_CURRENT_USER", "Current user (HKEY_CURRENT_USER)", "Текущий пользователь (HKEY_CURRENT_USER)"),
				option("HKEY_CURRENT_CONFIG", "Current configuration (HKEY_CURRENT_CONFIG)", "Текущая конфигурация (HKEY_CURRENT_CONFIG)"),
				option("HKEY_USERS", "Users (HKEY_USERS)", "Пользователи (HKEY_USERS)")
			]
		}
	};
	var numbers = {
		cpu: { speedMHz: {
			min: 0,
			max: 65535,
			step: 1
		} },
		date: {
			day: {
				min: 1,
				max: 31,
				step: 1
			},
			month: {
				min: 1,
				max: 12,
				step: 1
			},
			year: {
				min: 1,
				max: 65535,
				step: 1
			}
		},
		disk: { freeSpace: {
			min: 0,
			max: 255,
			step: 1
		} },
		ram: { totalMB: {
			min: 0,
			max: 65535,
			step: 1
		} }
	};
	var notes = {
		battery: pair("Matches when the computer is running on battery power.", "Условие выполняется, когда компьютер работает от батареи."),
		pcmcia: pair("Matches when the computer has PCMCIA card slots.", "Условие выполняется, если в компьютере есть слоты PCMCIA."),
		disk: pair("The current library supports only 0–255 KB for this condition. Larger thresholds are not yet supported.", "Текущая библиотека поддерживает для этого условия только 0–255 КБ. Большие значения пока не поддерживаются."),
		user: pair("If a SID is specified, it takes precedence over the user name.", "Если задан SID, он используется вместо имени пользователя."),
		run_once: pair("The tracking identifier records whether this condition has already been processed.", "По идентификатору определяется, выполнялось ли это условие ранее.")
	};
	function languageIndex(language) {
		return /^ru(?:[-_]|$)/i.test(String(language || "en")) ? 1 : 0;
	}
	function localized(value, language) {
		return value[languageIndex(language)];
	}
	function operand(id) {
		return String(id || "").replace(/^filter\./, "");
	}
	function own(object, key) {
		return Object.prototype.hasOwnProperty.call(object, key);
	}
	function lookup(table, kind, id) {
		return own(table, kind) && own(table[kind], operand(id)) ? table[kind][operand(id)] : null;
	}
	var supportedKinds = Object.freeze(Object.keys(kinds));
	var kindLabel = function(kind, fallback, language) {
		return own(kinds, kind) ? localized(kinds[kind], language) : fallback || String(kind || "");
	};
	var fieldLabel = function(kind, id, fallback, language) {
		const label = lookup(fields, kind, id);
		return label ? localized(label, language) : fallback || String(id || "");
	};
	var choices = function(kind, id, language) {
		const values = lookup(enumerations, kind, id);
		return values ? values.map(function(value) {
			return {
				key: value.key,
				label: localized(value.label, language)
			};
		}) : null;
	};
	var numeric = function(kind, id) {
		const value = lookup(numbers, kind, id);
		return value ? {
			min: value.min,
			max: value.max,
			step: value.step
		} : null;
	};
	var isTextarea = function(kind, id) {
		const key = operand(id);
		return kind === "wmi" && key === "query" || kind === "ldap" && key === "searchFilter" || kind === "run_once" && key === "comments" || kind === "registry" && key === "valueData";
	};
	var note = function(kind, language) {
		return own(notes, kind) ? localized(notes[kind], language) : "";
	};
	//#endregion
	//#region src/components/templates/preference/targeting-typed-input.js
	var nextInputId$1 = 1;
	var TYPES = {
		ipv4: {
			count: 4,
			length: 3,
			max: 255,
			separator: ".",
			characters: /^\d*$/,
			inserted: /^[\d.]*$/
		},
		mac: {
			count: 6,
			length: 2,
			separator: ":",
			characters: /^[a-f\d]*$/i,
			inserted: /^[a-f\d:-]*$/i
		},
		version: {
			count: 4,
			length: 5,
			max: 65535,
			separator: ".",
			characters: /^\d*$/,
			inserted: /^[\d.]*$/
		},
		guid: { inserted: /^[a-f\d{}-]*$/i },
		ipv6: { inserted: /^[a-f\d:.]*$/i }
	};
	var WORDS$1 = {
		en: {
			ipv4: "IPv4 address",
			ipv6: "IPv6 address",
			mac: "MAC address",
			version: "Version",
			guid: "GUID",
			octet: "Octet",
			byte: "Byte",
			component: "Component",
			of: "of",
			saved: "saved value"
		},
		ru: {
			ipv4: "Адрес IPv4",
			ipv6: "Адрес IPv6",
			mac: "MAC-адрес",
			version: "Версия",
			guid: "GUID",
			octet: "Октет",
			byte: "Байт",
			component: "Компонент",
			of: "из",
			saved: "сохранённое значение"
		}
	};
	function validSegment(value, type) {
		return value.length <= type.length && type.characters.test(value) && (value === "" || type.max === void 0 || Number(value) <= type.max);
	}
	/** A partial value is useful while editing; completeness belongs to the operand validator. */
	function splitSegments(value, name) {
		const type = TYPES[name];
		if (value === "") return [""];
		let parts;
		if (name === "mac" && /^[a-f\d]+$/i.test(value) && value.length > 2) {
			if (value.length > 12 || value.length % 2) return null;
			parts = value.match(/.{2}/g);
		} else {
			if (name === "mac" && value.indexOf(":") !== -1 && value.indexOf("-") !== -1) return null;
			parts = value.split(name === "mac" ? /[:-]/ : ".");
		}
		return parts.length <= type.count && parts.every(function(part) {
			return validSegment(part, type);
		}) ? parts : null;
	}
	function joinSegments(inputs, separator) {
		const parts = inputs.map(function(input) {
			return input.value;
		});
		while (parts.length && parts[parts.length - 1] === "") parts.pop();
		return parts.join(separator);
	}
	/** Accept a GUID prefix or a complete GUID, without extracting hex from arbitrary text. */
	function guidValue(value) {
		let body = value, opening = false, closing = false;
		if (body.charAt(0) === "{") {
			opening = true;
			body = body.slice(1);
		}
		if (body.charAt(body.length - 1) === "}") {
			closing = true;
			body = body.slice(0, -1);
		}
		if (!/^[a-f\d-]*$/i.test(body) || body.length > 36 || closing && !opening) return null;
		for (let i = 0; i < body.length; i++) if (body.charAt(i) === "-" && [
			8,
			13,
			18,
			23
		].indexOf(i) === -1) return null;
		const hex = body.replace(/-/g, "");
		if (hex.length > 32 || closing && hex.length !== 32) return null;
		const parts = [];
		let offset = 0;
		[
			8,
			4,
			4,
			4,
			12
		].forEach(function(length) {
			if (offset < hex.length) parts.push(hex.slice(offset, offset + length));
			offset += length;
		});
		let formatted = parts.join("-");
		if (hex.length === 32) return "{" + formatted.toUpperCase() + "}";
		if (body.charAt(body.length - 1) === "-" && [
			8,
			12,
			16,
			20
		].indexOf(hex.length) !== -1) formatted += "-";
		return (opening ? "{" : "") + formatted;
	}
	function replaceSelection(input, text) {
		const start = input.selectionStart === null ? input.value.length : input.selectionStart;
		const end = input.selectionEnd === null ? start : input.selectionEnd;
		return input.value.slice(0, start) + text + input.value.slice(end);
	}
	function insertedText(before, after) {
		let start = 0;
		while (start < before.length && start < after.length && before.charAt(start) === after.charAt(start)) start++;
		let endBefore = before.length, endAfter = after.length;
		while (endBefore > start && endAfter > start && before.charAt(endBefore - 1) === after.charAt(endAfter - 1)) {
			endBefore--;
			endAfter--;
		}
		return after.slice(start, endAfter);
	}
	function focusEnd(input) {
		input.focus();
		input.setSelectionRange(input.value.length, input.value.length);
	}
	/**
	* The adapter owns text presentation only. Its caller retains the original DTO envelope.
	* readValue() returns the exact initial text until an accepted edit emits onChange(text).
	*/
	function render$3(options) {
		const name = options.type;
		const type = TYPES[name];
		if (!type) throw new Error("Unsupported targeting input type: " + name);
		const words = WORDS$1[options.language === "ru" ? "ru" : "en"];
		const label = options.label || words[name];
		const disabled = Boolean(options.disabled);
		const original = options.value === null || options.value === void 0 ? "" : String(options.value);
		let current = original;
		const inputs = [];
		const element = createElement("div", {
			className: ["gpo-targeting-typed-input", "gpo-targeting-typed-input--" + name],
			attrs: {
				role: "group",
				"aria-label": label,
				"aria-disabled": disabled ? "true" : null
			}
		});
		const singleType = name === "guid" || name === "ipv6";
		const parts = singleType ? null : splitSegments(original, name);
		const fallback = name === "guid" ? guidValue(original) === null : name === "ipv6" ? !type.inserted.test(original) : parts === null;
		function emit(value) {
			if (disabled || value === current) return;
			current = value;
			if (typeof options.onChange === "function") options.onChange(value);
		}
		function inputElement(className, inputLabel, size) {
			const input = createElement("input", {
				className,
				attrs: {
					id: "gpo-targeting-typed-input-" + nextInputId$1++,
					type: "text",
					"aria-label": inputLabel,
					inputmode: name === "ipv4" || name === "version" ? "numeric" : "text",
					autocomplete: "off",
					autocapitalize: "off",
					spellcheck: "false",
					size,
					disabled: disabled ? "disabled" : null
				}
			}).getElement();
			inputs.push(input);
			element.append(input);
			return input;
		}
		function bindSingle(input, isFallback) {
			let accepted = original;
			input.value = original;
			function normalized(candidate) {
				if (name === "guid") return guidValue(candidate);
				if (name === "ipv6") return type.inserted.test(candidate) ? candidate : null;
				const parsed = splitSegments(candidate, name);
				if (!parsed) return null;
				while (parsed.length && parsed[parsed.length - 1] === "") parsed.pop();
				return parsed.join(type.separator);
			}
			function accept(candidate, paste) {
				let formatted = normalized(candidate);
				if (formatted === null) {
					if (!isFallback || paste || !type.inserted.test(insertedText(accepted, candidate)) || candidate.length >= accepted.length && normalized(accepted) !== null) return false;
					formatted = candidate;
				}
				const caret = input.selectionStart;
				const atEnd = caret === input.value.length;
				const hexBefore = name === "guid" && caret !== null ? (input.value.slice(0, caret).match(/[a-f\d]/gi) || []).length : 0;
				input.value = formatted;
				accepted = formatted;
				if (atEnd || paste) input.setSelectionRange(formatted.length, formatted.length);
				else if (name === "guid" && caret !== null) {
					let position = 0, seen = 0;
					while (position < formatted.length && seen < hexBefore) {
						if (/[a-f\d]/i.test(formatted.charAt(position))) seen++;
						position++;
					}
					input.setSelectionRange(position, position);
				}
				emit(formatted);
				return true;
			}
			function deleteGuid(inputType) {
				if (name !== "guid" || guidValue(input.value) === null) return false;
				const start = input.selectionStart, end = input.selectionEnd;
				if (start === null || end === null) return false;
				const hex = input.value.replace(/[{}-]/g, "");
				if (!hex.length) {
					accept("", false);
					input.setSelectionRange(0, 0);
					return true;
				}
				let before = (input.value.slice(0, start).match(/[a-f\d]/gi) || []).length;
				let after = (input.value.slice(0, end).match(/[a-f\d]/gi) || []).length;
				const backward = /Backward$/.test(inputType);
				if (before === after) {
					if (backward) before--;
					else after++;
				}
				if (before < 0 || after > hex.length) return true;
				const remaining = hex.slice(0, before) + hex.slice(after);
				accept(remaining && input.value.charAt(0) === "{" ? "{" + remaining : remaining, false);
				let position = 0, seen = 0;
				while (position < input.value.length && seen < before) {
					if (/[a-f\d]/i.test(input.value.charAt(position))) seen++;
					position++;
				}
				input.setSelectionRange(position, position);
				return true;
			}
			input.addEventListener("beforeinput", function(event) {
				if (disabled) {
					event.preventDefault();
					return;
				}
				if (event.inputType.indexOf("delete") === 0) {
					if (deleteGuid(event.inputType)) event.preventDefault();
					return;
				}
				if (event.data === null || event.data === void 0) return;
				const candidate = replaceSelection(input, event.data);
				if (!type.inserted.test(event.data) || !isFallback && normalized(candidate) === null) event.preventDefault();
			});
			input.addEventListener("input", function() {
				if (disabled || !type.inserted.test(insertedText(accepted, input.value)) || !accept(input.value, false)) input.value = accepted;
			});
			input.addEventListener("paste", function(event) {
				event.preventDefault();
				if (disabled || !event.clipboardData) return;
				const text = event.clipboardData.getData("text/plain");
				if (!type.inserted.test(text)) return;
				const whole = normalized(text);
				accept((name === "guid" ? whole && /^\{[a-f\d]{8}(?:-[a-f\d]{4}){3}-[a-f\d]{12}\}$/i.test(whole) : name === "ipv6" ? whole && whole.indexOf(":") !== -1 : whole && splitSegments(text, name).length === type.count) ? text : replaceSelection(input, text), true);
			});
		}
		if (fallback || singleType) bindSingle(inputElement(fallback ? "gpo-targeting-typed-input__fallback" : ["gpo-targeting-typed-input__segment", "gpo-targeting-typed-input__full"], fallback ? label + ", " + words.saved : label, name === "guid" ? 38 : name === "ipv6" ? 39 : void 0), fallback);
		else {
			const segmentName = name === "ipv4" ? words.octet : name === "mac" ? words.byte : words.component;
			for (let index = 0; index < type.count; index++) {
				if (index) element.append(createElement("span", {
					className: "gpo-targeting-typed-input__separator",
					attrs: { "aria-hidden": "true" },
					text: type.separator
				}));
				const segment = inputElement("gpo-targeting-typed-input__segment", label + ", " + segmentName + " " + (index + 1) + " " + words.of + " " + type.count, type.length);
				segment.value = parts[index] || "";
				bindSegment(segment, index);
			}
		}
		function bindSegment(input, index) {
			function commit() {
				inputs.forEach(function(segment) {
					segment._targetingAccepted = segment.value;
				});
				emit(joinSegments(inputs, type.separator));
			}
			input._targetingAccepted = input.value;
			function restore() {
				input.value = input._targetingAccepted;
			}
			function advance() {
				if (inputs[index + 1]) {
					inputs[index + 1].focus();
					inputs[index + 1].select();
				}
			}
			input.addEventListener("keydown", function(event) {
				if (disabled || event.ctrlKey || event.metaKey || event.altKey) return;
				if (event.key === type.separator || name === "mac" && event.key === "-") {
					event.preventDefault();
					advance();
				} else if (event.key === "Backspace" && input.value === "" && index) {
					event.preventDefault();
					focusEnd(inputs[index - 1]);
				}
			});
			input.addEventListener("beforeinput", function(event) {
				if (disabled) {
					event.preventDefault();
					return;
				}
				if (event.data === null || event.data === void 0 || event.inputType.indexOf("delete") === 0) return;
				if (event.data === type.separator || name === "mac" && event.data === "-") {
					event.preventDefault();
					advance();
					return;
				}
				if (!validSegment(replaceSelection(input, event.data), type)) event.preventDefault();
			});
			input.addEventListener("input", function() {
				if (disabled || !validSegment(input.value, type)) {
					restore();
					return;
				}
				commit();
			});
			input.addEventListener("paste", function(event) {
				event.preventDefault();
				if (disabled || !event.clipboardData) return;
				const text = event.clipboardData.getData("text/plain");
				if (!(text.indexOf(type.separator) !== -1 || name === "mac" && (text.indexOf("-") !== -1 || text.length > type.length))) {
					const local = replaceSelection(input, text);
					if (!validSegment(local, type)) return;
					input.value = local;
					focusEnd(input);
					commit();
					return;
				}
				const pasted = splitSegments(text, name);
				if (!pasted) return;
				const start = pasted.length === type.count ? 0 : index;
				if (start + pasted.length > type.count) return;
				for (let i = start; i < type.count; i++) inputs[i].value = pasted[i - start] || "";
				commit();
				focusEnd(inputs[Math.min(start + pasted.length - 1, type.count - 1)]);
			});
		}
		return {
			element,
			inputs,
			readValue: function() {
				return current;
			},
			focus: function() {
				if (inputs[0]) inputs[0].focus();
			}
		};
	}
	//#endregion
	//#region src/components/templates/preference/targeting-operand-model.js
	/** RSAT-style operand forms. Common boolean operators belong to the parent toolbar. */
	var COMMON = [
		"filter.bool",
		"filter.not",
		"filter.combine",
		"filter.negate",
		"filter.hidden"
	];
	var SIMPLE = {
		battery: [],
		computer: ["type", "name"],
		cpu: ["speedMHz"],
		disk: ["freeSpace", "drive"],
		domain: ["userContext", "name"],
		dun: ["type"],
		ip_range: [
			"useIPv6",
			"min",
			"max"
		],
		ldap: [
			"binding",
			"searchFilter",
			"attribute",
			"variableName"
		],
		mac_range: ["min", "max"],
		org_unit: [
			"userContext",
			"name",
			"directMember"
		],
		pcmcia: [],
		portable: [
			"unknown",
			"docked",
			"undocked"
		],
		proc_mode: [
			"synchFore",
			"asynchFore",
			"backRefr",
			"forceRefr",
			"linkTrns",
			"noChg",
			"rsopTrns",
			"safeBoot",
			"slowLink",
			"verbLog",
			"rsopEnbl"
		],
		ram: ["totalMB"],
		run_once: [
			"id",
			"userContext",
			"comments"
		],
		site: ["name"],
		time: ["begin", "end"],
		variable: ["variableName", "value"],
		os: [
			"version",
			"edition",
			"sp",
			"type",
			"class"
		],
		wmi: [
			"nameSpace",
			"query",
			"property",
			"variableName"
		],
		group: [
			"userContext",
			"name",
			"sid",
			"primaryGroup",
			"localGroup"
		],
		collection: ["name"]
	};
	var WORDS = {
		en: {
			match: "Match type",
			file: "File exists",
			folder: "Folder exists",
			fileVersion: "Match file version",
			key: "Key exists",
			value: "Value exists",
			data: "Match value data",
			decimal: "Decimal format",
			substring: "Substring match",
			version: "Version match",
			get: "Get value data",
			defaultName: "Default value name",
			everyYear: "Every year",
			date: "Date",
			calendar: "Day and month",
			context: "Target",
			computer: "Computer",
			user: "User",
			by: "Match by",
			name: "Name",
			sid: "Security identifier (SID)",
			mode: "Processing modes",
			conditions: "Processing conditions",
			saved: "Saved value: ",
			broken: "The saved language is not recognized. Choose a language to replace it.",
			min: "Minimum version",
			max: "Maximum version",
			getValue: "Value",
			userLanguageScope: "User language is available only in User configuration.",
			useIPv6: "Use IPv6",
			ipv6Address: "IPv6 address",
			prefix: "Prefix length",
			prefixHint: "0–128; 128 matches one address"
		},
		ru: {
			match: "Тип соответствия",
			file: "Файл существует",
			folder: "Папка существует",
			fileVersion: "Сопоставить версию файла",
			key: "Ключ существует",
			value: "Значение существует",
			data: "Сопоставить данные значения",
			decimal: "Десятичный формат",
			substring: "Сопоставить подстроку",
			version: "Сопоставить версию",
			get: "Получить данные значения",
			defaultName: "Имя значения по умолчанию",
			everyYear: "Каждый год",
			date: "Дата",
			calendar: "День и месяц",
			context: "Объект",
			computer: "Компьютер",
			user: "Пользователь",
			by: "Сопоставлять по",
			name: "Имени",
			sid: "Идентификатору безопасности (SID)",
			mode: "Режимы обработки",
			conditions: "Условия обработки",
			saved: "Сохранённое значение: ",
			broken: "Сохранённый язык не распознан. Выберите язык для его замены.",
			min: "Минимальная версия",
			max: "Максимальная версия",
			getValue: "Значение",
			userLanguageScope: "Язык пользователя доступен только в разделе «Пользователь».",
			useIPv6: "Использовать IPv6",
			ipv6Address: "IPv6-адрес",
			prefix: "Длина префикса",
			prefixHint: "0–128; 128 — один адрес"
		}
	};
	function fieldOf(fields, id) {
		return fields.find(function(field) {
			return field.id === id;
		});
	}
	function raw(fields, id) {
		const field = fieldOf(fields, id);
		return field ? valuePayload(field.value) : null;
	}
	function assign(fields, id, value) {
		const field = fieldOf(fields, id);
		if (!field || field.editable === false) return;
		const envelope = clone$2(field.value);
		envelope.value = value;
		field.value = envelope;
	}
	function stateOf(node) {
		if (!node._operandState) node._operandState = {
			original: clone$2(node.fields || []),
			dates: {},
			values: {}
		};
		return node._operandState;
	}
	function today() {
		return /* @__PURE__ */ new Date();
	}
	function weekday(date) {
		return [
			"SUN",
			"MON",
			"TUE",
			"WED",
			"THU",
			"FRI",
			"SAT"
		][date.getDay()];
	}
	function daysInMonth(month, year) {
		return new Date(Number(year), Number(month), 0).getDate();
	}
	function dateParts(fields) {
		return {
			day: raw(fields, "filter.day"),
			month: raw(fields, "filter.month"),
			year: raw(fields, "filter.year"),
			dow: raw(fields, "filter.dow")
		};
	}
	function isCommon(id) {
		return COMMON.indexOf(id) !== -1;
	}
	function languageChoices(field, language) {
		let names;
		try {
			names = typeof Intl.DisplayNames === "function" ? new Intl.DisplayNames([language], { type: "language" }) : null;
		} catch (_) {
			names = null;
		}
		return (field && field.choices || []).filter(function(choice) {
			return choice.key !== "unknown";
		}).map(function(choice) {
			let text;
			try {
				text = names && names.of(choice.key);
			} catch (_) {
				text = null;
			}
			return {
				key: choice.key,
				label: text && text !== choice.key ? text : choice.label
			};
		});
	}
	/** Only new nodes receive defaults. Opening a persisted node never calls this implicitly. */
	function initialize(node, options) {
		const fields = clone$2(node.fields || []);
		if (node.originalPath) return fields;
		const language = options && options.language === "ru" ? "ru" : "en";
		const scope = options && options.scope || "computer";
		const now = today();
		function empty(id, value) {
			const old = raw(fields, id);
			if (old === null || old === void 0 || old === "") assign(fields, id, value);
		}
		switch (node.kind) {
			case "computer":
				empty("filter.type", "NETBIOS");
				break;
			case "date":
				empty("filter.period", "WEEKLY");
				if (raw(fields, "filter.period") === "WEEKLY") empty("filter.dow", weekday(now));
				if (raw(fields, "filter.period") === "MONTHLY") empty("filter.day", now.getDate());
				if (raw(fields, "filter.period") === "YEARLY") {
					empty("filter.day", now.getDate());
					empty("filter.month", now.getMonth() + 1);
				}
				break;
			case "disk":
				empty("filter.drive", "System");
				break;
			case "file":
				empty("filter.type", "EXISTS");
				break;
			case "language": {
				const localeField = fieldOf(fields, "filter.languageLocale");
				if (localeField) {
					const available = languageChoices(localeField, language);
					const chosen = available.find(function(choice) {
						return choice.key === (language === "ru" ? "ru-RU" : "en-US");
					}) || available.find(function(choice) {
						return choice.key === language;
					}) || available[0];
					if (chosen) {
						assign(fields, localeField.id, chosen.key);
						assign(fields, "filter.displayName", chosen.label);
					}
				}
				if (scope === "computer") assign(fields, "filter.default", false);
				empty("filter.system", true);
				break;
			}
			case "msi":
				empty("filter.type", "PRODUCT");
				empty("filter.subtype", "EXISTS");
				break;
			case "terminal":
				empty("filter.type", "NE");
				empty("filter.option", "NE");
				break;
			case "time":
				empty("filter.begin", "00:00:00");
				empty("filter.end", "23:59:00");
				break;
			case "registry":
				empty("filter.type", "KEYEXISTS");
				empty("filter.hive", "HKEY_LOCAL_MACHINE");
				break;
			case "wmi":
				empty("filter.nameSpace", "Root\\cimv2");
				break;
			case "run_once": if (!raw(fields, "filter.id")) assign(fields, "filter.id", "{" + (typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(letter) {
				const value = Math.floor(Math.random() * 16);
				return (letter === "x" ? value : value & 3 | 8).toString(16);
			})).toUpperCase() + "}");
		}
		if (scope === "computer" && [
			"domain",
			"org_unit",
			"group",
			"run_once"
		].indexOf(node.kind) !== -1) assign(fields, "filter.userContext", false);
		return fields;
	}
	function activeIds(node) {
		const fields = node.fields || [];
		let ids = SIMPLE[node.kind];
		if (node.kind === "date") {
			const period = raw(fields, "filter.period");
			ids = ["period"].concat(period === "WEEKLY" ? ["dow"] : period === "MONTHLY" ? ["day"] : period === "YEARLY" ? [
				"month",
				"day",
				"year"
			] : []);
		} else if (node.kind === "file") ids = [
			"path",
			"type",
			"folder"
		].concat(raw(fields, "filter.type") === "VERSION" ? [
			"min",
			"max",
			"gte",
			"lte"
		] : []);
		else if (node.kind === "language") ids = [
			"languageLocale",
			"default",
			"system",
			"native"
		];
		else if (node.kind === "msi") {
			const subtype = raw(fields, "filter.subtype");
			ids = [
				"type",
				"subtype",
				"code"
			].concat(subtype === "VERSION" ? [
				"min",
				"max",
				"gte",
				"lte"
			] : /^(GET|MATCH)_/.test(subtype || "") ? ["item", "value"] : []);
		} else if (node.kind === "registry") {
			const type = raw(fields, "filter.type") || "KEYEXISTS";
			const regSubtype = raw(fields, "filter.subtype") || "EQUALHEX";
			ids = [
				"type",
				"hive",
				"key"
			].concat(type === "KEYEXISTS" ? [] : ["valueName", "valueType"]);
			if (type === "MATCHVALUE") ids = ids.concat(["subtype"]).concat(regSubtype === "VERSION" ? [
				"min",
				"max",
				"gte",
				"lte"
			] : ["valueData"]);
			if (type === "GETVALUE") ids.push("variableName");
		} else if (node.kind === "terminal") {
			const option = raw(fields, "filter.option");
			ids = ["type", "option"].concat(option === "IP" ? ["min", "max"] : option === "NE" ? [] : ["value"]);
		} else if (node.kind === "user") ids = raw(fields, "filter.sid") ? ["sid"] : ["name"];
		return (ids || []).map(function(id) {
			return "filter." + id;
		});
	}
	function ipv4(value) {
		if (!/^(0|[1-9]\d{0,2})(\.(0|[1-9]\d{0,2})){3}$/.test(String(value))) return null;
		const parts = String(value).split(".").map(Number);
		return parts.every(function(part) {
			return part <= 255;
		}) ? parts.reduce(function(number, part) {
			return number * 256 + part;
		}, 0) : null;
	}
	function mac(value) {
		return /^([a-f\d]{2}:){5}[a-f\d]{2}$/i.test(String(value)) ? parseInt(String(value).replace(/:/g, ""), 16) : null;
	}
	function ipv6(value) {
		let text = String(value);
		if (text.indexOf(":") === -1) return null;
		if (text.indexOf(".") !== -1) {
			const tailIndex = text.lastIndexOf(":"), tail = text.slice(tailIndex + 1);
			if (ipv4(tail) === null) return null;
			const bytes = tail.split(".").map(Number);
			text = text.slice(0, tailIndex + 1) + (bytes[0] * 256 + bytes[1]).toString(16) + ":" + (bytes[2] * 256 + bytes[3]).toString(16);
		}
		if (!/^[a-f\d:]+$/i.test(text)) return null;
		const halves = text.split("::");
		if (halves.length > 2) return null;
		const left = halves[0] ? halves[0].split(":") : [], right = halves.length === 2 && halves[1] ? halves[1].split(":") : [];
		if (!left.concat(right).every(function(part) {
			return /^[a-f\d]{1,4}$/i.test(part);
		})) return null;
		const gap = 8 - left.length - right.length;
		if (halves.length === 1 && gap !== 0 || halves.length === 2 && gap < 1) return null;
		return left.concat(halves.length === 2 ? Array(gap).fill("0") : [], right).map(function(part) {
			return parseInt(part, 16);
		});
	}
	function version(value) {
		if (!/^\d+(\.\d+){0,3}$/.test(String(value))) return null;
		const parts = String(value).split(".").map(Number);
		return parts.every(function(part) {
			return part <= 65535;
		}) ? parts.concat([
			0,
			0,
			0,
			0
		]).slice(0, 4) : null;
	}
	function compare(left, right) {
		for (let i = 0; i < left.length; i++) if (left[i] !== right[i]) return left[i] - right[i];
		return 0;
	}
	function semanticType(kind, id, useIPv6) {
		if (id === "filter.min" || id === "filter.max") {
			if (kind === "ip_range" && useIPv6) return id === "filter.min" ? "ipv6" : null;
			if (kind === "ip_range" || kind === "terminal") return "ipv4";
			if (kind === "mac_range") return "mac";
			if ([
				"file",
				"msi",
				"registry"
			].indexOf(kind) !== -1) return "version";
		}
		if (kind === "msi" && id === "filter.code" || kind === "run_once" && id === "filter.id") return "guid";
		return null;
	}
	function validTime(value) {
		const match = /^(\d{2}):(\d{2}):(\d{2})(?:\.(\d+))?(Z|[+-]\d{2}:\d{2})?$/.exec(String(value));
		if (!match || Number(match[1]) > 24 || Number(match[2]) > 59 || Number(match[3]) > 59) return false;
		if (Number(match[1]) === 24 && (Number(match[2]) || Number(match[3]) || match[4] && /[1-9]/.test(match[4]))) return false;
		if (match[5] && match[5] !== "Z") {
			const offset = match[5].slice(1).split(":").map(Number);
			if (offset[0] > 14 || offset[1] > 59 || offset[0] === 14 && offset[1]) return false;
		}
		return true;
	}
	/** Validate active, deliberately edited operands; tolerate untouched legacy representations. */
	function validateFields(node) {
		if (!node || node.available === false) return [];
		const fields = node.fields || [];
		const active = activeIds(node);
		const original = node._operandState && node._operandState.original;
		const fresh = !node.originalPath;
		const errors = [];
		function changed(id) {
			if (fresh) return true;
			const before = original && fieldOf(original, id), after = fieldOf(fields, id);
			return Boolean(before && after && !equal(before.value, after.value));
		}
		const modeChanged = [
			"filter.type",
			"filter.subtype",
			"filter.option",
			"filter.period",
			"filter.sid",
			"filter.useIPv6"
		].some(changed);
		function check(id) {
			return changed(id) || modeChanged;
		}
		function add(id, code) {
			if (!errors.some(function(error) {
				return error.fieldId === id;
			})) errors.push({
				fieldId: id,
				code
			});
		}
		active.forEach(function(id) {
			const field = fieldOf(fields, id);
			if (!field || field.editable === false || !check(id) || isCommon(id)) return;
			let descriptor = field;
			if (node.kind === "dun" && id === "filter.type") descriptor = Object.assign({}, field, { required: false });
			const generic = validatePreferenceField(descriptor, field.value);
			if (generic) add(id, generic);
			const value = raw(fields, id), numeric$2 = numeric(node.kind, id);
			if (numeric$2 && value !== null && value !== "" && (!/^\d+$/.test(String(value)) || !Number.isSafeInteger(Number(value)) || Number(value) < numeric$2.min || Number(value) > numeric$2.max)) add(id, "invalid_number");
			const choices$2 = choices(node.kind, id, "en");
			if (choices$2 && value !== null && !choices$2.some(function(choice) {
				return String(choice.key) === String(value);
			})) add(id, "invalid_value");
		});
		function pair(parser, code, optional) {
			const min = raw(fields, "filter.min"), max = raw(fields, "filter.max");
			const parsedMin = min === null || min === "" ? null : parser(min), parsedMax = max === null || max === "" ? null : parser(max);
			if (check("filter.min") && (!optional && parsedMin === null || min !== null && min !== "" && parsedMin === null)) add("filter.min", !optional && !min ? "required" : code);
			if (check("filter.max") && (!optional && parsedMax === null || max !== null && max !== "" && parsedMax === null)) add("filter.max", !optional && !max ? "required" : code);
			if ((check("filter.min") || check("filter.max")) && parsedMin !== null && parsedMax !== null && (Array.isArray(parsedMin) ? compare(parsedMin, parsedMax) : parsedMin - parsedMax) > 0) add("filter.max", "invalid_range");
		}
		if (node.kind === "ip_range" && raw(fields, "filter.useIPv6") === true) {
			if (check("filter.min") && ipv6(raw(fields, "filter.min")) === null) add("filter.min", !raw(fields, "filter.min") ? "required" : "invalid_ipv6");
			const prefix = raw(fields, "filter.max");
			if (check("filter.max") && (!/^\d+$/.test(String(prefix)) || Number(prefix) > 128)) add("filter.max", prefix === null || prefix === "" ? "required" : "invalid_number");
		} else if (node.kind === "ip_range" || node.kind === "terminal" && raw(fields, "filter.option") === "IP") pair(ipv4, "invalid_ip", false);
		if (node.kind === "mac_range") pair(mac, "invalid_mac", false);
		if (node.kind === "file" && raw(fields, "filter.type") === "VERSION" || node.kind === "msi" && raw(fields, "filter.subtype") === "VERSION" || node.kind === "registry" && raw(fields, "filter.type") === "MATCHVALUE" && raw(fields, "filter.subtype") === "VERSION") pair(version, "invalid_version", true);
		if (node.kind === "time") ["filter.begin", "filter.end"].forEach(function(id) {
			if (check(id) && !validTime(raw(fields, id))) add(id, "invalid_time");
		});
		if (node.kind === "msi" || node.kind === "run_once") {
			const guidId = node.kind === "msi" ? "filter.code" : "filter.id", guid = raw(fields, guidId);
			if (changed(guidId) && guid && !/^(?:[a-f\d]{8}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{12}|\{[a-f\d]{8}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{12}\})$/i.test(String(guid))) add(guidId, "invalid_guid");
		}
		if (node.kind === "date") {
			const period = raw(fields, "filter.period"), day = raw(fields, "filter.day"), month = raw(fields, "filter.month"), year = raw(fields, "filter.year");
			if (period === "MONTHLY" && check("filter.day") && !(Number.isInteger(day) && day >= 1 && day <= 31)) add("filter.day", day === null ? "required" : "invalid_date");
			if (period === "YEARLY" && [
				"filter.day",
				"filter.month",
				"filter.year"
			].some(check)) {
				if (!(Number.isInteger(month) && month >= 1 && month <= 12)) add("filter.month", month === null ? "required" : "invalid_date");
				if (!(Number.isInteger(day) && day >= 1 && day <= daysInMonth(month, year === null ? 2024 : Number(year)))) add("filter.day", day === null ? "required" : "invalid_date");
				if (year !== null && (!/^\d{1,5}$/.test(String(year)) || Number(year) < 1 || Number(year) > 65535)) add("filter.year", "invalid_date");
			}
		}
		if (node.kind === "user" || node.kind === "group") {
			if ((fresh || changed("filter.name") || changed("filter.sid")) && !raw(fields, "filter.name") && !raw(fields, "filter.sid")) add(node.kind === "user" && node._operandState && node._operandState.userMode === "sid" ? "filter.sid" : "filter.name", "required");
		}
		return errors;
	}
	//#endregion
	//#region src/components/templates/preference/targeting-operand-editor.js
	/** RSAT-style operand forms. Common boolean operators belong to the parent toolbar. */
	var nextInputId = 1;
	function render$2(options) {
		const node = options.node;
		const kind = node.kind;
		const language = options.language === "ru" ? "ru" : "en";
		const words = WORDS[language];
		const scope = options.scope || "computer";
		const blocked = Boolean(options.blocked || node.available === false);
		const state = stateOf(node);
		const working = clone$2(node.fields || []);
		const controls = [];
		let renderGeneration = 0;
		const container = createElement("div", {
			className: "gpo-editor-targeting-operands",
			attrs: { "data-targeting-kind": kind }
		});
		const inputRecords = [];
		function value(id) {
			return raw(working, id);
		}
		function set(id, next) {
			assign(working, id, next);
		}
		function capture() {
			inputRecords.forEach(function(record) {
				record.capture();
			});
		}
		function changed() {
			capture();
			if (options.onChange) options.onChange();
		}
		function label(id, fallback) {
			return fieldLabel(kind, id, fallback || id, language);
		}
		function register(id, element, input, error, reader) {
			const record = {
				id,
				read: function() {
					capture();
					const field = fieldOf(working, id);
					return field ? clone$2(field.value) : null;
				},
				setError: function(message) {
					element.getElement().classList.toggle("gpo-editor-field--error", Boolean(message));
					if (message) input.setAttribute("aria-invalid", "true");
					else input.removeAttribute("aria-invalid");
					error.setText(message || "");
				},
				focus: function() {
					input.focus();
				}
			};
			if (reader) inputRecords.push({ capture: reader });
			controls.push(record);
			return record;
		}
		function custom(id, text, type, initial, onInput, extra) {
			const settings = extra || {};
			const generation = renderGeneration;
			const inputId = "gpo-targeting-operand-" + nextInputId++;
			const input = createElement(type === "select" ? "select" : type === "textarea" ? "textarea" : "input", {
				attrs: {
					id: inputId,
					type: type === "checkbox" ? "checkbox" : type === "select" || type === "textarea" ? null : type,
					disabled: blocked || settings.disabled ? "disabled" : null,
					"aria-label": text,
					min: settings.min,
					max: settings.max,
					step: settings.step,
					rows: type === "textarea" ? "4" : null
				},
				children: type === "select" ? (settings.choices || []).map(function(choice) {
					return createElement("option", {
						attrs: { value: choice.key },
						text: choice.label
					});
				}) : []
			});
			const dom = input.getElement();
			if (type === "checkbox") dom.checked = Boolean(initial);
			else dom.value = initial === null || initial === void 0 ? "" : String(initial);
			const error = createElement("span", { className: "gpo-editor-field__error" });
			const body = type === "checkbox" ? createElement("span", {
				className: "gpo-editor-boolean",
				children: [input, createElement("label", { attrs: { for: inputId } })]
			}) : input;
			const element = createElement("div", {
				className: [
					"field",
					type === "checkbox" ? "field__checkbox" : "field__input",
					"gpo-editor-field",
					type === "textarea" ? "field__description" : null
				],
				attrs: { "data-field-id": id },
				children: [createElement("div", {
					className: "field__label",
					children: [createElement("label", {
						attrs: { for: inputId },
						text
					})]
				}), createElement("div", {
					className: "field__element",
					children: [body, error]
				})]
			});
			dom.addEventListener(type === "select" || type === "checkbox" ? "change" : "input", function() {
				if (generation !== renderGeneration || blocked || settings.disabled) return;
				onInput(type === "checkbox" ? dom.checked : dom.value);
				changed();
			});
			register(id, element, dom, error);
			container.append(element);
			return {
				element,
				input: dom
			};
		}
		function ordinary(id, settings) {
			const field = fieldOf(working, id);
			if (!field || isCommon(id) || field.hidden) return;
			const generation = renderGeneration;
			const opts = settings || {};
			const displayed = clone$2(field);
			displayed.label = opts.label || label(id, field.label);
			const type = semanticType(kind, id, value("filter.useIPv6") === true);
			if (type) {
				const error = createElement("span", { className: "gpo-editor-field__error" });
				const control = render$3({
					type,
					value: value(id),
					label: displayed.label,
					language,
					disabled: blocked || opts.disabled || field.editable === false,
					onChange: function(next) {
						if (generation !== renderGeneration || blocked || opts.disabled || field.editable === false) return;
						set(id, field.value.kind === "optional_text" && next === "" ? null : next);
						if (registered) registered.setError("");
						changed();
					}
				});
				const element = createElement("div", {
					className: [
						"field",
						"field__input",
						"gpo-editor-field",
						"gpo-editor-field--typed"
					],
					attrs: { "data-field-id": id },
					children: [createElement("div", {
						className: "field__label",
						children: [createElement("label", {
							attrs: { for: control.inputs[0].id },
							text: displayed.label
						})]
					}), createElement("div", {
						className: "field__element",
						children: [control.element, error]
					})]
				});
				const registered = register(id, element, control.inputs[0], error);
				const setError = registered.setError;
				registered.setError = function(message) {
					setError(message);
					control.inputs.forEach(function(input) {
						if (message) input.setAttribute("aria-invalid", "true");
						else input.removeAttribute("aria-invalid");
					});
				};
				registered.focus = control.focus;
				container.append(element);
				return;
			}
			let choices$1 = opts.choices || choices(kind, id, language);
			const booleanChoice = Boolean(choices$1 && (field.value.kind === "boolean" || field.value.kind === "optional_boolean"));
			if (choices$1) {
				choices$1 = clone$2(choices$1);
				const current = value(id);
				if (current !== null && current !== void 0 && !choices$1.some(function(choice) {
					return String(choice.key) === String(current);
				})) choices$1.unshift({
					key: String(current),
					label: words.saved + String(current)
				});
				displayed.control = "choice";
				displayed.choices = choices$1;
				if (current === null || current === void 0) displayed.value.value = opts.defaultKey !== void 0 ? opts.defaultKey : choices$1.length ? choices$1[0].key : "";
				if (booleanChoice) displayed.value = {
					kind: "text",
					value: current === null || current === void 0 ? String(opts.defaultKey || "false") : String(Boolean(current))
				};
			}
			if (isTextarea(kind, id)) {
				const old = clone$2(field.value);
				custom(id, displayed.label, "textarea", valuePayload(old), function(next) {
					const nextValue = clone$2(old);
					nextValue.value = old.kind === "optional_text" && next === "" ? null : next;
					fieldOf(working, id).value = nextValue;
				}, { disabled: field.editable === false || opts.disabled });
				return;
			}
			const force = blocked || opts.disabled;
			const fieldControl = options.fieldControl(displayed, force, false, {
				wrapSelect: true,
				wrapCheckbox: true,
				wrapText: true
			});
			const input = fieldControl.element.getElement().querySelector("input,select,textarea");
			if (!input) {
				container.append(fieldControl.element);
				return;
			}
			input.setAttribute("aria-label", displayed.label);
			if (opts.hint) input.setAttribute("title", opts.hint);
			if (opts.hintId) input.setAttribute("aria-describedby", opts.hintId);
			const numeric$1 = opts.numeric || numeric(kind, id);
			if (numeric$1 && input.tagName === "INPUT") {
				input.type = "number";
				input.min = numeric$1.min;
				input.max = numeric$1.max;
				input.step = numeric$1.step || 1;
			}
			if (opts.inlineHint) {
				const hintId = "gpo-targeting-hint-" + nextInputId++;
				input.classList.add("gpo-targeting-prefix");
				input.setAttribute("aria-describedby", hintId);
				input.parentNode.appendChild(createElement("span", {
					className: "gpo-editor-field__hint gpo-targeting-prefix__hint",
					attrs: { id: hintId },
					text: opts.inlineHint
				}).getElement());
			}
			const isTime = kind === "time" && (id === "filter.begin" || id === "filter.end");
			if (isTime) {
				input.type = "time";
				input.step = "60";
				input.value = /^\d{2}:\d{2}/.test(String(value(id))) ? String(value(id)).slice(0, 5) : "";
			}
			let touched = false;
			const originalRead = fieldControl.read;
			function captureOne() {
				if (generation !== renderGeneration || !touched || force || field.editable === false) return;
				let next = originalRead();
				if (booleanChoice) {
					const booleanValue = clone$2(field.value);
					booleanValue.value = next.value === "true";
					next = booleanValue;
				}
				if (isTime) {
					next = clone$2(field.value);
					next.value = /^\d{2}:\d{2}$/.test(input.value) ? input.value + ":00" : input.value;
				}
				fieldOf(working, id).value = clone$2(next);
			}
			fieldControl.read = function() {
				captureOne();
				return clone$2(fieldOf(working, id).value);
			};
			inputRecords.push({ capture: captureOne });
			controls.push(fieldControl);
			input.addEventListener("input", function() {
				if (generation !== renderGeneration) return;
				touched = true;
				captureOne();
				changed();
			});
			input.addEventListener("change", function() {
				if (generation !== renderGeneration) return;
				touched = true;
				captureOne();
				if (opts.onChange) {
					capture();
					opts.onChange(value(id));
					rebuild(true);
				}
				changed();
			});
			container.append(fieldControl.element);
		}
		function context() {
			ordinary("filter.userContext", {
				label: words.context,
				choices: [{
					key: "false",
					label: words.computer
				}, {
					key: "true",
					label: words.user
				}],
				defaultKey: "false",
				disabled: scope === "computer",
				onChange: function(next) {
					if (kind === "group" && next === false) {
						state.primary = value("filter.primaryGroup");
						set("filter.primaryGroup", false);
					} else if (kind === "group" && state.primary !== void 0) set("filter.primaryGroup", state.primary);
				}
			});
		}
		function versionRange() {
			["min", "max"].forEach(function(bound) {
				ordinary("filter." + bound, { label: words[bound] });
				ordinary("filter." + (bound === "min" ? "gte" : "lte"), {
					choices: [{
						key: "false",
						label: bound === "min" ? ">" : "<"
					}, {
						key: "true",
						label: bound === "min" ? "≥" : "≤"
					}],
					defaultKey: "false"
				});
			});
		}
		function dateMode(next) {
			const previous = state.dateMode || value("filter.period");
			state.dates[previous] = dateParts(working);
			set("filter.period", next);
			const cached = state.dates[next] || {}, now = today();
			set("filter.dow", next === "WEEKLY" ? cached.dow || weekday(now) : null);
			set("filter.day", next === "MONTHLY" || next === "YEARLY" ? cached.day || now.getDate() : null);
			set("filter.month", next === "YEARLY" ? cached.month || now.getMonth() + 1 : null);
			set("filter.year", next === "YEARLY" ? cached.year !== void 0 ? cached.year : String(now.getFullYear()) : null);
			state.dateMode = next;
		}
		function calendar() {
			const month = Number(value("filter.month")) || today().getMonth() + 1;
			const selected = Number(value("filter.day"));
			const locale = language === "ru" ? "ru-RU" : "en-US";
			const choices = Array.from({ length: 12 }, function(_, index) {
				return {
					key: String(index + 1),
					label: new Intl.DateTimeFormat(locale, { month: "long" }).format(new Date(2024, index, 1))
				};
			});
			custom("filter.month", label("filter.month", words.calendar), "select", month, function(next) {
				set("filter.month", Number(next));
				if (Number(value("filter.day")) > daysInMonth(next, 2024)) set("filter.day", daysInMonth(next, 2024));
				rebuild(true);
			}, { choices });
			const board = createElement("div", {
				className: "gpo-editor-targeting-calendar",
				attrs: {
					role: "group",
					"aria-label": words.calendar,
					"data-field-id": "filter.day"
				}
			});
			const days = createElement("div", { className: "gpo-editor-targeting-calendar__days" });
			let firstButton;
			for (let day = 1; day <= daysInMonth(month, 2024); day++) (function(number) {
				const button = createElement("button", {
					className: [
						"button",
						"gpo-editor-targeting-calendar__day",
						number === selected ? "active" : null
					],
					attrs: {
						type: "button",
						disabled: blocked ? "disabled" : null,
						"aria-pressed": String(number === selected),
						"data-calendar-day": number
					},
					text: String(number)
				});
				if (!firstButton || number === selected) firstButton = button.getElement();
				button.on("click", function() {
					if (blocked) return;
					capture();
					set("filter.day", number);
					set("filter.month", month);
					rebuild(true);
					changed();
				});
				days.append(button);
			})(day);
			const error = createElement("span", { className: "gpo-editor-field__error" });
			board.append(days);
			board.append(error);
			container.append(board);
			register("filter.day", board, firstButton, error);
		}
		function dateForm() {
			state.dateMode = value("filter.period");
			ordinary("filter.period", { onChange: dateMode });
			const period = value("filter.period");
			if (period === "WEEKLY") ordinary("filter.dow");
			if (period === "MONTHLY") ordinary("filter.day", { choices: Array.from({ length: 31 }, function(_, i) {
				return {
					key: String(i + 1),
					label: String(i + 1)
				};
			}) });
			if (period !== "YEARLY") return;
			const annual = value("filter.year") === null;
			custom("targeting.everyYear", words.everyYear, "checkbox", annual, function(next) {
				capture();
				if (next) {
					state.year = value("filter.year");
					set("filter.year", null);
				} else set("filter.year", state.year || String(today().getFullYear()));
				rebuild(true);
			});
			if (annual) calendar();
			else {
				const day = value("filter.day"), month = value("filter.month"), year = value("filter.year");
				const formatted = year && month && day ? String(year).padStart(4, "0") + "-" + String(month).padStart(2, "0") + "-" + String(day).padStart(2, "0") : "";
				const dateControl = custom("filter.day", words.date, "date", formatted, function(next) {
					const parts = /^(\d{4,5})-(\d{2})-(\d{2})$/.exec(next);
					set("filter.year", parts ? parts[1] : null);
					set("filter.month", parts ? Number(parts[2]) : null);
					set("filter.day", parts ? Number(parts[3]) : null);
				}, {
					min: "0001-01-01",
					max: "65535-12-31"
				});
				const dateError = controls[controls.length - 1].setError;
				["filter.month", "filter.year"].forEach(function(id) {
					if (!fieldOf(working, id)) return;
					controls.push({
						id,
						read: function() {
							return clone$2(fieldOf(working, id).value);
						},
						setError: dateError,
						focus: function() {
							dateControl.input.focus();
						}
					});
				});
			}
		}
		function fileForm() {
			const type = value("filter.type") || "EXISTS";
			const mode = type === "VERSION" ? "VERSION" : value("filter.folder") ? "FOLDER" : "FILE";
			const choices = [
				{
					key: "FILE",
					label: words.file
				},
				{
					key: "FOLDER",
					label: words.folder
				},
				{
					key: "VERSION",
					label: words.fileVersion
				}
			];
			if (type !== "EXISTS" && type !== "VERSION") choices.unshift({
				key: type,
				label: words.saved + type
			});
			custom("filter.type", words.match, "select", type !== "EXISTS" && type !== "VERSION" ? type : mode, function(next) {
				capture();
				set("filter.type", next === "VERSION" ? "VERSION" : "EXISTS");
				set("filter.folder", next === "FOLDER");
				rebuild(true);
			}, { choices });
			ordinary("filter.path");
			if (type === "VERSION") versionRange();
		}
		function languageForm() {
			const field = fieldOf(working, "filter.languageLocale");
			if (field) {
				const choices = languageChoices(field, language);
				ordinary(field.id, {
					choices,
					onChange: function(next) {
						const choice = choices.find(function(candidate) {
							return candidate.key === next;
						});
						if (choice) set("filter.displayName", choice.label);
					}
				});
				if (value(field.id) === "unknown") container.append(createElement("div", {
					className: "gpo-editor-preference-notice",
					text: words.broken
				}));
			}
			const hintId = scope === "computer" ? "gpo-targeting-hint-" + nextInputId++ : null;
			ordinary("filter.default", {
				disabled: scope === "computer",
				hint: scope === "computer" ? words.userLanguageScope : null,
				hintId
			});
			ordinary("filter.system");
			ordinary("filter.native");
			if (scope === "computer") container.append(createElement("div", {
				className: "gpo-editor-field__hint gpo-targeting-language__hint",
				attrs: { id: hintId },
				text: words.userLanguageScope
			}));
		}
		function ipRangeForm() {
			const v6 = value("filter.useIPv6") === true;
			state.ipMode = v6 ? "ipv6" : "ipv4";
			state.ipRanges = state.ipRanges || {};
			ordinary("filter.useIPv6", {
				label: words.useIPv6,
				onChange: function(next) {
					capture();
					state.ipRanges[state.ipMode] = {
						min: value("filter.min"),
						max: value("filter.max")
					};
					const mode = next ? "ipv6" : "ipv4";
					const cached = state.ipRanges[mode] || {
						min: "",
						max: next ? "128" : ""
					};
					set("filter.min", cached.min);
					set("filter.max", cached.max);
					state.ipMode = mode;
				}
			});
			ordinary("filter.min", { label: v6 ? words.ipv6Address : null });
			ordinary("filter.max", v6 ? {
				label: words.prefix,
				numeric: {
					min: 0,
					max: 128,
					step: 1
				},
				inlineHint: words.prefixHint
			} : null);
		}
		function registryForm() {
			const type = value("filter.type") || "KEYEXISTS", subtype = value("filter.subtype") || "EQUALHEX";
			const mode = type === "MATCHVALUE" ? subtype : type;
			const modes = [
				["KEYEXISTS", "key"],
				["VALUEEXISTS", "value"],
				["EQUALHEX", "data"],
				["EQUALDEC", "decimal"],
				["SUBSTRING", "substring"],
				["VERSION", "version"],
				["GETVALUE", "get"]
			].map(function(entry) {
				return {
					key: entry[0],
					label: words[entry[1]]
				};
			});
			if (!modes.some(function(choice) {
				return choice.key === mode;
			})) modes.unshift({
				key: mode,
				label: words.saved + mode
			});
			custom("filter.type", words.match, "select", mode, function(next) {
				capture();
				const match = [
					"EQUALHEX",
					"EQUALDEC",
					"SUBSTRING",
					"VERSION"
				].indexOf(next) !== -1;
				set("filter.type", match ? "MATCHVALUE" : next);
				if (match) set("filter.subtype", next);
				rebuild(true);
			}, { choices: modes });
			ordinary("filter.hive", { defaultKey: "HKEY_LOCAL_MACHINE" });
			ordinary("filter.key");
			if (type === "KEYEXISTS") return;
			const defaultName = value("filter.valueName") === "";
			custom("targeting.defaultName", words.defaultName, "checkbox", defaultName, function(next) {
				capture();
				if (next) {
					state.valueName = value("filter.valueName");
					set("filter.valueName", "");
				} else set("filter.valueName", state.valueName === "" || state.valueName === null || state.valueName === void 0 ? null : state.valueName);
				rebuild(true);
			});
			ordinary("filter.valueName", { disabled: defaultName });
			ordinary("filter.valueType", { defaultKey: "" });
			if (type === "GETVALUE") ordinary("filter.variableName");
			if (type === "MATCHVALUE") {
				if (subtype === "VERSION") versionRange();
				else ordinary("filter.valueData");
			}
		}
		function userForm() {
			const mode = state.userMode || (value("filter.sid") ? "sid" : "name");
			state.userMode = mode;
			custom("targeting.userMatch", words.by, "select", mode, function(next) {
				capture();
				state.values[mode] = value("filter." + mode);
				state.userMode = next;
				set("filter." + mode, null);
				if (state.values[next] !== void 0) set("filter." + next, state.values[next]);
				rebuild(true);
			}, { choices: [{
				key: "name",
				label: words.name
			}, {
				key: "sid",
				label: words.sid
			}] });
			ordinary("filter." + mode);
		}
		function rebuild(skipCapture) {
			const annual = kind === "date" && value("filter.period") === "YEARLY" && value("filter.year") === null;
			const enteringAnnual = annual && !state.calendarActive;
			state.calendarActive = annual;
			const active = document.activeElement;
			const focusedField = container.getElement().contains(active) && active.closest("[data-field-id]");
			const focusedId = focusedField && focusedField.getAttribute("data-field-id");
			const focusedDay = focusedId && active.getAttribute("data-calendar-day");
			if (!skipCapture) capture();
			renderGeneration += 1;
			controls.splice(0);
			inputRecords.splice(0);
			container.getElement().replaceChildren();
			if (kind === "date") dateForm();
			else if (kind === "file") fileForm();
			else if (kind === "language") languageForm();
			else if (kind === "ip_range") ipRangeForm();
			else if (kind === "registry") registryForm();
			else if (kind === "user") userForm();
			else if (kind === "msi") {
				ordinary("filter.type");
				ordinary("filter.subtype", { onChange: function() {} });
				ordinary("filter.code");
				const subtype = value("filter.subtype");
				if (subtype === "VERSION") versionRange();
				else if (/^(GET|MATCH)_/.test(subtype || "")) {
					ordinary("filter.item");
					ordinary("filter.value", { label: /^GET_/.test(subtype) ? words.getValue : null });
				}
			} else if (kind === "terminal") {
				ordinary("filter.type");
				ordinary("filter.option", { onChange: function() {} });
				if (value("filter.option") === "IP") {
					ordinary("filter.min");
					ordinary("filter.max");
				} else if (value("filter.option") !== "NE") ordinary("filter.value");
			} else (SIMPLE[kind] || []).forEach(function(name) {
				if (name === "userContext") context();
				else ordinary("filter." + name, { disabled: kind === "group" && name === "primaryGroup" && value("filter.userContext") !== true });
			});
			const note$1 = note(kind, language);
			if (note$1) container.append(createElement("div", {
				className: "gpo-editor-field__hint gpo-editor-targeting-operands__note",
				text: note$1
			}));
			if (focusedId) {
				const focusedContainer = Array.from(container.getElement().querySelectorAll("[data-field-id]")).find(function(element) {
					return element.getAttribute("data-field-id") === focusedId;
				});
				const replacement = focusedContainer && (focusedDay && focusedContainer.querySelector("[data-calendar-day=\"" + focusedDay + "\"]") || focusedContainer.querySelector("[aria-pressed=\"true\"],input,select,textarea,button"));
				if (replacement && !replacement.disabled) replacement.focus({ preventScroll: true });
				else {
					const fallback = container.getElement().querySelector("input:not(:disabled),select:not(:disabled),textarea:not(:disabled),button:not(:disabled)");
					if (fallback) fallback.focus({ preventScroll: true });
				}
			}
			const pane = container.getElement().closest(".gpo-editor-filters__fields");
			if (enteringAnnual && pane) pane.scrollTop = 0;
		}
		rebuild();
		return {
			element: container,
			controls,
			readFields: function() {
				capture();
				return clone$2(working);
			},
			validate: function() {
				return validateFields(Object.assign({}, node, { fields: this.readFields() }));
			}
		};
	}
	//#endregion
	//#region src/components/templates/preference/targeting-tree.js
	/**
	* The condition tree of the targeting editor: the rows, drag and drop and keyboard reordering.
	* @param {any} context the editor's state and operations
	*/
	function createTargetingTree({ applyMove, blocked, capture, clearDrop, collapsed, container, descendant, destination, endDrag, fieldPayload, focusNode, focusOperands, formState, language, locate, nodeLabel, pt, renderFields, select, setNotice, syncToolbar, tree, ui }) {
		function summary(node) {
			if (node.kind === "ip_range" && fieldPayload(node, "filter.useIPv6") === true) {
				const address = fieldPayload(node, "filter.min"), prefix = fieldPayload(node, "filter.max");
				return address ? address + (prefix === null || prefix === void 0 || prefix === "" ? "" : "/" + prefix) : "";
			}
			const common = [
				"filter.bool",
				"filter.not",
				"filter.combine",
				"filter.negate",
				"filter.hidden",
				"filter.displayName",
				"filter.useIPv6"
			];
			const values = node.fields.filter(function(field) {
				return common.indexOf(field.id) === -1 && field.editable;
			}).map(function(field) {
				const value = valuePayload(field.value);
				const choice = (choices(node.kind, field.id, language) || field.choices || []).find(function(candidate) {
					return candidate.key === value;
				});
				if (field.id === "filter.languageLocale") return fieldPayload(node, "filter.displayName") || choice && choice.label || value;
				return choice ? choice.label : value;
			}).filter(function(value) {
				return value !== null && value !== void 0 && value !== "" && typeof value !== "boolean";
			});
			return values.length ? values.map(function(value) {
				return Array.isArray(value) ? value.join(", ") : String(value);
			}).join(" · ") : node.detail || "";
		}
		function renderTree() {
			tree.getElement().innerHTML = "";
			let first = true;
			function append(nodes, depth) {
				nodes.forEach(function(node, index) {
					const combine = String(fieldPayload(node, "filter.bool") || fieldPayload(node, "filter.combine") || node.combine || "and").toLowerCase();
					let logic = index === 0 ? "" : pt(combine === "or" ? "targetingOr" : "targetingAnd") + " ";
					let negate = fieldPayload(node, "filter.not");
					if (negate === null || negate === void 0) negate = fieldPayload(node, "filter.negate");
					if (negate === null || negate === void 0) negate = node.negate;
					if (negate) logic += pt("targetingNot") + " ";
					const row = createElement("div", {
						className: [
							"gpo-editor-filter-node",
							node.id === ui.selectedId ? "active" : null,
							fieldPayload(node, "filter.hidden") ? "is-hidden-filter" : null,
							ui.errorIds.has(node.id) ? "gpo-editor-filter-node--error" : null
						],
						attrs: {
							role: "treeitem",
							"data-targeting-id": node.id,
							"aria-level": depth + 1,
							"aria-selected": String(node.id === ui.selectedId),
							"aria-expanded": node.supports_children ? String(!collapsed.has(node.id)) : null,
							tabindex: node.id === ui.selectedId || !ui.selectedId && first ? "0" : "-1"
						},
						style: { paddingLeft: depth * 18 + 4 + "px" }
					});
					first = false;
					const handle = createElement("button", {
						className: "gpo-editor-filter-handle",
						attrs: {
							type: "button",
							draggable: blocked() ? "false" : "true",
							disabled: blocked() ? "disabled" : null,
							tabindex: "-1",
							"aria-label": pt("dragTargetingItem"),
							title: pt("dragTargetingItem")
						},
						html: "<svg width=\"12\" height=\"16\" viewBox=\"0 0 12 16\" aria-hidden=\"true\" focusable=\"false\" fill=\"currentColor\"><circle cx=\"6\" cy=\"3\" r=\"1\"/><circle cx=\"6\" cy=\"8\" r=\"1\"/><circle cx=\"6\" cy=\"13\" r=\"1\"/></svg>"
					});
					handle.on("click", function(event) {
						event.stopPropagation();
						select(node.id, true);
					});
					handle.on("dragstart", function(event) {
						if (blocked()) {
							event.preventDefault();
							return;
						}
						capture();
						ui.selectedId = node.id;
						ui.dragId = node.id;
						ui.dropTarget = null;
						renderFields();
						syncToolbar();
						tree.getElement().querySelectorAll("[data-targeting-id]").forEach(function(element) {
							const selected = element.getAttribute("data-targeting-id") === node.id;
							element.classList.toggle("active", selected);
							element.setAttribute("aria-selected", String(selected));
							element.setAttribute("tabindex", selected ? "0" : "-1");
						});
						event.dataTransfer.effectAllowed = "move";
						event.dataTransfer.setData("text/plain", node.id);
						container.addClass("is-dragging");
						row.addClass("active");
					});
					handle.on("dragend", endDrag);
					row.append(handle);
					const arrow = createElement("button", {
						className: "gpo-editor-filter-arrow",
						attrs: {
							type: "button",
							tabindex: "-1",
							"aria-label": pt(collapsed.has(node.id) ? "expandTargetingCollection" : "collapseTargetingCollection"),
							disabled: !node.supports_children ? "disabled" : null
						},
						text: node.supports_children ? collapsed.has(node.id) ? "›" : "⌄" : ""
					});
					arrow.on("click", function(event) {
						event.stopPropagation();
						capture();
						if (formState.busy) return;
						if (collapsed.has(node.id)) collapsed.delete(node.id);
						else {
							collapsed.add(node.id);
							if (ui.selectedId && ui.selectedId !== node.id && descendant(node, ui.selectedId)) {
								ui.selectedId = node.id;
								renderFields();
								syncToolbar();
							}
						}
						renderTree();
						focusNode(ui.selectedId || node.id);
					});
					row.append(arrow);
					row.append(createElement("span", {
						className: ["gpo-editor-filter-icon", targeting(node.supports_children ? "collection" : node.kind)],
						attrs: { "aria-hidden": "true" }
					}));
					row.append(createElement("span", {
						className: "gpo-editor-filter-label",
						children: [createElement("span", { text: logic + nodeLabel(node) }), createElement("span", {
							className: "gpo-editor-filter-detail",
							text: summary(node)
						})]
					}));
					row.on("click", function(event) {
						event.stopPropagation();
						if (!formState.busy) select(node.id, true);
					});
					row.on("dblclick", function(event) {
						if (event.target.closest("button,input,select,textarea,[contenteditable]:not([contenteditable=\"false\"])")) return;
						event.preventDefault();
						event.stopPropagation();
						focusOperands(node.id);
					});
					row.on("dragover", function(event) {
						if (!ui.dragId || blocked()) return;
						event.preventDefault();
						event.stopPropagation();
						clearDrop();
						ui.dropTarget = destination(node, event, row.getElement());
						event.dataTransfer.dropEffect = ui.dropTarget.valid ? "move" : "none";
						row.addClass(ui.dropTarget.valid ? "targeting-drop-" + ui.dropTarget.where : "targeting-drop-invalid");
					});
					row.on("drop", function(event) {
						if (!ui.dragId || !ui.dropTarget) return;
						event.preventDefault();
						event.stopPropagation();
						const target = ui.dropTarget;
						ui.selectedId = ui.dragId;
						if (target.valid) applyMove(target.parentId, target.index);
						else setNotice(pt("invalidTargetingMove"));
						endDrag();
					});
					tree.append(row);
					if (!collapsed.has(node.id)) append(node.children, depth + 1);
				});
			}
			append(ui.draft.roots, 0);
			if (!ui.draft.roots.length) tree.append(createElement("div", {
				className: "gpo-editor-filters__empty",
				text: pt("targetingEmpty")
			}));
			const rootDrop = createElement("div", {
				className: "gpo-editor-filters__root-drop",
				text: pt("targetingRootDrop")
			});
			rootDrop.on("dragover", function(event) {
				if (!ui.dragId || blocked()) return;
				event.preventDefault();
				clearDrop();
				const source = locate(ui.dragId);
				ui.dropTarget = {
					parentId: null,
					index: ui.draft.roots.length - (source && !source.parent ? 1 : 0),
					valid: true
				};
				rootDrop.addClass("targeting-drop-inside");
			});
			rootDrop.on("drop", function(event) {
				if (!ui.dragId || !ui.dropTarget) return;
				event.preventDefault();
				ui.selectedId = ui.dragId;
				applyMove(ui.dropTarget.parentId, ui.dropTarget.index);
				endDrag();
			});
			tree.append(rootDrop);
			if (ui.navigation) ui.navigation.sync();
		}
		return {
			renderTree,
			summary
		};
	}
	//#endregion
	//#region src/components/templates/preference/targeting-editor.js
	function render$1(options) {
		const pt = options.pt;
		const readonly = Boolean(options.readonly);
		const formState = options.formState;
		const kinds = options.showResult.filter_kinds || [];
		const ui = {
			accepted: create(options.showResult),
			draft: null,
			selectedId: null,
			selectedControls: [],
			selectedOperands: null,
			combineTouched: false,
			notTouched: false,
			errorIds: /* @__PURE__ */ new Set(),
			dragId: null,
			dropTarget: null,
			navigation: null
		};
		ui.draft = ui.accepted.clone();
		const language = options.language || "en";
		const collapsed = /* @__PURE__ */ new Set();
		const container = createElement("div", { className: "gpo-editor-filters" });
		const toolbar = createElement("div", { className: "gpo-editor-filters__toolbar" });
		const notice = createElement("div", {
			className: "gpo-editor-filters__notice",
			attrs: {
				role: "status",
				"aria-live": "polite"
			}
		});
		const tree = createElement("div", {
			className: "gpo-editor-filters__tree",
			attrs: {
				role: "tree",
				"aria-label": pt("targettingTitle")
			}
		});
		const properties = createElement("div", { className: "gpo-editor-filters__fields" });
		const menu = createElement("div", {
			className: "gpo-editor-filters__menu",
			attrs: {
				role: "menu",
				hidden: "hidden"
			}
		});
		const collectionKind = kinds.find(function(kind) {
			return kind.supports_children || kind.kind === "collection";
		});
		const createButton = createElement("button", {
			className: ["button", "gpo-editor-filter-add"],
			attrs: {
				type: "button",
				"aria-haspopup": "menu",
				"aria-expanded": "false"
			},
			text: pt("createTargetingItem") + " ▾"
		});
		const addCollection = createElement("button", {
			className: "button",
			attrs: { type: "button" },
			text: pt("addTargetingCollection")
		});
		const combineSelect = createElement("select", {
			attrs: { "aria-label": pt("targetingOperator") },
			children: [createElement("option", {
				attrs: { value: "and" },
				text: pt("targetingAnd")
			}), createElement("option", {
				attrs: { value: "or" },
				text: pt("targetingOr")
			})]
		});
		const notCheckbox = createElement("input", { attrs: {
			type: "checkbox",
			"aria-label": pt("targetingNot")
		} });
		const removeButton = createElement("button", {
			className: ["button", "gpo-editor-filter-remove"],
			attrs: {
				type: "button",
				"aria-label": pt("removeFilter"),
				title: pt("removeFilter")
			},
			children: [createElement("span", {
				attrs: { "aria-hidden": "true" },
				html: "<svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.6\"><path d=\"M3 6h18M9 6V3h6v3M6 6l1 15h10l1-15M10 10v7M14 10v7\"/></svg>"
			})]
		});
		const shortcutHelp = createElement("span", {
			className: "gpo-editor-visually-hidden",
			id: "gpo-targeting-shortcuts",
			text: pt("targetingKeyboardHelp")
		});
		tree.setAttr("aria-describedby", "gpo-targeting-shortcuts");
		function blocked() {
			return readonly || formState.busy;
		}
		function locate(id, nodes, parent) {
			const list = nodes || ui.draft.roots;
			for (let i = 0; i < list.length; i += 1) {
				if (list[i].id === id) return {
					node: list[i],
					parent: parent || null,
					siblings: list,
					index: i
				};
				const child = locate(id, list[i].children, list[i]);
				if (child) return child;
			}
			return null;
		}
		function descendant(node, id) {
			return node.id === id || node.children.some(function(child) {
				return descendant(child, id);
			});
		}
		function capture() {
			const location = locate(ui.selectedId);
			const node = location && location.node;
			if (!node || !node.available) return;
			const operands = new Map((ui.selectedOperands ? ui.selectedOperands.readFields() : []).map(function(field) {
				return [field.id, field];
			}));
			const common = [
				"filter.bool",
				"filter.not",
				"filter.combine",
				"filter.negate",
				"filter.hidden"
			];
			ui.draft.updateFields(node.id, node.fields.map(function(current) {
				const field = common.indexOf(current.id) === -1 && operands.has(current.id) ? operands.get(current.id) : current;
				const value = clone$2(field.value);
				if (ui.combineTouched && location.index > 0 && (field.id === "filter.bool" || field.id === "filter.combine") && field.editable !== false) value.value = combineSelect.getElement().value;
				if (ui.notTouched && (field.id === "filter.not" || field.id === "filter.negate") && field.editable !== false) value.value = notCheckbox.getElement().checked;
				return Object.assign({}, field, { value });
			}));
		}
		function setNotice(message) {
			notice.setText(message || "");
		}
		function hideMenu() {
			menu.getElement().hidden = true;
			createButton.setAttr("aria-expanded", "false");
		}
		function syncToolbar() {
			createButton.getElement().disabled = blocked() || !kinds.length;
			addCollection.getElement().disabled = blocked() || !collectionKind;
			removeButton.getElement().disabled = blocked() || !ui.selectedId;
			const location = locate(ui.selectedId);
			const node = location && location.node;
			const combine = node && node.fields.find(function(field) {
				return field.id === "filter.bool" || field.id === "filter.combine";
			});
			const negate = node && node.fields.find(function(field) {
				return field.id === "filter.not" || field.id === "filter.negate";
			});
			combineSelect.getElement().disabled = blocked() || !node || location.index === 0 || !node.available || !combine || combine.editable === false;
			notCheckbox.getElement().disabled = blocked() || !node || !node.available || !negate || negate.editable === false;
			combineSelect.getElement().value = combine ? valuePayload(combine.value) : "and";
			notCheckbox.getElement().checked = Boolean(negate && valuePayload(negate.value));
			ui.combineTouched = false;
			ui.notTouched = false;
		}
		function focusNode(id) {
			const row = Array.from(tree.getElement().querySelectorAll("[data-targeting-id]")).find(function(element) {
				return element.getAttribute("data-targeting-id") === id;
			});
			if (row) {
				row.focus({ preventScroll: true });
				row.scrollIntoView({ block: "nearest" });
			}
		}
		function select(id, focus) {
			capture();
			ui.selectedId = id;
			let current = locate(id);
			while (current && current.parent) {
				collapsed.delete(current.parent.id);
				current = locate(current.parent.id);
			}
			renderTree();
			renderFields();
			syncToolbar();
			if (focus) focusNode(id);
		}
		function focusOperands(id) {
			if (blocked()) return;
			if (ui.selectedId !== id) select(id);
			const control = properties.getElement().querySelector("input:not(:disabled),select:not(:disabled),textarea:not(:disabled),button:not(:disabled),[contenteditable=\"true\"]");
			if (control) control.focus({ preventScroll: true });
			else {
				properties.setAttr("tabindex", "-1");
				properties.getElement().focus({ preventScroll: true });
			}
		}
		function fieldPayload(node, id) {
			const field = node.fields.find(function(candidate) {
				return candidate.id === id;
			});
			return field ? valuePayload(field.value) : null;
		}
		const { renderTree } = createTargetingTree({
			applyMove,
			blocked,
			capture,
			clearDrop,
			collapsed,
			container,
			descendant,
			destination,
			endDrag,
			fieldPayload,
			focusNode,
			focusOperands,
			formState,
			language,
			locate,
			nodeLabel,
			pt,
			renderFields,
			select,
			setNotice,
			syncToolbar,
			tree,
			ui
		});
		function clearDrop() {
			tree.getElement().querySelectorAll(".targeting-drop-before, .targeting-drop-after, .targeting-drop-inside, .targeting-drop-invalid").forEach(function(row) {
				row.classList.remove("targeting-drop-before", "targeting-drop-after", "targeting-drop-inside", "targeting-drop-invalid");
			});
			ui.dropTarget = null;
		}
		function endDrag() {
			clearDrop();
			ui.dragId = null;
			container.removeClass("is-dragging");
		}
		function destination(node, event, row) {
			const box = row.getBoundingClientRect();
			const offset = (event.clientY - box.top) / Math.max(1, box.height);
			const where = node.supports_children && offset > .25 && offset < .75 ? "inside" : offset > .5 ? "after" : "before";
			const location = locate(node.id);
			const parent = where === "inside" ? node : location.parent;
			let index = where === "inside" ? node.children.length : location.index + (where === "after" ? 1 : 0);
			const source = locate(ui.dragId);
			if (source && source.parent === parent && source.index < index) index -= 1;
			return {
				parentId: parent && parent.id,
				index,
				where,
				valid: Boolean(source && node.id !== ui.dragId && (!parent || !descendant(source.node, parent.id)))
			};
		}
		function applyMove(parentId, index) {
			if (blocked() || !ui.selectedId) return;
			capture();
			try {
				const source = locate(ui.selectedId);
				const noop = source && (source.parent && source.parent.id || null) === (parentId || null) && source.index === index;
				const changed = ui.draft.move(ui.selectedId, parentId, index);
				if (parentId) collapsed.delete(parentId);
				setNotice(changed ? pt("targetingMoved") : noop ? "" : pt("targetingDepthLimit"));
				renderTree();
				syncToolbar();
				focusNode(ui.selectedId);
			} catch (_) {
				setNotice(pt("invalidTargetingMove"));
			}
		}
		function renderFields() {
			properties.getElement().innerHTML = "";
			ui.selectedControls = [];
			ui.selectedOperands = null;
			const node = ui.draft.find(ui.selectedId);
			container.setAttr("data-selected-kind", node && node.kind || "");
			if (!node) {
				properties.append(createElement("div", {
					className: "gpo-editor-filters__empty",
					text: pt("selectFilter")
				}));
				return;
			}
			properties.append(createElement("h3", { text: nodeLabel(node) }));
			if (!node.available) {
				properties.append(createElement("div", {
					className: "gpo-editor-preference-notice",
					text: pt("unsupportedFilterFields")
				}));
				return;
			}
			ui.selectedOperands = render$2({
				node,
				blocked: blocked(),
				scope: options.scope,
				language,
				fieldControl: options.fieldControl,
				pt,
				onChange: function() {
					capture();
					ui.errorIds.clear();
					setNotice("");
					renderTree();
				}
			});
			ui.selectedControls = ui.selectedOperands.controls;
			properties.append(ui.selectedOperands.element);
		}
		function nodeLabel(node) {
			if (node.supports_children) return fieldPayload(node, "filter.name") || node.label || kindLabel(node.kind, node.kind, language);
			return kindLabel(node.kind, node.label || node.kind || pt("unsupportedFilterFields"), language);
		}
		function add(kind) {
			if (blocked()) return;
			capture();
			hideMenu();
			const location = locate(ui.selectedId);
			const parentId = location && location.node.supports_children ? location.node.id : location && location.parent ? location.parent.id : null;
			const index = location && location.node.supports_children ? location.node.children.length : location ? location.index + 1 : ui.draft.roots.length;
			const node = ui.draft.add(kind, parentId, index);
			if (!node) {
				setNotice(pt("targetingDepthLimit"));
				return;
			}
			ui.draft.updateFields(node.id, initialize(node, {
				language,
				scope: options.scope
			}));
			if (parentId) collapsed.delete(parentId);
			ui.selectedId = node.id;
			setNotice("");
			renderTree();
			renderFields();
			syncToolbar();
			focusNode(ui.selectedId);
		}
		function remove() {
			if (blocked() || !ui.selectedId) return;
			capture();
			const location = locate(ui.selectedId);
			if (!location) return;
			const removedId = ui.selectedId;
			const siblings = location.siblings.map(function(node) {
				return node.id;
			});
			if (!ui.draft.remove(removedId)) return;
			ui.selectedId = neighbor(siblings, [removedId], location.siblings.map(function(node) {
				return node.id;
			})) || (location.parent ? location.parent.id : null);
			setNotice("");
			renderTree();
			renderFields();
			syncToolbar();
			if (ui.selectedId) focusNode(ui.selectedId);
			else tree.getElement().focus({ preventScroll: true });
		}
		kinds.filter(function(kind) {
			return !kind.supports_children && kind.kind !== "collection";
		}).forEach(function(kind) {
			if (options.scope === "computer" && [
				"dun",
				"terminal",
				"user"
			].indexOf(kind.kind) !== -1) return;
			menu.append(createElement("button", {
				attrs: {
					type: "button",
					role: "menuitem",
					"data-kind": kind.kind
				},
				children: [createElement("span", {
					className: ["gpo-editor-filter-icon", targeting(kind.kind)],
					attrs: { "aria-hidden": "true" }
				}), createElement("span", { text: kindLabel(kind.kind, kind.label || kind.kind, language) })],
				events: { click: function() {
					add(kind.kind);
				} }
			}));
		});
		createButton.on("click", function() {
			if (blocked()) return;
			menu.getElement().hidden = !menu.getElement().hidden;
			createButton.setAttr("aria-expanded", String(!menu.getElement().hidden));
			if (!menu.getElement().hidden && menu.getElement().firstElementChild)
 /** @type {HTMLElement} */ menu.getElement().firstElementChild.focus();
		});
		menu.on("keydown", function(event) {
			const entries = Array.from(menu.getElement().querySelectorAll("button"));
			const index = entries.indexOf(document.activeElement);
			if (event.key === "Escape") {
				event.preventDefault();
				hideMenu();
				createButton.getElement().focus();
			}
			if (event.key === "ArrowDown" || event.key === "ArrowUp") {
				event.preventDefault();
				entries[(index + (event.key === "ArrowDown" ? 1 : entries.length - 1)) % entries.length].focus();
			}
		});
		addCollection.on("click", function() {
			if (collectionKind) add(collectionKind.kind);
		});
		removeButton.on("click", remove);
		combineSelect.on("change", function() {
			if (combineSelect.getElement().disabled) return;
			ui.combineTouched = true;
			capture();
			renderTree();
		});
		notCheckbox.on("change", function() {
			ui.notTouched = true;
			capture();
			renderTree();
		});
		tree.on("click", function(event) {
			if (event.target === tree.getElement()) select(null);
		});
		tree.on("keydown", function(event) {
			if (event.defaultPrevented || formState.busy || event.altKey || event.metaKey || event.target.closest("input,select,textarea,a,summary,[contenteditable]:not([contenteditable=\"false\"])")) return;
			const row = event.target.closest("[data-targeting-id]");
			if (!row) return;
			const id = row.getAttribute("data-targeting-id");
			const location = locate(id);
			if (!location) return;
			if (event.ctrlKey && !blocked() && (event.key === "ArrowUp" || event.key === "ArrowDown")) {
				event.preventDefault();
				select(id, true);
				applyMove(location.parent && location.parent.id, Math.max(0, Math.min(location.siblings.length - 1, location.index + (event.key === "ArrowUp" ? -1 : 1))));
				return;
			}
			if (event.ctrlKey && !blocked() && (event.key === "ArrowLeft" || event.key === "ArrowRight")) {
				event.preventDefault();
				select(id, true);
				if (event.key === "ArrowLeft" && location.parent) {
					const parentLocation = locate(location.parent.id);
					applyMove(parentLocation.parent && parentLocation.parent.id, parentLocation.index + 1);
				} else if (event.key === "ArrowRight" && location.index > 0 && location.siblings[location.index - 1].supports_children) {
					const previous = location.siblings[location.index - 1];
					applyMove(previous.id, previous.children.length);
				} else setNotice(pt("targetingKeyboardMoveUnavailable"));
				return;
			}
			if (event.ctrlKey || event.shiftKey || event.target.closest("button")) return;
			if (event.key === "ArrowRight" && location.node.supports_children) {
				event.preventDefault();
				if (collapsed.has(id)) {
					collapsed.delete(id);
					renderTree();
					focusNode(id);
				} else if (location.node.children.length) select(location.node.children[0].id, true);
			} else if (event.key === "ArrowLeft") {
				event.preventDefault();
				if (location.node.supports_children && !collapsed.has(id)) {
					collapsed.add(id);
					renderTree();
					focusNode(id);
				} else if (location.parent) select(location.parent.id, true);
			}
		});
		ui.navigation = bind$1(tree.getElement(), {
			rows: function() {
				return tree.getElement().querySelectorAll("[data-targeting-id]");
			},
			selected: function() {
				return Array.from(tree.getElement().querySelectorAll("[data-targeting-id]")).find(function(row) {
					return row.getAttribute("data-targeting-id") === ui.selectedId;
				}) || null;
			},
			select: function(row) {
				select(row.getAttribute("data-targeting-id"));
			},
			activate: function(row) {
				focusOperands(row.getAttribute("data-targeting-id"));
			},
			remove,
			canActivate: function(row) {
				const node = ui.draft.find(row.getAttribute("data-targeting-id"));
				return !readonly && Boolean(node && node.available);
			},
			canRemove: function() {
				return !readonly;
			},
			busy: function() {
				return Boolean(formState.busy || ui.dragId);
			}
		});
		container.cleanup = function() {
			endDrag();
			ui.navigation.cleanup();
		};
		container.on("keydown", function(event) {
			if (event.key === "Escape" && (ui.dragId || !menu.getElement().hidden)) {
				event.preventDefault();
				event.stopPropagation();
				endDrag();
				hideMenu();
			}
		});
		container.on("input", function() {
			ui.errorIds.clear();
			setNotice("");
		});
		container.on("click", function(event) {
			if (!event.target.closest(".gpo-editor-filters__create")) hideMenu();
		});
		toolbar.append(createElement("div", {
			className: "gpo-editor-filters__create",
			children: [createButton, menu]
		}));
		toolbar.append(addCollection);
		toolbar.append(createElement("label", {
			className: "gpo-editor-filter-operator",
			attrs: { "data-field-id": "filter.bool" },
			children: [combineSelect]
		}));
		toolbar.append(createElement("label", {
			className: "gpo-editor-filter-negation",
			attrs: { "data-field-id": "filter.not" },
			children: [notCheckbox, createElement("span", { text: pt("targetingNot") })]
		}));
		toolbar.append(removeButton);
		container.append(toolbar);
		container.append(shortcutHelp);
		container.append(notice);
		container.append(createElement("div", {
			className: "gpo-editor-filters__layout",
			children: [tree, properties]
		}));
		formState.beginFilterDraft = function() {
			ui.draft = ui.accepted.clone();
			ui.selectedId = null;
			ui.selectedControls = [];
			ui.selectedOperands = null;
			ui.errorIds.clear();
			setNotice("");
			hideMenu();
			renderTree();
			renderFields();
			syncToolbar();
		};
		formState.cancelFilterDraft = function() {
			formState.beginFilterDraft();
		};
		formState.acceptFilterDraft = function() {
			capture();
			const result = validatedResult(ui.draft);
			ui.errorIds = new Set(result.errors.map(function(error) {
				return error.id;
			}));
			if (result.errors.length) {
				select(result.errors[0].id);
				setNotice(pt("validationFixErrors"));
				result.errors.filter(function(error) {
					return error.id === ui.selectedId;
				}).forEach(function(error) {
					ui.selectedControls.filter(function(control) {
						return control.id === error.fieldId;
					}).forEach(function(control) {
						control.setError(options.validationMessage(error.code));
					});
				});
				const first = ui.selectedControls.find(function(control) {
					return control.id === result.errors[0].fieldId;
				});
				if (first) first.focus();
				return false;
			}
			ui.accepted = ui.draft.clone();
			if (result.operations.length) formState.dirty = true;
			return true;
		};
		formState.readFilterResult = function() {
			const result = validatedResult(ui.accepted);
			return {
				operations: result.operations,
				errors: result.errors.map(function(error) {
					return {
						path: ui.accepted.flatten().find(function(entry) {
							return entry.node.id === error.id;
						}).path,
						id: error.fieldId,
						code: error.code
					};
				})
			};
		};
		function validatedResult(model) {
			return model.compile({ validateNode: function(node) {
				if (supportedKinds.indexOf(node.kind) === -1) return null;
				const errors = [];
				node.fields.forEach(function(field) {
					if (field.editable === false || [
						"filter.bool",
						"filter.not",
						"filter.combine",
						"filter.negate",
						"filter.hidden"
					].indexOf(field.id) === -1) return;
					const code = validatePreferenceField(field, field.value);
					if (code) errors.push({
						fieldId: field.id,
						code
					});
				});
				return errors.concat(validateFields(node));
			} });
		}
		renderTree();
		renderFields();
		syncToolbar();
		return container;
	}
	//#endregion
	//#region src/components/templates/preference/view/targeting-modal.js
	/**
	* The targeting modal of the preference form: a second dialog over the form (which is dimmed and inert while it
	* is open) that hosts the filter editor. OK keeps the filter draft, Cancel and Close drop it; read-only forms only close.
	* @param {{ host: HTMLElement, filterSection: any, readonly: boolean, formState: any,
	*   getForm: () => HTMLElement, getOpener: () => HTMLElement }} options
	*   `host` is the container the form's own dialog lives in; the modal is added to it on first use.
	*/
	function createTargetingModal({ host, filterSection, readonly, formState, getForm, getOpener }) {
		let dialog = null;
		let backdrop = null;
		const wrap = ElementCreator.wrap;
		function close(accept) {
			if (accept && !readonly && !formState.acceptFilterDraft()) return;
			if (!accept) formState.cancelFilterDraft();
			if (dialog) {
				dialog.classList.remove("active");
				dialog.inert = true;
				backdrop.style.display = "none";
			}
			getForm().classList.remove("gpo-editor-preference-form--dimmed");
			getForm().inert = false;
			getOpener().focus();
		}
		function build() {
			const closeX = wrap(createCloseButton(pt("close")));
			closeX.on("click", function() {
				close(false);
			});
			const cancelButton = wrap(createButton("cancel", readonly ? pt("close") : pt("cancel")));
			cancelButton.on("click", function() {
				close(false);
			});
			const buttons = [cancelButton.getElement()];
			if (!readonly) {
				const okButton = wrap(createButton("apply", pt("targetingOk")));
				okButton.on("click", function() {
					close(true);
				});
				buttons.push(okButton.getElement());
			}
			const body = createBody(null);
			body.append(filterSection.getElement());
			const shell = createDialogShell({
				titleId: "gpo-editor-targeting-title",
				title: pt("targettingTitle"),
				body,
				closeButton: closeX.getElement(),
				buttons,
				width: "min(700px, calc(100vw - 40px))",
				fill: true,
				className: ["targetting__modal", readonly ? "gpo-editor-dialog--readonly" : null].filter(Boolean).join(" "),
				hostClassName: "gpo-editor-targeting-host"
			});
			backdrop = shell.host;
			dialog = shell.dialog;
			dialog.addEventListener("keydown", function(event) {
				if (event.defaultPrevented || event.target.closest("[role=\"dialog\"], [role=\"alertdialog\"]") !== dialog) return;
				if (event.key === "Escape") {
					event.preventDefault();
					close(false);
				}
				trapTab(event, dialog);
			});
			dialog.inert = true;
			backdrop.style.display = "none";
			host.appendChild(backdrop);
		}
		function open() {
			if (!dialog) build();
			else if (!backdrop.parentNode) host.appendChild(backdrop);
			backdrop.style.display = "";
			dialog.inert = false;
			dialog.classList.add("active");
			getForm().classList.add("gpo-editor-preference-form--dimmed");
			getForm().inert = true;
			const first = dialog.querySelector(".gpo-editor-filter-add:not(:disabled), [role=\"treeitem\"], .btn-cancel");
			if (first) first.focus();
			else dialog.focus();
		}
		return {
			open,
			close
		};
	}
	//#endregion
	//#region src/components/templates/preference/view/field-control.js
	function hiddenFieldControl(field) {
		return {
			id: field.id,
			field,
			read: function() {
				return clone$2(field.value);
			},
			setError: function() {},
			setDynamicDisabled: function() {
				return false;
			},
			focus: function() {}
		};
	}
	function buildControlInput(field, forceReadonly, materializeOptionalDefault, textarea) {
		const value = clone$2(field.value || {
			kind: "text",
			value: ""
		});
		const disabled = Boolean(forceReadonly || field.editable === false);
		const controlKind = field.control || "";
		let input;
		let inputElement = null;
		let optionalBooleanTouched = false;
		let checkboxValueKind = null;
		let checkboxControlId = null;
		function checkboxControl(checked) {
			const controlId = nextControlId();
			checkboxControlId = controlId;
			const checkbox = createElement("input", { attrs: {
				id: controlId,
				type: "checkbox",
				disabled: disabled ? "disabled" : null
			} });
			checkbox.getElement().checked = Boolean(checked);
			checkbox.on("change", function() {
				optionalBooleanTouched = true;
			});
			inputElement = checkbox.getElement();
			return createElement("span", {
				className: "gpo-editor-boolean",
				children: [checkbox, createElement("label", { attrs: {
					for: controlId,
					"aria-label": field.label || field.id
				} })]
			});
		}
		if (controlKind.indexOf("generated_") === 0) input = createElement("div", {
			className: "gpo-editor-field__generated",
			text: value.value === null || value.value === void 0 ? "" : String(value.value)
		});
		else if (value.kind === "boolean") input = checkboxControl(value.value);
		else if (value.kind === "optional_boolean") {
			checkboxValueKind = "optional_boolean";
			input = checkboxControl(value.value === true);
		} else if (controlKind === "optional_boolean_u8") {
			checkboxValueKind = "optional_boolean_u8";
			input = checkboxControl(value.value === 1);
		} else if (value.kind === "action") {
			input = createElement("select", {
				attrs: { disabled: disabled ? "disabled" : null },
				children: [
					"create",
					"replace",
					"update",
					"delete"
				].map(function(action) {
					return createElement("option", {
						attrs: { value: action },
						text: action
					});
				})
			});
			input.getElement().value = value.value;
		} else if (value.kind === "filter_combine") {
			input = createElement("select", {
				attrs: { disabled: disabled ? "disabled" : null },
				children: ["and", "or"].map(function(combine) {
					return createElement("option", {
						attrs: { value: combine },
						text: combine.toUpperCase()
					});
				})
			});
			input.getElement().value = value.value;
		} else if (controlKind === "choice") {
			input = createElement("select", {
				attrs: { disabled: disabled ? "disabled" : null },
				children: (Array.isArray(field.choices) ? field.choices : []).map(function(choice) {
					return createElement("option", {
						attrs: { value: choice.key },
						text: choice.label
					});
				})
			});
			input.getElement().value = value.value;
		} else if (value.kind === "text_list" || textarea) input = createElement("textarea", {
			attrs: { disabled: disabled ? "disabled" : null },
			text: Array.isArray(value.value) ? value.value.join("\n") : value.value === null || value.value === void 0 ? "" : String(value.value)
		});
		else if (value.kind === "optional_text") input = createElement("input", { attrs: {
			type: "text",
			disabled: disabled ? "disabled" : null,
			value: value.value === null ? "" : value.value
		} });
		else input = createElement("input", { attrs: {
			type: value.kind === "integer" || value.kind === "unsigned_byte" || value.kind === "optional_unsigned_byte" ? "number" : "text",
			min: value.kind.indexOf("unsigned") !== -1 ? 0 : null,
			max: value.kind.indexOf("unsigned_byte") !== -1 ? 255 : null,
			required: field.required ? "required" : null,
			disabled: disabled ? "disabled" : null,
			value: value.value === null || value.value === void 0 ? "" : value.value
		} });
		if (!inputElement) inputElement = input.getElement();
		const errorElement = createElement("span", { className: "gpo-editor-field__error" });
		let dynamicDisabled = false;
		function applyBaselineToInput() {
			if (checkboxValueKind === "optional_boolean_u8") inputElement.checked = value.value === 1;
			else if (checkboxValueKind === "optional_boolean") inputElement.checked = value.value === true;
			else if (value.kind === "boolean") inputElement.checked = Boolean(value.value);
			else if (Array.isArray(value.value)) inputElement.value = value.value.join("\n");
			else inputElement.value = value.value === null || value.value === void 0 ? "" : value.value;
			optionalBooleanTouched = false;
		}
		return {
			value,
			disabled,
			controlKind,
			input,
			inputElement,
			errorElement,
			checkboxControlId,
			read: function() {
				if (disabled || dynamicDisabled || controlKind.indexOf("generated_") === 0) return clone$2(value);
				if (checkboxValueKind && value.value === null && !materializeOptionalDefault && !optionalBooleanTouched) return clone$2(value);
				if (checkboxValueKind === "optional_boolean_u8") return {
					kind: value.kind,
					value: inputElement.checked ? 1 : 0
				};
				if (checkboxValueKind === "optional_boolean") return {
					kind: value.kind,
					value: Boolean(inputElement.checked)
				};
				return preferenceValueFromInput(value, inputElement.value, inputElement.checked);
			},
			setInputError: function(message) {
				if (inputElement && typeof inputElement.setAttribute === "function") {
					if (message) inputElement.setAttribute("aria-invalid", "true");
					else inputElement.removeAttribute("aria-invalid");
				}
				errorElement.setText(message || "");
			},
			setDynamicDisabled: function(nextDisabled) {
				if (controlKind.indexOf("generated_") === 0) return false;
				const next = Boolean(nextDisabled);
				if (next === dynamicDisabled) return false;
				dynamicDisabled = next;
				inputElement.disabled = Boolean(disabled || dynamicDisabled);
				if (dynamicDisabled) applyBaselineToInput();
				return true;
			},
			focus: function() {
				if (inputElement && typeof inputElement.focus === "function") inputElement.focus();
			}
		};
	}
	function fieldControl(field, forceReadonly, materializeOptionalDefault, options) {
		const opts = options || {};
		const builder = buildControlInput(field, forceReadonly, materializeOptionalDefault, false);
		const wrapSelect = Boolean(opts.wrapSelect) && valueKindIsSelect(builder);
		const wrapCheckbox = Boolean(opts.wrapCheckbox) && builder.checkboxControlId !== null;
		const builderIsInput = builder.checkboxControlId === null && builder.inputElement.tagName === "INPUT";
		const builderInputType = builderIsInput ? String(builder.inputElement.getAttribute("type") || "").toLowerCase() : "";
		const wrapText = builderIsInput && (builderInputType === "number" || Boolean(opts.wrapText) && builderInputType === "text");
		let element;
		if (wrapCheckbox) element = createElement("div", {
			className: [
				"field",
				"field__checkbox",
				"gpo-editor-field",
				builder.disabled ? "gpo-editor-field--readonly" : null
			],
			attrs: { "data-field-id": field.id },
			children: [
				createElement("div", {
					className: "field__label",
					children: [createElement("label", {
						className: "gpo-editor-field__label",
						attrs: { for: builder.checkboxControlId },
						children: [createElement("span", { text: field.label || field.id }), field.required ? createElement("span", {
							className: "gpo-editor-field__required",
							text: "*"
						}) : null]
					})]
				}),
				createElement("div", {
					className: "field__element",
					children: [builder.input]
				}),
				builder.disabled ? createElement("span", {
					className: "gpo-editor-field__hint",
					text: pt("readonly")
				}) : null,
				builder.errorElement
			]
		});
		else if (wrapText) element = createElement("div", {
			className: [
				"field",
				"field__input",
				"gpo-editor-field",
				builder.disabled ? "gpo-editor-field--readonly" : null
			],
			attrs: { "data-field-id": field.id },
			children: [
				createElement("div", {
					className: "field__label",
					children: [createElement("span", {
						className: "gpo-editor-field__label",
						children: [createElement("span", { text: field.label || field.id }), field.required ? createElement("span", {
							className: "gpo-editor-field__required",
							text: "*"
						}) : null]
					})]
				}),
				createElement("div", {
					className: "field__element",
					children: [builder.input, builder.errorElement]
				}),
				builder.disabled ? createElement("span", {
					className: "gpo-editor-field__hint",
					text: pt("readonly")
				}) : null
			]
		});
		else element = createElement("div", {
			className: [
				"gpo-editor-field",
				wrapSelect ? "field" : null,
				builder.disabled ? "gpo-editor-field--readonly" : null
			],
			attrs: { "data-field-id": field.id },
			children: wrapSelect ? [
				createElement("div", {
					className: "field__label",
					children: [createElement("span", {
						className: "gpo-editor-field__label",
						children: [createElement("span", { text: field.label || field.id }), field.required ? createElement("span", {
							className: "gpo-editor-field__required",
							text: "*"
						}) : null]
					})]
				}),
				createElement("div", {
					className: "field__element",
					children: [builder.input]
				}),
				builder.disabled ? createElement("span", {
					className: "gpo-editor-field__hint",
					text: pt("readonly")
				}) : null,
				builder.errorElement
			] : [
				createElement("span", {
					className: "gpo-editor-field__label",
					children: [createElement("span", { text: field.label || field.id }), field.required ? createElement("span", {
						className: "gpo-editor-field__required",
						text: "*"
					}) : null]
				}),
				builder.input,
				builder.disabled ? createElement("span", {
					className: "gpo-editor-field__hint",
					text: pt("readonly")
				}) : null,
				builder.errorElement
			]
		});
		let lastError = "";
		function applyError(message) {
			lastError = message || "";
			element.getElement().classList.toggle("gpo-editor-field--error", Boolean(message));
			builder.setInputError(message);
		}
		if (!builder.disabled) builder.inputElement.addEventListener("input", function() {
			if (lastError) applyError("");
		});
		return {
			id: field.id,
			field,
			element,
			read: builder.read,
			setError: applyError,
			setDynamicDisabled: function(nextDisabled) {
				if (!builder.setDynamicDisabled(nextDisabled)) return false;
				element.getElement().classList.toggle("gpo-editor-field--readonly", Boolean(nextDisabled));
				if (nextDisabled) {
					lastError = "";
					element.getElement().classList.remove("gpo-editor-field--error");
					builder.setInputError("");
				}
				return true;
			},
			focus: builder.focus
		};
	}
	function mockupFieldControl(field, forceReadonly, materializeOptionalDefault, options) {
		const opts = options || {};
		const builder = buildControlInput(field, forceReadonly, materializeOptionalDefault, Boolean(opts.textarea));
		const checkboxLike = builder.value.kind === "boolean" || builder.value.kind === "optional_boolean" || builder.controlKind === "optional_boolean_u8";
		let element;
		if (checkboxLike) element = createElement("div", {
			className: [
				"field",
				"field__checkbox",
				builder.disabled ? "field--readonly" : null
			],
			attrs: { "data-field-id": field.id },
			children: [createElement("label", { children: [builder.input, createElement("span", {
				className: "field__label-checkbox",
				text: field.label || field.id
			})] }), builder.errorElement]
		});
		else {
			const fieldClasses = ["field", "field__input"];
			if (opts.textarea) fieldClasses.push("field__description", "h-auto");
			else if (builder.controlKind === "directory_path" || builder.controlKind === "file_path") fieldClasses.push("field__input--path");
			else if (valueKindIsSelect(builder)) fieldClasses.push("select");
			element = createElement("div", {
				className: fieldClasses,
				attrs: { "data-field-id": field.id },
				children: [createElement("div", {
					className: "field__label",
					children: [createElement("span", { text: field.label || field.id }), field.required ? createElement("span", {
						className: "gpo-editor-field__required",
						text: "*"
					}) : null]
				}), createElement("div", {
					className: "field__element",
					children: [builder.input, builder.errorElement]
				})]
			});
		}
		let lastError = "";
		function applyError(message) {
			lastError = message || "";
			element.getElement().classList.toggle("gpo-editor-field--error", Boolean(message));
			builder.setInputError(message);
		}
		if (!builder.disabled) builder.inputElement.addEventListener("input", function() {
			if (lastError) applyError("");
		});
		return {
			id: field.id,
			field,
			element,
			read: builder.read,
			setError: applyError,
			setDynamicDisabled: function(nextDisabled) {
				if (!builder.setDynamicDisabled(nextDisabled)) return false;
				element.getElement().classList.toggle("field--readonly", Boolean(nextDisabled));
				if (nextDisabled) {
					lastError = "";
					element.getElement().classList.remove("gpo-editor-field--error");
					builder.setInputError("");
				}
				return true;
			},
			focus: builder.focus
		};
	}
	function valueKindIsSelect(builder) {
		return builder.value.kind === "action" || builder.value.kind === "filter_combine" || builder.controlKind === "choice";
	}
	var nextFieldControlId = 1;
	function nextControlId() {
		return "gpo-preference-field-" + nextFieldControlId++;
	}
	//#endregion
	//#region src/components/templates/preference/view/field-tabs.js
	function buildPlaceholderCheckbox(entry) {
		const label = entry && entry.label || (entry && entry.labelKey ? pt(entry.labelKey) : "");
		const controlId = nextControlId();
		return createElement("div", {
			className: [
				"field",
				"field__checkbox",
				"field--readonly"
			],
			children: [createElement("label", { children: [createElement("span", {
				className: "gpo-editor-boolean",
				children: [createElement("input", { attrs: {
					id: controlId,
					type: "checkbox",
					disabled: "disabled"
				} }), createElement("label", { attrs: {
					for: controlId,
					"aria-label": label
				} })]
			}), createElement("span", {
				className: "field__label-checkbox",
				text: label
			})] })]
		});
	}
	function isMetadataField(field) {
		return String(field && field.id || "").indexOf("metadata.") === 0;
	}
	function isGeneralTabField(field) {
		return isMetadataField(field) || Boolean(field) && field.id === "properties.disabled";
	}
	function isBasicTabField(field) {
		return !isGeneralTabField(field);
	}
	function orderedTabEntries(fields, layoutEntries, predicate) {
		const layout = Array.isArray(layoutEntries) ? layoutEntries : [];
		const belongs = typeof predicate === "function" ? predicate : function() {
			return true;
		};
		const result = [];
		const placed = {};
		layout.forEach(function(entry) {
			const item = clone$2(entry || {});
			if (!item.field) {
				if (item.line) result.push({ line: true });
				if (item.placeholder) result.push(item);
				return;
			}
			const field = fields.find(function(candidate) {
				return candidate.id === item.field;
			});
			if (!field || !belongs(field)) return;
			placed[item.field] = true;
			result.push(item);
		});
		fields.forEach(function(field) {
			if (placed[field.id] || !belongs(field)) return;
			result.push({ field: field.id });
		});
		return result;
	}
	function buildFieldTabs(fields, options) {
		const opts = options || {};
		const layout = opts.layout || null;
		const fieldsById = /* @__PURE__ */ new Map();
		fields.forEach(function(field) {
			fieldsById.set(field.id, field);
		});
		const basicEntries = orderedTabEntries(fields, layout ? layout.basic : null, isBasicTabField);
		const generalEntries = orderedTabEntries(fields, layout ? layout.general : null, isGeneralTabField);
		const fieldOptions = {};
		basicEntries.concat(generalEntries).forEach(function(entry) {
			if (entry && entry.field && !fieldOptions[entry.field]) fieldOptions[entry.field] = entry;
		});
		fields.forEach(function(field) {
			let control;
			if (field.hidden) control = hiddenFieldControl(field);
			else if (layout) control = mockupFieldControl(field, opts.readonly, opts.creating, fieldOptions[field.id] || {});
			else control = fieldControl(field, opts.readonly, opts.creating);
			opts.controls.push(control);
			if (!opts.controlsById.has(field.id)) opts.controlsById.set(field.id, []);
			opts.controlsById.get(field.id).push(control);
		});
		function renderable(entries) {
			return entries.some(function(entry) {
				if (entry.placeholder) return true;
				if (!entry.field) return false;
				const field = fieldsById.get(entry.field);
				return Boolean(field && !field.hidden);
			});
		}
		const basicHasFields = renderable(basicEntries);
		const generalHasFields = renderable(generalEntries);
		if (!basicHasFields && !generalHasFields) return null;
		function buildContent(entries) {
			const content = createElement("div", { className: "tab-content" });
			entries.forEach(function(entry) {
				if (entry.line) {
					content.append(createElement("div", { className: "field__line" }));
					return;
				}
				if (entry.placeholder) {
					content.append(buildPlaceholderCheckbox(entry));
					return;
				}
				if (!entry.field) return;
				(opts.controlsById.get(entry.field) || []).forEach(function(control) {
					if (control.element) content.append(control.element);
				});
			});
			return content;
		}
		const basicContent = buildContent(basicEntries);
		const generalContent = buildContent(generalEntries);
		basicContent.getElement().id = "tab-basic";
		generalContent.getElement().id = "tab-general";
		const activeTab = basicHasFields ? "tab-basic" : "tab-general";
		if (activeTab === "tab-basic") basicContent.getElement().classList.add("active");
		else generalContent.getElement().classList.add("active");
		const tabs = createElement("div", { className: "preference__modal-tabs" });
		const buttons = createElement("div", { className: "tab-buttons" });
		[{
			id: "tab-basic",
			enabled: basicHasFields,
			label: pt("tabBasic")
		}, {
			id: "tab-general",
			enabled: generalHasFields,
			label: pt("tabGeneral")
		}].forEach(function(spec) {
			if (!spec.enabled) return;
			buttons.append(createElement("div", {
				className: ["preference__tab-button", activeTab === spec.id ? "active" : null],
				attrs: { "data-tab": spec.id },
				text: spec.label,
				events: { click: function() {
					activateTab(spec.id);
				} }
			}));
		});
		tabs.append(buttons);
		tabs.append(basicContent);
		tabs.append(generalContent);
		const filtersTab = opts.layout ? opts.layout.filters === "basic" ? "tab-basic" : opts.layout.filters === "general" ? "tab-general" : null : null;
		tabs.filtersSlot = filtersTab === "tab-basic" && basicHasFields ? basicContent : filtersTab === "tab-general" && generalHasFields ? generalContent : null;
		function activateTab(id) {
			Array.prototype.forEach.call(tabs.getElement().querySelectorAll(".preference__tab-button"), function(button) {
				button.classList.toggle("active", button.getAttribute("data-tab") === id);
			});
			Array.prototype.forEach.call(tabs.getElement().querySelectorAll(".tab-content"), function(content) {
				content.classList.toggle("active", content.id === id);
			});
		}
		return tabs;
	}
	//#endregion
	//#region src/components/templates/preference/view/field-dependencies.js
	var PREFERENCE_LAYOUTS$1 = layouts_exports;
	function dependencyRulesFor(kind) {
		const layout = PREFERENCE_LAYOUTS$1[kind];
		return layout && Array.isArray(layout.dependencies) ? layout.dependencies : [];
	}
	function conditionTextValue(raw) {
		if (raw === null || raw === void 0) return "";
		if (Array.isArray(raw)) return raw.join("\n");
		return String(raw);
	}
	function conditionValueIsEmpty(raw) {
		if (raw === null || raw === void 0) return true;
		if (typeof raw === "string") return raw.trim() === "";
		if (Array.isArray(raw)) return raw.length === 0;
		return false;
	}
	function conditionBooleanValue(raw) {
		return raw === true || raw === 1 || raw === "true";
	}
	function conditionCompare(expected, raw) {
		if (expected === true) return conditionBooleanValue(raw);
		if (expected === false) return raw === false || raw === 0;
		return conditionTextValue(raw).toLowerCase() === conditionTextValue(expected).toLowerCase();
	}
	function conditionHolds(condition, readSource) {
		if (!condition) return true;
		if (condition.anyOf !== void 0) return (Array.isArray(condition.anyOf) ? condition.anyOf : []).some(function(nested) {
			return conditionHolds(nested, readSource);
		});
		if (condition.suffix !== void 0) return conditionTextValue(readSource(condition.source)).toLowerCase().endsWith(String(condition.suffix).toLowerCase());
		if (Object.prototype.hasOwnProperty.call(condition, "nonEmpty")) return Boolean(condition.nonEmpty) !== conditionValueIsEmpty(readSource(condition.source));
		const raw = readSource(condition.source);
		if (condition.in !== void 0) return (Array.isArray(condition.in) ? condition.in : []).some(function(item) {
			return conditionCompare(item, raw);
		});
		if (condition.notIn !== void 0) return !(Array.isArray(condition.notIn) ? condition.notIn : []).some(function(item) {
			return conditionCompare(item, raw);
		});
		if (condition.equals !== void 0) return conditionCompare(condition.equals, raw);
		if (condition.notEquals !== void 0) return !conditionCompare(condition.notEquals, raw);
		return true;
	}
	function ruleEnabled(rule, readSource) {
		return (Array.isArray(rule && rule.enabledWhen) ? rule.enabledWhen : []).every(function(condition) {
			return conditionHolds(condition, readSource);
		});
	}
	function attachFieldDependencies(formElement, controlsById, rules) {
		const disabledIds = /* @__PURE__ */ new Set();
		function sourceValue(fieldId) {
			let payload = null;
			(controlsById.get(fieldId) || []).forEach(function(control) {
				const current = control.read();
				if (current !== void 0) payload = valuePayload(current);
			});
			return payload;
		}
		function sync() {
			const passes = Math.min(rules.length + 1, 12);
			for (let pass = 0; pass < passes; pass += 1) {
				let changed = false;
				const cache = /* @__PURE__ */ new Map();
				const nextDisabled = [];
				const readSource = function(fieldId) {
					if (!cache.has(fieldId)) cache.set(fieldId, sourceValue(fieldId));
					return cache.get(fieldId);
				};
				rules.forEach(function(rule) {
					if (!rule || !rule.field) return;
					const enabled = ruleEnabled(rule, readSource);
					if (!enabled) nextDisabled.push(rule.field);
					(controlsById.get(rule.field) || []).forEach(function(control) {
						if (control.setDynamicDisabled && control.setDynamicDisabled(!enabled)) changed = true;
					});
				});
				disabledIds.clear();
				nextDisabled.forEach(function(id) {
					disabledIds.add(id);
				});
				if (!changed) break;
			}
		}
		formElement.addEventListener("input", sync);
		formElement.addEventListener("change", sync);
		return {
			sync,
			disabledIds
		};
	}
	//#endregion
	//#region src/components/templates/preference/view/item-form.js
	var PREFERENCE_LAYOUTS = layouts_exports;
	/**
	* The create/edit/view dialog of one preference item: loads the item, builds the fields, tabs and the targeting
	* modal, tracks the dirty state. Saving and closing are the page's (`saveForm`, `closeForm`).
	* @param {any} context the page's state and operations (see renderPreferencesTemplate)
	*/
	function createItemForm({ closeForm, config, documentDto, infoPanel, item, rootElement, saveForm, setHeaderState, showPageError, view }) {
		function setOpening(value) {
			view.opening = Boolean(value);
			rootElement.classList.toggle("gpo-editor-preferences--opening", view.opening);
			if (view.opening) rootElement.setAttribute("aria-busy", "true");
			else rootElement.removeAttribute("aria-busy");
			Array.prototype.forEach.call(rootElement.querySelectorAll(".gpo-editor-preference-table__actions button"), function(button) {
				button.disabled = view.opening;
			});
			setHeaderState();
		}
		function buildFilterEditor(showResult, formState, readonly) {
			return render$1({
				showResult,
				formState,
				readonly,
				scope: item.scope,
				language: getLanguage(),
				pt,
				fieldControl,
				validationMessage
			});
		}
		async function openForm(identity) {
			const creating = identity === null || identity === void 0;
			if (creating && !documentDto.editable) return;
			if (view.opening) return false;
			if (view.modalState && !closeForm(false, "close")) return;
			const host = config.modalHost || rootElement.querySelector(".gpo-editor-preferences__modal-host");
			if (!host) return;
			const requestId = ++view.formRequestId;
			setOpening(true);
			try {
				const response = await preferenceShow(item.scope, item.preferenceKind, identity);
				if (requestId !== view.formRequestId || typeof config.isCurrent === "function" && !config.isCurrent()) return;
				const readonly = !documentDto.editable;
				const fields = clone$2(creating ? response.new_item_fields || response.fields || [] : response.fields || []).map(function(field) {
					return scopeField(field, item.scope);
				});
				if (!creating) {
					infoPanel.invalidate();
					infoPanel.render(fields);
				}
				const parentCandidates = creating && Array.isArray(response.parent_candidates) ? clone$2(response.parent_candidates) : [];
				const controls = [];
				const controlsById = /* @__PURE__ */ new Map();
				const fieldTabs = buildFieldTabs(fields, {
					controls,
					controlsById,
					readonly,
					creating,
					layout: PREFERENCE_LAYOUTS[item.preferenceKind] || null
				});
				const formState = {
					dirty: false,
					busy: false,
					readFilterResult: function() {
						return {
							operations: [],
							errors: []
						};
					}
				};
				const errorSlot = createElement("div", { className: "gpo-editor-preference-form__error" });
				const validationSlot = createElement("div", {
					className: "gpo-editor-preference-form__validation",
					attrs: { role: "alert" }
				});
				const shownItem = response.item;
				const originalName = shownItem && shownItem.label !== void 0 ? String(shownItem.label) : "";
				let nameInput = null;
				let nameField = null;
				let nameError = null;
				let parentSelect = null;
				let parentField = null;
				if (!creating) {
					nameInput = createElement("input", { attrs: {
						type: "text",
						value: originalName,
						required: "required",
						disabled: readonly ? "disabled" : null
					} });
					nameError = createElement("span", { className: "gpo-editor-field__error" });
					nameField = createElement("div", {
						className: [
							"field",
							"field__input",
							readonly ? "field--readonly" : null
						],
						attrs: { "data-field-id": "name" },
						children: [createElement("div", {
							className: "field__label",
							children: [createElement("span", { text: pt("rename") }), createElement("span", {
								className: "gpo-editor-field__required",
								text: "*"
							})]
						}), createElement("div", {
							className: "field__element",
							children: [nameInput, nameError]
						})]
					});
				}
				if (creating && parentCandidates.length > 1) {
					parentSelect = createElement("select", {
						attrs: { "aria-label": pt("parent") },
						children: parentCandidates.map(function(candidate, index) {
							return createElement("option", {
								attrs: { value: String(index) },
								text: parentCandidateLabel(candidate)
							});
						})
					});
					const rootParentIndex = parentCandidates.findIndex(function(candidate) {
						return candidate && candidate.identity === null;
					});
					parentSelect.getElement().value = String(rootParentIndex < 0 ? 0 : rootParentIndex);
					parentField = createElement("label", {
						className: ["gpo-editor-field", "gpo-editor-preference-parent"],
						attrs: { "data-field-id": "parent" },
						children: [createElement("span", {
							className: "gpo-editor-field__label",
							text: pt("parent")
						}), parentSelect]
					});
				}
				const saveButton = readonly ? null : createElement("button", {
					className: ["button", "btn-ok"],
					attrs: { type: "button" },
					text: pt("save"),
					events: { click: function() {
						saveForm();
					} }
				});
				const closeAction = function() {
					closeForm(false, "close");
				};
				const cancelAction = function() {
					closeForm(false, "cancel");
				};
				const filterSection = createElement("div", { className: "preference__modal-filters" });
				filterSection.append(buildFilterEditor(response, formState, readonly));
				const targeting = createTargetingModal({
					host,
					filterSection,
					readonly,
					formState,
					getForm: () => form.getElement(),
					getOpener: () => targettingButton.getElement()
				});
				const wrapElement = ElementCreator.wrap;
				const formBody = createBody(null);
				formBody.append(validationSlot.getElement());
				formBody.append(errorSlot.getElement());
				formBody.append(createElement("div", { className: "gpo-editor-fields" }).getElement());
				if (fieldTabs) formBody.append(fieldTabs.getElement());
				const formClose = wrapElement(createCloseButton(pt("close")));
				formClose.on("click", closeAction);
				const formCancel = wrapElement(createButton("cancel", readonly ? pt("close") : pt("cancel")));
				formCancel.on("click", readonly ? closeAction : cancelAction);
				const formShell = createDialogShell({
					titleId: "gpo-editor-preference-form-title",
					title: creating ? pt("createTitle") : readonly ? pt("viewTitle") : pt("editTitle"),
					body: formBody,
					closeButton: formClose.getElement(),
					buttons: readonly ? [formCancel.getElement()] : [formCancel.getElement(), saveButton.getElement()],
					width: "408px",
					className: ["gpo-editor-preference-form", readonly ? "gpo-editor-dialog--readonly" : null].filter(Boolean).join(" "),
					hostClassName: "gpo-editor-preference-host"
				});
				const form = wrapElement(formShell.dialog);
				form.on("keydown", function(event) {
					if (event.defaultPrevented || event.target.closest("[role=\"dialog\"], [role=\"alertdialog\"]") !== form.getElement()) return;
					if (event.key === "Escape") {
						event.preventDefault();
						event.stopPropagation();
						closeAction();
					}
					trapTab(event, form.getElement());
				});
				const fieldSlot = form.getElement().querySelector(".gpo-editor-fields");
				if (nameField) {
					const basicTab = form.getElement().querySelector("#tab-basic");
					const targetTypeField = basicTab && basicTab.querySelector("[data-field-id=\"properties.targetType\"]");
					if (targetTypeField && targetTypeField.parentNode) targetTypeField.parentNode.insertBefore(nameField.getElement(), targetTypeField);
					else if (basicTab) basicTab.insertBefore(nameField.getElement(), basicTab.firstChild);
					else if (fieldSlot) fieldSlot.appendChild(nameField.getElement());
				}
				if (parentField && fieldSlot) fieldSlot.appendChild(parentField.getElement());
				const targettingButton = createElement("button", {
					className: ["button", "preference__tab-targetting-btn"],
					attrs: { type: "button" },
					text: pt("targettingButton"),
					events: { click: function() {
						if (formState.busy) return;
						formState.beginFilterDraft();
						targeting.open();
					} }
				});
				const generalTabElement = form.getElement().querySelector("#tab-general");
				const descriptionField = generalTabElement && generalTabElement.querySelector("[data-field-id=\"metadata.desc\"]");
				if (generalTabElement && descriptionField && descriptionField.parentNode) descriptionField.parentNode.insertBefore(targettingButton.getElement(), descriptionField);
				else if (generalTabElement) generalTabElement.appendChild(targettingButton.getElement());
				else {
					const formContentSlot = form.getElement().querySelector("[data-dialog-part=\"body\"]");
					if (formContentSlot) formContentSlot.appendChild(targettingButton.getElement());
				}
				if (!readonly) {
					form.getElement().addEventListener("input", function() {
						if (!formState.busy) formState.dirty = true;
					});
					form.getElement().addEventListener("change", function() {
						if (!formState.busy) formState.dirty = true;
					});
				}
				host.innerHTML = "";
				host.appendChild(formShell.host);
				host.classList.add("active");
				form.getElement().classList.add("active");
				view.modalState = {
					creating,
					readonly,
					identity: clone$2(identity),
					descriptors: fields,
					controls,
					controlsById,
					originalName,
					nameInput: nameInput && nameInput.getElement(),
					nameField: nameField && nameField.getElement(),
					nameError: nameError && nameError.getElement(),
					parentCandidates,
					parentSelect: parentSelect && parentSelect.getElement(),
					formState,
					formElement: form.getElement(),
					validationSlot: validationSlot.getElement(),
					errorSlot: errorSlot.getElement(),
					saveButton: saveButton && saveButton.getElement(),
					closeButtons: [form.getElement().querySelector(".close"), form.getElement().querySelector(".btn-cancel")].filter(Boolean),
					busyDisabledStates: /* @__PURE__ */ new Map(),
					saving: false,
					reconciling: false,
					requiresRefresh: false,
					blockedDescriptors: false
				};
				if (view.modalState.nameInput && !readonly) view.modalState.nameInput.addEventListener("input", function() {
					if (view.modalState.nameError.textContent) setNameError(view.modalState, "");
				});
				const duplicates = preferenceFieldIds(fields).duplicates;
				if (!readonly && duplicates.length) {
					view.modalState.blockedDescriptors = true;
					view.modalState.formElement.classList.add("gpo-editor-preference-form--invalid");
					view.modalState.validationSlot.textContent = pt("validationFixErrors");
					duplicates.forEach(function(id) {
						(controlsById.get(id) || []).forEach(function(control) {
							control.setError(pt("validationFixErrors"));
						});
					});
				}
				const dependencyRules = dependencyRulesFor(item.preferenceKind);
				if (dependencyRules.length && !readonly) {
					const dependencies = attachFieldDependencies(view.modalState.formElement, controlsById, dependencyRules);
					view.modalState.dependencyDisabledIds = dependencies.disabledIds;
					dependencies.sync();
				}
				syncFormBusy(view.modalState);
				setHeaderState();
			} catch (error) {
				if (requestId === view.formRequestId) showPageError(error);
			} finally {
				if (requestId === view.formRequestId) setOpening(false);
			}
		}
		return { openForm };
	}
	//#endregion
	//#region src/components/templates/preference/view/info-panel.js
	/**
	* The info panel under the preferences table: switches and description of the selected item.
	* `request(identity)` loads the item's fields and shows them; a newer request or `invalidate()` drops a stale answer.
	* @param {{ config: any, rootElement: HTMLElement, ensureItemFields: (identity: any) => Promise<any> }} context
	*/
	function createInfoPanel({ config, rootElement, ensureItemFields }) {
		let requestCounter = 0;
		function buildInfoPanel() {
			const info = createElement("div", { className: ["preference__info", config.isHelpOpen ? "is-open" : null] });
			const settings = createElement("div", { className: "preference__settings" });
			settings.append(createElement("div", {
				className: "preference__settings-title",
				text: pt("settingsTitle")
			}));
			settings.append(createElement("div", { className: "preference__settings-data" }));
			info.append(settings);
			const description = createElement("div", { className: "preference__description" });
			description.append(createElement("div", {
				className: "preference__description-title",
				text: pt("descriptionTitle")
			}));
			description.append(createElement("div", {
				className: ["preference__description-data", "empty"],
				text: pt("noDescription")
			}));
			info.append(description);
			return info;
		}
		function settingsItems() {
			return [
				{
					id: "metadata.bypassErrors",
					label: pt("settingBypassErrors")
				},
				{
					id: "metadata.removePolicy",
					label: pt("settingRemovePolicy")
				},
				{
					id: "properties.disabled",
					label: pt("settingDisabled")
				}
			];
		}
		function fieldCheckedState(field) {
			const v = field && field.value;
			const raw = v && typeof v === "object" ? v.value : v;
			if (raw === null || raw === void 0) return null;
			if (raw === true || raw === 1) return true;
			if (raw === false || raw === 0) return false;
			return Boolean(raw);
		}
		function fieldText(field) {
			const v = field && field.value;
			const raw = v && typeof v === "object" ? v.value : v;
			if (Array.isArray(raw)) return raw.join("\n");
			return raw === null || raw === void 0 ? "" : String(raw);
		}
		function renderInfoPanel(fields) {
			const dataSlot = rootElement.querySelector(".preference__settings-data");
			const descSlot = rootElement.querySelector(".preference__description-data");
			if (!dataSlot || !descSlot) return;
			const byId = /* @__PURE__ */ new Map();
			(Array.isArray(fields) ? fields : []).forEach(function(field) {
				if (field && field.id !== void 0 && !byId.has(field.id)) byId.set(field.id, field);
			});
			dataSlot.innerHTML = "";
			settingsItems().forEach(function(spec) {
				const field = byId.get(spec.id);
				const label = field && field.label || spec.label;
				const value = fieldCheckedState(field);
				dataSlot.appendChild(createElement("div", {
					className: "preference__settings-item",
					children: [createElement("div", {
						className: "preference__settings-name",
						text: label + ":"
					}), createElement("div", {
						className: "preference__settings-value",
						text: value === null ? "" : value ? pt("yes") : pt("no")
					})]
				}).getElement());
			});
			const descText = fieldText(byId.get("metadata.desc"));
			descSlot.innerHTML = "";
			if (descText) {
				descSlot.classList.remove("empty");
				descSlot.textContent = descText;
			} else {
				descSlot.classList.add("empty");
				descSlot.textContent = pt("noDescription");
			}
		}
		function resetInfoPanel() {
			renderInfoPanel([]);
		}
		async function requestInfoPanel(identity) {
			const requestId = ++requestCounter;
			try {
				const fields = await ensureItemFields(identity);
				if (requestId !== requestCounter || typeof config.isCurrent === "function" && !config.isCurrent()) return;
				if (fields) renderInfoPanel(fields);
				else resetInfoPanel();
			} catch (error) {
				if (requestId !== requestCounter || typeof config.isCurrent === "function" && !config.isCurrent()) return;
				resetInfoPanel();
			}
		}
		return {
			build: buildInfoPanel,
			render: renderInfoPanel,
			reset: resetInfoPanel,
			request: requestInfoPanel,
			invalidate() {
				requestCounter += 1;
			}
		};
	}
	//#endregion
	//#region src/components/templates/preference/preferences-view-template.js
	var nextHeaderOwnerId = 1;
	async function renderPreferencesTemplate(options) {
		const config = options || {};
		const item = config.item || {};
		const documentDto = item.document || {};
		const root = createElement("div", { className: ["gp__preference", "gpo-editor-preferences"] });
		const rootElement = root.getElement();
		const headerElement = config.header && config.header.getElement ? config.header.getElement() : null;
		const headerControls = headerElement ? headerElement.querySelector(".gp__control") : null;
		const headerActions = headerElement ? headerElement.querySelector(".gp__control-actions") : null;
		const admxActions = headerElement ? headerElement.querySelector(".gp__control-admx") : null;
		const helpSeparator = headerElement ? headerElement.querySelector(".gp__control-separator") : null;
		const createButton = headerControls ? headerControls.querySelector(".preferences__btn-create") : null;
		const editButton = headerControls ? headerControls.querySelector(".preferences__btn-edit") : null;
		const deleteButton = headerControls ? headerControls.querySelector(".preferences__btn-delete") : null;
		const headerOwner = "preferences-" + nextHeaderOwnerId++;
		const cleanups = [];
		const itemFieldsCache = /* @__PURE__ */ new Map();
		if (headerControls) {
			headerControls.setAttribute("data-preference-owner", headerOwner);
			headerControls.style.display = documentDto.editable ? "flex" : "none";
		}
		if (headerActions) {
			headerActions.setAttribute("data-preference-owner", headerOwner);
			headerActions.style.display = "flex";
		}
		if (admxActions) admxActions.style.display = "none";
		if (helpSeparator) helpSeparator.style.display = "none";
		const view = {
			items: [],
			selectedIdentity: null,
			modalState: null,
			opening: false,
			pendingDiscard: null,
			discardModal: null,
			formRequestId: 0,
			itemsRequestId: 0,
			fieldsRequestId: 0,
			tableRefreshScheduled: false,
			deleting: false,
			disposed: false,
			tableNavigation: void 0
		};
		function ownsHeader() {
			return Boolean(headerControls && headerControls.getAttribute("data-preference-owner") === headerOwner);
		}
		function setHeaderState() {
			if (typeof config.onFormStateChange === "function") config.onFormStateChange(Boolean(view.modalState));
			if (!ownsHeader()) return;
			const available = Boolean(documentDto.editable) && !view.modalState && !view.opening && !view.deleting;
			if (createButton) createButton.classList.toggle("active", available);
			if (editButton) editButton.classList.toggle("active", available && view.selectedIdentity !== null);
			if (deleteButton) deleteButton.classList.toggle("active", available && view.selectedIdentity !== null);
		}
		function addListener(target, name, handler) {
			if (!target) return;
			target.addEventListener(name, handler);
			cleanups.push(function() {
				target.removeEventListener(name, handler);
			});
		}
		const infoPanel = createInfoPanel({
			config,
			rootElement,
			ensureItemFields: (identity) => table.ensureItemFields(identity)
		});
		const table = createItemsTable({
			config,
			documentDto,
			infoPanel,
			item,
			itemFieldsCache,
			openForm: (identity) => openForm(identity),
			rootElement,
			setHeaderState,
			showPageError: (error) => actions.showPageError(error),
			view
		});
		const { renderTable, selectItem, focusTable, cacheKey, invalidateCachedFields, loadItems } = table;
		function renderShell() {
			rootElement.innerHTML = "";
			const dataTable = createElement("div", { className: "preference__data-table" });
			dataTable.append(createElement("div", {
				className: "gpo-editor-preferences__header",
				children: [config.hideHeading ? null : createElement("h2", {
					text: config.categoryPath || documentDto.label || item.preferenceKind,
					attrs: { "data-category-path": "" }
				}), createElement("div", {
					className: ["gpo-editor-document-state", documentDto.editable ? null : "gpo-editor-document-state--readonly"],
					text: documentDto.editable ? pt("documentEditable") : pt("documentReadOnly")
				})]
			}));
			dataTable.append(createElement("div", { className: "gpo-editor-preferences__error" }));
			dataTable.append(createElement("div", { className: "gpo-editor-preferences__table" }));
			if (!config.modalHost) dataTable.append(createElement("div", { className: "gpo-editor-preferences__modal-host" }));
			rootElement.appendChild(dataTable.getElement());
			rootElement.appendChild(infoPanel.build().getElement());
			infoPanel.reset();
		}
		const { closeForm } = createFormLifecycle({
			config,
			rootElement,
			view,
			focusTable,
			setHeaderState
		});
		const actions = createPageActions({
			cacheKey,
			closeForm,
			config,
			deleteButton,
			documentDto,
			focusTable,
			invalidateCachedFields,
			item,
			loadItems,
			ownsHeader,
			renderTable,
			rootElement,
			setHeaderState,
			view
		});
		const { showPageError, saveForm, deleteSelected } = actions;
		const { openForm } = createItemForm({
			closeForm,
			config,
			documentDto,
			infoPanel,
			item,
			rootElement,
			saveForm,
			setHeaderState,
			showPageError,
			view
		});
		renderShell();
		const tableSlot = rootElement.querySelector(".gpo-editor-preferences__table");
		view.tableNavigation = bind$1(tableSlot, {
			rows: function() {
				return Array.from(tableSlot.querySelectorAll("[data-preference-identity]"));
			},
			selected: function() {
				return tableSlot.querySelector("tr.active");
			},
			select: function(row) {
				selectItem(row.__preferenceIdentity);
			},
			activate: function(row) {
				openForm(clone$2(row.__preferenceIdentity));
			},
			remove: function() {
				deleteSelected();
			},
			canRemove: function() {
				return Boolean(documentDto.editable);
			},
			busy: function() {
				return view.disposed || view.opening || view.deleting || Boolean(view.modalState);
			}
		});
		setHeaderState();
		addListener(createButton, "click", function() {
			if (createButton.classList.contains("active")) openForm(null);
		});
		addListener(editButton, "click", function() {
			if (editButton.classList.contains("active")) openForm(view.selectedIdentity);
		});
		addListener(deleteButton, "click", function() {
			if (deleteButton.classList.contains("active")) deleteSelected();
		});
		await loadItems();
		root.hasUnsavedChanges = function() {
			return Boolean(view.modalState && (view.modalState.formState.dirty || view.modalState.saving || view.modalState.reconciling || view.modalState.requiresRefresh));
		};
		root.applyChanges = saveForm;
		root.isBusy = function() {
			return Boolean(view.modalState && (view.modalState.saving || view.modalState.reconciling));
		};
		root.cancelChanges = function() {
			return closeForm(true, "navigation");
		};
		root.cleanup = function() {
			view.disposed = true;
			view.tableNavigation.cleanup();
			view.itemsRequestId += 1;
			view.formRequestId += 1;
			cleanups.splice(0).forEach(function(cleanup) {
				cleanup();
			});
			closeForm(true, "cleanup");
			if (ownsHeader()) {
				headerControls.style.display = "none";
				headerControls.removeAttribute("data-preference-owner");
				[
					createButton,
					editButton,
					deleteButton
				].forEach(function(button) {
					if (button) button.classList.remove("active");
				});
			}
			if (headerActions && headerActions.getAttribute("data-preference-owner") === headerOwner) {
				headerActions.style.display = "";
				headerActions.removeAttribute("data-preference-owner");
				if (admxActions) admxActions.style.display = "";
				if (helpSeparator) helpSeparator.style.display = "";
			}
		};
		return root;
	}
	async function openPreferencesDialog(host, options) {
		const config = options || {};
		const item = config.item || {};
		let closed = false;
		let editor = null;
		const nestedHost = createElement("div", { className: ["gp__preference", "gpo-editor-preferences__modal-host"] });
		const controls = createElement("div", {
			className: ["gp__control", "gpo-security-workbench__toolbar"],
			children: [
				createElement("button", {
					className: ["button", "preferences__btn-create"],
					attrs: { type: "button" },
					text: t("header.create")
				}),
				createElement("button", {
					className: ["button", "preferences__btn-edit"],
					attrs: { type: "button" },
					text: t("header.edit")
				}),
				createElement("button", {
					className: ["button", "preferences__btn-delete"],
					attrs: { type: "button" },
					text: t("header.delete")
				})
			]
		});
		const content = createElement("div", {
			className: "gpo-preferences-family-dialog__content",
			children: [controls, createElement("div", {
				className: "gpo-editor-empty",
				text: t("policySearch.loading")
			})]
		});
		const dialog = open$2(host, {
			title: item.title || item.document && item.document.label || item.preferenceKind,
			className: ["gpo-preferences-family-dialog"],
			width: "min(680px, calc(100vw - 32px))",
			content,
			readOnly: true,
			cancelLabel: pt("close"),
			canClose: function() {
				return !editor || !editor.isBusy();
			},
			isDirty: function() {
				return Boolean(editor && editor.hasUnsavedChanges());
			},
			onClose: function() {
				closed = true;
				if (editor) editor.cleanup();
				nestedHost.getElement().remove();
				if (config.onClose) config.onClose();
			},
			restoreFocus: config.restoreFocus
		});
		dialog.root.getElement().parentElement.appendChild(nestedHost.getElement());
		const localDocument = Object.assign({}, item.document || {});
		if (item.readOnly) localDocument.editable = false;
		editor = await renderPreferencesTemplate({
			item: Object.assign({}, item, { document: localDocument }),
			hideHeading: true,
			header: { getElement: function() {
				return content.getElement();
			} },
			modalHost: nestedHost.getElement(),
			onFormStateChange: function(opened) {
				dialog.root.getElement().inert = opened;
			},
			onSaved: config.onSaved,
			isCurrent: function() {
				return !closed && (typeof config.isCurrent !== "function" || config.isCurrent());
			}
		});
		if (closed || typeof config.isCurrent === "function" && !config.isCurrent()) {
			editor.cleanup();
			dialog.close();
			return null;
		}
		content.getElement().replaceChildren(controls.getElement(), editor.getElement());
		return {
			editor,
			dialog
		};
	}
	//#endregion
	//#region src/components/templates/security/value-editor.js
	function tr$3(key, fallback) {
		const value = t("security." + key);
		return value && value !== "security." + key ? value : fallback;
	}
	function clone$1(value) {
		return value === void 0 ? void 0 : JSON.parse(JSON.stringify(value));
	}
	function same(left, right) {
		return JSON.stringify(left) === JSON.stringify(right);
	}
	function defaultTyped(definition) {
		if (definition && definition.initial) return clone$1(definition.initial);
		const kind = definition && definition.value_type || "string";
		if (kind === "boolean") return {
			kind,
			value: false
		};
		if (kind === "integer") {
			const ranges = definition.input_ranges && definition.input_ranges.length ? definition.input_ranges : definition.ranges || [];
			return {
				kind,
				value: ranges.length ? Number(ranges[0].min) : 0
			};
		}
		if (kind === "enum") return {
			kind,
			value: definition.options && definition.options.length ? definition.options[0].id : ""
		};
		if (kind === "flags" || kind === "string_list" || kind === "principal_list") return {
			kind,
			value: []
		};
		if (kind === "collection") return {
			kind,
			value: []
		};
		return {
			kind,
			value: ""
		};
	}
	function payload(value, fallback) {
		return value && Object.prototype.hasOwnProperty.call(value, "value") ? value.value : fallback;
	}
	function optionLabel(option) {
		return option.display_name || option.id;
	}
	function inputFor(definition, control, value, disabled) {
		const current = value || defaultTyped(definition);
		const kind = definition.value_type;
		let input;
		let readers;
		let writers;
		if (kind === "boolean") {
			input = createElement("select", { children: [createElement("option", {
				attrs: { value: "false" },
				text: control && control.false_label || tr$3("disabled", "Disabled")
			}), createElement("option", {
				attrs: { value: "true" },
				text: control && control.true_label || tr$3("enabled", "Enabled")
			})] });
			writers = function(next) {
				input.getElement().value = payload(next, false) ? "true" : "false";
			};
			readers = function() {
				return {
					kind: "boolean",
					value: input.getElement().value === "true"
				};
			};
		} else if (kind === "enum") {
			input = createElement("select", { children: [createElement("option", {
				attrs: {
					value: "",
					disabled: "disabled"
				},
				text: "—"
			})].concat((definition.options || []).map(function(option) {
				return createElement("option", {
					attrs: { value: option.id },
					text: optionLabel(option)
				});
			})) });
			writers = function(next) {
				input.getElement().value = String(payload(next, ""));
			};
			readers = function() {
				return {
					kind: "enum",
					value: input.getElement().value
				};
			};
		} else if (kind === "flags") {
			const checks = [];
			input = createElement("div", { className: "gpo-editor-security-flags" });
			(definition.options || []).forEach(function(option) {
				const checkbox = createElement("input", { attrs: { type: "checkbox" } });
				checks.push({
					option,
					checkbox
				});
				input.append(createElement("label", {
					className: ["field", "field__checkbox"],
					children: [checkbox, createElement("span", { text: optionLabel(option) })]
				}));
			});
			readers = function() {
				return {
					kind: "flags",
					value: checks.filter(function(item) {
						return item.checkbox.getElement().checked;
					}).map(function(item) {
						return item.option.id;
					})
				};
			};
			writers = function(next) {
				const selected = new Set(payload(next, []) || []);
				checks.forEach(function(item) {
					item.checkbox.getElement().checked = selected.has(item.option.id);
				});
			};
			input.securityInputs = checks.map(function(item) {
				return item.checkbox.getElement();
			});
		} else if (kind === "string_list" || kind === "principal_list") {
			input = createElement("textarea", { attrs: {
				rows: "5",
				spellcheck: "false"
			} });
			writers = function(next) {
				input.getElement().value = (payload(next, []) || []).join("\n");
			};
			readers = function() {
				return {
					kind,
					value: input.getElement().value.split(/\r?\n/).filter(function(line) {
						return line !== "";
					})
				};
			};
		} else if (kind === "sddl") {
			input = createElement("textarea", { attrs: {
				rows: "4",
				spellcheck: "false"
			} });
			writers = function(next) {
				input.getElement().value = String(payload(next, ""));
			};
			readers = function() {
				return {
					kind,
					value: input.getElement().value
				};
			};
		} else {
			input = createElement("input", { attrs: {
				type: kind === "integer" ? "number" : "text",
				autocomplete: "off",
				spellcheck: kind === "sddl" ? "false" : null
			} });
			writers = function(next) {
				input.getElement().value = String(payload(next, ""));
			};
			readers = function() {
				const raw = input.getElement().value;
				return {
					kind,
					value: kind === "integer" ? raw === "" ? NaN : Number(raw) : raw
				};
			};
		}
		writers(current);
		input.getElement().setAttribute("data-security-value-kind", kind);
		function setDisabled(value) {
			(input.securityInputs || [input.getElement()]).forEach(function(element) {
				element.disabled = Boolean(value);
			});
		}
		setDisabled(disabled || control && control.read_only);
		return {
			root: input,
			read: readers,
			write: writers,
			setDisabled,
			focus: function() {
				const target = (input.securityInputs || [input.getElement()])[0];
				if (target && target.focus) target.focus();
			}
		};
	}
	function validationError(definition, typed) {
		if (!definition || !typed || typed.kind !== definition.value_type) return tr$3("validationType", "The value type does not match the definition.");
		if (typed.kind === "integer") {
			if (!Number.isSafeInteger(typed.value)) return tr$3("validationInteger", "Enter a whole number.");
			const ranges = definition.input_ranges && definition.input_ranges.length ? definition.input_ranges : definition.ranges || [];
			if (ranges.length && !ranges.some(function(range) {
				return typed.value >= range.min && typed.value <= range.max;
			})) return tr$3("validationRange", "Enter a value in the allowed range.");
		}
		if ((typed.kind === "enum" || typed.kind === "flags") && definition.options) {
			const allowed = new Set(definition.options.map(function(option) {
				return option.id;
			}));
			if ((typed.kind === "flags" ? typed.value : [typed.value]).some(function(value) {
				return !allowed.has(value);
			})) return tr$3("validationChoice", "Select a value supplied by the definition.");
		}
		if (typed.kind === "sddl" && /[\r\n]/.test(typed.value)) return tr$3("validationDescriptor", "Enter one security descriptor without line breaks.");
		if ([
			"sddl",
			"principal",
			"service_name",
			"registry_key",
			"file_path"
		].indexOf(typed.kind) !== -1 && !String(typed.value || "").trim()) return tr$3("validationRequired", "A value is required.");
		return null;
	}
	function newRow(collection) {
		const row = {};
		(collection.fields || []).forEach(function(field) {
			row[field.id] = field.element.initial ? {
				state: "set",
				value: clone$1(field.element.initial)
			} : { state: "unset" };
		});
		return row;
	}
	function rowKey(collection, row) {
		const state = row && row[collection.unique_by];
		return state && state.state === "set" ? state.value : null;
	}
	function rowActions(collection, baseline, draft) {
		if (!collection.unique_by) return [];
		const previous = /* @__PURE__ */ new Map();
		const current = /* @__PURE__ */ new Map();
		(baseline || []).forEach(function(row) {
			const key = rowKey(collection, row);
			if (key) previous.set(JSON.stringify(key), row);
		});
		(draft || []).forEach(function(row) {
			const key = rowKey(collection, row);
			if (key) current.set(JSON.stringify(key), row);
		});
		const actions = [];
		previous.forEach(function(row, encoded) {
			if (!current.has(encoded)) actions.push({
				action: "delete",
				key: rowKey(collection, row)
			});
		});
		current.forEach(function(row, encoded) {
			if (!previous.has(encoded) || !same(previous.get(encoded), row)) actions.push({
				action: "upsert",
				key: rowKey(collection, row),
				fields: clone$1(row)
			});
		});
		return actions;
	}
	//#endregion
	//#region src/components/templates/security/policy-draft.js
	function tr$2(key, fallback) {
		const translated = t(key);
		return translated && translated !== key ? translated : fallback;
	}
	function stateFor(policy, element) {
		if (policy.state.state === "defined") return policy.state.elements && policy.state.elements[element.id] ? clone$1(policy.state.elements[element.id]) : { state: "unset" };
		return element.initial ? {
			state: "set",
			value: clone$1(element.initial)
		} : { state: "unset" };
	}
	function initialDraft(policy) {
		const elements = {};
		(policy.definition.elements || []).forEach(function(element) {
			elements[element.id] = stateFor(policy, element);
		});
		return {
			defined: policy.state.state === "defined",
			elements
		};
	}
	function canCreateRow(collection, controls) {
		const writable = /* @__PURE__ */ new Set();
		function visit(items, parentReadOnly) {
			(items || []).forEach(function(control) {
				const readOnly = parentReadOnly || control.read_only;
				if (control.element_id && !readOnly) writable.add(control.element_id);
				visit(control.children, readOnly);
			});
		}
		visit(controls, false);
		return (collection.fields || []).every(function(field) {
			return !field.required || field.element.initial || writable.has(field.id);
		});
	}
	function registerBinding(bindings, id, binding) {
		if (!bindings.has(id)) bindings.set(id, []);
		bindings.get(id).push(binding);
	}
	function syncBindings(bindings, id, source, state) {
		(bindings.get(id) || []).forEach(function(binding) {
			binding.update(state, binding === source);
		});
	}
	function controlLabel(control, element, state) {
		let label = control.label || element.id;
		if (label === "value") label = tr$2("security.value", "Value");
		if (!state || state.state !== "set" || element.value_type !== "integer") return label;
		const match = (control.labels_when || []).find(function(item) {
			return Number(item[0]) === state.value.value;
		});
		return match ? match[1] : label;
	}
	function rangeText(control, element) {
		if (element.value_type !== "integer" || control.show_range !== true) return null;
		return (element.input_ranges && element.input_ranges.length ? element.input_ranges : element.ranges || []).map(function(range) {
			return range.min === range.max ? String(range.min) : String(range.min) + "–" + String(range.max);
		}).join(", ") || null;
	}
	function elementAction(element, before, after) {
		if (same(before, after)) return null;
		if (after.state === "unset") return {
			element_id: element.id,
			action: "unset"
		};
		if (element.value_type === "collection" && before.state === "set") {
			const rows = rowActions(element, before.value.value || [], after.value.value || []);
			return rows.length ? {
				element_id: element.id,
				action: "rows",
				rows
			} : null;
		}
		return {
			element_id: element.id,
			action: "set",
			value: clone$1(after.value)
		};
	}
	function updateRequest(model, policy, baseline, draft) {
		const update = {
			namespace: policy.namespace,
			policy_id: policy.policyId,
			elements: []
		};
		if (baseline.defined !== draft.defined) update.transition = draft.defined ? "define" : "undefine";
		if (!draft.defined) return {
			expected_semantic_revision: model.catalog.semantic_revision,
			policies: [update]
		};
		(policy.definition.elements || []).forEach(function(element) {
			const action = elementAction(element, baseline.elements[element.id] || { state: "unset" }, draft.elements[element.id] || { state: "unset" });
			if (action) update.elements.push(action);
		});
		return {
			expected_semantic_revision: model.catalog.semantic_revision,
			policies: [update]
		};
	}
	function validateDraft(policy, draft) {
		if (!draft.defined) return null;
		function validateState(element, state, label, required) {
			if (state.state !== "set") return required ? label + ": " + tr$2("security.validationRequired", "A value is required.") : null;
			const typeError = validationError(element, state.value);
			if (typeError) return label + ": " + typeError;
			if (element.value_type !== "collection") return null;
			if (!Array.isArray(state.value.value)) return label + ": " + tr$2("security.validationRows", "Enter valid collection rows.");
			if (!state.value.value.length) return tr$2("security.validationRows", "Add at least one item, or leave this policy not configured.");
			const seen = /* @__PURE__ */ new Set();
			for (const row of state.value.value) {
				if (element.unique_by === "group" && (element.fields || []).some(function(field) {
					return field.id === "members";
				}) && (!row.members || row.members.state !== "set") && (!row.member_of || row.member_of.state !== "set")) return tr$2("security.validationGroupRelationship", "Define Members or Member of. An explicitly empty list is allowed.");
				if (element.unique_by) {
					const key = rowKey(element, row);
					if (!key) return label + ": " + tr$2("security.validationKey", "Every row requires its unique key.");
					const encoded = JSON.stringify(key);
					if (seen.has(encoded)) return element.duplicate_message || tr$2("security.validationDuplicate", "Collection row keys must be unique.");
					seen.add(encoded);
				}
				for (const field of element.fields || []) {
					const fieldError = validateState(field.element, row && row[field.id] || { state: "unset" }, field.display_name || field.id, field.required);
					if (fieldError) return fieldError;
				}
			}
			return null;
		}
		for (const element of policy.definition.elements || []) {
			const error = validateState(element, draft.elements[element.id] || { state: "unset" }, element.id, element.required);
			if (error) return error;
		}
		return null;
	}
	function renderPreserved(model) {
		const root = createElement("div", {
			className: ["gp__preference", "gpo-editor-preferences"],
			attrs: { "data-security-preserved": "" }
		});
		root.append(createElement("h2", { text: tr$2("security.preservedTitle", "Preserved and diagnostic records") }));
		if ((model.diagnostics || []).length) root.append(renderDiagnostics(model.diagnostics));
		const list = createElement("dl", { className: "gpo-editor-security-preserved" });
		(model.preserved || []).forEach(function(record) {
			list.append(createElement("dt", { text: record.section + " — " + record.identity }));
			list.append(createElement("dd", { children: [createElement("p", { text: record.damaged ? tr$2("security.damaged", "Damaged record") : tr$2("security.preservedReadOnly", "This setting is preserved and is read-only.") }), renderDiagnostics([{ message: record.reason }])] }));
		});
		root.append(list);
		return root;
	}
	//#endregion
	//#region src/components/templates/security/controls.js
	function renderControl(control, elements, context) {
		if (control.kind === "text") return createElement("p", { text: control.text || control.label || "" });
		if (control.kind === "group") {
			const childContext = Object.assign({}, context, { writable: context.writable && !control.read_only });
			return createElement("fieldset", {
				className: "gpo-editor-security-group",
				children: [control.label ? createElement("legend", { text: control.label }) : null].concat((control.children || []).map(function(child) {
					return renderControl(child, elements, childContext);
				}))
			});
		}
		const element = (elements || []).find(function(item) {
			return item.id === control.element_id;
		});
		if (!element) return createElement("div", {
			className: ["gpo-editor-preference-notice", "gpo-editor-preference-notice--warning"],
			text: tr$2("security.unresolvedElement", "This setting cannot be displayed:") + " " + (control.element_id || "")
		});
		return element.value_type === "collection" ? collectionControl(control, element, context) : scalarControl(control, element, context);
	}
	function scalarControl(control, element, context) {
		const state = context.getState(element.id);
		const writable = context.writable && !control.read_only;
		const required = element.required === true;
		const configured = createElement("input", { attrs: { type: "checkbox" } });
		const labelText = createElement("span", { text: controlLabel(control, element, state) });
		configured.getElement().checked = state.state === "set" || required;
		configured.getElement().disabled = !writable;
		const editor = inputFor(element, control, state.state === "set" ? state.value : defaultTyped(element), !writable || !required && state.state !== "set");
		editor.root.getElement().setAttribute("aria-label", controlLabel(control, element, state));
		const binding = { update: function(next, source) {
			configured.getElement().checked = next.state === "set" || required;
			configured.getElement().disabled = !writable;
			labelText.getElement().textContent = controlLabel(control, element, next);
			if (!source) editor.write(next.state === "set" ? next.value : defaultTyped(element));
			editor.setDisabled(!writable || !required && next.state !== "set");
		} };
		registerBinding(context.bindings, element.id, binding);
		function changed() {
			const next = configured.getElement().checked ? {
				state: "set",
				value: editor.read()
			} : { state: "unset" };
			context.setState(element.id, next);
			syncBindings(context.bindings, element.id, binding, next);
		}
		configured.on("change", changed);
		editor.root.getElement().addEventListener("input", changed);
		editor.root.getElement().addEventListener("change", changed);
		return createElement("div", {
			className: ["gpo-editor-field", !writable ? "gpo-editor-field--readonly" : null],
			attrs: { "data-security-element": element.id },
			children: [
				createElement("label", {
					className: ["field", "field__checkbox"],
					children: [required ? null : configured, labelText]
				}),
				createElement("div", {
					className: "field__element",
					children: [editor.root]
				}),
				control.integer_suffix ? createElement("span", {
					className: "gpo-editor-security-suffix",
					text: control.integer_suffix
				}) : null,
				rangeText(control, element) ? createElement("span", {
					className: "gpo-editor-security-range",
					text: rangeText(control, element)
				}) : null
			]
		});
	}
	function collectionControl(control, element, context) {
		const container = createElement("div", {
			className: "gpo-editor-security-collection",
			attrs: { "data-security-element": element.id }
		});
		const writable = context.writable && !control.read_only && Boolean(element.unique_by);
		const state = context.getState(element.id);
		const configured = createElement("input", { attrs: { type: "checkbox" } });
		configured.getElement().checked = state.state === "set";
		configured.getElement().disabled = !writable;
		let rows = state.state === "set" ? clone$1(state.value.value || []) : [];
		const rowsHost = createElement("div", { className: "gpo-editor-security-collection__rows" });
		const add = createElement("button", {
			className: "button",
			attrs: { type: "button" },
			text: tr$2("security.addRow", "Add row")
		});
		const binding = { update: function(next, source) {
			configured.getElement().checked = next.state === "set";
			if (!source) {
				rows = next.state === "set" ? clone$1(next.value.value || []) : [];
				renderRows();
			}
			add.getElement().disabled = !writable || !configured.getElement().checked || !canCreateRow(element, control.children);
		} };
		registerBinding(context.bindings, element.id, binding);
		function sync() {
			const next = configured.getElement().checked ? {
				state: "set",
				value: {
					kind: "collection",
					value: clone$1(rows)
				}
			} : { state: "unset" };
			context.setState(element.id, next);
			syncBindings(context.bindings, element.id, binding, next);
		}
		function renderRows() {
			rowsHost.getElement().innerHTML = "";
			rows.forEach(function(row, rowIndex) {
				const rowRoot = createElement("div", { className: "gpo-editor-security-collection__row" });
				const fields = (element.fields || []).map(function(field) {
					return Object.assign({}, field.element, { id: field.id });
				});
				const rowContext = {
					writable: writable && configured.getElement().checked,
					bindings: /* @__PURE__ */ new Map(),
					getState: function(id) {
						return row[id] || { state: "unset" };
					},
					setState: function(id, next) {
						row[id] = next;
						sync();
					}
				};
				(control.children || []).forEach(function(child) {
					rowRoot.append(renderControl(child, fields, rowContext));
				});
				rowRoot.append(createElement("button", {
					className: "button",
					attrs: {
						type: "button",
						disabled: rowContext.writable ? null : "disabled"
					},
					text: tr$2("security.removeRow", "Remove row"),
					events: { click: function() {
						rows.splice(rowIndex, 1);
						sync();
						renderRows();
					} }
				}));
				rowsHost.append(rowRoot);
			});
		}
		configured.on("change", function() {
			if (configured.getElement().checked && !rows.length) rows = [];
			sync();
			renderRows();
		});
		add.getElement().disabled = !writable || !configured.getElement().checked || !canCreateRow(element, control.children);
		add.on("click", function() {
			if (add.getElement().disabled) return;
			rows.push(newRow(element));
			sync();
			renderRows();
		});
		container.append(createElement("label", {
			className: ["field", "field__checkbox"],
			children: [configured, createElement("span", { text: control.label || element.id })]
		}));
		if (!element.unique_by) container.append(createElement("div", {
			className: ["gpo-editor-preference-notice", "gpo-editor-preference-notice--warning"],
			text: tr$2("security.readOnlyCollection", "This collection has no stable row key and is read-only.")
		}));
		container.append(rowsHost);
		container.append(add);
		renderRows();
		return container;
	}
	//#endregion
	//#region src/components/templates/security/dependency-plan.js
	var BASE = "urn:altlinux:sdmx:policies:";
	var AGE_BASED = "overwrite_events_older_than_the_retention_period";
	var AS_NEEDED = "overwrite_events_as_needed";
	var SHAPES = {
		"account.password.maximum_password_age": [
			"integer",
			[[0, 999]],
			[]
		],
		"account.password.minimum_password_age": [
			"integer",
			[[0, 998]],
			[]
		],
		"account.kerberos.max_ticket_age": [
			"integer",
			[[0, 99999]],
			[]
		],
		"account.kerberos.max_service_age": [
			"integer",
			[[0, 0], [10, 99999]],
			[]
		],
		"account.kerberos.max_renew_age": [
			"integer",
			[[0, 99999]],
			[]
		],
		"account.lockout.lockout_bad_count": [
			"integer",
			[[0, 999]],
			[]
		],
		"account.lockout.reset_lockout_count": [
			"integer",
			[[1, 99999]],
			[]
		],
		"account.lockout.lockout_duration": [
			"integer",
			[[0, 99999]],
			[]
		],
		"account.lockout.allow_administrator_lockout": [
			"boolean",
			[],
			[]
		],
		"event_log.security_log_audit_log_retention_period": [
			"enum",
			[],
			[]
		],
		"event_log.security_log_retention_days": [
			"integer",
			[[1, 365]],
			[]
		],
		"event_log.application_log_audit_log_retention_period": [
			"enum",
			[],
			[]
		],
		"event_log.application_log_retention_days": [
			"integer",
			[[1, 365]],
			[]
		],
		"event_log.system_log_audit_log_retention_period": [
			"enum",
			[],
			[]
		],
		"event_log.system_log_retention_days": [
			"integer",
			[[1, 365]],
			[]
		]
	};
	function clone(value) {
		return JSON.parse(JSON.stringify(value));
	}
	function sameRanges(actual, expected) {
		if (!Array.isArray(actual) || actual.length !== expected.length) return false;
		if (actual.some(function(range) {
			return !range || typeof range !== "object";
		})) return false;
		const sorted = actual.map(function(range) {
			return [range.min, range.max];
		}).sort(function(left, right) {
			return left[0] - right[0] || left[1] - right[1];
		});
		const wanted = expected.slice().sort(function(left, right) {
			return left[0] - right[0] || left[1] - right[1];
		});
		return sorted.every(function(range, index) {
			return Number.isSafeInteger(range[0]) && Number.isSafeInteger(range[1]) && range[0] === wanted[index][0] && range[1] === wanted[index][1];
		});
	}
	function compatible(element, shape) {
		if (!element || element.id !== "value" || element.value_type !== shape[0] || element.required !== true || !element.initial || element.initial.kind !== shape[0] || !sameRanges(element.ranges, shape[1]) || !Array.isArray(element.options)) return false;
		if (!sameRanges(element.input_ranges, shape[2])) return false;
		const initial = element.initial.value;
		if (shape[0] === "integer") {
			const domain = element.input_ranges.length ? element.input_ranges.map(function(range) {
				return [range.min, range.max];
			}) : shape[1];
			return Number.isSafeInteger(initial) && domain.some(function(range) {
				return initial >= range[0] && initial <= range[1];
			}) && !element.options.length;
		}
		if (shape[0] === "boolean") return typeof initial === "boolean" && !element.options.length;
		const options = element.options;
		if (!Array.isArray(options) || options.some(function(option) {
			return !option || typeof option.id !== "string";
		})) return false;
		const choices = options.map(function(option) {
			return option.id;
		});
		return typeof initial === "string" && choices.indexOf(initial) !== -1 && choices.indexOf(AGE_BASED) !== -1 && choices.indexOf(AS_NEEDED) !== -1;
	}
	function group(model, namespace, prefix, names) {
		if (!model || !model.policies || typeof model.policies.get !== "function") return null;
		const policies = {};
		for (let i = 0; i < names.length; i += 1) {
			const id = prefix + "." + names[i];
			const policy = model.policies.get(namespace + "\0" + id);
			const elements = policy && policy.definition && policy.definition.elements;
			if (!policy || policy.namespace !== namespace || policy.policyId !== id || !Array.isArray(elements) || elements.length !== 1 || !SHAPES[id] || !compatible(elements[0], SHAPES[id])) return null;
			policies[names[i]] = policy;
		}
		return policies;
	}
	function draftFor(policy) {
		const defined = policy.state && policy.state.state === "defined";
		const current = defined && policy.state.elements || {};
		const elements = {};
		(policy.definition.elements || []).forEach(function(element) {
			elements[element.id] = defined ? clone(current[element.id] || { state: "unset" }) : element.initial ? {
				state: "set",
				value: clone(element.initial)
			} : { state: "unset" };
		});
		return {
			defined,
			elements
		};
	}
	function valueOf(draft) {
		const state = draft && draft.defined && draft.elements && draft.elements.value;
		return state && state.state === "set" && state.value ? state.value.value : null;
	}
	function initialOf(policy) {
		const element = (policy.definition.elements || []).find(function(item) {
			return item.id === "value";
		});
		return element && element.initial ? element.initial.value : null;
	}
	function set(draft, policy, value) {
		const element = policy.definition.elements.find(function(item) {
			return item.id === "value";
		});
		draft.defined = true;
		draft.elements.value = {
			state: "set",
			value: {
				kind: element.value_type,
				value
			}
		};
	}
	function unset(draft) {
		draft.defined = false;
	}
	function number(draft, policy) {
		const value = valueOf(draft);
		return Number.isSafeInteger(value) ? value : initialOf(policy);
	}
	function finish(policies, names, primaryName, desired) {
		const changes = names.filter(function(name) {
			if (name === primaryName) return false;
			const previous = draftFor(policies[name]);
			const next = desired[name];
			return previous.defined !== next.defined || next.defined && JSON.stringify(previous.elements) !== JSON.stringify(next.elements);
		}).map(function(name) {
			return {
				policy: policies[name],
				draft: desired[name]
			};
		});
		return changes.length ? { changes } : null;
	}
	function begin(policies, names, primaryName, primaryDraft) {
		const desired = {};
		names.forEach(function(name) {
			desired[name] = draftFor(policies[name]);
		});
		desired[primaryName] = clone(primaryDraft);
		return desired;
	}
	function password(model, policy, draft) {
		const names = ["maximum_password_age", "minimum_password_age"];
		const policies = group(model, BASE + "account-password", "account.password", names);
		if (!policies) return null;
		const primary = names.find(function(name) {
			return policies[name] === policy;
		});
		if (!primary) return null;
		const other = names.find(function(name) {
			return name !== primary;
		});
		const desired = begin(policies, names, primary, draft);
		if (!draft.defined) {
			unset(desired[other]);
			return finish(policies, names, primary, desired);
		}
		const chosen = valueOf(draft);
		if (!Number.isSafeInteger(chosen)) return null;
		let counterpart = number(desired[other], policies[other]);
		if (primary === "maximum_password_age") {
			if (chosen < 0 || chosen > 999) return null;
			counterpart = Math.max(0, Math.min(998, counterpart));
			if (chosen !== 0) counterpart = Math.min(counterpart, chosen - 1);
		} else {
			if (chosen < 0 || chosen > 998) return null;
			counterpart = Math.max(0, Math.min(999, counterpart));
			if (counterpart !== 0) counterpart = Math.max(counterpart, chosen + 1);
		}
		set(desired[other], policies[other], counterpart);
		return finish(policies, names, primary, desired);
	}
	function kerberos(model, policy, draft) {
		const names = [
			"max_ticket_age",
			"max_service_age",
			"max_renew_age"
		];
		const policies = group(model, BASE + "account-kerberos", "account.kerberos", names);
		if (!policies) return null;
		const primary = names.find(function(name) {
			return policies[name] === policy;
		});
		if (!primary) return null;
		const desired = begin(policies, names, primary, draft);
		if (!draft.defined) {
			names.forEach(function(name) {
				if (name !== primary) unset(desired[name]);
			});
			return finish(policies, names, primary, desired);
		}
		const chosen = valueOf(draft);
		if (!Number.isSafeInteger(chosen)) return null;
		let ticket = number(desired.max_ticket_age, policies.max_ticket_age);
		let service = number(desired.max_service_age, policies.max_service_age);
		let renew = number(desired.max_renew_age, policies.max_renew_age);
		if (primary === "max_ticket_age" && ticket === 0) {
			service = 0;
			renew = 0;
		} else {
			if (ticket === 0 && (service > 0 || renew > 0)) {
				if (primary === "max_service_age" && service === 0) renew = 0;
				else ticket = Math.max(initialOf(policies.max_ticket_age), Math.ceil(service / 60));
			}
			if (service > ticket * 60) {
				if (primary === "max_ticket_age") service = ticket * 60;
				else ticket = Math.ceil(service / 60);
			}
		}
		if (ticket < 0 || service < 0 || service > 99999 || ticket > 99999 || service > 0 && service < 10 || ticket === 0 && (service !== 0 || renew !== 0) || renew < 0 || renew > 99999) return null;
		names.forEach(function(name) {
			const next = name === "max_ticket_age" ? ticket : name === "max_service_age" ? service : renew;
			if (name !== primary) set(desired[name], policies[name], next);
		});
		return finish(policies, names, primary, desired);
	}
	function lockout(model, policy, draft) {
		const names = [
			"lockout_bad_count",
			"reset_lockout_count",
			"lockout_duration",
			"allow_administrator_lockout"
		];
		const policies = group(model, BASE + "account-lockout", "account.lockout", names);
		if (!policies) return null;
		const primary = names.find(function(name) {
			return policies[name] === policy;
		});
		if (!primary) return null;
		const desired = begin(policies, names, primary, draft);
		let threshold = number(desired.lockout_bad_count, policies.lockout_bad_count);
		if (primary === "lockout_bad_count" && draft.defined && !Number.isSafeInteger(valueOf(draft))) return null;
		if (primary === "lockout_bad_count" && (!draft.defined || threshold === 0) || primary !== "lockout_bad_count" && !draft.defined) {
			if (primary !== "lockout_bad_count" && desired.lockout_bad_count.defined && threshold > 0) set(desired.lockout_bad_count, policies.lockout_bad_count, 0);
			names.forEach(function(name) {
				if (name !== primary && name !== "lockout_bad_count") unset(desired[name]);
			});
			return finish(policies, names, primary, desired);
		}
		if (primary !== "lockout_bad_count" && !Number.isSafeInteger(valueOf(draft)) && primary !== "allow_administrator_lockout") return null;
		if (!desired.lockout_bad_count.defined || threshold === 0) threshold = initialOf(policies.lockout_bad_count);
		let reset = number(desired.reset_lockout_count, policies.reset_lockout_count);
		let duration = number(desired.lockout_duration, policies.lockout_duration);
		let administrator = valueOf(desired.allow_administrator_lockout);
		if (typeof administrator !== "boolean") administrator = initialOf(policies.allow_administrator_lockout);
		if (duration > 0 && duration < reset) {
			if (primary === "lockout_duration") reset = duration;
			else duration = reset;
		}
		if (threshold < 1 || threshold > 999 || reset < 1 || reset > 99999 || duration < 0 || duration > 99999) return null;
		const planned = {
			lockout_bad_count: threshold,
			reset_lockout_count: reset,
			lockout_duration: duration,
			allow_administrator_lockout: administrator
		};
		names.forEach(function(name) {
			if (name !== primary) set(desired[name], policies[name], planned[name]);
		});
		return finish(policies, names, primary, desired);
	}
	function eventLog(model, policy, draft) {
		const namespace = BASE + "event-log";
		for (let i = 0; i < 3; i += 1) {
			const stream = [
				"security",
				"application",
				"system"
			][i];
			const names = [stream + "_log_audit_log_retention_period", stream + "_log_retention_days"];
			const policies = group(model, namespace, "event_log", names);
			if (!policies) continue;
			const primary = names.find(function(name) {
				return policies[name] === policy;
			});
			if (!primary) continue;
			const other = names.find(function(name) {
				return name !== primary;
			});
			const desired = begin(policies, names, primary, draft);
			if (primary === names[0]) {
				if (draft.defined && valueOf(draft) === AGE_BASED) set(desired[other], policies[other], number(desired[other], policies[other]));
				else unset(desired[other]);
			} else if (draft.defined) set(desired[other], policies[other], AGE_BASED);
			else if (desired[other].defined && valueOf(desired[other]) === AGE_BASED) set(desired[other], policies[other], AS_NEEDED);
			return finish(policies, names, primary, desired);
		}
		return null;
	}
	function plan(model, policy, draft) {
		if (!policy || !draft) return null;
		return password(model, policy, draft) || kerberos(model, policy, draft) || lockout(model, policy, draft) || eventLog(model, policy, draft);
	}
	//#endregion
	//#region src/components/templates/security/header-actions.js
	var sequence = 0;
	function bind(header, fallbackHost, handlers) {
		const headerElement = header && header.getElement ? header.getElement() : null;
		let controls = headerElement && headerElement.querySelector(".gp__control");
		const local = !controls;
		if (local) {
			const wrapper = createElement("div", { className: "gp__control" });
			fallbackHost.append(wrapper);
			controls = wrapper.getElement();
		}
		const owner = "security-" + ++sequence;
		controls.setAttribute("data-security-owner", owner);
		controls.style.display = "flex";
		const states = {};
		[
			"create",
			"edit",
			"delete"
		].forEach(function(action) {
			let button = controls.querySelector(".preferences__btn-" + action);
			if (!button) {
				const element = createElement("button", {
					className: ["button", "preferences__btn-" + action],
					attrs: { type: "button" }
				});
				controls.appendChild(element.getElement());
				button = element.getElement();
			}
			const initial = {
				text: button.textContent,
				display: button.style.display,
				disabled: button.disabled,
				active: button.classList.contains("active")
			};
			const handler = handlers[action];
			button.textContent = t(action === "create" ? "security.addItem" : action === "delete" ? "security.remove" : "header.edit");
			button.style.display = handler ? "" : "none";
			function click(event) {
				if (!button.disabled && handler) handler(event);
			}
			button.addEventListener("click", click);
			states[action] = {
				button,
				initial,
				click
			};
		});
		function ownsHeader() {
			return controls.getAttribute("data-security-owner") === owner;
		}
		function update(selection, busy) {
			if (!ownsHeader()) return;
			[
				"create",
				"edit",
				"delete"
			].forEach(function(action) {
				const enabled = !busy && Boolean(handlers[action]) && (action === "create" || Boolean(selection && selection[action]));
				states[action].button.disabled = !enabled;
				states[action].button.classList.toggle("active", enabled);
			});
		}
		update(null, false);
		return {
			update,
			cleanup: function() {
				Object.keys(states).forEach(function(action) {
					const state = states[action];
					state.button.removeEventListener("click", state.click);
					if (!ownsHeader()) return;
					state.button.textContent = state.initial.text;
					state.button.style.display = state.initial.display;
					state.button.disabled = state.initial.disabled;
					state.button.classList.toggle("active", state.initial.active);
				});
				if (ownsHeader()) {
					controls.removeAttribute("data-security-owner");
					controls.style.display = "none";
					if (local) controls.remove();
				}
			}
		};
	}
	//#endregion
	//#region src/components/templates/security/workbench.js
	function tr$1(key, fallback) {
		const text = t("security." + key);
		return text && text !== "security." + key ? text : fallback;
	}
	function typedSummary(definition, state) {
		if (!state || state.state !== "set") return tr$1("notConfigured", "Not configured");
		const value = state.value.value;
		if (state.value.kind === "boolean") return value ? tr$1("enabled", "Enabled") : tr$1("disabled", "Disabled");
		if (state.value.kind === "enum" || state.value.kind === "flags") return (Array.isArray(value) ? value : [value]).map(function(id) {
			const option = (definition.options || []).find(function(option) {
				return option.id === id;
			});
			return option ? option.display_name || id : id;
		}).join(", ");
		if (state.value.kind === "sddl") return tr$1("permissionsDefined", "Permissions defined");
		if (Array.isArray(value)) return value.length ? value.join(", ") : tr$1("emptyValue", "Empty list");
		return String(value);
	}
	function policySummary(policy) {
		if (policy.state.state !== "defined") return tr$1("notConfigured", "Not configured");
		return (policy.definition.elements || []).filter(function(definition) {
			const state = policy.state.elements && policy.state.elements[definition.id];
			return state && state.state === "set";
		}).map(function(definition) {
			return typedSummary(definition, policy.state.elements[definition.id]);
		}).join("; ") || "—";
	}
	function configuredRows(policy, definition) {
		const state = elementState(policy, definition.id);
		return state.state === "set" ? state.value.value || [] : [];
	}
	async function openPolicyDialog(host, options, renderEditor) {
		const config = options || {}, item = config.item || {};
		const model = item.securityModel || buildSecurityModel(await securityDefinitionsShow());
		if (config.isCurrent && !config.isCurrent()) return null;
		const policy$2 = policy(model, item.securityPolicy);
		if (!policy$2) throw new Error(tr$1("missingPolicy", "The security definition is no longer available."));
		const definition = item.securityCollection && collectionElement(policy$2);
		let title = policy$2.definition.display_name || policy$2.policyId;
		let editor;
		if (config.browseCollection && definition) editor = await render({
			item: Object.assign({}, item, { securityModel: model }),
			embedded: true,
			isCurrent: config.isCurrent,
			onSaved: config.onSaved
		}, renderEditor);
		else {
			editor = await renderEditor({
				item: Object.assign({}, item, { securityModel: model }),
				collectionElement: definition,
				rowIndex: config.rowIndex,
				initialRow: config.initialRow,
				isCurrent: config.isCurrent,
				onSaved: config.onSaved
			});
			if (definition) {
				const row = config.rowIndex === void 0 ? config.initialRow : configuredRows(policy$2, definition)[config.rowIndex];
				const key = row && rowKey(definition, row);
				title = key ? String(key.value) : tr$1("addItem", "Add item") + " — " + title;
			}
		}
		if (!editor) return null;
		if (config.isCurrent && !config.isCurrent()) {
			if (editor.cleanup) editor.cleanup();
			return null;
		}
		const readOnly = Boolean(config.browseCollection && definition) || editor.readOnly;
		const dialog = open(host, {
			title,
			content: editor,
			readOnly,
			cancelLabel: readOnly ? tr$1("close", "Close") : void 0,
			restoreFocus: config.restoreFocus,
			isDirty: editor.hasUnsavedChanges,
			onApply: editor.applyChanges,
			onClose: function() {
				if (editor.cleanup) editor.cleanup();
				if (config.onClose) config.onClose();
			}
		});
		return {
			editor,
			dialog
		};
	}
	async function render(options, renderEditor) {
		const config = options || {}, item = config.item || {};
		const model = !item.searchReturnTo && item.securityModel || buildSecurityModel(await securityDefinitionsShow());
		if (config.isCurrent && !config.isCurrent()) return null;
		if (!item.searchReturnTo) item.securityModel = model;
		if (item.securityPreserved) return renderEditor(config);
		const root = createElement("div", { className: [
			"gp__preference",
			"gpo-security-workbench",
			config.embedded ? "gpo-security-workbench--embedded" : null
		] });
		const panel = createElement("div", { className: "gpo-security-workbench__panel" });
		const toolbar = createElement("div", { className: "gpo-security-workbench__toolbar" });
		const table = createElement("table", { className: [
			"preference__table",
			"gpo-catalog-table",
			"gpo-security-table"
		] });
		const body = createElement("tbody");
		const error = createElement("div", {
			className: "gpo-security-error",
			attrs: { role: "alert" }
		});
		const modalHost = createElement("div");
		let activeDialog = null, activeEditor = null, disposed = false, opening = false;
		let selection = null;
		let selectedId = null, pendingNeighbor = null;
		const search = createElement("input", { attrs: {
			type: "search",
			"data-policy-filter": "",
			placeholder: tr$1("filter", "Filter settings"),
			"aria-label": tr$1("filter", "Filter settings")
		} });
		if (!config.embedded && !config.hideHeading) toolbar.append(createElement("h2", {
			text: config.categoryPath || item.title || tr$1("title", "Security Settings"),
			attrs: { "data-category-path": "" }
		}));
		toolbar.append(search);
		panel.append(toolbar);
		panel.append(error);
		panel.append(table);
		root.append(panel);
		root.append(modalHost);
		function selectedPolicy() {
			return policy(model, item.securityPolicy);
		}
		const collection = item.securityCollection && collectionElement(selectedPolicy());
		const collectionWritable = collection && collection.unique_by && writableElement(selectedPolicy(), collection.id);
		const actions = bind(config.header, toolbar, {
			create: collectionWritable ? function() {
				edit(item);
			} : null,
			edit: function() {
				if (selection) selection.open();
			},
			delete: collectionWritable ? function() {
				if (selection && selection.remove) selection.remove();
			} : null
		});
		function syncActions() {
			actions.update(selection && {
				edit: true,
				delete: Boolean(selection.remove)
			}, opening || Boolean(activeDialog));
		}
		const policies = item.securityCategory ? (item.children || []).filter(function(child) {
			return child.securityPolicy && !child.securityCollection;
		}) : collection ? [] : [item];
		function updateModel(response) {
			const next = buildSecurityModel(response);
			Object.keys(next).forEach(function(key) {
				model[key] = next[key];
			});
		}
		async function edit(node, rowIndex, initialRow) {
			if (activeDialog || opening || disposed) return;
			const returnLabel = selection && selection.element.getAttribute("data-security-row");
			opening = true;
			syncActions();
			try {
				const opened = await openPolicyDialog(modalHost, {
					item: Object.assign({}, node, { securityModel: model }),
					rowIndex,
					initialRow,
					isCurrent: function() {
						return !disposed;
					},
					restoreFocus: function() {
						const rows = Array.from(body.getElement().querySelectorAll("[data-security-row]"));
						return rows.find(function(row) {
							return row.getAttribute("data-security-row") === returnLabel;
						}) || rows[Math.min(rowIndex || 0, rows.length - 1)] || search.getElement();
					},
					onSaved: function(response) {
						renderRows();
						if (config.onSaved) config.onSaved(response);
					},
					onClose: function() {
						activeEditor = null;
						activeDialog = null;
						syncActions();
						navigation.sync();
					}
				}, renderEditor);
				if (opened) {
					activeEditor = opened.editor;
					activeDialog = opened.dialog;
				}
			} catch (problem) {
				if (!disposed) {
					error.getElement().replaceChildren();
					error.append(renderError(problem));
				}
			} finally {
				opening = false;
				syncActions();
			}
		}
		function removeRow(index) {
			if (activeDialog || opening || disposed || !collectionWritable) return;
			const policy = selectedPolicy();
			const key = rowKey(collection, configuredRows(policy, collection)[index]);
			const content = createElement("div", { children: [createElement("p", { text: tr$1("removeQuestion", "Remove this item from the policy?") }), createElement("p", { text: String(key.value) })] });
			const failure = createElement("div", {
				className: "gpo-security-error",
				attrs: { role: "alert" }
			});
			content.append(failure);
			const beforeIds = Array.from(body.getElement().querySelectorAll("[data-list-id]")).map(function(row) {
				return row.getAttribute("data-list-id");
			});
			const removedId = selectedId;
			activeDialog = open(modalHost, {
				title: tr$1("removeItem", "Remove item"),
				content,
				applyLabel: tr$1("remove", "Remove"),
				onApply: async function() {
					try {
						const response = await securityDefinitionsUpdate({
							expected_semantic_revision: model.catalog.semantic_revision,
							policies: [{
								namespace: policy.namespace,
								policy_id: policy.policyId,
								elements: [{
									element_id: collection.id,
									action: "rows",
									rows: [{
										action: "delete",
										key
									}]
								}]
							}]
						});
						if (disposed || config.isCurrent && !config.isCurrent()) return false;
						updateModel(response);
						if (config.onSaved) config.onSaved(response);
						pendingNeighbor = {
							before: beforeIds,
							removed: [removedId]
						};
						renderRows();
						return true;
					} catch (problem) {
						failure.getElement().replaceChildren();
						failure.append(renderError(problem));
						return false;
					}
				},
				restoreFocus: function() {
					return selection && selection.element || table.getElement();
				},
				onClose: function() {
					activeDialog = null;
					syncActions();
					navigation.sync();
				}
			});
			syncActions();
		}
		function addRow(label, setting, onOpen, onRemove, id) {
			if (search.getElement().value && (label + " " + setting).toLocaleLowerCase().indexOf(search.getElement().value.toLocaleLowerCase()) === -1) return;
			const row = createElement("tr", {
				attrs: {
					tabindex: "-1",
					"data-security-row": label,
					"data-list-id": id || label,
					"aria-selected": "false"
				},
				children: [createElement("td", {
					attrs: { title: label },
					text: label
				}), createElement("td", {
					attrs: { title: setting },
					text: setting
				})]
			});
			function select() {
				if (selection) {
					selection.element.classList.remove("active");
					selection.element.setAttribute("aria-selected", "false");
				}
				selection = {
					element: row.getElement(),
					open: onOpen,
					remove: onRemove
				};
				selectedId = row.getElement().getAttribute("data-list-id");
				row.getElement().classList.add("active");
				row.getElement().setAttribute("aria-selected", "true");
				syncActions();
				navigation.sync();
			}
			row.getElement().__select = select;
			row.getElement().__open = onOpen;
			row.getElement().__remove = onRemove;
			row.on("click", function() {
				select();
				navigation.focusSelected();
			});
			row.on("dblclick", function() {
				if (!activeDialog && !opening && !disposed) {
					select();
					onOpen();
				}
			});
			body.append(row);
			if (selectedId === row.getElement().getAttribute("data-list-id")) select();
		}
		function serviceCatalog() {
			return Array.isArray(model.response.security_service_catalog) ? model.response.security_service_catalog : [];
		}
		function renderRows() {
			selection = null;
			syncActions();
			const heldFocus = table.getElement().contains(document.activeElement);
			body.getElement().innerHTML = "";
			if (collection) {
				const rows = configuredRows(selectedPolicy(), collection);
				const names = /* @__PURE__ */ new Set();
				rows.map(function(row, index) {
					return {
						row,
						index
					};
				}).sort(function(a, b) {
					return String(rowKey(collection, a.row).value).localeCompare(String(rowKey(collection, b.row).value));
				}).forEach(function(entry) {
					const key = rowKey(collection, entry.row);
					names.add(String(key.value).toLowerCase());
					const summaries = collection.fields.filter(function(field) {
						return field.id !== collection.unique_by;
					}).map(function(field) {
						return typedSummary(field.element, entry.row[field.id]);
					});
					addRow(String(key.value), summaries.join("; "), function() {
						edit(item, entry.index);
					}, collectionWritable ? function() {
						removeRow(entry.index);
					} : null, "row:" + String(key.value));
				});
				if (collection.unique_by === "service_name") serviceCatalog().slice().sort(function(a, b) {
					return (a.display_name || a.name).localeCompare(b.display_name || b.name);
				}).forEach(function(service) {
					if (names.has(service.name.toLowerCase())) return;
					const row = newRow(collection);
					row.service_name = {
						state: "set",
						value: {
							kind: "service_name",
							value: service.name
						}
					};
					if (service.startup_mode) row.startup_mode = {
						state: "set",
						value: {
							kind: "enum",
							value: service.startup_mode
						}
					};
					if (service.sddl) row.sddl = {
						state: "set",
						value: {
							kind: "sddl",
							value: service.sddl
						}
					};
					addRow(service.display_name ? service.display_name + " (" + service.name + ")" : service.name, tr$1("notConfigured", "Not configured"), function() {
						edit(item, void 0, row);
					}, null, "service:" + service.name);
				});
			} else {
				(item.children || []).filter(function(child) {
					return child.type === "folder";
				}).forEach(function(child) {
					addRow(child.title, tr$1("folder", "Folder"), function() {
						if (config.onNavigate) config.onNavigate(child);
					}, null, "folder:" + (child.id || child.title));
				});
				policies.forEach(function(node) {
					const policy$3 = policy(model, node.securityPolicy);
					if (policy$3) addRow(policy$3.definition.display_name || policy$3.policyId, policySummary(policy$3), function() {
						edit(node);
					}, null, "policy:" + policy$3.namespace + ":" + policy$3.policyId);
				});
			}
			if (pendingNeighbor) {
				const all = Array.from(body.getElement().querySelectorAll("[data-list-id]"));
				selectedId = neighbor(pendingNeighbor.before, pendingNeighbor.removed, all.map(function(row) {
					return row.getAttribute("data-list-id");
				}));
				if (selection) {
					selection.element.classList.remove("active");
					selection.element.setAttribute("aria-selected", "false");
				}
				selection = null;
				const neighbor$1 = all.find(function(row) {
					return row.getAttribute("data-list-id") === selectedId;
				});
				if (neighbor$1) /** @type {any} */ neighbor$1.__select();
				pendingNeighbor = null;
			}
			if (!selection) selectedId = null;
			if (!body.getElement().children.length) body.append(createElement("tr", { children: [createElement("td", {
				attrs: { colspan: "2" },
				className: "gpo-security-table__empty",
				text: search.getElement().value ? tr$1("noMatches", "No matching settings.") : tr$1("noItems", "No items are configured.")
			})] }));
			navigation.sync();
			if (heldFocus) navigation.focusSelected();
		}
		if (collection) {
			if (collection.unique_by === "service_name" && !serviceCatalog().length) panel.append(createElement("p", {
				className: "gpo-security-workbench__notice",
				text: tr$1("serviceCatalogMissing", "The service catalog has not been supplied. Configured services are shown below; additional services can be added by name.")
			}));
		}
		table.append(createElement("thead", { children: [createElement("tr", { children: [createElement("th", { text: collection ? tr$1("item", "Item") : tr$1("policy", "Policy") }), createElement("th", { text: tr$1("policySetting", "Policy setting") })] })] }));
		table.append(body);
		const navigation = bind$1(table.getElement(), {
			rows: function() {
				return Array.from(body.getElement().querySelectorAll("[data-list-id]"));
			},
			selected: function() {
				return selection && selection.element;
			},
			select: function(row) {
				row.__select();
			},
			activate: function(row) {
				row.__open();
			},
			remove: function(row) {
				if (row.__remove) row.__remove();
			},
			canRemove: function(row) {
				return Boolean(row.__remove);
			},
			busy: function() {
				return disposed || opening || Boolean(activeDialog);
			}
		});
		search.on("input", renderRows);
		renderRows();
		root.hasUnsavedChanges = function() {
			return Boolean(activeEditor && activeEditor.hasUnsavedChanges());
		};
		root.applyChanges = async function() {
			if (!activeEditor) return true;
			const saved = await activeEditor.applyChanges();
			if (saved && activeDialog) activeDialog.close();
			return saved;
		};
		root.cancelChanges = function() {
			if (activeDialog) activeDialog.close();
			return true;
		};
		root.onMounted = function() {
			if (item.openPolicyDialog && item.securityPolicy && !collection && !disposed) edit(item);
		};
		root.cleanup = function() {
			disposed = true;
			navigation.cleanup();
			if (activeDialog) activeDialog.close();
			actions.cleanup();
		};
		return root;
	}
	//#endregion
	//#region src/components/templates/security-template.js
	async function renderPolicyEditor(options) {
		const config = options || {};
		const item = config.item || {};
		let model = item.securityModel;
		if (!model) {
			model = buildSecurityModel(await securityDefinitionsShow());
			if (typeof config.isCurrent === "function" && !config.isCurrent()) return null;
			item.securityModel = model;
		}
		if (item.securityPreserved) return renderPreserved(model);
		let policy$1 = policy(model, item.securityPolicy);
		if (!policy$1) return createElement("div", {
			className: "gpo-editor-preferences__error",
			text: tr$2("security.missingPolicy", "The security definition is no longer available.")
		});
		const root = createElement("div", {
			className: "gpo-security-policy-editor",
			attrs: {
				"data-security-policy": policy$1.policyId,
				"data-security-namespace": policy$1.namespace
			}
		});
		let baseline = initialDraft(policy$1);
		let draft = clone$1(baseline);
		const rowElement = config.collectionElement;
		const rowWritable = !rowElement || Boolean(rowElement.unique_by) && writableElement(policy$1, rowElement.id);
		let editedRow = null;
		if (rowElement) {
			const rowState = draft.elements[rowElement.id];
			const rowValues = rowState && rowState.state === "set" ? rowState.value.value : [];
			draft.defined = true;
			draft.elements[rowElement.id] = {
				state: "set",
				value: {
					kind: "collection",
					value: rowValues
				}
			};
			if (config.rowIndex !== void 0 && config.rowIndex !== null) editedRow = rowValues[config.rowIndex];
			else {
				editedRow = clone$1(config.initialRow || newRow(rowElement));
				rowValues.push(editedRow);
			}
			(rowElement.fields || []).forEach(function(field) {
				if (rowWritable && writableElement(policy$1, field.id) && field.required && (!editedRow[field.id] || editedRow[field.id].state !== "set")) editedRow[field.id] = {
					state: "set",
					value: field.element.value_type === "enum" && !field.element.initial ? {
						kind: "enum",
						value: ""
					} : defaultTyped(field.element)
				};
			});
		}
		let saving = false;
		let pendingConfirmation = null;
		let errorSlot;
		let rootBindings = /* @__PURE__ */ new Map();
		function isDirty() {
			return !same(baseline, draft);
		}
		function proposedUnit(policyId) {
			if (/^account\.password\.(minimum|maximum)_password_age$/.test(policyId) || /^account\.kerberos\.max_renew_age$/.test(policyId) || /^event_log\.(security|application|system)_log_retention_days$/.test(policyId)) return tr$2("security.dependency.days", "day(s)");
			if (/^account\.kerberos\.max_ticket_age$/.test(policyId)) return tr$2("security.dependency.hours", "hour(s)");
			if (/^account\.kerberos\.max_service_age$/.test(policyId) || /^account\.lockout\.(reset_lockout_count|lockout_duration)$/.test(policyId)) return tr$2("security.dependency.minutes", "minute(s)");
			if (/^account\.lockout\.lockout_bad_count$/.test(policyId)) return tr$2("security.dependency.attempts", "attempt(s)");
			return "";
		}
		function proposedValue(change) {
			if (!change.draft.defined) return tr$2("security.dependency.notConfigured", "Not configured");
			return (change.policy.definition.elements || []).filter(function(element) {
				return change.draft.elements[element.id] && change.draft.elements[element.id].state === "set";
			}).map(function(element) {
				const typed = change.draft.elements[element.id].value;
				if (typed.kind === "boolean") return typed.value ? tr$2("security.enabled", "Enabled") : tr$2("security.disabled", "Disabled");
				if (typed.kind === "enum") {
					const option = (element.options || []).find(function(item) {
						return item.id === typed.value;
					});
					return option ? option.display_name || option.id : typed.value;
				}
				if (typed.kind === "integer") {
					const unit = proposedUnit(change.policy.policyId);
					return String(typed.value) + (unit ? " " + unit : "");
				}
				return String(typed.value);
			}).join("; ") || "—";
		}
		function confirmDependencies(changes) {
			return new Promise(function(resolve) {
				const host = root.getElement().closest(".gpo-security-dialog-host");
				if (!host) {
					resolve(false);
					return;
				}
				const modal = root.getElement().closest(".gpo-security-dialog");
				const table = createElement("table", {
					className: ["preference__table", "gpo-security-table"],
					children: [createElement("thead", { children: [createElement("tr", { children: [createElement("th", { text: tr$2("security.dependency.policy", "Policy") }), createElement("th", { text: tr$2("security.dependency.value", "Value") })] })] }), createElement("tbody", { children: changes.map(function(change) {
						return createElement("tr", { children: [createElement("td", { text: change.policy.definition.display_name || change.policy.policyId }), createElement("td", { text: proposedValue(change) })] });
					}) })]
				});
				const content = createElement("div", { children: [createElement("p", { text: tr$2("security.dependency.intro", "To save this policy, apply the following related settings as well.") }), table] });
				function finish(confirmed) {
					if (modal) {
						modal.inert = false;
						modal.classList.remove("gpo-security-dialog--confirming");
					}
					pendingConfirmation = null;
					resolve(confirmed);
				}
				pendingConfirmation = {
					dialog: open$3(host, {
						title: tr$2("security.dependency.title", "Related policy settings"),
						content,
						confirmLabel: tr$2("security.dependency.apply", "Apply changes"),
						cancelLabel: tr$2("security.dependency.cancel", "Cancel"),
						onConfirm: function() {
							finish(true);
						},
						onCancel: function() {
							finish(false);
						}
					}),
					cancel: function() {
						this.dialog.close();
						finish(false);
					}
				};
				if (modal) {
					modal.inert = true;
					modal.classList.add("gpo-security-dialog--confirming");
				}
			});
		}
		async function save() {
			if (saving || !isDirty()) return true;
			const error = validateDraft(policy$1, draft);
			if (error) {
				errorSlot.getElement().textContent = error;
				errorSlot.getElement().focus();
				return false;
			}
			saving = true;
			try {
				const plan$1 = plan(model, policy$1, draft);
				const changes = plan$1 && plan$1.changes || [];
				for (const change of changes) {
					const dependentError = validateDraft(change.policy, change.draft);
					if (dependentError) {
						errorSlot.getElement().textContent = dependentError;
						errorSlot.getElement().focus();
						return false;
					}
				}
				if (changes.length && !await confirmDependencies(changes)) return false;
				const request = updateRequest(model, policy$1, baseline, draft);
				changes.forEach(function(change) {
					const previous = initialDraft(change.policy);
					request.policies.push(updateRequest(model, change.policy, previous, change.draft).policies[0]);
				});
				const response = await securityDefinitionsUpdate(request);
				const refreshed = buildSecurityModel(response);
				Object.keys(refreshed).forEach(function(key) {
					model[key] = refreshed[key];
				});
				policy$1 = policy(model, item.securityPolicy);
				baseline = initialDraft(policy$1);
				draft = clone$1(baseline);
				if (config.onSaved) config.onSaved(response);
				return true;
			} catch (failure) {
				errorSlot.getElement().innerHTML = "";
				errorSlot.append(renderError(failure));
				const diagnostics = failure && failure.details && Array.isArray(failure.details.diagnostics) ? failure.details.diagnostics : [];
				if (diagnostics.length) errorSlot.append(renderDiagnostics(diagnostics));
				return false;
			} finally {
				saving = false;
			}
		}
		function renderContent() {
			root.getElement().innerHTML = "";
			rootBindings = /* @__PURE__ */ new Map();
			errorSlot = createElement("div", {
				className: "gpo-editor-preferences__error",
				attrs: {
					role: "alert",
					tabindex: "-1"
				}
			});
			(policy$1.definition.notices || []).forEach(function(notice) {
				root.append(createElement("div", {
					className: ["gpo-editor-preference-notice", "gpo-editor-preference-notice--warning"],
					text: notice
				}));
			});
			if (policy$1.diagnostics.length) root.append(renderDiagnostics(policy$1.diagnostics));
			root.append(errorSlot);
			const defined = createElement("input", { attrs: {
				type: "checkbox",
				"data-security-define": ""
			} });
			defined.getElement().checked = draft.defined;
			defined.on("change", function() {
				draft.defined = defined.getElement().checked;
				if (draft.defined) (policy$1.definition.elements || []).forEach(function(element) {
					if (element.required && writableElement(policy$1, element.id) && draft.elements[element.id].state !== "set") draft.elements[element.id] = {
						state: "set",
						value: defaultTyped(element)
					};
				});
				renderContent();
				const currentDefine = root.getElement().querySelector("[data-security-define]");
				if (currentDefine) currentDefine.focus();
			});
			if (!rowElement) root.append(createElement("label", {
				className: [
					"field",
					"field__checkbox",
					"gpo-security-policy-editor__define"
				],
				children: [defined, createElement("span", { text: tr$2("security.definePolicy", "Define this policy") })]
			}));
			let displayedControls = policy$1.controls;
			let displayedElements = policy$1.definition.elements;
			if (rowElement) {
				let collectionControlDefinition;
				function findCollection(controls) {
					(controls || []).forEach(function(control) {
						if (control.element_id === rowElement.id) collectionControlDefinition = control;
						findCollection(control.children);
					});
				}
				findCollection(policy$1.controls);
				displayedControls = collectionControlDefinition && collectionControlDefinition.children || [];
				displayedElements = rowElement.fields.map(function(field) {
					return Object.assign({}, field.element, {
						id: field.id,
						required: field.required
					});
				});
				if (!displayedControls.length) displayedControls = rowElement.fields.map(function(field) {
					return {
						element_id: field.id,
						label: field.display_name || field.id
					};
				});
			}
			const controls = createElement("div", {
				className: "gpo-editor-security-controls",
				children: displayedControls.map(function(control) {
					return renderControl(control, displayedElements, {
						writable: draft.defined && rowWritable,
						bindings: rootBindings,
						getState: function(id) {
							return (editedRow || draft.elements)[id] || { state: "unset" };
						},
						setState: function(id, next) {
							(editedRow || draft.elements)[id] = next;
						}
					});
				})
			});
			root.append(controls);
			const explanation = [
				policy$1.definition.explain_text,
				policy$1.definition.allowed_values,
				policy$1.definition.default_text
			].filter(Boolean);
			const settingsPanel = createElement("div");
			while (root.getElement().firstChild) settingsPanel.getElement().appendChild(root.getElement().firstChild);
			const explanationPanel = createElement("div", {
				className: "gpo-security-explanation",
				children: [createElement("h3", { text: policy$1.definition.display_name || policy$1.policyId })].concat((explanation.length ? explanation : [tr$2("security.noExplanation", "No explanation is available for this setting.")]).map(function(text) {
					return createElement("p", { text });
				}))
			});
			root.append(tabs(settingsPanel, explanationPanel));
		}
		renderContent();
		root.hasUnsavedChanges = isDirty;
		root.readOnly = Boolean(rowElement && !rowWritable);
		root.applyChanges = save;
		root.cancelChanges = function() {
			draft = clone$1(baseline);
			renderContent();
			return true;
		};
		root.cleanup = function() {
			if (pendingConfirmation) pendingConfirmation.cancel();
		};
		return root;
	}
	var renderSecurityTemplate = function(options) {
		return render(options, renderPolicyEditor);
	};
	var openSecurityDialog = function(host, options) {
		return openPolicyDialog(host, options, renderPolicyEditor);
	};
	//#endregion
	//#region src/components/templates/all-policies/model.js
	function text(key, fallback) {
		const value = t(key);
		return value && value !== key ? value : fallback;
	}
	function language() {
		return getLanguage();
	}
	function pathLabels(path) {
		return Array.isArray(path) ? path.map(function(label) {
			return String(label);
		}) : [];
	}
	function identity(kind, scope, parts) {
		return kind + ":" + JSON.stringify([scope].concat(parts));
	}
	function row(kind, scope, parts, title, path, properties) {
		let categoryPath = [text(scope === "computer" ? "policies.machine" : "policies.user", scope)];
		if (kind !== "preferences") categoryPath.push(text("policies.title", "Policies"));
		if (kind === "security" || kind === "advanced_audit") categoryPath.push(text("policies.windowsSettings", "System Settings"));
		categoryPath = categoryPath.concat(pathLabels(path));
		if (kind === "preferences") categoryPath.push(String(title));
		return {
			id: identity(kind, scope, parts),
			title: String(title),
			path: pathLabels(path),
			target: Object.assign({
				title: String(title),
				type: "file",
				icon: "ico-file",
				showInTree: false,
				template: kind,
				scope,
				categoryPath
			}, properties || {})
		};
	}
	function admxRows(result, scope) {
		if (!result || !Array.isArray(result.policies)) throw new TypeError(text("policySearch.invalidIndex", "Invalid policy index"));
		return result.policies.map(function(policy) {
			return row("admx", scope, [policy.id], policy.label || policy.id, [text("policies.adminTemplates", "Administrative Templates")].concat(pathLabels(policy.path)), { policyId: policy.id });
		});
	}
	function reference(value) {
		return Array.isArray(value) ? {
			namespace: value[0],
			id: value[1]
		} : value;
	}
	function securityRows(response, scope) {
		if (scope !== "computer") return [];
		if (!response || !response.security_catalog || !Array.isArray(response.security_catalog.categories) || !Array.isArray(response.security_catalog.policies)) throw new TypeError(text("policySearch.invalidIndex", "Invalid policy index"));
		const model = buildSecurityModel(response);
		const categories = /* @__PURE__ */ new Map();
		((response && response.security_catalog || {}).categories || []).forEach(function(category) {
			categories.set(identity$1(category.namespace, category.id), category);
		});
		function categoryPath(policy) {
			const path = [];
			let current = reference(policy.definition.category);
			const visited = /* @__PURE__ */ new Set();
			while (current) {
				const key = identity$1(current.namespace, current.id);
				if (visited.has(key)) break;
				visited.add(key);
				const category = categories.get(key);
				if (!category) break;
				path.unshift(category.display_name || category.id);
				current = reference(category.parent);
			}
			return [text("security.title", "Security Settings")].concat(path);
		}
		return Array.from(model.policies.values()).map(function(policy) {
			const collection = collectionElement(policy);
			const properties = {
				securityPolicy: {
					namespace: policy.namespace,
					policy_id: policy.policyId
				},
				openPolicyDialog: !collection
			};
			if (collection) properties.securityCollection = collection.id;
			return row("security", scope, [policy.namespace, policy.policyId], policy.definition.display_name || policy.policyId, categoryPath(policy), properties);
		});
	}
	function auditIdentity(value) {
		const item = value || {};
		if (item.kind === "subcategory") {
			const target = item.target || { kind: "system" };
			return JSON.stringify([
				item.kind,
				String(item.guid || "").replace(/[{}]/g, "").toLowerCase(),
				target.kind,
				target.sid || ""
			]);
		}
		if (item.kind === "option") return JSON.stringify([item.kind, item.option]);
		if (item.kind === "global_sacl") return JSON.stringify([item.kind, item.object_kind]);
		return JSON.stringify([
			item.kind,
			item.fields || [],
			item.raw || "",
			item.reason || ""
		]);
	}
	function auditTitle(item) {
		if (item.kind === "subcategory") return item.display_name || item.guid;
		if (item.kind === "option") return item.display_name || item.machine_name || item.option;
		if (item.kind === "global_sacl") return item.object_kind === "registry" ? text("security.advancedAudit.registrySacl", "Registry global SACL") : text("security.advancedAudit.fileSacl", "File global SACL");
		return text("security.advancedAudit.preserved", "Preserved source row");
	}
	function auditRows(response, scope) {
		if (scope !== "computer") return [];
		if (!response || !response.advanced_audit || !Array.isArray(response.advanced_audit.rows) || !Array.isArray(response.advanced_audit.subcategory_catalog)) throw new TypeError(text("policySearch.invalidIndex", "Invalid policy index"));
		const rows = [];
		const duplicates = /* @__PURE__ */ new Map();
		families(response).forEach(function(family) {
			family.rows.forEach(function(item) {
				const key = auditIdentity(item);
				const parts = [family.id, key];
				const occurrenceKey = JSON.stringify(parts);
				const occurrence = duplicates.get(occurrenceKey) || 0;
				duplicates.set(occurrenceKey, occurrence + 1);
				if (occurrence) parts.push(occurrence);
				const path = [
					text("security.title", "Security Settings"),
					text("security.advancedAudit.title", "Advanced Audit Policy Configuration"),
					family.label
				];
				if (item.kind === "subcategory" && item.target && item.target.kind === "user") path.push(item.target.sid || item.target.kind);
				rows.push(row("advanced_audit", scope, parts, auditTitle(item), path, {
					advancedAuditFamilyId: family.id,
					advancedAuditTarget: key,
					advancedAuditOccurrence: occurrence,
					openPolicyDialog: true,
					readOnly: item.kind === "preserved" || item.editable === false
				}));
			});
		});
		return rows;
	}
	function scriptRows(scope) {
		const events = scope === "computer" ? ["startup", "shutdown"] : scope === "user" ? ["logon", "logoff"] : [];
		const labels = {
			startup: "startupScripts",
			shutdown: "shutdownScripts",
			logon: "logonScript",
			logoff: "logoffScript"
		};
		return events.map(function(event) {
			return row("scripts", scope, [event], text("systemSettings." + labels[event], event), [text("policies.windowsSettings", "System Settings"), text(scope === "computer" ? "policies.scriptsComputer" : "policies.scriptsUser", "Scripts")], {
				scriptEvent: event,
				icon: scriptEvent(event),
				openPolicyDialog: true
			});
		});
	}
	function preferenceCategory(document) {
		const id = document.category_id || "other_settings";
		if (id === "system_settings") return text("preferences.windowsSettings", "System Settings");
		if (id === "control_panel_settings") return text("preferences.controlPanelSettings", "Component Settings");
		if (id === "other_settings") return text("preferences.otherSettings", "Other settings");
		return document.category_label || id;
	}
	function preferenceRows(documents, scope) {
		return (Array.isArray(documents) ? documents : []).filter(function(document) {
			return document.scope === scope;
		}).map(function(document) {
			return row("preferences", scope, [document.kind], document.label || document.kind, [text("preferences.title", "Preferences"), preferenceCategory(document)], {
				preferenceKind: document.kind,
				icon: preference(document.kind),
				document: JSON.parse(JSON.stringify(document)),
				readOnly: !document.editable || document.applicable === false
			});
		});
	}
	function normalized(value) {
		return String(value === void 0 || value === null ? "" : value).normalize("NFC").toLocaleLowerCase(language()).replace(/\s+/g, " ").trim();
	}
	function matches(item, query) {
		const needle = normalized(query);
		if (!needle) return true;
		return normalized([item && item.title || ""].concat(pathLabels(item && item.path)).join(" ")).indexOf(needle) !== -1;
	}
	function sortRows(rows) {
		const locale = language();
		return (Array.isArray(rows) ? rows : []).slice().sort(function(left, right) {
			return String(left.title).localeCompare(String(right.title), locale) || pathLabels(left.path).join(" / ").localeCompare(pathLabels(right.path).join(" / "), locale) || String(left.id).localeCompare(String(right.id), locale);
		});
	}
	//#endregion
	//#region src/components/templates/advanced-audit/presentation.js
	function tr(key, fallback) {
		const value = t(key);
		return value && value !== key ? value : fallback;
	}
	function configured(row) {
		return row.configured !== false && row.kind !== "preserved";
	}
	function label(row) {
		if (row.kind === "subcategory") return row.display_name || row.guid;
		if (row.kind === "option") return row.display_name || row.machine_name || row.option;
		if (row.kind === "global_sacl") return row.object_kind === "registry" ? tr("security.advancedAudit.registrySacl", "Registry global SACL") : tr("security.advancedAudit.fileSacl", "File global SACL");
		return tr("security.advancedAudit.preserved", "Preserved source row");
	}
	function summary(row) {
		if (!configured(row)) return tr("security.notConfigured", "Not configured");
		if (row.kind === "subcategory") {
			const setting = row.setting || {};
			if (setting.kind === "system") return systemSettingLabel(setting.value);
			const enabled = [];
			if (setting.none) enabled.push(tr("security.advancedAudit.none", "No auditing"));
			if (setting.include_success) enabled.push(tr("security.advancedAudit.includeSuccess", "Include success"));
			if (setting.exclude_success) enabled.push(tr("security.advancedAudit.excludeSuccess", "Exclude success"));
			if (setting.include_failure) enabled.push(tr("security.advancedAudit.includeFailure", "Include failure"));
			if (setting.exclude_failure) enabled.push(tr("security.advancedAudit.excludeFailure", "Exclude failure"));
			return enabled.join(", ");
		}
		if (row.kind === "option") return row.enabled ? tr("security.enabled", "Enabled") : tr("security.disabled", "Disabled");
		if (row.kind === "global_sacl") return row.sddl ? tr("security.permissionsDefined", "Permissions defined") : tr("security.notConfigured", "Not configured");
		return tr("security.advancedAudit.unknownPreserved", "Unknown row preserved");
	}
	function systemSettingLabel(value) {
		return {
			unchanged: tr("security.advancedAudit.unchanged", "Leave unchanged"),
			success: tr("security.advancedAudit.success", "Success"),
			failure: tr("security.advancedAudit.failure", "Failure"),
			success_and_failure: tr("security.advancedAudit.successAndFailure", "Success and failure"),
			none: tr("security.advancedAudit.none", "No auditing")
		}[value] || String(value || "");
	}
	function emptyRequest() {
		return {
			set_subcategories: [],
			clear_subcategories: [],
			set_options: [],
			clear_options: [],
			set_global_sacls: [],
			clear_global_sacls: []
		};
	}
	//#endregion
	//#region src/components/templates/advanced-audit-template.js
	async function renderAdvancedAuditTemplate(options) {
		const config = options || {};
		const item = config.item || {};
		if (item.advancedAuditError) return createElement("div", {
			className: "gpo-security-error",
			text: tr("security.auditUnavailable", "Advanced Audit is temporarily unavailable. Other security settings remain available.")
		});
		let response = item.advancedAuditResponse || await advancedAuditShow();
		if (typeof config.isCurrent === "function" && !config.isCurrent()) return null;
		let family = familyById(response, item.advancedAuditFamilyId);
		const externalHost = config.dialogHost;
		let disposed = false;
		const root = externalHost ? {} : createElement("div", { className: ["gp__preference", "gpo-security-workbench"] });
		let activeDialog = null;
		let dirty = function() {
			return false;
		};
		let applyCurrent = null;
		let selection = null;
		let selectedId = null, navigation;
		const modalHost = externalHost || createElement("div");
		let errorSlot, body, search, actions, listState;
		if (!externalHost) {
			const data = createElement("div", {
				className: "gpo-security-workbench__panel",
				attrs: { "data-advanced-audit-view": item.advancedAuditFamilyId || "" }
			});
			errorSlot = createElement("div", { className: "gpo-editor-preferences__error" });
			body = createElement("tbody");
			const table = createElement("table", {
				className: [
					"preference__table",
					"gpo-catalog-table",
					"gpo-security-table"
				],
				children: [createElement("thead", { children: [createElement("tr", { children: [createElement("th", { text: tr("security.policy", "Policy") }), createElement("th", { text: tr("security.policySetting", "Policy setting") })] })] }), body]
			});
			listState = item.auditListState || (item.auditListState = { query: "" });
			search = createElement("input", { attrs: {
				type: "search",
				value: listState.query || "",
				placeholder: t("policySearch.categoryPlaceholder"),
				"aria-label": t("policySearch.categoryPlaceholder"),
				"data-policy-filter": ""
			} });
			const toolbar = createElement("div", {
				className: "gpo-security-workbench__toolbar",
				children: [config.hideHeading ? null : createElement("h2", {
					text: config.categoryPath || family && family.label || "",
					attrs: { "data-category-path": "" }
				}), search]
			});
			actions = bind(config.header, toolbar, { edit: function() {
				if (selection) edit(selection.row);
			} });
			data.append(toolbar);
			data.append(errorSlot);
			data.append(table);
			data.append(modalHost);
			root.append(data);
			navigation = bind$1(table.getElement(), {
				rows: function() {
					return Array.from(body.getElement().querySelectorAll("[data-advanced-audit-kind]"));
				},
				selected: function() {
					return selection && selection.element;
				},
				select: function(row) {
					row.__select();
				},
				activate: function(row) {
					edit(row.__auditRow);
				},
				busy: function() {
					return disposed || Boolean(activeDialog);
				}
			});
		}
		function syncActions() {
			if (actions) actions.update(selection && { edit: true }, Boolean(activeDialog));
		}
		function onClose() {
			activeDialog = null;
			applyCurrent = null;
			dirty = function() {
				return false;
			};
			syncActions();
			if (config.onClose) config.onClose();
		}
		function close() {
			if (activeDialog) activeDialog.close();
		}
		function edit(row) {
			if (activeDialog || disposed || typeof config.isCurrent === "function" && !config.isCurrent()) return null;
			if (!row.editable || row.kind === "preserved") {
				activeDialog = open(modalHost, {
					title: label(row),
					readOnly: true,
					content: createElement("div", { children: [createElement("p", { text: tr("security.preservedReadOnly", "This setting is preserved and is read-only.") }), createElement("pre", {
						className: "gpo-security-preserved-value",
						text: row.sddl || row.raw || row.fields && row.fields.join("\n") || row.reason || summary(row)
					})] }),
					restoreFocus: config.restoreFocus || function() {
						return selection && selection.element || search && search.getElement();
					},
					onClose
				});
				syncActions();
				return activeDialog;
			}
			const define = createElement("input", { attrs: {
				type: "checkbox",
				checked: configured(row) ? "checked" : null
			} });
			const fields = createElement("div", { className: "gpo-editor-advanced-audit__fields" });
			const machineName = createElement("input", { attrs: {
				type: "text",
				value: row.machine_name || state(response).suggested_machine_name || "",
				"data-advanced-audit-machine": ""
			} });
			const controls = [machineName.getElement()];
			let requestForRow, descriptor;
			if (row.kind === "subcategory") {
				const setting = row.setting || {
					kind: "system",
					value: "unchanged"
				};
				const system = setting.kind !== "user";
				fields.append(createElement("div", {
					className: "gpo-editor-security-record-identity",
					children: [
						createElement("dt", { text: "GUID" }),
						createElement("dd", { text: row.guid || "" }),
						createElement("dt", { text: tr("security.advancedAudit.target", "Target") }),
						createElement("dd", { text: system ? tr("security.advancedAudit.system", "System") : tr("security.advancedAudit.user", "User SID") + ": " + row.target.sid })
					]
				}));
				if (system) {
					const mode = createElement("select", {
						attrs: { "data-advanced-audit-setting": "" },
						children: [
							"unchanged",
							"success",
							"failure",
							"success_and_failure",
							"none"
						].map(function(value) {
							return createElement("option", {
								attrs: { value },
								text: systemSettingLabel(value)
							});
						})
					});
					mode.getElement().value = setting.value || "unchanged";
					fields.append(createElement("label", {
						className: "gpo-editor-security-record__field",
						children: [createElement("span", { text: tr("security.advancedAudit.auditSetting", "Audit setting") }), createElement("span", {
							className: "field__element",
							children: [mode]
						})]
					}));
					controls.push(mode.getElement());
					requestForRow = function() {
						return {
							kind: "system",
							value: mode.getElement().value
						};
					};
				} else {
					const flags = [
						"include_success",
						"exclude_success",
						"include_failure",
						"exclude_failure",
						"none"
					];
					const flagInputs = {};
					flags.forEach(function(flag) {
						const input = createElement("input", { attrs: {
							type: "checkbox",
							checked: setting[flag] ? "checked" : null,
							"data-advanced-audit-flag": flag
						} });
						flagInputs[flag] = input.getElement();
						controls.push(input.getElement());
						fields.append(createElement("label", {
							className: ["field", "field__checkbox"],
							children: [input, createElement("span", { text: tr("security.advancedAudit." + flag, flag.replace(/_/g, " ")) })]
						}));
					});
					requestForRow = function() {
						const result = { kind: "user" };
						flags.forEach(function(flag) {
							result[flag] = flagInputs[flag].checked;
						});
						return result;
					};
				}
			} else if (row.kind === "global_sacl") {
				descriptor = createElement("textarea", { attrs: {
					rows: "5",
					spellcheck: "false",
					"data-advanced-audit-sddl": "",
					"aria-label": tr("security.securityDescriptor", "Security descriptor (SDDL)")
				} });
				descriptor.getElement().value = row.sddl || "";
				controls.push(descriptor.getElement());
				fields.append(createElement("label", {
					className: "gpo-editor-security-record__field",
					children: [createElement("span", { text: tr("security.securityDescriptor", "Security descriptor (SDDL)") }), createElement("span", {
						className: "field__element",
						children: [descriptor]
					})]
				}));
				fields.append(createElement("p", { text: tr("security.saclHelp", "Supply the complete SACL in SDDL format. Applying replaces the global audit descriptor for this object type.") }));
				requestForRow = function() {
					return descriptor.getElement().value;
				};
			} else {
				const enabled = createElement("input", { attrs: {
					type: "checkbox",
					checked: row.enabled ? "checked" : null,
					"data-advanced-audit-enabled": ""
				} });
				controls.push(enabled.getElement());
				fields.append(createElement("label", {
					className: ["field", "field__checkbox"],
					children: [enabled, createElement("span", { text: tr("security.advancedAudit.enableOption", "Enable this audit option") })]
				}));
				requestForRow = function() {
					return enabled.getElement().checked;
				};
			}
			function sync() {
				controls.forEach(function(control) {
					control.disabled = !define.getElement().checked;
				});
			}
			define.on("change", sync);
			sync();
			const validation = createElement("div", {
				className: "gpo-security-error",
				attrs: { role: "alert" }
			});
			function draftValue() {
				return JSON.stringify([
					define.getElement().checked,
					machineName.getElement().value,
					requestForRow()
				]);
			}
			const baseline = draftValue();
			dirty = function() {
				return baseline !== draftValue();
			};
			applyCurrent = async function() {
				const request = emptyRequest();
				if (!define.getElement().checked) {
					if (row.kind === "subcategory") request.clear_subcategories.push({
						target: row.target,
						guid: row.guid
					});
					else if (row.kind === "global_sacl") request.clear_global_sacls.push(row.object_kind);
					else request.clear_options.push(row.option);
				} else if (row.kind === "subcategory") request.set_subcategories.push({
					machine_name: machineName.getElement().value.trim(),
					target: row.target,
					guid: row.guid,
					setting: requestForRow()
				});
				else if (row.kind === "global_sacl") {
					const sddl = requestForRow();
					if (!sddl.trim() || /[\r\n\0]/.test(sddl)) {
						validation.getElement().textContent = tr("security.validationDescriptor", "Enter one security descriptor without line breaks.");
						descriptor.getElement().focus();
						return false;
					}
					request.set_global_sacls.push({
						machine_name: machineName.getElement().value,
						object_kind: row.object_kind,
						sddl
					});
				} else request.set_options.push({
					machine_name: machineName.getElement().value.trim(),
					option: row.option,
					enabled: requestForRow()
				});
				try {
					response = await advancedAuditUpdate(request);
					if (!item.searchReturnTo) item.advancedAuditResponse = response;
					family = familyById(response, item.advancedAuditFamilyId);
					renderRows();
					if (config.onSaved) config.onSaved(response);
					return true;
				} catch (error) {
					validation.getElement().innerHTML = "";
					validation.append(renderError(error));
					return false;
				}
			};
			const settingsPanel = createElement("div", { children: [
				createElement("label", {
					className: [
						"field",
						"field__checkbox",
						"gpo-security-policy-editor__define"
					],
					children: [define, createElement("span", { text: tr("security.defineSetting", "Define this policy setting") })]
				}),
				fields,
				validation
			] });
			const explanation = row.explain_text || row.description || (row.kind === "global_sacl" ? tr("security.saclHelp", "Supply the complete SACL in SDDL format. Applying replaces the global audit descriptor for this object type.") : tr("security.noExplanation", "No explanation is available for this setting."));
			const explanationPanel = createElement("div", {
				className: "gpo-security-explanation",
				children: [createElement("h3", { text: label(row) }), createElement("p", { text: explanation })]
			});
			activeDialog = open(modalHost, {
				title: label(row),
				content: createElement("div", {
					className: "gpo-security-policy-editor",
					attrs: { "data-advanced-audit-form": "" },
					children: [tabs(settingsPanel, explanationPanel)]
				}),
				isDirty: dirty,
				onApply: applyCurrent,
				restoreFocus: config.restoreFocus || function() {
					return selection && selection.element || search && search.getElement();
				},
				onClose
			});
			syncActions();
			return activeDialog;
		}
		function renderRows() {
			if (externalHost || disposed) return;
			const heldFocus = body.getElement().contains(document.activeElement);
			selection = null;
			syncActions();
			body.getElement().innerHTML = "";
			(family && family.rows || []).filter(function(row) {
				return label(row).toLocaleLowerCase().includes(listState.query.trim().toLocaleLowerCase());
			}).slice().sort(function(a, b) {
				return label(a).localeCompare(label(b));
			}).forEach(function(row, index) {
				const id = auditIdentity(row) + ":" + index;
				const tableRow = createElement("tr", {
					attrs: {
						tabindex: "-1",
						"aria-selected": "false",
						"data-advanced-audit-kind": row.kind,
						"data-advanced-audit-id": row.guid || row.option || row.object_kind || ""
					},
					children: [createElement("td", {
						attrs: { title: label(row) },
						text: label(row)
					}), createElement("td", {
						attrs: { title: summary(row) },
						text: summary(row)
					})]
				});
				function select() {
					if (selection) {
						selection.element.classList.remove("active");
						selection.element.setAttribute("aria-selected", "false");
					}
					selection = {
						row,
						element: tableRow.getElement()
					};
					selectedId = id;
					tableRow.getElement().classList.add("active");
					tableRow.getElement().setAttribute("aria-selected", "true");
					syncActions();
					navigation.sync();
				}
				tableRow.getElement().__select = select;
				tableRow.getElement().__auditRow = row;
				tableRow.on("click", function() {
					select();
					navigation.focusSelected();
				});
				tableRow.on("dblclick", function() {
					if (!activeDialog && !disposed) {
						select();
						edit(row);
					}
				});
				body.append(tableRow);
				if (selectedId === id) select();
			});
			if (!selection) selectedId = null;
			navigation.sync();
			if (heldFocus) navigation.focusSelected();
		}
		if (search) {
			search.on("input", function() {
				listState.query = search.getElement().value;
				renderRows();
			});
			search.on("keydown", function(event) {
				if (event.key === "Escape") {
					search.getElement().value = "";
					listState.query = "";
					renderRows();
				}
			});
		}
		renderRows();
		root.hasUnsavedChanges = function() {
			return dirty();
		};
		root.applyChanges = async function() {
			if (!applyCurrent) return true;
			const saved = await applyCurrent();
			if (saved) close();
			return saved;
		};
		root.cancelChanges = function() {
			close();
			return true;
		};
		root.openPolicyDialog = function() {
			if (!item.advancedAuditTarget) return null;
			const row = (family && family.rows || []).filter(function(row) {
				return auditIdentity(row) === item.advancedAuditTarget;
			})[item.advancedAuditOccurrence || 0];
			if (row) return edit(row);
			const error = new Error(t("policySearch.targetUnavailable"));
			if (errorSlot) errorSlot.append(renderError(error));
			else throw error;
			return null;
		};
		root.onMounted = function() {
			if (item.openPolicyDialog) root.openPolicyDialog();
		};
		root.cleanup = function() {
			disposed = true;
			if (navigation) navigation.cleanup();
			close();
			if (actions) actions.cleanup();
		};
		return root;
	}
	async function openAdvancedAuditDialog(host, options) {
		const editor = await renderAdvancedAuditTemplate(Object.assign({}, options, { dialogHost: host }));
		if (!editor) return null;
		const dialog = editor.openPolicyDialog();
		if (!dialog) {
			editor.cleanup();
			return null;
		}
		return {
			editor,
			dialog
		};
	}
	//#endregion
	//#region src/components/templates/all-policies-template.js
	var PAGE_SIZE = 100;
	function format(key, values) {
		let result = t("policySearch." + key);
		Object.keys(values || {}).forEach(function(name) {
			result = result.replace("{" + name + "}", String(values[name]));
		});
		return result;
	}
	function checkedRows(name, response, scope) {
		if (name === "admx") {
			if (!response || !Array.isArray(response.policies)) throw new Error(t("policySearch.invalidIndex"));
			return admxRows(response, scope);
		}
		if (name === "security") {
			if (!response || !response.security_catalog || !Array.isArray(response.security_catalog.policies) || !Array.isArray(response.security_catalog.categories)) throw new Error(t("policySearch.invalidIndex"));
			return securityRows(response, scope);
		}
		if (name === "audit") {
			if (!response || !response.advanced_audit || !Array.isArray(response.advanced_audit.rows) || !Array.isArray(response.advanced_audit.subcategory_catalog)) throw new Error(t("policySearch.invalidIndex"));
			return auditRows(response, scope);
		}
		return [];
	}
	function updateCachedSource(item, name, response) {
		const sources = item.policySearchSources;
		if (!sources || !sources[name]) return;
		sources[name] = {
			status: "ready",
			response,
			rows: checkedRows(name, response, item.scope)
		};
	}
	function renderAllPoliciesTemplate(options) {
		const config = options || {};
		const item = config.item || {};
		const scope = item.scope === "user" ? "user" : "computer";
		const state = item.policySearchState || (item.policySearchState = {
			query: "",
			page: 0,
			selected: null,
			scrollTop: 0
		});
		const sources = item.policySearchSources || (item.policySearchSources = {});
		let disposed = false;
		let activeDialog = null, activeEditor = null, opening = false;
		const root = createElement("div", {
			className: [
				"gp__preference",
				"gpo-security-workbench",
				"gpo-policy-search"
			],
			attrs: { "data-all-policies-scope": scope }
		});
		const panel = createElement("div", { className: "gpo-security-workbench__panel" });
		const toolbar = createElement("div", { className: "gpo-security-workbench__toolbar" });
		const query = createElement("input", { attrs: {
			type: "search",
			value: state.query || "",
			"data-policy-filter": "",
			placeholder: t("policySearch." + (scope === "user" ? "userPlaceholder" : "computerPlaceholder")),
			"aria-label": t("policySearch." + (scope === "user" ? "userPlaceholder" : "computerPlaceholder"))
		} });
		const status = createElement("div", {
			className: "gpo-policy-search__status",
			attrs: { role: "status" }
		});
		const errors = createElement("div", { className: "gpo-policy-search__errors" });
		const body = createElement("tbody");
		const table = createElement("table", {
			className: [
				"preference__table",
				"gpo-catalog-table",
				"gpo-security-table",
				"gpo-policy-search__table"
			],
			children: [createElement("thead", { children: [createElement("tr", { children: [createElement("th", { text: t("policySearch.name") }), createElement("th", { text: t("policySearch.path") })] })] }), body]
		});
		const previous = createElement("button", {
			className: "button",
			attrs: {
				type: "button",
				"data-policy-page-previous": ""
			},
			text: t("policySearch.previous")
		});
		const next = createElement("button", {
			className: "button",
			attrs: {
				type: "button",
				"data-policy-page-next": ""
			},
			text: t("policySearch.next")
		});
		const pageText = createElement("span", { attrs: { "data-policy-page": "" } });
		const paging = createElement("div", {
			className: "gpo-policy-search__paging",
			children: [
				previous,
				pageText,
				next
			]
		});
		if (!config.hideHeading) toolbar.append(createElement("h2", { text: t("policies.allPolicies") }));
		toolbar.append(query);
		panel.append(toolbar);
		panel.append(errors);
		panel.append(status);
		panel.append(table);
		panel.append(paging);
		root.append(panel);
		let selection = null;
		const actions = bind(config.header, toolbar, { edit: function() {
			if (selection) open(selection);
		} });
		function current() {
			return !disposed && (typeof config.isCurrent !== "function" || config.isCurrent());
		}
		function syncActions() {
			actions.update(selection && { edit: true }, opening || Boolean(activeDialog));
		}
		const navigation = bind$1(table.getElement(), {
			rows: function() {
				return Array.from(body.getElement().querySelectorAll("[data-policy-result-id]"));
			},
			selected: function() {
				return selection && selection.element;
			},
			select: function(row) {
				row.__select();
			},
			activate: function(row) {
				open(row.__policyResult);
			},
			busy: function() {
				return !current() || opening || Boolean(activeDialog);
			}
		});
		async function open(row) {
			if (!current() || !row || opening || activeDialog) return;
			state.selected = row.id;
			state.scrollTop = panel.getElement().scrollTop;
			opening = true;
			syncActions();
			try {
				const kind = row.target.template;
				const audit = kind === "advanced_audit", security = kind === "security";
				const sourceName = audit ? "audit" : kind;
				const modalModel = security ? buildSecurityModel(sources.security.response) : null;
				const openDialog = audit ? openAdvancedAuditDialog : security ? openSecurityDialog : kind === "admx" ? openAdmxDialog : kind === "scripts" ? openScriptsDialog : kind === "preferences" ? openPreferencesDialog : null;
				if (!openDialog) throw new Error(t("policySearch.targetUnavailable"));
				const opened = await openDialog(root, {
					item: Object.assign({}, row.target, audit ? { advancedAuditResponse: sources.audit.response } : security ? { securityModel: modalModel } : {}),
					browseCollection: Boolean(row.target.securityCollection),
					isCurrent: current,
					restoreFocus: function() {
						return selection && selection.element || query.getElement();
					},
					onSaved: function(response) {
						const scrollTop = panel.getElement().scrollTop;
						if (audit || security) {
							sources[sourceName].response = response;
							sources[sourceName].rows = checkedRows(sourceName, response, scope);
						} else if (kind === "admx") {
							const savedPolicy = response.policy || response;
							const indexed = sources.admx.response.policies.find(function(policy) {
								return policy.id === row.target.policyId;
							});
							if (indexed && savedPolicy.label) indexed.label = savedPolicy.label;
							sources.admx.rows = checkedRows("admx", sources.admx.response, scope);
						}
						showRows();
						panel.getElement().scrollTop = scrollTop;
						if (audit && config.onAuditSaved) config.onAuditSaved(response);
						if (security && config.onSecuritySaved) config.onSecuritySaved(modalModel, response);
					},
					onClose: function() {
						activeDialog = null;
						activeEditor = null;
						syncActions();
					}
				});
				if (opened && !current()) {
					if (opened.editor.cleanup) opened.editor.cleanup();
					opened.dialog.close();
				} else if (opened) {
					activeDialog = opened.dialog;
					activeEditor = opened.editor;
				}
			} catch (problem) {
				if (current()) {
					errors.getElement().replaceChildren();
					errors.append(renderError(problem));
				}
			} finally {
				opening = false;
				syncActions();
			}
		}
		function showRows() {
			if (!current()) return;
			const heldFocus = table.getElement().contains(document.activeElement);
			const allRows = [];
			const incomplete = [], pending = [];
			[
				"admx",
				"security",
				"audit",
				"scripts",
				"preferences"
			].forEach(function(name) {
				const source = sources[name];
				if (!source) return;
				if (source.status === "error") incomplete.push({
					name,
					error: source.error
				});
				else if (source.status === "loading") pending.push(name);
				else if (source.status === "ready") allRows.push.apply(allRows, source.rows);
			});
			const rows = sortRows(allRows).filter(function(row) {
				return matches(row, state.query);
			});
			const pages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
			state.page = Math.max(0, Math.min(Number(state.page) || 0, pages - 1));
			body.getElement().replaceChildren();
			selection = null;
			rows.slice(state.page * PAGE_SIZE, (state.page + 1) * PAGE_SIZE).forEach(function(row) {
				const path = row.path.join(" / ");
				const node = createElement("tr", {
					attrs: {
						tabindex: "-1",
						"aria-selected": "false",
						"data-policy-result-id": row.id
					},
					children: [createElement("td", {
						attrs: { title: row.title },
						children: [createElement("span", {
							className: "gpo-catalog-name",
							children: [createElement("span", {
								className: ["icon", row.target.icon],
								attrs: { "aria-hidden": "true" }
							}), createElement("span", { text: row.title })]
						})]
					}), createElement("td", {
						text: path,
						attrs: { title: path }
					})]
				});
				function select() {
					if (selection && selection.element) {
						selection.element.classList.remove("active");
						selection.element.setAttribute("aria-selected", "false");
					}
					selection = Object.assign({}, row, { element: node.getElement() });
					state.selected = row.id;
					node.getElement().classList.add("active");
					node.getElement().setAttribute("aria-selected", "true");
					syncActions();
					navigation.sync();
				}
				node.getElement().__select = select;
				node.getElement().__policyResult = row;
				node.on("click", function() {
					select();
					navigation.focusSelected();
				});
				node.on("dblclick", function() {
					if (!opening && !activeDialog) {
						select();
						open(row);
					}
				});
				body.append(node);
				if (state.selected === row.id) select();
			});
			syncActions();
			errors.getElement().replaceChildren();
			if (incomplete.length) {
				errors.append(createElement("p", {
					className: "gpo-security-workbench__notice",
					text: t("policySearch.incomplete")
				}));
				incomplete.forEach(function(failure) {
					errors.append(renderError(failure.error));
				});
				const retry = createElement("button", {
					className: ["button", "active"],
					attrs: {
						type: "button",
						"data-policy-retry": ""
					},
					text: t("policySearch.retry")
				});
				retry.on("click", function() {
					incomplete.forEach(function(failure) {
						delete sources[failure.name];
					});
					loadSources();
				});
				errors.append(retry);
			}
			status.getElement().textContent = pending.length ? t("policySearch.loading") + " " + format("count", {
				matched: rows.length,
				total: allRows.length
			}) : format("count", {
				matched: rows.length,
				total: allRows.length
			});
			if (!rows.length && !pending.length && !incomplete.length) body.append(createElement("tr", { children: [createElement("td", {
				className: "gpo-security-table__empty",
				attrs: { colspan: "2" },
				text: t("policySearch.noMatches")
			})] }));
			pageText.getElement().textContent = format("page", {
				page: state.page + 1,
				pages
			});
			previous.getElement().disabled = state.page <= 0;
			next.getElement().disabled = state.page >= pages - 1;
			paging.getElement().hidden = pages <= 1;
			navigation.sync();
			if (heldFocus) navigation.focusSelected();
		}
		function setStatic(name, rows) {
			sources[name] = {
				status: "ready",
				rows
			};
		}
		function fetch(name, request) {
			if (!sources[name]) {
				const source = {
					status: "loading",
					rows: [],
					error: null
				};
				sources[name] = source;
				source.promise = Promise.resolve().then(request).then(function(response) {
					source.rows = checkedRows(name, response, scope);
					source.response = response;
					source.status = "ready";
				}).catch(function(error) {
					source.error = error;
					source.status = "error";
				}).then(function() {
					if (current()) showRows();
				});
			} else if (sources[name].status === "loading") sources[name].promise.then(function() {
				if (current()) showRows();
			});
		}
		function loadSources() {
			if (!sources.scripts) setStatic("scripts", scriptRows(scope));
			if (!sources.preferences) setStatic("preferences", item.includePreferences ? preferenceRows(item.preferenceDocuments, scope) : []);
			fetch("admx", function() {
				return policyIndex(scope);
			});
			if (scope === "computer") {
				fetch("security", securityDefinitionsShow);
				fetch("audit", advancedAuditShow);
			}
			showRows();
		}
		query.on("input", function() {
			state.query = query.getElement().value;
			state.page = 0;
			state.selected = null;
			panel.getElement().scrollTop = 0;
			showRows();
		});
		query.on("keydown", function(event) {
			if (event.key === "Escape") {
				query.getElement().value = "";
				query.getElement().dispatchEvent(new Event("input", { bubbles: true }));
			}
		});
		previous.on("click", function() {
			if (state.page > 0) {
				state.page--;
				panel.getElement().scrollTop = 0;
				showRows();
			}
		});
		next.on("click", function() {
			state.page++;
			panel.getElement().scrollTop = 0;
			showRows();
		});
		root.onMounted = function() {
			panel.getElement().scrollTop = state.scrollTop || 0;
		};
		root.hasUnsavedChanges = function() {
			return Boolean(activeEditor && activeEditor.hasUnsavedChanges && activeEditor.hasUnsavedChanges());
		};
		root.applyChanges = async function() {
			if (!activeEditor) return true;
			const saved = await activeEditor.applyChanges();
			if (saved && activeDialog) activeDialog.close();
			return saved;
		};
		root.cancelChanges = function() {
			if (activeDialog) activeDialog.close();
			return true;
		};
		root.cleanup = function() {
			state.scrollTop = panel.getElement().scrollTop;
			disposed = true;
			navigation.cleanup();
			if (activeEditor && activeEditor.cleanup) activeEditor.cleanup();
			if (activeDialog) activeDialog.close();
			actions.cleanup();
		};
		loadSources();
		return root;
	}
	//#endregion
	//#region src/app.js
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
			treeItemElements: /* @__PURE__ */ new WeakMap(),
			treeListItemElements: /* @__PURE__ */ new WeakMap(),
			parentItems: /* @__PURE__ */ new WeakMap(),
			currentView: null,
			pendingNavigation: null,
			policyChangedModal: null,
			searchReturnButton: null,
			setWorkspace: function(workspace) {
				this.workspace = workspace;
				const node = workspace && workspace.getElement();
				if (!node) return;
				node.setAttribute("role", "region");
				node.setAttribute("aria-label", t("navigation.catalog"));
				const container = node.closest(".gp__container");
				if (!container) return;
				if (container._gpoPaneNavigation) container.removeEventListener("keydown", container._gpoPaneNavigation);
				const state = this;
				container._gpoPaneNavigation = function(event) {
					if (event.key !== "F6" || event.defaultPrevented || event.ctrlKey || event.metaKey || event.altKey) return;
					const target = event.target;
					if (target.closest("input, textarea, select, [contenteditable]:not([contenteditable=\"false\"])")) return;
					const ownerDialog = target.closest("[role=\"dialog\"], [role=\"alertdialog\"]");
					if (ownerDialog && !ownerDialog.matches(".modal-gpui")) return;
					if (Array.from(container.querySelectorAll("[role=\"dialog\"], [role=\"alertdialog\"], .policy-changed__modal")).some(function(modal) {
						return modal.classList.contains("active") || modal.getClientRects().length && modal.getBoundingClientRect().width > 0 && getComputedStyle(modal).opacity !== "0" && getComputedStyle(modal).visibility !== "hidden";
					})) return;
					const destination = Boolean(target.closest(".tree-view")) ? node.querySelector("[data-list-navigation] [tabindex=\"0\"], [data-list-navigation][tabindex=\"0\"]") || node.querySelector("[data-policy-filter]") || node.querySelector(".gpo-category-path__segment[tabindex=\"0\"]") : container.querySelector(".tree-view .tree-item[tabindex=\"0\"]");
					if (destination && state.workspace === workspace) {
						event.preventDefault();
						destination.focus({ preventScroll: true });
					}
				};
				container.addEventListener("keydown", container._gpoPaneNavigation);
			},
			setTreeData: function(treeData) {
				this.treeData = Array.isArray(treeData) ? treeData : [];
			},
			setHeader: function(header) {
				this.header = header;
			},
			initHelpControls: function() {
				const btnInformation = this.header && this.header.getElement && this.header.getElement() ? this.header.getElement().querySelector(".gp__control-help .btn-information") : null;
				if (!btnInformation) return;
				btnInformation.addEventListener("click", this.toggleHelp.bind(this));
				this.syncHelpButtonState();
			},
			registerTreeNode: function(item, options) {
				const config = options || {};
				const treeItemElement = config.treeItemElement || null;
				const listItemElement = config.listItemElement || null;
				const parentItem = config.parentItem || null;
				if (!item) return;
				if (treeItemElement instanceof Element) this.treeItemElements.set(item, treeItemElement);
				if (listItemElement instanceof Element) this.treeListItemElements.set(item, listItemElement);
				if (parentItem) {
					this.parentItems.set(item, parentItem);
					return;
				}
				this.parentItems.delete(item);
			},
			getPathToItem: function(item) {
				if (!item) return [];
				const path = [];
				let currentItem = item;
				while (currentItem) {
					path.unshift(currentItem);
					currentItem = this.parentItems.get(currentItem) || null;
				}
				return path;
			},
			getCategoryHeading: function(item) {
				if (item && Array.isArray(item.categoryPath)) return item.categoryPath.join(" / ");
				return this.getPathToItem(item).map(function(node) {
					return node.title || "";
				}).filter(Boolean).join(" / ");
			},
			renderCategoryPath: function(item) {
				return render$4(this.getPathToItem(item).map(function(node) {
					return {
						title: node.title || "",
						item: node
					};
				}), function(node) {
					this.navigateToNode(node, { openPath: true });
				}.bind(this));
			},
			updateCachedSecurityModels: function(model) {
				const updated = /* @__PURE__ */ new Set();
				function visit(nodes) {
					(nodes || []).forEach(function(node) {
						const cached = node.securityModel;
						if (cached && cached !== model && !updated.has(cached)) {
							Object.keys(model).forEach(function(key) {
								cached[key] = model[key];
							});
							updated.add(cached);
						}
						if (node.children) visit(node.children);
					});
				}
				visit(this.treeData);
			},
			updateCachedPolicySource: function(name, response) {
				function visit(nodes) {
					(nodes || []).forEach(function(node) {
						if (node.template === "all_policies" && node.scope === "computer") updateCachedSource(node, name, response);
						if (name === "audit" && node.advancedAuditResponse) node.advancedAuditResponse = response;
						if (node.children) visit(node.children);
					});
				}
				visit(this.treeData);
			},
			setFolderOpened: function(item, opened) {
				if (!item || item.type !== "folder") return Boolean(item && item.opened);
				return setFolderOpenedState(this.treeListItemElements.get(item) || null, item, opened);
			},
			toggleFolder: function(item) {
				if (!item || item.type !== "folder" || !hasVisibleChildren(item)) return Boolean(item && item.opened);
				const opened = this.setFolderOpened(item, !item.opened);
				if (opened && item.lazy && !item.loaded) {
					const element = this.treeListItemElements.get(item);
					if (element) return ensureLazyChildren(item, element, this).then(function() {
						return item.opened;
					}).catch(function() {
						return item.opened;
					});
				}
				return opened;
			},
			openPathToItem: function(item) {
				const path = this.getPathToItem(item);
				path.slice(0, -1).forEach(function(pathItem) {
					if (pathItem && pathItem.type === "folder") this.setFolderOpened(pathItem, true);
				}, this);
				return path;
			},
			activateTreeItem: function(item, treeItemElement) {
				let nextTreeItemElement = treeItemElement || this.treeItemElements.get(item) || null;
				if (!nextTreeItemElement && item && item.showInTree === false && (item.template === "admx" || item.searchReturnTo)) {
					let parentItem = this.parentItems.get(item) || null;
					while (parentItem && !nextTreeItemElement) {
						nextTreeItemElement = this.treeItemElements.get(parentItem) || null;
						parentItem = this.parentItems.get(parentItem) || null;
					}
				}
				if (!nextTreeItemElement) return null;
				const treeContainer = nextTreeItemElement.closest(".tree-view") || document;
				return setTreeItemActive(nextTreeItemElement, treeContainer);
			},
			cleanupCurrentView: function() {
				if (typeof this.currentViewCleanup === "function") this.currentViewCleanup();
				if (this.searchReturnButton) {
					this.searchReturnButton.remove();
					this.searchReturnButton = null;
				}
				this.currentViewCleanup = null;
			},
			setCurrentView: function(view) {
				this.currentViewCleanup = view && typeof view.cleanup === "function" ? view.cleanup : null;
				this.currentView = view || null;
			},
			isFolderItemSelected: function() {
				return this.selectedItem && this.selectedItem.item && this.selectedItem.item.type === "folder";
			},
			isAdmxItemSelected: function() {
				return this.selectedItem && this.selectedItem.item && this.selectedItem.item.type === "file" && this.selectedItem.item.template === "admx";
			},
			isPreferencesItemSelected: function() {
				return this.selectedItem && this.selectedItem.item && this.selectedItem.item.type === "file" && this.selectedItem.item.template === "preferences";
			},
			isHelpToggleAvailable: function() {
				return this.isFolderItemSelected() || this.isAdmxItemSelected() || this.isPreferencesItemSelected();
			},
			getCurrentHelpSourceItem: function() {
				if (this.isFolderItemSelected()) return this.selectedItem && this.selectedItem.item ? this.selectedItem.item : null;
				return this.selectedPath.slice().reverse().find(function(pathItem) {
					return pathItem && pathItem.type === "folder";
				}) || null;
			},
			buildViewWithPersistentHelp: function(view) {
				if (!this.isHelpOpen) return view;
				const helpSourceItem = this.getCurrentHelpSourceItem();
				const helpBlock = renderHelpBlock({
					help: helpSourceItem ? helpSourceItem.help : void 0,
					isOpen: this.isHelpOpen
				});
				if (!helpBlock) return view;
				return createElement("div", {
					className: "gp__list-children-wrapper",
					children: [view, helpBlock]
				});
			},
			syncHelpButtonState: function() {
				const btnInformation = this.header && this.header.getElement && this.header.getElement() ? this.header.getElement().querySelector(".gp__control-help .btn-information") : null;
				if (!btnInformation) return;
				btnInformation.classList.toggle("active", this.isHelpToggleAvailable());
			},
			syncHelpBlockState: function() {
				const workspaceEl = this.workspace && this.workspace.getElement ? this.workspace.getElement() : null;
				const helpBlocks = workspaceEl ? workspaceEl.querySelectorAll(".gp__list-children-help, .gp__admx-help, .preference__info") : null;
				if (!helpBlocks || helpBlocks.length === 0) return;
				helpBlocks.forEach(function(helpBlock) {
					helpBlock.classList.toggle("is-open", this.isHelpOpen);
				}, this);
			},
			setHelpOpen: function(opened) {
				this.isHelpOpen = Boolean(opened);
				this.syncHelpBlockState();
				return this.isHelpOpen;
			},
			toggleHelp: function() {
				if (!this.isHelpToggleAvailable()) return this.isHelpOpen;
				return this.setHelpOpen(!this.isHelpOpen);
			},
			renderSelectedItem: async function(item, element) {
				const renderRequestId = ++this.renderRequestId;
				this.cleanupCurrentView();
				const headerElement = this.header && this.header.getElement ? this.header.getElement() : null;
				const preferenceControls = headerElement ? headerElement.querySelector(".gp__control") : null;
				const editorActions = headerElement ? headerElement.querySelector(".gp__control-actions") : null;
				if (preferenceControls) preferenceControls.style.display = "none";
				if (editorActions) editorActions.style.display = "none";
				const admxActions = headerElement ? headerElement.querySelector(".gp__control-admx") : null;
				const helpSeparator = headerElement ? headerElement.querySelector(".gp__control-separator") : null;
				if (admxActions) admxActions.style.display = "";
				if (helpSeparator) helpSeparator.style.display = "";
				if (this.workspace) this.workspace.clear();
				this.setCurrentView(null);
				this.selectedPath = this.getPathToItem(item);
				this.selectedItem = {
					item,
					element
				};
				const categoryPath = this.getCategoryHeading(item);
				if (this.workspace) this.workspace.append(this.renderCategoryPath(item));
				let templateResult = null;
				let renderedWorkspaceView = null;
				if (item && item.template === "all_policies") {
					if (editorActions) editorActions.style.display = "flex";
					if (admxActions) admxActions.style.display = "none";
					if (helpSeparator) helpSeparator.style.display = "none";
					templateResult = renderAllPoliciesTemplate({
						item,
						header: this.header,
						hideHeading: true,
						onSecuritySaved: function(model, response) {
							this.updateCachedSecurityModels(model);
							this.updateCachedPolicySource("security", response);
						}.bind(this),
						onAuditSaved: this.updateCachedPolicySource.bind(this, "audit"),
						onNavigate: function(target) {
							target.searchReturnTo = item;
							this.registerTreeNode(target, { parentItem: item });
							this.navigateToNode(target, { openPath: true });
						}.bind(this),
						isCurrent: function() {
							return renderRequestId === this.renderRequestId && this.selectedItem && this.selectedItem.item === item;
						}.bind(this)
					});
					renderedWorkspaceView = templateResult;
				} else if (item && (item.template === "security" || item.template === "advanced_audit")) {
					if (admxActions) admxActions.style.display = "none";
					if (helpSeparator) helpSeparator.style.display = "none";
					templateResult = await (item.template === "security" ? renderSecurityTemplate : renderAdvancedAuditTemplate)({
						item,
						categoryPath,
						header: this.header,
						hideHeading: true,
						onSaved: function(response) {
							if (item.template === "security") this.updateCachedSecurityModels(item.securityModel);
							this.updateCachedPolicySource(item.template === "security" ? "security" : "audit", response);
						}.bind(this),
						onNavigate: function(child) {
							this.navigateToNode(child, {
								openPath: true,
								openCurrentFolder: true
							});
						}.bind(this),
						isCurrent: function() {
							return renderRequestId === this.renderRequestId && this.selectedItem && this.selectedItem.item === item;
						}.bind(this)
					});
					renderedWorkspaceView = templateResult;
				} else if (item && item.type === "folder") {
					if (editorActions) editorActions.style.display = "flex";
					if (admxActions) admxActions.style.display = "none";
					if (helpSeparator) helpSeparator.style.display = "none";
					templateResult = renderFolderTemplate({
						categoryPath,
						hideHeading: true,
						children: item.children || [],
						help: item.help,
						isHelpOpen: this.isHelpOpen,
						listState: item.listState || (item.listState = {}),
						onItemClick: function(childItem) {
							this.navigateToNode(childItem, {
								openPath: true,
								openCurrentFolder: childItem && childItem.type === "folder" ? true : void 0
							});
						}.bind(this)
					});
					renderedWorkspaceView = templateResult;
				} else if (item && item.type === "file") {
					if (item.template === "admx") {
						if (admxActions) admxActions.style.display = "none";
						if (helpSeparator) helpSeparator.style.display = "none";
						const parentCategory = this.parentItems.get(item);
						const state = this;
						let policyDialog = null, policyEditor = null;
						templateResult = renderFolderTemplate({
							hideHeading: true,
							children: parentCategory && parentCategory.children || [item],
							help: parentCategory && parentCategory.help,
							isHelpOpen: this.isHelpOpen,
							listState: parentCategory && (parentCategory.listState || (parentCategory.listState = {})),
							onItemClick: function(child) {
								state.navigateToNode(child, { openPath: true });
							}
						});
						const catalog = templateResult;
						const cleanupCatalog = catalog.cleanup;
						const mountCatalog = catalog.onMounted;
						catalog.onMounted = function() {
							if (mountCatalog) mountCatalog();
							const opened = openAdmxDialog(catalog, {
								item,
								isCurrent: function() {
									return renderRequestId === state.renderRequestId;
								},
								restoreFocus: function() {
									return catalog.getElement().querySelector(".workspace-list-item.active, .workspace-list-item");
								},
								onClose: function() {
									policyDialog = null;
									policyEditor = null;
								}
							});
							if (opened) {
								policyDialog = opened.dialog;
								policyEditor = opened.editor;
							}
						};
						catalog.hasUnsavedChanges = function() {
							return Boolean(policyEditor && policyEditor.hasUnsavedChanges());
						};
						catalog.applyChanges = async function() {
							if (!policyEditor) return true;
							const saved = await policyEditor.applyChanges();
							if (saved && policyDialog) policyDialog.close();
							return saved;
						};
						catalog.cancelChanges = function() {
							if (policyDialog) policyDialog.close();
							return true;
						};
						catalog.cleanup = function() {
							if (policyEditor) policyEditor.cleanup();
							if (policyDialog) policyDialog.close();
							if (cleanupCatalog) cleanupCatalog();
						};
					} else if (item.template === "preferences") templateResult = await renderPreferencesTemplate({
						categoryPath,
						header: this.header,
						hideHeading: true,
						item,
						isHelpOpen: this.isHelpOpen,
						isCurrent: function() {
							return renderRequestId === this.renderRequestId && this.selectedItem && this.selectedItem.item === item;
						}.bind(this)
					});
					else if (item.template === "scripts") {
						if (admxActions) admxActions.style.display = "none";
						if (helpSeparator) helpSeparator.style.display = "none";
						templateResult = renderScriptsTemplate({
							categoryPath,
							item,
							header: this.header,
							hideHeading: true,
							isCurrent: function() {
								return renderRequestId === this.renderRequestId && this.selectedItem && this.selectedItem.item === item;
							}.bind(this)
						});
					} else templateResult = renderDefaultTemplate();
					renderedWorkspaceView = templateResult;
				}
				if (renderRequestId !== this.renderRequestId) {
					if (templateResult && typeof templateResult.cleanup === "function") templateResult.cleanup();
					return;
				}
				if (this.workspace && renderedWorkspaceView) {
					this.workspace.append(renderedWorkspaceView);
					attachFilter(this.workspace.getElement().querySelector(".gpo-category-path"), renderedWorkspaceView.getElement());
					this.setCurrentView(templateResult);
					if (typeof templateResult.onMounted === "function") templateResult.onMounted();
				}
				if (item && item.searchReturnTo && editorActions) {
					const back = createElement("button", {
						className: [
							"button",
							"active",
							"gpo-policy-search__back"
						],
						attrs: {
							type: "button",
							"data-policy-search-back": ""
						},
						text: t("policySearch.back"),
						events: { click: function() {
							this.navigateToNode(item.searchReturnTo, {
								openPath: true,
								openCurrentFolder: true
							});
						}.bind(this) }
					});
					editorActions.prepend(back.getElement());
					editorActions.style.display = "flex";
					this.searchReturnButton = back.getElement();
				}
				this.syncHelpButtonState();
				this.syncHelpBlockState();
			},
			navigateToNode: function(item, options) {
				if (this.pendingNavigation) return false;
				const config = Object.assign({}, options || {}, { navigationRequestId: ++this.navigationRequestId });
				return this.guardNavigation(item, config);
			},
			guardNavigation: function(item, config) {
				if (!config || config.navigationRequestId !== this.navigationRequestId) return false;
				const currentView = this.currentView;
				if (currentView && typeof currentView.hasUnsavedChanges === "function" && currentView.hasUnsavedChanges()) {
					this.pendingNavigation = {
						item,
						options: config
					};
					this.showPolicyChangedModal();
					return false;
				}
				return this.proceedWithNavigation(item, config);
			},
			proceedWithNavigation: function(item, config) {
				config = config || {};
				if (config.navigationRequestId !== this.navigationRequestId) return false;
				const treeItemElement = config.treeItemElement || null;
				const openPath = config.openPath !== void 0 ? config.openPath : true;
				const openCurrentFolder = config.openCurrentFolder;
				if (!item) return false;
				if (item.type === "folder" && item.lazy && !item.loaded && !config.lazyLoadComplete) {
					const listItemElement = this.treeListItemElements.get(item) || null;
					if (!listItemElement) return Promise.resolve(false);
					if (openCurrentFolder !== void 0) this.setFolderOpened(item, openCurrentFolder);
					return ensureLazyChildren(item, listItemElement, this).then(function() {
						if (config.navigationRequestId !== this.navigationRequestId) return false;
						const nextConfig = Object.assign({}, config, { lazyLoadComplete: true });
						delete nextConfig.openCurrentFolder;
						return this.guardNavigation(item, nextConfig);
					}.bind(this)).catch(function() {
						return false;
					});
				}
				if (openPath) this.openPathToItem(item);
				if (item.type === "folder" && openCurrentFolder !== void 0) this.setFolderOpened(item, openCurrentFolder);
				const activeTreeItemElement = this.activateTreeItem(item, treeItemElement);
				return this.renderSelectedItem(item, activeTreeItemElement);
			},
			showPolicyChangedModal: function() {
				if (this.policyChangedModal) this.policyChangedModal.classList.add("active");
			},
			hidePolicyChangedModal: function() {
				if (this.policyChangedModal) this.policyChangedModal.classList.remove("active");
			},
			handlePolicyChangedYes: async function() {
				this.hidePolicyChangedModal();
				const currentView = this.currentView;
				if (currentView && typeof currentView.applyChanges === "function") {
					if (!await currentView.applyChanges()) {
						this.pendingNavigation = null;
						return;
					}
				}
				const nav = this.pendingNavigation;
				this.pendingNavigation = null;
				if (nav) return this.guardNavigation(nav.item, nav.options);
				return false;
			},
			handlePolicyChangedNo: function() {
				this.hidePolicyChangedModal();
				const currentView = this.currentView;
				if (currentView && typeof currentView.cancelChanges === "function") {
					if (currentView.cancelChanges() === false) {
						this.pendingNavigation = null;
						return false;
					}
				}
				const nav = this.pendingNavigation;
				this.pendingNavigation = null;
				if (nav) return this.guardNavigation(nav.item, nav.options);
				return false;
			},
			initializeSelection: function() {
				if (this.selectedItem && this.selectedItem.item) return;
				const firstRootItem = this.treeData[0] || null;
				if (!firstRootItem) return;
				this.navigateToNode(firstRootItem, {
					openPath: true,
					openCurrentFolder: firstRootItem.type === "folder" ? true : void 0
				});
			}
		};
	}
	function resolveContainer(options) {
		if (options && options.container instanceof Element) return options.container;
		const containerId = options && options.containerId ? options.containerId : "gp__container";
		return document.getElementById(containerId);
	}
	var running = /* @__PURE__ */ new WeakMap();
	function init(options) {
		const container = resolveContainer(options || {});
		if (!container) return null;
		const previous = running.get(container);
		if (previous) previous.cleanup();
		container.innerHTML = "";
		let stopped = false;
		let currentTreeViewState = null;
		let stopResizing = null;
		const editor = {
			container,
			cleanup: function() {
				stopped = true;
				if (stopResizing) stopResizing();
				stopResizing = null;
				if (currentTreeViewState) currentTreeViewState.cleanupCurrentView();
				if (running.get(container) === editor) running.delete(container);
			}
		};
		running.set(container, editor);
		const policyName = (options || {}).policyName;
		setLanguage((navigator.language || "en").slice(0, 2).toLowerCase());
		initialize$1(policyName).then(function(openResult) {
			if (stopped) return;
			const treeViewState = createTreeViewState();
			currentTreeViewState = treeViewState;
			const header = renderHeader(container);
			const headerElement = header.getElement();
			const initialPreferenceControls = headerElement.querySelector(".gp__control");
			const initialEditorActions = headerElement.querySelector(".gp__control-actions");
			if (initialPreferenceControls) initialPreferenceControls.style.display = "none";
			if (initialEditorActions) initialEditorActions.style.display = "none";
			treeViewState.setHeader(header);
			treeViewState.initHelpControls();
			function reconcilePending(event) {
				const button = event.currentTarget;
				button.disabled = true;
				reconcile().then(function(result) {
					const recovery = result.recovery;
					if (recovery && recovery.kind === "conflict") throw new EditorError("Publication reconciliation found a third state.", {
						category: "publication_conflict",
						conflict: recovery.conflict
					});
					const notice = button.closest("[data-editor-status]");
					if (notice) notice.remove();
				}).catch(function(error) {
					const notice = button.closest("[data-editor-status]");
					if (notice) notice.replaceWith(renderError(error, { onReconcile: reconcilePending }).getElement());
				}).finally(function() {
					button.disabled = false;
				});
			}
			const pendingNotice = renderPending(openResult && openResult.pending_publication, reconcilePending);
			if (pendingNotice) container.appendChild(pendingNotice.getElement());
			const renderedMain = renderMain(container, treeViewState);
			renderFooter(container);
			const policyChangedModal = createElement("div", {
				className: "policy-changed__modal",
				children: [createElement("div", {
					className: "policy-changed__modal-wrapper",
					children: [
						createElement("div", {
							className: "policy-changed__modal-header",
							children: [createElement("div", {
								className: "title",
								text: t("policyChangedModal.title")
							})]
						}),
						createElement("div", {
							className: "policy-changed__modal-content",
							text: t("policyChangedModal.message")
						}),
						createElement("div", {
							className: "policy-changed__modal-footer",
							children: [createElement("div", {
								className: ["btn", "btn-no"],
								text: t("policyChangedModal.no")
							}), createElement("div", {
								className: ["btn", "btn-yes"],
								text: t("policyChangedModal.yes")
							})]
						})
					]
				})]
			});
			container.appendChild(policyChangedModal.getElement());
			treeViewState.policyChangedModal = policyChangedModal.getElement();
			const policyBtnNo = treeViewState.policyChangedModal.querySelector(".btn-no");
			const policyBtnYes = treeViewState.policyChangedModal.querySelector(".btn-yes");
			policyBtnNo.addEventListener("click", treeViewState.handlePolicyChangedNo.bind(treeViewState));
			policyBtnYes.addEventListener("click", treeViewState.handlePolicyChangedYes.bind(treeViewState));
			stopResizing = resizable(renderedMain.divider.getElement(), renderedMain.treeView.getElement(), renderedMain.main.getElement());
		}).catch(function(error) {
			container.innerHTML = "";
			container.appendChild(renderError(error, { onRefresh: function() {
				init(options);
			} }).getElement());
		});
		return editor;
	}
	//#endregion
	exports._test = { createTreeViewState };
	Object.defineProperty(exports, "editorDialog", {
		enumerable: true,
		get: function() {
			return editor_dialog_exports;
		}
	});
	exports.init = init;
	Object.defineProperty(exports, "translations", {
		enumerable: true,
		get: function() {
			return translations_exports;
		}
	});
});
