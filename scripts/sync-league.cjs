const fs = require('node:fs');
const path = require('node:path');
const { scoreEntry } = require('../js/scoring.js');

const root = path.resolve(__dirname, '..');
const settingsKeys = ['leagueName', 'seasonLabel', 'picksPerTeam', 'seasonStarted', 'premiereDateTime', 'entryDeadline', 'entryDeadlineDisplay'];
const validOutcomes = new Set([0, ...Array.from({ length: 17 }, (_, i) => i + 1), 20]);

function publicLeague(source) {
  if (!source || typeof source.seasonStarted !== 'boolean' || !Array.isArray(source.entries) || !Array.isArray(source.castaways)) {
    throw new Error('Invalid leaderboard response; keeping the previous snapshot.');
  }
  const picksPerTeam = Number(source.settings?.picksPerTeam || 5);
  if (!Number.isInteger(picksPerTeam) || picksPerTeam < 1 || picksPerTeam > 21) throw new Error('Invalid picksPerTeam.');
  const castaways = source.castaways.map(c => {
    if (typeof c.id !== 'string' || !c.id || typeof c.name !== 'string' || !c.name || (c.outcome !== null && !validOutcomes.has(c.outcome))) {
      throw new Error('Invalid castaway or outcome.');
    }
    return { id: c.id, name: c.name, outcome: c.outcome };
  }).sort((a, b) => a.id.localeCompare(b.id));
  const byId = Object.fromEntries(castaways.map(c => [c.id, c]));
  if (Object.keys(byId).length !== castaways.length) throw new Error('Duplicate castaway IDs.');
  if (source.seasonStarted && !castaways.length) throw new Error('Started season has no castaways.');
  if (!Number.isInteger(source.entryCount) || source.entryCount !== source.entries.length) throw new Error('Entry count mismatch.');
  const entries = source.seasonStarted ? source.entries.map(e => {
    if (typeof e.playerName !== 'string' || !e.playerName || typeof e.teamName !== 'string' || !e.teamName || !Array.isArray(e.picks) || e.picks.length !== picksPerTeam || new Set(e.picks).size !== picksPerTeam || e.picks.some(id => !Object.hasOwn(byId, id))) {
      throw new Error('Invalid entry or unknown pick.');
    }
    const picks = [...e.picks].sort();
    const score = scoreEntry({ picks }, byId);
    return { playerName: e.playerName, teamName: e.teamName, picks, currentPoints: score.current, maxPossiblePoints: score.max, remainingPicks: picks.filter(id => byId[id].outcome === null).length };
  }).sort((a, b) => a.teamName.localeCompare(b.teamName) || a.playerName.localeCompare(b.playerName)) : [];
  const settings = {};
  for (const key of settingsKeys) {
    const value = source.settings?.[key];
    if (value !== undefined && ['string', 'number', 'boolean'].includes(typeof value)) settings[key] = value;
  }
  settings.seasonStarted = source.seasonStarted;
  settings.picksPerTeam = picksPerTeam;
  return { schemaVersion: 1, seasonStarted: source.seasonStarted, entryCount: source.entryCount, settings, scoring: { stillPlaying: 0, nonWinningFinalist: 17, winner: 20, maxPossiblePointsNote: 'Website display ceiling: each remaining pick is valued at 20. This is not a jointly achievable team scenario.' }, castaways, entries };
}

async function syncLeague() {
  const config = fs.readFileSync(path.join(root, 'js/config.js'), 'utf8');
  const url = config.match(/const SHEET_API_URL\s*=\s*"([^"]+)"/)?.[1];
  if (!url || !url.startsWith('https://script.google.com/macros/s/')) throw new Error('Missing production Apps Script URL.');
  const endpoint = new URL(url);
  endpoint.searchParams.set('action', 'leaderboard');
  let snapshot;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const response = await fetch(endpoint, { signal: AbortSignal.timeout(45000), redirect: 'follow' });
      if (!response.ok) throw new Error(`Leaderboard HTTP ${response.status}`);
      snapshot = publicLeague(await response.json());
      break;
    } catch (error) {
      if (attempt === 3) throw error;
      console.error(`Fetch attempt ${attempt} failed; retrying.`);
    }
  }
  const destination = path.join(root, 'data/live-league.json');
  if (fs.existsSync(destination)) {
    const { updatedAt, ...previous } = JSON.parse(fs.readFileSync(destination, 'utf8'));
    if (JSON.stringify(previous) === JSON.stringify(snapshot)) {
      console.log('League data unchanged; previous snapshot retained.');
      return;
    }
  }
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.writeFileSync(destination + '.tmp', JSON.stringify({ updatedAt: new Date().toISOString(), ...snapshot }, null, 2) + '\n');
  fs.renameSync(destination + '.tmp', destination);
  console.log(`Published snapshot: ${snapshot.entryCount} teams, ${snapshot.entries.reduce((n, e) => n + e.picks.length, 0)} public picks.`);
}

module.exports = { publicLeague, syncLeague };
if (require.main === module) syncLeague().catch(error => { console.error(error.message); process.exitCode = 1; });
