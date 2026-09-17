/**
 * Survivor 51 Fantasy League — Apps Script backend.
 *
 * How this works:
 *  - This script lives inside a Google Sheet (Extensions > Apps Script).
 *  - The sheet itself IS the database: one tab for entries, one for
 *    castaways, one for settings. You run the league by editing cells.
 *  - Deployed as a Web App, it exposes:
 *      GET  ?action=status      -> season status + public season settings
 *      GET  ?action=leaderboard -> data needed for the public leaderboard
 *      GET  ?action=league      -> full league data (backward compatibility)
 *      POST {action:"submitEntry", ...} -> appends a new locked entry
 *
 * Setup (see README.md for the full walkthrough):
 *  1. Run `setupSheets` once from the Apps Script editor (or the
 *     "League Admin" menu that appears in the sheet) to create the three
 *     tabs with headers and the 21 Survivor 51 castaways pre-loaded.
 *  2. Deploy > New deployment > Web app > Execute as "Me", Who has access
 *     "Anyone". Copy the /exec URL into js/config.js on the website.
 *  3. Whenever you edit this file, you must create a NEW deployment (or
 *     "Manage deployments" > edit > new version) for the live URL to see
 *     the change — saving alone is not enough.
 */

const SHEET_ENTRIES = "Entries";
const SHEET_CASTAWAYS = "Castaways";
const SHEET_SETTINGS = "Settings";

// Cache for up to 6 hours. Commissioner edits automatically invalidate
// the cache, so normal weekly updates appear immediately.
// Apps Script CacheService has a maximum TTL of 6 hours.
const CACHE_SECONDS = 21600;
const CACHE_KEY_STATUS = "survivor51_status";
const CACHE_KEY_LEADERBOARD = "survivor51_leaderboard";
const CACHE_KEY_LEAGUE = "survivor51_league";

// Season-wide values live in the Google Sheet's Settings tab. These values
// are only used to seed missing Settings rows; existing values are preserved.
const DEFAULT_SETTINGS = {
  leagueName: "Survivor 51 Fantasy League",
  seasonLabel: "Survivor 51",
  entryFee: "$10",
  venmoHandle: "Henry-Lumbard-1",
  picksPerTeam: 5,
  premiereDate: "September 23, 2026",
  premiereDateTime: "2026-09-23T20:00:00-04:00",
  premiereDisplay: "Wednesday, September 23 · 8:00 PM ET",
  entryDeadline: "September 30, 2026",
  entryDeadlineDisplay: "8:00 PM ET on September 30, 2026",
  commissionerName: "Henry",
  seasonStarted: false,
};

