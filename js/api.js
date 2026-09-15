// ------------------------------------------------------------------
// Talks to the Apps Script web app that sits in front of the Google Sheet.
//
// GET actions:
//   ?action=status      -> season status only
//   ?action=leaderboard -> data needed for the public leaderboard
//   ?action=league      -> full league data (backward compatibility)
//
// POST:
//   -> submit a new entry
//
// Note on the POST Content-Type: we deliberately send "text/plain" instead
// of "application/json". Sending JSON triggers a CORS "preflight" request
// that Apps Script web apps don't handle, which makes the request fail
// silently. text/plain avoids the preflight; Apps Script still reads the
// raw JSON body fine on the other end (see Code.gs).
// ------------------------------------------------------------------

async function apiGet(action) {
  const url = `${SHEET_API_URL}?action=${encodeURIComponent(action)}`;

  const res = await fetch(url, {
    method: "GET"
  });

  if (!res.ok) {
    throw new Error(`Sheet API returned ${res.status}`);
  }

  return res.json();
}

// Entry page only needs to know whether the season has started.
async function fetchLeagueStatus() {
  return apiGet("status");
}

// Leaderboard only gets the data it actually needs.
async function fetchLeaderboardData() {
  return apiGet("leaderboard");
}

// Kept for compatibility with any older page/code that may still call it.
async function fetchLeagueData() {
  return apiGet("league");
}

async function submitEntry({ playerName, teamName, phone, picks }) {
  const res = await fetch(SHEET_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain;charset=utf-8"
    },
    body: JSON.stringify({
      action: "submitEntry",
      playerName,
      teamName,
      phone,
      picks
    }),
  });

  if (!res.ok) {
    throw new Error(`Sheet API returned ${res.status}`);
  }

  return res.json();
}