# Season Optimization Prompt

Copy/paste this prompt when a new Survivor fantasy season has been fully configured and tested:

> Optimize this Survivor league season. Use the finalized Google Sheet Settings and Castaways data as the source of truth. Update the repository's static season configuration and castaway data to match the Sheet, preserve all live data connections for entries, payment status, seasonStarted, scores, and outcomes, set SEASON_DATA_MODE to "static", verify the site still works, and commit the changes to the season setup branch. Do not hard-code any data that the commissioner will still need to change during the season.

If direct Google Sheet access is unavailable, provide/export the Settings and Castaways data with the prompt.

## What optimization should preserve

Static after optimization:
- Season name/label
- Entry fee and Venmo handle
- Pick count
- Premiere/deadline display information
- Commissioner name
- Castaway names, IDs, ages, hometowns, occupations, and photos

Always live:
- Submitted entries
- Payment status
- seasonStarted
- Castaway elimination outcomes
- Leaderboard scores/calculations based on live outcomes

The goal is to use Google Sheets for easy season setup and ongoing league operation,
then use the repository's finalized static data for faster normal page loads.
