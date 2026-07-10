# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Internal compliance dashboard for triaging data broker removal responses at scale, built for PureWL's compliance workflow. Next.js 16 (App Router) app with SQLite/Prisma, Gmail SMTP for outbound email, a "legal workbook" module for jurisdiction-specific legal clause reference data, and a "case tracker" module for escalating broker non-response cases through a jurisdiction-aware enforcement/complaint pipeline.

## Commands

```bash
npm run dev              # dev server (http://localhost:3000)
npm run build             # production build
npm run lint               # next lint
npm test                    # jest (lib/*.test.ts — jurisdiction mapping + case business rules)

npm run db:push            # push prisma/schema.prisma to the SQLite DB
npm run db:generate        # regenerate Prisma client after schema changes
npm run db:studio          # Prisma Studio GUI
npm run db:seed            # seed 60 mock broker responses (scripts/seed.ts)
npm run db:seed:legal      # seed legal workbook mock data (scripts/seed-legal.ts)
```

## Environment

Required in `.env` (see `.env.example`): `DATABASE_URL`, `SMTP_HOST`/`SMTP_PORT`/`SMTP_USER`/`SMTP_PASS`/`SMTP_FROM`, `AUTH_PASSWORD`. Note `proxy.ts` also reads `AUTH_SECRET` (used as the session cookie value compared against on every request) — this is separate from `AUTH_PASSWORD` (the login form password checked once in `app/api/auth/route.ts`). Both must be set for auth to work.

## Architecture

**Three feature areas share one app:** the broker-response triage dashboard (`/responses`), the legal workbook (`/legal-workbook`, a reference library of data-protection law clauses per jurisdiction used by legal counsel to back replies with citations), and the case tracker (`/case-tracker`, escalates broker non-response cases through a jurisdiction/authority confirmation flow). Root `/` is a Home Overview that aggregates all three (counts, activity, cases, regimes) but is otherwise read/navigate-only. Each area is a separate client-state tree — `components/dashboard.tsx`, `components/legal-workbook/legal-workbook.tsx`, `components/case-tracker/case-tracker.tsx` — sharing only layout/auth/db.

**Case jurisdiction is always derived from the user's location, never the broker's.** `lib/jurisdiction-map.ts` is the single-file, isolated mapping from `userCountry`/`userState` to regime/deadline/filing authority/complaint URL/max fine — it has no `brokerCountry` parameter, so it's structurally impossible to derive from the broker's location. `lib/case-tracker.ts` wraps it (`deriveCaseFields`) and owns stage-transition rules (`canTransitionStage`: `complaint_eligible` requires jurisdiction confirmed, `complaint_filed` requires authority confirmed) and confirmation immutability (`assertConfirmable` — a confirmed timestamp can never be re-set). The `POST /api/cases` Zod schema (`lib/case-validation.ts`) is `.strict()` and only accepts intake fields, so a client can't set `applicableRegime` etc. directly even if it wanted to.

**The dashboard and case tracker are connected by one action, not a schema relation.** "Track as Case" on a response (`response-detail.tsx` → `dashboard.tsx`) opens the case tracker's `NewCaseDialog` prefilled with that response's broker name/jurisdiction, then on creation navigates to `/case-tracker?open=<id>`. This mirrors the pre-existing `/responses?open=<id>` deep-link convention used by Home Overview's Recent Activity feed — both pages read `?open=` via `useSearchParams` (wrapped in `<Suspense>` at the page level, required for that hook) and fetch+select that one record independent of the list fetch.

**Auth is edge-middleware based, not per-route.** `proxy.ts` (Next's middleware, matched via `config.matcher` against everything except static assets) gates every request behind a `br_session` cookie check, redirecting to `/login` on mismatch. Public paths (`/login`, `/api/auth`, `/icon`, `/opengraph-image`) are allowlisted in `PUBLIC_PATHS` inside `proxy.ts` — new unauthenticated routes must be added there.

**Dashboard state lives in one client component.** `components/dashboard.tsx` owns filtering/search/selection/pagination state for the responses view; `sidebar.tsx` (bucket/tag nav), `response-list.tsx`, `response-detail.tsx`, `compose-drawer.tsx`, and `bulk-action-bar.tsx` are largely presentational children driven by it. When adding a new filter or bulk action, it likely belongs in `dashboard.tsx` first.

**Tag taxonomy drives UI behavior, not just display.** The broker-response tags (`CONFIRMED_REMOVAL`, `CONFIRMED_NOT_FOUND`, `NEEDS_MORE_INFO`, `NEEDS_CONFIRMATION`, `FORM_REQUIRED`, `DENIED_JURISDICTION`, `DENIED_FRAUD`, `DENIED_OTHER`, `OUT_OF_OFFICE`, `UNDELIVERABLE`, `SPAM_OR_IRRELEVANT`, `AMBIGUOUS`) are defined once in `lib/constants.ts` alongside status config and email templates, and referenced from `tag-badge.tsx`, `sidebar.tsx`, and `compose-drawer.tsx` (which pre-populates the compose email based on tag). Adding a tag means updating `lib/constants.ts` plus the Prisma `tag: String` field usage — tags aren't a Prisma enum.

**External ingestion is one-way.** `/api/ingest` receives already-classified responses pushed from an external classification pipeline (not built in this repo); `/api/stats` proxies live stats from `email-classifier.purewl.com/stats`. This app never runs classification itself.

**Legal AI content is provider-abstracted.** `lib/legal-ai.ts` defines a `LegalAiProvider` interface (`generateRegime`, `recheckClause`) currently backed by a deterministic mock (`getLegalAiProvider()`), so the feature works with zero API cost. All content generated this way is flagged `aiGenerated`/`verified` in the schema until a human confirms it. A recheck produces a `PendingLawChange` row sitting in front of a `LawClause` — the clause itself never mutates until a change is explicitly accepted or rejected (see `app/api/legal/changes/[id]/route.ts`, `app/api/legal/regimes/[id]/recheck/route.ts`).

**Action logging is append-only.** Every action taken on a response (resolve, escalate, re-send, email sent) is written to `ActionLog` (`prisma/schema.prisma`), keyed by `responseId`, rather than mutating fields on `BrokerResponse` directly — `response-detail.tsx` renders this as history.
