import { getContext, setContext } from 'svelte';

export type TabsOrientation = 'horizontal' | 'vertical';
export type TabsActivationMode = 'automatic' | 'manual';

export type TabsContext = {
	orientation: TabsOrientation;
	activationMode: TabsActivationMode;
	baseId: string;
	isSelected: (value: string) => boolean;
	setValue: (value: string) => void;
	tabId: (value: string) => string;
	panelId: (value: string) => string;
};

const tabsContextKey = Symbol('ds-tabs');

export function setTabsContext(ctx: TabsContext): void {
	setContext(tabsContextKey, ctx);
}

export function getTabsContext(): TabsContext {
	return getContext(tabsContextKey);
}
