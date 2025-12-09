/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const path = require('path');

// src/scripts/replace_privacy_table.cjs -> src/content/privacy
const targetDir = path.resolve(__dirname, '../content/privacy');

console.log(`Target directory: ${targetDir}`);

function processDirectory(directory) {
	if (!fs.existsSync(directory)) {
		console.log(`Directory not found: ${directory}`);
		return;
	}

	const files = fs.readdirSync(directory);

	files.forEach((file) => {
		const fullPath = path.join(directory, file);

		if (file.endsWith('.md')) {
			let content = fs.readFileSync(fullPath, 'utf8');
			let updated = false;

			// 1. 정규식으로 기존 하드코딩된 테이블 찾기 및 치환
			if (!content.includes('{{DATA_PROCESSORS_TABLE}}')) {
				const tableRegex = /(\r?\n|^)\|.*\|.*(\r?\n\|.*\|)+/g;

				if (tableRegex.test(content)) {
					// 앞뒤로 개행을 넉넉히 주고 나중에 정리
					content = content.replace(tableRegex, '\n\n{{DATA_PROCESSORS_TABLE}}\n\n');
					updated = true;
					console.log(`Replaced table in: ${file}`);
				} else {
					// 테이블이 없는데 치환도 안 되어 있다면 로그 출력
					// console.log(`Table not found in: ${file}`);
				}
			}

			// 2. MD012 Fix: 연속된 3개 이상의 개행을 2개(빈 줄 하나)로 줄임
			const newContent = content.replace(/(\r?\n){3,}/g, '$1$1');

			if (newContent !== content) {
				content = newContent;
				updated = true;
				console.log(`Fixed MD012 in: ${file}`);
			}

			if (updated) {
				fs.writeFileSync(fullPath, content, 'utf8');
			}
		}
	});
}

processDirectory(targetDir);
