const fs = require('fs');
const path = require('path');
const Papa = require('papaparse');

// --- Functions copied/adapted from generatePublicApi.cjs ---

// CSVの内容を読み込む関数 (Identical to the one in generatePublicApi.cjs)
function readCsv(filePath) {
  const csvContent = fs.readFileSync(filePath, 'utf8');
  const lines = csvContent.split('\n').filter(line => line.trim() !== '');
  if (lines.length < 2) {
    // Handle empty or single-line CSVs gracefully for testing
    return { data: [], errors: [{ message: "CSV has less than 2 lines" }] };
  }
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

// Generic filtering logic adapted from generatePublicApi.cjs
function applyVisibilityFilter(csvData) {
  if (!csvData || !csvData.data) {
    return [];
  }
  return csvData.data.filter(item => {
    if (item.hasOwnProperty('公開の有無') && item['公開の有無'] === 'closed') { // Updated to 'closed'
      return false;
    }
    return true;
  });
}

// --- Test Infrastructure ---
let testsPassed = 0;
let testsFailed = 0;

function assertEqual(actual, expected, testName) {
  if (JSON.stringify(actual) === JSON.stringify(expected)) {
    console.log(`PASS: ${testName}`);
    testsPassed++;
  } else {
    console.error(`FAIL: ${testName}`);
    console.error(`  Expected: ${JSON.stringify(expected)}`);
    console.error(`  Actual:   ${JSON.stringify(actual)}`);
    testsFailed++;
  }
}

function assertCondition(condition, testName, failureMessage) {
    if (condition) {
        console.log(`PASS: ${testName}`);
        testsPassed++;
    } else {
        console.error(`FAIL: ${testName}`);
        console.error(`  Reason: ${failureMessage}`);
        testsFailed++;
    }
}


// --- Test Cases ---

// Test Case 1: Filtering "closed"
// Test Case 2: Including "disclosed"
// Test Case 4: Handling other values in "公開の有無" (empty, "yes" - should be included)
console.log('\n--- Testing rm_awards.csv (Filtering "closed", Including "disclosed", Other Values) ---');
const awardsTestPath = path.join(__dirname, '../test_data/test_rm_awards.csv');
const awardsTestData = readCsv(awardsTestPath);
const filteredAwards = applyVisibilityFilter(awardsTestData);

// Expected IDs after filtering test_rm_awards.csv
// award-2 (closed) and award-6 (closed) should be filtered out.
const expectedAwardIds = ['award-1', 'award-3', 'award-4', 'award-5', 'award-7'];
const actualAwardIds = filteredAwards.map(item => item.ID);

assertEqual(actualAwardIds.sort(), expectedAwardIds.sort(), 'Awards: Correct items after filtering for "closed"');

assertCondition(
    filteredAwards.every(item => item['公開の有無'] !== 'closed'),
    'Awards: No "closed" items present after filtering',
    'Found items with "公開の有無" as "closed" after filtering.'
);

// Test Case 2: Including "disclosed"
const award1 = filteredAwards.find(item => item.ID === 'award-1');
assertCondition(
    award1 && award1['公開の有無'] === 'disclosed',
    'Awards: Item with "公開の有無" as "disclosed" is present',
    'Item ID award-1 with "公開の有無" as "disclosed" not found or value incorrect.'
);

const award3 = filteredAwards.find(item => item.ID === 'award-3');
assertCondition(
    award3 && award3['公開の有無'] === 'disclosed',
    'Awards: Another item with "公開の有無" as "disclosed" is present',
    'Item ID award-3 with "公開の有無" as "disclosed" not found or value incorrect.'
);


// Test Case 4: Handling Other Values (should be included)
const award4 = filteredAwards.find(item => item.ID === 'award-4');
assertCondition(
    award4 && award4['公開の有無'] === 'yes',
    'Awards: Item with "公開の有無" as "yes" (other value) is present',
    'Item ID award-4 with "公開の有無" as "yes" not found or value incorrect.'
);

const award5 = filteredAwards.find(item => item.ID === 'award-5');
assertCondition(
    award5 && award5['公開の有無'] === '', // Empty string
    'Awards: Item with empty "公開の有無" is present',
    'Item ID award-5 with empty "公開の有無" not found or value incorrect.'
);


// Test Case 3: Handling Missing "公開の有無" Column
console.log('\n--- Testing rm_misc_missing_column.csv (Missing Column) ---');
const miscMissingColPath = path.join(__dirname, '../test_data/test_rm_misc_missing_column.csv');
const miscMissingColData = readCsv(miscMissingColPath);
const filteredMiscMissingCol = applyVisibilityFilter(miscMissingColData);

// Expected IDs - all items should be present as the column is missing
const expectedMiscIds = ['misc-1', 'misc-2', 'misc-3'];
const actualMiscIds = filteredMiscMissingCol.map(item => item.ID);

assertEqual(actualMiscIds.sort(), expectedMiscIds.sort(), 'Misc (Missing Column): All items present');

assertCondition(
    filteredMiscMissingCol.length === miscMissingColData.data.length,
    'Misc (Missing Column): Number of items is unchanged',
    `Expected ${miscMissingColData.data.length} items, but got ${filteredMiscMissingCol.length}`
);

// --- Summary ---
console.log('\n--- Test Summary ---');
console.log(`Total tests: ${testsPassed + testsFailed}`);
console.log(`Passed: ${testsPassed}`);
console.log(`Failed: ${testsFailed}`);

// Exit with error code if any tests failed
if (testsFailed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
