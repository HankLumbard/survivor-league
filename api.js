// ------------------------------------------------------------------
// Talks to the Apps Script web app that sits in front of the Google Sheet.
// GET  -> { castaways, entries, settings }
// POST -> submit a new entry
//
// Note on the POST Content-Type: we deliberately send "text/plain" instead
// of "application/json". Sending JSON triggers a CORS "preflight" request
// that Apps Script web apps don't handle, which makes the request fail
// silently. text/plain avoids the preflight; Apps Script still reads the
// raw JSON body fine on the other end (see Code.gs).
// ------------------------------------------------------------------

async function fetchLeagueData() {
  const res = await fetch(SHEET_API_URL, { method: "GET" });
  if (!res.ok) throw new Error(`Sheet API returned ${res.status}`);
  return res.json();
}

async function submitEntry({ playerName, teamName, phone, picks }) {
  const res = await fetch(SHEET_API_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify({ action: "submitEntry", playerName, teamName, phone, picks }),
  });
  if (!res.ok) throw new Error(`Sheet API returned ${res.status}`);
  return res.json();
}
