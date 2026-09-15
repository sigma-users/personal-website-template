const fs = require('node:fs');
const path = require('node:path');
const { setTimeout: delay } = require('node:timers/promises');

const API_ORIGIN = 'https://api.researchmap.jp';
const SYNC_KEYS = ['papers', 'presentations', 'misc', 'awards', 'researchProjects', 'profile', 'career'];

function readConfig(root) {
  const config = JSON.parse(fs.readFileSync(path.join(root, 'researchmap.config.json'), 'utf8'));
  if (typeof config.enabled !== 'boolean') throw new Error('enabled must be true or false');
  if (config.enabled && (typeof config.permalink !== 'string' || !/^[A-Za-z0-9_-][A-Za-z0-9_.-]*$/.test(config.permalink))) {
    throw new Error('Enter the researchmap ID (the final part of your profile URL) in permalink');
  }
  if (!config.sync || SYNC_KEYS.some(key => typeof config.sync[key] !== 'boolean')) {
    throw new Error('Every sync option must be true or false');
  }
  return config;
}
const TYPES = ['published_papers', 'presentations', 'misc', 'awards',
  'research_projects', 'research_experience', 'education', 'research_interests'];
const LANGS = ['en', 'ja'];
const text = value => typeof value === 'string' ? value.trim() : '';
const localized = (value, lang) => text(value?.[lang]) || text(value?.[lang === 'en' ? 'ja' : 'en']);
const names = (value, lang) => {
  const entries = value?.[lang] || value?.[lang === 'en' ? 'ja' : 'en'] || [];
  if (!Array.isArray(entries)) throw new Error('Invalid author list');
  return entries.map(entry => text(entry.name)).filter(Boolean).join(', ');
};
const required = value => {
  if (!value) throw new Error('Required researchmap field is missing');
  return value;
};
const date = value => {
  if (!value || value === '9999' || String(value).startsWith('9999-')) return '';
  if (typeof value !== 'string' || !/^\d{4}(-\d{2}){0,2}$/.test(value)) {
    throw new Error('Invalid researchmap date');
  }
  return value;
};
const pair = (key, value) => ({ [key]: localized(value, 'en'), [`${key}Ja`]: localized(value, 'ja') });
const id = item => required(text(item['rm:id']));
const json = value => `${JSON.stringify(value, null, 2)}\n`;
const newest = (items, key) => items.sort((a, b) =>
  String(key(b)).localeCompare(String(key(a))) || a.id.localeCompare(b.id));

