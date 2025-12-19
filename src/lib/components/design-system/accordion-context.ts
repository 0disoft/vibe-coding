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

const accordionContextKey = Symbol('ds-accordion');
const accordionItemContextKey = Symbol('ds-accordion-item');

export function setAccordionContext(ctx: AccordionContext): void {
	setContext(accordionContextKey, ctx);
}

export function getAccordionContext(): AccordionContext {
	return getContext(accordionContextKey);
}

export function setAccordionItemContext(ctx: AccordionItemContext): void {
	setContext(accordionItemContextKey, ctx);
}

export function getAccordionItemContext(): AccordionItemContext {
	return getContext(accordionItemContextKey);
}
