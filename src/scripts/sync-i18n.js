
import fs from 'node:fs';
import path from 'node:path';

const MESSAGES_DIR = 'c:/Users/zerodi/Documents/workspace/vibe-coding/messages';
const BASE_LANG = 'en.json';

const baseContent = JSON.parse(fs.readFileSync(path.join(MESSAGES_DIR, BASE_LANG), 'utf8'));
const baseKeys = Object.keys(baseContent);

const files = fs.readdirSync(MESSAGES_DIR).filter(f => f.endsWith('.json'));

files.forEach(file => {
	const filePath = path.join(MESSAGES_DIR, file);
	const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));

	// Create new object with baseKeys order
	const synchronized = {};
	baseKeys.forEach(key => {
		if (Object.hasOwn(content, key)) {
			synchronized[key] = content[key];
		} else {
			// If missing, use base value but mark it or just use it as is
			// For this task, we'll use the English value as placeholder
			synchronized[key] = baseContent[key];
			console.log(`[${file}] Added missing key: ${key}`);
		}
	});

	// Check for extra keys in the original content that are not in baseKeys
	Object.keys(content).forEach(key => {
		if (!Object.hasOwn(baseContent, key)) {
			console.log(`[${file}] Extra key found (will be removed): ${key}`);
		}
	});

	fs.writeFileSync(filePath, `${JSON.stringify(synchronized, null, '\t')}\n`, 'utf8');
});
console.log('Synchronization complete.');
