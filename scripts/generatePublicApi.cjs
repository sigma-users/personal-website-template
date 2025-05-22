const fs = require('fs');
const path = require('path');
const Papa = require('papaparse');

// CSVファイルのパス
const publishedPapersPath = path.join(__dirname, '../data/rm_published_papers.csv');
const presentationsPath = path.join(__dirname, '../data/rm_presentations.csv');
const miscPath = path.join(__dirname, '../data/rm_misc.csv');
const awardsPath = path.join(__dirname, '../data/rm_awards.csv');
const researchProjectsPath = path.join(__dirname, '../data/rm_research_projects.csv');

// 出力先ディレクトリ
const outputDir = path.join(__dirname, '../public/api');

// 出力ディレクトリが存在しない場合は作成
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// CSVの内容を読み込む関数
function readCsv(filePath) {
  const csvContent = fs.readFileSync(filePath, 'utf8');
  const lines = csvContent.split('\n').filter(line => line.trim() !== '');
  const header = lines[1]; // 2行目をヘッダーとして使用
  const data = lines.slice(2).join('\n'); // 3行目以降をデータとして使用
  const parsedData = Papa.parse(`${header}\n${data}`, {
    header: true,
    skipEmptyLines: true
  });

  // 'null'や'NULL'などをnullに変換
  parsedData.data.forEach(row => {
    for (const key in row) {
      if (row[key] === 'null' || row[key] === 'NULL') {
        row[key] = null;
      }
    }
  });

  return parsedData;
}

// Trueの判定
function isTrue(value) {
  return value === 'TRUE' || value === 'True' || value === 'true' || value === true || value === 1 || value === '1';
}

// 論文CSVの処理
const papersResult = readCsv(publishedPapersPath);

// 発表CSVの処理
const presentationsResult = readCsv(presentationsPath);

// MISC CSVの処理
const miscResult = readCsv(miscPath);

// AWARDS CSVの処理
const awardsResult = readCsv(awardsPath);

// RESEARCH PROJECTS CSVの処理
const researchProjectsResult = readCsv(researchProjectsPath);

// データ処理関数（前と同じ）
const visiblePapers = papersResult.data.filter(paper => {
  if (paper.hasOwnProperty('公開の有無') && paper['公開の有無'] === 'closed') {
    return false;
  }
  return true;
});
const formattedPapers = visiblePapers.map(paper => {
  let authors = '';
  if (paper['著者(英語)']) {
    authors = paper['著者(英語)'].replace(/^\[|\]$/g, '');
    if (authors) authors = authors.replace(/\\$/, '');
  } else if (paper['著者(日本語)']) {
    authors = paper['著者(日本語)'].replace(/^\[|\]$/g, '');
    if (authors) authors = authors.replace(/\\$/, '');
  }
  let authorsJa = '';
  if (paper['著者(日本語)']) {
    authorsJa = paper['著者(日本語)'].replace(/^\[|\]$/g, '');
    if (authorsJa) authorsJa = authorsJa.replace(/\\$/, '');
  } else if (paper['著者(英語)']) {
    authorsJa = paper['著者(英語)'].replace(/^\[|\]$/g, '');
    if (authorsJa) authorsJa = authorsJa.replace(/\\$/, '');
  }

  return {
    id: paper.ID || `paper-${Math.random().toString(36).substr(2, 9)}`,
    title: paper['タイトル(英語)'] || paper['タイトル(日本語)'] || 'Untitled',
    titleJa: paper['タイトル(日本語)'] || paper['タイトル(英語)'] || 'Untitled',
    authors: authors,
    authorsJa: authorsJa,
    journal: paper['誌名(英語)'] || paper['誌名(日本語)'] || '',
    journalJa: paper['誌名(日本語)'] || paper['誌名(英語)'] || '',
    year: paper['出版年月'] ? paper['出版年月'].substring(0, 4) : '',
    month: paper['出版年月'] ? paper['出版年月'].substring(5, 7) : '',
    doi: paper.DOI || '',
    isMainWork: isTrue(paper['主要な業績かどうか'])
  };
});

