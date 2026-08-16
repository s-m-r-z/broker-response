# Case Tracker — Test Plan

Pulled from the Miro board (frame `3458764680576788144`, board `uXjVH-kM0y8=`). 81 test cases across 27 user stories, each with a Happy Path, Negative, and Edge Case scenario. Maps closely to the `case-tracker` feature in this repo (jurisdiction/authority confirmation, evidence checklist, draft-flagging, approval-before-filing, version history).

## MoSCoW priority & automated coverage

Priority pulled from the backlog frame on the same Miro board (`3458764679799662713` — "Release 1/2/3" sections, each story tagged Must/Should/Could have).

- **21 Must have**: US-01, 02, 03, 05, 06, 07, 08, 09, 10, 11, 13, 14, 15, 18, 19, 20, 21, 22, 23, 24, 25
- **5 Should have**: US-04, 12, 16, 17, 26
- **1 Could have**: US-27

**19 of 21 Must-have stories have at least one automated test** in the `/test-cases` dashboard (`lib/test-runner`), verified against this app's real implementation: US-01, 02, 03, 05, 06, 07, 08, 09, 10, 11, 13, 14, 15, 18, 19, 20, 21, 23, 25.

**2 Must-have stories remain manual-only, both genuine feature gaps:**
- **US-22** (shared live case view) — this app has one shared team password, not per-user accounts, so there's no "view-only stakeholder" role to test, and no websocket/live push (state only updates on refetch).
- **US-24** (full edit history with diff) — draft edits are logged, but there's no side-by-side version diff view and no per-author filter on history (edits aren't attributed to an individual counsellor in this app's simpler auth model).

## 01 · Determine Jurisdiction and Authority

| TC | Type | Scenario | Expected |
|---|---|---|---|
| TC-01-01 | Happy | US-01 Auto-detect regime — confirmed UK location | GDPR (UK) shown before draft field opens |
| TC-01-02 | Negative | Email uses GDPR language but confirmed location is California | System flags conflict, doesn't silently apply GDPR |
| TC-01-03 | Edge | No location on file, no linked contract | Draft field locked, manual regime confirmation prompted |
| TC-02-01 | Happy | US-02 Contract + prior cases — linked contract & data flow note exist | Contract, note, and 3 closest prior cases appear in sidebar unprompted |
| TC-02-02 | Negative | No contract file linked | Missing contract flagged, blocks proceeding to draft |
| TC-02-03 | Edge | Data flow note >12 months old | Note shown with an age warning |
| TC-03-01 | Happy | US-03 Auto-route authority — GDPR (Germany) confirmed | BfDI pre-filled, complaints URL + max fine shown |
| TC-03-02 | Negative | Routing table authority URL is outdated | Flagged as possibly stale with updated source shown |
| TC-03-03 | Edge | Federated authority structure, multiple possible bodies | Most likely authority shown, all valid options listed for confirmation |
| TC-04-01 | Happy | US-04 Rationale summary — regime & authority confirmed | Summary generated (regime, basis, authority), attached with timestamp |
| TC-04-02 | Negative | Authority not yet confirmed | Generation blocked until authority confirmed |
| TC-04-03 | Edge | Case closed, evidence package checked | Rationale summary auto-included in evidence package |

## 02 · Monitor Case Pipeline (US-05–08)

| TC | Type | Scenario | Expected |
|---|---|---|---|
| TC-05-01 | Happy | Queue with 10 open cases at various stages | Every case shows stage label + day count, no thread-opening needed |
| TC-05-02 | Negative | Case past GDPR 30-day deadline | Breached case visually distinct from on-time cases |
| TC-05-03 | Edge | Action logged in one tab, queue open in another | Queue updates live, no manual refresh |
| TC-06-01 | Happy | New GDPR case, Day 1 confirmed | Approaching flag on Day 25, breach flag on Day 30 |
| TC-06-02 | Negative | CCPA case with wrong received date, corrected | Clock recalculates from corrected date |
| TC-06-03 | Edge | Jurisdiction not yet in routing table | Unknown regime flagged, manual deadline entry prompted (no silent default) |
| TC-07-01 | Happy | Confirmation request sent | Status auto-updates to "Pending internal confirmation" |
| TC-07-02 | Negative | Reply sent while in drafting stage | Status → "Reply sent"; doesn't jump to Closed |
| TC-07-03 | Edge | Two counsellors log actions simultaneously | Status reflects latest action, both logged separately in history |
| TC-08-01 | Happy | GDPR case reaches Day 25 (5 days left) | Warning indicator visible in queue without opening thread |
| TC-08-02 | Negative | Day 31 reached, no requester follow-up yet | Breach indicator + notification fire before any follow-up |
| TC-08-03 | Edge | Day 28, outstanding internal confirmation | Warning shown + outstanding confirmation linked |

