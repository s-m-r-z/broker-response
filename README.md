# Broker Response Manager

An internal compliance dashboard for triaging data broker removal responses at scale, escalating non-response cases through enforcement (with drafting, evidence, and filing controls), and maintaining jurisdiction-specific legal reference data. Built for PureWL's compliance workflow.

## What it does

- **Home Overview** (`/`) — a read-only dashboard aggregating counts, recent activity, tag breakdown, and case-stage breakdown across all three feature areas
- **Broker Response** (`/responses`) — receives tagged broker responses from an external classification pipeline via `/api/ingest`, displays them in a three-panel dashboard (sidebar → list → detail), and lets the team email brokers, escalate to legal, mark resolved, re-send requests, assign a response to a stakeholder, correct its classification, or bulk-action multiple responses at once. Responses the classifier flags as a non-substantive holding acknowledgement are called out with a badge, and the sidebar can filter down to just what's assigned to you.
- **Case Tracker** (`/case-tracker`) — escalates broker non-response cases through a jurisdiction-aware enforcement pipeline (request sent → deadline approaching/passed → follow-up → complaint eligible → complaint filed), deriving the applicable regime/deadline/filing authority from the *user's* location. Each case also carries:
  - a **draft reply workflow** — start from a prior case's reply in the same jurisdiction, get inline warnings on broad/overstating language with one-click fixes, see exactly which source (precedent or template) each inserted block came from, and get blocked from sending while a placeholder is still unresolved
  - a **five-item evidence checklist** (original request, identity verification, systems confirmation, broker reply, retention exception) that gates case closure — each item is immutable once confirmed
  - a **structured internal confirmation form** that batch-confirms the matching evidence items in one submission instead of three separate follow-up asks
  - an **approval gate before filing** — filing a complaint requires a named reviewer to approve the current draft text; editing the draft afterward invalidates that approval until it's re-granted
  - a **four-state status** (In Progress / Waiting on Confirmation / Deadline Approaching / Complete), kept in sync automatically and filterable independently of the enforcement stage
  - cases can be auto-created directly from `/api/ingest` when the classifier flags a response as case-worthy and supplies the requester's location
- **Legal Workbook** (`/legal-workbook`) — a reference library of data-protection law clauses per jurisdiction (GDPR, UK GDPR, CCPA, VA CDPA, CO CPA, CT CTDPA, LGPD) that legal counsel can verify and cite from when replying to brokers. Matching clauses — with verification status and any pending AI-proposed change flagged — surface inline in both the Broker Response and Case Tracker detail views, not just the standalone workbook page.

## Tech Stack

- **Frontend/Backend:** Next.js 16 (App Router)
- **Database:** SQLite via Prisma
- **Email:** Nodemailer v9 + Gmail SMTP
- **UI:** Tailwind CSS + shadcn/ui-style Radix components (dialog, select, checkbox, tooltip), Inter font, Lucide icons
- **Auth:** Cookie-based session login, gated by edge middleware (`proxy.ts`) — one shared team password, not per-user accounts
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

A response's tag can be corrected from the UI ("Reclassify") if the pipeline got it wrong — the correction is logged as an override, not silently applied, since this app never runs classification itself.

(Hover any tag, status, stage, or regime badge in the app for a one-line explanation — every category is backed by a tooltip.)

## Case Status vs. Enforcement Stage

Cases are tracked along two independent axes:

- **Enforcement stage** — where the case sits in the pipeline: `request_sent → deadline_approaching → deadline_passed → follow-up_sent → complaint_eligible → complaint_filed`. Advances one step at a time; `complaint_eligible` requires jurisdiction confirmed, `complaint_filed` requires authority confirmed *and* an approved, unedited draft reply.
- **Status** — case health at a glance: `IN_PROGRESS`, `WAITING_ON_CONFIRMATION` (a structured confirmation request is outstanding), `DEADLINE_APPROACHING` (deadline within 5 days or already passed), `COMPLETE` (closed). Derived automatically and re-synced after any relevant action or on read — every transition is logged to the case's history.

