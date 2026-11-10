<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="public/brand/wastefi-logo-dark.svg">
    <img src="public/brand/wastefi-logo.svg" alt="WasteFi" height="64">
  </picture>
</p>

# WasteFi Docs

[![Build docs](https://github.com/WASTEFI-AFRICA/wastefi-docs/actions/workflows/ci.yml/badge.svg)](https://github.com/WASTEFI-AFRICA/wastefi-docs/actions/workflows/ci.yml)

Documentation for the WasteFi testnet MVP: a demo walkthrough, the actual HTTP
API, seven Soroban contracts and remaining work. Built with VitePress.

Site address: [wastefi-africa.github.io/wastefi-docs/](https://wastefi-africa.github.io/wastefi-docs/).
The address becomes available after GitHub Pages is enabled and the first
publishing workflow succeeds. The testnet app is at
[wastefi-frontend.vercel.app](https://wastefi-frontend.vercel.app).

## Run locally

Use Node.js 24, as specified in `.nvmrc`:

```sh
nvm use
npm ci
npm run dev -- --port 5173
npm run build
npm run preview -- --port 4174
```

Development: `http://localhost:5173/wastefi-docs/`.
Production preview: `http://localhost:4174/wastefi-docs/`.
Build output: `.vitepress/dist`.

## Build and publish

- `.github/workflows/ci.yml` builds every pull request and push to `main` with
  `npm ci` and `npm run build`. npm downloads are cached.
- `.github/workflows/pages.yml` builds and publishes official `main` pushes with
  GitHub's Pages artifact and deployment actions. It can also run manually from
  `main`. Pull requests do not publish.
- Before the first deployment, select **GitHub Actions** in **Settings > Pages >
  Build and deployment > Source**. Push the reviewed changes and verify the
  publishing workflow and resulting URL before treating the site as live.
- Once the URL is verified, set it as the repository's Website field.

See [guide/deployment.md](guide/deployment.md) for publishing details. The API
playground also needs the docs origin in the backend's CORS allowed origins;
publishing this repo does not change backend configuration.

## Content and contributions

Published sections are the home page, `guide/getting-started.md`,
`guide/local-development.md`, `guide/deployment.md`, the `api/` reference,
`technical/smart-contracts.md`, and `community/roadmap.md`.

Older guides and specifications still contain unchecked claims. They stay in
the repository for correction and are excluded from the site and search through
`srcExclude` in `.vitepress/config.js`. Repo housekeeping documents are excluded
from the site too. Do not treat draft specifications as implemented features.

Before adding or restoring a page, check the relevant code and live behavior,
remove unsupported claims, and add it to the sidebar. Link to implementation
sources for exact interfaces. Internal Markdown links use site paths without the
base prefix, such as `/api/overview`; VitePress adds `/wastefi-docs/` to generated
links. Keep `ignoreDeadLinks` false and run `npm run build`.

Check [open issues](https://github.com/WASTEFI-AFRICA/wastefi-docs/issues) and
assignments before starting. See [CONTRIBUTING.md](CONTRIBUTING.md) and
[CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) for contribution guidelines.

## Related repositories

- [wastefi-frontend](https://github.com/WASTEFI-AFRICA/wastefi-frontend): collector and operator web app.
- [wastefi-backend](https://github.com/WASTEFI-AFRICA/wastefi-backend): HTTP API and background Soroban workflow.
- [wastefi-contracts](https://github.com/WASTEFI-AFRICA/wastefi-contracts): deployed Soroban contracts and testnet smoke script.

MIT. See the repository's LICENSE file.
