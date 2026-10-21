import type { FieldDescriptor } from '@gpui/core/dto-types';

/** Edit-time state the operand forms keep on a targeting node (`node._operandState`). */
export interface OperandState {
    original: FieldDescriptor[];
    dates: Record<string, any>;
    values: Record<string, unknown>;
    /** 'sid' when a user node is edited by SID (set by the form, read by validation). */
    userMode?: string;
    // The operand forms (targeting-operand-editor.js) keep their editing state here too; the shapes depend on the kind of
    // operand, so these are open (`any`) until that file moves to TypeScript.
    primary?: any;
    dateMode?: any;
    calendarActive?: any;
    ipMode?: any;
    ipRanges?: any;
    valueName?: any;
    year?: any;
}

/** The part of a targeting tree node the operand model works with. */
export interface OperandNode {
    kind: string;
    fields?: FieldDescriptor[];
    originalPath?: unknown;
    available?: boolean;
    _operandState?: OperandState;
}

export interface OperandOptions {
    language?: string;
    scope?: string;
}

/** A validation error of an operand: the field it belongs to and a code. */
export interface OperandError {
    fieldId: string;
    code: string;
}

export interface DateParts {
    day: any;
    month: any;
    year: any;
    dow: any;
}
