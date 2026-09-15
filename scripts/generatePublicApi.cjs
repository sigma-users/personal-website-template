const fs = require('node:fs');
const path = require('node:path');
const { readConfig, generateContent } = require('./researchmap.cjs');
const root = path.resolve(__dirname, '..');
const config = readConfig(root);
const snapshotPath = path.join(root, 'data/researchmap.json');

// Fail before touching generated files if synchronization has not been initialized.
if (config.enabled && !fs.existsSync(snapshotPath)) {
  throw new Error('Run npm run sync-researchmap first (or Run workflow in GitHub Actions).');
}
require('./generateCsvApi.cjs');
if (config.enabled) {
  generateContent(JSON.parse(fs.readFileSync(snapshotPath, 'utf8')), root, config);
  console.log('Generated selected website sections from researchmap.');
}
