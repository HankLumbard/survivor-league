# Survivor Fantasy League — Commissioner Guide

This repository is the reusable website and backend for the Survivor fantasy league.
The goal is that a new commissioner can run a future season without needing to
understand the site's code.

## The three pieces

### 1. GitHub repository

This is the website code and static images.

- `index.html` — home/rules page
- `entry.html` — team entry form
- `leaderboard.html` — standings
- `css/` — site styling
- `js/` — browser-side logic and castaway data
- `apps-script/Code.gs` — Google Sheets backend code

GitHub Pages should publish from the `main` branch, `/ (root)`.

### 2. Google Sheet

The Google Sheet is the league's database and commissioner control panel.
It contains three tabs:

- `Settings` — season-wide league settings
- `Entries` — submitted teams and payment status
- `Castaways` — castaway information and elimination outcomes

Do not delete or rename these tabs without also changing `Code.gs`.

### 3. Apps Script

`apps-script/Code.gs` lives inside the Google Sheet and exposes the web API used
by the website.

The Apps Script web app should be deployed as:

- **Execute as:** the commissioner / sheet owner
- **Who has access:** Anyone

The website's `js/config.js` contains the `/exec` URL.

## Season setup

At the start of a new season, the intended workflow is:

1. Make a copy/archive of the previous season's Google Sheet data.
2. Update the `Settings` tab for the new season.
3. Replace the `Castaways` tab with the new cast.
4. Update castaway photos/data in the website repository when needed.
5. Keep SEASON_DATA_MODE = "live" while setting up and testing the new season.
6. Test a sample entry before opening the league.
7. Run the Season Optimization step below after the season settings and cast are finalized.
8. Confirm GitHub Pages is publishing from main (or your test branch while testing).
9. Confirm the custom domain is still attached to the production Pages site.
10. Set seasonStarted to TRUE only when picks should become public/locked.

## Settings tab

The Apps Script `setupSheets` function seeds any missing settings without
replacing values already present. For the current league, the Settings tab
should contain these keys:

| Key | Example value | Purpose |
| --- | --- | --- |
| `leagueName` | `Survivor 51 Fantasy League` | Full league name |
| `seasonLabel` | `Survivor 51` | Short season label |
| `entryFee` | `$10` | Entry fee displayed to players |
| `venmoHandle` | `Henry-Lumbard-1` | Payment account/handle |
| `picksPerTeam` | `5` | Number of castaways per team |
| `premiereDate` | `September 23, 2026` | Human-readable premiere date |
| `premiereDateTime` | `2026-09-23T20:00:00-04:00` | Countdown target |
| `premiereDisplay` | `Wednesday, September 23 · 8:00 PM ET` | Display version of premiere date/time |
| `entryDeadline` | `September 30, 2026` | Human-readable deadline date |
| `entryDeadlineDisplay` | `8:00 PM ET on September 30, 2026` | Display version of deadline |
| `commissionerName` | `Henry` | Commissioner name |
| `seasonStarted` | `FALSE` | Controls whether picks/scoring are live |

### Important

Do not change `seasonStarted` to `TRUE` until you are ready for the public
leaderboard to reveal picks and live scoring.

The website now reads `picksPerTeam` for the number of selection slots, and the backend validates that same setting. The `Entries` sheet still has five pick columns, so keep `picksPerTeam` at `5` unless the Entries layout is deliberately expanded in a future code change.

## Apps Script changes

When `apps-script/Code.gs` is changed:

1. Open the Google Sheet.
2. Go to **Extensions → Apps Script**.
3. Replace the script with the current repository version if needed.
4. Save.
5. Run `setupSheets` from the Apps Script editor once after the new version is
   installed. This adds any missing Settings rows and preserves existing values.
6. Go to **Deploy → Manage deployments**.
7. Edit the existing web-app deployment and create a **new version**.

Saving the Apps Script alone does not update the live `/exec` deployment.

## Handing the league to a new commissioner

The cleanest handoff is to transfer control of the Google Sheet and its Apps
Script to the new commissioner, then give them collaborator/admin access to
the GitHub repository.

The new commissioner should verify:

- They can edit the Google Sheet.
- They can open Extensions → Apps Script.
- The web-app deployment still executes as the correct account.
- `js/config.js` still points to the correct `/exec` URL.
- GitHub Pages still publishes from `main`.
- The custom domain still appears under GitHub Pages settings.

## Weekly operation

During the season, the commissioner mainly works in the Google Sheet:

### Entries

Mark `Paid` as `TRUE` after receiving the entry fee. Entries submitted through
the site are appended automatically.

### Castaways

Use the `Outcome` column to record how far each castaway got. Leave it blank
while they are still in the game.

The current scoring convention is:

- voted out in week `N` → `N` points
- final three non-winner → `17` points
- winner → `20` points

### Settings

Normally only `seasonStarted` changes during the season.

## Before a new season

The site is now substantially reusable from the Google Sheet: season-wide text, entry fee, Venmo handle, commissioner name, premiere/deadline dates, pick count, and the active cast list are driven from the Settings/Castaways tabs. The remaining static repository data is primarily presentation assets and fallback castaway photos/details.


## Season Optimization — run after setup

Once the new season's Settings and Castaways tabs are finalized, run the repository's
**Season Optimization** process before going live.

Optimization changes js/config.js to contain the finalized season settings and changes
SEASON_DATA_MODE from "live" to "static". The existing js/castaways.js becomes the static
source for finalized castaway names, bios, ages, hometowns, occupations, and photos.

Static mode removes the Settings API request from the home page. The entry page still
checks the live seasonStarted lock, and the leaderboard still loads live entries and
elimination outcomes. This keeps changing league data in Google Sheets while removing
unnecessary setup-data requests from normal page loads.

### Reusable optimization prompt

When a future season is ready, give ChatGPT the instruction in
docs/SEASON-OPTIMIZATION-PROMPT.md.

If the Google Sheet cannot be read directly in ChatGPT, provide/export the Settings and
Castaways data with the prompt. The Sheet is the source of truth during setup; the
repository becomes the optimized static copy only after the season is finalized.

### If the season changes after optimization

Change the Google Sheet first, then rerun the optimization process so the repository and
Sheet stay synchronized. For an urgent one-off change, update the Sheet and then rerun
optimization before relying on the static copy.
