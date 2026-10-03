const { test } = require('node:test');
const assert = require('node:assert/strict');
const { publicLeague } = require('./sync-league.cjs');
function fixture() {
  return { seasonStarted: true, entryCount: 1, settings: { picksPerTeam: 5, seasonStarted: true, secret: 'DO_NOT_PUBLISH' }, castaways: ['a', 'b', 'c', 'd', 'e'].map((id, i) => ({ id, name: id, outcome: [2, null, 17, 20, 0][i], secret: 'DO_NOT_PUBLISH' })), entries: [{ playerName: 'Example', teamName: 'Example Team', picks: ['e', 'c', 'a', 'd', 'b'], phone: 'DO_NOT_PUBLISH', email: 'DO_NOT_PUBLISH', paid: 'DO_NOT_PUBLISH', timestamp: 'DO_NOT_PUBLISH' }] };
}
test('Only public fields survive; scoring matches the website including outcome zero', () => {
  const result = publicLeague(fixture());
  assert.equal(JSON.stringify(result).includes('DO_NOT_PUBLISH'), false);
  assert.deepEqual(result.entries[0].picks, ['a', 'b', 'c', 'd', 'e']);
  assert.equal(result.entries[0].currentPoints, 39);
  assert.equal(result.entries[0].maxPossiblePoints, 59);
  assert.equal(result.entries[0].remainingPicks, 1);
});
test('Before season start no entries or picks are exposed', () => {
  const source = fixture(); source.seasonStarted = false; source.castaways = [];
  const result = publicLeague(source);
  assert.deepEqual(result.entries, []);
  assert.equal(result.entryCount, 1);
  assert.equal(result.settings.seasonStarted, false);
});
test('Malformed, partial and inconsistent payloads fail instead of replacing a snapshot', () => {
  assert.throws(() => publicLeague({ error: 'Unavailable' }));
  for (const mutate of [s => s.entries[0].picks[0] = 'unknown', s => s.entries[0].picks[0] = 'b', s => s.castaways[0].outcome = '2', s => s.entryCount = 2, s => s.castaways.push(s.castaways[0]), s => s.castaways[0].outcome = 18]) {
    const source = fixture(); mutate(source); assert.throws(() => publicLeague(source));
  }
});
