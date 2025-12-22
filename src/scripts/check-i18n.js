
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
  const keys = Object.keys(content);

  const missing = baseKeys.filter(k => !keys.includes(k));
  const extra = keys.filter(k => !baseKeys.includes(k));

  if (missing.length > 0 || extra.length > 0 || JSON.stringify(keys) !== JSON.stringify(baseKeys)) {
    console.log(`[${file}] Missing: ${missing.length}, Extra: ${extra.length}, Order mismatch: ${JSON.stringify(keys) !== JSON.stringify(baseKeys)}`);
    if (missing.length > 0) console.log(`  Missing keys: ${missing.join(', ')}`);
    if (extra.length > 0) console.log(`  Extra keys: ${extra.join(', ')}`);
  }
});