// Keep this in sync with js/castaways.js on the website — same ids, same
// names. This is only used the first time you run setupSheets(); after
// that, the Castaways tab in the sheet is the source of truth.
const CASTAWAY_SEED = [
  { id: "aaliyah-puglia",     name: "Aaliyah Puglia",                 hometown: "Providence, RI",       occupation: "Chef" },
  { id: "alexis-levine",      name: "Alexis Levine",                  hometown: "Atlanta, GA",          occupation: "Criminal Defense Attorney" },
  { id: "thien-an-nguyen",    name: "An \u201cThien An\u201d Nguyen", hometown: "Fort Worth, TX",       occupation: "Medical Student" },
  { id: "ana-sani",           name: "Ana Sani",                       hometown: "Toronto, ON",          occupation: "Voice Actress" },
  { id: "jelly-loblack",      name: "Angelica \u201cJelly\u201d Loblack", hometown: "Bloomington, IN",  occupation: "Sociology Professor" },
  { id: "rob-antonson",       name: "Rob Antonson",                   hometown: "Cumberland, RI",       occupation: "Airline Gate Agent" },
  { id: "brady-booker",       name: "Brady Booker",                   hometown: "Knoxville, TN",        occupation: "Pro Wrestler" },
  { id: "patt-cannaday",      name: "Patt Cannaday",                  hometown: "Washington, D.C.",     occupation: "Federal Prosecutor" },
  { id: "linnea-capobianco",  name: "Linnea Capobianco",              hometown: "Jersey City, NJ",      occupation: "Entrepreneur" },
  { id: "cristian-chavez",    name: "Cristian Chavez",                hometown: "Salt Lake City, UT",   occupation: "Head of HR" },
  { id: "sharonda-cox",       name: "Sharonda Cox",                   hometown: "Richmond, KY",         occupation: "Resident OB-GYN" },
  { id: "jenna-doore",        name: "Jenna Doore",                    hometown: "Toledo, OH",           occupation: "Wedding Photographer" },
  { id: "kristin-flickinger", name: "Kristin Flickinger",             hometown: "Santa Barbara, CA",    occupation: "Crisis Management" },
  { id: "ori-jean-charles",   name: "Ori Jean-Charles",               hometown: "Spring Valley, NY",    occupation: "Personal Trainer" },
  { id: "lewis-kelly",        name: "Lewis Kelly",                    hometown: "Corozal, Puerto Rico", occupation: "Farmer" },
  { id: "danny-kilby",        name: "Danny Kilby",                    hometown: "London, ON",           occupation: "Game Designer" },
  { id: "carter-krull",       name: "Carter Krull",                   hometown: "Sioux Falls, SD",      occupation: "Livestock Farmer" },
  { id: "eric-macksoud",      name: "Eric Macksoud",                  hometown: "Windsor Locks, CT",    occupation: "Mental Health Counselor" },
  { id: "maggie-nestor",      name: "Maggie Nestor",                  hometown: "Charles Town, WV",     occupation: "Farmer" },
  { id: "mike-pinsky",        name: "Mike Pinsky",                    hometown: "New York, NY",         occupation: "Baseball Operations Executive" },
  { id: "devin-way",          name: "Devin Way",                      hometown: "Los Angeles, CA",      occupation: "Actor" },
];

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("League Admin")
    .addItem("Set up sheets (run once)", "setupSheets")
    .addToUi();
}

function setupSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  let entries = ss.getSheetByName(SHEET_ENTRIES);
  if (!entries) entries = ss.insertSheet(SHEET_ENTRIES);
  if (entries.getLastRow() === 0) {
    entries.appendRow(["Timestamp", "PlayerName", "TeamName", "Pick1", "Pick2", "Pick3", "Pick4", "Pick5", "Paid", "Phone"]);
  }

  let cast = ss.getSheetByName(SHEET_CASTAWAYS);
  if (!cast) cast = ss.insertSheet(SHEET_CASTAWAYS);
  if (cast.getLastRow() === 0) {
    cast.appendRow(["Id", "Name", "Hometown", "Occupation", "Outcome", "Age", "Photo"]);
    CASTAWAY_SEED.forEach((c) => cast.appendRow([c.id, c.name, c.hometown, c.occupation, "", "", ""]));
  } else {
    const headers = cast.getRange(1, 1, 1, cast.getLastColumn()).getValues()[0].map(String);
    ["Age", "Photo"].forEach((header) => {
      if (!headers.includes(header)) cast.getRange(1, cast.getLastColumn() + 1).setValue(header);
    });
  }

  let settings = ss.getSheetByName(SHEET_SETTINGS);
  if (!settings) settings = ss.insertSheet(SHEET_SETTINGS);
  if (settings.getLastRow() === 0) settings.appendRow(["Key", "Value"]);

  const existingKeys = new Set();
  if (settings.getLastRow() >= 2) {
    settings.getRange(2, 1, settings.getLastRow() - 1, 1).getValues().forEach(([key]) => {
      if (key) existingKeys.add(String(key));
    });
  }

  Object.entries(DEFAULT_SETTINGS).forEach(([key, value]) => {
    if (!existingKeys.has(key)) {
      settings.appendRow([key, value]);
    }
  });

  SpreadsheetApp.getUi().alert("Sheets are set up. Existing Settings values were preserved; missing season settings were added.");
}

