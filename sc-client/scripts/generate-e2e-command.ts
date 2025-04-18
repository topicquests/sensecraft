import { readdirSync } from 'fs';
import { resolve } from 'path';
import { exec } from 'child_process';

const testDir = resolve(__dirname, '../src/tests/e2e');

// Get all .spec.ts files and sort them naturally (e.g. 01-..., 02-...)
const testFiles = readdirSync(testDir)
  .filter((file) => file.endsWith('.spec.ts'))
  .sort();

if (testFiles.length === 0) {
  console.error('❌ No test files found in', testDir);
  process.exit(1);
}

// Construct the command
const command = ['npx playwright test']
  .concat(testFiles.map((f) => `src/tests/e2e/${f}`))
  .join(' ');

// Run the command
console.log('▶️ Running:', command);
exec(command, (error, stdout, stderr) => {
  if (error) {
    console.error('🚨 Error running tests:', error.message);
    process.exit(1);
  }
  console.log(stdout);
  if (stderr) console.error(stderr);
});
