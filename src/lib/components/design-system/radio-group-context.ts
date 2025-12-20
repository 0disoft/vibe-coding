import { getContext, setContext } from 'svelte';

export type RadioGroupContext = {
	readonly name?: string;
	readonly disabled: boolean;
	readonly required: boolean;
	readonly describedBy?: string;
	readonly value: string;
	setValue: (next: string) => void;
};

const radioGroupContextKey = Symbol('vibe-coding.ds-radio-group');

export function setRadioGroupContext(ctx: RadioGroupContext): void {
	setContext(radioGroupContextKey, ctx);
}

export function getRadioGroupContext(): RadioGroupContext {
	const ctx = getContext<RadioGroupContext | undefined>(radioGroupContextKey);
	if (!ctx) {
		throw new Error('[radio-group-context] DsRadioItem must be used within DsRadioGroup.');
	}
	return ctx;
}
