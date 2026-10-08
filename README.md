# WasteFi — Docs

Source for the WasteFi documentation site: platform overview, user and operator
guides, API reference, and the technical specifications behind the system.
Built with [VitePress](https://vitepress.dev/).

If you are looking for the code rather than the docs, start with the
[related repositories](#related-repositories) below.

## Local development

Requires Node.js 18 or later.

```sh
npm install
npm run dev      # dev server with hot reload, at http://localhost:5173
npm run build    # static build into .vitepress/dist
npm run preview  # serve the built site
```

## Layout

Each top-level directory is a section of the site, and its sidebar is defined in
`.vitepress/config.js`:

| Directory | Contents |
| --- | --- |
| `guide/` | Getting started, role-based user guides, deployment and developer setup |
| `api/` | REST API reference, grouped by resource |
| `technical/` | System design, database schema, Stellar and mobile money integration, protocol specs |
| `standards/` | The RecycleGraph material standards WasteFi implements |
| `about/` | Project overview, vision, and the problem being addressed |
| `community/` | Roadmap and grant/impact reporting templates |

`index.md` is the landing page. Theme overrides and custom components live in
`.vitepress/theme/`.

## Writing

- One page per topic, named for what it covers, in the directory for its
  section.
- A new page must be added to the right sidebar array in
  `.vitepress/config.js` or nothing will link to it.
- Use relative links between pages (`/guide/architecture`, no `.md` extension).
- Prefer prose that explains why over bullet lists that restate names. A reader
  arriving at a page should learn something they could not have guessed from its
  title.
- Keep emoji out of headings, prose and tables.
- Code blocks need a language tag so they get highlighted, and should be
  copy-pasteable as written.

## Related repositories

- [wastefi-contracts](https://github.com/WASTEFI-AFRICA/wastefi-contracts) — Soroban smart contracts
- [wastefi-backend](https://github.com/WASTEFI-AFRICA/wastefi-backend) — REST API, indexer, and mobile money integration
- [wastefi-frontend](https://github.com/WASTEFI-AFRICA/wastefi-frontend) — collector and operator progressive web app

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) and
[CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md). Documentation fixes are welcome as
direct pull requests; for a new section, open an issue first so we can agree
where it belongs.

## License

MIT. See the LICENSE file at the repository root.