const visiblePresentations = presentationsResult.data.filter(presentation => {
  if (presentation.hasOwnProperty('公開の有無') && presentation['公開の有無'] === 'closed') {
    return false;
  }
  return true;
});
const formattedPresentations = visiblePresentations.map(presentation => {
  let speakers = '';
  if (presentation['講演者(英語)']) {
    speakers = presentation['講演者(英語)'].replace(/^\[|\]$/g, '');
    if (speakers) speakers = speakers.replace(/\\$/, '');
  } else if (presentation['講演者(日本語)']) {
    speakers = presentation['講演者(日本語)'].replace(/^\[|\]$/g, '');
    if (speakers) speakers = speakers.replace(/\\$/, '');
  }

  let speakersJa = '';
  if (presentation['講演者(日本語)']) {
    speakersJa = presentation['講演者(日本語)'].replace(/^\[|\]$/g, '');
    if (speakersJa) speakersJa = speakersJa.replace(/\\$/, '');
  } else if (presentation['講演者(英語)']) {
    speakersJa = presentation['講演者(英語)'].replace(/^\[|\]$/g, '');
    if (speakersJa) speakersJa = speakersJa.replace(/\\$/, '');
  }

  let year = '';
  if (presentation['発表年月日']) {
    year = presentation['発表年月日'].substring(0, 4);
  } else if (presentation['開催年月日(From)']) {
    year = presentation['開催年月日(From)'].substring(0, 4);
  }

  let place = '';
  if (presentation['開催地(英語)']) {
    place = presentation['開催地(英語)'];
  } else if (presentation['開催地(日本語)']) {
    place = presentation['開催地(日本語)'];
  } else if (presentation['国・地域']) {
    place = presentation['国・地域'];
  }

  let placeJa = '';
  if (presentation['開催地(日本語)']) {
    placeJa = presentation['開催地(日本語)'];
  } else if (presentation['開催地(英語)']) {
    placeJa = presentation['開催地(英語)'];
  }

  return {
    id: presentation.ID || `presentation-${Math.random().toString(36).substr(2, 9)}`,
    title: presentation['タイトル(英語)'] || presentation['タイトル(日本語)'] || 'Untitled',
    titleJa: presentation['タイトル(日本語)'] || presentation['タイトル(英語)'] || 'Untitled',
    speakers: speakers,
    speakersJa: speakersJa,
    conference: presentation['会議名(英語)'] || presentation['会議名(日本語)'] || '',
    conferenceJa: presentation['会議名(日本語)'] || presentation['会議名(英語)'] || '',
    date: presentation['発表年月日'] || presentation['開催年月日(From)'] || '',
    year: year,
    place: place,
    placeJa: placeJa,
    isInvited: isTrue(presentation['招待の有無'])
  };
});

const visibleMisc = miscResult.data.filter(misc => {
  if (misc.hasOwnProperty('公開の有無') && misc['公開の有無'] === 'closed') {
    return false;
  }
  return true;
});
const formattedMisc = visibleMisc.map(misc => {
  let authors = '';
  if (misc['著者(英語)']) {
    authors = misc['著者(英語)'].replace(/^\[|\]$/g, '');
    if (authors) authors = authors.replace(/\\$/, '');
  } else if (misc['著者(日本語)']) {
    authors = misc['著者(日本語)'].replace(/^\[|\]$/g, '');
    if (authors) authors = authors.replace(/\\$/, '');
  }

  let authorsJa = '';
  if (misc['著者(日本語)']) {
    authorsJa = misc['著者(日本語)'].replace(/^\[|\]$/g, '');
    if (authorsJa) authorsJa = authorsJa.replace(/\\$/, '');
  } else if (misc['著者(英語)']) {
    authorsJa = misc['著者(英語)'].replace(/^\[|\]$/g, '');
    if (authorsJa) authorsJa = authorsJa.replace(/\\$/, '');
  }

  return {
    id: misc.ID || `misc-${Math.random().toString(36).substr(2, 9)}`,
    title: misc['タイトル(英語)'] || misc['タイトル(日本語)'] || 'Untitled',
    titleJa: misc['タイトル(日本語)'] || misc['タイトル(英語)'] || 'Untitled',
    authors: authors,
    authorsJa: authorsJa,
    journal: misc['誌名(英語)'] || misc['誌名(日本語)'] || '',
    journalJa: misc['誌名(日本語)'] || misc['誌名(英語)'] || '',
    year: misc['出版年月'] ? misc['出版年月'].substring(0, 4) : '',
    month: misc['出版年月'] ? misc['出版年月'].substring(5, 7) : '',
    doi: misc.DOI || '',
    isMainWork: isTrue(misc['主要な業績かどうか'])
  };
});

const visibleAwards = awardsResult.data.filter(award => {
  if (award.hasOwnProperty('公開の有無') && award['公開の有無'] === 'closed') {
    return false;
  }
  return true;
});
const formattedAwards = visibleAwards.map(award => {
  return {
    id: award.ID || `award-${Math.random().toString(36).substr(2, 9)}`,
    title: award['賞名(英語)'] || award['賞名(日本語)'] || 'Untitled',
    titleJa: award['賞名(日本語)'] || award['賞名(英語)'] || 'Untitled',
    awarder: award['授与機関(英語)'] || award['授与機関(日本語)'] || '',
    awarderJa: award['授与機関(日本語)'] || award['授与機関(英語)'] || '',
    year: award['受賞年月'] ? award['受賞年月'].substring(0, 4) : '',
    month: award['受賞年月'] ? award['受賞年月'].substring(5, 7) : '',
    isMainWork: isTrue(award['主要な業績かどうか'])
  };
});

