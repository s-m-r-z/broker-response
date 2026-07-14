# Broker Response

An internal compliance dashboard for triaging data broker removal responses at scale, tracking non-response cases through enforcement, and maintaining jurisdiction-specific legal reference data. Built for PureWL's compliance workflow.

## What it does

- **Home Overview** (`/`) — a read-only dashboard aggregating counts, recent activity, tag breakdown, and case-stage breakdown across all three feature areas
- **Broker Response** (`/responses`) — receives tagged broker responses from an external classification pipeline via `/api/ingest`, displays them in a three-panel dashboard (sidebar → list → detail), and lets the team email brokers, escalate to legal, mark resolved, re-send requests, or bulk-action multiple responses at once
- **Case Tracker** (`/case-tracker`) — escalates broker non-response cases through a jurisdiction-aware enforcement pipeline (request sent → deadline approaching/passed → follow-up → complaint eligible → complaint filed), deriving the applicable regime/deadline/filing authority from the *user's* location
- **Legal Workbook** (`/legal-workbook`) — a reference library of data-protection law clauses per jurisdiction (GDPR, UK GDPR, CCPA, VA CDPA, CO CPA, CT CTDPA, LGPD) that legal counsel can verify and cite from when replying to brokers

## Tech Stack

- **Frontend/Backend:** Next.js 16 (App Router)
- **Database:** SQLite via Prisma
- **Email:** Nodemailer v9 + Gmail SMTP
- **UI:** Tailwind CSS + shadcn/ui-style Radix components (dialog, select, checkbox, tooltip), Inter font, Lucide icons
- **Auth:** Cookie-based session login, gated by edge middleware (`proxy.ts`)
- **Testing:** Jest for `lib/*.test.ts` business-rule unit tests

## Tag Taxonomy

| Tag | Meaning |
|---|---|
| `CONFIRMED_REMOVAL` | Broker confirmed data was removed |
| `CONFIRMED_NOT_FOUND` | Broker says no matching record exists |
| `NEEDS_MORE_INFO` | Broker is asking for additional details |
| `NEEDS_CONFIRMATION` | Broker wants the requester to confirm something |
| `FORM_REQUIRED` | Broker requires a specific form or portal submission |
| `DENIED_JURISDICTION` | Refused — outside their jurisdiction |
| `DENIED_FRAUD` | Refused — flagged as fraud or abuse |
| `DENIED_OTHER` | Refused for another reason |
| `OUT_OF_OFFICE` | Auto-reply, no human handled it |
| `UNDELIVERABLE` | Bounce or mailbox not found |
| `SPAM_OR_IRRELEVANT` | Not a real reply |
| `AMBIGUOUS` | Pipeline could not classify |

(Hover any tag, status, stage, or regime badge in the app for a one-line explanation — every category is backed by a tooltip.)

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

```env
DATABASE_URL="file:./dev.db"

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@yourcompany.com
SMTP_PASS=your-google-app-password   # Generate at myaccount.google.com/apppasswords
SMTP_FROM=your-email@yourcompany.com

AUTH_PASSWORD=your-dashboard-password  # Password checked on the /login form
AUTH_SECRET=some-random-session-value  # Compared against the br_session cookie on every request — required for the middleware to let requests through
```

### 3. Set up the database

```bash
npx prisma db push
```

### 4. Seed with mock data (optional)

```bash
npm run db:seed          # 60 mock broker responses
npm run db:seed:legal    # legal workbook regimes/clauses
```

### 5. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 6. Run tests

```bash
npm test
```

## Ingesting Responses

Your classification pipeline can push tagged responses to the app in real-time:

```bash
POST /api/ingest
Content-Type: application/json

{
  "brokerName": "Acme Data Inc.",
  "brokerEmail": "privacy@acmedata.com",
  "responseContent": "We have removed your data...",
  "tag": "CONFIRMED_REMOVAL",
  "tier": "tier_2"
}
```

## Project Structure

```
app/
  api/
    auth/                       → POST login / DELETE logout (cookie-based session)
    stats/                      → Proxies live stats from email-classifier.purewl.com/stats
    responses/, responses/[id]/ → Broker response CRUD + action history
    ingest/                     → POST new tagged response
    email/                      → POST send email via Gmail SMTP
    actions/                    → POST log an action (resolve, escalate, re-send)
    counts/, activity/          → Aggregate counts + recent activity feed (Home Overview)
    cases/, cases/[id]/...      → Case tracker CRUD, jurisdiction/authority confirmation, complaint pack
    legal/regimes/, legal/clauses/, legal/changes/ → Legal workbook CRUD + AI recheck flow
  login/            → Login page
  responses/, case-tracker/, legal-workbook/ → Feature area pages
  page.tsx          → Home Overview
components/
  dashboard.tsx, sidebar.tsx, response-list.tsx, response-detail.tsx,
  compose-drawer.tsx, bulk-action-bar.tsx  → Broker Response dashboard
  home/             → Home Overview (stat cards, tag/stage breakdown)
  case-tracker/     → Case list/detail, stage pipeline, new-case dialog
  legal-workbook/   → Regime sidebar/detail, clause cards, add-regime dialog
  ui/               → Radix-based primitives (button, dialog, select, checkbox, tooltip, ...)
  info-tooltip.tsx  → Thin wrapper for attaching an explanatory tooltip to any element
lib/
  constants.ts        → Tag/bucket/status/stage config: label, color, and description per category
  case-tracker.ts      → Jurisdiction derivation + enforcement-stage transition rules
  jurisdiction-map.ts  → userCountry/userState → regime/deadline/authority mapping
  case-validation.ts   → Zod schemas for case intake
  legal-ai.ts           → Provider-abstracted mock AI for regime/clause generation
  types.ts, db.ts, email.ts, utils.ts
prisma/
  schema.prisma   → BrokerResponse, ActionLog, Case, LawRegime, LawClause, PendingLawChange models
scripts/
  seed.ts         → Populate DB with 60 mock broker responses
  seed-legal.ts   → Populate DB with mock legal workbook data
```

See `CLAUDE.md` for architecture notes (jurisdiction rules, auth flow, tag taxonomy wiring, etc.).