function doGet(e) {
  const action = e && e.parameter && e.parameter.action ? e.parameter.action : "league";
  const cache = CacheService.getScriptCache();

  if (action === "status") {
    return cachedJsonResponse(cache, CACHE_KEY_STATUS, function () {
      const ss = SpreadsheetApp.getActiveSpreadsheet();
      const settings = readSettings(ss);
      return {
        seasonStarted: settings.seasonStarted === true,
        entryCount: countEntries(ss),
        castaways: readCastaways(ss),
        settings: settings,
      };
    });
  }

  if (action === "live-status") {
    return cachedJsonResponse(cache, CACHE_KEY_STATUS, function () {
      const ss = SpreadsheetApp.getActiveSpreadsheet();
      const settings = readSettings(ss);
      return { seasonStarted: settings.seasonStarted === true };
    });
  }

  if (action === "leaderboard") {
    return cachedJsonResponse(cache, CACHE_KEY_LEADERBOARD, function () {
      const ss = SpreadsheetApp.getActiveSpreadsheet();
      const settings = readSettings(ss);
      const seasonStarted = settings.seasonStarted === true;
      if (!seasonStarted) {
        return {
          seasonStarted: false,
          entryCount: countEntries(ss),
          entries: readPublicEntries(ss),
          castaways: [],
          settings: settings,
        };
      }
      return {
        seasonStarted: true,
        entryCount: countEntries(ss),
        entries: readPublicEntries(ss),
        castaways: readCastaways(ss),
        settings: settings,
      };
    });
  }

  // Backward-compatible full response for older clients.
  return cachedJsonResponse(cache, CACHE_KEY_LEAGUE, function () {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    return {
      castaways: readCastaways(ss),
      entries: readEntries(ss),
      settings: readSettings(ss),
    };
  });
}

function doPost(e) {
  let body;
  try {
    body = JSON.parse(e.postData.contents);
  } catch (err) {
    return jsonResponse({ error: "Malformed request." });
  }

  if (body.action !== "submitEntry") {
    return jsonResponse({ error: "Unknown action." });
  }

  const ss = SpreadsheetApp.getActiveSpreadsheet();

  const settings = readSettings(ss);
  if (settings.seasonStarted === true) {
    return jsonResponse({ error: "Entries are closed — the season has already started." });
  }

  const playerName = (body.playerName || "").toString().trim();
  const teamName = (body.teamName || "").toString().trim();
  const phone = (body.phone || "").toString().trim();
  const picks = Array.isArray(body.picks) ? body.picks : [];

  const picksPerTeam = Number(settings.picksPerTeam) || 5;
  if (!playerName || !teamName || !phone || picks.length !== picksPerTeam || new Set(picks).size !== picksPerTeam) {
    return jsonResponse({ error: "Invalid submission — fill in your name, phone number, and the required number of different castaways." });
  }

  const existingNames = readPlayerNames(ss);
  const dupe = existingNames.some((name) => name.trim().toLowerCase() === playerName.toLowerCase());
  if (dupe) {
    return jsonResponse({ error: "That name has already submitted a team." });
  }

  const sheet = ss.getSheetByName(SHEET_ENTRIES);
  sheet.appendRow([new Date(), playerName, teamName, picks[0], picks[1], picks[2], picks[3], picks[4], "FALSE", phone]);

  // A new entry changes the status/leaderboard entry count, so don't serve
  // an older cached response after a successful submission.
  clearLeagueCaches();

  return jsonResponse({ ok: true });
}

function cachedJsonResponse(cache, key, builder) {
  const cached = cache.get(key);
  if (cached) {
    return jsonResponse(JSON.parse(cached));
  }

  const payload = builder();
  const serialized = JSON.stringify(payload);

  // Apps Script CacheService has a per-value size limit. These league
  // responses are intentionally small, but skip caching if one ever grows
  // beyond the limit rather than breaking the request.
  if (serialized.length <= 95000) {
    cache.put(key, serialized, CACHE_SECONDS);
  }

  return jsonResponse(payload);
}

function clearLeagueCaches() {
  CacheService.getScriptCache().removeAll([
    CACHE_KEY_STATUS,
    CACHE_KEY_LEADERBOARD,
    CACHE_KEY_LEAGUE,
  ]);
}

// Automatically invalidate cached data when the commissioner edits the
// spreadsheet. This keeps the site fast between updates without making
// the commissioner remember to clear anything manually.
//
// A simple onEdit trigger is enough here because it only uses CacheService.
function onEdit(e) {
  if (!e || !e.range) return;

  const sheetName = e.range.getSheet().getName();
  if (
    sheetName === SHEET_CASTAWAYS ||
    sheetName === SHEET_SETTINGS ||
    sheetName === SHEET_ENTRIES
  ) {
    clearLeagueCaches();
  }
}

