# Survivor Fantasy League — Commissioner Guide

This repository is the reusable website and backend for the Survivor fantasy league. The goal is that a new commissioner can run a future season without needing to understand the site's code.

## The three pieces

### 1. GitHub repository
- index.html — home/rules page
- entry.html — team entry form
- leaderboard.html — standings
- css/ — site styling
- js/ — browser-side logic and finalized/static castaway data
- apps-script/Code.gs — Google Sheets backend code

GitHub Pages should publish from the main branch, / (root). Keep the CNAME file in main if the production site uses a custom domain.

### 2. Google Sheet
The Google Sheet is the league's database and commissioner control panel. It contains three tabs:
- Settings — season-wide league settings
- Entries — submitted teams and payment status
- Castaways — castaway information and elimination outcomes

Do not delete or rename these tabs without also changing Code.gs.

### 3. Apps Script
apps-script/Code.gs lives inside the Google Sheet and exposes the web API used by the website.

The Apps Script web app should be deployed as:
- **Execute as:** the commissioner / sheet owner
- **Who has access:** Anyone

The website's js/config.js contains the active /exec URL.

## Current production mode

The current season has been optimized and is running in static mode.

- Finalized season setup is in js/config.js and js/castaways.js.
- Google Sheets remains live for Entries, Paid status, seasonStarted, and Castaways Outcome values.
- The leaderboard continues to read live entries and outcomes.
- The entry page continues to check the live seasonStarted lock.

Do not switch the current season back to live mode unless you are deliberately changing the setup data. For a future season, switch to live mode during setup/testing, then optimize again after the season data is finalized.

## Season setup — repeatable process

### Phase A: Set up safely
1. Leave production main unchanged.
2. Create a development branch for the new season.
3. Use the separate survivor-league-test repository as the sandbox when possible. It has GitHub Pages enabled and does not contain the production custom-domain CNAME.
4. Change SEASON_DATA_MODE to live while setting up.
5. Update Settings for the new season.
6. Replace/update Castaways for the new cast.
7. Run setupSheets if needed.
8. Test the Entry page, leaderboard, castaway display, and a sample entry in the sandbox.
9. Do not merge to main until the sandbox works end-to-end.

### Phase B: Optimize
1. Confirm Settings and Castaways are final.
2. Follow docs/SEASON-OPTIMIZATION-PROMPT.md.
3. Set SEASON_DATA_MODE to static and copy the finalized settings into js/config.js.
4. Confirm js/castaways.js contains the finalized castaway data/photos.
5. Test the sandbox again.
6. Merge the season branch into main.
7. Verify the production custom domain and all three main pages.

### Phase C: Go live
1. Keep using the Google Sheet for live administration.
2. Set seasonStarted to TRUE when picks/scoring should become public.
3. Verify the production Entry and Leaderboard pages.

## Settings tab

The Apps Script setupSheets function seeds missing settings without replacing values already present.

| Key | Example value | Purpose |
| --- | --- | --- |
| leagueName | Survivor 51 Fantasy League | Full league name |
| seasonLabel | Survivor 51 | Short season label |
| entryFee | $10 | Entry fee displayed to players |
| venmoHandle | Henry-Lumbard-1 | Payment account/handle |
| picksPerTeam | 5 | Number of castaways per team |
| premiereDate | September 23, 2026 | Human-readable premiere date |
| premiereDateTime | 2026-09-23T20:00:00-04:00 | Countdown target |
| premiereDisplay | Wednesday, September 23 · 8:00 PM ET | Display version of premiere date/time |
| entryDeadline | September 30, 2026 | Human-readable deadline date |
| entryDeadlineDisplay | 8:00 PM ET on September 30, 2026 | Display version of deadline |
| commissionerName | Henry | Commissioner name |
| seasonStarted | FALSE | Controls whether picks/scoring are live |

Keep picksPerTeam at 5 unless the Entries layout and code are deliberately expanded.

## Apps Script deployment — important

When Code.gs changes:
1. Open the Google Sheet.
2. Go to Extensions → Apps Script.
3. Install the current Code.gs.
4. Save.
5. Run setupSheets once after installing a new version if needed.
6. Go to Deploy → Manage deployments.
7. Edit the existing Web App deployment.
8. Create a New version and Deploy.

Saving Code.gs alone does not update the live /exec deployment.

### If you create a brand-new Web App deployment
Google may assign a completely different /exec URL. If that happens, the website will fail to reach the API until js/config.js is updated.

After creating a new deployment:
1. Copy the new /exec URL.
2. Update SHEET_API_URL in js/config.js.
3. Test the URL/site before changing production.
4. Update the production branch only after the sandbox works.

## Weekly operation

### Entries
Mark Paid as TRUE after receiving the entry fee. Entries submitted through the site are appended automatically.

### Castaways
Leave Outcome blank while a castaway is still playing.

The current scoring convention is:
- voted out in week N → N points
- final three non-winner → 17 points
- winner → 20 points

After changing outcomes, refresh the leaderboard.

### Settings
Normally only seasonStarted changes during the season.

## Handing the league to a new commissioner

The cleanest handoff is to transfer control of the Google Sheet and its Apps Script to the new commissioner, then give them appropriate access to the GitHub repository.

The new commissioner should verify:
- They can edit the Google Sheet.
- They can open Extensions → Apps Script.
- The Web App deployment is active and executes as the correct account.
- js/config.js points to the current /exec URL.
- GitHub Pages publishes from main.
- The custom domain still appears under GitHub Pages settings.
- They know to update SHEET_API_URL if they create a new Web App deployment.

## Troubleshooting checklist

If the leaderboard says it cannot load:
1. Open the current SHEET_API_URL directly in a browser with ?action=leaderboard.
2. If the URL is a Google Drive/Page Not Found error, check the active Web App deployment URL in Apps Script.
3. If the URL changed, update js/config.js.
4. If the URL is correct but Code.gs changes are missing, create a new deployment version.
5. Test in survivor-league-test before touching production.

## Season Optimization

Once the new season's Settings and Castaways tabs are finalized, run the repository's Season Optimization process before moving the season into production static mode.

Optimization should:
- copy finalized Settings into js/config.js;
- set SEASON_DATA_MODE to static;
- keep the Google Sheet URL in config;
- keep live Entries, seasonStarted, and Castaways outcomes connected through Apps Script;
- confirm js/castaways.js matches the finalized Castaways data and photos;
- test the sandbox before merging.

Use docs/SEASON-OPTIMIZATION-PROMPT.md as the reusable prompt.

If the Google Sheet cannot be read directly, export/provide the Settings and Castaways data. The Sheet is the source of truth during setup; the repository becomes the optimized static copy only after the data is finalized.