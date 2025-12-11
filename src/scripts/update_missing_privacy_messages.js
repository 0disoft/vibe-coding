import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const messagesDir = path.join(process.cwd(), 'messages');

// Portone, GitHub, Giscus에 대한 누락된 키
// 키가 존재하도록 모든 18개 언어에 대해 영어를 기준점으로 사용합니다.
// 이상적으로는 번역되어야 하지만, 지금은 구조적 일관성을 보장합니다.

const missingMessages = {
	privacy_processor_portone_purpose: 'Domestic payment processing',
	privacy_processor_portone_country: 'Korea',
	privacy_processor_portone_items: 'Payment info, Purchase history',
	privacy_processor_portone_retention: 'Per applicable laws',

	privacy_processor_github_purpose: 'Social login',
	privacy_processor_github_country: 'USA',
	privacy_processor_github_items: 'Email, Profile info, Username',
	privacy_processor_github_retention: 'Until account deletion',

	privacy_processor_giscus_purpose: 'Comment system',
	privacy_processor_giscus_country: 'USA',
	privacy_processor_giscus_items: 'Email, Profile info (via GitHub)',
	privacy_processor_giscus_retention: 'Per GitHub data policy'
};

const langs = [
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

async function updateMissing() {
	for (const lang of langs) {
		const filePath = path.join(messagesDir, `${lang}.json`);

		if (fs.existsSync(filePath)) {
			try {
				const content = fs.readFileSync(filePath, 'utf8');
				const json = JSON.parse(content);

				// 존재하지 않는 경우 누락된 키 병합
				// 단순 spread는 존재할 경우 덮어쓰지만, 여기서는 추가되도록 보장하고 싶습니다.
				// 누락된 것을 알고 있으므로 spread를 사용해도 무방합니다.
				const updatedJson = { ...json, ...missingMessages };

				fs.writeFileSync(filePath, JSON.stringify(updatedJson, null, '\t'), 'utf8');
				console.log(`Updated ${lang}.json with missing keys`);
			} catch (e) {
				console.error(`Error updating ${lang}.json`, e);
			}
		}
	}
}

updateMissing();
