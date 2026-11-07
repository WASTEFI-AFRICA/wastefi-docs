# Publish the docs

This repository contains the build and GitHub Pages workflow configuration.
The intended project URL is
[wastefi-africa.github.io/wastefi-docs/](https://wastefi-africa.github.io/wastefi-docs/).
It becomes available after Pages is enabled and the first deployment succeeds.

## Build checks

`.github/workflows/ci.yml` runs on pull requests and pushes to `main`. It checks
out the code, selects Node.js from `.nvmrc`, restores the npm dependency cache,
runs `npm ci`, and builds with `npm run build`.

Pull-request builds do not deploy. Dead links fail the VitePress build.
The lockfile keeps installs reproducible; update it with dependency changes.

## GitHub Pages

`.github/workflows/pages.yml` builds and publishes pushes to the official
repository's `main` branch. A maintainer can also run it manually from `main`.
The workflow uploads `.vitepress/dist` and deploys it with
`actions/deploy-pages` through the `github-pages` environment.

The build job has read permissions. The deployment job receives `pages: write`
and `id-token: write`. Neither workflow needs a personal access token in a
repository secret. Action versions are pinned to full commit IDs, with release
versions noted in comments.

For the first deployment, a repository maintainer should:

1. Open **Settings > Pages**, and select **GitHub Actions** under **Build and
   deployment > Source**.
2. Push the reviewed workflow and site changes to `main`.
3. Wait for the **Build docs** and **Publish docs** workflows to succeed in the
   Actions tab. A build passing alone does not establish that Pages is live.
4. Open the Pages URL and check navigation, the logo, search, API pages and
   contract links. All site assets must load under `/wastefi-docs/`.
5. Set the repository's Website field to the verified Pages URL.

`base` and the favicon path in `.vitepress/config.js` are configured for this
project URL. Revisit them if the site moves to a custom domain. A separate
`gh-pages` source branch is not used.

The API playground calls the backend from the visitor's browser. Append
`https://wastefi-africa.github.io` to the backend's comma-separated `CLIENT_URL`
origin list to enable requests from the published docs. Docs publishing itself
does not change that backend setting. The curl examples work independently of
browser CORS.

## Publication scope

The site includes the corrected API and contract references, roadmap, home page
and these three introductory guides. Older guides with unchecked claims are
excluded using VitePress `srcExclude`; they remain in the repository for later
correction. Excluded pages are not built or indexed by local search.

Workflow setup follows the
[VitePress 1.x deployment guide](https://vuejs.github.io/vitepress/v1/guide/deploy#github-pages)
and [GitHub's custom Pages workflow documentation](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).