## 03 · Qualify Incoming Cases

| TC | Type | Scenario | Expected |
|---|---|---|---|
| TC-09-01 | Happy | US-09 Pre-classify — new UK deletion request | Labelled before opened: Type/Jurisdiction/Urgency/Identity |
| TC-09-02 | Negative | General complaint, not formal request | Classified as Complaint, not Deletion/Access |
| TC-09-03 | Edge | Counsellor overrides classification | Update saved, logged with name/timestamp, fed back to model |
| TC-10-01 | Happy | US-10 Auto-create case — classified deletion, GDPR confirmed | Received date/type/owner/deadline pre-filled |
| TC-10-02 | Negative | Counsellor disputes pre-filled type | Field editable, change saved with source attribution |
| TC-10-03 | Edge | Queue checked immediately after case creation | Appears in queue with no manual refresh/entry |
| TC-11-01 | Happy | US-11 Holding-reply detection — generic "looking into it" reply | Flagged non-substantive; case stays open, clock continues |
| TC-11-02 | Negative | Substantive reply confirming deletion w/ date | Not flagged as holding; status updates |
| TC-11-03 | Edge | Counsellor overrides a holding flag | Flag cleared, status updates, override logged w/ reason |
| TC-12-01 | Happy | US-12 Duplicate detection — identical request 3 days later | Flagged as potential duplicate before new case created, linked to original |
| TC-12-02 | Negative | Same requester, different request types (deletion vs access) | Not flagged as duplicates; both created independently |
| TC-12-03 | Edge | Counsellor merges duplicate with different timestamps | Both timestamps retained, earliest used for deadline; marked merged not deleted |

## 04 · Draft with Compliance Checks (US-13–17)

| TC | Type | Scenario | Expected |
|---|---|---|---|
| TC-13-01 | Happy | US-13 Snippet library — GDPR deletion draft opened | 3 closest prior approved replies shown w/ safety indicators & source links |
| TC-13-02 | Negative | No prior approved replies for jurisdiction/type | Closest available match shown with a difference note |
| TC-13-03 | Edge | Source case later flagged as incorrectly closed | Inserted text flagged with warning |
| TC-14-01 | Happy | US-14 Provision currency — Article 17 GDPR referenced | Current EUR-Lex text shown with retrieval date |
| TC-14-02 | Negative | Provision amended 2 months ago | Flag: provision updated since last used, review before sending |
| TC-14-03 | Edge | Citation pasted from a non-official blog | Blog URL replaced with official source, substitution noted |
| TC-15-01 | Happy | US-15 Broad language flag — "all data has been deleted" | Inline flag w/ reason + suggested replacement; send blocked |
| TC-15-02 | Negative | Word "confirm" used in a routine sentence | Highlighted, counsellor must confirm/replace before send |
| TC-15-03 | Edge | Novel replacement accepted for a flagged phrase | Replacement auto-added to shared phrase library |
| TC-16-01 | Happy | US-16 Plain-text gate — move to send-ready | Plain-text review shown, confirmation logged, then send-ready |
| TC-16-02 | Negative | Attempt to send without completing review | Send blocked, returned to review step |
| TC-16-03 | Edge | Edit made after plain-text review confirmed | New review requirement triggered; send blocked until re-reviewed |
| TC-17-01 | Happy | US-17 Team phrase library — phrase flagged via compliance follow-up | Added to shared library, triggers flag for all counsellors going forward |
| TC-17-02 | Negative | Variant phrasing typed ("all personal information has been erased") | Variant match still triggers flag with library note |
| TC-17-03 | Edge | Library entry removed while flagged in an active draft | Flag clears immediately, counsellor notified |

