export function normalizeAccordionValue(value: string): string {
  return encodeURIComponent(value).replace(/%/g, "_");
}

export function accordionTriggerId(baseId: string, value: string): string {
  return `${baseId}-trigger-${normalizeAccordionValue(value)}`;
}

export function accordionContentId(baseId: string, value: string): string {
  return `${baseId}-content-${normalizeAccordionValue(value)}`;
}

export function accordionItemId(baseId: string, value: string): string {
  return `${baseId}-item-${normalizeAccordionValue(value)}`;
}
