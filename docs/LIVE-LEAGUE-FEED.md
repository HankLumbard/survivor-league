# Public league data for recaps and scenarios

The Google Sheet remains the source of truth. GitHub Actions reads the existing
`?action=leaderboard` endpoint and saves a validated, public-only mirror at
`data/live-league.json` and a static HTML view at `data/live-league.html`. No Apps Script installation, redeployment or new
personal access token is needed.

Primary source for ordinary ChatGPT web readers:
https://outwitoutplayoutpick.com/data/live-league.html

Canonical structured analysis source:
https://github.com/HankLumbard/survivor-league/blob/main/data/live-league.json

Website mirror:
https://outwitoutplayoutpick.com/data/live-league.json

The workflow runs approximately every 15 minutes. GitHub may delay scheduled
runs. For an immediate refresh, open **Actions → Refresh public league data →
Run workflow → main**. After 60 days without repository activity GitHub can
disable scheduled workflows in public repositories; re-enable the workflow in
Actions if that happens. The Actions run history records each check; `updatedAt`
in the JSON records the last changed snapshot, not the last unchanged check.

Manual Sheet edits invalidate the existing Apps Script cache. The exporter uses
the same endpoint/cache as the leaderboard; it cannot show an elimination that
has not been entered in the Sheet or returned by that endpoint. If a value
appears stale, verify the Sheet's existing edit/change triggers.

The feed includes player/team names, castaway IDs/names/outcomes, locked picks,
current points, remaining picks, a small allowlist of season settings, and the
website's max-points display ceiling. It excludes phones, emails, payment
status, entry timestamps, arbitrary Settings rows, and other private fields.
Before `seasonStarted` is true it publishes no entries or picks. Outcome zero
is preserved exactly; a blank outcome (`null`) means still playing.

Scores use `js/scoring.js`, the same functions used by the leaderboard. Its
max-points ceiling values every remaining pick at 20; do not treat this as a
jointly achievable result when calculating elimination scenarios.

Fetch, validation or write failures leave the previous snapshot intact and
fail the workflow. A changed snapshot is committed to main and the existing
branch-based Pages build is explicitly requested. The website's leaderboard
continues using its existing live endpoint.

Local verification: `node --test scripts/sync-league.test.cjs`.
Local refresh: `node scripts/sync-league.cjs` (Node 22 or later).
