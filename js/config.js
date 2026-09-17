// ------------------------------------------------------------------
// FILL THIS IN once you've deployed the Apps Script as a Web App
// (Deploy > New deployment > Web app). Paste the URL that ends in /exec.
// ------------------------------------------------------------------
const SHEET_API_URL = "https://script.google.com/macros/s/AKfycby_XdTGvYffj4tv4na99u-i4HiKhHM_D3ggnHCO8R4aruvTVdrLETMnBpKzYIlM89YH/exec";

// Season setup mode:
//   "live"   = Settings/Castaways are read from Google Sheets during setup
//   "static" = finalized season data in this file/repository is used for speed
const SEASON_DATA_MODE = "live";

// Fallback values only. The Google Sheet Settings tab is the live source
// of truth once the Apps Script deployment has been updated.
const LEAGUE = {
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
};
