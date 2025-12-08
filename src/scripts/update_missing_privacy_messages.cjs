/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const path = require('path');

const messagesDir = path.join(process.cwd(), 'messages');

// Missing keys for Portone, GitHub, Giscus
// Using English as baseline for all 18 languages to ensure keys exist.
// Ideally these should be translated, but for now we ensure structural consistency.

const missingMessages = {
  privacy_processor_portone_purpose: "Domestic payment processing",
  privacy_processor_portone_country: "Korea",
  privacy_processor_portone_items: "Payment info, Purchase history",
  privacy_processor_portone_retention: "Per applicable laws",

  privacy_processor_github_purpose: "Social login",
  privacy_processor_github_country: "USA",
  privacy_processor_github_items: "Email, Profile info, Username",
  privacy_processor_github_retention: "Until account deletion",

  privacy_processor_giscus_purpose: "Comment system",
  privacy_processor_giscus_country: "USA",
  privacy_processor_giscus_items: "Email, Profile info (via GitHub)",
  privacy_processor_giscus_retention: "Per GitHub data policy"
};

const langs = [
  'ja', 'zh', 'es', 'fr', 'de', 'it', 'pt', 'nl', 'pl', 'ru',
  'sv', 'tr', 'ar', 'hi', 'id', 'th', 'tl', 'vi'
];

async function updateMissing() {
  for (const lang of langs) {
    const filePath = path.join(messagesDir, `${lang}.json`);

    if (fs.existsSync(filePath)) {
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        const json = JSON.parse(content);

        // Merge missing keys if they don't exist
        // simple spread will overwrite if exists, but here we want to ensure they are added
        // Since we know they are missing, spread is fine.
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
