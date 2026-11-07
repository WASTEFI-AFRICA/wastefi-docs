# Local development

## Run the documentation

The docs use VitePress 1.x and Node.js 24, specified in `.nvmrc` and used by CI.
From a checkout of `wastefi-docs`:

```sh
nvm use
npm ci
npm run dev -- --port 5173
```

Open `http://localhost:5173/wastefi-docs/`. Build and preview the same output that
the Pages workflow publishes:

```sh
npm run build
npm run preview -- --port 4174
```

Open `http://localhost:4174/wastefi-docs/`. Keep the path prefix when testing
assets, navigation, search and deep links. `base: '/wastefi-docs/'` matches the
GitHub Pages project URL. No API, database or Stellar credentials are needed to
build the documentation.

The API playground makes public GET requests only when you press Send request.
It can use the hosted demo or a backend at `http://localhost:3001/api/v1`.
The backend must allow the docs origin in its CORS configuration for browser
requests to succeed. Building or opening the site does not poll the database.

## Run the application

The app, API and contracts live in separate repositories:

| Repository | Current role | Setup instructions |
| --- | --- | --- |
| `wastefi-frontend` | Next.js 16, React 19, Tailwind 4 | [Frontend README](https://github.com/WASTEFI-AFRICA/wastefi-frontend) |
| `wastefi-backend` | Express, TypeScript, Prisma and PostgreSQL, Node.js 22 | [Backend README](https://github.com/WASTEFI-AFRICA/wastefi-backend) |
| `wastefi-contracts` | Rust, Soroban SDK 23, `wasm32v1-none` | [Contract README](https://github.com/WASTEFI-AFRICA/wastefi-contracts) |

Use port 3001 for the local API and 3002 for the frontend. Set the frontend's
`NEXT_PUBLIC_API_URL` to `http://localhost:3001/api/v1` and the backend's
`CLIENT_URL` to `http://localhost:3002`. Follow each repo's README for dependency,
database and environment setup. Production credentials belong in the hosting
dashboards, not in the docs or repository.

The backend's README describes demo seeding, auto-activation and enabling the
on-chain workflow. The contract repository's smoke script submits real testnet
transactions; it is separate from a documentation build. See
[contract build and test commands](/technical/smart-contracts#build-and-exercise-the-contracts).

## Change documentation

Keep each page grounded in the implementation and link to the relevant source.
Run `npm run build` before handing over a change. Dead links fail the build.

Unchecked guides are retained in the repository but listed in `srcExclude` in
`.vitepress/config.js`. They are absent from the generated pages and local
search. Check a guide against the code, correct its examples and claims, then
remove its exclusion and add it to the sidebar when it is ready. Assigned
contributor issues remain available to their contributors.
