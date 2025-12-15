
import { readdir, readFile, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";

const MESSAGES_DIR = resolve("messages");

const NEW_KEYS = {
	en: {
		meta_site_title: "{siteName}",
		meta_site_description: "{siteDescription}"
	},
	ko: {
		meta_site_title: "{siteName}",
		meta_site_description: "{siteDescription}"
	}
};

async function main() {
	const files = await readdir(MESSAGES_DIR);

	for (const file of files) {
		if (!file.endsWith(".json")) continue;

		const lang = file.replace(".json", "");
		const filePath = join(MESSAGES_DIR, file);
		const content = await readFile(filePath, "utf-8");
		const json = JSON.parse(content);

		// Choose values: if ko, use ko values; otherwise use en values
		const valuesToAdd = lang === "ko" ? NEW_KEYS.ko : NEW_KEYS.en;

		let changed = false;

		// Remove redundant keys
		const keysToRemove = [
			"title_terms",
			"meta_terms_description",
			"home_title",
			"home_description"
		];
		for (const key of keysToRemove) {
			if (json[key]) {
				delete json[key];
				changed = true;
			}
		}

		for (const [key, value] of Object.entries(valuesToAdd)) {
			// Always update to ensure we use the new variables
			if (json[key] !== value) {
				json[key] = value;
				changed = true;
			}
		}

		if (changed) {
			// Use tab for indentation as seen in the file preview
			await writeFile(filePath, JSON.stringify(json, null, "\t"), "utf-8");
			console.log(`Updated ${file}`);
		} else {
			console.log(`Skipped ${file} (no changes)`);
		}
	}
}

main().catch(console.error);
