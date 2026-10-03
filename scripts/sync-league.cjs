const fs = require('node:fs');
const path = require('node:path');
const { scoreEntry } = require('../js/scoring.js');

const root = path.resolve(__dirname, '..');
const settingsKeys = ['leagueName', 'seasonLabel', 'picksPerTeam', 'seasonStarted', 'premiereDateTime', 'entryDeadline', 'entryDeadlineDisplay'];
const validOutcomes = new Set([0, ...Array.from({ length: 17 }, (_, i) => i + 1), 20, 25]);

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
  return { schemaVersion: 1, seasonStarted: source.seasonStarted, entryCount: source.entryCount, settings, scoring: { stillPlaying: 0, nonWinningFinalist: 20, winner: 25, maxPossiblePointsNote: 'Website display ceiling: each remaining pick is valued at 25. This is not a jointly achievable team scenario.' }, castaways, entries };
}

function leagueHtml(snapshot) {
  const escape = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const cast = Object.fromEntries(snapshot.castaways.map(c => [c.id, c]));
  const teams = snapshot.entries.map(e => `<tr><td>${escape(e.playerName)}</td><td>${escape(e.teamName)}</td><td>${e.picks.map(id => escape(cast[id].name)).join(', ')}</td><td>${e.currentPoints}</td><td>${e.remainingPicks}</td></tr>`).join('\n');
  const outcomes = snapshot.castaways.map(c => `<tr><td>${escape(c.name)}</td><td>${escape(c.id)}</td><td>${c.outcome === null ? 'Still playing' : c.outcome}</td></tr>`).join('\n');
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Survivor league data for recaps and scenarios</title><style>body{font:16px system-ui,sans-serif;max-width:1100px;margin:2rem auto;padding:0 1rem;line-height:1.5}table{border-collapse:collapse;width:100%;margin-bottom:2rem}th,td{text-align:left;border-bottom:1px solid #ddd;padding:.6rem;vertical-align:top}th{background:#eee}.table-wrap{overflow-x:auto}</style></head>
<body><h1>${escape(snapshot.settings.leagueName || 'Survivor league')} — public data</h1>
<p>Last data change: <time>${escape(snapshot.updatedAt)}</time>. Source: the commissioner’s Google Sheet, through the live leaderboard API. Automated checks run approximately every 15 minutes; scheduled runs may be delayed.</p>
<p>Season started: ${snapshot.seasonStarted ? 'Yes' : 'No'}. Teams: ${snapshot.entryCount}. Picks per team: ${snapshot.settings.picksPerTeam}.</p>
<p><a href="../leaderboard.html">Leaderboard</a> · <a href="live-league.json">Structured JSON</a></p>
<h2>Teams and locked picks</h2>${snapshot.seasonStarted ? '' : '<p>Picks remain hidden until the season starts.</p>'}
<div class="table-wrap"><table><thead><tr><th>Player</th><th>Team</th><th>Picks</th><th>Current points</th><th>Remaining picks</th></tr></thead><tbody>${teams}</tbody></table></div>
<h2>Castaway outcomes</h2><p>A blank outcome in the Sheet means still playing. Numeric outcomes are the exact point values recorded by the commissioner. Non-winning finalists receive 20 points; the winner receives 25.</p>
<div class="table-wrap"><table><thead><tr><th>Castaway</th><th>Stable ID</th><th>Outcome / points</th></tr></thead><tbody>${outcomes}</tbody></table></div>
<p>${escape(snapshot.scoring.maxPossiblePointsNote)}</p></body></html>\n`;
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
  let published;
  if (fs.existsSync(destination)) {
    const previousSnapshot = JSON.parse(fs.readFileSync(destination, 'utf8'));
    const { updatedAt, ...previous } = previousSnapshot;
    if (JSON.stringify(previous) === JSON.stringify(snapshot)) published = previousSnapshot;
  }
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  if (!published) {
    published = { updatedAt: new Date().toISOString(), ...snapshot };
    fs.writeFileSync(destination + '.tmp', JSON.stringify(published, null, 2) + '\n');
    fs.renameSync(destination + '.tmp', destination);
    console.log(`Published snapshot: ${snapshot.entryCount} teams, ${snapshot.entries.reduce((n, e) => n + e.picks.length, 0)} public picks.`);
  } else {
    console.log('League data unchanged; previous snapshot retained.');
  }
  const htmlPath = path.join(root, 'data/live-league.html');
  const html = leagueHtml(published);
  if (!fs.existsSync(htmlPath) || fs.readFileSync(htmlPath, 'utf8') !== html) {
    fs.writeFileSync(htmlPath + '.tmp', html);
    fs.renameSync(htmlPath + '.tmp', htmlPath);
  }
}

module.exports = { publicLeague, leagueHtml, syncLeague };
if (require.main === module) syncLeague().catch(error => { console.error(error.message); process.exitCode = 1; });
