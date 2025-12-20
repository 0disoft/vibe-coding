import { getContext, setContext } from 'svelte';

export type AccordionType = 'single' | 'multiple';

export type AccordionContext = {
	type: AccordionType;
	isOpen: (value: string) => boolean;
	toggle: (value: string) => void;
	baseId: string;
	disabled: boolean;
};

export type AccordionItemContext = {
	value: string;
	disabled: boolean;
	isOpen: boolean;
	triggerId: string;
	contentId: string;
	itemId: string;
};

const accordionContextKey = Symbol('vibe-coding.ds-accordion');
const accordionItemContextKey = Symbol('vibe-coding.ds-accordion-item');

function getRequiredContext<T>(key: symbol, name: string): T {
	const ctx = getContext<T | undefined>(key);

	if (!ctx) {
		throw new Error(`[accordion-context] Missing ${name} provider`);
	}

	return ctx;
}

export function setAccordionContext(ctx: Readonly<AccordionContext>): void {
	setContext(accordionContextKey, ctx);
}

export function getAccordionContext(): Readonly<AccordionContext> {
	return getRequiredContext<Readonly<AccordionContext>>(accordionContextKey, 'AccordionContext');
}

export function setAccordionItemContext(ctx: Readonly<AccordionItemContext>): void {
	setContext(accordionItemContextKey, ctx);
}

export function getAccordionItemContext(): Readonly<AccordionItemContext> {
	return getRequiredContext<Readonly<AccordionItemContext>>(
		accordionItemContextKey,
		'AccordionItemContext'
	);
}
