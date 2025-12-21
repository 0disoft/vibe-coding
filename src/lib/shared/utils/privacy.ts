export function maskEmail(email: string): string {
	const [local, domain] = email.split('@');
	if (!domain) return '***';
	const maskedLocal = local.length > 1 ? `${local[0]}***` : '***';
	const maskedDomain = domain
		.split('.')
		.map((part) => (part.length > 1 ? `${part[0]}${'*'.repeat(part.length - 1)}` : part))
		.join('.');
	return `${maskedLocal}@${maskedDomain}`;
}
