# Automatically update your website from researchmap

[日本語の詳しい手順](researchmap-sync_ja.md)

This optional feature copies publicly visible researchmap information to your website.
No coding or API key is required. It is **off by default**, so the original CSV workflow still works.

## Before you begin

Open **your own copy** of this template on GitHub, not the sigma-users template repository.
A repository is the folder of files that makes up your website.
If you have not created a website yet, follow [the setup guide](procedure_for_user.md) first.
Check that your researchmap page is visible without signing in.

## Enable automatic updates

1. Find your researchmap ID. For `https://researchmap.jp/example_researcher`, it is
   `example_researcher`, not the full URL or the `R000...` researcher number.
2. In your repository, open **Code → researchmap.config.json**.
3. Click the pencil (**Edit this file**).
4. Change `"enabled": false` to `"enabled": true` and enter your ID between the quotes after `permalink`:

```json
{
  "enabled": true,
  "permalink": "example_researcher",
  "sync": {
    "papers": true,
    "presentations": true,
    "misc": true,
    "awards": true,
    "researchProjects": true,
    "profile": false,
    "career": false
  }
}
```

Replace `example_researcher` with **your** ID. Keep the quotes, commas and braces.
Use unquoted `true` and `false`.

- `papers`: published papers; `presentations`: conference presentations; `misc`: MISC.
- `awards`: awards; `researchProjects`: research projects and funding.
- `profile`: names, affiliation, position, degree and research keywords.
- `career`: work experience and education.

`true` means automatic updates; `false` means manual updates.
**For your first setup, leave profile and career off.** Enabling them replaces your manually entered
content with researchmap data. Your biography text, photo, contact details and social links are kept.

5. Click **Commit changes…** (save changes), enter a short description and save to **main**,
   the standard branch containing your website's source files.
   If main is protected, propose a Pull Request and ask the repository administrator to merge it.
6. Open **Actions**. If prompted, click **I understand my workflows, go ahead and enable them**.
7. Select **Deploy to GitHub Pages**. If no run starts, click **Run workflow**, choose **main**,
   then click **Run workflow** again.
8. Wait a few minutes for a green check. Open your website URL under **Settings → Pages**.
   The separate `pages-build-deployment` run may need a little longer to finish.

Pages should use **Deploy from a branch → gh-pages → /(root)**, as in the original template.

## What happens afterward?

Updates run **monthly on the 1st at approximately 09:17 Japan time (00:17 UTC)**.
GitHub can delay scheduled runs. Your computer does not need to be running.
Use **Actions → Deploy to GitHub Pages → Run workflow** for an immediate update.
Saving changes to main also triggers an update.

Only public records are copied. Deleted or newly hidden records disappear after the next successful
sync. If only one language is available, it is used in both language views; no translation is invented.
An ongoing career ending in `9999` is displayed as “Present”. Education uses the department/course
recorded in researchmap; missing degrees and locations are not guessed.
Categories without a corresponding website section (such as media coverage) are not synchronized.

Successful checks are saved in the repository, including their UTC timestamp and data changes.

## If an update fails

**Your currently published website stays online unchanged.** In Actions, open the failed run and
click the red step to read the error.

- ID/configuration error: use only the ID; check quotes, commas and braces against the example.
- API timeout/error: researchmap may be under maintenance. Try Run workflow again later.
- Permission denied while saving: check **Settings → Actions → General → Workflow permissions →
  Read and write permissions** for your own repository. Contact your administrator if organization
  settings prevent this.
- Protected main: the workflow saves synchronized data to main; consult your administrator about
  permitted automation before enabling it.
- Schedule not running: ensure Actions and the workflow are enabled. Forks and long-inactive public
  repositories may have scheduled runs disabled by GitHub; re-enable them in Actions.

## Stop automatic updates

Set `enabled` back to `false` and save. Publication lists will use the existing CSV files in `data/`.
Previously synchronized profile/career content remains in place for you to edit manually.
Use each file's **History** to find its earlier content.

To stop only one section, set its `sync` option to `false`. Publication sections revert to their CSV data.

## Developer notes

- Configuration: `researchmap.config.json`; normalized cache: `data/researchmap.json`.
- Generated files: `public/api/`; profile and career files only when explicitly enabled.
- Local setup: `npm ci`, `npm test`, `npm run sync-researchmap`, `npm run build`.
- Build/dev use the saved snapshot offline. The first enabled build requires a successful sync.
- Changing the researcher ID requires a fresh snapshot. Mismatched snapshots are rejected.
- Pagination, record counts and duplicate IDs are checked before saving; incomplete responses fail.
- Scheduled configuration is in `.github/workflows/deploy.yml` and uses UTC.
- Standard `GITHUB_TOKEN` commits do not trigger another push run, so deployment continues in the same job.
