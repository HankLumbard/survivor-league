const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { publicLeague } = require('./sync-league.cjs');

function backend(started = true) {
  const tables = {
    Entries: [
      ['Timestamp', 'PlayerName', 'TeamName', 'Pick1', 'Pick2', 'Pick3', 'Pick4', 'Pick5', 'Paid', 'Phone'],
      ['PRIVATE_TIMESTAMP', 'Example Player', 'Example Team', 'a', 'b', 'c', 'd', 'e', 'PRIVATE_PAID', 'PRIVATE_PHONE'],
    ],
    Castaways: [
      ['Id', 'Name', 'Hometown', 'Occupation', 'Outcome', 'Age', 'Photo'],
      ...['a', 'b', 'c', 'd', 'e'].map((id, i) => [id, id, '', '', [0, 1, null, 20, 25][i], '', '']),
    ],
    Settings: [['Key', 'Value'], ['seasonStarted', started], ['adminSecret', 'PRIVATE_SETTING']],
  };
  const ss = {
    getSheetByName(name) {
      const values = tables[name];
      if (!values) return null;
      return {
        getLastRow: () => values.length,
        getDataRange: () => ({ getValues: () => values }),
        getRange: (row, col, count, width) => ({
          getValues: () => values.slice(row - 1, row - 1 + count).map(r => r.slice(col - 1, col - 1 + width)),
        }),
      };
    },
  };
  const cache = new Map([
    ['survivor51_league', JSON.stringify({ entries: [{ phone: 'PRIVATE_CACHED_PHONE' }] })],
    ['survivor51_leaderboard', JSON.stringify({ settings: { secret: 'PRIVATE_CACHED_SETTING' } })],
    ['survivor51_status', JSON.stringify({ settings: { secret: 'PRIVATE_CACHED_SETTING' } })],
  ]);
  const context = vm.createContext({
    SpreadsheetApp: { getActiveSpreadsheet: () => ss },
    CacheService: { getScriptCache: () => ({
      get: key => cache.get(key),
      put: (key, value) => cache.set(key, value),
      removeAll: keys => keys.forEach(key => cache.delete(key)),
    }) },
    ContentService: {
      MimeType: { JSON: 'json' },
      createTextOutput: text => ({ setMimeType: () => JSON.parse(text) }),
    },
  });
  vm.runInContext(fs.readFileSync(path.join(__dirname, '../apps-script/Code.gs'), 'utf8'), context);
  return { context, cache, get: action => context.doGet(action === undefined ? undefined : { parameter: { action } }) };
}

test('Every public route omits private entry fields, unknown settings and old cached responses', () => {
  for (const action of [undefined, 'league', 'leaderboard', 'status', 'live-status', 'unknown']) {
    const api = backend();
    const result = api.get(action);
    assert.equal(JSON.stringify(result).includes('PRIVATE_'), false, String(action));
    if (action === 'unknown') assert.equal(result.error, 'Unknown action.');
  }
});

test('Started leaderboard and legacy league retain names, picks and exact outcomes', () => {
  const api = backend();
  for (const action of ['leaderboard', 'league', undefined]) {
    const result = api.get(action);
    assert.equal(result.entryCount, 1);
    assert.equal(result.entries[0].teamName, 'Example Team');
    assert.deepEqual(Array.from(result.entries[0].picks), ['a', 'b', 'c', 'd', 'e']);
    assert.deepEqual(Array.from(result.castaways, c => c.outcome), [0, 1, null, 20, 25]);
    assert.equal(publicLeague(result).entries[0].currentPoints, 46);
  }
});

test('Pre-season entry count remains available while all picks stay private', () => {
  for (const action of ['leaderboard', 'league', undefined]) {
    const result = backend(false).get(action);
    assert.equal(result.entryCount, 1);
    assert.equal(result.entries.length, 0);
  }
});

test('Status and live-status caches never exchange different response shapes', () => {
  for (const order of [['live-status', 'status'], ['status', 'live-status']]) {
    const api = backend();
    order.forEach(action => api.get(action));
    assert.deepEqual(Object.keys(api.get('live-status')), ['seasonStarted']);
    assert.equal(api.get('status').entryCount, 1);
    assert.equal(api.get('status').castaways.length, 5);
  }
});

test('Cache clearing removes legacy private payloads and every new response cache', () => {
  const api = backend();
  ['status', 'live-status', 'leaderboard', 'league'].forEach(action => api.get(action));
  api.context.clearLeagueCaches();
  assert.equal(api.cache.size, 0);
});
