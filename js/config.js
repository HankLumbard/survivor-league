// Finalized season configuration.
// Keep the Google Sheet as the live source for entries, payment status,
// seasonStarted, scores, and outcomes. Static mode removes setup-data
// requests for normal page loads.
const SHEET_API_URL = "https://script.google.com/macros/s/AKfycby_XdTGvYffj4tv4na99u-i4HiKhHM_D3ggnHCO8R4aruvTVdrLETMnBpKzYIlM89YH/exec";

const SEASON_DATA_MODE = "static";

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
  seasonStarted: true,
};
