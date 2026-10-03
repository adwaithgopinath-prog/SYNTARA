# SYNTARA

A marketing agency workspace with an immersive React/WebGL home page and separate client, campaign, intelligence, and reporting pages.

## Run locally

```sh
npm install
npm run dev
```

Open `http://127.0.0.1:5173/`. The Vite server provides the local workspace API under `/api` and saves changes to `.fieldnote/workspace.json`. The file is created on the first saved change and persists between page loads and restarts.

Use `npm run build` to build the home page and the dedicated product pages. `npm run preview` serves the built site and the local API for a local preview. A static production host needs a persistent API host configured separately.

## Structure

- `index.html` — immersive React/WebGL product story
- `agency.html` — agency client portfolio for creating, editing, archiving, and restoring client accounts
- `index.legacy.html` — static motion-led overview
- `intelligence.html`, `opportunities.html`, `campaigns.html`, `studio.html`, `performance.html` — dedicated product workspaces
- `styles.css`, `product.css`, `motion.css` — responsive brand system, product workspaces, and motion
- `pages.css`, `pages.js` — page-level section routing and navigation state
- `data.js` — deterministic sample market, competitor, creative, performance, alert, and brand data
- `app.js` — landing page interactions and draggable calendar
- `product.js` — competitor profiles, Signal Engine, Creative DNA, market landscape, opportunity review, campaign planner, studio, performance learning, command center, Brand Brain, and alerts
- `motion.js` — scroll-controlled market map transformation with reduced-motion fallback
- `backend/api.mjs` — validated local JSON API for client accounts, client-scoped campaign drafts and outcomes, preferences, calendar, brand context, recommendations, and activity
- `agency.js` — client portfolio actions and account-level campaign/result summaries
- `backend-client.js` — connects workspace pages to saved API state and carries the selected client across campaign and report work
- `src/api.ts` — connects the immersive home experience to workspace data and activity logging

All market, competitor, and performance seed figures are illustrative. Competitor observations are limited to public-facing content; private conversion or revenue data is not represented. Campaign actions create editable local drafts, review requests stay inside the workspace, and nothing publishes automatically. Connecting social accounts or publishing requires provider credentials and an external integration that is not configured here.
