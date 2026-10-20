# NIDS Client Portal

Customer-facing React app. A client logs in and sees **only their own sensor's
data** (one sensor per client).

The permanent rules for this app live in [`AGENTS.md`](./AGENTS.md) — read them
before touching anything here.

## Requirements

- Node.js 20+ and npm

## Setup

```bash
cd client-frontend
npm install
cp .env.example .env.local   # optional, defaults to /api/v1/client
```

## Commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the dev server on **http://localhost:5174** |
| `npm run build` | Production build to `dist/` (run after every task) |
| `npm run preview` | Serve the production build on port 5174 |
| `npm test` | Run the vitest suite once |
| `npm run test:watch` | Run vitest in watch mode |
| `npm run lint` | oxlint |

## Routes

All routes are lazy-loaded and wrapped in `ProtectedRoute` except `/login`.

| Path | Page |
| --- | --- |
| `/login` | Sign in (public) |
| `/` | Dashboard |
| `/alerts` | Alerts |
| `/alerts/:id` | Alert detail |
| `/network` | Network |
| `/sensor` | Sensor |
| `/reports` | Reports |
| `/notifications` | Notifications (owner) |
| `/support` | Support & feedback (owner) |
| `/account` | Account |
| anything else | Not found |

## Data layer

Every screen reads through `src/hooks` → `src/api/*.js`. Each api function keeps
the real Axios call **commented out** above the active call to a
`src/dummy/*.dummy.js` function, which serves sample data with 200–600 ms of
simulated latency. The UI never imports from `src/dummy` and never sends a
client or sensor id — the token decides whose data it is.

## Folder structure

```
src/
  api/          Axios instance + one file per resource
  dummy/        Sample data (never imported by components)
  hooks/        useQuery wrappers around api/
  components/   common, layout, dashboard, alerts, network, sensor,
                reports, settings, charts
  pages/        One file per route
  utils/        Helpers (JSDoc'd)
  constants/    Magic numbers and shared labels
  styles/       Tailwind + theme CSS variables
  test/         Vitest setup and tests
```
