const path = require('node:path');
const { readConfig, fetchSnapshot, writeSnapshot } = require('./researchmap.cjs');

(async () => {
  const root = path.resolve(__dirname, '..');
  const config = readConfig(root);
  if (!config.enabled) {
    console.log('researchmap sync is disabled. Using the original CSV workflow.');
    return;
  }
  const snapshot = await fetchSnapshot(config);
  snapshot.lastCheckedAt = new Date().toISOString();
  writeSnapshot(snapshot, root);
  console.log('Public researchmap data downloaded successfully.');
  for (const [kind, items] of Object.entries(snapshot.publications)) {
    if (config.sync[kind]) console.log(`${kind}: ${items.length}`);
  }
})().catch(error => {
  console.error(`researchmap sync failed; previous snapshot retained: ${error.message}`);
  process.exitCode = 1;
});
