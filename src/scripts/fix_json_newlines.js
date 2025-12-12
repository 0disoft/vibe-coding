import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const messagesDir = path.join(process.cwd(), 'messages');

if (!fs.existsSync(messagesDir)) {
	console.error('Messages directory not found:', messagesDir);
	process.exit(1);
}

const files = fs.readdirSync(messagesDir).filter((file) => file.endsWith('.json'));
let fixedCount = 0;

console.log(`Checking ${files.length} files in ${messagesDir}...`);

files.forEach((file) => {
	const filePath = path.join(messagesDir, file);
	const content = fs.readFileSync(filePath, 'utf8');

	if (!content.endsWith('\n')) {
		fs.writeFileSync(filePath, `${content}\n`, 'utf8');
		console.log(`Fixed newline: ${file}`);
		fixedCount++;
	}
});

console.log(`Done. Fixed ${fixedCount} files.`);
