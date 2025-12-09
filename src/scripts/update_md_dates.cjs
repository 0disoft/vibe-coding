/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const path = require('path');

// src/scripts/update_md_dates.js -> src/content
const targetDir = path.resolve(__dirname, '../content');

console.log(`Target directory: ${targetDir}`);

function processDirectory(directory) {
	if (!fs.existsSync(directory)) {
		console.log(`Directory not found: ${directory}`);
		return;
	}

	const files = fs.readdirSync(directory);

	files.forEach((file) => {
		const fullPath = path.join(directory, file);
		const stat = fs.statSync(fullPath);

		if (stat.isDirectory()) {
			processDirectory(fullPath);
		} else if (file.endsWith('.md')) {
			let content = fs.readFileSync(fullPath, 'utf8');
			// "> Last Updated: December 7, 2025" 또는 "> 최종 수정일: 2025년 12월 7일" 같은 줄을 찾는 정규식
			// 접두사(예: "> Last Updated:")를 캡처하고 날짜 부분을 교체합니다.
			// 표준 콜론(:)과 전각 콜론(：) 모두 지원
			const regex = /^(>.*?[:：])\s*.*?2025.*$/gm;

			if (regex.test(content)) {
				// $1은 콜론을 포함한 접두사입니다.
				const newContent = content.replace(regex, '$1 {{LAST_UPDATED}}');

				if (content !== newContent) {
					fs.writeFileSync(fullPath, newContent, 'utf8');
					console.log(`Updated: ${file}`);
				}
			} else {
				// 파일 형식이 다를 수 있음 (디버그 정보)
				// console.log(`Skipped (no match): ${file}`);
			}
		}
	});
}

processDirectory(targetDir);
