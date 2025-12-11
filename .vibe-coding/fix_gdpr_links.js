const fs = require('fs');
const path = require('path');

const dir = 'c:/Users/cherr/Documents/workspace/vibe-coding/src/content/gdpr';

try {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    // Skip English file as it stays as /privacy
    if (file === 'en.md') return;
    // Process only markdown files
    if (!file.endsWith('.md')) return;

    const lang = file.replace('.md', '');
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');

    // Replace ](/privacy) with ](/lang/privacy)
    // We strictly match /privacy start to avoid double replacing if I run it twice or on already fixed files
    // But we need to ensure we don't match /privacy if it's already /ko/privacy (slash before privacy)
    // The regex /\]\(\s*\/privacy\s*\)/ matches "](/privacy)" specifically.
    // It does NOT match "](/ko/privacy)" because of the extra "/ko".
    const regex = /\]\(\s*\/privacy\s*\)/g;

    if (regex.test(content)) {
      const newContent = content.replace(regex, `](/${lang}/privacy)`);
      fs.writeFileSync(filePath, newContent, 'utf8');
      console.log(`Updated ${file}: /privacy -> /${lang}/privacy`);
    } else {
      console.log(`Skipped ${file} (no match or already localized)`);
    }
  });
} catch (error) {
  console.error('Error processing files:', error);
  process.exit(1);
}
