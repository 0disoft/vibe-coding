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

  files.forEach(file => {
    const fullPath = path.join(directory, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (file.endsWith('.md')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      // Regex to find lines like "> Last Updated: December 7, 2025" or "> 최종 수정일: 2025년 12월 7일"
      // Captures the prefix (e.g., "> Last Updated:") and replaces the date part.
      // Support both standard colon (:) and full-width colon (：)
      const regex = /^(>.*?[:：])\s*.*?2025.*$/gm;

      if (regex.test(content)) {
        // $1 is the prefix including the colon
        const newContent = content.replace(regex, '$1 {{LAST_UPDATED}}');

        if (content !== newContent) {
          fs.writeFileSync(fullPath, newContent, 'utf8');
          console.log(`Updated: ${file}`);
        }
      } else {
        // Check if file might have different format (debug info)
        // console.log(`Skipped (no match): ${file}`);
      }
    }
  });
}

processDirectory(targetDir);
