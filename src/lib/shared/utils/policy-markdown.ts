export type PolicyMarkdownMeta = {
	content: string;
	title?: string;
	updatedAt?: string;
};

export function parsePolicyMarkdown(markdown: string): PolicyMarkdownMeta {
	let content = markdown;

	const titleMatch = content.match(/^\s*#\s+(.+?)\s*$/m);
	const title = titleMatch?.[1]?.trim();
	if (titleMatch) {
		content = content.replace(titleMatch[0], '');
	}

	const updatedMatch = content.match(/^\s*>?\s*.*\{\{LAST_UPDATED\}\}.*$/m);
	const updatedAt = updatedMatch?.[0]?.replace(/^>\s*/, '').trim();
	if (updatedMatch) {
		content = content.replace(updatedMatch[0], '');
	}

	content = content.replace(/\n{3,}/g, '\n\n').replace(/^\s*\n+/g, '');

	return { content: content.trim(), title, updatedAt };
}

export function stripPolicyFrontMatter(markdown: string): string {
	return parsePolicyMarkdown(markdown).content;
}
