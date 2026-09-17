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
5. Test a sample entry before opening the league.
6. Confirm GitHub Pages is publishing from `main`.
7. Confirm the custom domain is still attached to the Pages site.
8. Set `seasonStarted` to `TRUE` only when picks should become public/locked.

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

The current backend still expects five picks and the existing five-pick
`Entries` layout. `picksPerTeam` is therefore informational for now; changing
it requires a corresponding code/layout change.

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

The long-term goal is to make the entire site reusable by editing the Settings
and Castaways tabs, without manually changing season-specific text throughout
the HTML/JavaScript. The repository is being moved toward that structure now.
