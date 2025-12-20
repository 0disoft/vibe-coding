import { getContext, setContext } from 'svelte';

export const TABS_ORIENTATIONS = ['horizontal', 'vertical'] as const;
export type TabsOrientation = (typeof TABS_ORIENTATIONS)[number];

export const TABS_ACTIVATION_MODES = ['automatic', 'manual'] as const;
export type TabsActivationMode = (typeof TABS_ACTIVATION_MODES)[number];

export type TabsContext = {
	orientation: TabsOrientation;
	activationMode: TabsActivationMode;
	baseId: string;
	isSelected: (value: string) => boolean;
	setValue: (value: string) => void;
	tabId: (value: string) => string;
	panelId: (value: string) => string;
};

const tabsContextKey = Symbol('vibe-coding.ds-tabs');

export function setTabsContext(ctx: TabsContext): void {
	setContext(tabsContextKey, ctx);
}

export function getTabsContext(): TabsContext {
	const ctx = getContext<TabsContext | undefined>(tabsContextKey);
	if (!ctx) {
		throw new Error('[tabs-context] Missing TabsContext provider');
	}
	return ctx;
}