async function fetchJson(url, fetchImpl = fetch) {
  // No credentials: only researchmap's publicly available data is requested.
  let lastError;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const response = await fetchImpl(url, {
        headers: { Accept: 'application/json' },
        signal: AbortSignal.timeout(30000),
      });
      if (!response.ok) throw new Error(`researchmap HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      lastError = error;
      if (attempt < 2) await delay(1000 * 2 ** attempt);
    }
  }
  throw lastError;
}

function validatePage(page, type) {
  if (page?.['@type'] !== type || !Array.isArray(page.items) ||
      !Number.isSafeInteger(page.total_items) || page.total_items < 0 ||
      page.items.length > page.total_items) throw new Error(`Invalid ${type} response`);
  for (const item of page.items) {
    if (item['@type'] !== type || !id(item) ||
        !['disclosed', 'closed', 'researchers_only'].includes(item.display)) {
      throw new Error(`Invalid ${type} record`);
    }
  }
}

async function collectItems(type, initial, getJson, base) {
  let page = initial || await getJson(`${base}/${type}?format=json&start=1&limit=1000`);
  validatePage(page, type);
  const total = page.total_items;
  const items = [...page.items];
  while (items.length < total) {
    if (!page.items.length) throw new Error(`Incomplete ${type} response`);
    page = await getJson(`${base}/${type}?format=json&start=${items.length + 1}&limit=1000`);
    validatePage(page, type);
    if (page.total_items !== total || items.length + page.items.length > total) {
      throw new Error(`${type} changed during pagination; retry on next run`);
    }
    items.push(...page.items);
  }
  if (new Set(items.map(id)).size !== items.length) throw new Error(`Duplicate ${type} IDs`);
  return items.filter(item => item.display === 'disclosed');
}

async function fetchSnapshot(config, getJson = fetchJson) {
  const base = `${API_ORIGIN}/${encodeURIComponent(config.permalink)}`;
  const profile = await getJson(`${base}?format=json`);
  if (profile?.['@type'] !== 'researchers' || profile.permalink !== config.permalink || (profile['@graph'] !== undefined && !Array.isArray(profile['@graph']))) {
    throw new Error('Unexpected researchmap researcher response');
  }
  const groups = {};
  const sectionFor = { published_papers: 'papers', presentations: 'presentations', misc: 'misc', awards: 'awards', research_projects: 'researchProjects', research_experience: 'career', education: 'career', research_interests: 'profile' };
  for (const type of TYPES) {
    if (!config.sync[sectionFor[type]]) { groups[type] = []; continue; }
    const matches = (profile['@graph'] || []).filter(group => group['@type'] === type);
    if (matches.length > 1) throw new Error(`Duplicate ${type} collection`);
    groups[type] = await collectItems(type, matches[0], getJson, base);
  }
  return normalize(profile, groups, config.sync);
}

function normalize(profile, groups, sync = Object.fromEntries(SYNC_KEYS.map(key => [key, true]))) {
  const paper = item => {
    const published = date(item.publication_date);
    required(localized(item.paper_title, 'en'));
    return { id: id(item), ...pair('title', item.paper_title),
      authors: names(item.authors, 'en'), authorsJa: names(item.authors, 'ja'),
      ...pair('journal', item.publication_name), year: published.slice(0, 4),
      month: published.slice(5, 7), doi: text(item.identifiers?.doi?.[0]),
      isMainWork: item.major_achievement === true };
  };
  const publications = {
    papers: groups.published_papers.map(paper), misc: groups.misc.map(paper),
    presentations: groups.presentations.map(item => {
      const published = date(item.publication_date || item.from_event_date);
      required(localized(item.presentation_title, 'en'));
      return { id: id(item), ...pair('title', item.presentation_title),
        speakers: names(item.presenters, 'en'), speakersJa: names(item.presenters, 'ja'),
        ...pair('conference', item.event), date: published, year: published.slice(0, 4),
        ...pair('place', item.location), isInvited: item.invited === true };
    }),
    awards: groups.awards.map(item => {
      const awarded = date(item.award_date);
      required(localized(item.award_name, 'en'));
      return { id: id(item), ...pair('title', item.award_name), ...pair('awarder', item.association),
        year: awarded.slice(0, 4), month: awarded.slice(5, 7), isMainWork: item.major_achievement === true };
    }),
    researchProjects: groups.research_projects.map(item => {
      const from = date(item.from_date), to = date(item.to_date);
      required(localized(item.research_project_title, 'en'));
      return { id: id(item), ...pair('title', item.system_name), ...pair('subject', item.category),
        ...pair('funder', item.offer_organization), ...pair('description', item.research_project_title),
        number: text(item.identifiers?.grant_number?.[0]), yearFrom: from.slice(0, 4),
        monthFrom: from.slice(5, 7), yearTo: to.slice(0, 4), monthTo: to.slice(5, 7),
        isMainWork: item.major_achievement === true };
    }),
  };
  for (const [kind, items] of Object.entries(publications)) {
    newest(items, item => kind === 'presentations' ? item.date : kind === 'researchProjects'
      ? `${item.yearFrom}-${item.monthFrom}` : `${item.year}-${item.month}`);
  }
  const profiles = {}, careers = {};
  const affiliation = profile.affiliations?.find(item => item.display_affiliation === 'disclosed');
  const degree = profile.degrees?.find(item => item.display_degree === 'disclosed');
  const nameEn = ([localized(profile.given_name, 'en'), localized(profile.family_name, 'en')].filter(Boolean).join(' '));
  const nameJa = ([localized(profile.family_name, 'ja'), localized(profile.given_name, 'ja')].filter(Boolean).join(' '));
  if (sync.profile) { required(nameEn); required(nameJa); }
  for (const lang of LANGS) {
    profiles[lang] = { name: nameEn, nameJp: nameJa,
      position: affiliation?.display_job === 'disclosed' ? localized(affiliation.job, lang) : '',
      affiliation: affiliation ? [localized(affiliation.affiliation, lang), localized(affiliation.section, lang)].filter(Boolean).join(' / ') : '',
      phd: localized(degree?.degree, 'en'), phdJp: localized(degree?.degree, 'ja'),
      researchTags: groups.research_interests.map(item => localized(item.keyword, lang)).filter(Boolean),
    };
    careers[lang] = newest([
      ...groups.research_experience.map(item => ({
        id: `work-${id(item)}`, type: 'work', position: required(localized(item.job, lang) || localized(item.section, lang) || localized(item.affiliation, lang)),
        organization: localized(item.affiliation, lang), description: localized(item.section, lang),
        location: '', startDate: date(item.from_date), endDate: date(item.to_date),
      })),
      ...groups.education.map(item => ({
        id: `education-${id(item)}`, type: 'education',
        position: required([localized(item.department, lang), localized(item.course, lang)].filter(Boolean).join(' / ') || localized(item.affiliation, lang)),
        organization: localized(item.affiliation, lang), description: '', location: '',
        startDate: date(item.from_date), endDate: date(item.to_date),
      })),
    ], item => item.startDate);
  }
  // Store only fields used by the website, not a raw dump of the API response.
  return { schemaVersion: 1, syncedSections: SYNC_KEYS.filter(key => sync[key]), source: `https://researchmap.jp/${profile.permalink}`, profiles, careers, publications };
}

function writeSnapshot(snapshot, root) {
  const file = path.join(root, 'data/researchmap.json');
  const contents = json(snapshot);
  if (fs.existsSync(file) && fs.readFileSync(file, 'utf8') === contents) return false;
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(`${file}.tmp`, contents);
  fs.renameSync(`${file}.tmp`, file);
  return true;
}

function generateContent(snapshot, root, config) {
  if (snapshot.schemaVersion !== 1 || snapshot.source !== `https://researchmap.jp/${config.permalink}`) {
    throw new Error('Invalid researchmap snapshot');
  }
  if (SYNC_KEYS.some(key => config.sync[key] && !snapshot.syncedSections?.includes(key))) {
    throw new Error('Sync settings changed. Run npm run sync-researchmap before building.');
  }
  const api = path.join(root, 'public/api');
  const files = new Map();
  const publications = Object.fromEntries(Object.entries(snapshot.publications).map(([kind, items]) =>
    [kind, config.sync[kind] ? items : JSON.parse(fs.readFileSync(path.join(api, `${kind}.json`), 'utf8'))]));
  const years = [...new Set(['papers', 'presentations', 'misc'].flatMap(kind =>
    publications[kind].map(item => item.year).filter(Boolean)))].sort().reverse();
  for (const [kind, items] of Object.entries(publications)) files.set(path.join(api, `${kind}.json`), json(items));
  files.set(path.join(api, 'years.json'), json({ years }));
  for (const year of years) {
    for (const kind of ['papers', 'presentations', 'misc']) {
      files.set(path.join(api, `${kind}-${year}.json`), json(publications[kind].filter(item => item.year === year)));
    }
  }
  for (const lang of LANGS) {
    const translationFile = path.join(root, `public/locales/${lang}/translations.json`);
    const translation = JSON.parse(fs.readFileSync(translationFile, 'utf8'));
    if (config.sync.profile) {
      Object.assign(translation.bio, snapshot.profiles[lang]);
      translation.header.name = lang === 'en' ? snapshot.profiles[lang].name : snapshot.profiles[lang].nameJp;
      files.set(translationFile, json(translation));
    }
    if (config.sync.career) files.set(path.join(root, `public/content/career/career_${lang}.json`), json(snapshot.careers[lang]));
  }
  // Prepare every output before modifying files. A failed sync never reaches deployment.
  fs.mkdirSync(api, { recursive: true });
  for (const [file, content] of files) {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, content);
  }
  for (const file of fs.readdirSync(api)) {
    if (/^(papers|presentations|misc)-\d{4}\.json$/.test(file) && !files.has(path.join(api, file))) {
      fs.unlinkSync(path.join(api, file));
    }
  }
}

module.exports = { readConfig, TYPES, fetchJson, collectItems, fetchSnapshot, normalize, writeSnapshot, generateContent };
