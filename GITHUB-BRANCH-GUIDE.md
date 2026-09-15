# Safe GitHub workflow for the Survivor 51 redesign

This project is designed so you can test the new theme on a separate branch before replacing your live `main` branch.

## Recommended branch name

`survivor-theme`

## What a branch means

Think of `main` as the version your friends currently use. The `survivor-theme` branch is a safe copy where you can make changes without changing `main`.

When you are happy, you merge `survivor-theme` into `main`.

## Easiest method for a beginner: GitHub Desktop

1. Install GitHub Desktop from https://desktop.github.com/.
2. Sign in with the GitHub account that owns your Survivor repository.
3. Choose **Clone a repository** and select your Survivor league repository.
4. In GitHub Desktop, choose **Current Branch → New Branch**.
5. Name it `survivor-theme` and create it from `main`.
6. Open the repository folder on your computer.
7. Unzip the new project you downloaded from ChatGPT.
8. Copy the contents of the unzipped project into your cloned repository, replacing the existing files when prompted.
9. Return to GitHub Desktop. You should see a list of changed files.
10. At the bottom-left, enter a commit message such as `Create Survivor adventure theme`.
11. Click **Commit to survivor-theme**.
12. Click **Publish branch** at the top.

At this point the new version is safely stored on GitHub, but `main` is unchanged.

## Testing it as the live GitHub Pages site

GitHub Pages normally publishes one branch at a time. If you want to test this exact branch at your normal public URL:

1. Open your repository on GitHub.
2. Go to **Settings → Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**.
4. Temporarily select branch `survivor-theme` and folder `/ (root)`.
5. Click **Save**.
6. Wait a minute or two for GitHub Pages to rebuild.
7. Open your normal GitHub Pages URL.

Your friends will now see the `survivor-theme` branch version. Your `main` branch is still untouched.

### To go back immediately

Return to **Settings → Pages** and select:

- Branch: `main`
- Folder: `/ (root)`

Save it and GitHub Pages will return to the old version.

## When you like the redesign

You have two choices.

### Choice A — Merge the branch (recommended)

On GitHub:

1. Open **Pull requests**.
2. Click **New pull request**.
3. Set the comparison to `survivor-theme` → `main`.
4. Create the pull request.
5. Review the changed files.
6. Click **Merge pull request**.
7. Confirm the merge.
8. Keep GitHub Pages pointed at `main`.

Now `main` contains the new design, and you can delete the `survivor-theme` branch if you want.

### Choice B — Keep the branch

You can simply leave `survivor-theme` in the repository as a backup. There is no harm in keeping it.

## Important: Google Sheets / Apps Script

The redesign does **not** change your Google Sheets backend. The existing `js/config.js` still points at your Apps Script web-app URL, and the Apps Script remains the source of truth for entries, castaway outcomes and settings.

Do not create a new Google Sheet or Apps Script deployment just for this theme.

## If something breaks

The safest recovery is:

1. Go to **Settings → Pages**.
2. Set Pages back to `main`.
3. Your original live site is back.
4. Fix the `survivor-theme` branch without affecting the live site.

If the new branch was already merged into `main`, GitHub's **Revert** option on the merge commit can undo the merge cleanly.
