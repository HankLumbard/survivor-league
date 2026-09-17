# Survivor 51 Fantasy League

A small static site (home, draft entry, leaderboard) for a family/friends
Survivor fantasy league, hosted free on GitHub Pages. The "database" is a
Google Sheet — no separate backend service to learn. You run the league by
editing cells in the sheet.

## How the pieces fit together

- **The website** (index.html, entry.html, leaderboard.html) is plain static HTML/CSS/JS, hosted on GitHub Pages.
- **The Google Sheet** holds three tabs: Entries, Castaways, Settings. This is where live league data and commissioner administration live.
- **Apps Script** (apps-script/Code.gs) is a small script that lives inside the Google Sheet. It lets the website read from and write to the sheet.
- **The commissioner guide** (docs/COMMISSIONER.md) documents setup, weekly operation, future-season setup, optimization, and handoff.

## Current production architecture

The repository is now optimized for the current season.

- SEASON_DATA_MODE is static.
- Finalized season settings are stored in js/config.js.
- Finalized castaway details/photos are stored in js/castaways.js.
- The Google Sheet remains the live source for entries, payment status, seasonStarted, and castaway outcomes/scores.
- The leaderboard still reads live entries and castaway outcomes from Apps Script.
- The entry page still checks the live seasonStarted status.
- Normal page loads do not need to fetch finalized setup data from the Sheet, while changing league results still updates the site.

For a future season, switch back to SEASON_DATA_MODE = "live" while setting up and testing the new season. After the new Settings and Castaways data are finalized, run the optimization process again.

## One-time setup

### 1. Create the Google Sheet
1. Create a blank spreadsheet.
2. Name it for the league/season.

### 2. Install Apps Script
1. Go to **Extensions → Apps Script**.
2. Paste the complete apps-script/Code.gs from this repository.
3. Save.
4. Run setupSheets once.
5. Authorize the script when Google asks.
6. Confirm the three tabs exist: Entries, Castaways, and Settings.

Running setupSheets again later is safe. It adds missing Settings rows and missing Castaways columns without replacing existing values.

### 3. Deploy Apps Script
1. In Apps Script, choose **Deploy → New deployment**.
2. Choose **Web app**.
3. Set **Execute as** to the sheet owner/commissioner.
4. Set **Who has access** to **Anyone**.
5. Deploy and copy the URL ending in /exec.
6. Put that exact URL into js/config.js as SHEET_API_URL.

**Important deployment lesson:** if you create a brand-new Web App deployment, Google can give it a different /exec URL. If the website still points at the old URL, the site will fail to load the leaderboard/API. After creating a new deployment, update SHEET_API_URL in GitHub and test it before changing production.

If you only change Code.gs without creating a new deployment version, the live /exec deployment may still run the old code. Use **Deploy → Manage deployments → edit the existing deployment → New version → Deploy**.

### 4. GitHub Pages
1. Push the repository to GitHub.
2. Use main as the production branch.
3. In **Settings → Pages**, choose **Deploy from a branch**, main, / (root).
4. If using a custom domain, keep the CNAME file in the production branch.

## Recommended future-season workflow

### Phase A — Set up safely
1. Keep production main unchanged.
2. Create/update a development branch for the new season.
3. If possible, use the separate survivor-league-test repository as the sandbox. It has GitHub Pages enabled and does not use the production custom-domain CNAME.
4. Switch SEASON_DATA_MODE to "live" while setting up.
5. Update the Google Sheet Settings tab.
6. Replace/update the Castaways tab for the new season.
7. Run setupSheets if needed.
8. Test the Entry page, leaderboard, castaway display, and a sample entry in the sandbox.
9. Do not merge to main until the sandbox works end-to-end.

### Phase B — Optimize the finalized season
1. Confirm the Google Sheet Settings and Castaways data are final.
2. Run the instructions in docs/SEASON-OPTIMIZATION-PROMPT.md.
3. Confirm js/config.js contains the finalized settings and SEASON_DATA_MODE = "static".
4. Confirm js/castaways.js contains the finalized castaway data/photos.
5. Test the sandbox again.
6. Merge the season branch into main.
7. Verify the production custom domain and all three main pages.

### Phase C — Run the season
Use the Google Sheet for live administration:
- **Entries:** submitted teams and Paid status.
- **Castaways:** update Outcome as eliminations happen.
- **Settings:** season-wide configuration and seasonStarted.

After editing live scoring data, refresh the leaderboard to see the changes.

## Running the league week to week

### Entries
Every submitted team is appended to Entries. Mark Paid as TRUE after receiving payment. Players cannot edit an existing submission through the website.

### Castaways
Leave Outcome blank while a castaway is still playing. Enter the week number when they are voted out. The current scoring convention uses 17 for each Final Three member and 20 for the winner.

### Settings
Normally seasonStarted is the key live switch. Do not change it to TRUE until the league is ready to reveal picks/scoring.

## Notes & limits

- "Max possible points" assumes every castaway still in the game goes on to win (20 points).
- The website reads live entries/outcomes when the leaderboard loads; refresh after commissioner updates.
- If the site shows a network/CORS error, first check that SHEET_API_URL matches the current active Web App deployment URL.
- If Apps Script code was changed, confirm the active deployment has a new version.
- Only the account that owns the Apps Script deployment can execute it as "Me." A future commissioner will need control of the Sheet/Apps Script and GitHub repository.
- The Entries layout currently supports five picks. Keep picksPerTeam at 5 unless the Entries layout and code are deliberately expanded.