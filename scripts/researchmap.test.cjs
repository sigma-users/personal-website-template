const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { readConfig, TYPES, collectItems: collectItemsImpl, fetchSnapshot, normalize, writeSnapshot, generateContent } = require('./researchmap.cjs');
const collectItems = (type, initial, getJson) => collectItemsImpl(type, initial, getJson, 'https://api.researchmap.jp/example_researcher');
const config = { enabled: true, permalink: 'example_researcher', sync: Object.fromEntries(['papers','presentations','misc','awards','researchProjects','profile','career'].map(k => [k,true])) };
const record = (type, id, extra = {}) => ({ '@type': type, 'rm:id': id, display: 'disclosed', ...extra });
const page = (type, items, total = items.length) => ({ '@type': type, total_items: total, items });
const profile = { '@type': 'researchers', permalink: 'example_researcher', 'rm:user_id': 'R000000001',
  family_name: { ja: '山田', en: 'Yamada' }, given_name: { ja: '花子', en: 'Hanako' },
  affiliations: [{ affiliation: { ja: '東京大学', en: 'The University of Tokyo' }, job: { ja: '助教' },
    display_affiliation: 'disclosed', display_job: 'disclosed' }],
};
const groups = () => Object.fromEntries(TYPES.map(type => [type, []]));
function fixture() {
  const g = groups();
  g.published_papers = [record('published_papers', 'p1', { paper_title: { en: 'English-only paper' },
    publication_date: '2026-06-22', authors: { ja: [{ name: '山田 花子' }], en: [{ name: 'Hanako Yamada' }] },
    identifiers: { doi: ['10.1234/example'] } }), record('published_papers', 'p2', {
    paper_title: { ja: '年だけの論文' }, publication_date: '2025' })];
  g.research_experience = [record('research_experience', 'w1', { from_date: '2024-04', to_date: '9999',
    job: { ja: '助教', en: 'Assistant Professor' }, affiliation: { ja: '東京大学' } })];
  g.presentations = [record('presentations', 's1', { presentation_title: { ja: '招待講演' },
    from_event_date: '2026-03-01', invited: true, presenters: { ja: [{ name: '山田 花子' }] } })];
  g.research_projects = [record('research_projects', 'r1', { research_project_title: { ja: '研究課題' },
    from_date: '2025-04', to_date: '2028-03', identifiers: { grant_number: ['25K00000'] } })];
  return g;
}

test('paginates past embedded items and excludes non-public records', async () => {
  const type = 'published_papers';
  const calls = [];
  const result = await collectItems(type, page(type, [record(type, '1')], 3), async url => {
    calls.push(url);
    return page(type, [record(type, '2', { display: 'closed' }), record(type, '3', { display: 'researchers_only' })], 3);
  });
  assert.deepEqual(result.map(x => x['rm:id']), ['1']);
  assert.match(calls[0], /start=2&limit=1000$/);
});

test('rejects malformed, truncated, duplicate or changing pages', async () => {
  const type = 'misc';
  await assert.rejects(collectItems(type, {}, async () => {}), /Invalid/);
  await assert.rejects(collectItems(type, page(type, [], 1), async () => {}), /Incomplete/);
  await assert.rejects(collectItems(type, page(type, [record(type, '1')], 2), async () => page(type, [], 2)), /Incomplete/);
  await assert.rejects(collectItems(type, page(type, [record(type, '1')], 2), async () => page(type, [record(type, '1')], 2)), /Duplicate/);
  await assert.rejects(collectItems(type, page(type, [record(type, '1')], 2), async () => page(type, [record(type, '2')], 3)), /changed/);
});

