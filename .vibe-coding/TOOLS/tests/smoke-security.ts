import { spawn } from 'node:child_process';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const TEST_DIR = '.vibe-coding/TOOLS/tests/temp-security';
const TOOL_PATH = '.vibe-coding/TOOLS/security-patterns.ts';

async function runTool(target: string): Promise<string> {
  return new Promise((resolve, reject) => {
    // --no-report flag used
    const process = spawn('bun', [TOOL_PATH, target, '--no-report'], { stdio: ['ignore', 'pipe', 'pipe'] });
    let output = '';
    process.stdout.on('data', (d) => { output += d.toString(); });
    process.stderr.on('data', (d) => { output += d.toString(); });
    process.on('close', (code) => {
      if (code !== 0 && (output.includes('Error:') || output.includes('Debug Failure'))) {
        reject(new Error(`Tool failed with code ${code}: ${output}`));
      } else {
        resolve(output);
      }
    });
    process.on('error', (err) => reject(err));
  });
}

async function main() {
  console.log('🧪 Starting Security Patterns Smoke Test (Round 3)...');
  try {
    await rm(TEST_DIR, { recursive: true, force: true });
    await mkdir(TEST_DIR, { recursive: true });

    // 1. JS Regex Literal Check (Complex Character Class)
    // The case: const r = /[//]/; eval(1)
    // If [//] is mishandled as comment start, eval(1) disappears.
    await writeFile(join(TEST_DIR, 'test-regex-complex.js'), `const r = /[//]/; eval(1);`);

    // 2. Multi-line HTML Tag (Risk)
    // Attribute spread across lines
    const multiLineRisk = `
      <a
        href="https://risk.com"
        target="_blank"
      >
        Click me
      </a>
    `;
    await writeFile(join(TEST_DIR, 'test-multiline-risk.html'), multiLineRisk);

    // 3. Multi-line HTML Tag (Safe)
    const multiLineSafe = `
      <a
        href="https://safe.com"
        target="_blank"
        rel="noopener noreferrer"
      >
        Safe
      </a>
    `;
    await writeFile(join(TEST_DIR, 'test-multiline-safe.html'), multiLineSafe);

    // Run the tool
    const output = await runTool(TEST_DIR);
    const issues: string[] = [];

    // 1. Regex Complex: eval(1) MUST be detected.
    if (!output.includes('test-regex-complex.js') || !output.includes('injection-eval')) {
      issues.push('❌ JS Regex Complex Helper failed: /[//]/ caused tokenizer to skip following code');
    }

    // 2. Multi-line Risk: MUST be detected.
    if (!output.includes('test-multiline-risk.html') || !output.includes('xss-target-blank')) {
      issues.push('❌ Multi-line HTML Risk failed: Split attributes were NOT detected');
    }

    // 3. Multi-line Safe: MUST NOT be detected.
    if (output.includes('test-multiline-safe.html') && output.includes('xss-target-blank')) {
      issues.push('❌ Multi-line HTML Safe failed: valid attributes were falsely flagged');
    }

    if (issues.length === 0) {
      console.log('✅ All Smoke Tests Passed!');
    } else {
      console.error('❌ Tests Failed:');
      for (const i of issues) console.error(i);
      console.log('\n--- Tool Output ---');
      console.log(output);
      process.exit(1);
    }
  } catch (err) {
    console.error('Unexpected Error:', err);
    process.exit(1);
  }
}

main();