function countEntries(ss) {
  const sheet = ss.getSheetByName(SHEET_ENTRIES);
  if (!sheet) return 0;
  return Math.max(0, sheet.getLastRow() - 1);
}

function readPlayerNames(ss) {
  const sheet = ss.getSheetByName(SHEET_ENTRIES);
  if (!sheet) return [];
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];
  return sheet.getRange(2, 2, lastRow - 1, 1).getValues()
    .filter((r) => r[0])
    .map((r) => String(r[0]));
}

function readPublicEntries(ss) {
  const sheet = ss.getSheetByName(SHEET_ENTRIES);
  if (!sheet) return [];
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];
  // Public leaderboard only needs PlayerName, TeamName and Pick1-Pick5.
  return sheet.getRange(2, 2, lastRow - 1, 7).getValues()
    .filter((r) => r[0])
    .map((r) => ({
      playerName: String(r[0]),
      teamName: String(r[1]),
      picks: [String(r[2]), String(r[3]), String(r[4]), String(r[5]), String(r[6])],
    }));
}

function readCastawayOutcomes(ss) {
  const sheet = ss.getSheetByName(SHEET_CASTAWAYS);
  if (!sheet) return [];
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];
  // Leaderboard needs only the stable id, display name and outcome.
  return sheet.getRange(2, 1, lastRow - 1, 5).getValues()
    .filter((r) => r[0])
    .map((r) => ({
      id: String(r[0]),
      name: String(r[1]),
      outcome: r[4] === "" || r[4] === null || r[4] === undefined ? null : Number(r[4]),
    }));
}

function readCastaways(ss) {
  const sheet = ss.getSheetByName(SHEET_CASTAWAYS);
  if (!sheet) return [];
  const values = sheet.getDataRange().getValues();
  if (values.length < 2) return [];

  const headers = values[0].map((h) => String(h).trim().toLowerCase());
  const col = (name, fallback) => {
    const index = headers.indexOf(name.toLowerCase());
    return index >= 0 ? index : fallback;
  };

  const idCol = col("id", 0);
  const nameCol = col("name", 1);
  const hometownCol = col("hometown", 2);
  const occupationCol = col("occupation", 3);
  const outcomeCol = col("outcome", 4);
  const ageCol = col("age", -1);
  const photoCol = col("photo", -1);

  return values.slice(1)
    .filter((r) => r[idCol])
    .map((r) => ({
      id: String(r[idCol]),
      name: String(r[nameCol] || ""),
      hometown: String(r[hometownCol] || ""),
      occupation: String(r[occupationCol] || ""),
      age: ageCol >= 0 && r[ageCol] !== "" ? Number(r[ageCol]) : null,
      photo: photoCol >= 0 ? String(r[photoCol] || "") : "",
      outcome: r[outcomeCol] === "" || r[outcomeCol] === null || r[outcomeCol] === undefined ? null : Number(r[outcomeCol]),
    }));
}

function readEntries(ss) {
  const sheet = ss.getSheetByName(SHEET_ENTRIES);
  if (!sheet) return [];
  const values = sheet.getDataRange().getValues();
  const rows = values.slice(1);
  return rows
    .filter((r) => r[1])
    .map((r) => ({
      timestamp: r[0] instanceof Date ? r[0].toISOString() : String(r[0]),
      playerName: String(r[1]),
      teamName: String(r[2]),
      picks: [String(r[3]), String(r[4]), String(r[5]), String(r[6]), String(r[7])],
      paid: String(r[8]).toUpperCase() === "TRUE",
      phone: r[9] ? String(r[9]) : "",
    }));
}

function readSettings(ss) {
  const sheet = ss.getSheetByName(SHEET_SETTINGS);
  if (!sheet) return { ...DEFAULT_SETTINGS };
  const values = sheet.getDataRange().getValues();
  const settings = { ...DEFAULT_SETTINGS };
  values.slice(1).forEach(([key, value]) => {
    if (!key) return;
    settings[String(key)] = String(value).toUpperCase() === "TRUE" ? true : String(value).toUpperCase() === "FALSE" ? false : value;
  });
  return settings;
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