test('requires the intended researcher and explicitly fetches absent collections', async () => {
  await assert.rejects(fetchSnapshot(config, async () => ({ ...profile, permalink: 'someone_else', '@graph': [] })), /Unexpected/);
  const calls = [];
  const result = await fetchSnapshot(config, async url => {
    calls.push(url);
    if (calls.length === 1) return { ...profile, '@graph': [] };
    const type = new URL(url).pathname.split('/').pop();
    return page(type, []);
  });
  assert.equal(calls.length, TYPES.length + 1);
  assert.deepEqual(result.publications.papers, []);
});

test('normalizes languages, IDs, partial dates, invited talks, grants and ongoing careers', () => {
  const data = normalize(profile, fixture());
  assert.equal(data.publications.papers[0].titleJa, 'English-only paper');
  assert.equal(data.publications.papers[0].authorsJa, '山田 花子');
  assert.equal(data.publications.papers[0].doi, '10.1234/example');
  assert.equal(data.publications.papers[1].month, '');
  assert.equal(data.publications.presentations[0].date, '2026-03-01');
  assert.equal(data.publications.presentations[0].isInvited, true);
  assert.equal(data.publications.researchProjects[0].number, '25K00000');
  assert.equal(data.careers.ja[0].endDate, '');
  assert.equal(data.profiles.en.name, 'Hanako Yamada');
  assert.equal(data.profiles.ja.nameJp, '山田 花子');
  assert.deepEqual(normalize(profile, fixture()), data);
  const invalid = fixture(); invalid.published_papers[0].publication_date = '../../bad';
  assert.throws(() => normalize(profile, invalid), /date/);
});

test('full sync generates consistent year files, preserves manual fields and removes old records', async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'researchmap-test-'));
  try {
    for (const lang of ['ja', 'en']) {
      const dir = path.join(root, 'public/locales', lang); fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(path.join(dir, 'translations.json'), JSON.stringify({ header: {},
        bio: { scholar: 'https://scholar.google.com/example', researchTags: ['Old'] }, contact: { emailAdress: 'keep@example.com' } }));
    }
    const data = normalize(profile, fixture());
    assert.equal(writeSnapshot(data, root), true);
    assert.equal(writeSnapshot(data, root), false);
    generateContent(data, root, config);
    const read = file => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
    assert.deepEqual(read('public/api/years.json').years, ['2026', '2025']);
    assert.equal(read('public/api/papers-2026.json').length, 1);
    assert.deepEqual(read('public/api/misc-2026.json'), []);
    assert.equal(read('public/locales/en/translations.json').bio.scholar, 'https://scholar.google.com/example');
    assert.equal(read('public/locales/en/translations.json').contact.emailAdress, 'keep@example.com');
    assert.equal(read('public/content/career/career_ja.json')[0].endDate, '');
    const before = fs.readFileSync(path.join(root, 'data/researchmap.json'), 'utf8');
    await assert.rejects((async () => {
      const next = await fetchSnapshot(config, async () => { throw new Error('Network failure'); });
      writeSnapshot(next, root);
    })(), /Network failure/);
    assert.equal(fs.readFileSync(path.join(root, 'data/researchmap.json'), 'utf8'), before);
    generateContent(normalize(profile, groups()), root, config);
    assert.equal(fs.existsSync(path.join(root, 'public/api/papers-2026.json')), false);
    assert.deepEqual(read('public/api/papers.json'), []);
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});

test('validates opt-in configuration and rejects URLs instead of IDs', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'researchmap-config-'));
  const put = value => fs.writeFileSync(path.join(root, 'researchmap.config.json'), JSON.stringify(value));
  try {
    put({ ...config, enabled: false, permalink: '' });
    assert.equal(readConfig(root).enabled, false);
    put({ ...config, permalink: 'https://researchmap.jp/example' });
    assert.throws(() => readConfig(root), /researchmap ID/);
    put({ ...config, sync: { ...config.sync, career: 'false' } });
    assert.throws(() => readConfig(root), /sync option/);
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});