The Case Tracker sidebar can filter by either dimension at once.

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
  "tier": "tier_2",

  "isHoldingReply": false,

  "requiresCaseTracking": false,
  "userCountry": "Germany",
  "userState": null,
  "removalRequestDate": "2026-06-01T00:00:00.000Z",
  "brokerCountry": "United States"
}
```

`isHoldingReply` and the `requiresCaseTracking`/location fields are all optional. Set `isHoldingReply: true` when the classifier determines a reply is a non-substantive acknowledgement (rendered as a badge in the UI). Set `requiresCaseTracking: true` with the requester's own location (never the broker's) to have a `Case` auto-created and linked to the ingested response in the same call.

## Project Structure

```
app/
  api/
    auth/                       → POST login / DELETE logout (cookie-based session)
    stats/                      → Proxies live stats from email-classifier.purewl.com/stats
    responses/, responses/[id]/ → Broker response CRUD + action history
      [id]/assign/              → PATCH assign a response to a stakeholder
      [id]/override-tag/        → PATCH correct a response's classification
    ingest/                     → POST new tagged response, optionally auto-creating a linked Case
    email/                      → POST send email via Gmail SMTP
    actions/                    → POST log an action (resolve, escalate, re-send)
    counts/, activity/          → Aggregate counts + recent activity feed (Home Overview)
    cases/, cases/[id]/         → Case CRUD, jurisdiction/authority confirmation, complaint pack
      [id]/advance/             → PATCH advance to the next enforcement stage (server-computed, gated)
      [id]/draft/                → PATCH save the draft reply body + insertion provenance
      [id]/approve-draft/        → PATCH snapshot-approve the current draft for filing
      [id]/evidence/             → PATCH confirm one evidence-checklist item
      [id]/close/                 → PATCH close a case (blocked unless all evidence items are confirmed)
      [id]/request-confirmation/  → PATCH mark a structured confirmation as requested
      [id]/structured-confirmation/ → PATCH submit the structured confirmation form, batch-confirming evidence
    legal/regimes/, legal/clauses/, legal/changes/ → Legal workbook CRUD + AI recheck flow
  login/            → Login page
  responses/, case-tracker/, legal-workbook/ → Feature area pages
  page.tsx          → Home Overview
components/
  dashboard.tsx, sidebar.tsx, response-list.tsx, response-detail.tsx,
  compose-drawer.tsx, bulk-action-bar.tsx  → Broker Response dashboard
  assign-stakeholder-dialog.tsx, override-classification-dialog.tsx,
  holding-reply-badge.tsx  → Assignment + reclassification + holding-reply UI
  home/             → Home Overview (stat cards, tag/stage breakdown)
  case-tracker/     → Case list/detail/sidebar, stage pipeline, evidence checklist,
                       draft-reply-panel (snippets/flagging/sourcing), structured-confirmation-dialog,
                       related-cases-panel, case-status-badge, collapsible-section
  legal-workbook/   → Regime sidebar/detail, clause cards, relevant-law-panel (embedded elsewhere), add-regime dialog
  nav-rail.tsx      → Primary sidebar nav — logo/product name, collapsible, icon+label
  ui/               → Radix-based primitives (button, dialog, select, checkbox, tooltip, ...)
  info-tooltip.tsx  → Thin wrapper for attaching an explanatory tooltip to any element
lib/
  constants.ts          → Tag/bucket/status/stage/evidence-item config: label, color, and description per category
  case-tracker.ts        → Jurisdiction derivation, enforcement-stage transitions, evidence/closure/draft-approval rules
  case-status-sync.ts     → Derives + persists + logs the four-state case status
  jurisdiction-map.ts     → userCountry/userState → regime/deadline/authority mapping
  draft-flagging.ts       → Deterministic broad-language/commitment-verb scanner + placeholder detector
  case-validation.ts, response-validation.ts → Zod schemas for case/response API payloads
  legal-ai.ts             → Provider-abstracted mock AI for regime/clause generation
  types.ts, db.ts, email.ts, utils.ts
prisma/
  schema.prisma   → BrokerResponse, ActionLog, Case, CaseActionLog, LawRegime, LawClause, PendingLawChange models
scripts/
  seed.ts         → Populate DB with 60 mock broker responses
  seed-legal.ts   → Populate DB with mock legal workbook data
```

See `CLAUDE.md` for architecture notes (jurisdiction rules, auth flow, tag taxonomy wiring, etc.).
