import { type EnforcementStage } from './case-tracker'
import { type RegimeCode } from './jurisdiction-map'

export type CaseActionLogType =
  | 'STAGE_ADVANCED'
  | 'JURISDICTION_CONFIRMED'
  | 'AUTHORITY_CONFIRMED'
  | 'AUTO_CREATED'
  | 'EVIDENCE_CONFIRMED'
  | 'CASE_CLOSED'

export interface CaseActionLog {
  id: string
  caseId: string
  type: CaseActionLogType
  stage: EnforcementStage | null
  note: string | null
  createdAt: string
}

export interface Case {
  id: string
  userCountry: string
  userState: string | null
  brokerName: string
  brokerCountry: string
  removalRequestDate: string
  applicableRegime: RegimeCode
  responseDeadlineDate: string
  enforcementStage: EnforcementStage
  filingAuthority: string
  complaintUrl: string
  maxFine: string
  jurisdictionConfirmedAt: string | null
  authorityConfirmedAt: string | null
  sourceResponseId: string | null
  evidenceRequestConfirmedAt: string | null
  evidenceIdentityConfirmedAt: string | null
  evidenceSystemsConfirmedAt: string | null
  evidenceReplyConfirmedAt: string | null
  evidenceRetentionConfirmedAt: string | null
  evidenceRetentionNote: string | null
  closedAt: string | null
  createdAt: string
  updatedAt: string
  actionLogs: CaseActionLog[]
}

export type Tag =
  | 'CONFIRMED_REMOVAL'
  | 'CONFIRMED_NOT_FOUND'
  | 'NEEDS_MORE_INFO'
  | 'NEEDS_CONFIRMATION'
  | 'FORM_REQUIRED'
  | 'DENIED_JURISDICTION'
  | 'DENIED_FRAUD'
  | 'DENIED_OTHER'
  | 'OUT_OF_OFFICE'
  | 'UNDELIVERABLE'
  | 'SPAM_OR_IRRELEVANT'
  | 'AMBIGUOUS'

export type Status =
  | 'OPEN'
  | 'IN_PROGRESS'
  | 'ESCALATED_TO_LEGAL'
  | 'RESOLVED'
  | 'RE_SENT'

export type ActionType =
  | 'EMAIL_SENT'
  | 'ESCALATED_TO_LEGAL'
  | 'MARKED_RESOLVED'
  | 'RE_SENT'
  | 'NOTE_ADDED'
  | 'ASSIGNED'

export type Stakeholder = 'PRODUCT_MANAGER' | 'ENGINEERING'

export type Tier = 'tier_1' | 'tier_2' | 'tier_3'

export type Bucket = 'all' | 'done' | 'needs-action' | 'denied' | 'no-action' | 'review'

export interface ActionLog {
  id: string
  responseId: string
  type: ActionType
  assignedTo: Stakeholder | null
  emailTo: string | null
  emailSubject: string | null
  emailBody: string | null
  note: string | null
  createdAt: string
}

export interface ResponseActivityItem {
  source: 'response'
  id: string
  responseId: string
  type: ActionType
  assignedTo: Stakeholder | null
  emailSubject: string | null
  note: string | null
  createdAt: string
  response: { id: string; brokerName: string; tag: Tag }
}

export interface CaseActivityItem {
  source: 'case'
  id: string
  caseId: string
  type: CaseActionLogType
  stage: EnforcementStage | null
  note: string | null
  createdAt: string
  case: { id: string; brokerName: string; enforcementStage: EnforcementStage }
}

// Merges ActionLog (BrokerResponse history) and CaseActionLog (Case history)
// into one feed for Home Overview's Recent Activity — see app/api/activity.
export type RecentActivityItem = ResponseActivityItem | CaseActivityItem

export interface BrokerResponse {
  id: string
  brokerName: string
  brokerEmail: string
  responseContent: string
  tag: Tag
  tier: Tier | null
  status: Status
  assignedTo: Stakeholder | null
  notes: string | null
  website: string | null
  jurisdiction: string | null
  category: string | null
  isHoldingReply: boolean
  createdAt: string
  updatedAt: string
  actions: ActionLog[]
}

export interface StatsData {
  classifications: {
    tier_1: { total: number; labels: Record<string, number> }
    tier_2: { total: number; labels: Record<string, number> }
    tier_3: { total: number; labels: Record<string, number> }
  }
  llm: {
    actual_calls: number
    cache_hits: number
    cost_usd: Record<string, number>
  }
}

export interface ResponsesApiResponse {
  data: BrokerResponse[]
  total: number
  page: number
  pageSize: number
}

export type PendingChangeStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED'

export interface PendingLawChange {
  id: string
  clauseId: string
  proposedTitle: string | null
  proposedCitation: string | null
  proposedText: string
  changeSummary: string
  status: PendingChangeStatus
  createdAt: string
  reviewedAt: string | null
}

export interface LawClause {
  id: string
  regimeId: string
  category: string
  title: string
  citation: string
  text: string
  sourceUrl: string | null
  verified: boolean
  aiGenerated: boolean
  createdAt: string
  updatedAt: string
  pendingChanges: PendingLawChange[]
}

export interface LawRegime {
  id: string
  country: string
  state: string | null
  name: string
  description: string | null
  sourceModel: string | null
  aiGenerated: boolean
  lastCheckedAt: string | null
  createdAt: string
  updatedAt: string
  clauses: LawClause[]
}