## 05 · Validate Before Filing

| TC | Type | Scenario | Expected |
|---|---|---|---|
| TC-18-01 | Happy | US-18 Structured confirmation form — required fields filled | Validated, confirmation recorded, timestamp logged |
| TC-18-02 | Negative | Missing required fields | Submission blocked, inline errors per field |
| TC-18-03 | Edge | Two team members submit concurrently | First accepted; second sees conflict warning with latest state |
| TC-19-01 | Happy | US-19 Evidence completeness gate — all documents present | Complete record generated, gate passes |
| TC-19-02 | Negative | Missing required evidence item(s) | Assembly blocked, missing items listed |
| TC-19-03 | Edge | Evidence file present but corrupted | Flagged, gate blocks with actionable error |
| TC-20-01 | Happy | US-20 Sourcing for generated sentences — sources indexed | Citation w/ document reference + page shown on click |
| TC-20-02 | Negative | Sentence with no verifiable source | Flagged unsourced, blocks filing until resolved |
| TC-20-03 | Edge | Sentence draws from conflicting sources | All sources listed, conflict highlighted for reviewer |
| TC-21-01 | Happy | US-21 Closure gate — checklist fully complete | Closes successfully, closure timestamp recorded |
| TC-21-02 | Negative | Checklist item(s) incomplete | Closure blocked, incomplete items listed |
| TC-21-03 | Edge | Checklist item was complete but evidence later revoked | Closure blocked, stale item auto-reopened |

## 06 · Maintain Shared Visibility

| TC | Type | Scenario | Expected |
|---|---|---|---|
| TC-22-01 | Happy | US-22 Shared live view — counsellor/PM/compliance open case independently | All see same status, last action, outstanding actions, owner — no messaging needed |
| TC-22-02 | Negative | View-only user attempts to edit status | Edit blocked, info still visible |
| TC-22-03 | Edge | Status changes while a stakeholder is viewing | Updates live, no refresh needed |
| TC-23-01 | Happy | US-23 Status/stage breakdown — cases in all 4 states | Each shows correct state; "Waiting" names owner, "Approaching" shows days left |
| TC-23-02 | Negative | Filter by "Waiting on confirmation" | Only matching cases shown, filter clearable |
| TC-23-03 | Edge | Case moves Deadline Approaching → Complete in one cycle | Status jumps to Complete; both states retained in history |
| TC-24-01 | Happy | US-24 Full edit history — 3 counsellors edit a draft | All edits recorded with author, timestamp, before/after text |
| TC-24-02 | Negative | Filter history by one author | Only that author's edits shown |
| TC-24-03 | Edge | Two counsellors edit same sentence simultaneously | Both recorded separately, conflict flag prompts review |
| TC-25-01 | Happy | US-25 Approval gate — reviewer approves draft | Approval confirmed, version locked, filing proceeds |
| TC-25-02 | Negative | Edit made after approval, filing attempted | Filing blocked, new approval required |
| TC-25-03 | Edge | Named reviewer unavailable, deadline is today | Escalation path offered to an authorised backup reviewer |
| TC-26-01 | Happy | US-26 Version control — edit made and saved | New version auto-created w/ number, author, timestamp, change summary |
| TC-26-02 | Negative | Restore v3 while at v5 | Restoration creates v6 noting source; v1–v5 preserved unchanged |
| TC-26-03 | Edge | Two counsellors save edits within 1 second | Two sequential versions created, rapid-succession review note shown |
| TC-27-01 | Happy | US-27 Coordination log — case closed after a coordination failure | Issue + resolution saved to shared log, linked to case type |
| TC-27-02 | Negative | New multi-person case opened, 2 relevant prior log entries exist | Most relevant entries surfaced at case start |
| TC-27-03 | Edge | Log entry marked resolved at process level | No longer surfaced as active prompt; stays archived |