const visibleResearchProjects = researchProjectsResult.data.filter(researchProject => {
  if (researchProject.hasOwnProperty('公開の有無') && researchProject['公開の有無'] === 'closed') {
    return false;
  }
  return true;
});
const formattedResearchProjects = visibleResearchProjects.map(researchProject => {
  return {
    id: researchProject.ID || `researchProject-${Math.random().toString(36).substr(2, 9)}`,
    title: researchProject['制度名(英語)'] || researchProject['制度名(日本語)'] || '',
    titleJa: researchProject['制度名(日本語)'] || researchProject['制度名(英語)'] || '',
    subject: researchProject['研究種目(英語)'] || researchProject['研究種目(日本語)'] || '',
    subjectJa: researchProject['研究種目(日本語)'] || researchProject['研究種目(英語)'] || '',
    funder: researchProject['提供機関(英語)'] || researchProject['提供機関(日本語)'] || '',
    funderJa: researchProject['提供機関(日本語)'] || researchProject['提供機関(英語)'] || '',
    description: researchProject['タイトル(英語)'] || researchProject['タイトル(日本語)'] || '',
    descriptionJa: researchProject['タイトル(日本語)'] || researchProject['タイトル(英語)'] || '',
    number: researchProject['課題番号'] || '',
    yearFrom: researchProject['研究期間(From)'] ? researchProject['研究期間(From)'].substring(0, 4) : '',
    monthFrom: researchProject['研究期間(From)'] ? researchProject['研究期間(From)'].substring(5, 7) : '',
    yearTo: researchProject['研究期間(To)'] ? researchProject['研究期間(To)'].substring(0, 4) : '',
    monthTo: researchProject['研究期間(To)'] ? researchProject['研究期間(To)'].substring(5, 7) : '',
    isMainWork: isTrue(researchProject['主要な業績かどうか'])
  };
});


// 日付でソート
const sortedPapers = formattedPapers.sort((a, b) => {
  return (b.year + b.month) - (a.year + a.month);
});

const sortedPresentations = formattedPresentations.sort((a, b) => {
  return new Date(b.date) - new Date(a.date);
});

const sortedMisc = formattedMisc.sort((a, b) => {
  return (b.year + b.month) - (a.year + a.month);
});

const sortedAwards = formattedAwards.sort((a, b) => {
  return (b.year + b.month) - (a.year + a.month);
});

const sortedResearchProjects = formattedResearchProjects.sort((a, b) => {
  return (b.yearFrom + b.monthFrom) - (a.yearFrom + a.monthFrom);
});


// APIファイルを作成
// 個別のJSONファイル
fs.writeFileSync(
  path.join(outputDir, 'papers.json'),
  JSON.stringify(sortedPapers, null, 2)
);

fs.writeFileSync(
  path.join(outputDir, 'presentations.json'),
  JSON.stringify(sortedPresentations, null, 2)
);

fs.writeFileSync(
  path.join(outputDir, 'misc.json'),
  JSON.stringify(sortedMisc, null, 2)
);

fs.writeFileSync(
  path.join(outputDir, 'awards.json'),
  JSON.stringify(sortedAwards, null, 2)
);

fs.writeFileSync(
  path.join(outputDir, 'researchProjects.json'),
  JSON.stringify(sortedResearchProjects, null, 2)
);


// すべての年のリストを抽出
const yearsSet = new Set();
sortedPapers.forEach(paper => paper.year && yearsSet.add(paper.year));
sortedPresentations.forEach(presentation => presentation.year && yearsSet.add(presentation.year));
sortedMisc.forEach(misc => misc.year && yearsSet.add(misc.year));
const years = Array.from(yearsSet).sort((a, b) => b - a);

// 年ごとのデータを作成
years.forEach(year => {
  const yearPapers = sortedPapers.filter(paper => paper.year === year);
  const yearPresentations = sortedPresentations.filter(presentation => presentation.year === year);
  const yearMisc = sortedMisc.filter(misc => misc.year === year);

  // 年ごとのデータをJSONとして保存
  fs.writeFileSync(
    path.join(outputDir, `papers-${year}.json`),
    JSON.stringify(yearPapers, null, 2)
  );

  fs.writeFileSync(
    path.join(outputDir, `presentations-${year}.json`),
    JSON.stringify(yearPresentations, null, 2)
  );

  fs.writeFileSync(
    path.join(outputDir, `misc-${year}.json`),
    JSON.stringify(yearMisc, null, 2)
  );
});

// 利用可能な年のリストをJSONとして保存
fs.writeFileSync(
  path.join(outputDir, 'years.json'),
  JSON.stringify({ years }, null, 2)
);

console.log('APIファイルを生成しました');
