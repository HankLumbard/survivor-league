# Survivor 51 Fantasy League

A small static site (home, draft entry, leaderboard) for a family/friends
Survivor fantasy league, hosted free on GitHub Pages. The "database" is a
Google Sheet — no separate backend service to learn. You run the league by
editing cells in the sheet.

The cast in `js/castaways.js` (and `apps-script/Code.gs`) is the real
Survivor 51 cast — 21 castaways, announced Aug 25 2026, season premieres
Sept 23, 2026 on CBS — pulled from Wikipedia and cast-reveal coverage.

## How the pieces fit together

- **The website** (`index.html`, `entry.html`, `leaderboard.html`) is plain
  static HTML/CSS/JS, hosted on GitHub Pages.
- **The Google Sheet** holds three tabs: `Entries`, `Castaways`, `Settings`.
  This is where all the data lives, and where you'll do all your admin —
  no separate admin page to log into.
- **Apps Script** (`apps-script/Code.gs`) is a small script that lives
  *inside* the Google Sheet. It's what lets the website read from and write
  to the sheet, since a plain static site can't talk to a spreadsheet
  directly. You paste this code in once and deploy it.
- **Commissioner guide** (`docs/COMMISSIONER.md`) documents season setup,
  weekly operation, and handing the league to someone else.

## One-time setup (about 15 minutes)

### 1. Create the Google Sheet
1. Go to https://sheets.google.com and create a new blank spreadsheet.
   Name it "Survivor 51 Fantasy League" or similar.

### 2. Add the Apps Script
1. In the sheet, go to **Extensions → Apps Script**.
2. Delete the placeholder code in `Code.gs`, and paste in the entire
   contents of `apps-script/Code.gs` from this project.
3. Click the save icon (or Ctrl/Cmd+S).
4. Back in the toolbar, run the `setupSheets` function once: select it from
   the function dropdown next to the "Debug" button, then click **Run**.
   The first time, Google will ask you to authorize the script — click
   through **Advanced → Go to (project name) → Allow**. This is expected;
   it's your own script running in your own sheet.
5. Switch back to the spreadsheet tab — you should now see three tabs:
   `Entries`, `Castaways` (pre-filled with all 21 castaways), and
   `Settings`.
6. Running `setupSheets` again later is safe: it adds missing Settings rows
   but preserves existing Settings values.

### 3. Deploy the script as a web app
1. Still in the Apps Script editor, click **Deploy → New deployment**.
2. Click the gear icon next to "Select type" and choose **Web app**.
3. Set **Execute as**: "Me". Set **Who has access**: "Anyone".
4. Click **Deploy**, authorize again if asked, then copy the URL that ends
   in `/exec`.
5. Open `js/config.js` in this project and paste that URL in as
   `SHEET_API_URL`.

**Important:** if you edit `Code.gs` later, saving isn't enough — go
to **Deploy → Manage deployments**, click the pencil icon, and create a
**New version** so the live `/exec` URL picks up your change.

### 4. Push this project to GitHub and turn on Pages
1. Create a new repository on GitHub and push all these files to it
   (including the `css/` and `js/` folders — you don't need to push the
   `apps-script/` folder, but it's fine if you do).
2. In the repo, go to **Settings → Pages**.
3. Under **Build and deployment**, set **Source** to "Deploy from a
   branch", branch `main`, folder `/ (root)`. Save.
4. GitHub gives you a URL like `https://yourusername.github.io/your-repo/`.
   That's your live site. Share `/entry.html` for drafting and `/index.html`
   for the rules.

## Running the league week to week

Everything happens directly in the Google Sheet — no separate admin page.

- **Settings tab**: season-wide values live here. Current settings include
  the league name, season label, entry fee, Venmo handle, picks per team,
  premiere date/time, entry deadline, commissioner name, and `seasonStarted`.
  The Apps Script returns these settings to the website as public season
  configuration. `seasonStarted` controls when picks/scoring become live.
- **Entries tab**: every submitted team shows up here as a locked-in row —
  player name, team name, five picks, and a `Paid` column. Change `Paid` from
  `FALSE` to `TRUE` once someone Venmos you. (Editing a row here does *not*
  let a player edit their own entry — the website only ever appends new rows;
  only you, editing the sheet, can change or delete one.)
- **Castaways tab**: has one `Outcome` column per castaway. Leave it blank
  while they're still playing. When someone is voted out, type the week
  number (`1`, `2`, `3`...) into their row. When the season reaches the end,
  type `17` for each Final Three member and `20` for the winner. The
  leaderboard recalculates from these values automatically.

## Notes & limits

- "Max possible points" on the leaderboard assumes every castaway still in the
  game goes on to win (20 points) — the same convention an NCAA bracket pool
  uses for its "maximum possible" column. It's calculated independently per
  team, since in principle any of them could still be right.
- The website polls the sheet fresh every time someone loads the leaderboard
  page — there's no real-time push, so tell people to refresh if they're
  checking right after you update a castaway's status.
- If the leaderboard or entry form ever shows a network/CORS error in the
  browser console, the most common cause is either (a) `SHEET_API_URL` in
  `js/config.js` isn't filled in yet, or (b) you edited `Code.gs` and
  forgot to create a new deployment version (see step 3 above).
- Only one person can hold the `Execute as: Me` deployment — that's whoever's
  Google account owns the sheet. See `docs/COMMISSIONER.md` for the handoff
  process.
