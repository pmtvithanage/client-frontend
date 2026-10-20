# AGENTS.md — NIDS Client Portal

Permanent rules for the **client portal** (a second app in this monorepo). These rules are binding for every task and must not be violated without explicit approval. The SOC console has its own rules in the root `AGENTS.md`; when the two disagree on shared conventions, follow the shared conventions already used by `/NIDS-frontend`.

## 1. PROJECT

**NIDS Client Portal** — the customer-facing app. Customers log in and see ONLY their own sensor's data. The SOC console (`/NIDS-frontend`) is the analyst-facing app and is not part of this app.

- Business rule: **ONE SENSOR PER CLIENT** — a client has exactly one sensor, and a sensor belongs to exactly one client. Nothing in this app may assume or render a second sensor for a client.
- Monorepo folder: `/client-frontend`.
- **Stack** (fixed):
  - React 18 + Vite (JavaScript, **not** TypeScript)
  - React Router
  - TanStack Query
  - Axios
  - Tailwind CSS
  - Recharts
  - `dygraphs` (npm package `dygraphs`)
  - lucide-react
  - date-fns
  - **No other UI libraries without asking.**
- **Do NOT create `/backend`.**

## 2. DUMMY DATA RULE

- All data comes from functions in `/client-frontend/src/api/*.js` (one file per resource, e.g. `auth.js`, `overview.js`, `alerts.js`, `sensors.js`, `settings.js`, `support.js`).
- Each api function contains the REAL Axios call, **COMMENTED OUT**, directly above a call to the matching function in `/client-frontend/src/dummy/*.dummy.js`, which is what actually runs:

  ```js
  export async function getAlerts(params) {
    // const { data } = await http.get('/alerts', { params });
    // return data;
    return dummy.listAlerts(params);
  }
  ```

- Components and pages must **NEVER** import from `/client-frontend/src/dummy` directly. They only use hooks that call the `/api` functions.
- Dummy functions must:
  - Simulate latency of **200–600 ms** (reuse the shared `delay()` helper, same as the SOC console).
  - Support filtering/sorting/pagination params exactly like the real API will.
  - Keep in-memory state so mutations (acknowledge, status change, settings, notification prefs) persist until page reload.
  - Return exactly the documented JSON shapes.
- Switching to the real backend later must only require uncommenting the Axios lines and deleting the dummy line in each api function.
- `npm run build` in `/client-frontend` must stay green after every task.

## 3. TENANT ISOLATION RULES (critical)

- **The UI NEVER sends a client id or sensor id in a URL, query or body.** The backend derives the client from the login token. All real endpoints are under `/api/v1/client/...` — for example `GET /api/v1/client/overview`, `GET /api/v1/client/alerts`. Any code that appends a client id to a path or query string is a security bug.
- **The dummy auth session stores the logged-in client id inside the fake token.** Every dummy function reads the current client from that token and returns ONLY that client's sensor data. A dummy function called without a valid session must reject with `{ status: 401, message: 'Not signed in' }`.
- **The dummy store must contain at least three clients** (Acme Textiles, Lanka Logistics, Sunrise Hospital), each with **exactly one** sensor and its own alerts, so isolation can be tested by switching accounts. **Never mix their data.**
- **Never display** another client's name, IP ranges or sensor ids.
- **Do not show internal SOC fields**: analyst notes, assignee, suppression rules, model internals (AE ratio, z-scores, feature vectors, MLP confidence numbers).

## 4. LANGUAGE AND UX RULES

- The audience is **non-experts**: plain language, short sentences, no jargon without a tooltip or a "What does this mean?" explanation.
- Severity is shown as a friendly name **plus** the tier text, always with an **icon + text, never colour alone**:

  | Tier | Friendly name shown |
  | --- | --- |
  | LOW | `Minor` |
  | MEDIUM | `Moderate` |
  | HIGH | `Serious` |
  | CRITICAL | `Urgent` |

- Every alert shows three plain-language answers: **"What happened"**, **"Why we flagged it"** and **"What you should do"**.
- Dark theme default with a light option; WCAG-friendly contrast; fully keyboard accessible; responsive **down to phone width** (clients check on mobile).
- Timestamps stored/transported as ISO UTC and displayed in the client's timezone (default `Asia/Colombo`).

## 5. CLIENT ROLES

- `owner` — can manage team, notification settings and the support/feedback form.
- `member` — read-only plus acknowledging alerts.
- **Hide controls the role cannot use** (do not disable them in the open — omit them).

## 6. CLIENT ALERT STATUSES

Exactly these four, spelled as shown:

- `new`
- `acknowledged` — set by a client user (owner or member).
- `expected` — the client says this activity is normal. It is **sent to the SOC team as feedback and never hides the alert by itself**.
- `resolved`

## 7. CODE RULES

- Functional components + hooks.
- One component per file; files under 200 lines.
- Constants live in `/client-frontend/src/constants`.
- JSDoc on api and util functions.
- No `console.log` left in code.
- Never `dangerouslySetInnerHTML`; escape all alert text.
- Run `npm run build` in `/client-frontend` after every task and fix errors before finishing.
- Summarize what changed in 5 lines or fewer.
- Never rewrite files unrelated to the task.
