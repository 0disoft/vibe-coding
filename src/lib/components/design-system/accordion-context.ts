import { getContext, setContext } from 'svelte';

export type AccordionType = 'single' | 'multiple';

export type AccordionContext = {
	type: AccordionType;
	isOpen: (value: string) => boolean;
	toggle: (value: string) => void;
	baseId: string;
};

const accordionContextKey = Symbol('ds-accordion');

export function setAccordionContext(ctx: AccordionContext): void {
	setContext(accordionContextKey, ctx);
}

export function getAccordionContext(): AccordionContext {
	return getContext(accordionContextKey);
}
