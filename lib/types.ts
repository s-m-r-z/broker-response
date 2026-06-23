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

export type Tier = 'tier_1' | 'tier_2' | 'tier_3'

export type Bucket = 'all' | 'done' | 'needs-action' | 'denied' | 'no-action' | 'review'

export interface ActionLog {
  id: string
  responseId: string
  type: ActionType
  emailTo: string | null
  emailSubject: string | null
  emailBody: string | null
  note: string | null
  createdAt: string
}

export interface BrokerResponse {
  id: string
  brokerName: string
  brokerEmail: string
  responseContent: string
  tag: Tag
  tier: Tier | null
  status: Status
  notes: string | null
  website: string | null
  jurisdiction: string | null
  category: string | null
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
