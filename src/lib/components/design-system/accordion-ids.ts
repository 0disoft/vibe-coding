export function normalizeAccordionValue(value: string): string {
	return encodeURIComponent(value).replace(/%/g, '_');
}

// ARIA 연결(aria-controls/aria-labelledby)을 위한 고유 ID 생성 유틸.
export function accordionTriggerId(baseId: string, value: string): string {
	return `${baseId}-trigger-${normalizeAccordionValue(value)}`;
}

export function accordionContentId(baseId: string, value: string): string {
	return `${baseId}-content-${normalizeAccordionValue(value)}`;
}

export function accordionItemId(baseId: string, value: string): string {
	return `${baseId}-item-${normalizeAccordionValue(value)}`;
}

export type AccordionIdGenerator = {
	trigger: (value: string) => string;
	content: (value: string) => string;
	item: (value: string) => string;
};

export function createAccordionIdGenerator(baseId: string): AccordionIdGenerator {
	return {
		trigger: (value) => accordionTriggerId(baseId, value),
		content: (value) => accordionContentId(baseId, value),
		item: (value) => accordionItemId(baseId, value)
	};
}
