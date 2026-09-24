// Shared season configuration helper.
// The Google Sheet Settings tab is the source of truth; js/config.js provides
// fallback values if the Sheet API cannot be reached.

function applyLeagueSettings(settings) {
  const merged = { ...LEAGUE, ...(settings || {}) };
  Object.assign(LEAGUE, merged);
  window.LEAGUE_RUNTIME = merged;

  document.querySelectorAll("[data-league-text]").forEach((el) => {
    const key = el.dataset.leagueText;
    if (merged[key] !== undefined) el.textContent = merged[key];
  });

  document.querySelectorAll("[data-league-href='venmo']").forEach((el) => {
    el.href = `https://venmo.com/u/${encodeURIComponent(merged.venmoHandle)}`;
  });

  document.querySelectorAll("[data-league-title]").forEach((el) => {
    const key = el.dataset.leagueTitle;
    if (merged[key] !== undefined) el.textContent = merged[key];
  });

  document.title = merged.leagueName || document.title;
  window.dispatchEvent(new CustomEvent("leagueSettingsReady", { detail: merged }));
  return merged;
}

async function loadLeagueSettings() {
  if (SEASON_DATA_MODE === "static") {
    return applyLeagueSettings(LEAGUE);
  }

  try {
    const data = await fetchLeagueStatus();
    return applyLeagueSettings(data.settings || {});
  } catch (err) {
    console.warn("Using fallback league settings:", err);
    return applyLeagueSettings(LEAGUE);
  }
}

async function fetchSeasonStatus() {
  if (SEASON_DATA_MODE === "static") {
    return apiGet("live-status");
  }
  return fetchLeagueStatus();
}

function getVenmoEntryUrl(teamName = "") {
  const leagueLabel = LEAGUE.seasonLabel || "Survivor Fantasy League";
  const note = `${leagueLabel} entry - ${teamName || "Team"}`;
  const amount = String(LEAGUE.entryFee || "$10").replace(/[^0-9.]/g, "") || "10";
  const params = new URLSearchParams({
    txn: "pay",
    recipients: LEAGUE.venmoHandle,
    amount,
    note
  });

  // Venmo's profile URL can discard transaction parameters during the
  // web-to-app handoff. The paycharge endpoint is intended to initialize
  // a payment with recipient, amount, and note.
  return `https://venmo.com/paycharge?${params.toString().replace(/\+/g, "%20")}`;
}
