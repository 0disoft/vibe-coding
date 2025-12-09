/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const path = require('path');

const contentDir = path.resolve('src/content/cookie');
const sourceFile = path.join(contentDir, 'en.md');
const destLangs = [
	'ja',
	'zh',
	'es',
	'fr',
	'de',
	'it',
	'pt',
	'nl',
	'pl',
	'ru',
	'sv',
	'tr',
	'ar',
	'hi',
	'id',
	'th',
	'tl',
	'vi'
];

async function generateMarkdownFiles() {
	try {
		const content = fs.readFileSync(sourceFile, 'utf-8');

		for (const lang of destLangs) {
			const destPath = path.join(contentDir, `${lang}.md`);

			// 파일이 없을 때만 생성 (덮어쓰기 방지)
			if (!fs.existsSync(destPath)) {
				fs.writeFileSync(destPath, content, 'utf-8');
				console.log(`Created ${lang}.md`);
			} else {
				console.log(`Skipped ${lang}.md (already exists)`);
			}
		}
	} catch (error) {
		console.error('Error generating markdown files:', error);
	}
}

generateMarkdownFiles();
