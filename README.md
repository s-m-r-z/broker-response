# Broker Response

An internal compliance dashboard for triaging data broker removal responses at scale. Built for PureWL's compliance workflow.

## What it does

- Receives tagged broker responses from the existing classification pipeline via `/api/ingest`
- Displays responses in a three-panel dashboard (sidebar → list → detail)
- Allows the team to take action: email brokers, escalate to legal, mark resolved, re-send requests
- Shows live stats from the classification API (total processed, LLM calls, cost, tag counts)
- Supports bulk actions across multiple responses

## Tech Stack

- **Frontend/Backend:** Next.js 14 (App Router)
- **Database:** SQLite via Prisma
- **Email:** Nodemailer + Gmail SMTP
- **UI:** Tailwind CSS + shadcn/ui-style components, Inter font, Lucide icons

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

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment

Copy `.env.example` to `.env` and fill in your Gmail credentials:

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
```

### 3. Set up the database

```bash
npx prisma db push
```

### 4. Seed with mock data (optional)

```bash
npm run db:seed
```

### 5. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

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
    stats/          → Proxies live stats from email-classifier.purewl.com/stats
    responses/      → GET filtered/paginated responses
    responses/[id]/ → GET single response with action history
    ingest/         → POST new tagged response
    email/          → POST send email via Gmail SMTP
    actions/        → POST log an action (resolve, escalate, re-send)
components/
  dashboard.tsx       → Main client component, manages all state
  sidebar.tsx         → Bucket + tag navigation
  response-list.tsx   → Filterable, searchable, multi-select list
  response-detail.tsx → Detail view with action buttons + history
  compose-drawer.tsx  → Email compose drawer (pre-populated by tag)
  bulk-action-bar.tsx → Floating bar for bulk actions
  stats-bar.tsx       → Live stats from classification API
lib/
  constants.ts    → Tag config, status config, email templates
  types.ts        → TypeScript types
  db.ts           → Prisma client
  email.ts        → Nodemailer transporter
prisma/
  schema.prisma   → BrokerResponse + ActionLog models
scripts/
  seed.ts         → Populate DB with 60 mock responses for testing
```