test('keeps unselected sections and rejects a snapshot from a different researcher', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'researchmap-sections-'));
  try {
    const api = path.join(root, 'public/api'); fs.mkdirSync(api, { recursive: true });
    for (const kind of ['papers','presentations','misc','awards','researchProjects']) {
      fs.writeFileSync(path.join(api, `${kind}.json`), JSON.stringify(kind === 'papers' ? [{ id: 'manual', year: '1999' }] : []));
    }
    for (const lang of ['ja','en']) {
      const dir = path.join(root, 'public/locales', lang); fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(path.join(dir, 'translations.json'), JSON.stringify({ header: {}, bio: { name: 'Manual Name' } }));
      const careerDir = path.join(root, 'public/content/career'); fs.mkdirSync(careerDir, { recursive: true });
      fs.writeFileSync(path.join(careerDir, `career_${lang}.json`), '[]');
    }
    const data = normalize(profile, fixture());
    const selected = { ...config, sync: { ...config.sync, papers: false, profile: false, career: false } };
    generateContent(data, root, selected);
    assert.equal(JSON.parse(fs.readFileSync(path.join(api, 'papers.json')))[0].id, 'manual');
    assert.deepEqual(JSON.parse(fs.readFileSync(path.join(api, 'years.json'))).years, ['2026', '1999']);
    assert.equal(JSON.parse(fs.readFileSync(path.join(root, 'public/locales/en/translations.json'))).bio.name, 'Manual Name');
    assert.equal(fs.readFileSync(path.join(root, 'public/content/career/career_en.json'), 'utf8'), '[]');
    assert.throws(() => generateContent(data, root, { ...config, permalink: 'another' }), /Invalid/);
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});

test('fetches only selected sections and requires resync when enabling more sections', async () => {
  const selected = { ...config, sync: Object.fromEntries(Object.keys(config.sync).map(k => [k, k === 'papers'])) };
  const calls = [];
  const data = await fetchSnapshot(selected, async url => {
    calls.push(url);
    if (calls.length === 1) return { ...profile, family_name: undefined, given_name: undefined, '@graph': [page('published_papers', [])] };
    throw new Error('Unselected sections must not be requested');
  });
  assert.equal(calls.length, 1);
  assert.deepEqual(data.syncedSections, ['papers']);
  assert.throws(() => generateContent(data, '/unused', config), /settings changed/);
});

test('CLI preserves CSV mode and generates enabled sections from an offline snapshot', () => {
  const { spawnSync } = require('node:child_process');
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'researchmap-cli-'));
  const project = path.resolve(__dirname, '..');
  const run = () => spawnSync(process.execPath, [path.join(root, 'scripts/generatePublicApi.cjs')], { encoding: 'utf8' });
  try {
    for (const dir of ['data', 'public', 'scripts']) fs.cpSync(path.join(project, dir), path.join(root, dir), { recursive: true });
    fs.symlinkSync(path.join(project, 'node_modules'), path.join(root, 'node_modules'), 'dir');
    fs.writeFileSync(path.join(root, 'researchmap.config.json'), JSON.stringify({ ...config, enabled: false }));
    let result = run(); assert.equal(result.status, 0, result.stderr);
    const api = path.join(root, 'public/api/papers.json');
    const csv = fs.readFileSync(api, 'utf8');
    writeSnapshot(normalize(profile, fixture()), root);
    result = run(); assert.equal(result.status, 0, result.stderr);
    assert.equal(fs.readFileSync(api, 'utf8'), csv, 'disabled mode ignores cached researchmap data');
    fs.writeFileSync(path.join(root, 'researchmap.config.json'), JSON.stringify(config));
    result = run(); assert.equal(result.status, 0, result.stderr);
    assert.equal(JSON.parse(fs.readFileSync(api))[0].id, 'p1');
    fs.unlinkSync(path.join(root, 'data/researchmap.json'));
    result = run(); assert.notEqual(result.status, 0);
    assert.match(result.stderr, /sync-researchmap first/);
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});
