import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

function main() {
	const serverOutDir = path.join('.svelte-kit', 'output', 'server');
	const manifestPath = path.join(serverOutDir, 'manifest.js');
	const manifestFullPath = path.join(serverOutDir, 'manifest-full.js');

	if (existsSync(manifestPath)) return;
	if (!existsSync(manifestFullPath)) {
		console.warn(
			`Skipping preview manifest shim (missing ${manifestFullPath}). Run \`bun run build\` first.`
		);
		return;
	}

	mkdirSync(serverOutDir, { recursive: true });

	writeFileSync(manifestPath, 'export { manifest } from "./manifest-full.js";\n', 'utf8');
	console.warn(`Created preview manifest shim: ${manifestPath}`);
}

main();
