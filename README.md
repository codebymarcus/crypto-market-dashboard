# Crypto Market Dashboard

A single-page dashboard that lists the top 20 cryptocurrencies by market
capitalization, with client-side search, sorting, and a light/dark theme.
Market data is fetched live from the public [CoinGecko API](https://www.coingecko.com/en/api)

- no API key or account required.

## Features

- **Live market data** - top 20 coins by market cap (USD) from CoinGecko.
- **Search** - filter coins by name or symbol as you type.
- **Sort** - order by current price or 24h change, highest or lowest first.
- **Light / dark theme** - defaults to light; the toggle choice persists across reloads and is applied before first paint (no flash of the wrong theme).
- **Resilient UX** - loading skeletons, an error state with retry, and automatic refetch on reconnect / window focus.
- **Accessible** - keyboard focus rings, `prefers-reduced-motion` support, and semantic roles.

## Tech stack

| Concern       | Choice                                                                                           |
| ------------- | ------------------------------------------------------------------------------------------------ |
| Framework     | React 19 + TypeScript                                                                            |
| Build tool    | Vite 8                                                                                           |
| Data fetching | TanStack Query (React Query)                                                                     |
| Client state  | Zustand (persisted theme preference); search & sort are local component state                    |
| Styling       | Sass + CSS Modules, organised in ITCSS-informed layers (see `docs/css-architecture-proposal.md`) |
| Testing       | Vitest + Testing Library                                                                         |

## Prerequisites

- **Node.js** 20.19+ or 22.12+ (required by Vite 8)
- **npm** (bundled with Node). Any package manager works; examples below use npm.

## Getting started

```bash
# 1. Install dependencies
npm install

# 2. Start the dev server (http://localhost:5173)
npm run dev
```

Open the URL printed in the terminal (default `http://localhost:5173`; Vite
picks the next free port if 5173 is taken). The app loads market data on
start - no environment variables or secrets to configure.

## Available scripts

| Command            | What it does                                                      |
| ------------------ | ----------------------------------------------------------------- |
| `npm run dev`      | Start the Vite dev server with hot-module reload.                 |
| `npm run build`    | Type-check (`tsc -b`) and build a production bundle into `dist/`. |
| `npm run preview`  | Serve the built `dist/` locally to preview the production build.  |
| `npm test`         | Run the Vitest suite in watch mode.                               |
| `npm run test:run` | Run the Vitest suite once (CI mode).                              |
| `npm run lint`     | Lint the project with ESLint.                                     |

## Project structure

```
src/
  app/                    # App shell, providers, root component
  components/ui/          # Shared UI (ErrorState, ThemeToggle)
  features/coins/         # Coin feature: API, hooks, components, utils, types
  lib/                    # Query client setup
  stores/                 # Zustand preferences store
  styles/                 # Global style layers (settings, tools, generic, elements, objects)
  index.scss              # Global style entry (imports the layers above)
  main.tsx                # App entry point
```

## Notes

- Market data comes from CoinGecko's public rate-limited endpoint; if the grid
  fails to load, wait a moment and use **Retry** (occasional `429` responses are
  expected under heavy use).
- The styling layer follows an ITCSS-informed architecture that keeps CSS
  Modules for component scoping. See
  [`docs/styles-architecture.md`](docs/styles-architecture.md) for the developer
  guide (tokens, mixins, conventions, and a cookbook).
