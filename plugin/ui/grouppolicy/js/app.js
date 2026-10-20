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
	var element_creator_exports = /* @__PURE__ */ __exportAll({
		ElementCreator: () => ElementCreator,
		createElement: () => createElement$18,
		default: () => ElementCreator,
		fromHTML: () => fromHTML
	});
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
	function createElement$18(tagName = "div", options = {}) {
		return new ElementCreator(tagName, options);
	}
	/**
	* Convenience function for creating an element from HTML.
	* @param {string} html HTML string.
	* @returns {GpuiElement} DOM element.
	*/
	function fromHTML(html) {
		return ElementCreator.fromHTML(html);
	}
	if (typeof window !== "undefined")
 /** @type {any} */ window.createElement = createElement$18;
	//#endregion
	//#region src/locales/en.js
	var en_exports = /* @__PURE__ */ __exportAll({
		chain: () => __export_chain$1,
		collections: () => __export_collections$1,
		common: () => __export_common$1,
		confirmModal: () => __export_confirmModal$1,
		editorStatus: () => __export_editorStatus$1,
		gpo: () => __export_gpo$1,
		header: () => __export_header$1,
		menu: () => __export_menu$1,
		navigation: () => __export_navigation$1,
		policies: () => __export_policies$1,
		policyChangedModal: () => __export_policyChangedModal$1,
		policySearch: () => __export_policySearch$1,
		preferences: () => __export_preferences$1,
		security: () => __export_security$1,
		systemSettings: () => __export_systemSettings$1,
		tree: () => __export_tree$1,
		treeView: () => __export_treeView$1
	});
	var __export_navigation$1 = {
		path: "Current location",
		tree: "Policy navigation",
		catalog: "Policy catalog",
		keyboardHelp: "Arrow keys select items; Enter edits; Delete removes an item when allowed. F6 switches between the tree and catalog."
	};
	var __export_tree$1 = {
		expand: "Expand category",
		collapse: "Collapse category"
	};
	var __export_editorStatus$1 = {
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
	var __export_security$1 = {
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
	var __export_common$1 = {
		help: "Help:",
		description: "Description:",
		options: "Options:",
		comment: "Comment:",
		edit: "Edit",
		save: "Save"
	};
	var __export_menu$1 = {
		groupPolicy: "GROUP Policy",
		chains: "Chains",
		groupPolicyObjects: "Group Policy Objects"
	};
	var __export_chain$1 = {
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
	var __export_gpo$1 = {
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
	var __export_collections$1 = {
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
	var __export_policySearch$1 = {
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
	var __export_policies$1 = {
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
	var __export_preferences$1 = {
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
	var __export_treeView$1 = {
		loadingPolicies: "Loading policies...",
		unableToLoadPolicies: "Unable to load policies."
	};
	var __export_header$1 = {
		create: "Create",
		edit: "Edit",
		delete: "Delete",
		apply: "Apply",
		cancel: "Cancel",
		information: "Information"
	};
	var __export_systemSettings$1 = {
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
	var __export_policyChangedModal$1 = {
		title: "Save settings dialog",
		message: "Policy settings were modified do you want to save them?",
		no: "No",
		yes: "Yes"
	};
	var __export_confirmModal$1 = { title: "Confirmation" };
	//#endregion
	//#region src/locales/ru.js
	var ru_exports = /* @__PURE__ */ __exportAll({
		chain: () => __export_chain,
		collections: () => __export_collections,
		common: () => __export_common,
		confirmModal: () => __export_confirmModal,
		editorStatus: () => __export_editorStatus,
		gpo: () => __export_gpo,
		header: () => __export_header,
		menu: () => __export_menu,
		navigation: () => __export_navigation,
		policies: () => __export_policies,
		policyChangedModal: () => __export_policyChangedModal,
		policySearch: () => __export_policySearch,
		preferences: () => __export_preferences,
		security: () => __export_security,
		systemSettings: () => __export_systemSettings,
		tree: () => __export_tree,
		treeView: () => __export_treeView
	});
	var __export_navigation = {
		path: "Текущее расположение",
		tree: "Навигация по политикам",
		catalog: "Каталог политик",
		keyboardHelp: "Стрелки переключают выделение; Enter открывает редактор; Delete удаляет элемент, если это разрешено. F6 переключает дерево и каталог."
	};
	var __export_tree = {
		expand: "Раскрыть категорию",
		collapse: "Свернуть категорию"
	};
	var __export_editorStatus = {
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
	var __export_security = {
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
	var __export_common = {
		help: "Помощь:",
		description: "Описание:",
		options: "Опции:",
		comment: "Комментарий:",
		edit: "Редактировать",
		save: "Сохранить"
	};
	var __export_menu = {
		groupPolicy: "Групповые политики",
		chains: "Цепочки",
		groupPolicyObjects: "Объекты групповых политик"
	};
	var __export_chain = {
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
	var __export_gpo = {
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
	var __export_collections = {
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
	var __export_policySearch = {
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
	var __export_policies = {
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
	var __export_preferences = {
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
	var __export_treeView = {
		loadingPolicies: "Loading policies...",
		unableToLoadPolicies: "Не удалось загрузить политики."
	};
	var __export_header = {
		create: "Создать",
		edit: "Изменить",
		delete: "Удалить",
		apply: "Применить",
		cancel: "Отмена",
		information: "Сведения"
	};
	var __export_systemSettings = {
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
	var __export_policyChangedModal = {
		title: "Состояние настроек",
		message: "Настройки политики были изменены, хотите сохранить их?",
		no: "Нет",
		yes: "Да"
	};
	var __export_confirmModal = { title: "Подтверждение" };
	//#endregion
	//#region src/locales/translations.js
	var translations_exports = /* @__PURE__ */ __exportAll({
		getLanguage: () => getLanguage,
		setLanguage: () => setLanguage,
		t: () => t$12
	});
	var translations = {
		en: en_exports,
		ru: ru_exports
	};
	var currentLang = "en";
	function t$12(key) {
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
	var { createElement: createElement$17 } = element_creator_exports;
	var { t: t$11 } = translations_exports;
	function renderHeader$1(container) {
		const element = createElement$17("div", {
			className: "gp__header",
			children: [createElement$17("div", {
				className: "gp__header-left",
				children: [
					createElement$17("div", { className: "gp__search" }),
					createElement$17("div", { className: "gp__nav" }),
					createElement$17("div", {
						className: "gp__control",
						children: [
							createElement$17("button", {
								className: ["button", "preferences__btn-create"],
								text: t$11("header.create")
							}),
							createElement$17("button", {
								className: ["button", "preferences__btn-edit"],
								text: t$11("header.edit")
							}),
							createElement$17("button", {
								className: ["button", "preferences__btn-delete"],
								text: t$11("header.delete")
							})
						]
					})
				]
			}), createElement$17("div", {
				className: "gp__control-actions",
				children: [
					createElement$17("div", {
						className: "gp__control-admx",
						children: [createElement$17("button", {
							className: ["button", "admx__btn-apply"],
							text: t$11("header.apply")
						}), createElement$17("button", {
							className: ["button", "admx__btn-cancel"],
							text: t$11("header.cancel")
						})]
					}),
					createElement$17("div", { className: "gp__control-separator" }),
					createElement$17("div", {
						className: "gp__control-help",
						children: [createElement$17("button", {
							className: ["button", "btn-information"],
							text: t$11("header.information")
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
	var tree_view_list_exports = /* @__PURE__ */ __exportAll({
		ensureLazyChildren: () => ensureLazyChildren$1,
		hasVisibleChildren: () => hasVisibleChildren,
		renderTreeViewList: () => renderTreeViewList$1,
		setFolderOpenedState: () => setFolderOpenedState$1,
		setTreeItemActive: () => setTreeItemActive$1
	});
	var createElement$16 = createElement$18;
	var expansionRuns = /* @__PURE__ */ new WeakMap();
	var selectionScrollRuns = /* @__PURE__ */ new WeakMap();
	function scrollTreeItemIntoView(element) {
		var pane = element && element.closest(".tree-view");
		if (!pane || !element.isConnected) return;
		var view = element.ownerDocument.defaultView;
		var run = {};
		selectionScrollRuns.set(pane, run);
		function reveal() {
			if (selectionScrollRuns.get(pane) !== run || !element.isConnected || !element.classList.contains("active") || !element.getClientRects().length) return;
			var bounds = element.getBoundingClientRect();
			var viewport = pane.getBoundingClientRect();
			var top = viewport.top + pane.clientTop;
			var left = viewport.left + pane.clientLeft;
			var bottom = top + pane.clientHeight;
			var right = left + pane.clientWidth;
			if (!pane.clientHeight || !pane.clientWidth || !bounds.height) return;
			var inset = 4;
			if (bounds.top - inset < top) pane.scrollTop += bounds.top - inset - top;
			else if (bounds.bottom + inset > bottom) pane.scrollTop += bounds.bottom + inset - bottom;
			var labelRight = (element.querySelector(".tree-item__title") || element).getBoundingClientRect().right + inset;
			var rowLeft = bounds.left - inset;
			if (labelRight - rowLeft > pane.clientWidth) labelRight = rowLeft + Math.min(80, pane.clientWidth);
			if (rowLeft < left) pane.scrollLeft += rowLeft - left;
			else if (labelRight > right) pane.scrollLeft += labelRight - right;
		}
		view.requestAnimationFrame(function() {
			if (selectionScrollRuns.get(pane) !== run) return;
			reveal();
			var animations = [], fallbackDuration = 0;
			var ancestor = element.parentElement;
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
		var view = element.ownerDocument.defaultView;
		view.requestAnimationFrame(function() {
			if (expansionRuns.get(element) !== run) return;
			if (typeof element.getAnimations === "function") {
				var animations = element.getAnimations().filter(function(animation) {
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
		var view = element.ownerDocument.defaultView;
		if (view.matchMedia("(prefers-reduced-motion: reduce)").matches) return 0;
		var style = view.getComputedStyle(element);
		function milliseconds(value) {
			return parseFloat(value) * (value.trim().endsWith("ms") ? 1 : 1e3) || 0;
		}
		var delays = style.transitionDelay.split(",").map(milliseconds);
		return Math.max.apply(null, style.transitionDuration.split(",").map(function(value, index) {
			return milliseconds(value) + delays[index % delays.length];
		}));
	}
	function visibleRows(root) {
		return Array.from(root.querySelectorAll(".tree-item")).filter(function(row) {
			var current = row.parentElement;
			while (current && current !== root) {
				if (current.matches("ul.tree-view__list") && current.style.display === "none") return false;
				current = current.parentElement;
			}
			return true;
		});
	}
	function syncTreeTabStop(root, previousFocus) {
		if (!root) return;
		var rows = visibleRows(root), chosen = root.querySelector(".tree-item.active");
		while (chosen && rows.indexOf(chosen) === -1) {
			var group = chosen.parentElement.parentElement;
			var parent = group && group.closest("li.view");
			chosen = parent && parent.querySelector(":scope > .tree-item");
		}
		chosen = chosen || rows[0];
		root.tabIndex = rows.length ? -1 : 0;
		Array.from(root.querySelectorAll(".tree-item")).forEach(function(row) {
			row.tabIndex = row === chosen ? 0 : -1;
		});
		var focus = previousFocus || root.ownerDocument.activeElement;
		if (chosen && root.contains(focus) && !rows.some(function(row) {
			return row.contains(focus);
		})) chosen.focus({ preventScroll: true });
	}
	function syncSwitcher(switcher, item) {
		if (!switcher) return;
		var expandable = hasVisibleChildren(item);
		switcher.classList.toggle("icon-switcher--empty", !expandable);
		switcher.setAttribute("tabindex", "-1");
		switcher.setAttribute("aria-hidden", String(!expandable));
		switcher.setAttribute("aria-expanded", String(Boolean(item.opened)));
		switcher.setAttribute("aria-label", t$12(item.opened ? "tree.collapse" : "tree.expand") + ": " + item.title);
	}
	function hasVisibleChildren(item) {
		return Boolean(item && (item.lazy && !item.loaded || (item.children || []).some(function(child) {
			return child.showInTree !== false;
		})));
	}
	function setTreeItemActive$1(treeItemElement, container) {
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
	function setFolderOpenedState$1(listItemElement, item, opened) {
		if (!item || item.type !== "folder") return Boolean(item && item.opened);
		var shouldOpen = Boolean(opened);
		item.opened = shouldOpen;
		if (!listItemElement) return shouldOpen;
		var nested = listItemElement.querySelector(":scope > ul.tree-view__list");
		var changed = listItemElement.classList.contains(shouldOpen ? "closed" : "opened");
		var duration = shouldOpen && changed && listItemElement.isConnected && nested ? expansionDuration(listItemElement) : 0;
		var continuing = shouldOpen && !changed && expansionRuns.has(listItemElement);
		var run = continuing ? expansionRuns.get(listItemElement) : {};
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
		var treeItem = listItemElement.querySelector(":scope > .tree-item");
		if (treeItem && hasVisibleChildren(item)) treeItem.setAttribute("aria-expanded", String(shouldOpen));
		else if (treeItem) treeItem.removeAttribute("aria-expanded");
		var root = listItemElement.closest("[role=\"tree\"]");
		var previousFocus = root && root.ownerDocument.activeElement;
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
		return createElement$16("ul", {
			className: "tree-view__list",
			attrs: {
				role: parentItem ? "group" : "tree",
				"aria-label": parentItem ? null : t$12("navigation.tree"),
				title: parentItem ? null : t$12("navigation.keyboardHelp")
			},
			children: (items || []).filter(function(item) {
				return item.showInTree !== false;
			}).map(function(item) {
				return renderTreeItem(item, treeViewState, parentItem || null);
			})
		});
	}
	function renderLoadError() {
		return createElement$16("li", {
			className: ["view", "tree-view__lazy-error"],
			text: "Не удалось загрузить раздел"
		});
	}
	function ensureLazyChildren$1(item, listItem, treeViewState) {
		if (!item || !item.lazy || item.loaded) return Promise.resolve(item && item.children || []);
		if (item.loadingPromise) return item.loadingPromise;
		listItem.classList.add("loading");
		item.loadingPromise = Promise.resolve().then(function() {
			return item.loadChildren();
		}).then(function(children) {
			item.children = Array.isArray(children) ? children : [];
			item.loaded = true;
			syncSwitcher(listItem.querySelector(":scope > .tree-item > .icon-switcher"), item);
			var oldNested = listItem.querySelector(":scope > ul.tree-view__list");
			if (oldNested) oldNested.remove();
			listItem.appendChild(renderTreeList(item.children, treeViewState, item).getElement());
			setFolderOpenedState$1(listItem, item, item.opened);
			return item.children;
		}).catch(function(error) {
			console.error("[tree-view] Failed to load children.", error);
			var oldNested = listItem.querySelector(":scope > ul.tree-view__list");
			if (oldNested) oldNested.remove();
			listItem.appendChild(createElement$16("ul", {
				className: "tree-view__list",
				children: [renderLoadError()]
			}).getElement());
			setFolderOpenedState$1(listItem, item, item.opened);
			throw error;
		}).finally(function() {
			listItem.classList.remove("loading");
			item.loadingPromise = null;
		});
		return item.loadingPromise;
	}
	function renderTreeItem(item, treeViewState, parentItem) {
		var isFolder = item.type === "folder";
		var classes = ["view", isFolder ? "folder" : "file"];
		if (isFolder) classes.push(item.opened ? "opened" : "closed");
		var treeItem = createElement$16("span", {
			className: "tree-item",
			attrs: {
				role: "treeitem",
				tabindex: parentItem ? "-1" : "0",
				"aria-selected": "false",
				"aria-label": item.title,
				"aria-expanded": isFolder && hasVisibleChildren(item) ? String(Boolean(item.opened)) : null
			},
			children: [
				isFolder ? createElement$16("span", {
					className: ["icon-switcher", hasVisibleChildren(item) ? null : "icon-switcher--empty"],
					attrs: { role: "button" }
				}) : null,
				isFolder ? createElement$16("span", {
					className: "tree-view__status-spinner",
					attrs: { "aria-hidden": "true" }
				}) : null,
				item.icon ? createElement$16("span", { className: ["icon", item.icon] }) : null,
				createElement$16("span", {
					className: "tree-item__title",
					text: item.title
				})
			]
		});
		var listItem = createElement$16("li", {
			className: classes,
			children: [treeItem]
		});
		var listElement = listItem.getElement();
		var switcher = isFolder ? treeItem.getElement().querySelector(".icon-switcher") : null;
		syncSwitcher(switcher, item);
		function toggleExpansion() {
			if (!hasVisibleChildren(item)) return;
			if (treeViewState) treeViewState.toggleFolder(item);
			else setFolderOpenedState$1(listElement, item, !item.opened);
		}
		function selectFromKeyboard(element) {
			if (!element) return;
			if (!treeViewState) {
				setTreeItemActive$1(element);
				element.focus({ preventScroll: true });
				return;
			}
			var target = element._gpoTreeItem;
			if (!target) return;
			var result = treeViewState.navigateToNode(target, {
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
			var root = treeItem.getElement().closest("[role=\"tree\"]");
			if (!root) return;
			var rows = visibleRows(root);
			var index = rows.indexOf(treeItem.getElement()), next = null;
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
			setFolderOpenedState$1(listElement, item, item.opened);
		}
		treeItem.on("click", function(event) {
			event.stopPropagation();
			var clicked = event.currentTarget;
			if (isFolder && event.target instanceof Element && event.target.closest(".icon-switcher")) {
				toggleExpansion();
				return;
			}
			if (!treeViewState) {
				setTreeItemActive$1(clicked);
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
	function renderTreeViewList$1(data, workspace, treeViewState) {
		var treeData = Array.isArray(data) ? data : [];
		if (workspace && treeViewState) {
			treeViewState.setWorkspace(workspace);
			treeViewState.setTreeData(treeData);
		}
		return renderTreeList(treeData, treeViewState, null);
	}
	//#endregion
	//#region src/util/API.js
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
	function unwrapResponse(data) {
		var outer = data && data.result !== void 0 ? data.result : data;
		var payload = outer && outer.result !== void 0 ? outer.result : outer;
		return payload === null || payload === void 0 ? {} : payload;
	}
	function firstObject(candidates) {
		for (var i = 0; i < candidates.length; i += 1) if (candidates[i] && typeof candidates[i] === "object") return candidates[i];
		return {};
	}
	function EditorError(message, details) {
		var info = details || {};
		this.name = "GpoEditorError";
		this.message = message || "GPO editor request failed";
		var inferredCategory = info.category || info.error_category || null;
		var errorName = String(info.name || info.error_name || "");
		if (!inferredCategory && /ACIError|Authorization|NotAllowed/i.test(errorName + " " + (message || ""))) inferredCategory = "authorization";
		this.category = inferredCategory || (typeof info.code === "string" ? info.code : null) || "operational";
		this.code = info.code || this.category;
		this.field = info.field || null;
		this.path = info.path || null;
		var parsedDetails = info.details;
		if (typeof parsedDetails === "string") try {
			parsedDetails = JSON.parse(parsedDetails);
		} catch (ignore) {}
		this.details = parsedDetails && typeof parsedDetails === "object" ? parsedDetails : info;
		this.pendingPublication = info.pending_publication || info.pendingPublication || this.details && this.details.pending_publication || null;
		const errorCtor = Error;
		if (errorCtor.captureStackTrace) errorCtor.captureStackTrace(this, EditorError);
	}
	EditorError.prototype = Object.create(Error.prototype);
	EditorError.prototype.constructor = EditorError;
	function normalizeError(xhr, textStatus, thrown) {
		if (thrown instanceof EditorError) return thrown;
		var response = xhr && (xhr.responseJSON || xhr.response || xhr.data);
		var responseError = response && response.error ? response.error : response;
		var thrownData = thrown && (thrown.data || thrown.details || thrown.error);
		var details = firstObject([
			thrownData && thrownData.error && thrownData.error.data,
			thrownData && thrownData.data,
			responseError && responseError.data,
			thrownData,
			responseError,
			thrown
		]);
		var message = details.message || thrown && thrown.message || responseError && responseError.message || textStatus || "GPO editor request failed";
		return new EditorError(String(message), details);
	}
	function normalizeLocale(locale) {
		var parts = String(locale || "").replace("_", "-").split("-").filter(Boolean);
		if (parts.length === 0) return "en-US";
		var language = parts[0].toLowerCase();
		if (parts.length === 1) {
			if (language === "ru") return "ru-RU";
			if (language === "en") return "en-US";
			return language;
		}
		return language + "-" + parts[1].toUpperCase();
	}
	function localePreferences() {
		var uiLocale = translations_exports && typeof getLanguage === "function" ? getLanguage() : null;
		var browserLocales = [];
		if (typeof navigator !== "undefined") browserLocales = Array.isArray(navigator.languages) && navigator.languages.length ? navigator.languages : [navigator.language];
		var result = [];
		[uiLocale].concat(browserLocales, ["en-US"]).forEach(function(locale) {
			var normalized = normalizeLocale(locale);
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
		var displayName;
		try {
			displayName = requireDisplayName();
		} catch (error) {
			return Promise.reject(error);
		}
		return new Promise(function(resolve, reject) {
			var commandOptions = Object.assign({ version: freeipa_ipa.default.api_version }, clone$4(options || {}));
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
		var cached = editorOpenResult;
		if (!cached || !result || typeof result !== "object") return result;
		[
			"gpo",
			"template",
			"diagnostics",
			"pending_publication"
		].forEach(function(key) {
			if (Object.prototype.hasOwnProperty.call(result, key)) cached[key] = clone$4(result[key]);
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
		var options = {};
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
	var __export_getDisplayName = function() {
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
		var result = response || {};
		var catalog = result.security_catalog || {};
		var snapshot = result.security_snapshot || {};
		var states = /* @__PURE__ */ new Map();
		(snapshot.policies || []).forEach(function(state) {
			states.set(identity$1(state.namespace, state.policy_id), state);
		});
		var categories = /* @__PURE__ */ new Map();
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
		var policies = /* @__PURE__ */ new Map();
		(catalog.policies || []).forEach(function(definition) {
			var key = identity$1(definition.namespace, definition.policy_id);
			var category = reference$1(definition.category);
			var policy = {
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
			var owner = categories.get(identity$1(category.namespace, category.id));
			if (owner) owner.policies.push(policy);
		});
		var roots = [];
		categories.forEach(function(category) {
			var parent = category.parent && categories.get(identity$1(category.parent.namespace, category.parent.id));
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
		var collection = collectionElement(policy);
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
		var elements = policy && policy.definition.elements || [];
		return elements.length === 1 && elements[0].value_type === "collection" ? elements[0] : null;
	}
	function writableElement(policy, id) {
		var matched = false, writable = false;
		function visit(controls, inherited) {
			(controls || []).forEach(function(control) {
				var readOnly = inherited || control.read_only;
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
		var groups = /* @__PURE__ */ new Map();
		(categories || []).forEach(function(category) {
			var namespace = String(category.namespace || "");
			var key = namespace.indexOf("urn:altlinux:sdmx:policies:") === 0 ? "basealt\0" + identity$1(category.id, category.label) : "qualified\0" + identity$1(namespace, category.id);
			var group = groups.get(key);
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
				var collectionNode = policyNode$1(model, group.policies[0]);
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
		var model = buildSecurityModel(response);
		var nodes = categoryNodes(model, model.categories);
		if (model.preserved.length || model.diagnostics.length) nodes.push({
			title: translations_exports ? t$12("security.preservedTitle") : "Preserved and diagnostic records",
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
		var value = translations_exports && t$12("security.advancedAudit." + key);
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
		var rows = configuredRows$1(response).filter(function(row) {
			return row.kind === "subcategory";
		}).map(localizedSubcategory);
		var systemGuids = new Set(rows.filter(function(row) {
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
		var rows = configuredRows$1(response).filter(function(row) {
			return row.kind === "option";
		}).map(function(row) {
			return Object.assign({}, row, { display_name: Object.prototype.hasOwnProperty.call(OPTION_LABELS, row.option) ? tr$7(row.option, OPTION_LABELS[row.option]) : row.display_name || row.machine_name || row.option });
		});
		var byOption = new Set(rows.map(function(row) {
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
		var rows = configuredRows$1(response).filter(function(row) {
			return row.kind === "global_sacl";
		});
		var kinds = new Set(rows.map(function(row) {
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
	var preferences = Object.freeze({
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
	var targeting = Object.freeze({
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
	Object.freeze(Object.keys(preferences));
	Object.freeze(Object.keys(targeting));
	var __export_preference = function(kind) {
		return mapped(preferences, kind, "preferences");
	};
	var __export_preferenceCategory = function(category) {
		return mapped(categories, category, "other-settings");
	};
	var __export_preferencesRoot = function() {
		return icon("preferences");
	};
	var __export_targeting = function(kind) {
		return mapped(targeting, kind, "filter-unknown");
	};
	var __export_scripts = function() {
		return icon("script");
	};
	var __export_scriptEvent = function(event) {
		return mapped(scriptEvents, event, "script");
	};
	var __export_scriptFile = function(group) {
		return icon(group === "powershell" ? "powershell" : "script");
	};
	//#endregion
	//#region src/components/tree-view/tree-view-list-data.js
	var tree_view_list_data_exports = /* @__PURE__ */ __exportAll({
		buildTreeViewList: () => buildTreeViewList,
		loadTreeViewList: () => loadTreeViewList$1,
		policyNode: () => policyNode,
		preferenceCategories: () => preferenceCategories
	});
	var t$10 = t$12;
	function payloadList(result, key) {
		if (Array.isArray(result)) return result;
		return result && Array.isArray(result[key]) ? result[key] : [];
	}
	function policyChildren(scope, result) {
		var language = typeof getLanguage === "function" ? getLanguage() : void 0;
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
			title: t$10("policies.adminTemplates"),
			type: "folder",
			opened: false,
			icon: "ico-folder",
			scope,
			lazy: true,
			help: t$10(scope === "computer" ? "policies.machineAdminTemplates" : "policies.userAdminTemplates"),
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
			icon: __export_preference(document.kind),
			template: "preferences",
			scope: document.scope,
			preferenceKind: document.kind,
			document,
			readOnly: !document.editable || document.applicable === false
		};
	}
	function scriptsNode(scope) {
		return {
			title: t$10(scope === "computer" ? "policies.scriptsComputer" : "policies.scriptsUser"),
			type: "file",
			icon: __export_scripts(),
			template: "scripts",
			scope
		};
	}
	function windowsPolicySettingsNode(scope) {
		/** @type {any[]} */
		var children = [scriptsNode(scope)];
		if (scope === "computer") children.push(securityNode());
		return {
			title: t$10("policies.windowsSettings"),
			type: "folder",
			opened: false,
			icon: "ico-folder",
			scope,
			children
		};
	}
	function securityNode() {
		return {
			title: t$10("security.title"),
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
					var nodes = navigationNodes(responses[0]);
					if (responses[1].value) nodes.push(navigationNode(responses[1].value));
					else nodes.push({
						title: t$10("security.auditUnavailable"),
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
		if (category.id === "system_settings") return t$10("preferences.windowsSettings");
		if (category.id === "control_panel_settings") return t$10("preferences.controlPanelSettings");
		if (category.id === "other_settings") return t$10("preferences.otherSettings");
		return category.label || category.id;
	}
	function preferenceOrder(value) {
		return value === void 0 || value === null || value === "" || !Number.isFinite(Number(value)) ? 999 : Number(value);
	}
	function preferenceCategories(scope, documents) {
		var categories = /* @__PURE__ */ new Map();
		documents.filter(function(document) {
			return document.scope === scope;
		}).forEach(function(document) {
			var id = document.category_id || "other_settings";
			var category = categories.get(id);
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
				icon: __export_preferenceCategory(category.id),
				scope,
				preferenceCategoryId: category.id,
				children: category.documents.map(preferenceNode)
			};
		});
	}
	function scopeNode(scope, documents) {
		var isComputer = scope === "computer";
		var preferenceChildren = preferenceCategories(scope, documents);
		var children = [{
			title: t$10("policies.allPolicies"),
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
			help: t$10("policySearch.description")
		}, {
			title: t$10("policies.title"),
			type: "folder",
			opened: false,
			icon: "ico-folder",
			scope,
			children: [windowsPolicySettingsNode(scope), administrativeTemplates(scope)]
		}];
		if (preferenceChildren.length) children.push({
			title: t$10("preferences.title"),
			type: "folder",
			opened: false,
			icon: __export_preferencesRoot(),
			scope,
			children: preferenceChildren,
			help: t$10("preferences.description")
		});
		return {
			title: isComputer ? t$10("policies.machine") : t$10("policies.user"),
			type: "folder",
			opened: false,
			icon: isComputer ? "ico-computer" : "ico-user",
			help: isComputer ? t$10("policies.machineLevelPolicies") : t$10("policies.userLevelPolicies"),
			children
		};
	}
	function buildTreeViewList(openResult) {
		var result = openResult || {};
		var documents = payloadList(result, "preference_documents");
		return [{
			title: (result.gpo || {}).displayname || __export_getDisplayName() || t$10("policies.localGroupPolicy"),
			type: "folder",
			opened: true,
			help: t$10("policies.localGroupPolicies"),
			children: [scopeNode("computer", documents), scopeNode("user", documents)]
		}];
	}
	function loadTreeViewList$1() {
		return open$4().then(buildTreeViewList);
	}
	//#endregion
	//#region src/components/tree-view/tree-view.js
	var tree_view_exports = /* @__PURE__ */ __exportAll({ renderTreeView: () => renderTreeView$1 });
	var { createElement: createElement$15 } = element_creator_exports;
	var { t: t$9 } = translations_exports;
	var { renderTreeViewList } = tree_view_list_exports;
	var { loadTreeViewList } = tree_view_list_data_exports;
	var TREE_VIEW_MESSAGES = {
		loading: "treeView.loadingPolicies",
		error: "treeView.unableToLoadPolicies"
	};
	function renderTreeViewStatus(type = "loading") {
		const isError = type === "error";
		const children = [];
		if (!isError) children.push(createElement$15("span", {
			className: "tree-view__status-spinner",
			attrs: { "aria-hidden": "true" }
		}));
		children.push(createElement$15("span", {
			className: "tree-view__status-text",
			text: isError ? t$9(TREE_VIEW_MESSAGES.error) : t$9(TREE_VIEW_MESSAGES.loading)
		}));
		return createElement$15("div", {
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
	function renderTreeView$1(workspace = null, treeViewState = null) {
		const element = createElement$15("div", { className: "tree-view" });
		initializeTreeView(element, workspace, treeViewState);
		return element;
	}
	//#endregion
	//#region src/components/divider/divider.js
	var divider_exports = /* @__PURE__ */ __exportAll({ renderDivider: () => renderDivider$1 });
	var { createElement: createElement$14 } = element_creator_exports;
	function renderDivider$1() {
		return createElement$14("div", {
			className: "divider",
			children: [createElement$14("div", { className: "divider__line" })]
		});
	}
	//#endregion
	//#region src/components/workspace/workspace.js
	var workspace_exports = /* @__PURE__ */ __exportAll({ renderWorkspace: () => renderWorkspace$1 });
	var { createElement: createElement$13 } = element_creator_exports;
	function renderWorkspace$1() {
		return createElement$13("div", { className: "workspace" });
	}
	//#endregion
	//#region src/components/main/main.js
	var { createElement: createElement$12 } = element_creator_exports;
	var { renderTreeView } = tree_view_exports;
	var { renderDivider } = divider_exports;
	var { renderWorkspace } = workspace_exports;
	function renderMain$1(container, treeViewState) {
		const workspace = renderWorkspace();
		const treeView = renderTreeView(workspace, treeViewState);
		const divider = renderDivider();
		const main = createElement$12("div", {
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
	var { createElement: createElement$11 } = element_creator_exports;
	function renderFooter$1(container) {
		const element = createElement$11("div", { className: "gp__footer" });
		container.appendChild(element.getElement());
		return element.getElement();
	}
	//#endregion
	//#region src/util/resizable.js
	function resizable$1(divider, panel, container, options = {}) {
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
	var create$12 = createElement$18;
	function render$4(segments, onNavigate) {
		var parts = (segments || []).filter(function(segment) {
			return segment && segment.title;
		});
		var list = create$12("ol", { className: "gpo-category-path__list" });
		var focused = Math.max(0, parts.length - 1);
		function syncFocus() {
			var buttons = list.getElement().querySelectorAll("button");
			Array.from(buttons).forEach(function(button, index) {
				button.tabIndex = index === focused ? 0 : -1;
			});
		}
		parts.forEach(function(segment, index) {
			var last = index === parts.length - 1;
			var label = create$12(segment.item && onNavigate ? "button" : "span", {
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
			list.append(create$12("li", { children: [index ? create$12("span", {
				className: "gpo-category-path__separator",
				attrs: { "aria-hidden": "true" },
				text: " / "
			}) : null, label] }));
		});
		list.on("keydown", function(event) {
			if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
			var buttons = Array.from(list.getElement().querySelectorAll("button"));
			var index = buttons.indexOf(event.target);
			if (index < 0) return;
			var next = event.key === "ArrowLeft" ? index - 1 : event.key === "ArrowRight" ? index + 1 : event.key === "Home" ? 0 : event.key === "End" ? buttons.length - 1 : null;
			if (next === null) return;
			event.preventDefault();
			focused = Math.max(0, Math.min(buttons.length - 1, next));
			syncFocus();
			buttons[focused].focus({ preventScroll: true });
		});
		syncFocus();
		return create$12("nav", {
			className: "gpo-category-path",
			attrs: {
				"data-category-path": "",
				"aria-label": t$12("navigation.path")
			},
			children: [list]
		});
	}
	function attachFilter(header, view) {
		if (!header || !view) return;
		var input = Array.from(view.querySelectorAll("[data-policy-filter]")).find(function(candidate) {
			var owner = candidate.closest("[role=\"dialog\"]");
			return !owner || !view.contains(owner);
		});
		if (!input) return;
		var toolbar = input.parentElement;
		input.classList.add("gpo-category-path__filter");
		header.appendChild(input);
		if (toolbar && toolbar.classList.contains("gpo-security-workbench__toolbar") && !toolbar.children.length) toolbar.remove();
	}
	//#endregion
	//#region src/components/templates/default-template.js
	var { createElement: createElement$10 } = element_creator_exports;
	/**
	* Renders the fallback template when no template is defined.
	* @returns {ElementCreator} Element containing a template-not-defined message.
	*/
	function renderDefaultTemplate$1() {
		return createElement$10("div", {
			className: "gp__default-template",
			children: [createElement$10("div", {
				className: "default-template__message",
				text: "Шаблон не определен"
			})]
		});
	}
	//#endregion
	//#region src/util/collection-value.js
	/** Typed collection values and isolated editor sessions; no DOM or persistence. */
	function clone$3(value) {
		return JSON.parse(JSON.stringify(value));
	}
	function mode(parameter, value) {
		if (parameter.collection && parameter.collection.mode) return parameter.collection.mode;
		return value && value.kind === "key_value_list" ? "key_value" : "list";
	}
	function constraints(parameter, value) {
		var declared = parameter.collection || {};
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
		var rules = constraints(parameter, value);
		var errors = [];
		var entries = value && value.value;
		if (!Array.isArray(entries) || value.kind !== (rules.mode === "key_value" ? "key_value_list" : "text_list")) return [{
			index: null,
			field: null,
			code: "invalidValue"
		}];
		if (entries.length < rules.min_items) errors.push({
			index: null,
			field: null,
			code: "minItems"
		});
		var seen = /* @__PURE__ */ new Map();
		entries.forEach(function(entry, index) {
			var key = rules.mode === "key_value" ? entry && entry.key : entry;
			var text = rules.mode === "key_value" ? entry && entry.value : entry;
			var keyField = rules.mode === "key_value" ? "key" : "value";
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
			var valueLength = rules.length_unit === "utf16" ? text.length : Array.from(text).length;
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
			var keyLength = rules.length_unit === "utf16" ? key.length : Array.from(key).length;
			if (rules.max_key_length !== null && rules.max_key_length !== void 0 && keyLength > rules.max_key_length) errors.push({
				index,
				field: keyField,
				code: "keyTooLong"
			});
			var name = folded(key, rules);
			if (seen.has(name)) {
				errors.push({
					index,
					field: keyField,
					code: "duplicateKey"
				});
				var previous = seen.get(name);
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
		var entries = value && Array.isArray(value.value) ? value.value : [];
		return {
			mode: mode(parameter, value),
			count: entries.length,
			preview: entries.slice(0, 3).map(function(entry) {
				var text = mode(parameter, value) === "key_value" ? entry.key : entry;
				return String(text).replace(/[\r\n\t]+/g, " ");
			}),
			more: entries.length > 3
		};
	}
	function session(parameter, value) {
		var initial = value && Array.isArray(value.value) ? clone$3(value) : empty(parameter, value);
		var rules = constraints(parameter, initial);
		var sequence = 0;
		var rows = initial.value.map(function(entry) {
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
				var copy = Object.assign({}, row);
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
		var state = {
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
				var row = {
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
				var index = rows.findIndex(function(row) {
					return row.id === state.selectedId;
				});
				if (index < 0) return false;
				rows.splice(index, 1);
				state.selectedId = null;
				return true;
			},
			edit: function(id, field, text) {
				var row = state.find(id);
				if (!row || field !== "value" && !(rules.mode === "key_value" && field === "key")) return false;
				row[field] = String(text);
				return true;
			},
			move: function(id, index) {
				var from = rows.findIndex(function(row) {
					return row.id === id;
				});
				if (from < 0 || !Number.isInteger(index)) return false;
				var to = Math.max(0, Math.min(rows.length - 1, index));
				if (to === from) return false;
				var row = rows.splice(from, 1)[0];
				rows.splice(to, 0, row);
				return true;
			},
			visible: function(query) {
				var needle = String(query || "").toLocaleLowerCase();
				return rows.filter(function(row) {
					return !needle || ((row.key || "") + "\n" + row.value).toLocaleLowerCase().indexOf(needle) !== -1;
				});
			},
			errors: function(pending) {
				var effective = effectiveRows(pending);
				return validate(parameter, read(pending)).map(function(error) {
					return Object.assign({}, error, { id: error.index === null ? null : effective[error.index].id });
				});
			}
		};
		return state;
	}
	//#endregion
	//#region src/util/editor-dto.js
	/** Pure helpers for preserving libadmix discriminated values in browser forms. */
	function clone$2(value) {
		if (value === void 0) return void 0;
		return JSON.parse(JSON.stringify(value));
	}
	function equal(left, right) {
		return JSON.stringify(left) === JSON.stringify(right);
	}
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
		var value = clone$2(original || {
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
		var request = {};
		var originalState = baselineDraft ? baselineDraft.state : policy.state;
		if (draft.state !== originalState) request.state = draft.state;
		var baseline = new Map(baselineDraft ? (baselineDraft.parameters || []).map(function(parameter) {
			return [parameter.parameter_id, parameter.value];
		}) : (policy.parameters || []).map(function(parameter) {
			return [parameter.id, parameter.value];
		}));
		var sets = [];
		var clears = [];
		if (draft.state === "enabled") {
			(draft.parameters || []).forEach(function(parameter) {
				if (equal(baseline.get(parameter.parameter_id), parameter.value)) return;
				if (parameter.value === null) clears.push(parameter.parameter_id);
				else sets.push({
					parameter_id: parameter.parameter_id,
					value: clone$2(parameter.value)
				});
			});
			var enableAction = policyStateAction(policy, "enabled");
			if (draft.state !== originalState && enableAction.requires_parameters) {
				var alreadyEdited = new Set(sets.map(function(item) {
					return item.parameter_id;
				}));
				clears.forEach(function(parameterId) {
					alreadyEdited.add(parameterId);
				});
				var draftById = new Map((draft.parameters || []).map(function(parameter) {
					return [parameter.parameter_id, parameter.value];
				}));
				(policy.parameters || []).forEach(function(parameter) {
					if (parameter.editable === false) return;
					if (parameter.value !== null && parameter.value !== void 0) return;
					if (parameter.default_value === null || parameter.default_value === void 0) return;
					if (parameter.default_value.kind === "unsupported") return;
					if (alreadyEdited.has(parameter.id)) return;
					var value = draftById.get(parameter.id);
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
		var oldComment = baselineDraft ? baselineDraft.comment : policy.comment ? policy.comment.text : "";
		if (draft.comment !== oldComment) {
			var target = (policy.comment && policy.comment.source) === "locale" ? {
				kind: "locale",
				locale: policy.comment.locale
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
		return request && Object.keys(request).length > 0;
	}
	function policyChoiceValue(choices, selectedIndex) {
		var index = Number(selectedIndex);
		return selectedIndex === "" || !Array.isArray(choices) || !choices[index] ? null : clone$2(choices[index].value);
	}
	function legacyStateCapability(policy, state) {
		var capability = state === "not_configured" ? "clear" : state === "enabled" ? "enable" : "disable";
		return Boolean(policy && policy.capabilities && policy.capabilities[capability]);
	}
	function policyStateAction(policy, state) {
		var hasStateActions = Boolean(policy && Object.prototype.hasOwnProperty.call(policy, "state_actions"));
		var action = hasStateActions && policy.state_actions ? policy.state_actions[state] : null;
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
		var selectedState = draftState === void 0 ? policy && policy.state : draftState;
		var hasStateActions = Boolean(policy && Object.prototype.hasOwnProperty.call(policy, "state_actions"));
		return Boolean(policy && policy.state !== "unknown_raw_values" && selectedState === "enabled" && (!hasStateActions || policyStateAction(policy, "enabled").available) && policy.capabilities && policy.capabilities.edit_parameters);
	}
	function validatePolicyDraft(policy, draft) {
		if (!draft || !canEditPolicyParameters(policy, draft.state)) return null;
		var values = new Map((draft.parameters || []).map(function(parameter) {
			return [parameter.parameter_id, parameter.value];
		}));
		var lists = (policy.parameters || []).filter(function(parameter) {
			return parameter.kind === "list";
		});
		for (var index = 0; index < lists.length; index++) {
			var list = lists[index];
			if (!list.collection && policyStateAction(policy, "enabled").mode === "dynamic_list_values") list = Object.assign({}, list, { collection: {
				mode: "list",
				unique_keys: true,
				key_case_sensitive: false,
				allow_empty_values: false,
				min_items: 1
			} });
			var value = values.get(list.id);
			if (list.editable === false || value && value.kind === "unsupported") continue;
			if (value === null && !list.required && !(list.collection && list.collection.min_items)) continue;
			var problems = validate(list, value);
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
		var seen = /* @__PURE__ */ new Set();
		var duplicates = /* @__PURE__ */ new Set();
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
		var draft = new Map((draftFields || []).map(function(field) {
			return [field.id, field.value];
		}));
		var result = [];
		(descriptors || []).forEach(function(field) {
			if (!field || !field.editable) return;
			var value = draft.has(field.id) ? draft.get(field.id) : field.value;
			if (!changedOnly || !equal(value, field.value)) result.push({
				id: field.id,
				value: clone$2(value)
			});
		});
		return result;
	}
	function preferenceParentIdentity(candidates, selectedIndex) {
		var index = Number(selectedIndex);
		if (!Number.isInteger(index) || index < 0) return null;
		var candidate = (candidates || [])[index];
		if (!candidate || candidate.identity === null) return null;
		return Array.isArray(candidate.identity) && candidate.identity.length ? clone$2(candidate.identity) : null;
	}
	function buildPreferenceRequest(options) {
		var config = options || {};
		var descriptors = config.descriptors || [];
		var ids = preferenceFieldIds(descriptors);
		var draftFields = config.fields || [];
		var draft = new Map(draftFields.map(function(field) {
			return [field.id, field.value];
		}));
		var exemptions = config.validationExemptions instanceof Set ? config.validationExemptions : new Set(Array.isArray(config.validationExemptions) ? config.validationExemptions : []);
		var errors = ids.duplicates.map(function(id) {
			return {
				id,
				code: "duplicate_descriptor"
			};
		});
		descriptors.forEach(function(field) {
			if (!field || !field.editable || ids.duplicates.indexOf(field.id) !== -1) return;
			if (exemptions.has(field.id)) return;
			var code = validatePreferenceField(field, draft.has(field.id) ? draft.get(field.id) : field.value);
			if (code) errors.push({
				id: field.id,
				code
			});
		});
		var creating = Boolean(config.creating);
		var nextName = config.name === void 0 || config.name === null ? null : String(config.name);
		var originalName = config.originalName === void 0 || config.originalName === null ? null : String(config.originalName);
		if (!creating && nextName !== null && nextName !== originalName && nextName.trim() === "") errors.push({
			id: "name",
			code: "required"
		});
		if (errors.length) return {
			request: null,
			errors,
			changed: false
		};
		var request = creating ? {} : { identity: clone$2(config.identity) };
		var edits = preferenceFieldEdits(descriptors, draftFields, !creating);
		if (creating || edits.length) request.fields = edits;
		if (creating && Array.isArray(config.parent) && config.parent.length) request.parent = clone$2(config.parent);
		if (!creating && nextName !== null && nextName !== originalName) request.name = nextName;
		var filters = clone$2(config.filters || []);
		if (filters.length) request.filters = filters;
		var changed = creating || Object.keys(request).some(function(key) {
			return key !== "identity";
		});
		return {
			request: changed ? request : null,
			errors: [],
			changed
		};
	}
	function submitPreservingDraft(draft, submit) {
		var preservedDraft = clone$2(draft);
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
	//#region src/components/editor-status.js
	var createElement$9 = createElement$18;
	var DETAILS = {
		"Security policy actions must be a list": "securityActionsList",
		"Security element actions must be a list": "securityElementActionsList",
		"Keyed-row actions must be a list": "securityRowActionsList",
		"At least one non-empty list entry is required": "listRequiresEntry",
		"Invalid collection entries": "collectionInvalidEntry"
	};
	function text$1(key) {
		return t$12("editorStatus." + key);
	}
	function messageForError(error) {
		var key = "editorStatus.errors." + errorCategory(error).replace(/-/g, "_");
		var prefix = t$12(key);
		if (prefix === key) prefix = text$1("errors.operational");
		var detail = DETAILS[(error && error.message ? String(error.message) : "").replace(/[.]$/, "")];
		return detail ? prefix + " " + text$1("details." + detail) : prefix;
	}
	function renderError(error, options) {
		var config = options || {};
		var category = errorCategory(error).replace(/-/g, "_");
		var actions = [];
		if (typeof config.onRefresh === "function") actions.push(createElement$9("button", {
			className: ["button", "gpo-editor-status__action"],
			attrs: { type: "button" },
			text: text$1("refresh"),
			events: { click: config.onRefresh }
		}));
		if ((category.indexOf("publication") !== -1 || error && error.pendingPublication) && typeof config.onReconcile === "function") actions.push(createElement$9("button", {
			className: ["button", "gpo-editor-status__action"],
			attrs: { type: "button" },
			text: text$1("reconcile"),
			events: { click: config.onReconcile }
		}));
		return createElement$9("div", {
			className: [
				"gpo-editor-status",
				"gpo-editor-status--error",
				"gpo-editor-status--" + category
			],
			attrs: {
				role: "alert",
				"data-error-category": category
			},
			children: [
				createElement$9("div", {
					className: "gpo-editor-status__message",
					text: messageForError(error)
				}),
				error && error.field ? createElement$9("div", {
					className: "gpo-editor-status__field",
					text: text$1("field") + ": " + error.field
				}) : null,
				actions.length ? createElement$9("div", {
					className: "gpo-editor-status__actions",
					children: actions
				}) : null
			]
		});
	}
	function renderPending(pending, onReconcile) {
		if (!pending) return null;
		return createElement$9("div", {
			className: ["gpo-editor-status", "gpo-editor-status--pending"],
			attrs: { role: "status" },
			children: [createElement$9("div", {
				className: "gpo-editor-status__message",
				text: text$1("pending")
			}), typeof onReconcile === "function" ? createElement$9("button", {
				className: ["button", "gpo-editor-status__action"],
				attrs: { type: "button" },
				text: text$1("reconcile"),
				events: { click: onReconcile }
			}) : null]
		});
	}
	function renderDiagnostics(diagnostics) {
		return createElement$9("details", {
			className: "gpo-editor-status__diagnostics",
			children: [createElement$9("summary", { text: text$1("technicalDetails") })].concat((diagnostics || []).map(function(diagnostic) {
				return createElement$9("pre", { text: [diagnostic.code, diagnostic.message].filter(Boolean).join(": ") });
			}))
		});
	}
	//#endregion
	//#region src/components/confirmation-dialog.js
	var create$11 = createElement$18;
	var nextId = 0;
	function open$3(host, options) {
		var config = options || {};
		var container = host && host.getElement ? host.getElement() : host;
		if (!container || typeof container.appendChild !== "function") throw new TypeError("A confirmation dialog host is required.");
		var previous = document.activeElement;
		var id = "gpo-confirmation-" + ++nextId;
		var closed = false;
		var no = create$11("button", {
			className: ["btn", "btn-no"],
			attrs: { type: "button" },
			text: config.cancelLabel || t$12("policyChangedModal.no")
		});
		var yes = create$11("button", {
			className: ["btn", "btn-yes"],
			attrs: { type: "button" },
			text: config.confirmLabel || t$12("policyChangedModal.yes")
		});
		var content = create$11("div", {
			id: id + "-message",
			className: "policy-changed__modal-content",
			text: config.message || ""
		});
		if (config.content) content.getElement().appendChild(config.content.getElement ? config.content.getElement() : config.content);
		var modal = create$11("div", {
			className: ["policy-changed__modal", "policy-changed__modal--discard"],
			attrs: {
				role: "alertdialog",
				"aria-modal": "true",
				"aria-labelledby": id + "-title",
				"aria-describedby": id + "-message"
			},
			children: [create$11("div", {
				className: "policy-changed__modal-wrapper",
				children: [
					create$11("div", {
						className: "policy-changed__modal-header",
						children: [create$11("div", {
							id: id + "-title",
							className: "title",
							text: config.title || t$12("confirmModal.title")
						})]
					}),
					content,
					create$11("div", {
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
			var callback = confirmed ? config.onConfirm : config.onCancel;
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
	//#endregion
	//#region src/components/editor-dialog.js
	var editor_dialog_exports = /* @__PURE__ */ __exportAll({
		open: () => open$2,
		trapTab: () => trapTab
	});
	var create$10 = createElement$18;
	var sequence$4 = 0;
	function trapTab(event, modal) {
		if (event.key !== "Tab" || event.defaultPrevented || event.target.closest("[role=\"dialog\"], [role=\"alertdialog\"]") !== modal) return;
		var focusable = Array.from(modal.querySelectorAll("button, input, select, textarea, summary, a[href], [contenteditable=\"true\"], [tabindex]")).filter(function(element) {
			var style = element.ownerDocument.defaultView.getComputedStyle(element);
			return element.tabIndex >= 0 && !element.disabled && !element.hidden && element.getClientRects().length && !element.closest("[hidden], [inert]") && style.visibility !== "hidden" && style.visibility !== "collapse" && element.closest("[role=\"dialog\"], [role=\"alertdialog\"]") === modal;
		});
		if (!focusable.length) {
			event.preventDefault();
			modal.focus();
			return;
		}
		var first = focusable[0], last = focusable[focusable.length - 1];
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
		var previous = document.activeElement;
		var titleId = "editor-dialog-" + ++sequence$4;
		var busy = false;
		var closed = false;
		var applyDisabled = Boolean(options.applyDisabled);
		var confirmation = null;
		var body = create$10("div", {
			className: [
				"preference__modal-content",
				"gpo-editor-dialog__body",
				options.bodyClassName
			],
			children: [options.content]
		});
		var failure = create$10("div", {
			className: ["gpo-editor-dialog__error", options.errorClassName],
			attrs: { role: "alert" }
		});
		body.getElement().prepend(failure.getElement());
		var cancel = create$10("button", {
			className: ["button", "btn-cancel"],
			attrs: { type: "button" },
			text: options.cancelLabel || t$12("collections.cancel")
		});
		var apply = create$10("button", {
			className: [
				"button",
				"btn-ok",
				"gpo-editor-dialog__apply",
				options.applyClassName
			],
			attrs: { type: "button" },
			text: options.applyLabel || t$12("collections.ok")
		});
		apply.getElement().disabled = applyDisabled;
		var closeButton = create$10("button", {
			className: [
				"close",
				"gpo-editor-dialog__close",
				options.closeClassName
			],
			attrs: {
				type: "button",
				"aria-label": options.closeLabel || t$12("collections.close")
			}
		});
		var modal = create$10("div", {
			className: [
				"preference__modal",
				"active",
				"gpo-editor-dialog"
			].concat(options.className || []),
			attrs: {
				role: "dialog",
				"aria-modal": "true",
				"aria-labelledby": titleId,
				tabindex: "-1"
			},
			children: [create$10("div", {
				className: "preference__modal-wrapper",
				children: [
					create$10("div", {
						className: "preference__modal-header",
						children: [create$10("div", {
							id: titleId,
							className: "title",
							text: options.title
						}), closeButton]
					}),
					body,
					create$10("div", {
						className: "preference__modal-footer",
						children: [cancel, options.readOnly ? null : apply]
					})
				]
			})]
		});
		var backdrop = create$10("div", {
			className: [
				"gp__preference",
				"gpo-editor-preferences__modal-host",
				"active",
				"gpo-editor-dialog-host"
			].concat(options.hostClassName || []),
			children: [modal]
		});
		function close() {
			if (closed) return;
			closed = true;
			if (confirmation) {
				confirmation.close();
				confirmation = null;
			}
			backdrop.getElement().remove();
			if (options.onClose) options.onClose();
			var restored = previous && previous.isConnected ? previous : options.restoreFocus && options.restoreFocus();
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
			modal.getElement().classList.add("gpo-editor-dialog--confirming");
			confirmation = open$3(backdrop, {
				message: options.discardMessage || t$12("collections.discardQuestion"),
				onConfirm: close,
				onCancel: function() {
					confirmation = null;
					modal.getElement().inert = false;
					modal.getElement().classList.remove("gpo-editor-dialog--confirming");
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
		var removed = new Set(removedIds || []);
		var remaining = new Set(afterIds || []);
		var anchor = (beforeIds || []).findIndex(function(id) {
			return removed.has(id);
		});
		if (anchor < 0) return null;
		for (var previous = anchor - 1; previous >= 0; previous -= 1) if (!removed.has(beforeIds[previous]) && remaining.has(beforeIds[previous])) return beforeIds[previous];
		for (var next = anchor + 1; next < beforeIds.length; next += 1) if (!removed.has(beforeIds[next]) && remaining.has(beforeIds[next])) return beforeIds[next];
		return null;
	}
	function bind$1(container, options) {
		var disposed = false;
		var observer;
		var pointerSelecting = false;
		var owner = String(++sequence$3);
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
			var current = rows();
			var chosen = selected();
			var entry = current.indexOf(chosen) !== -1 ? chosen : current[0];
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
			var current = rows();
			var chosen = selected();
			focus(current.indexOf(chosen) !== -1 ? chosen : current[index] || null);
		}
		function focusSelected() {
			if (blocked()) return;
			var current = rows();
			var chosen = selected();
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
			var scroller = container;
			var view = container.ownerDocument && container.ownerDocument.defaultView;
			while (scroller.parentElement && view && view.getComputedStyle) {
				var style = view.getComputedStyle(scroller);
				if (/auto|scroll/.test(style.overflowY)) break;
				scroller = scroller.parentElement;
			}
			var height = row && row.getBoundingClientRect ? row.getBoundingClientRect().height : 0;
			return height && scroller.clientHeight ? Math.max(1, Math.floor(scroller.clientHeight / height) - 1) : 10;
		}
		function onKey(event) {
			if (event.defaultPrevented || blocked() || event.ctrlKey || event.altKey || event.metaKey || event.shiftKey || interactive(event.target)) return;
			var current = rows();
			if (!current.length) return;
			var row = rowFor(event.target, current) || selected() || current[0];
			var index = current.indexOf(row);
			if (index < 0) return;
			var next = index;
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
			var current = rows();
			var row = rowFor(event.target, current);
			if (row && row !== selected()) selectAndFocus(row, event, current.indexOf(row));
		}
		function onPointerDown() {
			pointerSelecting = true;
			var view = container.ownerDocument && container.ownerDocument.defaultView;
			if (view && view.setTimeout) view.setTimeout(function() {
				pointerSelecting = false;
			}, 0);
		}
		container.addEventListener("keydown", onKey);
		container.addEventListener("focusin", onFocus);
		container.addEventListener("pointerdown", onPointerDown);
		var view = container.ownerDocument && container.ownerDocument.defaultView;
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
	var create$9 = createElement$18;
	var sequence$2 = 0;
	function tr$6(key, values) {
		var text = t$12("collections." + key);
		Object.keys(values || {}).forEach(function(name) {
			text = text.replace("{" + name + "}", values[name]);
		});
		return text;
	}
	function open$1(host, options) {
		var state = session(options.parameter, options.value);
		var readOnly = Boolean(options.readOnly);
		var fields = state.mode === "key_value" ? ["key", "value"] : ["value"];
		var rules = constraints(options.parameter, options.value);
		var prefix = "collection-" + ++sequence$2;
		var activeCell = {
			id: state.rows[0] && state.rows[0].id,
			field: fields[0]
		};
		var editing = null;
		var drag = null;
		var scrollFrame = null;
		var dialog;
		var add = create$9("button", {
			className: "button",
			attrs: {
				type: "button",
				"data-collection-add": ""
			},
			text: tr$6("add")
		});
		var remove = create$9("button", {
			className: "button",
			attrs: {
				type: "button",
				"data-collection-remove": ""
			},
			text: tr$6("remove")
		});
		var search = create$9("input", { attrs: {
			type: "search",
			placeholder: tr$6("search"),
			"aria-label": tr$6("search")
		} });
		var toolbar = create$9("div", {
			className: "gpo-collection-editor__toolbar",
			children: [
				readOnly ? null : add,
				readOnly ? null : remove,
				search
			]
		});
		var errors = create$9("div", {
			className: "gpo-collection-editor__validation",
			attrs: { role: "alert" }
		});
		var count = create$9("div", { className: "gpo-collection-editor__count" });
		var live = create$9("div", {
			className: "gpo-collection-editor__live",
			attrs: {
				role: "status",
				"aria-live": "polite",
				"aria-atomic": "true"
			}
		});
		var body = create$9("tbody");
		var table = create$9("table", {
			className: ["preference__table", "gpo-collection-table"],
			attrs: {
				"aria-label": options.parameter.label || options.parameter.id,
				tabindex: "0",
				"data-collection-mode": state.mode
			},
			children: [
				create$9("colgroup", { children: [
					readOnly ? null : create$9("col", { className: "gpo-collection-table__handle-column" }),
					create$9("col", { className: state.mode === "key_value" ? "gpo-collection-table__key-column" : "gpo-collection-table__index-column" }),
					create$9("col")
				] }),
				create$9("thead", { children: [create$9("tr", { children: [
					readOnly ? null : create$9("th", { attrs: {
						scope: "col",
						"aria-label": tr$6("reorder")
					} }),
					create$9("th", {
						attrs: { scope: "col" },
						text: state.mode === "key_value" ? tr$6("key") : tr$6("index")
					}),
					create$9("th", {
						attrs: { scope: "col" },
						text: tr$6("value")
					})
				] })] }),
				body
			]
		});
		var scroll = create$9("div", {
			className: "gpo-collection-editor__table-scroll",
			children: [table]
		});
		var content = create$9("div", {
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
				var id = row.getAttribute("data-collection-row");
				row.classList.toggle("active", state.selectedId === id);
				row.setAttribute("aria-selected", String(state.selectedId === id));
				var handle = row.querySelector(".gpo-collection-table__handle");
				if (handle) handle.tabIndex = -1;
				/** @type {HTMLElement[]} */ Array.from(row.querySelectorAll("[data-collection-field]")).forEach(function(cell) {
					cell.tabIndex = id === activeCell.id && cell.getAttribute("data-collection-field") === activeCell.field ? 0 : -1;
				});
			});
			table.getElement().tabIndex = body.getElement().querySelector("[data-collection-row]") ? -1 : 0;
			remove.getElement().disabled = readOnly || busy() || !state.selectedId;
		}
		function updateValidation() {
			var problems = readOnly ? [] : state.errors(pending());
			errors.getElement().textContent = problems.filter(function(problem) {
				return !problem.id;
			}).map(function(problem) {
				return tr$6("errors." + problem.code);
			}).join(" ");
			Array.from(body.getElement().querySelectorAll("[data-collection-field]")).forEach(function(cell) {
				var id = cell.parentElement.getAttribute("data-collection-row");
				var field = cell.getAttribute("data-collection-field");
				var problem = problems.find(function(error) {
					return error.id === id && error.field === field;
				});
				var prior = cell.querySelector(".gpo-collection-cell__error");
				if (prior) prior.remove();
				cell.classList.toggle("gpo-collection-cell--invalid", Boolean(problem));
				var input = cell.querySelector("[data-collection-input]");
				if (problem) {
					var errorId = prefix + "-" + id + "-" + field + "-error";
					cell.appendChild(create$9("span", {
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
			var size = state.read(pending()).value.length;
			count.getElement().textContent = search.getElement().value ? tr$6("shownCount", {
				shown: state.visible(search.getElement().value).length,
				total: state.rows.length
			}) : tr$6(state.mode === "key_value" ? "pairsCount" : "itemsCount", { count: size });
			if (dialog) dialog.setApplyDisabled(problems.length !== 0);
			return problems;
		}
		function showCell(cell, row, field) {
			cell.classList.remove("gpo-collection-cell--editing");
			cell.replaceChildren(create$9("span", {
				className: "gpo-collection-cell__text",
				text: row[field] || "\xA0"
			}).getElement());
		}
		function finishEdit(commit) {
			if (!editing) return;
			var current = editing;
			editing = null;
			if (commit) state.edit(current.id, current.field, current.input.value);
			var row = state.find(current.id);
			if (row) showCell(current.cell, row, current.field);
			updateValidation();
		}
		function focusCell(id, field) {
			activeCell = {
				id,
				field
			};
			updateSelection();
			var cell = cellFor(id, field);
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
			var cell = cellFor(id, field);
			var row = state.find(id);
			if (!cell || !row) return;
			activeCell = {
				id,
				field
			};
			updateSelection();
			var singleLine = field === "key" || state.mode === "list" && rules.unique_keys;
			var input = create$9(singleLine ? "input" : "textarea", { attrs: {
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
					var visible = state.visible(search.getElement().value);
					var position = visible.findIndex(function(item) {
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
			var row = body.getElement().querySelector("[data-collection-row=\"" + id + "\"]");
			if (row && row.querySelector(".gpo-collection-table__handle")) focusCell(id, activeCell.field);
		}
		function autoScroll() {
			if (!drag) {
				scrollFrame = null;
				return;
			}
			var rect = scroll.getElement().getBoundingClientRect();
			if (drag.y >= rect.top && drag.y <= rect.bottom) {
				if (drag.y < rect.top + 28) scroll.getElement().scrollTop -= 8;
				else if (drag.y > rect.bottom - 28) scroll.getElement().scrollTop += 8;
			}
			scrollFrame = requestAnimationFrame(autoScroll);
		}
		function render() {
			finishEdit(true);
			body.getElement().replaceChildren();
			var visible = state.visible(search.getElement().value);
			if (!visible.some(function(row) {
				return row.id === activeCell.id;
			})) activeCell.id = visible[0] && visible[0].id;
			search.getElement().hidden = state.rows.length < 20 && !search.getElement().value;
			if (!visible.length) body.append(create$9("tr", {
				className: "gpo-collection-table__empty",
				children: [create$9("td", {
					attrs: { colspan: readOnly ? 2 : 3 },
					text: tr$6(state.rows.length ? "noMatches" : "empty")
				})]
			}));
			visible.forEach(function(row) {
				var index = state.rows.indexOf(row);
				var record = create$9("tr", { attrs: { "data-collection-row": row.id } });
				if (!readOnly) {
					var handle = create$9("button", {
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
					record.append(create$9("td", {
						className: "gpo-collection-table__handle-cell",
						children: [handle]
					}));
				}
				if (state.mode === "list") record.append(create$9("td", {
					className: "gpo-collection-table__index",
					text: index
				}));
				fields.forEach(function(field) {
					var cell = create$9("td", {
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
			var id = state.add();
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
			var before = Array.from(body.getElement().querySelectorAll("[data-collection-row]")).map(function(row) {
				return row.getAttribute("data-collection-row");
			});
			var removedId = state.selectedId;
			if (!state.removeSelected()) return;
			var after = state.visible(search.getElement().value).map(function(row) {
				return row.id;
			});
			var nextId = neighbor(before, [removedId], after);
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
			var cell = event.target.closest("[data-collection-field]");
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
			var visible = state.visible(search.getElement().value);
			var index = visible.findIndex(function(row) {
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
				var position = index;
				var row = body.getElement().querySelector("[data-collection-row=\"" + activeCell.id + "\"]");
				var pageSize = Math.max(1, Math.floor(scroll.getElement().clientHeight / Math.max(1, row.getBoundingClientRect().height)) - 1);
				if (event.key === "Home") position = 0;
				else if (event.key === "End") position = visible.length - 1;
				else position += (event.key === "ArrowUp" || event.key === "PageUp" ? -1 : 1) * (event.key === "PageUp" || event.key === "PageDown" ? pageSize : 1);
				var next = visible[Math.max(0, Math.min(visible.length - 1, position))];
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
			var target = event.target.closest("[data-collection-row]");
			Array.from(body.getElement().querySelectorAll("tr")).forEach(function(row) {
				row.classList.remove("gpo-collection-row--before", "gpo-collection-row--after");
			});
			if (!target) target = body.getElement().lastElementChild;
			if (!target || !target.hasAttribute("data-collection-row")) return;
			drag.targetId = target.getAttribute("data-collection-row");
			var rect = target.getBoundingClientRect();
			drag.after = event.clientY > rect.top + rect.height / 2;
			if (drag.targetId !== drag.id) target.classList.add(drag.after ? "gpo-collection-row--after" : "gpo-collection-row--before");
		});
		scroll.on("drop", function(event) {
			if (!drag) return;
			event.preventDefault();
			event.stopPropagation();
			var from = state.rows.findIndex(function(row) {
				return row.id === drag.id;
			});
			var to = state.rows.findIndex(function(row) {
				return row.id === drag.targetId;
			}) + (drag.after ? 1 : 0);
			if (from < to) to -= 1;
			var id = drag.id;
			state.move(id, to);
			clearDrag();
			render();
			focusHandle(id);
			announce(tr$6("moved", { index: state.rows.findIndex(function(row) {
				return row.id === id;
			}) }));
		});
		content.append(create$9("span", {
			id: prefix + "-reorder-help",
			className: "gpo-collection-editor__live",
			text: tr$6("reorderHelp")
		}));
		render();
		dialog = open$2(host, {
			title: options.parameter.label || options.parameter.id,
			className: ["gpo-collection-dialog"],
			content,
			readOnly,
			cancelLabel: tr$6(readOnly ? "close" : "cancel"),
			isDirty: function() {
				return !readOnly && state.isDirty(pending());
			},
			onApply: function() {
				finishEdit(true);
				var problems = updateValidation();
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
	var create$8 = createElement$18;
	function tr$5(key, values) {
		var text = t$12("collections." + key);
		Object.keys(values || {}).forEach(function(name) {
			text = text.replace("{" + name + "}", values[name]);
		});
		return text;
	}
	function createControl(parameter, initial, editable) {
		var value = initial ? JSON.parse(JSON.stringify(initial)) : empty(parameter, initial);
		var canEdit = Boolean(editable);
		var modal = null;
		var button = create$8("button", {
			className: ["button", "gpo-collection-control__button"],
			attrs: { type: "button" }
		});
		var count = create$8("span", { className: "gpo-collection-control__count" });
		var preview = create$8("span", {
			className: "gpo-collection-control__preview",
			attrs: { "aria-hidden": "true" }
		});
		var host = create$8("div", { className: "gpo-collection-control__dialog-host" });
		var root = create$8("div", {
			className: "gpo-collection-control",
			children: [
				create$8("div", {
					className: "gpo-collection-control__summary",
					children: [count, preview]
				}),
				button,
				host
			]
		});
		function refresh() {
			var summary = summary$1(parameter, value);
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
	var create$7 = createElement$18;
	var sequence$1 = 0;
	function tr$4(key, fallback) {
		var value = t$12("security." + key);
		return value && value !== "security." + key ? value : fallback;
	}
	function tabs(settings, explanation) {
		var id = "security-tabs-" + ++sequence$1;
		var panels = [settings, explanation];
		var buttons = [];
		function select(index, focus) {
			panels.forEach(function(panel, position) {
				var active = position === index;
				panel.getElement().hidden = !active;
				panel.getElement().classList.toggle("active", active);
				buttons[position].getElement().classList.toggle("active", active);
				buttons[position].getElement().setAttribute("aria-selected", String(active));
				buttons[position].getElement().tabIndex = active ? 0 : -1;
			});
			if (focus) buttons[index].getElement().focus();
		}
		var bar = create$7("div", {
			className: "tab-buttons",
			attrs: {
				role: "tablist",
				"aria-label": tr$4("properties", "Properties")
			}
		});
		[tr$4("settingTab", "Security Policy Setting"), tr$4("explanationTab", "Explanation")].forEach(function(label, index) {
			var button = create$7("button", {
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
				var next;
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
			var panel = panels[index].getElement();
			panel.id = id + "-panel-" + index;
			panel.setAttribute("role", "tabpanel");
			panel.setAttribute("aria-labelledby", id + "-tab-" + index);
			panel.setAttribute("tabindex", "0");
			panel.classList.add("tab-content");
		});
		select(0);
		return create$7("div", {
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
	//#region src/components/templates/admx-template.js
	var createElement$8 = createElement$18;
	var t$8 = t$12;
	var nextParameterControlId = 1;
	function appendLines(container, text) {
		String(text || "").split(/\r?\n/).forEach(function(line, index) {
			if (index) container.appendChild(document.createElement("br"));
			container.appendChild(document.createTextNode(line));
		});
	}
	function inputValue(value) {
		var payload = valuePayload(value);
		return Array.isArray(payload) ? payload.join("\n") : payload === null || payload === void 0 ? "" : payload;
	}
	function createParameterControl(parameter, editable) {
		var knownKinds = [
			"boolean",
			"decimal",
			"enum",
			"text",
			"list"
		];
		var unsupportedValue = parameter.value && parameter.value.kind === "unsupported";
		var unsupportedDefault = (parameter.value === null || parameter.value === void 0) && parameter.default_value && parameter.default_value.kind === "unsupported";
		var unsupported = unsupportedValue || knownKinds.indexOf(parameter.kind) === -1;
		var disabled = !editable || parameter.editable === false || unsupported;
		var input;
		var inputElement = null;
		var collectionControl = null;
		var renderedValue = parameter.value === null || parameter.value === void 0 ? unsupportedDefault ? null : parameter.default_value : parameter.value;
		var choices = parameter.choices || [];
		if (unsupported) input = createElement$8("pre", {
			className: ["gpo-editor-unsupported", "field__element"],
			text: JSON.stringify(renderedValue && renderedValue.value !== void 0 ? renderedValue.value : {
				kind: parameter.kind,
				value: renderedValue
			}, null, 2)
		});
		else if (parameter.kind === "boolean") {
			var checkboxId = "gpo-editor-parameter-" + nextParameterControlId++;
			var checkbox = createElement$8("input", { attrs: {
				id: checkboxId,
				type: "checkbox",
				disabled: disabled ? "disabled" : null
			} });
			inputElement = checkbox.getElement();
			inputElement.checked = Boolean(inputValue(renderedValue));
			input = createElement$8("span", {
				className: "gpo-editor-boolean",
				children: [checkbox, createElement$8("label", { attrs: {
					for: checkboxId,
					"aria-label": parameter.label || parameter.id
				} })]
			});
		} else if (parameter.kind === "enum") {
			input = createElement$8("select", {
				attrs: { disabled: disabled ? "disabled" : null },
				children: [!parameter.required ? createElement$8("option", {
					attrs: { value: "" },
					text: "—"
				}) : null].concat(choices.map(function(choice, index) {
					return createElement$8("option", {
						attrs: {
							value: String(index),
							disabled: choice.value && choice.value.kind === "unsupported" ? "disabled" : null
						},
						text: choice.label || String(valuePayload(choice.value))
					});
				}))
			});
			var selectedIndex = choices.findIndex(function(choice) {
				return equal(choice.value, renderedValue);
			});
			input.getElement().value = selectedIndex < 0 ? "" : String(selectedIndex);
		} else if (parameter.kind === "list") {
			collectionControl = createControl(parameter, renderedValue, !disabled);
			input = collectionControl.element;
			inputElement = collectionControl.button;
		} else input = createElement$8("input", { attrs: {
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
		var stateDisabled = false;
		function syncControlState() {
			var unavailable = disabled || unsupported || stateDisabled;
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
			element: createElement$8("div", {
				className: [
					"gp__admx-options",
					collectionControl ? "gp__admx-options--collection" : null,
					unsupported ? "gpo-editor-field--unsupported" : null,
					unsupportedDefault ? "gpo-editor-field--unsupported-default" : null
				],
				attrs: { "data-field-id": parameter.id },
				children: [input, unsupportedDefault ? createElement$8("span", {
					className: "gpo-editor-field__diagnostic",
					text: t$8("policies.unsupportedDefault")
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
		var capabilities = policy.capabilities || {};
		var unknown = policy.state === "unknown_raw_values";
		var controls = /* @__PURE__ */ new Map();
		var stateNames = {
			not_configured: t$8("policies.notConfigured"),
			enabled: t$8("policies.enabled"),
			disabled: t$8("policies.disabled")
		};
		var stateControls = Object.keys(stateNames).map(function(state) {
			var allowed = canSelectPolicyState(policy, state);
			var radio = createElement$8("input", { attrs: {
				type: "radio",
				name: "admx-state",
				value: state,
				checked: policy.state === state ? "checked" : null,
				disabled: allowed ? null : "disabled"
			} });
			return createElement$8("label", {
				className: ["gp__admx-radio", allowed ? null : "gpo-editor-control--disabled"],
				children: [radio, createElement$8("span", { text: stateNames[state] })]
			});
		});
		var parameterRows = (capabilities.inspect_parameters ? policy.parameters || [] : []).map(function(parameter) {
			if (parameter.kind === "list" && !parameter.collection && policyStateAction(policy, "enabled").mode === "dynamic_list_values") parameter = Object.assign({}, parameter, { collection: {
				mode: parameter.value && parameter.value.kind === "key_value_list" ? "key_value" : "list",
				unique_keys: true,
				key_case_sensitive: false,
				allow_empty_values: false,
				min_items: 1
			} });
			var control = createParameterControl(parameter, Boolean(capabilities.edit_parameters) && !unknown);
			if (handlers.modalLayout) control.element.addClass("field__element");
			controls.set(parameter.id, control);
			return createElement$8("div", {
				className: "gp__admx-item",
				children: [createElement$8("div", {
					className: "gp__admx-description",
					text: parameter.label || parameter.id
				}), control.element]
			});
		});
		var comment = createElement$8("textarea", {
			attrs: {
				name: "comment",
				disabled: capabilities.edit_comments && !unknown ? null : "disabled"
			},
			text: policy.comment ? policy.comment.text : ""
		});
		var errorSlot = createElement$8("div", { className: "gpo-editor-form__error" });
		var wrapper = createElement$8("div", {
			className: "gp__admx-wrapper",
			children: [
				handlers.categoryPath ? createElement$8("div", {
					className: "gpo-security-workbench__toolbar",
					children: [createElement$8("h2", {
						text: handlers.categoryPath,
						attrs: { "data-category-path": "" }
					})]
				}) : null,
				errorSlot,
				unknown ? createElement$8("div", {
					className: ["gpo-editor-status", "gpo-editor-status--unsupported"],
					attrs: { role: "status" },
					text: t$8("policies.unsupportedSource")
				}) : null,
				createElement$8("div", {
					className: ["gp__admx", (policy.parameters || []).some(function(parameter) {
						return parameter.kind === "list";
					}) ? "gp__admx--collections" : null],
					children: [createElement$8("div", {
						className: "gp__admx-settings",
						children: [
							createElement$8("div", {
								className: "title",
								children: [t$8("policies.policy") + " ", createElement$8("span", {
									className: "title__name",
									text: policy.label || policy.policy_id
								})]
							}),
							createElement$8("div", {
								className: "gp__admx-state-policy-title",
								text: t$8("policies.policyState")
							}),
							createElement$8("div", {
								className: "gp__admx-state-policy",
								children: stateControls
							}),
							createElement$8("div", { className: "field__line" })
						]
					}), createElement$8("div", {
						className: "gp__admx-info",
						children: parameterRows.length ? [createElement$8("div", {
							className: "gp__admx-item",
							children: [createElement$8("div", {
								className: "gp__admx-description",
								text: t$8("common.description")
							}), createElement$8("div", {
								className: "gp__admx-options",
								text: t$8("common.options")
							})]
						})].concat(parameterRows) : []
					})]
				}),
				createElement$8("div", {
					className: ["gp__admx-help", handlers.isHelpOpen ? "is-open" : null],
					children: [
						createElement$8("div", {
							className: "gp__admx-supported",
							children: [createElement$8("div", {
								className: "title",
								text: t$8("policies.supportedOn")
							}), createElement$8("div", {
								className: "gp__admx-content",
								text: policy.supported_on || ""
							})]
						}),
						createElement$8("div", {
							className: "gp__admx-comment",
							children: [createElement$8("div", {
								className: "title",
								text: t$8("common.comment")
							}), comment]
						}),
						createElement$8("div", {
							className: "gp__admx-text-help",
							children: [createElement$8("div", {
								className: "title",
								text: t$8("common.help")
							}), createElement$8("div", { className: "gp__admx-content" })]
						})
					]
				})
			]
		});
		root.innerHTML = "";
		if (handlers.modalLayout) {
			var settings = createElement$8("div", {
				className: "gpo-admx-dialog__settings",
				children: [
					errorSlot,
					unknown ? createElement$8("div", {
						className: ["gpo-editor-status", "gpo-editor-status--unsupported"],
						attrs: { role: "status" },
						text: t$8("policies.unsupportedSource")
					}) : null,
					createElement$8("div", {
						className: "gp__admx-settings",
						children: [createElement$8("div", {
							className: "gp__admx-state-policy-title",
							text: t$8("policies.policyState")
						}), createElement$8("div", {
							className: "gp__admx-state-policy",
							children: stateControls
						})]
					})
				].concat(parameterRows, [createElement$8("div", {
					className: "gpo-admx-dialog__comment",
					children: [createElement$8("label", {
						text: t$8("common.comment"),
						attrs: { for: "admx-comment-" + nextParameterControlId }
					}), createElement$8("div", {
						className: "field__element",
						children: [comment]
					})]
				})])
			});
			comment.getElement().id = "admx-comment-" + nextParameterControlId++;
			var supported = createElement$8("p");
			appendLines(supported.getElement(), policy.supported_on || "—");
			var help = createElement$8("p");
			appendLines(help.getElement(), policy.explain_text || t$8("security.noExplanation"));
			var tabs$1 = tabs(settings, createElement$8("div", {
				className: "gpo-admx-dialog__explanation",
				children: [
					createElement$8("h3", { text: t$8("policies.supportedOn") }),
					supported,
					createElement$8("h3", { text: t$8("security.explanationTab") }),
					help
				]
			}));
			tabs$1.getElement().querySelector("[role=\"tab\"]").textContent = t$8("policies.parametersTab");
			root.appendChild(tabs$1.getElement());
		} else {
			root.appendChild(wrapper.getElement());
			appendLines(root.querySelector(".gp__admx-text-help .gp__admx-content"), policy.explain_text || "");
		}
		function selectedState() {
			var selected = root.querySelector("input[name=\"admx-state\"]:checked");
			return selected ? selected.value : policy.state;
		}
		function syncPolicyState() {
			var editable = canEditPolicyParameters(policy, selectedState());
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
	async function renderAdmxTemplate(options) {
		var config = options || {};
		var item = config.item || {};
		var root = createElement$8("div", { className: "gpo-editor-policy" });
		var headerElement = config.header && config.header.getElement ? config.header.getElement() : null;
		var actions = headerElement ? headerElement.querySelector(".gp__control-actions") : null;
		var preferenceActions = headerElement ? headerElement.querySelector(".gp__control") : null;
		var applyButton = headerElement ? headerElement.querySelector(".admx__btn-apply") : null;
		var cancelButton = headerElement ? headerElement.querySelector(".admx__btn-cancel") : null;
		var policy;
		var view;
		var baseline;
		var saving = false;
		if (actions) actions.style.display = "flex";
		if (preferenceActions) preferenceActions.style.display = "none";
		try {
			var response = await policyShow(item.scope, item.policyId);
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
			var active = !saving && hasUnsavedPolicyChanges();
			if (applyButton) applyButton.classList.toggle("active", active);
			if (cancelButton) cancelButton.classList.toggle("active", active);
		}
		function showError(error) {
			if (!view || !view.errorSlot) return;
			view.errorSlot.innerHTML = "";
			var category = errorCategory(error);
			var errorActions = { onReconcile: async function(event) {
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
				if (!(config.confirmRefresh ? await config.confirmRefresh() : window.confirm(t$8("collections.discardQuestion")))) return;
				try {
					var response = await policyShow(item.scope, item.policyId);
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
			var draft = view.readDraft();
			var validationError = validatePolicyDraft(policy, draft);
			if (validationError) {
				showError(validationError);
				return false;
			}
			var request = buildPolicyUpdate(policy, draft, baseline);
			if (!hasOperations(request)) return true;
			saving = true;
			root.getElement().inert = true;
			refreshButtons();
			try {
				/** @type {{ ok: boolean, response?: any, error?: any, draft?: any }} */
				var outcome = await submitPreservingDraft(draft, function() {
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
		var config = options || {};
		var item = config.item || {};
		var content = createElement$8("div", {
			className: "gpo-admx-dialog__content",
			children: [createElement$8("div", {
				className: "gpo-admx-dialog__loading",
				attrs: { role: "status" },
				text: t$8("treeView.loadingPolicies")
			})]
		});
		var currentEditor = null;
		var closed = false;
		var refreshConfirmation = null;
		var finishRefreshConfirmation = null;
		var loadSequence = 0;
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
		var editor = {
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
		var dialog = open$2(host, {
			title: item.title || item.label || item.policyId,
			className: ["gpo-admx-dialog"],
			content,
			applyLabel: t$8("security.apply"),
			cancelLabel: t$8("security.cancel"),
			applyDisabled: true,
			restoreFocus: config.restoreFocus,
			isDirty: editor.hasUnsavedChanges,
			onApply: editor.applyChanges,
			onClose: cleanupEditor
		});
		function confirmRefresh() {
			if (!isCurrent() || refreshConfirmation) return Promise.resolve(false);
			return new Promise(function(resolve) {
				var modal = dialog.root.getElement();
				var previousFocus = document.activeElement;
				modal.inert = true;
				modal.classList.add("gpo-editor-dialog--confirming");
				finishRefreshConfirmation = function(confirmed) {
					refreshConfirmation = null;
					finishRefreshConfirmation = null;
					modal.inert = false;
					modal.classList.remove("gpo-editor-dialog--confirming");
					if (!closed && previousFocus && previousFocus.isConnected) previousFocus.focus();
					resolve(confirmed);
				};
				refreshConfirmation = open$3(modal.parentElement, {
					message: t$8("collections.discardQuestion"),
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
			var sequence = ++loadSequence;
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
					content.getElement().replaceChildren(createElement$8("div", {
						className: "gpo-admx-dialog__loading",
						attrs: { role: "status" },
						text: t$8("treeView.loadingPolicies")
					}).getElement());
					editor.ready = load();
				},
				onRendered: function(policy) {
					if (!ownsLoad()) return;
					var title = dialog.root.getElement().querySelector(".preference__modal-header .title");
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
	var { createElement: createElement$7 } = element_creator_exports;
	var { t: t$7 } = translations_exports;
	function renderChildRow(item, onItemClick, onSelect) {
		const row = createElement$7("span", {
			className: "workspace-list-item",
			attrs: typeof onItemClick === "function" ? {
				role: "button",
				tabindex: "-1"
			} : {},
			children: [createElement$7("span", { className: ["icon", item.icon] }), createElement$7("span", {
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
		return createElement$7("li", {
			className: ["gp__list-children__item", item.type],
			children: [row]
		});
	}
	function renderHelpBlock$1({ help = void 0, isOpen = false } = {}) {
		if (!help) return null;
		return createElement$7("div", {
			className: ["gp__list-children-help", isOpen ? "is-open" : null],
			children: [createElement$7("div", {
				className: "title",
				text: t$7("common.help")
			}), createElement$7("div", {
				className: "content",
				text: help
			})]
		});
	}
	/**
	* @param {{ categoryPath?: string, hideHeading?: boolean, children?: any[], help?: any, onItemClick?: any,
	*   isHelpOpen?: boolean, listState?: { selectedItem?: any, query?: string, scrollTop?: number } }} [options]
	*/
	function renderFolderTemplate$1({ categoryPath = "", hideHeading = false, children = [], help = void 0, onItemClick = null, isHelpOpen = false, listState = {} } = {}) {
		const folderChildren = Array.isArray(children) ? children : [];
		const helpBlock = renderHelpBlock$1({
			help,
			isOpen: isHelpOpen
		});
		const list = createElement$7("ul", { className: "gp__list-children__list" });
		let rowItems = /* @__PURE__ */ new Map();
		let navigation = null;
		function select(item) {
			listState.selectedItem = item;
			rowItems.forEach((value, row) => {
				row.classList.toggle("active", value === item);
			});
			if (navigation) navigation.sync();
		}
		const search = createElement$7("input", { attrs: {
			type: "search",
			value: listState.query || "",
			placeholder: t$7("policySearch.categoryPlaceholder"),
			"aria-label": t$7("policySearch.categoryPlaceholder"),
			"data-policy-filter": ""
		} });
		const empty = createElement$7("p", {
			text: t$7("policySearch.noMatches"),
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
		const content = createElement$7("div", {
			className: "gp__list-children",
			children: [
				createElement$7("div", {
					className: "gpo-security-workbench__toolbar",
					children: [!hideHeading && categoryPath ? createElement$7("h2", {
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
		const root = createElement$7("div", {
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
	var t$6 = t$12;
	var create$6 = createElement$18;
	function st$1(key) {
		return t$6("systemSettings." + key);
	}
	function eventLabel$1(event) {
		return st$1({
			startup: "startupScripts",
			shutdown: "shutdownScripts",
			logon: "logonScript",
			logoff: "logoffScript"
		}[event]);
	}
	function nameCell$1(label, icon) {
		return create$6("td", { children: [create$6("span", {
			className: "gpo-catalog-name",
			children: [create$6("span", {
				className: ["icon", icon],
				attrs: { "aria-hidden": "true" }
			}), create$6("span", { text: label })]
		})] });
	}
	function assetIcon$1(name) {
		return __export_scriptFile(/\.ps(?:1|m1|d1)$/i.test(name) ? "powershell" : "classic");
	}
	function button$1(label, action, disabled, extraClass) {
		return create$6("button", {
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
	function fileBase64$1(file) {
		return new Promise(function(resolve, reject) {
			var reader = new FileReader();
			reader.onerror = function() {
				reject(reader.error || /* @__PURE__ */ new Error("File reading failed."));
			};
			reader.onload = function() {
				var value = String(reader.result || "");
				var comma = value.indexOf(",");
				if (comma < 0) reject(/* @__PURE__ */ new Error("File reading failed."));
				else resolve(value.slice(comma + 1));
			};
			reader.readAsDataURL(file);
		});
	}
	function saveDownloadedAsset$1(asset) {
		if (!asset || typeof asset.name !== "string" || !asset.name || asset.name === "." || asset.name === ".." || asset.name.trim() !== asset.name || /[\\/\u0000]/.test(asset.name) || typeof asset.content_base64 !== "string" || !Number.isSafeInteger(asset.byte_size) || asset.byte_size < 0) throw new Error(st$1("invalidDownload"));
		var binary;
		try {
			binary = atob(asset.content_base64);
		} catch (_error) {
			throw new Error(st$1("invalidDownload"));
		}
		if (binary.length !== asset.byte_size) throw new Error(st$1("invalidDownload"));
		var bytes = new Uint8Array(binary.length);
		for (var index = 0; index < binary.length; index++) bytes[index] = binary.charCodeAt(index);
		var url = URL.createObjectURL(new Blob([bytes], { type: "application/octet-stream" }));
		var link = document.createElement("a");
		link.href = url;
		link.download = asset.name;
		document.body.appendChild(link);
		link.click();
		link.remove();
		setTimeout(function() {
			URL.revokeObjectURL(url);
		}, 0);
	}
	//#endregion
	//#region src/components/templates/script-template.js
	var create$5 = createElement$18;
	var t$5 = t$12;
	var nextHeaderOwnerId$1 = 1;
	var st = st$1;
	var eventLabel = eventLabel$1;
	var button = button$1;
	var nameCell = nameCell$1;
	var assetIcon = assetIcon$1;
	var fileBase64 = fileBase64$1;
	var saveDownloadedAsset = saveDownloadedAsset$1;
	var GROUPS = ["classic", "powershell"];
	var EVENTS = {
		computer: ["startup", "shutdown"],
		user: ["logon", "logoff"]
	};
	function renderScriptEventEditor(options) {
		var config = options || {};
		var scope = config.item && config.item.scope === "user" ? "user" : "computer";
		var event = config.item && config.item.event;
		if (EVENTS[scope].indexOf(event) === -1) event = EVENTS[scope][0];
		var state = {
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
		var navigations = {}, pickerNavigation = null;
		state.assetFocus = null;
		state.removal = null;
		var root = create$5("div", { className: [
			"gp__scripts",
			"gp__preference",
			"gpo-editor-scripts"
		] });
		var rootElement = root.getElement();
		var headerElement = config.header && config.header.getElement ? config.header.getElement() : null;
		var headerControls = headerElement && headerElement.querySelector(".gp__control");
		var headerActions = headerElement && headerElement.querySelector(".gp__control-actions");
		var admxActions = headerElement && headerElement.querySelector(".gp__control-admx");
		var helpSeparator = headerElement && headerElement.querySelector(".gp__control-separator");
		var createButton = headerControls && headerControls.querySelector(".preferences__btn-create");
		var editButton = headerControls && headerControls.querySelector(".preferences__btn-edit");
		var deleteButton = headerControls && headerControls.querySelector(".preferences__btn-delete");
		var headerOwner = "scripts-" + nextHeaderOwnerId$1++;
		var headerLabels = [
			createButton,
			editButton,
			deleteButton
		].map(function(control) {
			return control ? control.textContent : null;
		});
		var headerListeners = [];
		var modalDisabledStates = /* @__PURE__ */ new WeakMap();
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
		var overlay = create$5("div", {
			className: "scripts__overlay",
			events: { click: function() {
				requestCloseForm();
			} }
		});
		var modalBody = create$5("div", { className: "scripts__modal-content" });
		var uploadInput = create$5("input", {
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
		var replaceInput = create$5("input", {
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
		if (!config.mode) root.append(create$5("h2", {
			className: "gpo-editor-scripts__title",
			text: eventLabel(event)
		}));
		root.append(modalBody).append(overlay).append(uploadInput).append(replaceInput);
		function ownsHeader() {
			return Boolean(headerControls && headerControls.getAttribute("data-script-owner") === headerOwner);
		}
		function setHeaderState() {
			if (!ownsHeader()) return;
			var editable = Boolean(groupView().editable) && !state.busy && !state.loading && !state.form && !state.picker;
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
		function applyResponse(response) {
			var previousOrder = state.view && state.view.execution_order;
			state.envelope = response;
			state.view = response && response.scripts || null;
			state.error = null;
			if (state.view && (state.orderDraft === null || state.orderDraft === previousOrder)) state.orderDraft = state.view.execution_order || "unspecified";
			GROUPS.forEach(function(group) {
				var rows = state.view && state.view[group] && state.view[group].entries || [];
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
				var surviving = assets().map(function(asset) {
					return asset.name;
				});
				var removed = state.removal.removed.filter(function(name) {
					return surviving.indexOf(name) === -1;
				});
				if (removed.length) {
					var neighbor$2 = neighbor(state.removal.before, removed, surviving);
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
			var requestId = ++state.requestId;
			var event = state.event;
			state.loading = true;
			state.error = null;
			renderBody();
			try {
				var response = await scriptsShow(scope, event);
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
			var focusedTable = document.activeElement && document.activeElement.closest("[data-script-list]");
			var returnList = focusedTable && rootElement.contains(focusedTable) ? focusedTable.getAttribute("data-script-list") : null;
			var returnGroup = state.group;
			state.busy = true;
			state.error = null;
			state.saveStatus = "saving";
			syncModalBusy();
			renderBody();
			try {
				var response = await operation();
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
						var original = modalDisabledStates.get(control);
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
		function closePicker() {
			if (pickerNavigation) {
				pickerNavigation.cleanup();
				pickerNavigation = null;
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
		function closeForm(force) {
			if (state.busy && !force) return false;
			closePicker();
			if (state.form) {
				state.form.remove();
				state.form = null;
			}
			state.formState = null;
			overlay.getElement().classList.remove("active");
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
		function openPicker(initialName, onSelect) {
			if (state.busy || state.picker) return;
			state.pickerFocus = document.activeElement;
			var chosen = assets().some(function(asset) {
				return asset.name === initialName;
			}) ? initialName : null;
			var pickerOverlay = create$5("div", {
				className: [
					"scripts__overlay",
					"active",
					"gpo-editor-scripts__picker-overlay"
				],
				events: { click: closePicker }
			});
			var selectButton = button(st("selectFile"), function() {
				choose();
			}, !chosen, "btn-ok");
			selectButton.addClass("gpo-editor-scripts__picker-select");
			var rows = assets().map(function(asset) {
				var row = create$5("tr", {
					className: asset.name === chosen ? "active" : null,
					attrs: {
						tabindex: "-1",
						"data-script-asset": asset.name
					},
					children: [nameCell(asset.name, assetIcon(asset.name)), create$5("td", { text: String(asset.byte_size) + " " + st("bytes") })]
				});
				function select() {
					chosen = asset.name;
					Array.prototype.forEach.call(table.getElement().querySelectorAll("tbody tr"), function(candidate) {
						candidate.classList.toggle("active", candidate === row.getElement());
					});
					selectButton.getElement().disabled = false;
					selectButton.addClass("active");
					if (pickerNavigation) pickerNavigation.sync();
				}
				row.getElement().__select = select;
				row.on("click", function() {
					select();
					if (pickerNavigation) pickerNavigation.focusSelected();
				});
				row.on("dblclick", function() {
					select();
					choose();
				});
				return row;
			});
			var table = create$5("table", {
				className: ["preference__table", "gpo-catalog-table"],
				children: [create$5("thead", { children: [create$5("tr", { children: [create$5("th", { text: st("columnName") }), create$5("th", { text: st("columnSize") })] })] }), create$5("tbody", { children: rows })]
			});
			function choose() {
				if (!chosen || state.busy) return;
				closePicker();
				onSelect(chosen);
			}
			var picker = create$5("div", {
				className: [
					"preference__modal",
					"active",
					"gpo-editor-scripts__picker"
				],
				attrs: {
					role: "dialog",
					"aria-modal": "true",
					"aria-label": st("browseFiles")
				},
				events: { keydown: function(event) {
					if (event.defaultPrevented || event.target.closest("[role=\"dialog\"], [role=\"alertdialog\"]") !== picker.getElement()) return;
					if (event.key === "Escape") {
						event.preventDefault();
						event.stopPropagation();
						closePicker();
					}
					trapTab(event, picker.getElement());
				} },
				children: [create$5("div", {
					className: "preference__modal-wrapper",
					children: [
						create$5("div", {
							className: "preference__modal-header",
							children: [create$5("div", {
								className: "title",
								text: st("browseFiles")
							}), create$5("button", {
								className: "close",
								attrs: {
									type: "button",
									"aria-label": st("close")
								},
								events: { click: closePicker }
							})]
						}),
						create$5("div", {
							className: "preference__modal-content",
							children: [assets().length ? table : create$5("div", {
								className: "gpo-editor-empty",
								text: st("emptyAssets")
							})]
						}),
						create$5("div", {
							className: "preference__modal-footer",
							children: [button(t$5("header.cancel"), closePicker, false, "btn-cancel"), selectButton]
						})
					]
				})]
			});
			rootElement.appendChild(pickerOverlay.getElement());
			rootElement.appendChild(picker.getElement());
			state.pickerOverlay = pickerOverlay.getElement();
			state.picker = picker.getElement();
			pickerNavigation = bind$1(table.getElement(), {
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
		function openForm(kind) {
			if (state.busy || state.loading || !groupView().editable) return;
			var entry = kind === "edit" ? selectedEntry() : null;
			if (kind === "edit" && !entry) return;
			if (kind === "select" && !selectedAsset()) return;
			closeForm();
			state.formFocus = document.activeElement;
			var isEdit = kind === "edit";
			var modern = Boolean(config.mode);
			var sourceSelect = create$5("select", { children: [create$5("option", {
				attrs: { value: "existing_asset" },
				text: st("existingAsset")
			}), create$5("option", {
				attrs: { value: "external_command" },
				text: st("externalCommand")
			})] });
			sourceSelect.getElement().value = entry ? entry.managed_asset_name ? "existing_asset" : "external_command" : kind === "select" || assets().length ? "existing_asset" : "external_command";
			var assetInput = create$5("input", { attrs: {
				type: "text",
				readonly: "readonly",
				value: entry && entry.managed_asset_name || kind === "select" && selectedAsset() && selectedAsset().name || ""
			} });
			var browseButton = button(config.mode ? "…" : st("browseFiles"), function() {
				var input = modern ? commandInput : assetInput;
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
			var commandInput = create$5("input", { attrs: {
				type: "text",
				value: entry ? entry.command_line : "",
				placeholder: modern ? st("externalCommand") : null
			} });
			var parametersInput = create$5("input", { attrs: {
				type: "text",
				value: entry ? entry.parameters : ""
			} });
			var assetRow = field(st("nameLabel"), create$5("div", {
				className: "gpo-editor-scripts__asset-field",
				children: [modern ? commandInput : assetInput, browseButton]
			}));
			var commandRow = modern ? null : field(st("nameLabel"), commandInput);
			var formError = create$5("div", { className: "gpo-editor-scripts__form-error" });
			function values() {
				if (modern) return [commandInput.getElement().value, parametersInput.getElement().value];
				return [
					sourceSelect.getElement().value,
					assetInput.getElement().value,
					commandInput.getElement().value,
					parametersInput.getElement().value
				];
			}
			var initialValues = JSON.stringify(values());
			function markDirty() {
				setHeaderState();
			}
			function syncSource() {
				if (modern) return;
				var existing = sourceSelect.getElement().value === "existing_asset";
				assetRow.getElement().hidden = !existing;
				commandRow.getElement().hidden = existing;
				markDirty();
			}
			sourceSelect.on("change", syncSource);
			commandInput.on("input", markDirty);
			parametersInput.on("input", markDirty);
			var form = create$5("div", {
				className: [
					"preference__modal",
					"active",
					"gpo-editor-scripts__form"
				],
				attrs: {
					role: "dialog",
					"aria-modal": "true"
				},
				events: { keydown: function(event) {
					if (event.defaultPrevented || event.target.closest("[role=\"dialog\"], [role=\"alertdialog\"]") !== form.getElement()) return;
					if (event.key === "Escape") {
						event.preventDefault();
						event.stopPropagation();
						requestCloseForm();
					}
					trapTab(event, form.getElement());
				} },
				children: [create$5("div", {
					className: "preference__modal-wrapper",
					children: [
						create$5("div", {
							className: "preference__modal-header",
							children: [create$5("div", {
								className: "title",
								text: st(isEdit ? "editTitle" : "addTitle")
							}), create$5("button", {
								className: "close",
								attrs: {
									type: "button",
									"aria-label": st("close")
								},
								events: { click: requestCloseForm }
							})]
						}),
						create$5("div", {
							className: "preference__modal-content",
							children: modern ? [
								assetRow,
								field(st("argumentsLabel"), parametersInput),
								formError
							] : [
								field(st("sourceLabel"), sourceSelect),
								assetRow,
								commandRow,
								field(st("argumentsLabel"), parametersInput),
								formError
							]
						}),
						create$5("div", {
							className: "preference__modal-footer",
							children: [button(t$5("header.cancel"), requestCloseForm, false, "btn-cancel"), button(t$5("header.apply"), function() {
								submit();
							}, false, "btn-ok")]
						})
					]
				})]
			});
			async function submit() {
				if (state.busy) return false;
				formError.setText("");
				var command = modern ? commandInput.getElement().value.trim() : sourceSelect.getElement().value === "existing_asset" ? assetInput.getElement().value : commandInput.getElement().value.trim();
				var matchedAsset = modern && assets().find(function(asset) {
					return asset.name.toLowerCase() === command.toLowerCase();
				});
				var source = modern ? matchedAsset ? "existing_asset" : "external_command" : sourceSelect.getElement().value;
				var name = modern && matchedAsset ? matchedAsset.name : assetInput.getElement().value;
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
				var parameters = parametersInput.getElement().value.trim();
				var group = state.group;
				var event = state.event;
				var snapshot = groupView().snapshot;
				var ok = await mutate(function() {
					if (isEdit) return scriptEntryUpdate(scope, event, {
						executable_group: group,
						identity: entry.identity,
						command_line: command,
						parameters
					});
					var request = {
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
			rootElement.appendChild(form.getElement());
			state.form = form.getElement();
			state.formState = {
				dirty: function() {
					return JSON.stringify(values()) !== initialValues;
				},
				submit
			};
			overlay.getElement().classList.add("active");
			syncSource();
			setHeaderState();
			(modern ? commandInput : sourceSelect).getElement().focus();
		}
		function field(label, input) {
			return create$5("div", {
				className: "gpo-editor-field",
				children: [create$5("div", {
					className: "gpo-editor-field__label",
					text: label
				}), input]
			});
		}
		function removeEntry() {
			var entry = selectedEntry();
			if (!entry || !groupView().editable || state.busy) return;
			var group = state.group;
			var event = state.event;
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
			var group = state.group;
			var rows = entries();
			var index = rows.findIndex(function(entry) {
				return entry.identity === state.selectedEntry[group];
			});
			var target = index + delta;
			if (!groupView().editable || state.busy || index < 0 || target < 0 || target >= rows.length) return;
			var order = rows.map(function(entry) {
				return entry.identity;
			});
			var moved = order[index];
			order[index] = order[target];
			order[target] = moved;
			var snapshot = groupView().snapshot;
			mutate(function() {
				return scriptEntriesReorder(scope, state.event, {
					executable_group: group,
					snapshot,
					identities: order
				});
			});
		}
		async function uploadChosen(event, replace) {
			var file = event.target.files && event.target.files[0];
			event.target.value = "";
			if (!file || state.busy || !state.view) return;
			var asset = replace ? selectedAsset() : null;
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
					var content = await fileBase64(file);
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
			var selected = config.mode === "assets" ? assets().filter(function(asset) {
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
			var event = state.event;
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
					var response = null;
					try {
						for (var index = 0; index < selected.length; index++) response = await scriptAssetDelete(scope, event, {
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
			var asset = selectedAsset();
			if (!asset || state.busy) return;
			state.busy = true;
			renderBody();
			try {
				var response = await scriptAssetDownload(scope, state.event, {
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
		function renderEntries() {
			var rows = entries();
			var editable = Boolean(groupView().editable) && !state.busy;
			var table = create$5("table", {
				className: ["preference__table", "gpo-catalog-table"],
				children: [create$5("thead", { children: [create$5("tr", { children: [create$5("th", { text: st("columnName") }), create$5("th", { text: st("columnArguments") })] })] }), create$5("tbody", { children: rows.length ? rows.map(function(entry) {
					var row = create$5("tr", {
						className: entry.identity === state.selectedEntry[state.group] ? "active" : null,
						attrs: {
							tabindex: "-1",
							"data-script-entry": entry.identity
						},
						children: [nameCell(entry.command_line, __export_scriptFile(state.group)), create$5("td", { text: entry.parameters })]
					});
					function select() {
						state.selectedEntry[state.group] = entry.identity;
						Array.prototype.forEach.call(table.getElement().querySelectorAll("tbody tr"), function(candidate) {
							candidate.classList.toggle("active", candidate === row.getElement());
						});
						syncButtons();
						setHeaderState();
						if (navigations.entries) navigations.entries.sync();
					}
					row.getElement().__select = select;
					row.on("click", function() {
						select();
						navigations.entries.focusSelected();
					});
					row.on("dblclick", function() {
						if (!state.busy && !state.form && !state.picker && !state.confirmation) {
							select();
							openForm("edit");
						}
					});
					return row;
				}) : [create$5("tr", {
					className: "gpo-editor-scripts__empty-row",
					children: [create$5("td", {
						attrs: { colspan: "2" },
						text: st("emptyEntries")
					})]
				})] })]
			});
			var controls = {
				add: button(st("add"), function() {
					openForm("add");
				}, !editable),
				edit: button(st("edit"), function() {
					openForm("edit");
				}, true),
				remove: button(st("remove"), removeEntry, true),
				up: button(st("up"), function() {
					moveEntry(-1);
				}, true),
				down: button(st("down"), function() {
					moveEntry(1);
				}, true)
			};
			function syncButtons() {
				var index = rows.findIndex(function(entry) {
					return entry.identity === state.selectedEntry[state.group];
				});
				var selected = editable && index >= 0;
				var up = editable && index >= 1;
				var down = editable && index >= 0 && index < rows.length - 1;
				[controls.edit, controls.remove].forEach(function(control) {
					control.getElement().disabled = !selected;
					control.getElement().classList.toggle("active", selected);
				});
				controls.up.getElement().disabled = !up;
				controls.down.getElement().disabled = !down;
				controls.up.getElement().classList.toggle("active", up);
				controls.down.getElement().classList.toggle("active", down);
			}
			syncButtons();
			bindTable(table, "entries", {
				rows: function() {
					return Array.from(table.getElement().querySelectorAll("[data-script-entry]"));
				},
				selected: function() {
					return Array.from(table.getElement().querySelectorAll("[data-script-entry]")).find(function(row) {
						return row.getAttribute("data-script-entry") === state.selectedEntry[state.group];
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
			return create$5("section", {
				className: "gpo-editor-scripts__entries",
				children: [create$5("div", {
					className: "gpo-editor-scripts__list",
					children: [table]
				}), create$5("div", {
					className: "gpo-editor-scripts__toolbar",
					children: config.mode === "event" ? [
						controls.up,
						controls.down,
						controls.add,
						controls.edit,
						controls.remove
					] : [controls.up, controls.down]
				})]
			});
		}
		function renderAssets() {
			var all = assets();
			var mayChange = !state.busy && Boolean(groupView().editable);
			var explorer = config.mode === "assets";
			var rows = all.map(function(asset) {
				var checkbox = explorer ? create$5("input", { attrs: {
					type: "checkbox",
					tabindex: "-1",
					"aria-label": st("selectFile") + ": " + asset.name
				} }) : null;
				if (checkbox) checkbox.getElement().checked = state.selectedAssets.has(asset.name);
				var row = create$5("tr", {
					className: explorer ? state.selectedAssets.has(asset.name) ? "active" : null : asset.name === state.selectedAsset ? "active" : null,
					attrs: {
						tabindex: "-1",
						"data-script-asset": asset.name
					},
					children: [
						checkbox ? create$5("td", { children: [checkbox] }) : null,
						nameCell(asset.name, assetIcon(asset.name)),
						create$5("td", { text: String(asset.byte_size) + " " + st("bytes") }),
						create$5("td", { text: String((asset.references || []).length) })
					]
				});
				function select(selected, exclusive, range) {
					if (explorer) {
						if (range && state.assetFocus) {
							var from = all.findIndex(function(entry) {
								return entry.name === state.assetFocus;
							});
							var to = all.indexOf(asset);
							if (exclusive) state.selectedAssets.clear();
							all.slice(Math.min(from, to), Math.max(from, to) + 1).forEach(function(entry) {
								state.selectedAssets.add(entry.name);
							});
						} else if (exclusive) state.selectedAssets.clear();
						if (selected) state.selectedAssets.add(asset.name);
						else state.selectedAssets.delete(asset.name);
						state.selectedAsset = state.selectedAssets.size === 1 ? Array.from(state.selectedAssets)[0] : null;
						Array.prototype.forEach.call(table.getElement().querySelectorAll("[data-script-asset]"), function(candidate) {
							var active = state.selectedAssets.has(candidate.getAttribute("data-script-asset"));
							candidate.classList.toggle("active", active);
							candidate.setAttribute("aria-selected", active ? "true" : "false");
							candidate.querySelector("input[type=checkbox]").checked = active;
						});
					} else {
						state.selectedAsset = asset.name;
						Array.prototype.forEach.call(table.getElement().querySelectorAll("tbody tr"), function(candidate) {
							candidate.classList.toggle("active", candidate === row.getElement());
						});
					}
					state.assetFocus = asset.name;
					syncButtons();
					if (navigations.assets) navigations.assets.sync();
				}
				row.getElement().__select = function(event) {
					select(true, !event || !event.ctrlKey, Boolean(event && event.shiftKey));
				};
				row.on("click", function(event) {
					select(explorer && !event.shiftKey ? !state.selectedAssets.has(asset.name) : true, false, event.shiftKey);
					navigations.assets.sync();
					row.getElement().focus();
				});
				row.on("dblclick", function(event) {
					if (event.target.closest("input, select, textarea, button, a, summary, [contenteditable]")) return;
					if (state.busy || state.form || state.picker || state.confirmation) return;
					select(true, true);
					if (explorer) downloadAsset();
					else openForm("select");
				});
				if (checkbox) checkbox.on("click", function(event) {
					event.stopPropagation();
				});
				if (checkbox) checkbox.on("change", function() {
					select(checkbox.getElement().checked);
				});
				return row;
			});
			var table = create$5("table", {
				className: ["preference__table", "gpo-catalog-table"],
				children: [create$5("thead", { children: [create$5("tr", { children: [
					explorer ? create$5("th", { text: "" }) : null,
					create$5("th", { text: st("columnName") }),
					create$5("th", { text: st("columnSize") }),
					create$5("th", { text: st(explorer ? "usedBy" : "columnReferences") })
				] })] }), create$5("tbody", { children: rows.length ? rows : [create$5("tr", {
					className: "gpo-editor-scripts__empty-row",
					children: [create$5("td", {
						attrs: { colspan: explorer ? "4" : "3" },
						text: st("emptyAssets")
					})]
				})] })]
			});
			var controls = {
				upload: button(st("upload"), function() {
					uploadInput.getElement().click();
				}, !mayChange),
				select: button(st("addSelectedScript"), function() {
					openForm("select");
				}, true),
				replace: button(st("replaceFile"), function() {
					replaceInput.getElement().click();
				}, true),
				download: button(st("download"), function() {
					downloadAsset();
				}, true),
				delete: button(st("deleteFile"), deleteAsset, true),
				refresh: button(st("refresh"), function() {
					loadEvent();
				}, state.busy)
			};
			function syncButtons() {
				var asset = selectedAsset();
				var selected = explorer ? all.filter(function(item) {
					return state.selectedAssets.has(item.name);
				}) : asset ? [asset] : [];
				var enabled = [
					mayChange,
					mayChange && Boolean(asset),
					mayChange && Boolean(asset),
					!state.busy && Boolean(asset),
					mayChange && selected.length > 0 && selected.every(function(item) {
						return !(item.references && item.references.length);
					})
				];
				[
					controls.upload,
					controls.select,
					controls.replace,
					controls.download,
					controls.delete
				].forEach(function(control, index) {
					control.getElement().disabled = !enabled[index];
					control.getElement().classList.toggle("active", enabled[index]);
				});
				controls.delete.getElement().title = selected.some(function(item) {
					return item.references && item.references.length;
				}) ? st("fileInUse") : "";
				controls.refresh.getElement().disabled = state.busy;
				controls.refresh.getElement().classList.toggle("active", !state.busy);
			}
			syncButtons();
			bindTable(table, "assets", {
				rows: function() {
					return Array.from(table.getElement().querySelectorAll("[data-script-asset]"));
				},
				selected: function() {
					return Array.from(table.getElement().querySelectorAll("[data-script-asset]")).find(function(row) {
						return row.getAttribute("data-script-asset") === (state.assetFocus || state.selectedAsset);
					}) || null;
				},
				isSelected: explorer ? function(row) {
					return state.selectedAssets.has(row.getAttribute("data-script-asset"));
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
					var selected = explorer ? all.filter(function(asset) {
						return state.selectedAssets.has(asset.name);
					}) : [selectedAsset()].filter(Boolean);
					return Boolean(groupView().editable) && selected.length > 0 && selected.every(function(asset) {
						return !(asset.references && asset.references.length);
					});
				}
			});
			var toolbar = create$5("div", {
				className: "gpo-editor-scripts__toolbar",
				children: explorer ? all.length ? [
					controls.upload,
					controls.replace,
					controls.download,
					controls.delete,
					controls.refresh
				] : [controls.upload] : [
					controls.upload,
					controls.select,
					controls.replace,
					controls.download,
					controls.delete
				]
			});
			var list = create$5("div", {
				className: "gpo-editor-scripts__list",
				children: [table]
			});
			return create$5("section", {
				className: "gpo-editor-scripts__assets",
				children: [
					explorer ? null : create$5("h3", { text: st("managedFiles") }),
					explorer ? toolbar : list,
					explorer ? list : toolbar,
					selectedAsset() && selectedAsset().references && selectedAsset().references.length ? create$5("p", {
						className: "gpo-editor-scripts__hint",
						text: st("fileInUse")
					}) : null
				]
			});
		}
		function renderOrder() {
			var select = create$5("select", { children: [
				create$5("option", {
					attrs: { value: "unspecified" },
					text: st("orderUnspecified")
				}),
				create$5("option", {
					attrs: { value: "classic_first" },
					text: st("orderClassicFirst")
				}),
				create$5("option", {
					attrs: { value: "powershell_first" },
					text: st("orderPowershellFirst")
				})
			] });
			select.getElement().value = state.orderDraft || state.view.execution_order || "unspecified";
			var canApply = !state.busy && Boolean(state.view.powershell.editable) && state.orderDraft !== state.view.execution_order;
			var apply = button(st("applyOrder"), function() {
				saveOrderDraft();
			}, !canApply);
			select.on("change", function() {
				state.orderDraft = select.getElement().value;
				var available = !state.busy && state.view.powershell.editable && state.orderDraft !== state.view.execution_order;
				apply.getElement().disabled = !available;
				apply.getElement().classList.toggle("active", available);
			});
			select.getElement().disabled = state.busy || !state.view.powershell.editable;
			return create$5("div", {
				className: "gpo-editor-scripts__order",
				children: [
					create$5("label", { text: st("psOrderLabel") }),
					select,
					apply
				]
			});
		}
		function saveOrderDraft() {
			if (!state.view || state.busy || !state.view.powershell.editable || state.orderDraft === state.view.execution_order) return Promise.resolve(true);
			var snapshot = state.view.powershell.snapshot;
			var order = state.orderDraft;
			return mutate(function() {
				return scriptOrderUpdate(scope, state.event, {
					snapshot,
					execution_order: order
				});
			});
		}
		function renderBody() {
			if (!current()) return;
			setHeaderState();
			var slot = modalBody.getElement();
			var activeTable = document.activeElement && document.activeElement.closest("[data-script-list]");
			var heldList = activeTable && slot.contains(activeTable) ? activeTable.getAttribute("data-script-list") : null;
			var heldGroupTab = slot.contains(document.activeElement) && document.activeElement.getAttribute("data-script-group");
			Object.keys(navigations).forEach(function(kind) {
				navigations[kind].cleanup();
			});
			navigations = {};
			slot.textContent = "";
			if (state.loading) {
				slot.appendChild(create$5("div", {
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
				var pending = renderPending(state.envelope.pending_publication, function() {
					reconcile().then(loadEvent, setError);
				});
				if (pending) slot.appendChild(pending.getElement());
			}
			var diagnostics = groupView().diagnostics || [];
			if (!groupView().editable) slot.appendChild(create$5("p", {
				className: "gpo-editor-scripts__hint",
				text: st("readOnlyScripts")
			}).getElement());
			if (diagnostics.length) slot.appendChild(renderDiagnostics(diagnostics).getElement());
			if (state.saveStatus) slot.appendChild(create$5("p", {
				className: "gpo-editor-scripts__save-status",
				attrs: {
					role: "status",
					"aria-live": "polite"
				},
				text: state.saveStatus === "saving" ? st("saving") : state.saveStatus === "saved" ? st("saved") : ""
			}).getElement());
			if (config.mode !== "assets") {
				slot.appendChild(create$5("div", {
					className: "preference__modal-tabs",
					children: [create$5("div", {
						className: "tab-buttons",
						attrs: { role: "tablist" },
						children: GROUPS.map(function(group) {
							return create$5("button", {
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
				var restoredTab = slot.querySelector("[data-script-group=\"" + heldGroupTab + "\"]");
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
	function renderScriptsTemplate$1(options) {
		var config = options || {};
		if (config.item && config.item.event) return renderScriptEventEditor(config);
		var scope = config.item && config.item.scope === "user" ? "user" : "computer";
		var events = EVENTS[scope];
		var state = {
			selectedEvent: events.indexOf(config.item && config.item.scriptEvent) !== -1 ? config.item.scriptEvent : events[0],
			summaries: {},
			errors: {},
			generations: {},
			modal: null,
			confirmation: null,
			disposed: false
		};
		var overviewNavigation = null;
		var root = create$5("div", { className: [
			"gp__scripts",
			"gp__preference",
			"gpo-editor-scripts"
		] });
		var rootElement = root.getElement();
		var overview = create$5("div", { className: ["preference__data-table", "gpo-editor-scripts__overview"] });
		if (!config.hideHeading) root.append(create$5("h2", {
			className: "gpo-editor-scripts__title",
			text: config.categoryPath || st("scripts"),
			attrs: { "data-category-path": "" }
		}));
		root.append(overview);
		var headerElement = config.header && config.header.getElement ? config.header.getElement() : null;
		var headerControls = headerElement && headerElement.querySelector(".gp__control");
		var headerActions = headerElement && headerElement.querySelector(".gp__control-actions");
		var admxActions = headerElement && headerElement.querySelector(".gp__control-admx");
		var helpSeparator = headerElement && headerElement.querySelector(".gp__control-separator");
		var createButton = headerControls && headerControls.querySelector(".preferences__btn-create");
		var editButton = headerControls && headerControls.querySelector(".preferences__btn-edit");
		var deleteButton = headerControls && headerControls.querySelector(".preferences__btn-delete");
		var headerOwner = "scripts-" + nextHeaderOwnerId$1++;
		var oldHeader = [
			createButton,
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
		var folderButton = button(st("openFolder"), function() {
			openModal("assets");
		}, false);
		folderButton.addClass("gpo-editor-scripts__folder-button");
		if (headerControls) {
			headerControls.setAttribute("data-script-owner", headerOwner);
			headerControls.style.display = "flex";
			if (createButton) createButton.style.display = "none";
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
			var enabled = !state.modal;
			if (editButton) {
				editButton.disabled = !enabled;
				editButton.classList.toggle("active", enabled);
			}
			folderButton.getElement().disabled = !enabled;
			folderButton.getElement().classList.toggle("active", enabled);
		}
		function refreshEvent(event) {
			var generation = (state.generations[event] || 0) + 1;
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
			var heldFocus = overview.getElement().contains(document.activeElement);
			if (overviewNavigation) overviewNavigation.cleanup();
			function selectRow(row, event) {
				state.selectedEvent = event;
				Array.prototype.forEach.call(table.getElement().querySelectorAll("tbody tr"), function(candidate) {
					candidate.classList.toggle("active", candidate === row.getElement());
				});
				renderOverviewError();
				if (overviewNavigation) overviewNavigation.sync();
			}
			var table = create$5("table", {
				className: [
					"preference__table",
					"gpo-catalog-table",
					"gpo-editor-scripts__event-table"
				],
				children: [create$5("thead", { children: [create$5("tr", { children: [
					create$5("th", { text: st("eventColumn") }),
					create$5("th", { text: st("scriptsColumn") }),
					create$5("th", { text: st("powershellColumn") })
				] })] }), create$5("tbody", { children: events.map(function(event) {
					var view = state.summaries[event];
					var row = create$5("tr", {
						className: event === state.selectedEvent ? "active" : null,
						attrs: {
							tabindex: "-1",
							"data-script-event": event
						},
						children: [
							nameCell(eventLabel(event), __export_scriptEvent(event)),
							create$5("td", { text: view ? String(view.classic.entries.length) : "—" }),
							create$5("td", { text: view ? String(view.powershell.entries.length) : "—" })
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
			var slot = overview.getElement();
			var prior = slot.querySelector(".gpo-editor-scripts__overview-error");
			if (prior) prior.remove();
			if (state.errors[state.selectedEvent]) {
				var error = create$5("div", { className: "gpo-editor-scripts__overview-error" });
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
			var active = state.modal;
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
			var event = state.selectedEvent;
			var previousFocus = document.activeElement;
			var overlay = create$5("div", {
				className: [
					"scripts__overlay",
					"active",
					"gpo-editor-scripts__dialog-overlay"
				],
				events: { click: function() {
					closeModal();
				} }
			});
			var host = create$5("div", { className: "gpo-editor-scripts__detail-host" });
			var title = mode === "assets" ? st("folderForEvent").replace("{event}", eventLabel(event)) : eventLabel(event);
			var content = create$5("div", {
				className: "preference__modal-content",
				children: [host]
			});
			var dialog = create$5("div", {
				className: [
					"preference__modal",
					"active",
					mode === "assets" ? "gpo-editor-scripts__explorer" : "gpo-editor-scripts__event-dialog"
				],
				attrs: {
					role: "dialog",
					"aria-modal": "true",
					"aria-label": title
				},
				events: { keydown: function(keyEvent) {
					if (keyEvent.defaultPrevented || keyEvent.target.closest("[role=\"dialog\"], [role=\"alertdialog\"]") !== dialog.getElement()) return;
					if (keyEvent.key === "Escape") {
						keyEvent.preventDefault();
						keyEvent.stopPropagation();
						closeModal();
					}
					trapTab(keyEvent, dialog.getElement());
				} },
				children: [create$5("div", {
					className: "preference__modal-wrapper",
					children: [
						create$5("div", {
							className: "preference__modal-header",
							children: [create$5("div", {
								className: "title",
								text: title
							}), create$5("button", {
								className: "close",
								attrs: {
									type: "button",
									"aria-label": st("close")
								},
								events: { click: function() {
									closeModal();
								} }
							})]
						}),
						content,
						create$5("div", {
							className: "preference__modal-footer",
							children: [button(st("closeDialog"), function() {
								closeModal();
							}, false, "btn-cancel")]
						})
					]
				})]
			});
			rootElement.appendChild(overlay.getElement());
			rootElement.appendChild(dialog.getElement());
			state.modal = {
				mode,
				event,
				detail: null,
				dialog: dialog.getElement(),
				overlay: overlay.getElement(),
				previousFocus
			};
			updateHeader();
			mountDetail();
			dialog.getElement().querySelector(".btn-cancel").focus();
			function mountDetail() {
				var active = state.modal;
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
					createButton,
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
		var config = options || {};
		var item = config.item || {};
		var scope = item.scope === "user" ? "user" : "computer";
		var event = item.scriptEvent || item.event;
		if (EVENTS[scope].indexOf(event) === -1) event = EVENTS[scope][0];
		var closed = false;
		var explorer = null;
		var detailHost = create$5("div", { className: "gpo-editor-scripts__detail-host" });
		var editor = renderScriptEventEditor({
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
		var dialog = open$2(host, {
			title: eventLabel(event),
			className: ["gpo-editor-scripts__event-dialog"],
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
			var filesHost = create$5("div", { className: "gpo-editor-scripts__detail-host" });
			var files = renderScriptEventEditor({
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
		basic: () => __export_basic$21,
		columns: () => __export_columns$17,
		dependencies: () => __export_dependencies$10,
		filters: () => __export_filters$21,
		general: () => __export_general$21
	});
	var __export_basic$21 = [
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
	var __export_general$21 = [
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
	var __export_filters$21 = "general";
	var __export_dependencies$10 = [
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
	var __export_columns$17 = [
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
		basic: () => __export_basic$20,
		columns: () => __export_columns$16,
		dependencies: () => __export_dependencies$9,
		filters: () => __export_filters$20,
		general: () => __export_general$20
	});
	var __export_basic$20 = [
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
	var __export_general$20 = [
		{ field: "metadata.bypassErrors" },
		{ field: "metadata.userContext" },
		{ field: "metadata.removePolicy" },
		{ field: "properties.disabled" },
		{
			field: "metadata.desc",
			textarea: true
		}
	];
	var __export_filters$20 = "general";
	var __export_dependencies$9 = [
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
	var __export_columns$16 = [
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
		basic: () => __export_basic$19,
		filters: () => __export_filters$19,
		general: () => __export_general$19
	});
	var __export_basic$19 = [];
	var __export_general$19 = [
		{ field: "metadata.bypassErrors" },
		{ field: "metadata.userContext" },
		{ field: "metadata.removePolicy" },
		{ field: "properties.disabled" },
		{
			field: "metadata.desc",
			textarea: true
		}
	];
	var __export_filters$19 = "general";
	//#endregion
	//#region src/components/templates/preference/layouts/control-panel.js
	var control_panel_exports = /* @__PURE__ */ __exportAll({
		basic: () => __export_basic$18,
		filters: () => __export_filters$18,
		general: () => __export_general$18
	});
	var __export_basic$18 = [];
	var __export_general$18 = [
		{ field: "metadata.bypassErrors" },
		{ field: "metadata.userContext" },
		{ field: "metadata.removePolicy" },
		{ field: "properties.disabled" },
		{
			field: "metadata.desc",
			textarea: true
		}
	];
	var __export_filters$18 = "general";
	//#endregion
	//#region src/components/templates/preference/layouts/data-sources.js
	var data_sources_exports = /* @__PURE__ */ __exportAll({
		basic: () => __export_basic$17,
		columns: () => __export_columns$15,
		dependencies: () => __export_dependencies$8,
		filters: () => __export_filters$17,
		general: () => __export_general$17
	});
	var __export_basic$17 = [
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
	var __export_general$17 = [
		{ field: "metadata.bypassErrors" },
		{ field: "metadata.userContext" },
		{ field: "metadata.removePolicy" },
		{ field: "properties.disabled" },
		{
			field: "metadata.desc",
			textarea: true
		}
	];
	var __export_filters$17 = "general";
	var __export_dependencies$8 = [{
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
	var __export_columns$15 = [
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
		basic: () => __export_basic$16,
		columns: () => __export_columns$14,
		filters: () => __export_filters$16,
		general: () => __export_general$16
	});
	var __export_basic$16 = [
		{ field: "properties.action" },
		{ line: true },
		{ field: "properties.deviceName" },
		{ field: "properties.deviceAction" },
		{ line: true },
		{ field: "properties.deviceId" },
		{ field: "properties.deviceClass" },
		{ field: "properties.classGuid" }
	];
	var __export_general$16 = [
		{ field: "metadata.bypassErrors" },
		{ field: "metadata.userContext" },
		{ field: "metadata.removePolicy" },
		{ field: "properties.disabled" },
		{
			field: "metadata.desc",
			textarea: true
		}
	];
	var __export_filters$16 = "general";
	var __export_columns$14 = [
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
		basic: () => __export_basic$15,
		columns: () => __export_columns$13,
		filters: () => __export_filters$15,
		general: () => __export_general$15
	});
	var __export_basic$15 = [
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
	var __export_general$15 = [
		{ field: "metadata.bypassErrors" },
		{ field: "metadata.userContext" },
		{ field: "metadata.removePolicy" },
		{ field: "properties.disabled" },
		{
			field: "metadata.desc",
			textarea: true
		}
	];
	var __export_filters$15 = "general";
	var __export_columns$13 = [
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
		basic: () => __export_basic$14,
		columns: () => __export_columns$12,
		dependencies: () => __export_dependencies$7,
		filters: () => __export_filters$14,
		general: () => __export_general$14
	});
	var __export_basic$14 = [
		{ field: "properties.action" },
		{ line: true },
		{ field: "properties.name" },
		{ field: "properties.value" },
		{ line: true },
		{ field: "properties.user" },
		{ field: "properties.partial" }
	];
	var __export_general$14 = [
		{ field: "metadata.bypassErrors" },
		{ field: "metadata.userContext" },
		{ field: "metadata.removePolicy" },
		{ field: "properties.disabled" },
		{
			field: "metadata.desc",
			textarea: true
		}
	];
	var __export_filters$14 = "general";
	var __export_dependencies$7 = [{
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
	var __export_columns$12 = [
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
		basic: () => __export_basic$13,
		columns: () => __export_columns$11,
		dependencies: () => __export_dependencies$6,
		filters: () => __export_filters$13,
		general: () => __export_general$13
	});
	var __export_basic$13 = [
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
	var __export_general$13 = [
		{ field: "metadata.bypassErrors" },
		{ field: "metadata.userContext" },
		{ field: "metadata.removePolicy" },
		{ field: "properties.disabled" },
		{
			field: "metadata.desc",
			textarea: true
		}
	];
	var __export_filters$13 = "general";
	var __export_dependencies$6 = [
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
	var __export_columns$11 = [
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
		basic: () => __export_basic$12,
		filters: () => __export_filters$12,
		general: () => __export_general$12
	});
	var __export_basic$12 = [];
	var __export_general$12 = [
		{ field: "metadata.bypassErrors" },
		{ field: "metadata.userContext" },
		{ field: "metadata.removePolicy" },
		{ field: "properties.disabled" },
		{
			field: "metadata.desc",
			textarea: true
		}
	];
	var __export_filters$12 = "general";
	//#endregion
	//#region src/components/templates/preference/layouts/ini-files.js
	var ini_files_exports = /* @__PURE__ */ __exportAll({
		basic: () => __export_basic$11,
		columns: () => __export_columns$10,
		dependencies: () => __export_dependencies$5,
		filters: () => __export_filters$11,
		general: () => __export_general$11
	});
	var __export_basic$11 = [
		{ field: "properties.action" },
		{ line: true },
		{ field: "properties.path" },
		{ line: true },
		{ field: "properties.section" },
		{ field: "properties.property" },
		{ field: "properties.value" }
	];
	var __export_general$11 = [
		{ field: "metadata.bypassErrors" },
		{ field: "metadata.userContext" },
		{ field: "metadata.removePolicy" },
		{ field: "properties.disabled" },
		{
			field: "metadata.desc",
			textarea: true
		}
	];
	var __export_filters$11 = "general";
	var __export_dependencies$5 = [
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
	var __export_columns$10 = [
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
		basic: () => __export_basic$10,
		filters: () => __export_filters$10,
		general: () => __export_general$10
	});
	var __export_basic$10 = [];
	var __export_general$10 = [
		{ field: "metadata.bypassErrors" },
		{ field: "metadata.userContext" },
		{ field: "metadata.removePolicy" },
		{ field: "properties.disabled" },
		{
			field: "metadata.desc",
			textarea: true
		}
	];
	var __export_filters$10 = "general";
	//#endregion
	//#region src/components/templates/preference/layouts/local-users-and-groups.js
	var local_users_and_groups_exports = /* @__PURE__ */ __exportAll({
		basic: () => __export_basic$9,
		columns: () => __export_columns$9,
		dependencies: () => __export_dependencies$4,
		filters: () => __export_filters$9,
		general: () => __export_general$9
	});
	var __export_basic$9 = [
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
	var __export_general$9 = [
		{ field: "metadata.bypassErrors" },
		{ field: "metadata.userContext" },
		{ field: "metadata.removePolicy" },
		{
			field: "metadata.desc",
			textarea: true
		}
	];
	var __export_filters$9 = "general";
	var __export_dependencies$4 = [
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
	var __export_columns$9 = [
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
		basic: () => __export_basic$8,
		columns: () => __export_columns$8,
		dependencies: () => __export_dependencies$3,
		filters: () => __export_filters$8,
		general: () => __export_general$8
	});
	var __export_basic$8 = [
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
	var __export_general$8 = [
		{ field: "metadata.bypassErrors" },
		{ field: "metadata.userContext" },
		{ field: "metadata.removePolicy" },
		{ field: "properties.disabled" },
		{
			field: "metadata.desc",
			textarea: true
		}
	];
	var __export_filters$8 = "general";
	var __export_dependencies$3 = [
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
	var __export_columns$8 = [
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
		basic: () => __export_basic$7,
		columns: () => __export_columns$7,
		dependencies: () => __export_dependencies$2,
		filters: () => __export_filters$7,
		general: () => __export_general$7
	});
	var __export_basic$7 = [
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
	var __export_general$7 = [
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
	var __export_filters$7 = "general";
	var __export_dependencies$2 = [
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
	var __export_columns$7 = [
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
		basic: () => __export_basic$6,
		columns: () => __export_columns$6,
		filters: () => __export_filters$6,
		general: () => __export_general$6
	});
	var __export_basic$6 = [
		{ field: "properties.element" },
		{ field: "properties.action" },
		{ line: true },
		{ field: "properties.name" }
	];
	var __export_general$6 = [];
	var __export_filters$6 = "basic";
	var __export_columns$6 = [
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
		basic: () => __export_basic$5,
		columns: () => __export_columns$5,
		filters: () => __export_filters$5,
		general: () => __export_general$5
	});
	var __export_basic$5 = [
		{ field: "properties.element" },
		{ field: "properties.action" },
		{ line: true },
		{ field: "properties.path" },
		{ field: "properties.location" },
		{ line: true },
		{ field: "properties.default" },
		{ field: "properties.deleteAll" }
	];
	var __export_general$5 = [
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
	var __export_filters$5 = "general";
	var __export_columns$5 = [
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
		basic: () => __export_basic$4,
		columns: () => __export_columns$4,
		filters: () => __export_filters$4,
		general: () => __export_general$4
	});
	var __export_basic$4 = [
		{ field: "properties.action" },
		{ line: true },
		{ field: "properties.systemLocale" },
		{ field: "properties.userLocale" },
		{ line: true },
		{ field: "properties.inputLocale" },
		{ field: "properties.userInputLocale" }
	];
	var __export_general$4 = [
		{ field: "metadata.bypassErrors" },
		{ field: "metadata.userContext" },
		{ field: "metadata.removePolicy" },
		{
			field: "metadata.desc",
			textarea: true
		}
	];
	var __export_filters$4 = "general";
	var __export_columns$4 = [
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
		basic: () => __export_basic$3,
		columns: () => __export_columns$3,
		dependencies: () => __export_dependencies$1,
		filters: () => __export_filters$3,
		general: () => __export_general$3
	});
	var __export_basic$3 = [
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
	var __export_general$3 = [
		{ field: "metadata.bypassErrors" },
		{ field: "metadata.userContext" },
		{ field: "metadata.removePolicy" },
		{ field: "properties.disabled" },
		{
			field: "metadata.desc",
			textarea: true
		}
	];
	var __export_filters$3 = "general";
	var __export_dependencies$1 = [
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
	var __export_columns$3 = [
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
		basic: () => __export_basic$2,
		columns: () => __export_columns$2,
		dependencies: () => __export_dependencies,
		filters: () => __export_filters$2,
		general: () => __export_general$2
	});
	var __export_basic$2 = [
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
	var __export_general$2 = [];
	var __export_filters$2 = "basic";
	var __export_dependencies = [{
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
	var __export_columns$2 = [
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
		basic: () => __export_basic$1,
		columns: () => __export_columns$1,
		filters: () => __export_filters$1,
		general: () => __export_general$1
	});
	var __export_basic$1 = [
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
	var __export_general$1 = [
		{ field: "metadata.bypassErrors" },
		{ field: "metadata.userContext" },
		{ field: "metadata.removePolicy" },
		{ field: "properties.disabled" },
		{
			field: "metadata.desc",
			textarea: true
		}
	];
	var __export_filters$1 = "general";
	var __export_columns$1 = [
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
		basic: () => __export_basic,
		columns: () => __export_columns,
		filters: () => __export_filters,
		general: () => __export_general
	});
	var __export_basic = [
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
	var __export_general = [
		{ field: "metadata.bypassErrors" },
		{ field: "metadata.userContext" },
		{ field: "metadata.removePolicy" },
		{
			field: "metadata.desc",
			textarea: true
		}
	];
	var __export_filters = "general";
	var __export_columns = [
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
	function copy(value) {
		return clone$2(value);
	}
	function pathKey(path) {
		return JSON.stringify(path);
	}
	function comparePaths(left, right) {
		for (var index = 0; index < Math.min(left.length, right.length); index++) if (left[index] !== right[index]) return left[index] - right[index];
		return left.length - right.length;
	}
	function validIndex(index, length) {
		return Number.isInteger(index) && index >= 0 && index <= length;
	}
	function flattenRoots(roots) {
		var result = [];
		function visit(nodes, parentPath) {
			nodes.forEach(function(node, index) {
				var path = parentPath.concat(index);
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
		var result = null;
		function visit(nodes, parent, parentPath) {
			for (var index = 0; index < nodes.length && !result; index++) {
				var path = parentPath.concat(index);
				var node = nodes[index];
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
		var nodes = roots;
		var depth = 0;
		path.forEach(function(index) {
			var node = nodes[index];
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
		var result = /* @__PURE__ */ new Map();
		var raw = showResult.filter_fields || [];
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
		var raw = showResult.new_filter_fields || {};
		if (Array.isArray(raw)) {
			var entry = raw.find(function(candidate) {
				return candidate.kind === kind;
			});
			if (entry) return entry.fields || [];
		} else if (raw[kind]) return raw[kind];
		var descriptor = (showResult.filter_kinds || []).find(function(candidate) {
			return candidate.kind === kind;
		});
		return descriptor ? descriptor.fields || [] : [];
	}
	function Draft(showResult, restored) {
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
		var fieldsByPath = inventory(this._showResult);
		var nodesByPath = /* @__PURE__ */ new Map();
		var self = this;
		copy(this._showResult.filters || []).sort(function(left, right) {
			return comparePaths(left.path || [], right.path || []);
		}).forEach(function(filter) {
			var path = filter.path;
			if (!Array.isArray(path) || !path.length || !path.every(function(index) {
				return Number.isInteger(index) && index >= 0;
			}) || nodesByPath.has(pathKey(path))) throw new Error("Invalid targeting filter snapshot");
			var descriptor = fieldsByPath.get(pathKey(path)) || {
				fields: filter.fields || [],
				available: Boolean(filter.kind)
			};
			var node = {
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
			var parent = path.length > 1 ? nodesByPath.get(pathKey(path.slice(0, -1))) : null;
			var siblings = parent ? parent.children : self.roots;
			if (path.length > 1 && !parent || path[path.length - 1] !== siblings.length) throw new Error("Invalid targeting filter snapshot");
			siblings.push(node);
			nodesByPath.set(pathKey(path), node);
		});
		this._original = copy(this.roots);
	}
	Draft.prototype.find = function(id) {
		var found = locate(this.roots, id);
		return found ? found.node : null;
	};
	Draft.prototype.clone = function() {
		return new Draft(this._showResult, {
			roots: this.roots,
			original: this._original,
			nextId: this._nextId
		});
	};
	Draft.prototype.flatten = function() {
		return flattenRoots(this.roots);
	};
	Draft.prototype.add = function(kind, parentId, index) {
		var descriptor = this._kinds.get(kind);
		var parent = parentId === null || parentId === void 0 ? null : locate(this.roots, parentId);
		if (!descriptor || parentId !== null && parentId !== void 0 && !parent || parent && !parent.node.supports_children) return null;
		var siblings = parent ? parent.node.children : this.roots;
		var position = index === void 0 || index === null ? siblings.length : index;
		if (!validIndex(position, siblings.length) || (parent ? collectionDepth(this.roots, parent.path) : 0) + (descriptor.supports_children ? 1 : 0) > 64) return null;
		var node = {
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
	};
	Draft.prototype.remove = function(id) {
		var found = locate(this.roots, id);
		if (!found) return false;
		found.siblings.splice(found.index, 1);
		return true;
	};
	/** Both identities are stable; index addresses destination siblings after source removal. */
	Draft.prototype.move = function(id, parentId, index) {
		var source = locate(this.roots, id);
		var parent = parentId === null || parentId === void 0 ? null : locate(this.roots, parentId);
		if (!source || parentId !== null && parentId !== void 0 && !parent || parent && (!parent.node.supports_children || contains(source.node, parentId))) return false;
		var siblings = parent ? parent.node.children : this.roots;
		var length = siblings.length - (siblings === source.siblings ? 1 : 0);
		var position = index === void 0 || index === null ? length : index;
		if (!validIndex(position, length) || (parent ? collectionDepth(this.roots, parent.path) : 0) + subtreeCollectionHeight(source.node) > 64) return false;
		if (siblings === source.siblings && position === source.index) return false;
		source.siblings.splice(source.index, 1);
		siblings.splice(position, 0, source.node);
		return true;
	};
	Draft.prototype.updateFields = function(id, fields) {
		var node = this.find(id);
		if (!node || !node.available || !Array.isArray(fields)) return false;
		var values = new Map(fields.map(function(field) {
			return [field.id, field.value];
		}));
		var changed = false;
		node.fields = node.fields.map(function(field) {
			if (!field.editable || !values.has(field.id) || equal(field.value, values.get(field.id))) return field;
			changed = true;
			return Object.assign({}, field, { value: copy(values.get(field.id)) });
		});
		return changed;
	};
	/** Replacing a kind is an intentional new node; its former descendants are discarded. */
	Draft.prototype.replace = function(id, kind) {
		var source = locate(this.roots, id);
		if (!source || !this._kinds.has(kind)) return null;
		var node = this.add(kind, source.parent ? source.parent.id : null, source.index);
		if (!node) return null;
		this.remove(id);
		return node;
	};
	Draft.prototype.compile = function(options) {
		var opts = options || {};
		var desired = this.flatten();
		var desiredById = new Map(desired.map(function(entry) {
			return [entry.node.id, entry.node];
		}));
		var wanted = new Set(desired.map(function(entry) {
			return entry.node.id;
		}));
		var wantedParents = /* @__PURE__ */ new Map();
		function rememberParents(nodes, parentId) {
			nodes.forEach(function(node) {
				wantedParents.set(node.id, parentId);
				rememberParents(node.children, node.id);
			});
		}
		rememberParents(this.roots, null);
		var errors = [];
		var roots = this.roots;
		desired.forEach(function(entry) {
			var node = entry.node;
			if (collectionDepth(roots, entry.path) > 64) errors.push({
				id: node.id,
				fieldId: null,
				code: "max_depth"
			});
			if (!node.available) return;
			var duplicates = preferenceFieldIds(node.fields).duplicates;
			duplicates.forEach(function(id) {
				errors.push({
					id: node.id,
					fieldId: id,
					code: "duplicate_descriptor"
				});
			});
			var specificErrors = typeof opts.validateNode === "function" ? opts.validateNode(node) : null;
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
				var code = validatePreferenceField(field, field.value);
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
		var working = copy(this._original);
		var originalById = new Map(flattenRoots(this._original).map(function(entry) {
			return [entry.node.id, entry.node];
		}));
		var operations = [];
		function removeAt(found) {
			operations.push({
				op: "remove",
				path: copy(found.path)
			});
			found.siblings.splice(found.index, 1);
		}
		function moveAt(found, parentId, index) {
			var parent = parentId === null ? null : locate(working, parentId);
			var destination = parent ? parent.node.children : working;
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
				var found = locate(working, entry.node.id);
				if (found.parent && wantedParents.get(found.node.id) !== found.parent.id) moveAt(found, null, working.length);
			});
		}
		function reconcile(nodes, parentId) {
			nodes.forEach(function(node, index) {
				var found = locate(working, node.id);
				var parent = parentId === null ? null : locate(working, parentId);
				var siblings = parent ? parent.node.children : working;
				if (!found) {
					operations.push({
						op: "insert",
						collection_path: parent ? copy(parent.path) : [],
						index,
						filter_kind: node.kind,
						fields: preferenceFieldEdits(node.fields, node.fields, false)
					});
					var inserted = copy(node);
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
			var original = originalById.get(entry.node.id);
			var node = desiredById.get(entry.node.id);
			if (!original || !node.available) return;
			var fields = preferenceFieldEdits(original.fields, node.fields, true);
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
	};
	var __export_create = function(showResult) {
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
	var __export_supportedKinds = Object.freeze(Object.keys(kinds));
	var __export_kindLabel = function(kind, fallback, language) {
		return own(kinds, kind) ? localized(kinds[kind], language) : fallback || String(kind || "");
	};
	var __export_fieldLabel = function(kind, id, fallback, language) {
		var label = lookup(fields, kind, id);
		return label ? localized(label, language) : fallback || String(id || "");
	};
	var __export_choices = function(kind, id, language) {
		var values = lookup(enumerations, kind, id);
		return values ? values.map(function(value) {
			return {
				key: value.key,
				label: localized(value.label, language)
			};
		}) : null;
	};
	var __export_numeric = function(kind, id) {
		var value = lookup(numbers, kind, id);
		return value ? {
			min: value.min,
			max: value.max,
			step: value.step
		} : null;
	};
	var __export_isTextarea = function(kind, id) {
		var key = operand(id);
		return kind === "wmi" && key === "query" || kind === "ldap" && key === "searchFilter" || kind === "run_once" && key === "comments" || kind === "registry" && key === "valueData";
	};
	var __export_note = function(kind, language) {
		return own(notes, kind) ? localized(notes[kind], language) : "";
	};
	//#endregion
	//#region src/components/templates/preference/targeting-typed-input.js
	var create$4 = createElement$18;
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
		var type = TYPES[name];
		if (value === "") return [""];
		var parts;
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
		var parts = inputs.map(function(input) {
			return input.value;
		});
		while (parts.length && parts[parts.length - 1] === "") parts.pop();
		return parts.join(separator);
	}
	/** Accept a GUID prefix or a complete GUID, without extracting hex from arbitrary text. */
	function guidValue(value) {
		var body = value, opening = false, closing = false;
		if (body.charAt(0) === "{") {
			opening = true;
			body = body.slice(1);
		}
		if (body.charAt(body.length - 1) === "}") {
			closing = true;
			body = body.slice(0, -1);
		}
		if (!/^[a-f\d-]*$/i.test(body) || body.length > 36 || closing && !opening) return null;
		for (var i = 0; i < body.length; i++) if (body.charAt(i) === "-" && [
			8,
			13,
			18,
			23
		].indexOf(i) === -1) return null;
		var hex = body.replace(/-/g, "");
		if (hex.length > 32 || closing && hex.length !== 32) return null;
		var parts = [], offset = 0;
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
		var formatted = parts.join("-");
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
		var start = input.selectionStart === null ? input.value.length : input.selectionStart;
		var end = input.selectionEnd === null ? start : input.selectionEnd;
		return input.value.slice(0, start) + text + input.value.slice(end);
	}
	function insertedText(before, after) {
		var start = 0;
		while (start < before.length && start < after.length && before.charAt(start) === after.charAt(start)) start++;
		var endBefore = before.length, endAfter = after.length;
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
		var name = options.type;
		var type = TYPES[name];
		if (!type) throw new Error("Unsupported targeting input type: " + name);
		var words = WORDS$1[options.language === "ru" ? "ru" : "en"];
		var label = options.label || words[name];
		var disabled = Boolean(options.disabled);
		var original = options.value === null || options.value === void 0 ? "" : String(options.value);
		var current = original;
		var inputs = [];
		var element = create$4("div", {
			className: ["gpo-targeting-typed-input", "gpo-targeting-typed-input--" + name],
			attrs: {
				role: "group",
				"aria-label": label,
				"aria-disabled": disabled ? "true" : null
			}
		});
		var singleType = name === "guid" || name === "ipv6";
		var parts = singleType ? null : splitSegments(original, name);
		var fallback = name === "guid" ? guidValue(original) === null : name === "ipv6" ? !type.inserted.test(original) : parts === null;
		function emit(value) {
			if (disabled || value === current) return;
			current = value;
			if (typeof options.onChange === "function") options.onChange(value);
		}
		function inputElement(className, inputLabel, size) {
			var input = create$4("input", {
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
			var accepted = original;
			input.value = original;
			function normalized(candidate) {
				if (name === "guid") return guidValue(candidate);
				if (name === "ipv6") return type.inserted.test(candidate) ? candidate : null;
				var parsed = splitSegments(candidate, name);
				if (!parsed) return null;
				while (parsed.length && parsed[parsed.length - 1] === "") parsed.pop();
				return parsed.join(type.separator);
			}
			function accept(candidate, paste) {
				var formatted = normalized(candidate);
				if (formatted === null) {
					if (!isFallback || paste || !type.inserted.test(insertedText(accepted, candidate)) || candidate.length >= accepted.length && normalized(accepted) !== null) return false;
					formatted = candidate;
				}
				var caret = input.selectionStart;
				var atEnd = caret === input.value.length;
				var hexBefore = name === "guid" && caret !== null ? (input.value.slice(0, caret).match(/[a-f\d]/gi) || []).length : 0;
				input.value = formatted;
				accepted = formatted;
				if (atEnd || paste) input.setSelectionRange(formatted.length, formatted.length);
				else if (name === "guid" && caret !== null) {
					var position = 0, seen = 0;
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
				var start = input.selectionStart, end = input.selectionEnd;
				if (start === null || end === null) return false;
				var hex = input.value.replace(/[{}-]/g, "");
				if (!hex.length) {
					accept("", false);
					input.setSelectionRange(0, 0);
					return true;
				}
				var before = (input.value.slice(0, start).match(/[a-f\d]/gi) || []).length;
				var after = (input.value.slice(0, end).match(/[a-f\d]/gi) || []).length;
				var backward = /Backward$/.test(inputType);
				if (before === after) {
					if (backward) before--;
					else after++;
				}
				if (before < 0 || after > hex.length) return true;
				var remaining = hex.slice(0, before) + hex.slice(after);
				accept(remaining && input.value.charAt(0) === "{" ? "{" + remaining : remaining, false);
				var position = 0, seen = 0;
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
				var candidate = replaceSelection(input, event.data);
				if (!type.inserted.test(event.data) || !isFallback && normalized(candidate) === null) event.preventDefault();
			});
			input.addEventListener("input", function() {
				if (disabled || !type.inserted.test(insertedText(accepted, input.value)) || !accept(input.value, false)) input.value = accepted;
			});
			input.addEventListener("paste", function(event) {
				event.preventDefault();
				if (disabled || !event.clipboardData) return;
				var text = event.clipboardData.getData("text/plain");
				if (!type.inserted.test(text)) return;
				var whole = normalized(text);
				accept((name === "guid" ? whole && /^\{[a-f\d]{8}(?:-[a-f\d]{4}){3}-[a-f\d]{12}\}$/i.test(whole) : name === "ipv6" ? whole && whole.indexOf(":") !== -1 : whole && splitSegments(text, name).length === type.count) ? text : replaceSelection(input, text), true);
			});
		}
		if (fallback || singleType) bindSingle(inputElement(fallback ? "gpo-targeting-typed-input__fallback" : ["gpo-targeting-typed-input__segment", "gpo-targeting-typed-input__full"], fallback ? label + ", " + words.saved : label, name === "guid" ? 38 : name === "ipv6" ? 39 : void 0), fallback);
		else {
			var segmentName = name === "ipv4" ? words.octet : name === "mac" ? words.byte : words.component;
			for (var index = 0; index < type.count; index++) {
				if (index) element.append(create$4("span", {
					className: "gpo-targeting-typed-input__separator",
					attrs: { "aria-hidden": "true" },
					text: type.separator
				}));
				var segment = inputElement("gpo-targeting-typed-input__segment", label + ", " + segmentName + " " + (index + 1) + " " + words.of + " " + type.count, type.length);
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
				var text = event.clipboardData.getData("text/plain");
				if (!(text.indexOf(type.separator) !== -1 || name === "mac" && (text.indexOf("-") !== -1 || text.length > type.length))) {
					var local = replaceSelection(input, text);
					if (!validSegment(local, type)) return;
					input.value = local;
					focusEnd(input);
					commit();
					return;
				}
				var pasted = splitSegments(text, name);
				if (!pasted) return;
				var start = pasted.length === type.count ? 0 : index;
				if (start + pasted.length > type.count) return;
				for (var i = start; i < type.count; i++) inputs[i].value = pasted[i - start] || "";
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
	//#region src/components/templates/preference/targeting-operand-editor.js
	/** RSAT-style operand forms. Common boolean operators belong to the parent toolbar. */
	var create$3 = createElement$18;
	var nextInputId = 1;
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
		var field = fieldOf(fields, id);
		return field ? valuePayload(field.value) : null;
	}
	function assign(fields, id, value) {
		var field = fieldOf(fields, id);
		if (!field || field.editable === false) return;
		var envelope = clone$2(field.value);
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
		var names;
		try {
			names = typeof Intl.DisplayNames === "function" ? new Intl.DisplayNames([language], { type: "language" }) : null;
		} catch (_) {
			names = null;
		}
		return (field && field.choices || []).filter(function(choice) {
			return choice.key !== "unknown";
		}).map(function(choice) {
			var text;
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
		var fields = clone$2(node.fields || []);
		if (node.originalPath) return fields;
		var language = options && options.language === "ru" ? "ru" : "en";
		var scope = options && options.scope || "computer";
		var now = today();
		function empty(id, value) {
			var old = raw(fields, id);
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
			case "language":
				var localeField = fieldOf(fields, "filter.languageLocale");
				if (localeField) {
					var available = languageChoices(localeField, language);
					var chosen = available.find(function(choice) {
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
				var value = Math.floor(Math.random() * 16);
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
		var fields = node.fields || [];
		var ids = SIMPLE[node.kind];
		if (node.kind === "date") {
			var period = raw(fields, "filter.period");
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
			var subtype = raw(fields, "filter.subtype");
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
			var type = raw(fields, "filter.type") || "KEYEXISTS";
			var regSubtype = raw(fields, "filter.subtype") || "EQUALHEX";
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
			var option = raw(fields, "filter.option");
			ids = ["type", "option"].concat(option === "IP" ? ["min", "max"] : option === "NE" ? [] : ["value"]);
		} else if (node.kind === "user") ids = raw(fields, "filter.sid") ? ["sid"] : ["name"];
		return (ids || []).map(function(id) {
			return "filter." + id;
		});
	}
	function ipv4(value) {
		if (!/^(0|[1-9]\d{0,2})(\.(0|[1-9]\d{0,2})){3}$/.test(String(value))) return null;
		var parts = String(value).split(".").map(Number);
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
		var text = String(value);
		if (text.indexOf(":") === -1) return null;
		if (text.indexOf(".") !== -1) {
			var tailIndex = text.lastIndexOf(":"), tail = text.slice(tailIndex + 1);
			if (ipv4(tail) === null) return null;
			var bytes = tail.split(".").map(Number);
			text = text.slice(0, tailIndex + 1) + (bytes[0] * 256 + bytes[1]).toString(16) + ":" + (bytes[2] * 256 + bytes[3]).toString(16);
		}
		if (!/^[a-f\d:]+$/i.test(text)) return null;
		var halves = text.split("::");
		if (halves.length > 2) return null;
		var left = halves[0] ? halves[0].split(":") : [], right = halves.length === 2 && halves[1] ? halves[1].split(":") : [];
		if (!left.concat(right).every(function(part) {
			return /^[a-f\d]{1,4}$/i.test(part);
		})) return null;
		var gap = 8 - left.length - right.length;
		if (halves.length === 1 && gap !== 0 || halves.length === 2 && gap < 1) return null;
		return left.concat(halves.length === 2 ? Array(gap).fill("0") : [], right).map(function(part) {
			return parseInt(part, 16);
		});
	}
	function version(value) {
		if (!/^\d+(\.\d+){0,3}$/.test(String(value))) return null;
		var parts = String(value).split(".").map(Number);
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
		for (var i = 0; i < left.length; i++) if (left[i] !== right[i]) return left[i] - right[i];
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
		var match = /^(\d{2}):(\d{2}):(\d{2})(?:\.(\d+))?(Z|[+-]\d{2}:\d{2})?$/.exec(String(value));
		if (!match || Number(match[1]) > 24 || Number(match[2]) > 59 || Number(match[3]) > 59) return false;
		if (Number(match[1]) === 24 && (Number(match[2]) || Number(match[3]) || match[4] && /[1-9]/.test(match[4]))) return false;
		if (match[5] && match[5] !== "Z") {
			var offset = match[5].slice(1).split(":").map(Number);
			if (offset[0] > 14 || offset[1] > 59 || offset[0] === 14 && offset[1]) return false;
		}
		return true;
	}
	/** Validate active, deliberately edited operands; tolerate untouched legacy representations. */
	function validateFields(node) {
		if (!node || node.available === false) return [];
		var fields = node.fields || [];
		var active = activeIds(node);
		var original = node._operandState && node._operandState.original;
		var fresh = !node.originalPath;
		var errors = [];
		function changed(id) {
			if (fresh) return true;
			var before = original && fieldOf(original, id), after = fieldOf(fields, id);
			return Boolean(before && after && !equal(before.value, after.value));
		}
		var modeChanged = [
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
			var field = fieldOf(fields, id);
			if (!field || field.editable === false || !check(id) || isCommon(id)) return;
			var descriptor = field;
			if (node.kind === "dun" && id === "filter.type") descriptor = Object.assign({}, field, { required: false });
			var generic = validatePreferenceField(descriptor, field.value);
			if (generic) add(id, generic);
			var value = raw(fields, id), numeric = __export_numeric(node.kind, id);
			if (numeric && value !== null && value !== "" && (!/^\d+$/.test(String(value)) || !Number.isSafeInteger(Number(value)) || Number(value) < numeric.min || Number(value) > numeric.max)) add(id, "invalid_number");
			var choices = __export_choices(node.kind, id, "en");
			if (choices && value !== null && !choices.some(function(choice) {
				return String(choice.key) === String(value);
			})) add(id, "invalid_value");
		});
		function pair(parser, code, optional) {
			var min = raw(fields, "filter.min"), max = raw(fields, "filter.max");
			var parsedMin = min === null || min === "" ? null : parser(min), parsedMax = max === null || max === "" ? null : parser(max);
			if (check("filter.min") && (!optional && parsedMin === null || min !== null && min !== "" && parsedMin === null)) add("filter.min", !optional && !min ? "required" : code);
			if (check("filter.max") && (!optional && parsedMax === null || max !== null && max !== "" && parsedMax === null)) add("filter.max", !optional && !max ? "required" : code);
			if ((check("filter.min") || check("filter.max")) && parsedMin !== null && parsedMax !== null && (Array.isArray(parsedMin) ? compare(parsedMin, parsedMax) : parsedMin - parsedMax) > 0) add("filter.max", "invalid_range");
		}
		if (node.kind === "ip_range" && raw(fields, "filter.useIPv6") === true) {
			if (check("filter.min") && ipv6(raw(fields, "filter.min")) === null) add("filter.min", !raw(fields, "filter.min") ? "required" : "invalid_ipv6");
			var prefix = raw(fields, "filter.max");
			if (check("filter.max") && (!/^\d+$/.test(String(prefix)) || Number(prefix) > 128)) add("filter.max", prefix === null || prefix === "" ? "required" : "invalid_number");
		} else if (node.kind === "ip_range" || node.kind === "terminal" && raw(fields, "filter.option") === "IP") pair(ipv4, "invalid_ip", false);
		if (node.kind === "mac_range") pair(mac, "invalid_mac", false);
		if (node.kind === "file" && raw(fields, "filter.type") === "VERSION" || node.kind === "msi" && raw(fields, "filter.subtype") === "VERSION" || node.kind === "registry" && raw(fields, "filter.type") === "MATCHVALUE" && raw(fields, "filter.subtype") === "VERSION") pair(version, "invalid_version", true);
		if (node.kind === "time") ["filter.begin", "filter.end"].forEach(function(id) {
			if (check(id) && !validTime(raw(fields, id))) add(id, "invalid_time");
		});
		if (node.kind === "msi" || node.kind === "run_once") {
			var guidId = node.kind === "msi" ? "filter.code" : "filter.id", guid = raw(fields, guidId);
			if (changed(guidId) && guid && !/^(?:[a-f\d]{8}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{12}|\{[a-f\d]{8}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{12}\})$/i.test(String(guid))) add(guidId, "invalid_guid");
		}
		if (node.kind === "date") {
			var period = raw(fields, "filter.period"), day = raw(fields, "filter.day"), month = raw(fields, "filter.month"), year = raw(fields, "filter.year");
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
	function render$2(options) {
		var node = options.node;
		var kind = node.kind;
		var language = options.language === "ru" ? "ru" : "en";
		var words = WORDS[language];
		var scope = options.scope || "computer";
		var blocked = Boolean(options.blocked || node.available === false);
		var state = stateOf(node);
		var working = clone$2(node.fields || []);
		var controls = [];
		var renderGeneration = 0;
		var container = create$3("div", {
			className: "gpo-editor-targeting-operands",
			attrs: { "data-targeting-kind": kind }
		});
		var inputRecords = [];
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
			return __export_fieldLabel(kind, id, fallback || id, language);
		}
		function register(id, element, input, error, reader) {
			var record = {
				id,
				read: function() {
					capture();
					var field = fieldOf(working, id);
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
			var settings = extra || {};
			var generation = renderGeneration;
			var inputId = "gpo-targeting-operand-" + nextInputId++;
			var input = create$3(type === "select" ? "select" : type === "textarea" ? "textarea" : "input", {
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
					return create$3("option", {
						attrs: { value: choice.key },
						text: choice.label
					});
				}) : []
			});
			var dom = input.getElement();
			if (type === "checkbox") dom.checked = Boolean(initial);
			else dom.value = initial === null || initial === void 0 ? "" : String(initial);
			var error = create$3("span", { className: "gpo-editor-field__error" });
			var body = type === "checkbox" ? create$3("span", {
				className: "gpo-editor-boolean",
				children: [input, create$3("label", { attrs: { for: inputId } })]
			}) : input;
			var element = create$3("div", {
				className: [
					"field",
					type === "checkbox" ? "field__checkbox" : "field__input",
					"gpo-editor-field",
					type === "textarea" ? "field__description" : null
				],
				attrs: { "data-field-id": id },
				children: [create$3("div", {
					className: "field__label",
					children: [create$3("label", {
						attrs: { for: inputId },
						text
					})]
				}), create$3("div", {
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
			var field = fieldOf(working, id);
			if (!field || isCommon(id) || field.hidden) return;
			var generation = renderGeneration;
			var opts = settings || {};
			var displayed = clone$2(field);
			displayed.label = opts.label || label(id, field.label);
			var type = semanticType(kind, id, value("filter.useIPv6") === true);
			if (type) {
				var error = create$3("span", { className: "gpo-editor-field__error" });
				var control = render$3({
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
				var element = create$3("div", {
					className: [
						"field",
						"field__input",
						"gpo-editor-field",
						"gpo-editor-field--typed"
					],
					attrs: { "data-field-id": id },
					children: [create$3("div", {
						className: "field__label",
						children: [create$3("label", {
							attrs: { for: control.inputs[0].id },
							text: displayed.label
						})]
					}), create$3("div", {
						className: "field__element",
						children: [control.element, error]
					})]
				});
				var registered = register(id, element, control.inputs[0], error);
				var setError = registered.setError;
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
			var choices = opts.choices || __export_choices(kind, id, language);
			var booleanChoice = Boolean(choices && (field.value.kind === "boolean" || field.value.kind === "optional_boolean"));
			if (choices) {
				choices = clone$2(choices);
				var current = value(id);
				if (current !== null && current !== void 0 && !choices.some(function(choice) {
					return String(choice.key) === String(current);
				})) choices.unshift({
					key: String(current),
					label: words.saved + String(current)
				});
				displayed.control = "choice";
				displayed.choices = choices;
				if (current === null || current === void 0) displayed.value.value = opts.defaultKey !== void 0 ? opts.defaultKey : choices.length ? choices[0].key : "";
				if (booleanChoice) displayed.value = {
					kind: "text",
					value: current === null || current === void 0 ? String(opts.defaultKey || "false") : String(Boolean(current))
				};
			}
			if (__export_isTextarea(kind, id)) {
				var old = clone$2(field.value);
				custom(id, displayed.label, "textarea", valuePayload(old), function(next) {
					var nextValue = clone$2(old);
					nextValue.value = old.kind === "optional_text" && next === "" ? null : next;
					fieldOf(working, id).value = nextValue;
				}, { disabled: field.editable === false || opts.disabled });
				return;
			}
			var force = blocked || opts.disabled;
			var fieldControl = options.fieldControl(displayed, force, false, {
				wrapSelect: true,
				wrapCheckbox: true,
				wrapText: true
			});
			var input = fieldControl.element.getElement().querySelector("input,select,textarea");
			if (!input) {
				container.append(fieldControl.element);
				return;
			}
			input.setAttribute("aria-label", displayed.label);
			if (opts.hint) input.setAttribute("title", opts.hint);
			if (opts.hintId) input.setAttribute("aria-describedby", opts.hintId);
			var numeric = opts.numeric || __export_numeric(kind, id);
			if (numeric && input.tagName === "INPUT") {
				input.type = "number";
				input.min = numeric.min;
				input.max = numeric.max;
				input.step = numeric.step || 1;
			}
			if (opts.inlineHint) {
				var hintId = "gpo-targeting-hint-" + nextInputId++;
				input.classList.add("gpo-targeting-prefix");
				input.setAttribute("aria-describedby", hintId);
				input.parentNode.appendChild(create$3("span", {
					className: "gpo-editor-field__hint gpo-targeting-prefix__hint",
					attrs: { id: hintId },
					text: opts.inlineHint
				}).getElement());
			}
			var isTime = kind === "time" && (id === "filter.begin" || id === "filter.end");
			if (isTime) {
				input.type = "time";
				input.step = "60";
				input.value = /^\d{2}:\d{2}/.test(String(value(id))) ? String(value(id)).slice(0, 5) : "";
			}
			var touched = false;
			var originalRead = fieldControl.read;
			function captureOne() {
				if (generation !== renderGeneration || !touched || force || field.editable === false) return;
				var next = originalRead();
				if (booleanChoice) {
					var booleanValue = clone$2(field.value);
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
			var previous = state.dateMode || value("filter.period");
			state.dates[previous] = dateParts(working);
			set("filter.period", next);
			var cached = state.dates[next] || {}, now = today();
			set("filter.dow", next === "WEEKLY" ? cached.dow || weekday(now) : null);
			set("filter.day", next === "MONTHLY" || next === "YEARLY" ? cached.day || now.getDate() : null);
			set("filter.month", next === "YEARLY" ? cached.month || now.getMonth() + 1 : null);
			set("filter.year", next === "YEARLY" ? cached.year !== void 0 ? cached.year : String(now.getFullYear()) : null);
			state.dateMode = next;
		}
		function calendar() {
			var month = Number(value("filter.month")) || today().getMonth() + 1;
			var selected = Number(value("filter.day"));
			var locale = language === "ru" ? "ru-RU" : "en-US";
			var choices = Array.from({ length: 12 }, function(_, index) {
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
			var board = create$3("div", {
				className: "gpo-editor-targeting-calendar",
				attrs: {
					role: "group",
					"aria-label": words.calendar,
					"data-field-id": "filter.day"
				}
			});
			var days = create$3("div", { className: "gpo-editor-targeting-calendar__days" });
			var firstButton;
			for (var day = 1; day <= daysInMonth(month, 2024); day++) (function(number) {
				var button = create$3("button", {
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
			var error = create$3("span", { className: "gpo-editor-field__error" });
			board.append(days);
			board.append(error);
			container.append(board);
			register("filter.day", board, firstButton, error);
		}
		function dateForm() {
			state.dateMode = value("filter.period");
			ordinary("filter.period", { onChange: dateMode });
			var period = value("filter.period");
			if (period === "WEEKLY") ordinary("filter.dow");
			if (period === "MONTHLY") ordinary("filter.day", { choices: Array.from({ length: 31 }, function(_, i) {
				return {
					key: String(i + 1),
					label: String(i + 1)
				};
			}) });
			if (period !== "YEARLY") return;
			var annual = value("filter.year") === null;
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
				var day = value("filter.day"), month = value("filter.month"), year = value("filter.year");
				var formatted = year && month && day ? String(year).padStart(4, "0") + "-" + String(month).padStart(2, "0") + "-" + String(day).padStart(2, "0") : "";
				var dateControl = custom("filter.day", words.date, "date", formatted, function(next) {
					var parts = /^(\d{4,5})-(\d{2})-(\d{2})$/.exec(next);
					set("filter.year", parts ? parts[1] : null);
					set("filter.month", parts ? Number(parts[2]) : null);
					set("filter.day", parts ? Number(parts[3]) : null);
				}, {
					min: "0001-01-01",
					max: "65535-12-31"
				});
				var dateError = controls[controls.length - 1].setError;
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
			var type = value("filter.type") || "EXISTS";
			var mode = type === "VERSION" ? "VERSION" : value("filter.folder") ? "FOLDER" : "FILE";
			var choices = [
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
			var field = fieldOf(working, "filter.languageLocale");
			if (field) {
				var choices = languageChoices(field, language);
				ordinary(field.id, {
					choices,
					onChange: function(next) {
						var choice = choices.find(function(candidate) {
							return candidate.key === next;
						});
						if (choice) set("filter.displayName", choice.label);
					}
				});
				if (value(field.id) === "unknown") container.append(create$3("div", {
					className: "gpo-editor-preference-notice",
					text: words.broken
				}));
			}
			var hintId = scope === "computer" ? "gpo-targeting-hint-" + nextInputId++ : null;
			ordinary("filter.default", {
				disabled: scope === "computer",
				hint: scope === "computer" ? words.userLanguageScope : null,
				hintId
			});
			ordinary("filter.system");
			ordinary("filter.native");
			if (scope === "computer") container.append(create$3("div", {
				className: "gpo-editor-field__hint gpo-targeting-language__hint",
				attrs: { id: hintId },
				text: words.userLanguageScope
			}));
		}
		function ipRangeForm() {
			var v6 = value("filter.useIPv6") === true;
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
					var mode = next ? "ipv6" : "ipv4";
					var cached = state.ipRanges[mode] || {
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
			var type = value("filter.type") || "KEYEXISTS", subtype = value("filter.subtype") || "EQUALHEX";
			var mode = type === "MATCHVALUE" ? subtype : type;
			var modes = [
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
				var match = [
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
			var defaultName = value("filter.valueName") === "";
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
			var mode = state.userMode || (value("filter.sid") ? "sid" : "name");
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
			var annual = kind === "date" && value("filter.period") === "YEARLY" && value("filter.year") === null;
			var enteringAnnual = annual && !state.calendarActive;
			state.calendarActive = annual;
			var active = document.activeElement;
			var focusedField = container.getElement().contains(active) && active.closest("[data-field-id]");
			var focusedId = focusedField && focusedField.getAttribute("data-field-id");
			var focusedDay = focusedId && active.getAttribute("data-calendar-day");
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
				var subtype = value("filter.subtype");
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
			var note = __export_note(kind, language);
			if (note) container.append(create$3("div", {
				className: "gpo-editor-field__hint gpo-editor-targeting-operands__note",
				text: note
			}));
			if (focusedId) {
				var focusedContainer = Array.from(container.getElement().querySelectorAll("[data-field-id]")).find(function(element) {
					return element.getAttribute("data-field-id") === focusedId;
				});
				var replacement = focusedContainer && (focusedDay && focusedContainer.querySelector("[data-calendar-day=\"" + focusedDay + "\"]") || focusedContainer.querySelector("[aria-pressed=\"true\"],input,select,textarea,button"));
				if (replacement && !replacement.disabled) replacement.focus({ preventScroll: true });
				else {
					var fallback = container.getElement().querySelector("input:not(:disabled),select:not(:disabled),textarea:not(:disabled),button:not(:disabled)");
					if (fallback) fallback.focus({ preventScroll: true });
				}
			}
			var pane = container.getElement().closest(".gpo-editor-filters__fields");
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
	//#region src/components/templates/preference/targeting-editor.js
	var create$2 = createElement$18;
	function render$1(options) {
		var pt = options.pt;
		var readonly = Boolean(options.readonly);
		var formState = options.formState;
		var kinds = options.showResult.filter_kinds || [];
		var accepted = __export_create(options.showResult);
		var draft = accepted.clone();
		var selectedId = null;
		var selectedControls = [];
		var selectedOperands = null;
		var combineTouched = false;
		var notTouched = false;
		var language = options.language || "en";
		var collapsed = /* @__PURE__ */ new Set();
		var errorIds = /* @__PURE__ */ new Set();
		var dragId = null;
		var dropTarget = null;
		var navigation = null;
		var container = create$2("div", { className: "gpo-editor-filters" });
		var toolbar = create$2("div", { className: "gpo-editor-filters__toolbar" });
		var notice = create$2("div", {
			className: "gpo-editor-filters__notice",
			attrs: {
				role: "status",
				"aria-live": "polite"
			}
		});
		var tree = create$2("div", {
			className: "gpo-editor-filters__tree",
			attrs: {
				role: "tree",
				"aria-label": pt("targettingTitle")
			}
		});
		var properties = create$2("div", { className: "gpo-editor-filters__fields" });
		var menu = create$2("div", {
			className: "gpo-editor-filters__menu",
			attrs: {
				role: "menu",
				hidden: "hidden"
			}
		});
		var collectionKind = kinds.find(function(kind) {
			return kind.supports_children || kind.kind === "collection";
		});
		var createButton = create$2("button", {
			className: ["button", "gpo-editor-filter-add"],
			attrs: {
				type: "button",
				"aria-haspopup": "menu",
				"aria-expanded": "false"
			},
			text: pt("createTargetingItem") + " ▾"
		});
		var addCollection = create$2("button", {
			className: "button",
			attrs: { type: "button" },
			text: pt("addTargetingCollection")
		});
		var combineSelect = create$2("select", {
			attrs: { "aria-label": pt("targetingOperator") },
			children: [create$2("option", {
				attrs: { value: "and" },
				text: pt("targetingAnd")
			}), create$2("option", {
				attrs: { value: "or" },
				text: pt("targetingOr")
			})]
		});
		var notCheckbox = create$2("input", { attrs: {
			type: "checkbox",
			"aria-label": pt("targetingNot")
		} });
		var removeButton = create$2("button", {
			className: ["button", "gpo-editor-filter-remove"],
			attrs: {
				type: "button",
				"aria-label": pt("removeFilter"),
				title: pt("removeFilter")
			},
			children: [create$2("span", {
				attrs: { "aria-hidden": "true" },
				html: "<svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.6\"><path d=\"M3 6h18M9 6V3h6v3M6 6l1 15h10l1-15M10 10v7M14 10v7\"/></svg>"
			})]
		});
		var shortcutHelp = create$2("span", {
			className: "gpo-editor-visually-hidden",
			id: "gpo-targeting-shortcuts",
			text: pt("targetingKeyboardHelp")
		});
		tree.setAttr("aria-describedby", "gpo-targeting-shortcuts");
		function blocked() {
			return readonly || formState.busy;
		}
		function locate(id, nodes, parent) {
			var list = nodes || draft.roots;
			for (var i = 0; i < list.length; i += 1) {
				if (list[i].id === id) return {
					node: list[i],
					parent: parent || null,
					siblings: list,
					index: i
				};
				var child = locate(id, list[i].children, list[i]);
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
			var location = locate(selectedId);
			var node = location && location.node;
			if (!node || !node.available) return;
			var operands = new Map((selectedOperands ? selectedOperands.readFields() : []).map(function(field) {
				return [field.id, field];
			}));
			var common = [
				"filter.bool",
				"filter.not",
				"filter.combine",
				"filter.negate",
				"filter.hidden"
			];
			draft.updateFields(node.id, node.fields.map(function(current) {
				var field = common.indexOf(current.id) === -1 && operands.has(current.id) ? operands.get(current.id) : current;
				var value = clone$2(field.value);
				if (combineTouched && location.index > 0 && (field.id === "filter.bool" || field.id === "filter.combine") && field.editable !== false) value.value = combineSelect.getElement().value;
				if (notTouched && (field.id === "filter.not" || field.id === "filter.negate") && field.editable !== false) value.value = notCheckbox.getElement().checked;
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
			removeButton.getElement().disabled = blocked() || !selectedId;
			var location = locate(selectedId);
			var node = location && location.node;
			var combine = node && node.fields.find(function(field) {
				return field.id === "filter.bool" || field.id === "filter.combine";
			});
			var negate = node && node.fields.find(function(field) {
				return field.id === "filter.not" || field.id === "filter.negate";
			});
			combineSelect.getElement().disabled = blocked() || !node || location.index === 0 || !node.available || !combine || combine.editable === false;
			notCheckbox.getElement().disabled = blocked() || !node || !node.available || !negate || negate.editable === false;
			combineSelect.getElement().value = combine ? valuePayload(combine.value) : "and";
			notCheckbox.getElement().checked = Boolean(negate && valuePayload(negate.value));
			combineTouched = false;
			notTouched = false;
		}
		function focusNode(id) {
			var row = Array.from(tree.getElement().querySelectorAll("[data-targeting-id]")).find(function(element) {
				return element.getAttribute("data-targeting-id") === id;
			});
			if (row) {
				row.focus({ preventScroll: true });
				row.scrollIntoView({ block: "nearest" });
			}
		}
		function select(id, focus) {
			capture();
			selectedId = id;
			var current = locate(id);
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
			if (selectedId !== id) select(id);
			var control = properties.getElement().querySelector("input:not(:disabled),select:not(:disabled),textarea:not(:disabled),button:not(:disabled),[contenteditable=\"true\"]");
			if (control) control.focus({ preventScroll: true });
			else {
				properties.setAttr("tabindex", "-1");
				properties.getElement().focus({ preventScroll: true });
			}
		}
		function fieldPayload(node, id) {
			var field = node.fields.find(function(candidate) {
				return candidate.id === id;
			});
			return field ? valuePayload(field.value) : null;
		}
		function summary(node) {
			if (node.kind === "ip_range" && fieldPayload(node, "filter.useIPv6") === true) {
				var address = fieldPayload(node, "filter.min"), prefix = fieldPayload(node, "filter.max");
				return address ? address + (prefix === null || prefix === void 0 || prefix === "" ? "" : "/" + prefix) : "";
			}
			var common = [
				"filter.bool",
				"filter.not",
				"filter.combine",
				"filter.negate",
				"filter.hidden",
				"filter.displayName",
				"filter.useIPv6"
			];
			var values = node.fields.filter(function(field) {
				return common.indexOf(field.id) === -1 && field.editable;
			}).map(function(field) {
				var value = valuePayload(field.value);
				var choice = (__export_choices(node.kind, field.id, language) || field.choices || []).find(function(candidate) {
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
		function clearDrop() {
			tree.getElement().querySelectorAll(".targeting-drop-before, .targeting-drop-after, .targeting-drop-inside, .targeting-drop-invalid").forEach(function(row) {
				row.classList.remove("targeting-drop-before", "targeting-drop-after", "targeting-drop-inside", "targeting-drop-invalid");
			});
			dropTarget = null;
		}
		function endDrag() {
			clearDrop();
			dragId = null;
			container.removeClass("is-dragging");
		}
		function destination(node, event, row) {
			var box = row.getBoundingClientRect();
			var offset = (event.clientY - box.top) / Math.max(1, box.height);
			var where = node.supports_children && offset > .25 && offset < .75 ? "inside" : offset > .5 ? "after" : "before";
			var location = locate(node.id);
			var parent = where === "inside" ? node : location.parent;
			var index = where === "inside" ? node.children.length : location.index + (where === "after" ? 1 : 0);
			var source = locate(dragId);
			if (source && source.parent === parent && source.index < index) index -= 1;
			return {
				parentId: parent && parent.id,
				index,
				where,
				valid: Boolean(source && node.id !== dragId && (!parent || !descendant(source.node, parent.id)))
			};
		}
		function applyMove(parentId, index) {
			if (blocked() || !selectedId) return;
			capture();
			try {
				var source = locate(selectedId);
				var noop = source && (source.parent && source.parent.id || null) === (parentId || null) && source.index === index;
				var changed = draft.move(selectedId, parentId, index);
				if (parentId) collapsed.delete(parentId);
				setNotice(changed ? pt("targetingMoved") : noop ? "" : pt("targetingDepthLimit"));
				renderTree();
				syncToolbar();
				focusNode(selectedId);
			} catch (_) {
				setNotice(pt("invalidTargetingMove"));
			}
		}
		function renderTree() {
			tree.getElement().innerHTML = "";
			var first = true;
			function append(nodes, depth) {
				nodes.forEach(function(node, index) {
					var combine = String(fieldPayload(node, "filter.bool") || fieldPayload(node, "filter.combine") || node.combine || "and").toLowerCase();
					var logic = index === 0 ? "" : pt(combine === "or" ? "targetingOr" : "targetingAnd") + " ";
					var negate = fieldPayload(node, "filter.not");
					if (negate === null || negate === void 0) negate = fieldPayload(node, "filter.negate");
					if (negate === null || negate === void 0) negate = node.negate;
					if (negate) logic += pt("targetingNot") + " ";
					var row = create$2("div", {
						className: [
							"gpo-editor-filter-node",
							node.id === selectedId ? "active" : null,
							fieldPayload(node, "filter.hidden") ? "is-hidden-filter" : null,
							errorIds.has(node.id) ? "gpo-editor-filter-node--error" : null
						],
						attrs: {
							role: "treeitem",
							"data-targeting-id": node.id,
							"aria-level": depth + 1,
							"aria-selected": String(node.id === selectedId),
							"aria-expanded": node.supports_children ? String(!collapsed.has(node.id)) : null,
							tabindex: node.id === selectedId || !selectedId && first ? "0" : "-1"
						},
						style: { paddingLeft: depth * 18 + 4 + "px" }
					});
					first = false;
					var handle = create$2("button", {
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
						selectedId = node.id;
						dragId = node.id;
						dropTarget = null;
						renderFields();
						syncToolbar();
						tree.getElement().querySelectorAll("[data-targeting-id]").forEach(function(element) {
							var selected = element.getAttribute("data-targeting-id") === node.id;
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
					var arrow = create$2("button", {
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
							if (selectedId && selectedId !== node.id && descendant(node, selectedId)) {
								selectedId = node.id;
								renderFields();
								syncToolbar();
							}
						}
						renderTree();
						focusNode(selectedId || node.id);
					});
					row.append(arrow);
					row.append(create$2("span", {
						className: ["gpo-editor-filter-icon", __export_targeting(node.supports_children ? "collection" : node.kind)],
						attrs: { "aria-hidden": "true" }
					}));
					row.append(create$2("span", {
						className: "gpo-editor-filter-label",
						children: [create$2("span", { text: logic + nodeLabel(node) }), create$2("span", {
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
						if (!dragId || blocked()) return;
						event.preventDefault();
						event.stopPropagation();
						clearDrop();
						dropTarget = destination(node, event, row.getElement());
						event.dataTransfer.dropEffect = dropTarget.valid ? "move" : "none";
						row.addClass(dropTarget.valid ? "targeting-drop-" + dropTarget.where : "targeting-drop-invalid");
					});
					row.on("drop", function(event) {
						if (!dragId || !dropTarget) return;
						event.preventDefault();
						event.stopPropagation();
						var target = dropTarget;
						selectedId = dragId;
						if (target.valid) applyMove(target.parentId, target.index);
						else setNotice(pt("invalidTargetingMove"));
						endDrag();
					});
					tree.append(row);
					if (!collapsed.has(node.id)) append(node.children, depth + 1);
				});
			}
			append(draft.roots, 0);
			if (!draft.roots.length) tree.append(create$2("div", {
				className: "gpo-editor-filters__empty",
				text: pt("targetingEmpty")
			}));
			var rootDrop = create$2("div", {
				className: "gpo-editor-filters__root-drop",
				text: pt("targetingRootDrop")
			});
			rootDrop.on("dragover", function(event) {
				if (!dragId || blocked()) return;
				event.preventDefault();
				clearDrop();
				var source = locate(dragId);
				dropTarget = {
					parentId: null,
					index: draft.roots.length - (source && !source.parent ? 1 : 0),
					valid: true
				};
				rootDrop.addClass("targeting-drop-inside");
			});
			rootDrop.on("drop", function(event) {
				if (!dragId || !dropTarget) return;
				event.preventDefault();
				selectedId = dragId;
				applyMove(dropTarget.parentId, dropTarget.index);
				endDrag();
			});
			tree.append(rootDrop);
			if (navigation) navigation.sync();
		}
		function renderFields() {
			properties.getElement().innerHTML = "";
			selectedControls = [];
			selectedOperands = null;
			var node = draft.find(selectedId);
			container.setAttr("data-selected-kind", node && node.kind || "");
			if (!node) {
				properties.append(create$2("div", {
					className: "gpo-editor-filters__empty",
					text: pt("selectFilter")
				}));
				return;
			}
			properties.append(create$2("h3", { text: nodeLabel(node) }));
			if (!node.available) {
				properties.append(create$2("div", {
					className: "gpo-editor-preference-notice",
					text: pt("unsupportedFilterFields")
				}));
				return;
			}
			selectedOperands = render$2({
				node,
				blocked: blocked(),
				scope: options.scope,
				language,
				fieldControl: options.fieldControl,
				pt,
				onChange: function() {
					capture();
					errorIds.clear();
					setNotice("");
					renderTree();
				}
			});
			selectedControls = selectedOperands.controls;
			properties.append(selectedOperands.element);
		}
		function nodeLabel(node) {
			if (node.supports_children) return fieldPayload(node, "filter.name") || node.label || __export_kindLabel(node.kind, node.kind, language);
			return __export_kindLabel(node.kind, node.label || node.kind || pt("unsupportedFilterFields"), language);
		}
		function add(kind) {
			if (blocked()) return;
			capture();
			hideMenu();
			var location = locate(selectedId);
			var parentId = location && location.node.supports_children ? location.node.id : location && location.parent ? location.parent.id : null;
			var index = location && location.node.supports_children ? location.node.children.length : location ? location.index + 1 : draft.roots.length;
			var node = draft.add(kind, parentId, index);
			if (!node) {
				setNotice(pt("targetingDepthLimit"));
				return;
			}
			draft.updateFields(node.id, initialize(node, {
				language,
				scope: options.scope
			}));
			if (parentId) collapsed.delete(parentId);
			selectedId = node.id;
			setNotice("");
			renderTree();
			renderFields();
			syncToolbar();
			focusNode(selectedId);
		}
		function remove() {
			if (blocked() || !selectedId) return;
			capture();
			var location = locate(selectedId);
			if (!location) return;
			var removedId = selectedId;
			var siblings = location.siblings.map(function(node) {
				return node.id;
			});
			if (!draft.remove(removedId)) return;
			selectedId = neighbor(siblings, [removedId], location.siblings.map(function(node) {
				return node.id;
			})) || (location.parent ? location.parent.id : null);
			setNotice("");
			renderTree();
			renderFields();
			syncToolbar();
			if (selectedId) focusNode(selectedId);
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
			menu.append(create$2("button", {
				attrs: {
					type: "button",
					role: "menuitem",
					"data-kind": kind.kind
				},
				children: [create$2("span", {
					className: ["gpo-editor-filter-icon", __export_targeting(kind.kind)],
					attrs: { "aria-hidden": "true" }
				}), create$2("span", { text: __export_kindLabel(kind.kind, kind.label || kind.kind, language) })],
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
			var entries = Array.from(menu.getElement().querySelectorAll("button"));
			var index = entries.indexOf(document.activeElement);
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
			combineTouched = true;
			capture();
			renderTree();
		});
		notCheckbox.on("change", function() {
			notTouched = true;
			capture();
			renderTree();
		});
		tree.on("click", function(event) {
			if (event.target === tree.getElement()) select(null);
		});
		tree.on("keydown", function(event) {
			if (event.defaultPrevented || formState.busy || event.altKey || event.metaKey || event.target.closest("input,select,textarea,a,summary,[contenteditable]:not([contenteditable=\"false\"])")) return;
			var row = event.target.closest("[data-targeting-id]");
			if (!row) return;
			var id = row.getAttribute("data-targeting-id");
			var location = locate(id);
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
					var parentLocation = locate(location.parent.id);
					applyMove(parentLocation.parent && parentLocation.parent.id, parentLocation.index + 1);
				} else if (event.key === "ArrowRight" && location.index > 0 && location.siblings[location.index - 1].supports_children) {
					var previous = location.siblings[location.index - 1];
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
		navigation = bind$1(tree.getElement(), {
			rows: function() {
				return tree.getElement().querySelectorAll("[data-targeting-id]");
			},
			selected: function() {
				return Array.from(tree.getElement().querySelectorAll("[data-targeting-id]")).find(function(row) {
					return row.getAttribute("data-targeting-id") === selectedId;
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
				var node = draft.find(row.getAttribute("data-targeting-id"));
				return !readonly && Boolean(node && node.available);
			},
			canRemove: function() {
				return !readonly;
			},
			busy: function() {
				return Boolean(formState.busy || dragId);
			}
		});
		container.cleanup = function() {
			endDrag();
			navigation.cleanup();
		};
		container.on("keydown", function(event) {
			if (event.key === "Escape" && (dragId || !menu.getElement().hidden)) {
				event.preventDefault();
				event.stopPropagation();
				endDrag();
				hideMenu();
			}
		});
		container.on("input", function() {
			errorIds.clear();
			setNotice("");
		});
		container.on("click", function(event) {
			if (!event.target.closest(".gpo-editor-filters__create")) hideMenu();
		});
		toolbar.append(create$2("div", {
			className: "gpo-editor-filters__create",
			children: [createButton, menu]
		}));
		toolbar.append(addCollection);
		toolbar.append(create$2("label", {
			className: "gpo-editor-filter-operator",
			attrs: { "data-field-id": "filter.bool" },
			children: [combineSelect]
		}));
		toolbar.append(create$2("label", {
			className: "gpo-editor-filter-negation",
			attrs: { "data-field-id": "filter.not" },
			children: [notCheckbox, create$2("span", { text: pt("targetingNot") })]
		}));
		toolbar.append(removeButton);
		container.append(toolbar);
		container.append(shortcutHelp);
		container.append(notice);
		container.append(create$2("div", {
			className: "gpo-editor-filters__layout",
			children: [tree, properties]
		}));
		formState.beginFilterDraft = function() {
			draft = accepted.clone();
			selectedId = null;
			selectedControls = [];
			selectedOperands = null;
			errorIds.clear();
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
			var result = validatedResult(draft);
			errorIds = new Set(result.errors.map(function(error) {
				return error.id;
			}));
			if (result.errors.length) {
				select(result.errors[0].id);
				setNotice(pt("validationFixErrors"));
				result.errors.filter(function(error) {
					return error.id === selectedId;
				}).forEach(function(error) {
					selectedControls.filter(function(control) {
						return control.id === error.fieldId;
					}).forEach(function(control) {
						control.setError(options.validationMessage(error.code));
					});
				});
				var first = selectedControls.find(function(control) {
					return control.id === result.errors[0].fieldId;
				});
				if (first) first.focus();
				return false;
			}
			accepted = draft.clone();
			if (result.operations.length) formState.dirty = true;
			return true;
		};
		formState.readFilterResult = function() {
			var result = validatedResult(accepted);
			return {
				operations: result.operations,
				errors: result.errors.map(function(error) {
					return {
						path: accepted.flatten().find(function(entry) {
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
				if (__export_supportedKinds.indexOf(node.kind) === -1) return null;
				var errors = [];
				node.fields.forEach(function(field) {
					if (field.editable === false || [
						"filter.bool",
						"filter.not",
						"filter.combine",
						"filter.negate",
						"filter.hidden"
					].indexOf(field.id) === -1) return;
					var code = validatePreferenceField(field, field.value);
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
	//#region src/components/templates/preference/view/common.js
	var t$4 = t$12;
	var PREFERENCE_LAYOUTS$2 = layouts_exports;
	function pt$3(key) {
		return t$4("preferences.editor." + key);
	}
	function validationMessage$1(code) {
		if (code === "required") return pt$3("validationRequired");
		if (code === "invalid_number") return pt$3("validationInvalidNumber");
		if (code === "unsigned_byte_range") return pt$3("validationUnsignedByteRange");
		var targetingCodes = {
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
		if (targetingCodes[code]) return pt$3(targetingCodes[code]);
		return pt$3("validationFixErrors");
	}
	function listFrom$1(result, key) {
		if (Array.isArray(result)) return result;
		return result && Array.isArray(result[key]) ? result[key] : [];
	}
	function parentCandidateLabel$1(candidate) {
		var depth = Math.max(0, Math.floor(Number(candidate && candidate.depth) || 0));
		var prefix = "";
		for (var index = 0; index < depth; index += 1) prefix += "\xA0\xA0";
		return prefix + String(candidate && candidate.label || "");
	}
	function scopeField$1(field, scope) {
		var result = clone$2(field);
		if (!result || result.id !== "metadata.userContext") return result;
		if (scope === "user") result.label = pt$3("userContext");
		else {
			result.hidden = true;
			result.editable = false;
		}
		return result;
	}
	function actionLabel$1(value) {
		var key = {
			create: "actionCreate",
			replace: "actionReplace",
			update: "actionUpdate",
			delete: "actionDelete"
		}[value];
		return key ? pt$3(key) : value === null || value === void 0 ? "" : String(value);
	}
	function itemFieldValue$1(item, fieldId) {
		if (!item || !fieldId) return "";
		if (Array.isArray(item.fields)) {
			for (var index = 0; index < item.fields.length; index++) if (item.fields[index] && item.fields[index].id === fieldId) return valuePayload(item.fields[index].value);
		}
		if (item.properties && typeof item.properties === "object") {
			var key = String(fieldId).indexOf("properties.") === 0 ? String(fieldId).slice(11) : String(fieldId);
			if (Object.prototype.hasOwnProperty.call(item.properties, key)) {
				var raw = item.properties[key];
				if (raw && typeof raw === "object" && "kind" in raw) return valuePayload(raw);
				return raw === null || raw === void 0 ? "" : String(raw);
			}
		}
		return "";
	}
	function tableColumns$1(kind) {
		var layout = PREFERENCE_LAYOUTS$2[kind];
		if (layout && Array.isArray(layout.columns) && layout.columns.length) return layout.columns;
		return null;
	}
	//#endregion
	//#region src/components/templates/preference/view/field-control.js
	var createElement$6 = createElement$18;
	var pt$2 = pt$3;
	function hiddenFieldControl$1(field) {
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
		var value = clone$2(field.value || {
			kind: "text",
			value: ""
		});
		var disabled = Boolean(forceReadonly || field.editable === false);
		var controlKind = field.control || "";
		var input;
		var inputElement = null;
		var optionalBooleanTouched = false;
		var checkboxValueKind = null;
		var checkboxControlId = null;
		function checkboxControl(checked) {
			var controlId = nextControlId$1();
			checkboxControlId = controlId;
			var checkbox = createElement$6("input", { attrs: {
				id: controlId,
				type: "checkbox",
				disabled: disabled ? "disabled" : null
			} });
			checkbox.getElement().checked = Boolean(checked);
			checkbox.on("change", function() {
				optionalBooleanTouched = true;
			});
			inputElement = checkbox.getElement();
			return createElement$6("span", {
				className: "gpo-editor-boolean",
				children: [checkbox, createElement$6("label", { attrs: {
					for: controlId,
					"aria-label": field.label || field.id
				} })]
			});
		}
		if (controlKind.indexOf("generated_") === 0) input = createElement$6("div", {
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
			input = createElement$6("select", {
				attrs: { disabled: disabled ? "disabled" : null },
				children: [
					"create",
					"replace",
					"update",
					"delete"
				].map(function(action) {
					return createElement$6("option", {
						attrs: { value: action },
						text: action
					});
				})
			});
			input.getElement().value = value.value;
		} else if (value.kind === "filter_combine") {
			input = createElement$6("select", {
				attrs: { disabled: disabled ? "disabled" : null },
				children: ["and", "or"].map(function(combine) {
					return createElement$6("option", {
						attrs: { value: combine },
						text: combine.toUpperCase()
					});
				})
			});
			input.getElement().value = value.value;
		} else if (controlKind === "choice") {
			input = createElement$6("select", {
				attrs: { disabled: disabled ? "disabled" : null },
				children: (Array.isArray(field.choices) ? field.choices : []).map(function(choice) {
					return createElement$6("option", {
						attrs: { value: choice.key },
						text: choice.label
					});
				})
			});
			input.getElement().value = value.value;
		} else if (value.kind === "text_list" || textarea) input = createElement$6("textarea", {
			attrs: { disabled: disabled ? "disabled" : null },
			text: Array.isArray(value.value) ? value.value.join("\n") : value.value === null || value.value === void 0 ? "" : String(value.value)
		});
		else if (value.kind === "optional_text") input = createElement$6("input", { attrs: {
			type: "text",
			disabled: disabled ? "disabled" : null,
			value: value.value === null ? "" : value.value
		} });
		else input = createElement$6("input", { attrs: {
			type: value.kind === "integer" || value.kind === "unsigned_byte" || value.kind === "optional_unsigned_byte" ? "number" : "text",
			min: value.kind.indexOf("unsigned") !== -1 ? 0 : null,
			max: value.kind.indexOf("unsigned_byte") !== -1 ? 255 : null,
			required: field.required ? "required" : null,
			disabled: disabled ? "disabled" : null,
			value: value.value === null || value.value === void 0 ? "" : value.value
		} });
		if (!inputElement) inputElement = input.getElement();
		var errorElement = createElement$6("span", { className: "gpo-editor-field__error" });
		var dynamicDisabled = false;
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
				var next = Boolean(nextDisabled);
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
	function fieldControl$2(field, forceReadonly, materializeOptionalDefault, options) {
		var opts = options || {};
		var builder = buildControlInput(field, forceReadonly, materializeOptionalDefault, false);
		var wrapSelect = Boolean(opts.wrapSelect) && valueKindIsSelect(builder);
		var wrapCheckbox = Boolean(opts.wrapCheckbox) && builder.checkboxControlId !== null;
		var builderIsInput = builder.checkboxControlId === null && builder.inputElement.tagName === "INPUT";
		var builderInputType = builderIsInput ? String(builder.inputElement.getAttribute("type") || "").toLowerCase() : "";
		var wrapText = builderIsInput && (builderInputType === "number" || Boolean(opts.wrapText) && builderInputType === "text");
		var element;
		if (wrapCheckbox) element = createElement$6("div", {
			className: [
				"field",
				"field__checkbox",
				"gpo-editor-field",
				builder.disabled ? "gpo-editor-field--readonly" : null
			],
			attrs: { "data-field-id": field.id },
			children: [
				createElement$6("div", {
					className: "field__label",
					children: [createElement$6("label", {
						className: "gpo-editor-field__label",
						attrs: { for: builder.checkboxControlId },
						children: [createElement$6("span", { text: field.label || field.id }), field.required ? createElement$6("span", {
							className: "gpo-editor-field__required",
							text: "*"
						}) : null]
					})]
				}),
				createElement$6("div", {
					className: "field__element",
					children: [builder.input]
				}),
				builder.disabled ? createElement$6("span", {
					className: "gpo-editor-field__hint",
					text: pt$2("readonly")
				}) : null,
				builder.errorElement
			]
		});
		else if (wrapText) element = createElement$6("div", {
			className: [
				"field",
				"field__input",
				"gpo-editor-field",
				builder.disabled ? "gpo-editor-field--readonly" : null
			],
			attrs: { "data-field-id": field.id },
			children: [
				createElement$6("div", {
					className: "field__label",
					children: [createElement$6("span", {
						className: "gpo-editor-field__label",
						children: [createElement$6("span", { text: field.label || field.id }), field.required ? createElement$6("span", {
							className: "gpo-editor-field__required",
							text: "*"
						}) : null]
					})]
				}),
				createElement$6("div", {
					className: "field__element",
					children: [builder.input, builder.errorElement]
				}),
				builder.disabled ? createElement$6("span", {
					className: "gpo-editor-field__hint",
					text: pt$2("readonly")
				}) : null
			]
		});
		else element = createElement$6("div", {
			className: [
				"gpo-editor-field",
				wrapSelect ? "field" : null,
				builder.disabled ? "gpo-editor-field--readonly" : null
			],
			attrs: { "data-field-id": field.id },
			children: wrapSelect ? [
				createElement$6("div", {
					className: "field__label",
					children: [createElement$6("span", {
						className: "gpo-editor-field__label",
						children: [createElement$6("span", { text: field.label || field.id }), field.required ? createElement$6("span", {
							className: "gpo-editor-field__required",
							text: "*"
						}) : null]
					})]
				}),
				createElement$6("div", {
					className: "field__element",
					children: [builder.input]
				}),
				builder.disabled ? createElement$6("span", {
					className: "gpo-editor-field__hint",
					text: pt$2("readonly")
				}) : null,
				builder.errorElement
			] : [
				createElement$6("span", {
					className: "gpo-editor-field__label",
					children: [createElement$6("span", { text: field.label || field.id }), field.required ? createElement$6("span", {
						className: "gpo-editor-field__required",
						text: "*"
					}) : null]
				}),
				builder.input,
				builder.disabled ? createElement$6("span", {
					className: "gpo-editor-field__hint",
					text: pt$2("readonly")
				}) : null,
				builder.errorElement
			]
		});
		var lastError = "";
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
	function mockupFieldControl$1(field, forceReadonly, materializeOptionalDefault, options) {
		var opts = options || {};
		var builder = buildControlInput(field, forceReadonly, materializeOptionalDefault, Boolean(opts.textarea));
		var checkboxLike = builder.value.kind === "boolean" || builder.value.kind === "optional_boolean" || builder.controlKind === "optional_boolean_u8";
		var element;
		if (checkboxLike) element = createElement$6("div", {
			className: [
				"field",
				"field__checkbox",
				builder.disabled ? "field--readonly" : null
			],
			attrs: { "data-field-id": field.id },
			children: [createElement$6("label", { children: [builder.input, createElement$6("span", {
				className: "field__label-checkbox",
				text: field.label || field.id
			})] }), builder.errorElement]
		});
		else {
			var fieldClasses = ["field", "field__input"];
			if (opts.textarea) fieldClasses.push("field__description", "h-auto");
			else if (builder.controlKind === "directory_path" || builder.controlKind === "file_path") fieldClasses.push("field__input--path");
			else if (valueKindIsSelect(builder)) fieldClasses.push("select");
			element = createElement$6("div", {
				className: fieldClasses,
				attrs: { "data-field-id": field.id },
				children: [createElement$6("div", {
					className: "field__label",
					children: [createElement$6("span", { text: field.label || field.id }), field.required ? createElement$6("span", {
						className: "gpo-editor-field__required",
						text: "*"
					}) : null]
				}), createElement$6("div", {
					className: "field__element",
					children: [builder.input, builder.errorElement]
				})]
			});
		}
		var lastError = "";
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
	function nextControlId$1() {
		return "gpo-preference-field-" + nextFieldControlId++;
	}
	//#endregion
	//#region src/components/templates/preference/view/field-tabs.js
	var createElement$5 = createElement$18;
	var pt$1 = pt$3;
	var nextControlId = nextControlId$1;
	var hiddenFieldControl = hiddenFieldControl$1;
	var mockupFieldControl = mockupFieldControl$1;
	var fieldControl$1 = fieldControl$2;
	function buildPlaceholderCheckbox(entry) {
		var label = entry && entry.label || (entry && entry.labelKey ? pt$1(entry.labelKey) : "");
		var controlId = nextControlId();
		return createElement$5("div", {
			className: [
				"field",
				"field__checkbox",
				"field--readonly"
			],
			children: [createElement$5("label", { children: [createElement$5("span", {
				className: "gpo-editor-boolean",
				children: [createElement$5("input", { attrs: {
					id: controlId,
					type: "checkbox",
					disabled: "disabled"
				} }), createElement$5("label", { attrs: {
					for: controlId,
					"aria-label": label
				} })]
			}), createElement$5("span", {
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
		var layout = Array.isArray(layoutEntries) ? layoutEntries : [];
		var belongs = typeof predicate === "function" ? predicate : function() {
			return true;
		};
		var result = [];
		var placed = {};
		layout.forEach(function(entry) {
			var item = clone$2(entry || {});
			if (!item.field) {
				if (item.line) result.push({ line: true });
				if (item.placeholder) result.push(item);
				return;
			}
			var field = fields.find(function(candidate) {
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
	function buildFieldTabs$1(fields, options) {
		var opts = options || {};
		var layout = opts.layout || null;
		var fieldsById = /* @__PURE__ */ new Map();
		fields.forEach(function(field) {
			fieldsById.set(field.id, field);
		});
		var basicEntries = orderedTabEntries(fields, layout ? layout.basic : null, isBasicTabField);
		var generalEntries = orderedTabEntries(fields, layout ? layout.general : null, isGeneralTabField);
		var fieldOptions = {};
		basicEntries.concat(generalEntries).forEach(function(entry) {
			if (entry && entry.field && !fieldOptions[entry.field]) fieldOptions[entry.field] = entry;
		});
		fields.forEach(function(field) {
			var control;
			if (field.hidden) control = hiddenFieldControl(field);
			else if (layout) control = mockupFieldControl(field, opts.readonly, opts.creating, fieldOptions[field.id] || {});
			else control = fieldControl$1(field, opts.readonly, opts.creating);
			opts.controls.push(control);
			if (!opts.controlsById.has(field.id)) opts.controlsById.set(field.id, []);
			opts.controlsById.get(field.id).push(control);
		});
		function renderable(entries) {
			return entries.some(function(entry) {
				if (entry.placeholder) return true;
				if (!entry.field) return false;
				var field = fieldsById.get(entry.field);
				return Boolean(field && !field.hidden);
			});
		}
		var basicHasFields = renderable(basicEntries);
		var generalHasFields = renderable(generalEntries);
		if (!basicHasFields && !generalHasFields) return null;
		function buildContent(entries) {
			var content = createElement$5("div", { className: "tab-content" });
			entries.forEach(function(entry) {
				if (entry.line) {
					content.append(createElement$5("div", { className: "field__line" }));
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
		var basicContent = buildContent(basicEntries);
		var generalContent = buildContent(generalEntries);
		basicContent.getElement().id = "tab-basic";
		generalContent.getElement().id = "tab-general";
		var activeTab = basicHasFields ? "tab-basic" : "tab-general";
		if (activeTab === "tab-basic") basicContent.getElement().classList.add("active");
		else generalContent.getElement().classList.add("active");
		var tabs = createElement$5("div", { className: "preference__modal-tabs" });
		var buttons = createElement$5("div", { className: "tab-buttons" });
		[{
			id: "tab-basic",
			enabled: basicHasFields,
			label: pt$1("tabBasic")
		}, {
			id: "tab-general",
			enabled: generalHasFields,
			label: pt$1("tabGeneral")
		}].forEach(function(spec) {
			if (!spec.enabled) return;
			buttons.append(createElement$5("div", {
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
		var filtersTab = opts.layout ? opts.layout.filters === "basic" ? "tab-basic" : opts.layout.filters === "general" ? "tab-general" : null : null;
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
	function dependencyRulesFor$1(kind) {
		var layout = PREFERENCE_LAYOUTS$1[kind];
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
		var raw = readSource(condition.source);
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
	function attachFieldDependencies$1(formElement, controlsById, rules) {
		var disabledIds = /* @__PURE__ */ new Set();
		function sourceValue(fieldId) {
			var payload = null;
			(controlsById.get(fieldId) || []).forEach(function(control) {
				var current = control.read();
				if (current !== void 0) payload = valuePayload(current);
			});
			return payload;
		}
		function sync() {
			var passes = Math.min(rules.length + 1, 12);
			for (var pass = 0; pass < passes; pass += 1) {
				var changed = false;
				var cache = /* @__PURE__ */ new Map();
				var nextDisabled = [];
				var readSource = function(fieldId) {
					if (!cache.has(fieldId)) cache.set(fieldId, sourceValue(fieldId));
					return cache.get(fieldId);
				};
				rules.forEach(function(rule) {
					if (!rule || !rule.field) return;
					var enabled = ruleEnabled(rule, readSource);
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
	//#region src/components/templates/preference/preferences-view-template.js
	var createElement$4 = createElement$18;
	var t$3 = t$12;
	var nextHeaderOwnerId = 1;
	var PREFERENCE_LAYOUTS = layouts_exports;
	var pt = pt$3;
	var tableColumns = tableColumns$1;
	var actionLabel = actionLabel$1;
	var itemFieldValue = itemFieldValue$1;
	var scopeField = scopeField$1;
	var listFrom = listFrom$1;
	var validationMessage = validationMessage$1;
	var parentCandidateLabel = parentCandidateLabel$1;
	var fieldControl = fieldControl$2;
	var buildFieldTabs = buildFieldTabs$1;
	var dependencyRulesFor = dependencyRulesFor$1;
	var attachFieldDependencies = attachFieldDependencies$1;
	async function renderPreferencesTemplate$1(options) {
		var config = options || {};
		var item = config.item || {};
		var documentDto = item.document || {};
		var root = createElement$4("div", { className: ["gp__preference", "gpo-editor-preferences"] });
		var rootElement = root.getElement();
		var headerElement = config.header && config.header.getElement ? config.header.getElement() : null;
		var headerControls = headerElement ? headerElement.querySelector(".gp__control") : null;
		var headerActions = headerElement ? headerElement.querySelector(".gp__control-actions") : null;
		var admxActions = headerElement ? headerElement.querySelector(".gp__control-admx") : null;
		var helpSeparator = headerElement ? headerElement.querySelector(".gp__control-separator") : null;
		var createButton = headerControls ? headerControls.querySelector(".preferences__btn-create") : null;
		var editButton = headerControls ? headerControls.querySelector(".preferences__btn-edit") : null;
		var deleteButton = headerControls ? headerControls.querySelector(".preferences__btn-delete") : null;
		var headerOwner = "preferences-" + nextHeaderOwnerId++;
		var items = [];
		var selectedIdentity = null;
		var modalState = null;
		var opening = false;
		var pendingDiscard = null;
		var discardModal = null;
		var cleanups = [];
		var formRequestId = 0;
		var itemsRequestId = 0;
		var infoRequestId = 0;
		var itemFieldsCache = /* @__PURE__ */ new Map();
		var fieldsRequestId = 0;
		var tableRefreshScheduled = false;
		var deleting = false;
		var disposed = false;
		var tableNavigation;
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
		function ownsHeader() {
			return Boolean(headerControls && headerControls.getAttribute("data-preference-owner") === headerOwner);
		}
		function setHeaderState() {
			if (typeof config.onFormStateChange === "function") config.onFormStateChange(Boolean(modalState));
			if (!ownsHeader()) return;
			var available = Boolean(documentDto.editable) && !modalState && !opening && !deleting;
			if (createButton) createButton.classList.toggle("active", available);
			if (editButton) editButton.classList.toggle("active", available && selectedIdentity !== null);
			if (deleteButton) deleteButton.classList.toggle("active", available && selectedIdentity !== null);
		}
		function setOpening(value) {
			opening = Boolean(value);
			rootElement.classList.toggle("gpo-editor-preferences--opening", opening);
			if (opening) rootElement.setAttribute("aria-busy", "true");
			else rootElement.removeAttribute("aria-busy");
			Array.prototype.forEach.call(rootElement.querySelectorAll(".gpo-editor-preference-table__actions button"), function(button) {
				button.disabled = opening;
			});
			setHeaderState();
		}
		function addListener(target, name, handler) {
			if (!target) return;
			target.addEventListener(name, handler);
			cleanups.push(function() {
				target.removeEventListener(name, handler);
			});
		}
		function recoveryConflict(response) {
			var recovery = response && response.recovery;
			if (!recovery || recovery.kind !== "conflict") return null;
			var error = /* @__PURE__ */ new Error("Preference publication reconciliation is still conflicted.");
			error.category = "publication_conflict";
			error.details = recovery.conflict || null;
			return error;
		}
		async function reconcilePage(event) {
			if (event && event.currentTarget) event.currentTarget.disabled = true;
			try {
				var conflict = recoveryConflict(await reconcile());
				if (conflict) throw conflict;
				await loadItems();
			} catch (error) {
				showPageError(error);
			} finally {
				if (event && event.currentTarget) event.currentTarget.disabled = false;
			}
		}
		function showPageError(error) {
			var slot = rootElement.querySelector(".gpo-editor-preferences__error");
			if (!slot) return;
			slot.innerHTML = "";
			slot.appendChild(renderError(error, {
				onRefresh: loadItems,
				onReconcile: reconcilePage
			}).getElement());
		}
		function renderTable() {
			var tableSlot = rootElement.querySelector(".gpo-editor-preferences__table");
			if (!tableSlot) return;
			var heldFocus = tableSlot.contains(document.activeElement);
			tableSlot.innerHTML = "";
			if (!items.length) {
				tableSlot.appendChild(createElement$4("div", {
					className: "gpo-editor-empty",
					text: pt("emptyItems")
				}).getElement());
				if (tableNavigation) {
					tableNavigation.sync();
					if (heldFocus) tableNavigation.focusSelected();
				}
				return;
			}
			var columns = tableColumns(item.preferenceKind);
			var useTemplate = Boolean(columns);
			var headerCells = useTemplate ? columns.map(function(column) {
				return createElement$4("th", { text: pt(column.labelKey) });
			}) : [
				createElement$4("th", { text: pt("itemColumn") }),
				createElement$4("th", { text: pt("filtersColumn") }),
				createElement$4("th", { text: pt("actionsColumn") })
			];
			function buildDataCells(preferenceItem, index) {
				if (!useTemplate) return [createElement$4("td", { text: preferenceItem.label }), createElement$4("td", { text: preferenceItem.has_filters ? pt("yes") : pt("no") })];
				return columns.map(function(column) {
					var text = "";
					if (column.source === "name") text = preferenceItem.label;
					else if (column.source === "order") text = String(index + 1);
					else if (column.source === "field") {
						var value = cachedFieldValue(preferenceItem.identity, column.field);
						text = column.format === "action" ? actionLabel(value) : value === null || value === void 0 ? "" : String(value);
					}
					return createElement$4("td", { text });
				});
			}
			function buildActionsCell(preferenceItem) {
				return createElement$4("td", {
					className: "gpo-editor-preference-table__actions",
					children: [createElement$4("button", {
						className: "button",
						attrs: {
							type: "button",
							disabled: opening ? "disabled" : null
						},
						text: documentDto.editable ? t$3("header.edit") : pt("viewTitle"),
						events: { click: function(event) {
							event.stopPropagation();
							selectItem(preferenceItem.identity);
							openForm(selectedIdentity);
						} }
					})]
				});
			}
			var bodyRows = items.map(function(preferenceItem, index) {
				var selected = selectedIdentity !== null && equal(selectedIdentity, preferenceItem.identity);
				var cells = buildDataCells(preferenceItem, index);
				if (!useTemplate) cells.push(buildActionsCell(preferenceItem));
				var row = createElement$4("tr", {
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
							if (tableNavigation) tableNavigation.focusSelected();
						},
						dblclick: function() {
							if (modalState || opening || deleting) return;
							selectItem(preferenceItem.identity);
							openForm(selectedIdentity);
						}
					}
				});
				row.getElement().__preferenceIdentity = preferenceItem.identity;
				return row;
			});
			var table = createElement$4("table", {
				className: ["preference__table", "gpo-catalog-table"],
				children: [createElement$4("thead", { children: [createElement$4("tr", { children: headerCells })] }), createElement$4("tbody", { children: bodyRows })]
			});
			tableSlot.appendChild(table.getElement());
			if (tableNavigation) {
				tableNavigation.sync();
				if (heldFocus) tableNavigation.focusSelected();
			}
		}
		function selectItem(identity) {
			selectedIdentity = clone$2(identity);
			Array.prototype.forEach.call(rootElement.querySelectorAll("[data-preference-identity]"), function(row) {
				var selected = equal(row.__preferenceIdentity, selectedIdentity);
				row.classList.toggle("active", selected);
				row.setAttribute("aria-selected", selected ? "true" : "false");
			});
			if (tableNavigation) tableNavigation.sync();
			setHeaderState();
			requestInfoPanel(selectedIdentity);
		}
		function focusTable() {
			if (!disposed && (typeof config.isCurrent !== "function" || config.isCurrent()) && tableNavigation) tableNavigation.focusSelected();
		}
		function cacheKey(identity) {
			return JSON.stringify(identity);
		}
		function cachedFieldValue(identity, fieldId) {
			var fields = itemFieldsCache.get(cacheKey(identity));
			if (!fields) return "";
			return itemFieldValue({ fields }, fieldId);
		}
		function scheduleTableRefresh() {
			if (tableRefreshScheduled) return;
			tableRefreshScheduled = true;
			var run = function() {
				tableRefreshScheduled = false;
				if (typeof config.isCurrent === "function" && !config.isCurrent()) return;
				renderTable();
			};
			if (typeof window !== "undefined" && typeof window.requestAnimationFrame === "function") window.requestAnimationFrame(run);
			else setTimeout(run, 16);
		}
		function ensureItemFields(identity) {
			var key = cacheKey(identity);
			if (itemFieldsCache.has(key)) return Promise.resolve(itemFieldsCache.get(key));
			var startedGeneration = fieldsRequestId;
			return preferenceShow(item.scope, item.preferenceKind, clone$2(identity)).then(function(response) {
				if (startedGeneration !== fieldsRequestId) return null;
				var fields = clone$2(response.fields || response.new_item_fields || []).map(function(field) {
					return scopeField(field, item.scope);
				});
				itemFieldsCache.set(key, fields);
				return fields;
			});
		}
		function prefetchTableFields() {
			var generation = ++fieldsRequestId;
			items.forEach(function(preferenceItem) {
				if (preferenceItem.identity === null || preferenceItem.identity === void 0) return;
				if (itemFieldsCache.has(cacheKey(preferenceItem.identity))) return;
				ensureItemFields(preferenceItem.identity).then(function(fields) {
					if (!fields) return;
					if (generation !== fieldsRequestId) return;
					if (typeof config.isCurrent === "function" && !config.isCurrent()) return;
					scheduleTableRefresh();
				});
			});
		}
		function invalidateCachedFields(identity) {
			itemFieldsCache.delete(cacheKey(identity));
			fieldsRequestId += 1;
		}
		async function loadItems() {
			var requestId = ++itemsRequestId;
			try {
				var response = await preferenceItems(item.scope, item.preferenceKind);
				if (requestId !== itemsRequestId || typeof config.isCurrent === "function" && !config.isCurrent()) return;
				items = listFrom(response, "items");
				if (selectedIdentity !== null && !items.some(function(entry) {
					return equal(entry.identity, selectedIdentity);
				})) selectedIdentity = null;
				var errorSlot = rootElement.querySelector(".gpo-editor-preferences__error");
				if (errorSlot) errorSlot.innerHTML = "";
				renderTable();
				setHeaderState();
				prefetchTableFields();
				if (selectedIdentity !== null) requestInfoPanel(selectedIdentity);
				else resetInfoPanel();
			} catch (error) {
				if (requestId !== itemsRequestId || typeof config.isCurrent === "function" && !config.isCurrent()) return;
				showPageError(error);
			}
		}
		function buildInfoPanel() {
			var info = createElement$4("div", { className: ["preference__info", config.isHelpOpen ? "is-open" : null] });
			var settings = createElement$4("div", { className: "preference__settings" });
			settings.append(createElement$4("div", {
				className: "preference__settings-title",
				text: pt("settingsTitle")
			}));
			settings.append(createElement$4("div", { className: "preference__settings-data" }));
			info.append(settings);
			var description = createElement$4("div", { className: "preference__description" });
			description.append(createElement$4("div", {
				className: "preference__description-title",
				text: pt("descriptionTitle")
			}));
			description.append(createElement$4("div", {
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
			var v = field && field.value;
			var raw = v && typeof v === "object" ? v.value : v;
			if (raw === null || raw === void 0) return null;
			if (raw === true || raw === 1) return true;
			if (raw === false || raw === 0) return false;
			return Boolean(raw);
		}
		function fieldText(field) {
			var v = field && field.value;
			var raw = v && typeof v === "object" ? v.value : v;
			if (Array.isArray(raw)) return raw.join("\n");
			return raw === null || raw === void 0 ? "" : String(raw);
		}
		function renderInfoPanel(fields) {
			var dataSlot = rootElement.querySelector(".preference__settings-data");
			var descSlot = rootElement.querySelector(".preference__description-data");
			if (!dataSlot || !descSlot) return;
			var byId = /* @__PURE__ */ new Map();
			(Array.isArray(fields) ? fields : []).forEach(function(field) {
				if (field && field.id !== void 0 && !byId.has(field.id)) byId.set(field.id, field);
			});
			dataSlot.innerHTML = "";
			settingsItems().forEach(function(spec) {
				var field = byId.get(spec.id);
				var label = field && field.label || spec.label;
				var value = fieldCheckedState(field);
				dataSlot.appendChild(createElement$4("div", {
					className: "preference__settings-item",
					children: [createElement$4("div", {
						className: "preference__settings-name",
						text: label + ":"
					}), createElement$4("div", {
						className: "preference__settings-value",
						text: value === null ? "" : value ? pt("yes") : pt("no")
					})]
				}).getElement());
			});
			var descText = fieldText(byId.get("metadata.desc"));
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
			var requestId = ++infoRequestId;
			try {
				var fields = await ensureItemFields(identity);
				if (requestId !== infoRequestId || typeof config.isCurrent === "function" && !config.isCurrent()) return;
				if (fields) renderInfoPanel(fields);
				else resetInfoPanel();
			} catch (error) {
				if (requestId !== infoRequestId || typeof config.isCurrent === "function" && !config.isCurrent()) return;
				resetInfoPanel();
			}
		}
		function renderShell() {
			rootElement.innerHTML = "";
			var dataTable = createElement$4("div", { className: "preference__data-table" });
			dataTable.append(createElement$4("div", {
				className: "gpo-editor-preferences__header",
				children: [config.hideHeading ? null : createElement$4("h2", {
					text: config.categoryPath || documentDto.label || item.preferenceKind,
					attrs: { "data-category-path": "" }
				}), createElement$4("div", {
					className: ["gpo-editor-document-state", documentDto.editable ? null : "gpo-editor-document-state--readonly"],
					text: documentDto.editable ? pt("documentEditable") : pt("documentReadOnly")
				})]
			}));
			dataTable.append(createElement$4("div", { className: "gpo-editor-preferences__error" }));
			dataTable.append(createElement$4("div", { className: "gpo-editor-preferences__table" }));
			if (!config.modalHost) dataTable.append(createElement$4("div", { className: "gpo-editor-preferences__modal-host" }));
			rootElement.appendChild(dataTable.getElement());
			rootElement.appendChild(buildInfoPanel().getElement());
			resetInfoPanel();
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
			var creating = identity === null || identity === void 0;
			if (creating && !documentDto.editable) return;
			if (opening) return false;
			if (modalState && !closeForm(false, "close")) return;
			var host = config.modalHost || rootElement.querySelector(".gpo-editor-preferences__modal-host");
			if (!host) return;
			var requestId = ++formRequestId;
			setOpening(true);
			try {
				var response = await preferenceShow(item.scope, item.preferenceKind, identity);
				if (requestId !== formRequestId || typeof config.isCurrent === "function" && !config.isCurrent()) return;
				var readonly = !documentDto.editable;
				var fields = clone$2(creating ? response.new_item_fields || response.fields || [] : response.fields || []).map(function(field) {
					return scopeField(field, item.scope);
				});
				if (!creating) {
					infoRequestId += 1;
					renderInfoPanel(fields);
				}
				var parentCandidates = creating && Array.isArray(response.parent_candidates) ? clone$2(response.parent_candidates) : [];
				var controls = [];
				var controlsById = /* @__PURE__ */ new Map();
				var fieldTabs = buildFieldTabs(fields, {
					controls,
					controlsById,
					readonly,
					creating,
					layout: PREFERENCE_LAYOUTS[item.preferenceKind] || null
				});
				var formState = {
					dirty: false,
					busy: false,
					readFilterResult: function() {
						return {
							operations: [],
							errors: []
						};
					}
				};
				var errorSlot = createElement$4("div", { className: "gpo-editor-preference-form__error" });
				var validationSlot = createElement$4("div", {
					className: "gpo-editor-preference-form__validation",
					attrs: { role: "alert" }
				});
				var originalName = response.item && response.item.label !== void 0 ? String(response.item.label) : "";
				var nameInput = null;
				var nameField = null;
				var nameError = null;
				var parentSelect = null;
				var parentField = null;
				if (!creating) {
					nameInput = createElement$4("input", { attrs: {
						type: "text",
						value: originalName,
						required: "required",
						disabled: readonly ? "disabled" : null
					} });
					nameError = createElement$4("span", { className: "gpo-editor-field__error" });
					nameField = createElement$4("div", {
						className: [
							"field",
							"field__input",
							readonly ? "field--readonly" : null
						],
						attrs: { "data-field-id": "name" },
						children: [createElement$4("div", {
							className: "field__label",
							children: [createElement$4("span", { text: pt("rename") }), createElement$4("span", {
								className: "gpo-editor-field__required",
								text: "*"
							})]
						}), createElement$4("div", {
							className: "field__element",
							children: [nameInput, nameError]
						})]
					});
				}
				if (creating && parentCandidates.length > 1) {
					parentSelect = createElement$4("select", {
						attrs: { "aria-label": pt("parent") },
						children: parentCandidates.map(function(candidate, index) {
							return createElement$4("option", {
								attrs: { value: String(index) },
								text: parentCandidateLabel(candidate)
							});
						})
					});
					var rootParentIndex = parentCandidates.findIndex(function(candidate) {
						return candidate && candidate.identity === null;
					});
					parentSelect.getElement().value = String(rootParentIndex < 0 ? 0 : rootParentIndex);
					parentField = createElement$4("label", {
						className: ["gpo-editor-field", "gpo-editor-preference-parent"],
						attrs: { "data-field-id": "parent" },
						children: [createElement$4("span", {
							className: "gpo-editor-field__label",
							text: pt("parent")
						}), parentSelect]
					});
				}
				var saveButton = readonly ? null : createElement$4("button", {
					className: ["button", "btn-ok"],
					attrs: { type: "button" },
					text: pt("save"),
					events: { click: function() {
						saveForm();
					} }
				});
				var closeAction = function() {
					closeForm(false, "close");
				};
				var cancelAction = function() {
					closeForm(false, "cancel");
				};
				var filterSection = createElement$4("div", { className: "preference__modal-filters" });
				filterSection.append(buildFilterEditor(response, formState, readonly));
				var targettingModalElement = null;
				var closeTargettingModal = function(accept) {
					if (accept && !readonly && !formState.acceptFilterDraft()) return;
					if (!accept) formState.cancelFilterDraft();
					if (targettingModalElement) {
						targettingModalElement.classList.remove("active");
						targettingModalElement.inert = true;
					}
					form.getElement().classList.remove("dimmed");
					form.getElement().inert = false;
					if (targettingButton) targettingButton.getElement().focus();
				};
				var buildTargettingModal = function() {
					if (targettingModalElement) return targettingModalElement;
					targettingModalElement = createElement$4("div", {
						className: [
							"targetting__modal",
							"preference__modal",
							readonly ? "preference__modal--readonly" : null
						],
						attrs: {
							role: "dialog",
							"aria-modal": "true",
							"aria-label": pt("targettingTitle"),
							tabindex: "-1"
						},
						children: [createElement$4("div", {
							className: "preference__modal-wrapper",
							children: [
								createElement$4("div", {
									className: "preference__modal-header",
									children: [createElement$4("div", {
										className: "title",
										text: pt("targettingTitle")
									}), createElement$4("button", {
										className: "close",
										attrs: {
											type: "button",
											"aria-label": pt("close")
										},
										events: { click: function() {
											closeTargettingModal(false);
										} }
									})]
								}),
								createElement$4("div", {
									className: "preference__modal-content",
									children: [filterSection]
								}),
								createElement$4("div", {
									className: "preference__modal-footer",
									children: readonly ? [createElement$4("button", {
										className: ["button", "btn-cancel"],
										attrs: { type: "button" },
										text: pt("close"),
										events: { click: function() {
											closeTargettingModal(false);
										} }
									})] : [createElement$4("button", {
										className: ["button", "btn-cancel"],
										attrs: { type: "button" },
										text: pt("cancel"),
										events: { click: function() {
											closeTargettingModal(false);
										} }
									}), createElement$4("button", {
										className: ["button", "btn-ok"],
										attrs: { type: "button" },
										text: pt("targetingOk"),
										events: { click: function() {
											closeTargettingModal(true);
										} }
									})]
								})
							]
						})]
					}).getElement();
					targettingModalElement.addEventListener("keydown", function(event) {
						if (event.defaultPrevented || event.target.closest("[role=\"dialog\"], [role=\"alertdialog\"]") !== targettingModalElement) return;
						if (event.key === "Escape" && !event.defaultPrevented) {
							event.preventDefault();
							closeTargettingModal(false);
						}
						trapTab(event, targettingModalElement);
					});
					targettingModalElement.inert = true;
					return targettingModalElement;
				};
				var buildModalContent = function() {
					var content = createElement$4("div", { className: "preference__modal-content" });
					content.append(validationSlot);
					content.append(errorSlot);
					content.append(createElement$4("div", { className: "gpo-editor-fields" }));
					if (fieldTabs) content.append(fieldTabs);
					return content;
				};
				var form = createElement$4("div", {
					className: [
						"preference__modal",
						"gpo-editor-preference-form",
						readonly ? "preference__modal--readonly" : null
					],
					attrs: {
						role: "dialog",
						"aria-modal": "true",
						tabindex: "-1",
						"aria-label": creating ? pt("createTitle") : readonly ? pt("viewTitle") : pt("editTitle")
					},
					events: { keydown: function(event) {
						if (event.defaultPrevented || event.target.closest("[role=\"dialog\"], [role=\"alertdialog\"]") !== form.getElement()) return;
						if (event.key === "Escape") {
							event.preventDefault();
							event.stopPropagation();
							closeAction();
						}
						trapTab(event, form.getElement());
					} },
					children: [createElement$4("div", {
						className: "preference__modal-wrapper",
						children: [
							createElement$4("div", {
								className: "preference__modal-header",
								children: [createElement$4("div", {
									className: "title",
									text: creating ? pt("createTitle") : readonly ? pt("viewTitle") : pt("editTitle")
								}), createElement$4("button", {
									className: "close",
									attrs: {
										type: "button",
										"aria-label": pt("close")
									},
									events: { click: closeAction }
								})]
							}),
							buildModalContent(),
							createElement$4("div", {
								className: "preference__modal-footer",
								children: readonly ? [createElement$4("button", {
									className: ["button", "btn-cancel"],
									attrs: { type: "button" },
									text: pt("close"),
									events: { click: closeAction }
								})] : [createElement$4("button", {
									className: ["button", "btn-cancel"],
									attrs: { type: "button" },
									text: pt("cancel"),
									events: { click: cancelAction }
								}), saveButton]
							})
						]
					})]
				});
				var fieldSlot = form.getElement().querySelector(".gpo-editor-fields");
				if (nameField) {
					var basicTab = form.getElement().querySelector("#tab-basic");
					var targetTypeField = basicTab && basicTab.querySelector("[data-field-id=\"properties.targetType\"]");
					if (targetTypeField && targetTypeField.parentNode) targetTypeField.parentNode.insertBefore(nameField.getElement(), targetTypeField);
					else if (basicTab) basicTab.insertBefore(nameField.getElement(), basicTab.firstChild);
					else if (fieldSlot) fieldSlot.appendChild(nameField.getElement());
				}
				if (parentField && fieldSlot) fieldSlot.appendChild(parentField.getElement());
				var targettingButton = createElement$4("button", {
					className: ["button", "preference__tab-targetting-btn"],
					attrs: { type: "button" },
					text: pt("targettingButton"),
					events: { click: function() {
						if (formState.busy) return;
						formState.beginFilterDraft();
						var modal = buildTargettingModal();
						if (!modal.parentNode) host.appendChild(modal);
						modal.offsetHeight;
						modal.inert = false;
						modal.classList.add("active");
						form.getElement().classList.add("dimmed");
						form.getElement().inert = true;
						var first = modal.querySelector(".gpo-editor-filter-add:not(:disabled), [role=\"treeitem\"], .btn-cancel");
						if (first) first.focus();
						else modal.focus();
					} }
				});
				var generalTabElement = form.getElement().querySelector("#tab-general");
				var descriptionField = generalTabElement && generalTabElement.querySelector("[data-field-id=\"metadata.desc\"]");
				if (generalTabElement && descriptionField && descriptionField.parentNode) descriptionField.parentNode.insertBefore(targettingButton.getElement(), descriptionField);
				else if (generalTabElement) generalTabElement.appendChild(targettingButton.getElement());
				else {
					var formContentSlot = form.getElement().querySelector(".preference__modal-content");
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
				host.appendChild(form.getElement());
				host.classList.add("active");
				form.getElement().offsetHeight;
				form.getElement().classList.add("active");
				modalState = {
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
				if (modalState.nameInput && !readonly) modalState.nameInput.addEventListener("input", function() {
					if (modalState.nameError.textContent) setNameError(modalState, "");
				});
				var duplicates = preferenceFieldIds(fields).duplicates;
				if (!readonly && duplicates.length) {
					modalState.blockedDescriptors = true;
					modalState.formElement.classList.add("gpo-editor-preference-form--invalid");
					modalState.validationSlot.textContent = pt("validationFixErrors");
					duplicates.forEach(function(id) {
						(controlsById.get(id) || []).forEach(function(control) {
							control.setError(pt("validationFixErrors"));
						});
					});
				}
				var dependencyRules = dependencyRulesFor(item.preferenceKind);
				if (dependencyRules.length && !readonly) {
					var dependencies = attachFieldDependencies(modalState.formElement, controlsById, dependencyRules);
					modalState.dependencyDisabledIds = dependencies.disabledIds;
					dependencies.sync();
				}
				syncFormBusy(modalState);
				setHeaderState();
			} catch (error) {
				if (requestId === formRequestId) showPageError(error);
			} finally {
				if (requestId === formRequestId) setOpening(false);
			}
		}
		function showDiscardModal(action) {
			if (discardModal) return;
			pendingDiscard = { action };
			if (modalState && modalState.formElement) {
				modalState.formElement.classList.add("gpo-editor-preference-form--confirming");
				if (modalState.formElement.parentNode) {
					var targettingModal = modalState.formElement.parentNode.querySelector(".targetting__modal");
					if (targettingModal) targettingModal.classList.add("gpo-editor-preference-form--confirming");
				}
			}
			discardModal = open$3(config.modalHost || rootElement, {
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
			if (discardModal) {
				discardModal.close();
				discardModal = null;
			}
			var confirmingForms = (config.modalHost || rootElement).querySelectorAll(".gpo-editor-preference-form--confirming");
			Array.prototype.forEach.call(confirmingForms, function(formElement) {
				formElement.classList.remove("gpo-editor-preference-form--confirming");
			});
		}
		function handleDiscardModalChoice(confirmed) {
			var pending = pendingDiscard;
			pendingDiscard = null;
			hideDiscardModal();
			if (!confirmed || !pending) return;
			closeForm(true, pending.action);
		}
		function closeHostModals(host) {
			host.classList.remove("active");
			var modals = Array.prototype.slice.call(host.children);
			modals.forEach(function(element) {
				element.classList.remove("active");
			});
			setTimeout(function() {
				modals.forEach(function(element) {
					if (!element.classList.contains("active") && element.parentNode === host) host.removeChild(element);
				});
			}, 500);
		}
		function closeForm(force, action) {
			var state = modalState;
			if (state && (state.saving || state.reconciling) && action !== "saved" && action !== "cleanup") return false;
			if (!force && state && state.formState.dirty) {
				if (pendingDiscard) return false;
				showDiscardModal(action);
				return false;
			}
			pendingDiscard = null;
			hideDiscardModal();
			formRequestId += 1;
			var host = config.modalHost || rootElement.querySelector(".gpo-editor-preferences__modal-host");
			if (host) closeHostModals(host);
			modalState = null;
			setHeaderState();
			if (action !== "cleanup" && action !== "navigation") focusTable();
			return true;
		}
		function formInteractiveElements(state) {
			var elements = [];
			var roots = [state.formElement];
			if (state.formElement.parentNode) {
				var targettingModal = state.formElement.parentNode.querySelector(".targetting__modal");
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
			return state.closeButtons.indexOf(element) !== -1 || Boolean(element.classList && element.classList.contains("gpo-editor-status__action"));
		}
		function syncFormBusy(state) {
			if (!state) return;
			var busy = Boolean(state.saving || state.reconciling);
			var elements = formInteractiveElements(state);
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
			var refreshLocked = Boolean(state.requiresRefresh);
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
			var field = String(error.field);
			var message = error.message || pt("validationFixErrors");
			if (field === "name" || field.indexOf("name") !== -1) setNameError(state, message);
			state.controlsById.forEach(function(controls, id) {
				if (field === id || field.indexOf(id) !== -1) controls.forEach(function(control) {
					control.setError(message);
				});
			});
		}
		function renderFormError(state, error) {
			if (modalState !== state) return;
			state.errorSlot.innerHTML = "";
			var category = errorCategory(error).replace(/-/g, "_");
			var actions = { onReconcile: async function(event) {
				if (state.reconciling || state.saving) return;
				var button = event && event.currentTarget;
				if (button) button.disabled = true;
				state.reconciling = true;
				syncFormBusy(state);
				try {
					var conflict = recoveryConflict(await reconcile());
					if (conflict) throw conflict;
					if (modalState === state) {
						state.requiresRefresh = true;
						renderReconcileSuccess(state);
						await loadItems();
					}
				} catch (reconcileError) {
					renderFormError(state, reconcileError);
				} finally {
					state.reconciling = false;
					syncFormBusy(state);
					if (button && modalState === state) button.disabled = false;
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
			if (modalState !== state) return;
			state.errorSlot.innerHTML = "";
			state.errorSlot.appendChild(createElement$4("div", {
				className: ["gpo-editor-preference-notice", "gpo-editor-preference-notice--info"],
				attrs: { role: "status" },
				children: [createElement$4("span", { text: pt("reconcileSucceededRefresh") }), createElement$4("button", {
					className: ["button", "gpo-editor-status__action"],
					attrs: { type: "button" },
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
			if (!modalState || modalState.readonly) return true;
			var state = modalState;
			if (state.saving || state.reconciling || state.requiresRefresh || state.blockedDescriptors) return false;
			clearFormErrors(state);
			var draftFields = state.controls.map(function(control) {
				return {
					id: control.id,
					value: control.read()
				};
			});
			var filterResult = state.formState.readFilterResult();
			var result = buildPreferenceRequest({
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
			var errors = result.errors.concat(filterResult.errors || []);
			if (errors.length) {
				state.formElement.classList.add("gpo-editor-preference-form--invalid");
				state.validationSlot.textContent = pt("validationFixErrors");
				var firstControl = null;
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
				var response = state.creating ? await preferenceCreate(item.scope, item.preferenceKind, result.request) : await preferenceUpdate(item.scope, item.preferenceKind, result.request);
				var conflict = recoveryConflict(response);
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
				if (modalState === state) {
					state.saveButton.textContent = pt("save");
					syncFormBusy(state);
				}
			}
		}
		async function deleteSelected() {
			if (!documentDto.editable || selectedIdentity === null || modalState || opening || deleting || disposed) return;
			if (!window.confirm(pt("confirmDelete"))) return;
			var identity = clone$2(selectedIdentity);
			var before = items.map(function(entry) {
				return cacheKey(entry.identity);
			});
			var removed = false;
			deleting = true;
			setHeaderState();
			if (deleteButton) deleteButton.disabled = true;
			try {
				var response = await preferenceDelete(item.scope, item.preferenceKind, identity);
				invalidateCachedFields(identity);
				await loadItems();
				if (disposed || typeof config.isCurrent === "function" && !config.isCurrent()) return;
				var next = neighbor(before, [cacheKey(identity)], items.map(function(entry) {
					return cacheKey(entry.identity);
				}));
				var survivor = items.find(function(entry) {
					return cacheKey(entry.identity) === next;
				});
				selectedIdentity = survivor ? clone$2(survivor.identity) : null;
				renderTable();
				setHeaderState();
				removed = true;
				if (typeof config.onSaved === "function") config.onSaved(response);
			} catch (error) {
				showPageError(error);
			} finally {
				deleting = false;
				setHeaderState();
				if (deleteButton && ownsHeader()) deleteButton.disabled = false;
				if (removed && !disposed && (typeof config.isCurrent !== "function" || config.isCurrent())) focusTable();
			}
		}
		renderShell();
		var tableSlot = rootElement.querySelector(".gpo-editor-preferences__table");
		tableNavigation = bind$1(tableSlot, {
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
				return disposed || opening || deleting || Boolean(modalState);
			}
		});
		setHeaderState();
		addListener(createButton, "click", function() {
			if (createButton.classList.contains("active")) openForm(null);
		});
		addListener(editButton, "click", function() {
			if (editButton.classList.contains("active")) openForm(selectedIdentity);
		});
		addListener(deleteButton, "click", function() {
			if (deleteButton.classList.contains("active")) deleteSelected();
		});
		await loadItems();
		root.hasUnsavedChanges = function() {
			return Boolean(modalState && (modalState.formState.dirty || modalState.saving || modalState.reconciling || modalState.requiresRefresh));
		};
		root.applyChanges = saveForm;
		root.isBusy = function() {
			return Boolean(modalState && (modalState.saving || modalState.reconciling));
		};
		root.cancelChanges = function() {
			return closeForm(true, "navigation");
		};
		root.cleanup = function() {
			disposed = true;
			tableNavigation.cleanup();
			itemsRequestId += 1;
			formRequestId += 1;
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
		var config = options || {};
		var item = config.item || {};
		var closed = false;
		var editor = null;
		var nestedHost = createElement$4("div", { className: ["gp__preference", "gpo-editor-preferences__modal-host"] });
		var controls = createElement$4("div", {
			className: ["gp__control", "gpo-security-workbench__toolbar"],
			children: [
				createElement$4("button", {
					className: ["button", "preferences__btn-create"],
					attrs: { type: "button" },
					text: t$3("header.create")
				}),
				createElement$4("button", {
					className: ["button", "preferences__btn-edit"],
					attrs: { type: "button" },
					text: t$3("header.edit")
				}),
				createElement$4("button", {
					className: ["button", "preferences__btn-delete"],
					attrs: { type: "button" },
					text: t$3("header.delete")
				})
			]
		});
		var content = createElement$4("div", {
			className: "gpo-preferences-family-dialog__content",
			children: [controls, createElement$4("div", {
				className: "gpo-editor-empty",
				text: t$3("policySearch.loading")
			})]
		});
		var dialog = open$2(host, {
			title: item.title || item.document && item.document.label || item.preferenceKind,
			className: ["gpo-preferences-family-dialog"],
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
		var localDocument = Object.assign({}, item.document || {});
		if (item.readOnly) localDocument.editable = false;
		editor = await renderPreferencesTemplate$1({
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
	var createElement$3 = createElement$18;
	function tr$3(key, fallback) {
		var value = translations_exports && t$12("security." + key);
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
		var kind = definition && definition.value_type || "string";
		if (kind === "boolean") return {
			kind,
			value: false
		};
		if (kind === "integer") {
			var ranges = definition.input_ranges && definition.input_ranges.length ? definition.input_ranges : definition.ranges || [];
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
		var current = value || defaultTyped(definition);
		var kind = definition.value_type;
		var input;
		var readers;
		var writers;
		if (kind === "boolean") {
			input = createElement$3("select", { children: [createElement$3("option", {
				attrs: { value: "false" },
				text: control && control.false_label || tr$3("disabled", "Disabled")
			}), createElement$3("option", {
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
			input = createElement$3("select", { children: [createElement$3("option", {
				attrs: {
					value: "",
					disabled: "disabled"
				},
				text: "—"
			})].concat((definition.options || []).map(function(option) {
				return createElement$3("option", {
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
			var checks = [];
			input = createElement$3("div", { className: "gpo-editor-security-flags" });
			(definition.options || []).forEach(function(option) {
				var checkbox = createElement$3("input", { attrs: { type: "checkbox" } });
				checks.push({
					option,
					checkbox
				});
				input.append(createElement$3("label", {
					className: ["field", "field__checkbox"],
					children: [checkbox, createElement$3("span", { text: optionLabel(option) })]
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
				var selected = new Set(payload(next, []) || []);
				checks.forEach(function(item) {
					item.checkbox.getElement().checked = selected.has(item.option.id);
				});
			};
			input.securityInputs = checks.map(function(item) {
				return item.checkbox.getElement();
			});
		} else if (kind === "string_list" || kind === "principal_list") {
			input = createElement$3("textarea", { attrs: {
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
			input = createElement$3("textarea", { attrs: {
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
			input = createElement$3("input", { attrs: {
				type: kind === "integer" ? "number" : "text",
				autocomplete: "off",
				spellcheck: kind === "sddl" ? "false" : null
			} });
			writers = function(next) {
				input.getElement().value = String(payload(next, ""));
			};
			readers = function() {
				var raw = input.getElement().value;
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
				var target = (input.securityInputs || [input.getElement()])[0];
				if (target && target.focus) target.focus();
			}
		};
	}
	function validationError(definition, typed) {
		if (!definition || !typed || typed.kind !== definition.value_type) return tr$3("validationType", "The value type does not match the definition.");
		if (typed.kind === "integer") {
			if (!Number.isSafeInteger(typed.value)) return tr$3("validationInteger", "Enter a whole number.");
			var ranges = definition.input_ranges && definition.input_ranges.length ? definition.input_ranges : definition.ranges || [];
			if (ranges.length && !ranges.some(function(range) {
				return typed.value >= range.min && typed.value <= range.max;
			})) return tr$3("validationRange", "Enter a value in the allowed range.");
		}
		if ((typed.kind === "enum" || typed.kind === "flags") && definition.options) {
			var allowed = new Set(definition.options.map(function(option) {
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
		var row = {};
		(collection.fields || []).forEach(function(field) {
			row[field.id] = field.element.initial ? {
				state: "set",
				value: clone$1(field.element.initial)
			} : { state: "unset" };
		});
		return row;
	}
	function rowKey(collection, row) {
		var state = row && row[collection.unique_by];
		return state && state.state === "set" ? state.value : null;
	}
	function rowActions(collection, baseline, draft) {
		if (!collection.unique_by) return [];
		var previous = /* @__PURE__ */ new Map();
		var current = /* @__PURE__ */ new Map();
		(baseline || []).forEach(function(row) {
			var key = rowKey(collection, row);
			if (key) previous.set(JSON.stringify(key), row);
		});
		(draft || []).forEach(function(row) {
			var key = rowKey(collection, row);
			if (key) current.set(JSON.stringify(key), row);
		});
		var actions = [];
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
		var sorted = actual.map(function(range) {
			return [range.min, range.max];
		}).sort(function(left, right) {
			return left[0] - right[0] || left[1] - right[1];
		});
		var wanted = expected.slice().sort(function(left, right) {
			return left[0] - right[0] || left[1] - right[1];
		});
		return sorted.every(function(range, index) {
			return Number.isSafeInteger(range[0]) && Number.isSafeInteger(range[1]) && range[0] === wanted[index][0] && range[1] === wanted[index][1];
		});
	}
	function compatible(element, shape) {
		if (!element || element.id !== "value" || element.value_type !== shape[0] || element.required !== true || !element.initial || element.initial.kind !== shape[0] || !sameRanges(element.ranges, shape[1]) || !Array.isArray(element.options)) return false;
		if (!sameRanges(element.input_ranges, shape[2])) return false;
		var initial = element.initial.value;
		if (shape[0] === "integer") {
			var domain = element.input_ranges.length ? element.input_ranges.map(function(range) {
				return [range.min, range.max];
			}) : shape[1];
			return Number.isSafeInteger(initial) && domain.some(function(range) {
				return initial >= range[0] && initial <= range[1];
			}) && !element.options.length;
		}
		if (shape[0] === "boolean") return typeof initial === "boolean" && !element.options.length;
		var options = element.options;
		if (!Array.isArray(options) || options.some(function(option) {
			return !option || typeof option.id !== "string";
		})) return false;
		var choices = options.map(function(option) {
			return option.id;
		});
		return typeof initial === "string" && choices.indexOf(initial) !== -1 && choices.indexOf(AGE_BASED) !== -1 && choices.indexOf(AS_NEEDED) !== -1;
	}
	function group(model, namespace, prefix, names) {
		if (!model || !model.policies || typeof model.policies.get !== "function") return null;
		var policies = {};
		for (var i = 0; i < names.length; i += 1) {
			var id = prefix + "." + names[i];
			var policy = model.policies.get(namespace + "\0" + id);
			var elements = policy && policy.definition && policy.definition.elements;
			if (!policy || policy.namespace !== namespace || policy.policyId !== id || !Array.isArray(elements) || elements.length !== 1 || !SHAPES[id] || !compatible(elements[0], SHAPES[id])) return null;
			policies[names[i]] = policy;
		}
		return policies;
	}
	function draftFor(policy) {
		var defined = policy.state && policy.state.state === "defined";
		var current = defined && policy.state.elements || {};
		var elements = {};
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
		var state = draft && draft.defined && draft.elements && draft.elements.value;
		return state && state.state === "set" && state.value ? state.value.value : null;
	}
	function initialOf(policy) {
		var element = (policy.definition.elements || []).find(function(item) {
			return item.id === "value";
		});
		return element && element.initial ? element.initial.value : null;
	}
	function set(draft, policy, value) {
		var element = policy.definition.elements.find(function(item) {
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
		var value = valueOf(draft);
		return Number.isSafeInteger(value) ? value : initialOf(policy);
	}
	function finish(policies, names, primaryName, desired) {
		var changes = names.filter(function(name) {
			if (name === primaryName) return false;
			var previous = draftFor(policies[name]);
			var next = desired[name];
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
		var desired = {};
		names.forEach(function(name) {
			desired[name] = draftFor(policies[name]);
		});
		desired[primaryName] = clone(primaryDraft);
		return desired;
	}
	function password(model, policy, draft) {
		var names = ["maximum_password_age", "minimum_password_age"];
		var policies = group(model, BASE + "account-password", "account.password", names);
		if (!policies) return null;
		var primary = names.find(function(name) {
			return policies[name] === policy;
		});
		if (!primary) return null;
		var other = names.find(function(name) {
			return name !== primary;
		});
		var desired = begin(policies, names, primary, draft);
		if (!draft.defined) {
			unset(desired[other]);
			return finish(policies, names, primary, desired);
		}
		var chosen = valueOf(draft);
		if (!Number.isSafeInteger(chosen)) return null;
		var counterpart = number(desired[other], policies[other]);
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
		var names = [
			"max_ticket_age",
			"max_service_age",
			"max_renew_age"
		];
		var policies = group(model, BASE + "account-kerberos", "account.kerberos", names);
		if (!policies) return null;
		var primary = names.find(function(name) {
			return policies[name] === policy;
		});
		if (!primary) return null;
		var desired = begin(policies, names, primary, draft);
		if (!draft.defined) {
			names.forEach(function(name) {
				if (name !== primary) unset(desired[name]);
			});
			return finish(policies, names, primary, desired);
		}
		var chosen = valueOf(draft);
		if (!Number.isSafeInteger(chosen)) return null;
		var ticket = number(desired.max_ticket_age, policies.max_ticket_age);
		var service = number(desired.max_service_age, policies.max_service_age);
		var renew = number(desired.max_renew_age, policies.max_renew_age);
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
			var next = name === "max_ticket_age" ? ticket : name === "max_service_age" ? service : renew;
			if (name !== primary) set(desired[name], policies[name], next);
		});
		return finish(policies, names, primary, desired);
	}
	function lockout(model, policy, draft) {
		var names = [
			"lockout_bad_count",
			"reset_lockout_count",
			"lockout_duration",
			"allow_administrator_lockout"
		];
		var policies = group(model, BASE + "account-lockout", "account.lockout", names);
		if (!policies) return null;
		var primary = names.find(function(name) {
			return policies[name] === policy;
		});
		if (!primary) return null;
		var desired = begin(policies, names, primary, draft);
		var threshold = number(desired.lockout_bad_count, policies.lockout_bad_count);
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
		var reset = number(desired.reset_lockout_count, policies.reset_lockout_count);
		var duration = number(desired.lockout_duration, policies.lockout_duration);
		var administrator = valueOf(desired.allow_administrator_lockout);
		if (typeof administrator !== "boolean") administrator = initialOf(policies.allow_administrator_lockout);
		if (duration > 0 && duration < reset) {
			if (primary === "lockout_duration") reset = duration;
			else duration = reset;
		}
		if (threshold < 1 || threshold > 999 || reset < 1 || reset > 99999 || duration < 0 || duration > 99999) return null;
		var planned = {
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
		var namespace = BASE + "event-log";
		for (var i = 0; i < 3; i += 1) {
			var stream = [
				"security",
				"application",
				"system"
			][i];
			var names = [stream + "_log_audit_log_retention_period", stream + "_log_retention_days"];
			var policies = group(model, namespace, "event_log", names);
			if (!policies) continue;
			var primary = names.find(function(name) {
				return policies[name] === policy;
			});
			if (!primary) continue;
			var other = names.find(function(name) {
				return name !== primary;
			});
			var desired = begin(policies, names, primary, draft);
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
		var headerElement = header && header.getElement ? header.getElement() : null;
		var controls = headerElement && headerElement.querySelector(".gp__control");
		var local = !controls;
		if (local) {
			var wrapper = createElement$18("div", { className: "gp__control" });
			fallbackHost.append(wrapper);
			controls = wrapper.getElement();
		}
		var owner = "security-" + ++sequence;
		controls.setAttribute("data-security-owner", owner);
		controls.style.display = "flex";
		var states = {};
		[
			"create",
			"edit",
			"delete"
		].forEach(function(action) {
			var button = controls.querySelector(".preferences__btn-" + action);
			if (!button) {
				var element = createElement$18("button", {
					className: ["button", "preferences__btn-" + action],
					attrs: { type: "button" }
				});
				controls.appendChild(element.getElement());
				button = element.getElement();
			}
			var initial = {
				text: button.textContent,
				display: button.style.display,
				disabled: button.disabled,
				active: button.classList.contains("active")
			};
			var handler = handlers[action];
			button.textContent = t$12(action === "create" ? "security.addItem" : action === "delete" ? "security.remove" : "header.edit");
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
				var enabled = !busy && Boolean(handlers[action]) && (action === "create" || Boolean(selection && selection[action]));
				states[action].button.disabled = !enabled;
				states[action].button.classList.toggle("active", enabled);
			});
		}
		update(null, false);
		return {
			update,
			cleanup: function() {
				Object.keys(states).forEach(function(action) {
					var state = states[action];
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
	var create$1 = createElement$18;
	function tr$2(key, fallback) {
		var text = t$12("security." + key);
		return text && text !== "security." + key ? text : fallback;
	}
	function typedSummary(definition, state) {
		if (!state || state.state !== "set") return tr$2("notConfigured", "Not configured");
		var value = state.value.value;
		if (state.value.kind === "boolean") return value ? tr$2("enabled", "Enabled") : tr$2("disabled", "Disabled");
		if (state.value.kind === "enum" || state.value.kind === "flags") return (Array.isArray(value) ? value : [value]).map(function(id) {
			var option = (definition.options || []).find(function(option) {
				return option.id === id;
			});
			return option ? option.display_name || id : id;
		}).join(", ");
		if (state.value.kind === "sddl") return tr$2("permissionsDefined", "Permissions defined");
		if (Array.isArray(value)) return value.length ? value.join(", ") : tr$2("emptyValue", "Empty list");
		return String(value);
	}
	function policySummary(policy) {
		if (policy.state.state !== "defined") return tr$2("notConfigured", "Not configured");
		return (policy.definition.elements || []).filter(function(definition) {
			var state = policy.state.elements && policy.state.elements[definition.id];
			return state && state.state === "set";
		}).map(function(definition) {
			return typedSummary(definition, policy.state.elements[definition.id]);
		}).join("; ") || "—";
	}
	function configuredRows(policy, definition) {
		var state = elementState(policy, definition.id);
		return state.state === "set" ? state.value.value || [] : [];
	}
	async function openPolicyDialog(host, options, renderEditor) {
		var config = options || {}, item = config.item || {};
		var model = item.securityModel || buildSecurityModel(await securityDefinitionsShow());
		if (config.isCurrent && !config.isCurrent()) return null;
		var policy$3 = policy(model, item.securityPolicy);
		if (!policy$3) throw new Error(tr$2("missingPolicy", "The security definition is no longer available."));
		var definition = item.securityCollection && collectionElement(policy$3);
		var title = policy$3.definition.display_name || policy$3.policyId;
		var editor;
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
				var row = config.rowIndex === void 0 ? config.initialRow : configuredRows(policy$3, definition)[config.rowIndex];
				var key = row && rowKey(definition, row);
				title = key ? String(key.value) : tr$2("addItem", "Add item") + " — " + title;
			}
		}
		if (!editor) return null;
		if (config.isCurrent && !config.isCurrent()) {
			if (editor.cleanup) editor.cleanup();
			return null;
		}
		var readOnly = Boolean(config.browseCollection && definition) || editor.readOnly;
		var dialog = open(host, {
			title,
			content: editor,
			readOnly,
			cancelLabel: readOnly ? tr$2("close", "Close") : void 0,
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
		var config = options || {}, item = config.item || {};
		var model = !item.searchReturnTo && item.securityModel || buildSecurityModel(await securityDefinitionsShow());
		if (config.isCurrent && !config.isCurrent()) return null;
		if (!item.searchReturnTo) item.securityModel = model;
		if (item.securityPreserved) return renderEditor(config);
		var root = create$1("div", { className: [
			"gp__preference",
			"gpo-security-workbench",
			config.embedded ? "gpo-security-workbench--embedded" : null
		] });
		var panel = create$1("div", { className: "gpo-security-workbench__panel" });
		var toolbar = create$1("div", { className: "gpo-security-workbench__toolbar" });
		var table = create$1("table", { className: [
			"preference__table",
			"gpo-catalog-table",
			"gpo-security-table"
		] });
		var body = create$1("tbody");
		var error = create$1("div", {
			className: "gpo-security-error",
			attrs: { role: "alert" }
		});
		var modalHost = create$1("div");
		var activeDialog = null, activeEditor = null, disposed = false, opening = false;
		var selection = null;
		var selectedId = null, pendingNeighbor = null;
		var search = create$1("input", { attrs: {
			type: "search",
			"data-policy-filter": "",
			placeholder: tr$2("filter", "Filter settings"),
			"aria-label": tr$2("filter", "Filter settings")
		} });
		if (!config.embedded && !config.hideHeading) toolbar.append(create$1("h2", {
			text: config.categoryPath || item.title || tr$2("title", "Security Settings"),
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
		var collection = item.securityCollection && collectionElement(selectedPolicy());
		var collectionWritable = collection && collection.unique_by && writableElement(selectedPolicy(), collection.id);
		var actions = bind(config.header, toolbar, {
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
		var policies = item.securityCategory ? (item.children || []).filter(function(child) {
			return child.securityPolicy && !child.securityCollection;
		}) : collection ? [] : [item];
		function updateModel(response) {
			var next = buildSecurityModel(response);
			Object.keys(next).forEach(function(key) {
				model[key] = next[key];
			});
		}
		async function edit(node, rowIndex, initialRow) {
			if (activeDialog || opening || disposed) return;
			var returnLabel = selection && selection.element.getAttribute("data-security-row");
			opening = true;
			syncActions();
			try {
				var opened = await openPolicyDialog(modalHost, {
					item: Object.assign({}, node, { securityModel: model }),
					rowIndex,
					initialRow,
					isCurrent: function() {
						return !disposed;
					},
					restoreFocus: function() {
						var rows = Array.from(body.getElement().querySelectorAll("[data-security-row]"));
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
			var policy = selectedPolicy();
			var key = rowKey(collection, configuredRows(policy, collection)[index]);
			var content = create$1("div", { children: [create$1("p", { text: tr$2("removeQuestion", "Remove this item from the policy?") }), create$1("p", { text: String(key.value) })] });
			var failure = create$1("div", {
				className: "gpo-security-error",
				attrs: { role: "alert" }
			});
			content.append(failure);
			var beforeIds = Array.from(body.getElement().querySelectorAll("[data-list-id]")).map(function(row) {
				return row.getAttribute("data-list-id");
			});
			var removedId = selectedId;
			activeDialog = open(modalHost, {
				title: tr$2("removeItem", "Remove item"),
				content,
				applyLabel: tr$2("remove", "Remove"),
				onApply: async function() {
					try {
						var response = await securityDefinitionsUpdate({
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
			var row = create$1("tr", {
				attrs: {
					tabindex: "-1",
					"data-security-row": label,
					"data-list-id": id || label,
					"aria-selected": "false"
				},
				children: [create$1("td", {
					attrs: { title: label },
					text: label
				}), create$1("td", {
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
			var heldFocus = table.getElement().contains(document.activeElement);
			body.getElement().innerHTML = "";
			if (collection) {
				var rows = configuredRows(selectedPolicy(), collection);
				var names = /* @__PURE__ */ new Set();
				rows.map(function(row, index) {
					return {
						row,
						index
					};
				}).sort(function(a, b) {
					return String(rowKey(collection, a.row).value).localeCompare(String(rowKey(collection, b.row).value));
				}).forEach(function(entry) {
					var key = rowKey(collection, entry.row);
					names.add(String(key.value).toLowerCase());
					var summaries = collection.fields.filter(function(field) {
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
					var row = newRow(collection);
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
					addRow(service.display_name ? service.display_name + " (" + service.name + ")" : service.name, tr$2("notConfigured", "Not configured"), function() {
						edit(item, void 0, row);
					}, null, "service:" + service.name);
				});
			} else {
				(item.children || []).filter(function(child) {
					return child.type === "folder";
				}).forEach(function(child) {
					addRow(child.title, tr$2("folder", "Folder"), function() {
						if (config.onNavigate) config.onNavigate(child);
					}, null, "folder:" + (child.id || child.title));
				});
				policies.forEach(function(node) {
					var policy$2 = policy(model, node.securityPolicy);
					if (policy$2) addRow(policy$2.definition.display_name || policy$2.policyId, policySummary(policy$2), function() {
						edit(node);
					}, null, "policy:" + policy$2.namespace + ":" + policy$2.policyId);
				});
			}
			if (pendingNeighbor) {
				var all = Array.from(body.getElement().querySelectorAll("[data-list-id]"));
				selectedId = neighbor(pendingNeighbor.before, pendingNeighbor.removed, all.map(function(row) {
					return row.getAttribute("data-list-id");
				}));
				if (selection) {
					selection.element.classList.remove("active");
					selection.element.setAttribute("aria-selected", "false");
				}
				selection = null;
				var neighbor$1 = all.find(function(row) {
					return row.getAttribute("data-list-id") === selectedId;
				});
				if (neighbor$1) /** @type {any} */ neighbor$1.__select();
				pendingNeighbor = null;
			}
			if (!selection) selectedId = null;
			if (!body.getElement().children.length) body.append(create$1("tr", { children: [create$1("td", {
				attrs: { colspan: "2" },
				className: "gpo-security-table__empty",
				text: search.getElement().value ? tr$2("noMatches", "No matching settings.") : tr$2("noItems", "No items are configured.")
			})] }));
			navigation.sync();
			if (heldFocus) navigation.focusSelected();
		}
		if (collection) {
			if (collection.unique_by === "service_name" && !serviceCatalog().length) panel.append(create$1("p", {
				className: "gpo-security-workbench__notice",
				text: tr$2("serviceCatalogMissing", "The service catalog has not been supplied. Configured services are shown below; additional services can be added by name.")
			}));
		}
		table.append(create$1("thead", { children: [create$1("tr", { children: [create$1("th", { text: collection ? tr$2("item", "Item") : tr$2("policy", "Policy") }), create$1("th", { text: tr$2("policySetting", "Policy setting") })] })] }));
		table.append(body);
		var navigation = bind$1(table.getElement(), {
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
			var saved = await activeEditor.applyChanges();
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
	var createElement$2 = createElement$18;
	function tr$1(key, fallback) {
		var translated = t$12(key);
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
		var elements = {};
		(policy.definition.elements || []).forEach(function(element) {
			elements[element.id] = stateFor(policy, element);
		});
		return {
			defined: policy.state.state === "defined",
			elements
		};
	}
	function canCreateRow(collection, controls) {
		var writable = /* @__PURE__ */ new Set();
		function visit(items, parentReadOnly) {
			(items || []).forEach(function(control) {
				var readOnly = parentReadOnly || control.read_only;
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
		var label = control.label || element.id;
		if (label === "value") label = tr$1("security.value", "Value");
		if (!state || state.state !== "set" || element.value_type !== "integer") return label;
		var match = (control.labels_when || []).find(function(item) {
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
			var rows = rowActions(element, before.value.value || [], after.value.value || []);
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
		var update = {
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
			var action = elementAction(element, baseline.elements[element.id] || { state: "unset" }, draft.elements[element.id] || { state: "unset" });
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
			if (state.state !== "set") return required ? label + ": " + tr$1("security.validationRequired", "A value is required.") : null;
			var typeError = validationError(element, state.value);
			if (typeError) return label + ": " + typeError;
			if (element.value_type !== "collection") return null;
			if (!Array.isArray(state.value.value)) return label + ": " + tr$1("security.validationRows", "Enter valid collection rows.");
			if (!state.value.value.length) return tr$1("security.validationRows", "Add at least one item, or leave this policy not configured.");
			var seen = /* @__PURE__ */ new Set();
			for (var row of state.value.value) {
				if (element.unique_by === "group" && (element.fields || []).some(function(field) {
					return field.id === "members";
				}) && (!row.members || row.members.state !== "set") && (!row.member_of || row.member_of.state !== "set")) return tr$1("security.validationGroupRelationship", "Define Members or Member of. An explicitly empty list is allowed.");
				if (element.unique_by) {
					var key = rowKey(element, row);
					if (!key) return label + ": " + tr$1("security.validationKey", "Every row requires its unique key.");
					var encoded = JSON.stringify(key);
					if (seen.has(encoded)) return element.duplicate_message || tr$1("security.validationDuplicate", "Collection row keys must be unique.");
					seen.add(encoded);
				}
				for (var field of element.fields || []) {
					var fieldError = validateState(field.element, row && row[field.id] || { state: "unset" }, field.display_name || field.id, field.required);
					if (fieldError) return fieldError;
				}
			}
			return null;
		}
		for (var element of policy.definition.elements || []) {
			var error = validateState(element, draft.elements[element.id] || { state: "unset" }, element.id, element.required);
			if (error) return error;
		}
		return null;
	}
	function renderPreserved(model) {
		var root = createElement$2("div", {
			className: ["gp__preference", "gpo-editor-preferences"],
			attrs: { "data-security-preserved": "" }
		});
		root.append(createElement$2("h2", { text: tr$1("security.preservedTitle", "Preserved and diagnostic records") }));
		if ((model.diagnostics || []).length) root.append(renderDiagnostics(model.diagnostics));
		var list = createElement$2("dl", { className: "gpo-editor-security-preserved" });
		(model.preserved || []).forEach(function(record) {
			list.append(createElement$2("dt", { text: record.section + " — " + record.identity }));
			list.append(createElement$2("dd", { children: [createElement$2("p", { text: record.damaged ? tr$1("security.damaged", "Damaged record") : tr$1("security.preservedReadOnly", "This setting is preserved and is read-only.") }), renderDiagnostics([{ message: record.reason }])] }));
		});
		root.append(list);
		return root;
	}
	async function renderPolicyEditor(options) {
		var config = options || {};
		var item = config.item || {};
		var model = item.securityModel;
		if (!model) {
			model = buildSecurityModel(await securityDefinitionsShow());
			if (typeof config.isCurrent === "function" && !config.isCurrent()) return null;
			item.securityModel = model;
		}
		if (item.securityPreserved) return renderPreserved(model);
		var policy$1 = policy(model, item.securityPolicy);
		if (!policy$1) return createElement$2("div", {
			className: "gpo-editor-preferences__error",
			text: tr$1("security.missingPolicy", "The security definition is no longer available.")
		});
		var root = createElement$2("div", {
			className: "gpo-security-policy-editor",
			attrs: {
				"data-security-policy": policy$1.policyId,
				"data-security-namespace": policy$1.namespace
			}
		});
		var baseline = initialDraft(policy$1);
		var draft = clone$1(baseline);
		var rowElement = config.collectionElement;
		var rowWritable = !rowElement || Boolean(rowElement.unique_by) && writableElement(policy$1, rowElement.id);
		var editedRow = null;
		if (rowElement) {
			var rowState = draft.elements[rowElement.id];
			var rowValues = rowState && rowState.state === "set" ? rowState.value.value : [];
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
		var saving = false;
		var pendingConfirmation = null;
		var errorSlot;
		var rootBindings = /* @__PURE__ */ new Map();
		function isDirty() {
			return !same(baseline, draft);
		}
		function scalarControl(control, element, context) {
			var state = context.getState(element.id);
			var writable = context.writable && !control.read_only;
			var required = element.required === true;
			var configured = createElement$2("input", { attrs: { type: "checkbox" } });
			var labelText = createElement$2("span", { text: controlLabel(control, element, state) });
			configured.getElement().checked = state.state === "set" || required;
			configured.getElement().disabled = !writable;
			var editor = inputFor(element, control, state.state === "set" ? state.value : defaultTyped(element), !writable || !required && state.state !== "set");
			editor.root.getElement().setAttribute("aria-label", controlLabel(control, element, state));
			var binding = { update: function(next, source) {
				configured.getElement().checked = next.state === "set" || required;
				configured.getElement().disabled = !writable;
				labelText.getElement().textContent = controlLabel(control, element, next);
				if (!source) editor.write(next.state === "set" ? next.value : defaultTyped(element));
				editor.setDisabled(!writable || !required && next.state !== "set");
			} };
			registerBinding(context.bindings, element.id, binding);
			function changed() {
				var next = configured.getElement().checked ? {
					state: "set",
					value: editor.read()
				} : { state: "unset" };
				context.setState(element.id, next);
				syncBindings(context.bindings, element.id, binding, next);
			}
			configured.on("change", changed);
			editor.root.getElement().addEventListener("input", changed);
			editor.root.getElement().addEventListener("change", changed);
			return createElement$2("div", {
				className: ["gpo-editor-field", !writable ? "gpo-editor-field--readonly" : null],
				attrs: { "data-security-element": element.id },
				children: [
					createElement$2("label", {
						className: ["field", "field__checkbox"],
						children: [required ? null : configured, labelText]
					}),
					createElement$2("div", {
						className: "field__element",
						children: [editor.root]
					}),
					control.integer_suffix ? createElement$2("span", {
						className: "gpo-editor-security-suffix",
						text: control.integer_suffix
					}) : null,
					rangeText(control, element) ? createElement$2("span", {
						className: "gpo-editor-security-range",
						text: rangeText(control, element)
					}) : null
				]
			});
		}
		function collectionControl(control, element, context) {
			var container = createElement$2("div", {
				className: "gpo-editor-security-collection",
				attrs: { "data-security-element": element.id }
			});
			var writable = context.writable && !control.read_only && Boolean(element.unique_by);
			var state = context.getState(element.id);
			var configured = createElement$2("input", { attrs: { type: "checkbox" } });
			configured.getElement().checked = state.state === "set";
			configured.getElement().disabled = !writable;
			var rows = state.state === "set" ? clone$1(state.value.value || []) : [];
			var rowsHost = createElement$2("div", { className: "gpo-editor-security-collection__rows" });
			var add = createElement$2("button", {
				className: "button",
				attrs: { type: "button" },
				text: tr$1("security.addRow", "Add row")
			});
			var binding = { update: function(next, source) {
				configured.getElement().checked = next.state === "set";
				if (!source) {
					rows = next.state === "set" ? clone$1(next.value.value || []) : [];
					renderRows();
				}
				add.getElement().disabled = !writable || !configured.getElement().checked || !canCreateRow(element, control.children);
			} };
			registerBinding(context.bindings, element.id, binding);
			function sync() {
				var next = configured.getElement().checked ? {
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
					var rowRoot = createElement$2("div", { className: "gpo-editor-security-collection__row" });
					var fields = (element.fields || []).map(function(field) {
						return Object.assign({}, field.element, { id: field.id });
					});
					var rowContext = {
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
					rowRoot.append(createElement$2("button", {
						className: "button",
						attrs: {
							type: "button",
							disabled: rowContext.writable ? null : "disabled"
						},
						text: tr$1("security.removeRow", "Remove row"),
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
			container.append(createElement$2("label", {
				className: ["field", "field__checkbox"],
				children: [configured, createElement$2("span", { text: control.label || element.id })]
			}));
			if (!element.unique_by) container.append(createElement$2("div", {
				className: ["gpo-editor-preference-notice", "gpo-editor-preference-notice--warning"],
				text: tr$1("security.readOnlyCollection", "This collection has no stable row key and is read-only.")
			}));
			container.append(rowsHost);
			container.append(add);
			renderRows();
			return container;
		}
		function renderControl(control, elements, context) {
			if (control.kind === "text") return createElement$2("p", { text: control.text || control.label || "" });
			if (control.kind === "group") {
				var childContext = Object.assign({}, context, { writable: context.writable && !control.read_only });
				return createElement$2("fieldset", {
					className: "gpo-editor-security-group",
					children: [control.label ? createElement$2("legend", { text: control.label }) : null].concat((control.children || []).map(function(child) {
						return renderControl(child, elements, childContext);
					}))
				});
			}
			var element = (elements || []).find(function(item) {
				return item.id === control.element_id;
			});
			if (!element) return createElement$2("div", {
				className: ["gpo-editor-preference-notice", "gpo-editor-preference-notice--warning"],
				text: tr$1("security.unresolvedElement", "This setting cannot be displayed:") + " " + (control.element_id || "")
			});
			return element.value_type === "collection" ? collectionControl(control, element, context) : scalarControl(control, element, context);
		}
		function proposedUnit(policyId) {
			if (/^account\.password\.(minimum|maximum)_password_age$/.test(policyId) || /^account\.kerberos\.max_renew_age$/.test(policyId) || /^event_log\.(security|application|system)_log_retention_days$/.test(policyId)) return tr$1("security.dependency.days", "day(s)");
			if (/^account\.kerberos\.max_ticket_age$/.test(policyId)) return tr$1("security.dependency.hours", "hour(s)");
			if (/^account\.kerberos\.max_service_age$/.test(policyId) || /^account\.lockout\.(reset_lockout_count|lockout_duration)$/.test(policyId)) return tr$1("security.dependency.minutes", "minute(s)");
			if (/^account\.lockout\.lockout_bad_count$/.test(policyId)) return tr$1("security.dependency.attempts", "attempt(s)");
			return "";
		}
		function proposedValue(change) {
			if (!change.draft.defined) return tr$1("security.dependency.notConfigured", "Not configured");
			return (change.policy.definition.elements || []).filter(function(element) {
				return change.draft.elements[element.id] && change.draft.elements[element.id].state === "set";
			}).map(function(element) {
				var typed = change.draft.elements[element.id].value;
				if (typed.kind === "boolean") return typed.value ? tr$1("security.enabled", "Enabled") : tr$1("security.disabled", "Disabled");
				if (typed.kind === "enum") {
					var option = (element.options || []).find(function(item) {
						return item.id === typed.value;
					});
					return option ? option.display_name || option.id : typed.value;
				}
				if (typed.kind === "integer") {
					var unit = proposedUnit(change.policy.policyId);
					return String(typed.value) + (unit ? " " + unit : "");
				}
				return String(typed.value);
			}).join("; ") || "—";
		}
		function confirmDependencies(changes) {
			return new Promise(function(resolve) {
				var host = root.getElement().closest(".gpo-security-dialog-host");
				if (!host) {
					resolve(false);
					return;
				}
				var modal = root.getElement().closest(".gpo-security-dialog");
				var table = createElement$2("table", {
					className: ["preference__table", "gpo-security-table"],
					children: [createElement$2("thead", { children: [createElement$2("tr", { children: [createElement$2("th", { text: tr$1("security.dependency.policy", "Policy") }), createElement$2("th", { text: tr$1("security.dependency.value", "Value") })] })] }), createElement$2("tbody", { children: changes.map(function(change) {
						return createElement$2("tr", { children: [createElement$2("td", { text: change.policy.definition.display_name || change.policy.policyId }), createElement$2("td", { text: proposedValue(change) })] });
					}) })]
				});
				var content = createElement$2("div", { children: [createElement$2("p", { text: tr$1("security.dependency.intro", "To save this policy, apply the following related settings as well.") }), table] });
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
						title: tr$1("security.dependency.title", "Related policy settings"),
						content,
						confirmLabel: tr$1("security.dependency.apply", "Apply changes"),
						cancelLabel: tr$1("security.dependency.cancel", "Cancel"),
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
			var error = validateDraft(policy$1, draft);
			if (error) {
				errorSlot.getElement().textContent = error;
				errorSlot.getElement().focus();
				return false;
			}
			saving = true;
			try {
				var plan$1 = plan(model, policy$1, draft);
				var changes = plan$1 && plan$1.changes || [];
				for (var change of changes) {
					var dependentError = validateDraft(change.policy, change.draft);
					if (dependentError) {
						errorSlot.getElement().textContent = dependentError;
						errorSlot.getElement().focus();
						return false;
					}
				}
				if (changes.length && !await confirmDependencies(changes)) return false;
				var request = updateRequest(model, policy$1, baseline, draft);
				changes.forEach(function(change) {
					var previous = initialDraft(change.policy);
					request.policies.push(updateRequest(model, change.policy, previous, change.draft).policies[0]);
				});
				var response = await securityDefinitionsUpdate(request);
				var refreshed = buildSecurityModel(response);
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
				var diagnostics = failure && failure.details && Array.isArray(failure.details.diagnostics) ? failure.details.diagnostics : [];
				if (diagnostics.length) errorSlot.append(renderDiagnostics(diagnostics));
				return false;
			} finally {
				saving = false;
			}
		}
		function renderContent() {
			root.getElement().innerHTML = "";
			rootBindings = /* @__PURE__ */ new Map();
			errorSlot = createElement$2("div", {
				className: "gpo-editor-preferences__error",
				attrs: {
					role: "alert",
					tabindex: "-1"
				}
			});
			(policy$1.definition.notices || []).forEach(function(notice) {
				root.append(createElement$2("div", {
					className: ["gpo-editor-preference-notice", "gpo-editor-preference-notice--warning"],
					text: notice
				}));
			});
			if (policy$1.diagnostics.length) root.append(renderDiagnostics(policy$1.diagnostics));
			root.append(errorSlot);
			var defined = createElement$2("input", { attrs: {
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
				var currentDefine = root.getElement().querySelector("[data-security-define]");
				if (currentDefine) currentDefine.focus();
			});
			if (!rowElement) root.append(createElement$2("label", {
				className: [
					"field",
					"field__checkbox",
					"gpo-security-policy-editor__define"
				],
				children: [defined, createElement$2("span", { text: tr$1("security.definePolicy", "Define this policy") })]
			}));
			var displayedControls = policy$1.controls;
			var displayedElements = policy$1.definition.elements;
			if (rowElement) {
				var collectionControlDefinition;
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
			var controls = createElement$2("div", {
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
			var explanation = [
				policy$1.definition.explain_text,
				policy$1.definition.allowed_values,
				policy$1.definition.default_text
			].filter(Boolean);
			var settingsPanel = createElement$2("div");
			while (root.getElement().firstChild) settingsPanel.getElement().appendChild(root.getElement().firstChild);
			var explanationPanel = createElement$2("div", {
				className: "gpo-security-explanation",
				children: [createElement$2("h3", { text: policy$1.definition.display_name || policy$1.policyId })].concat((explanation.length ? explanation : [tr$1("security.noExplanation", "No explanation is available for this setting.")]).map(function(text) {
					return createElement$2("p", { text });
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
	var __export_renderSecurityTemplate = function(options) {
		return render(options, renderPolicyEditor);
	};
	var __export_openSecurityDialog = function(host, options) {
		return openPolicyDialog(host, options, renderPolicyEditor);
	};
	//#endregion
	//#region src/components/templates/all-policies/model.js
	function text(key, fallback) {
		var value = translations_exports && t$12(key);
		return value && value !== key ? value : fallback;
	}
	function language() {
		return translations_exports && typeof getLanguage === "function" ? getLanguage() : void 0;
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
		var categoryPath = [text(scope === "computer" ? "policies.machine" : "policies.user", scope)];
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
		var model = buildSecurityModel(response);
		var categories = /* @__PURE__ */ new Map();
		((response && response.security_catalog || {}).categories || []).forEach(function(category) {
			categories.set(identity$1(category.namespace, category.id), category);
		});
		function categoryPath(policy) {
			var path = [];
			var current = reference(policy.definition.category);
			var visited = /* @__PURE__ */ new Set();
			while (current) {
				var key = identity$1(current.namespace, current.id);
				if (visited.has(key)) break;
				visited.add(key);
				var category = categories.get(key);
				if (!category) break;
				path.unshift(category.display_name || category.id);
				current = reference(category.parent);
			}
			return [text("security.title", "Security Settings")].concat(path);
		}
		return Array.from(model.policies.values()).map(function(policy) {
			var collection = collectionElement(policy);
			var properties = {
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
		var item = value || {};
		if (item.kind === "subcategory") {
			var target = item.target || { kind: "system" };
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
		var rows = [];
		var duplicates = /* @__PURE__ */ new Map();
		families(response).forEach(function(family) {
			family.rows.forEach(function(item) {
				var key = auditIdentity(item);
				var parts = [family.id, key];
				var occurrenceKey = JSON.stringify(parts);
				var occurrence = duplicates.get(occurrenceKey) || 0;
				duplicates.set(occurrenceKey, occurrence + 1);
				if (occurrence) parts.push(occurrence);
				var path = [
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
		var events = scope === "computer" ? ["startup", "shutdown"] : scope === "user" ? ["logon", "logoff"] : [];
		var labels = {
			startup: "startupScripts",
			shutdown: "shutdownScripts",
			logon: "logonScript",
			logoff: "logoffScript"
		};
		return events.map(function(event) {
			return row("scripts", scope, [event], text("systemSettings." + labels[event], event), [text("policies.windowsSettings", "System Settings"), text(scope === "computer" ? "policies.scriptsComputer" : "policies.scriptsUser", "Scripts")], {
				scriptEvent: event,
				icon: __export_scriptEvent(event),
				openPolicyDialog: true
			});
		});
	}
	function preferenceCategory(document) {
		var id = document.category_id || "other_settings";
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
				icon: __export_preference(document.kind),
				document: JSON.parse(JSON.stringify(document)),
				readOnly: !document.editable || document.applicable === false
			});
		});
	}
	function normalized(value) {
		return String(value === void 0 || value === null ? "" : value).normalize("NFC").toLocaleLowerCase(language()).replace(/\s+/g, " ").trim();
	}
	function matches(item, query) {
		var needle = normalized(query);
		if (!needle) return true;
		return normalized([item && item.title || ""].concat(pathLabels(item && item.path)).join(" ")).indexOf(needle) !== -1;
	}
	function sortRows(rows) {
		var locale = language();
		return (Array.isArray(rows) ? rows : []).slice().sort(function(left, right) {
			return String(left.title).localeCompare(String(right.title), locale) || pathLabels(left.path).join(" / ").localeCompare(pathLabels(right.path).join(" / "), locale) || String(left.id).localeCompare(String(right.id), locale);
		});
	}
	//#endregion
	//#region src/components/templates/advanced-audit-template.js
	var createElement$1 = createElement$18;
	var t$2 = t$12;
	function tr(key, fallback) {
		var value = t$2(key);
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
			var setting = row.setting || {};
			if (setting.kind === "system") return systemSettingLabel(setting.value);
			var enabled = [];
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
	async function renderAdvancedAuditTemplate$1(options) {
		var config = options || {};
		var item = config.item || {};
		if (item.advancedAuditError) return createElement$1("div", {
			className: "gpo-security-error",
			text: tr("security.auditUnavailable", "Advanced Audit is temporarily unavailable. Other security settings remain available.")
		});
		var response = item.advancedAuditResponse || await advancedAuditShow();
		if (typeof config.isCurrent === "function" && !config.isCurrent()) return null;
		var family = familyById(response, item.advancedAuditFamilyId);
		var externalHost = config.dialogHost;
		var disposed = false;
		var root = externalHost ? {} : createElement$1("div", { className: ["gp__preference", "gpo-security-workbench"] });
		var activeDialog = null;
		var dirty = function() {
			return false;
		};
		var applyCurrent = null;
		var selection = null;
		var selectedId = null, navigation;
		var modalHost = externalHost || createElement$1("div");
		var errorSlot, body, search, actions;
		if (!externalHost) {
			var data = createElement$1("div", {
				className: "gpo-security-workbench__panel",
				attrs: { "data-advanced-audit-view": item.advancedAuditFamilyId || "" }
			});
			errorSlot = createElement$1("div", { className: "gpo-editor-preferences__error" });
			body = createElement$1("tbody");
			var table = createElement$1("table", {
				className: [
					"preference__table",
					"gpo-catalog-table",
					"gpo-security-table"
				],
				children: [createElement$1("thead", { children: [createElement$1("tr", { children: [createElement$1("th", { text: tr("security.policy", "Policy") }), createElement$1("th", { text: tr("security.policySetting", "Policy setting") })] })] }), body]
			});
			var listState = item.auditListState || (item.auditListState = { query: "" });
			search = createElement$1("input", { attrs: {
				type: "search",
				value: listState.query || "",
				placeholder: t$2("policySearch.categoryPlaceholder"),
				"aria-label": t$2("policySearch.categoryPlaceholder"),
				"data-policy-filter": ""
			} });
			var toolbar = createElement$1("div", {
				className: "gpo-security-workbench__toolbar",
				children: [config.hideHeading ? null : createElement$1("h2", {
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
					content: createElement$1("div", { children: [createElement$1("p", { text: tr("security.preservedReadOnly", "This setting is preserved and is read-only.") }), createElement$1("pre", {
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
			var define = createElement$1("input", { attrs: {
				type: "checkbox",
				checked: configured(row) ? "checked" : null
			} });
			var fields = createElement$1("div", { className: "gpo-editor-advanced-audit__fields" });
			var machineName = createElement$1("input", { attrs: {
				type: "text",
				value: row.machine_name || state(response).suggested_machine_name || "",
				"data-advanced-audit-machine": ""
			} });
			var controls = [machineName.getElement()];
			var requestForRow;
			if (row.kind === "subcategory") {
				var setting = row.setting || {
					kind: "system",
					value: "unchanged"
				};
				var system = setting.kind !== "user";
				fields.append(createElement$1("div", {
					className: "gpo-editor-security-record-identity",
					children: [
						createElement$1("dt", { text: "GUID" }),
						createElement$1("dd", { text: row.guid || "" }),
						createElement$1("dt", { text: tr("security.advancedAudit.target", "Target") }),
						createElement$1("dd", { text: system ? tr("security.advancedAudit.system", "System") : tr("security.advancedAudit.user", "User SID") + ": " + row.target.sid })
					]
				}));
				if (system) {
					var mode = createElement$1("select", {
						attrs: { "data-advanced-audit-setting": "" },
						children: [
							"unchanged",
							"success",
							"failure",
							"success_and_failure",
							"none"
						].map(function(value) {
							return createElement$1("option", {
								attrs: { value },
								text: systemSettingLabel(value)
							});
						})
					});
					mode.getElement().value = setting.value || "unchanged";
					fields.append(createElement$1("label", {
						className: "gpo-editor-security-record__field",
						children: [createElement$1("span", { text: tr("security.advancedAudit.auditSetting", "Audit setting") }), createElement$1("span", {
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
					var flags = [
						"include_success",
						"exclude_success",
						"include_failure",
						"exclude_failure",
						"none"
					];
					var flagInputs = {};
					flags.forEach(function(flag) {
						var input = createElement$1("input", { attrs: {
							type: "checkbox",
							checked: setting[flag] ? "checked" : null,
							"data-advanced-audit-flag": flag
						} });
						flagInputs[flag] = input.getElement();
						controls.push(input.getElement());
						fields.append(createElement$1("label", {
							className: ["field", "field__checkbox"],
							children: [input, createElement$1("span", { text: tr("security.advancedAudit." + flag, flag.replace(/_/g, " ")) })]
						}));
					});
					requestForRow = function() {
						var result = { kind: "user" };
						flags.forEach(function(flag) {
							result[flag] = flagInputs[flag].checked;
						});
						return result;
					};
				}
			} else if (row.kind === "global_sacl") {
				var descriptor = createElement$1("textarea", { attrs: {
					rows: "5",
					spellcheck: "false",
					"data-advanced-audit-sddl": "",
					"aria-label": tr("security.securityDescriptor", "Security descriptor (SDDL)")
				} });
				descriptor.getElement().value = row.sddl || "";
				controls.push(descriptor.getElement());
				fields.append(createElement$1("label", {
					className: "gpo-editor-security-record__field",
					children: [createElement$1("span", { text: tr("security.securityDescriptor", "Security descriptor (SDDL)") }), createElement$1("span", {
						className: "field__element",
						children: [descriptor]
					})]
				}));
				fields.append(createElement$1("p", { text: tr("security.saclHelp", "Supply the complete SACL in SDDL format. Applying replaces the global audit descriptor for this object type.") }));
				requestForRow = function() {
					return descriptor.getElement().value;
				};
			} else {
				var enabled = createElement$1("input", { attrs: {
					type: "checkbox",
					checked: row.enabled ? "checked" : null,
					"data-advanced-audit-enabled": ""
				} });
				controls.push(enabled.getElement());
				fields.append(createElement$1("label", {
					className: ["field", "field__checkbox"],
					children: [enabled, createElement$1("span", { text: tr("security.advancedAudit.enableOption", "Enable this audit option") })]
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
			var validation = createElement$1("div", {
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
			var baseline = draftValue();
			dirty = function() {
				return baseline !== draftValue();
			};
			applyCurrent = async function() {
				var request = emptyRequest();
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
					var sddl = requestForRow();
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
			var settingsPanel = createElement$1("div", { children: [
				createElement$1("label", {
					className: [
						"field",
						"field__checkbox",
						"gpo-security-policy-editor__define"
					],
					children: [define, createElement$1("span", { text: tr("security.defineSetting", "Define this policy setting") })]
				}),
				fields,
				validation
			] });
			var explanation = row.explain_text || row.description || (row.kind === "global_sacl" ? tr("security.saclHelp", "Supply the complete SACL in SDDL format. Applying replaces the global audit descriptor for this object type.") : tr("security.noExplanation", "No explanation is available for this setting."));
			var explanationPanel = createElement$1("div", {
				className: "gpo-security-explanation",
				children: [createElement$1("h3", { text: label(row) }), createElement$1("p", { text: explanation })]
			});
			activeDialog = open(modalHost, {
				title: label(row),
				content: createElement$1("div", {
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
			var heldFocus = body.getElement().contains(document.activeElement);
			selection = null;
			syncActions();
			body.getElement().innerHTML = "";
			(family && family.rows || []).filter(function(row) {
				return label(row).toLocaleLowerCase().includes(listState.query.trim().toLocaleLowerCase());
			}).slice().sort(function(a, b) {
				return label(a).localeCompare(label(b));
			}).forEach(function(row, index) {
				var id = auditIdentity(row) + ":" + index;
				var tableRow = createElement$1("tr", {
					attrs: {
						tabindex: "-1",
						"aria-selected": "false",
						"data-advanced-audit-kind": row.kind,
						"data-advanced-audit-id": row.guid || row.option || row.object_kind || ""
					},
					children: [createElement$1("td", {
						attrs: { title: label(row) },
						text: label(row)
					}), createElement$1("td", {
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
			var saved = await applyCurrent();
			if (saved) close();
			return saved;
		};
		root.cancelChanges = function() {
			close();
			return true;
		};
		root.openPolicyDialog = function() {
			if (!item.advancedAuditTarget) return null;
			var row = (family && family.rows || []).filter(function(row) {
				return auditIdentity(row) === item.advancedAuditTarget;
			})[item.advancedAuditOccurrence || 0];
			if (row) return edit(row);
			var error = new Error(t$2("policySearch.targetUnavailable"));
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
		var editor = await renderAdvancedAuditTemplate$1(Object.assign({}, options, { dialogHost: host }));
		if (!editor) return null;
		var dialog = editor.openPolicyDialog();
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
	var create = createElement$18;
	var t$1 = t$12;
	var PAGE_SIZE = 100;
	function format(key, values) {
		var result = t$1("policySearch." + key);
		Object.keys(values || {}).forEach(function(name) {
			result = result.replace("{" + name + "}", String(values[name]));
		});
		return result;
	}
	function checkedRows(name, response, scope) {
		if (name === "admx") {
			if (!response || !Array.isArray(response.policies)) throw new Error(t$1("policySearch.invalidIndex"));
			return admxRows(response, scope);
		}
		if (name === "security") {
			if (!response || !response.security_catalog || !Array.isArray(response.security_catalog.policies) || !Array.isArray(response.security_catalog.categories)) throw new Error(t$1("policySearch.invalidIndex"));
			return securityRows(response, scope);
		}
		if (name === "audit") {
			if (!response || !response.advanced_audit || !Array.isArray(response.advanced_audit.rows) || !Array.isArray(response.advanced_audit.subcategory_catalog)) throw new Error(t$1("policySearch.invalidIndex"));
			return auditRows(response, scope);
		}
		return [];
	}
	function updateCachedSource(item, name, response) {
		var sources = item.policySearchSources;
		if (!sources || !sources[name]) return;
		sources[name] = {
			status: "ready",
			response,
			rows: checkedRows(name, response, item.scope)
		};
	}
	function renderAllPoliciesTemplate$1(options) {
		var config = options || {};
		var item = config.item || {};
		var scope = item.scope === "user" ? "user" : "computer";
		var state = item.policySearchState || (item.policySearchState = {
			query: "",
			page: 0,
			selected: null,
			scrollTop: 0
		});
		var sources = item.policySearchSources || (item.policySearchSources = {});
		var disposed = false;
		var activeDialog = null, activeEditor = null, opening = false;
		var root = create("div", {
			className: [
				"gp__preference",
				"gpo-security-workbench",
				"gpo-policy-search"
			],
			attrs: { "data-all-policies-scope": scope }
		});
		var panel = create("div", { className: "gpo-security-workbench__panel" });
		var toolbar = create("div", { className: "gpo-security-workbench__toolbar" });
		var query = create("input", { attrs: {
			type: "search",
			value: state.query || "",
			"data-policy-filter": "",
			placeholder: t$1("policySearch." + (scope === "user" ? "userPlaceholder" : "computerPlaceholder")),
			"aria-label": t$1("policySearch." + (scope === "user" ? "userPlaceholder" : "computerPlaceholder"))
		} });
		var status = create("div", {
			className: "gpo-policy-search__status",
			attrs: { role: "status" }
		});
		var errors = create("div", { className: "gpo-policy-search__errors" });
		var body = create("tbody");
		var table = create("table", {
			className: [
				"preference__table",
				"gpo-catalog-table",
				"gpo-security-table",
				"gpo-policy-search__table"
			],
			children: [create("thead", { children: [create("tr", { children: [create("th", { text: t$1("policySearch.name") }), create("th", { text: t$1("policySearch.path") })] })] }), body]
		});
		var previous = create("button", {
			className: "button",
			attrs: {
				type: "button",
				"data-policy-page-previous": ""
			},
			text: t$1("policySearch.previous")
		});
		var next = create("button", {
			className: "button",
			attrs: {
				type: "button",
				"data-policy-page-next": ""
			},
			text: t$1("policySearch.next")
		});
		var pageText = create("span", { attrs: { "data-policy-page": "" } });
		var paging = create("div", {
			className: "gpo-policy-search__paging",
			children: [
				previous,
				pageText,
				next
			]
		});
		if (!config.hideHeading) toolbar.append(create("h2", { text: t$1("policies.allPolicies") }));
		toolbar.append(query);
		panel.append(toolbar);
		panel.append(errors);
		panel.append(status);
		panel.append(table);
		panel.append(paging);
		root.append(panel);
		var selection = null;
		var actions = bind(config.header, toolbar, { edit: function() {
			if (selection) open(selection);
		} });
		function current() {
			return !disposed && (typeof config.isCurrent !== "function" || config.isCurrent());
		}
		function syncActions() {
			actions.update(selection && { edit: true }, opening || Boolean(activeDialog));
		}
		var navigation = bind$1(table.getElement(), {
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
				var kind = row.target.template;
				var audit = kind === "advanced_audit", security = kind === "security";
				var sourceName = audit ? "audit" : kind;
				var modalModel = security ? buildSecurityModel(sources.security.response) : null;
				var openDialog = audit ? openAdvancedAuditDialog : security ? __export_openSecurityDialog : kind === "admx" ? openAdmxDialog : kind === "scripts" ? openScriptsDialog : kind === "preferences" ? openPreferencesDialog : null;
				if (!openDialog) throw new Error(t$1("policySearch.targetUnavailable"));
				var opened = await openDialog(root, {
					item: Object.assign({}, row.target, audit ? { advancedAuditResponse: sources.audit.response } : security ? { securityModel: modalModel } : {}),
					browseCollection: Boolean(row.target.securityCollection),
					isCurrent: current,
					restoreFocus: function() {
						return selection && selection.element || query.getElement();
					},
					onSaved: function(response) {
						var scrollTop = panel.getElement().scrollTop;
						if (audit || security) {
							sources[sourceName].response = response;
							sources[sourceName].rows = checkedRows(sourceName, response, scope);
						} else if (kind === "admx") {
							var savedPolicy = response.policy || response;
							var indexed = sources.admx.response.policies.find(function(policy) {
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
			var heldFocus = table.getElement().contains(document.activeElement);
			var allRows = [];
			var incomplete = [], pending = [];
			[
				"admx",
				"security",
				"audit",
				"scripts",
				"preferences"
			].forEach(function(name) {
				var source = sources[name];
				if (!source) return;
				if (source.status === "error") incomplete.push({
					name,
					error: source.error
				});
				else if (source.status === "loading") pending.push(name);
				else if (source.status === "ready") allRows.push.apply(allRows, source.rows);
			});
			var rows = sortRows(allRows).filter(function(row) {
				return matches(row, state.query);
			});
			var pages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
			state.page = Math.max(0, Math.min(Number(state.page) || 0, pages - 1));
			body.getElement().replaceChildren();
			selection = null;
			rows.slice(state.page * PAGE_SIZE, (state.page + 1) * PAGE_SIZE).forEach(function(row) {
				var path = row.path.join(" / ");
				var node = create("tr", {
					attrs: {
						tabindex: "-1",
						"aria-selected": "false",
						"data-policy-result-id": row.id
					},
					children: [create("td", {
						attrs: { title: row.title },
						children: [create("span", {
							className: "gpo-catalog-name",
							children: [create("span", {
								className: ["icon", row.target.icon],
								attrs: { "aria-hidden": "true" }
							}), create("span", { text: row.title })]
						})]
					}), create("td", {
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
				errors.append(create("p", {
					className: "gpo-security-workbench__notice",
					text: t$1("policySearch.incomplete")
				}));
				incomplete.forEach(function(failure) {
					errors.append(renderError(failure.error));
				});
				var retry = create("button", {
					className: ["button", "active"],
					attrs: {
						type: "button",
						"data-policy-retry": ""
					},
					text: t$1("policySearch.retry")
				});
				retry.on("click", function() {
					incomplete.forEach(function(failure) {
						delete sources[failure.name];
					});
					loadSources();
				});
				errors.append(retry);
			}
			status.getElement().textContent = pending.length ? t$1("policySearch.loading") + " " + format("count", {
				matched: rows.length,
				total: allRows.length
			}) : format("count", {
				matched: rows.length,
				total: allRows.length
			});
			if (!rows.length && !pending.length && !incomplete.length) body.append(create("tr", { children: [create("td", {
				className: "gpo-security-table__empty",
				attrs: { colspan: "2" },
				text: t$1("policySearch.noMatches")
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
				var source = {
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
			var saved = await activeEditor.applyChanges();
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
	var renderHeader = renderHeader$1;
	var renderMain = renderMain$1;
	var renderFooter = renderFooter$1;
	var resizable = resizable$1;
	var renderDefaultTemplate = renderDefaultTemplate$1;
	var renderFolderTemplate = renderFolderTemplate$1;
	var renderHelpBlock = renderHelpBlock$1;
	var renderScriptsTemplate = renderScriptsTemplate$1;
	var renderPreferencesTemplate = renderPreferencesTemplate$1;
	var renderSecurityTemplate = __export_renderSecurityTemplate;
	var renderAdvancedAuditTemplate = renderAdvancedAuditTemplate$1;
	var renderAllPoliciesTemplate = renderAllPoliciesTemplate$1;
	var setTreeItemActive = setTreeItemActive$1;
	var setFolderOpenedState = setFolderOpenedState$1;
	var ensureLazyChildren = ensureLazyChildren$1;
	var createElement = createElement$18;
	var t = t$12;
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
				var node = workspace && workspace.getElement();
				if (!node) return;
				node.setAttribute("role", "region");
				node.setAttribute("aria-label", t("navigation.catalog"));
				var container = node.closest(".gp__container");
				if (!container) return;
				if (container._gpoPaneNavigation) container.removeEventListener("keydown", container._gpoPaneNavigation);
				var state = this;
				container._gpoPaneNavigation = function(event) {
					if (event.key !== "F6" || event.defaultPrevented || event.ctrlKey || event.metaKey || event.altKey) return;
					var target = event.target;
					if (target.closest("input, textarea, select, [contenteditable]:not([contenteditable=\"false\"])")) return;
					var ownerDialog = target.closest("[role=\"dialog\"], [role=\"alertdialog\"]");
					if (ownerDialog && !ownerDialog.matches(".modal-gpui")) return;
					if (Array.from(container.querySelectorAll("[role=\"dialog\"], [role=\"alertdialog\"], .policy-changed__modal")).some(function(modal) {
						return modal.classList.contains("active") || modal.getClientRects().length && modal.getBoundingClientRect().width > 0 && getComputedStyle(modal).opacity !== "0" && getComputedStyle(modal).visibility !== "hidden";
					})) return;
					var destination = Boolean(target.closest(".tree-view")) ? node.querySelector("[data-list-navigation] [tabindex=\"0\"], [data-list-navigation][tabindex=\"0\"]") || node.querySelector("[data-policy-filter]") || node.querySelector(".gpo-category-path__segment[tabindex=\"0\"]") : container.querySelector(".tree-view .tree-item[tabindex=\"0\"]");
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
				var btnInformation = this.header && this.header.getElement && this.header.getElement() ? this.header.getElement().querySelector(".gp__control-help .btn-information") : null;
				if (!btnInformation) return;
				btnInformation.addEventListener("click", this.toggleHelp.bind(this));
				this.syncHelpButtonState();
			},
			registerTreeNode: function(item, options) {
				var config = options || {};
				var treeItemElement = config.treeItemElement || null;
				var listItemElement = config.listItemElement || null;
				var parentItem = config.parentItem || null;
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
				var path = [];
				var currentItem = item;
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
				var updated = /* @__PURE__ */ new Set();
				function visit(nodes) {
					(nodes || []).forEach(function(node) {
						var cached = node.securityModel;
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
				var opened = this.setFolderOpened(item, !item.opened);
				if (opened && item.lazy && !item.loaded) {
					var element = this.treeListItemElements.get(item);
					if (element) return ensureLazyChildren(item, element, this).then(function() {
						return item.opened;
					}).catch(function() {
						return item.opened;
					});
				}
				return opened;
			},
			openPathToItem: function(item) {
				var path = this.getPathToItem(item);
				path.slice(0, -1).forEach(function(pathItem) {
					if (pathItem && pathItem.type === "folder") this.setFolderOpened(pathItem, true);
				}, this);
				return path;
			},
			activateTreeItem: function(item, treeItemElement) {
				var nextTreeItemElement = treeItemElement || this.treeItemElements.get(item) || null;
				if (!nextTreeItemElement && item && item.showInTree === false && (item.template === "admx" || item.searchReturnTo)) {
					var parentItem = this.parentItems.get(item) || null;
					while (parentItem && !nextTreeItemElement) {
						nextTreeItemElement = this.treeItemElements.get(parentItem) || null;
						parentItem = this.parentItems.get(parentItem) || null;
					}
				}
				if (!nextTreeItemElement) return null;
				var treeContainer = nextTreeItemElement.closest(".tree-view") || document;
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
				var helpSourceItem = this.getCurrentHelpSourceItem();
				var helpBlock = renderHelpBlock({
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
				var btnInformation = this.header && this.header.getElement && this.header.getElement() ? this.header.getElement().querySelector(".gp__control-help .btn-information") : null;
				if (!btnInformation) return;
				btnInformation.classList.toggle("active", this.isHelpToggleAvailable());
			},
			syncHelpBlockState: function() {
				var workspaceEl = this.workspace && this.workspace.getElement ? this.workspace.getElement() : null;
				var helpBlocks = workspaceEl ? workspaceEl.querySelectorAll(".gp__list-children-help, .gp__admx-help, .preference__info") : null;
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
				var renderRequestId = ++this.renderRequestId;
				this.cleanupCurrentView();
				var headerElement = this.header && this.header.getElement ? this.header.getElement() : null;
				var preferenceControls = headerElement ? headerElement.querySelector(".gp__control") : null;
				var editorActions = headerElement ? headerElement.querySelector(".gp__control-actions") : null;
				if (preferenceControls) preferenceControls.style.display = "none";
				if (editorActions) editorActions.style.display = "none";
				var admxActions = headerElement ? headerElement.querySelector(".gp__control-admx") : null;
				var helpSeparator = headerElement ? headerElement.querySelector(".gp__control-separator") : null;
				if (admxActions) admxActions.style.display = "";
				if (helpSeparator) helpSeparator.style.display = "";
				if (this.workspace) this.workspace.clear();
				this.setCurrentView(null);
				this.selectedPath = this.getPathToItem(item);
				this.selectedItem = {
					item,
					element
				};
				var categoryPath = this.getCategoryHeading(item);
				if (this.workspace) this.workspace.append(this.renderCategoryPath(item));
				var templateResult = null;
				var renderedWorkspaceView = null;
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
						var parentCategory = this.parentItems.get(item);
						var state = this;
						var policyDialog = null, policyEditor = null;
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
						var catalog = templateResult;
						var cleanupCatalog = catalog.cleanup;
						var mountCatalog = catalog.onMounted;
						catalog.onMounted = function() {
							if (mountCatalog) mountCatalog();
							var opened = openAdmxDialog(catalog, {
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
							var saved = await policyEditor.applyChanges();
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
					var back = createElement("button", {
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
				var config = Object.assign({}, options || {}, { navigationRequestId: ++this.navigationRequestId });
				return this.guardNavigation(item, config);
			},
			guardNavigation: function(item, config) {
				if (!config || config.navigationRequestId !== this.navigationRequestId) return false;
				var currentView = this.currentView;
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
				var treeItemElement = config.treeItemElement || null;
				var openPath = config.openPath !== void 0 ? config.openPath : true;
				var openCurrentFolder = config.openCurrentFolder;
				if (!item) return false;
				if (item.type === "folder" && item.lazy && !item.loaded && !config.lazyLoadComplete) {
					var listItemElement = this.treeListItemElements.get(item) || null;
					if (!listItemElement) return Promise.resolve(false);
					if (openCurrentFolder !== void 0) this.setFolderOpened(item, openCurrentFolder);
					return ensureLazyChildren(item, listItemElement, this).then(function() {
						if (config.navigationRequestId !== this.navigationRequestId) return false;
						var nextConfig = Object.assign({}, config, { lazyLoadComplete: true });
						delete nextConfig.openCurrentFolder;
						return this.guardNavigation(item, nextConfig);
					}.bind(this)).catch(function() {
						return false;
					});
				}
				if (openPath) this.openPathToItem(item);
				if (item.type === "folder" && openCurrentFolder !== void 0) this.setFolderOpened(item, openCurrentFolder);
				var activeTreeItemElement = this.activateTreeItem(item, treeItemElement);
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
				var currentView = this.currentView;
				if (currentView && typeof currentView.applyChanges === "function") {
					if (!await currentView.applyChanges()) {
						this.pendingNavigation = null;
						return;
					}
				}
				var nav = this.pendingNavigation;
				this.pendingNavigation = null;
				if (nav) return this.guardNavigation(nav.item, nav.options);
				return false;
			},
			handlePolicyChangedNo: function() {
				this.hidePolicyChangedModal();
				var currentView = this.currentView;
				if (currentView && typeof currentView.cancelChanges === "function") {
					if (currentView.cancelChanges() === false) {
						this.pendingNavigation = null;
						return false;
					}
				}
				var nav = this.pendingNavigation;
				this.pendingNavigation = null;
				if (nav) return this.guardNavigation(nav.item, nav.options);
				return false;
			},
			initializeSelection: function() {
				if (this.selectedItem && this.selectedItem.item) return;
				var firstRootItem = this.treeData[0] || null;
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
		var containerId = options && options.containerId ? options.containerId : "gp__container";
		return document.getElementById(containerId);
	}
	function init(options) {
		var container = resolveContainer(options || {});
		if (!container) return null;
		container.innerHTML = "";
		var policyName = (options || {}).policyName;
		setLanguage((navigator.language || "en").slice(0, 2).toLowerCase());
		initialize$1(policyName).then(function(openResult) {
			var treeViewState = createTreeViewState();
			var header = renderHeader(container);
			var headerElement = header.getElement();
			var initialPreferenceControls = headerElement.querySelector(".gp__control");
			var initialEditorActions = headerElement.querySelector(".gp__control-actions");
			if (initialPreferenceControls) initialPreferenceControls.style.display = "none";
			if (initialEditorActions) initialEditorActions.style.display = "none";
			treeViewState.setHeader(header);
			treeViewState.initHelpControls();
			function reconcilePending(event) {
				var button = event.currentTarget;
				button.disabled = true;
				reconcile().then(function(result) {
					var recovery = result.recovery || result.result || result;
					if (recovery && recovery.kind === "conflict") throw new EditorError("Publication reconciliation found a third state.", {
						category: "publication_conflict",
						conflict: recovery.conflict
					});
					var notice = button.closest(".gpo-editor-status");
					if (notice) notice.remove();
				}).catch(function(error) {
					var notice = button.closest(".gpo-editor-status");
					if (notice) notice.replaceWith(renderError(error, { onReconcile: reconcilePending }).getElement());
				}).finally(function() {
					button.disabled = false;
				});
			}
			var pendingNotice = renderPending(openResult && openResult.pending_publication, reconcilePending);
			if (pendingNotice) container.appendChild(pendingNotice.getElement());
			var renderedMain = renderMain(container, treeViewState);
			renderFooter(container);
			var policyChangedModal = createElement("div", {
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
			var policyBtnNo = treeViewState.policyChangedModal.querySelector(".btn-no");
			var policyBtnYes = treeViewState.policyChangedModal.querySelector(".btn-yes");
			policyBtnNo.addEventListener("click", treeViewState.handlePolicyChangedNo.bind(treeViewState));
			policyBtnYes.addEventListener("click", treeViewState.handlePolicyChangedYes.bind(treeViewState));
			resizable(renderedMain.divider.getElement(), renderedMain.treeView.getElement(), renderedMain.main.getElement());
		}).catch(function(error) {
			container.innerHTML = "";
			container.appendChild(renderError(error, { onRefresh: function() {
				init(options);
			} }).getElement());
		});
		return { container };
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
