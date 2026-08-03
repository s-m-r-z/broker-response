import { Inbox, CheckCircle2, AlertCircle, XCircle, Clock, HelpCircle, Mail, Scale, Send, StickyNote, TriangleAlert, RefreshCw, ShieldCheck, FileCheck2, Gavel, Briefcase, Wrench, UserPlus, Sparkles, FileText, UserCheck, Database, MessageSquare, Archive, Lock, PauseCircle, type LucideIcon } from 'lucide-react'
import { type Tag, type Bucket, type Status, type ActionType, type Stakeholder } from './types'
import { type EnforcementStage, type EvidenceItem } from './case-tracker'
import { type RegimeCode } from './jurisdiction-map'

export const BUCKET_CONFIG: Record<Bucket, {
  label: string
  icon: LucideIcon
  color: string
  dotColor: string
  bgColor: string
  borderColor: string
  description: string
}> = {
  all: { label: 'All Responses', icon: Inbox, color: 'text-zinc-900 dark:text-zinc-100', dotColor: 'bg-zinc-400', bgColor: 'bg-zinc-500/10', borderColor: 'border-zinc-500/20', description: 'Every broker response in the system, across all statuses.' },
  done: { label: 'Done', icon: CheckCircle2, color: 'text-emerald-400', dotColor: 'bg-emerald-400', bgColor: 'bg-emerald-500/10', borderColor: 'border-emerald-500/20', description: 'Broker confirmed the data was removed, or confirmed no matching record existed.' },
  'needs-action': { label: 'Needs Action', icon: AlertCircle, color: 'text-amber-400', dotColor: 'bg-amber-400', bgColor: 'bg-amber-500/10', borderColor: 'border-amber-500/20', description: 'Broker needs more information, confirmation, or a form submission before removal can proceed.' },
  denied: { label: 'Denied', icon: XCircle, color: 'text-red-400', dotColor: 'bg-red-400', bgColor: 'bg-red-500/10', borderColor: 'border-red-500/20', description: 'Broker refused the removal request — due to jurisdiction, fraud suspicion, or another stated reason.' },
  'no-action': { label: 'No Action', icon: Clock, color: 'text-zinc-900 dark:text-zinc-100', dotColor: 'bg-zinc-400', bgColor: 'bg-zinc-500/10', borderColor: 'border-zinc-500/20', description: 'Out-of-office replies or spam/irrelevant messages that don’t require a follow-up.' },
  review: { label: 'Review', icon: HelpCircle, color: 'text-zinc-900 dark:text-zinc-100', dotColor: 'bg-zinc-400', bgColor: 'bg-zinc-500/10', borderColor: 'border-zinc-500/20', description: 'Ambiguous responses that need a human to read and decide the next step.' },
}

export const ACTION_LABELS: Record<ActionType, string> = {
  EMAIL_SENT: 'Email sent',
  ESCALATED_TO_LEGAL: 'Escalated to legal',
  MARKED_RESOLVED: 'Marked resolved',
  RE_SENT: 'Re-sent request',
  NOTE_ADDED: 'Note added',
  ASSIGNED: 'Assigned',
}

// Monotone by design: this is a history log of what happened, not a current
// status needing attention, so the icon glyph alone differentiates entries.
export const ACTION_ICON_CONFIG: Record<ActionType, { icon: LucideIcon; color: string; bgColor: string }> = {
  EMAIL_SENT: { icon: Mail, color: 'text-zinc-400', bgColor: 'bg-zinc-500/10' },
  ESCALATED_TO_LEGAL: { icon: Scale, color: 'text-zinc-400', bgColor: 'bg-zinc-500/10' },
  MARKED_RESOLVED: { icon: CheckCircle2, color: 'text-zinc-400', bgColor: 'bg-zinc-500/10' },
  RE_SENT: { icon: Send, color: 'text-zinc-400', bgColor: 'bg-zinc-500/10' },
  NOTE_ADDED: { icon: StickyNote, color: 'text-zinc-400', bgColor: 'bg-zinc-500/10' },
  ASSIGNED: { icon: UserPlus, color: 'text-zinc-400', bgColor: 'bg-zinc-500/10' },
}

// The stakeholders legal counsel can hand a broker response off to for
// follow-up (see components/assign-stakeholder-dialog.tsx). Colors chosen to
// avoid clashing with STATUS_CONFIG's adjacent blue (In Progress) / violet
// (Legal) badges, since AssigneeBadge renders right next to StatusBadge.
export const STAKEHOLDER_CONFIG: Record<Stakeholder, { label: string; icon: LucideIcon; color: string; bgColor: string; borderColor: string; description: string }> = {
  PRODUCT_MANAGER: {
    label: 'Product Manager',
    icon: Briefcase,
    color: 'text-sky-400',
    bgColor: 'bg-sky-500/10',
    borderColor: 'border-sky-500/20',
    description: 'Assigned to the Product Manager for a product-facing decision or follow-up.',
  },
  ENGINEERING: {
    label: 'Engineering',
    icon: Wrench,
    color: 'text-pink-400',
    bgColor: 'bg-pink-500/10',
    borderColor: 'border-pink-500/20',
    description: 'Assigned to Engineering for a technical fix or investigation.',
  },
}

export const TAG_CONFIG: Record<Tag, {
  label: string
  color: string
  dotColor: string
  bgColor: string
  borderColor: string
  barColor: string
  bucket: Bucket
  description: string
}> = {
  CONFIRMED_REMOVAL: {
    label: 'Confirmed Removal',
    color: 'text-emerald-400',
    dotColor: 'bg-emerald-400',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/20',
    barColor: 'bg-emerald-500/45',
    bucket: 'done',
    description: 'Broker confirmed the requested data has been removed.',
  },
  CONFIRMED_NOT_FOUND: {
    label: 'Confirmed Not Found',
    color: 'text-emerald-400',
    dotColor: 'bg-emerald-400',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/20',
    barColor: 'bg-emerald-500/45',
    bucket: 'done',
    description: 'Broker confirmed no matching record exists in their system.',
  },
  NEEDS_MORE_INFO: {
    label: 'Needs More Info',
    color: 'text-amber-400',
    dotColor: 'bg-amber-400',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/20',
    barColor: 'bg-amber-500/45',
    bucket: 'needs-action',
    description: 'Broker is asking for additional details before they can process the removal.',
  },
  NEEDS_CONFIRMATION: {
    label: 'Needs Confirmation',
    color: 'text-amber-400',
    dotColor: 'bg-amber-400',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/20',
    barColor: 'bg-amber-500/45',
    bucket: 'needs-action',
    description: 'Broker wants us to confirm this is a legitimate request before acting on it.',
  },
  FORM_REQUIRED: {
    label: 'Form Required',
    color: 'text-amber-400',
    dotColor: 'bg-amber-400',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/20',
    barColor: 'bg-amber-500/45',
    bucket: 'needs-action',
    description: 'Broker requires the removal to be submitted through their own form or portal.',
  },
  DENIED_JURISDICTION: {
    label: 'Denied: Jurisdiction',
    color: 'text-red-400',
    dotColor: 'bg-red-400',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/20',
    barColor: 'bg-red-500/45',
    bucket: 'denied',
    description: 'Broker refused, claiming the request falls outside their jurisdiction.',
  },
  DENIED_FRAUD: {
    label: 'Denied: Fraud',
    color: 'text-red-400',
    dotColor: 'bg-red-400',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/20',
    barColor: 'bg-red-500/45',
    bucket: 'denied',
    description: 'Broker refused, flagging the request as potentially fraudulent.',
  },
  DENIED_OTHER: {
    label: 'Denied: Other',
    color: 'text-red-400',
    dotColor: 'bg-red-400',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/20',
    barColor: 'bg-red-500/45',
    bucket: 'denied',
    description: 'Broker refused for a reason other than jurisdiction or fraud.',
  },
  OUT_OF_OFFICE: {
    label: 'Out of Office',
    color: 'text-zinc-400',
    dotColor: 'bg-zinc-400',
    bgColor: 'bg-zinc-800',
    borderColor: 'border-zinc-700',
    barColor: 'bg-zinc-500/45',
    bucket: 'no-action',
    description: 'Automatic out-of-office reply — no action needed until the broker returns.',
  },
  UNDELIVERABLE: {
    label: 'Undeliverable',
    color: 'text-red-400',
    dotColor: 'bg-red-400',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/20',
    barColor: 'bg-red-500/45',
    bucket: 'denied',
    description: 'The email bounced — the address needs correcting before re-sending.',
  },
  SPAM_OR_IRRELEVANT: {
    label: 'Spam / Irrelevant',
    color: 'text-zinc-400',
    dotColor: 'bg-zinc-400',
    bgColor: 'bg-zinc-800',
    borderColor: 'border-zinc-700',
    barColor: 'bg-zinc-500/45',
    bucket: 'no-action',
    description: 'Response isn’t related to the removal request and can be ignored.',
  },
  AMBIGUOUS: {
    label: 'Ambiguous',
    color: 'text-violet-400',
    dotColor: 'bg-violet-400',
    bgColor: 'bg-violet-500/10',
    borderColor: 'border-violet-500/20',
    barColor: 'bg-violet-500/45',
    bucket: 'review',
    description: 'Response is unclear and needs a human to read it and decide the next step.',
  },
}

// Rendered as a badge on responses the external classifier flagged as a
// non-substantive holding acknowledgement (US-11) — separate from `tag`,
// since a holding reply can carry any tag (e.g. NEEDS_MORE_INFO) while still
// not resolving anything. See app/api/ingest for the isHoldingReply field.
export const HOLDING_REPLY_CONFIG = {
  label: 'Holding Reply',
  icon: PauseCircle,
  color: 'text-amber-400',
  bgColor: 'bg-amber-500/10',
  borderColor: 'border-amber-500/20',
  description: 'Flagged by the classifier as an acknowledgement-only reply — not a substantive response. Keep this case open.',
}

export const BUCKET_TAGS: Record<Bucket, Tag[]> = {
  all: [],
  done: ['CONFIRMED_REMOVAL', 'CONFIRMED_NOT_FOUND'],
  'needs-action': ['NEEDS_MORE_INFO', 'NEEDS_CONFIRMATION', 'FORM_REQUIRED'],
  denied: ['DENIED_JURISDICTION', 'DENIED_FRAUD', 'DENIED_OTHER', 'UNDELIVERABLE'],
  'no-action': ['OUT_OF_OFFICE', 'SPAM_OR_IRRELEVANT'],
  review: ['AMBIGUOUS'],
}

export const STATUS_CONFIG: Record<Status, { label: string; color: string; bgColor: string; borderColor: string; description: string }> = {
  OPEN: {
    label: 'Open',
    color: 'text-zinc-400',
    bgColor: 'bg-zinc-800',
    borderColor: 'border-zinc-700',
    description: 'No action has been taken on this response yet.',
  },
  IN_PROGRESS: {
    label: 'In Progress',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/20',
    description: 'Someone is actively working this response.',
  },
  ESCALATED_TO_LEGAL: {
    label: 'Legal',
    color: 'text-violet-400',
    bgColor: 'bg-violet-500/10',
    borderColor: 'border-violet-500/20',
    description: 'Handed off to legal counsel for review.',
  },
  RESOLVED: {
    label: 'Resolved',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/20',
    description: 'This response has been fully actioned and closed out.',
  },
  RE_SENT: {
    label: 'Re-sent',
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/20',
    description: 'The removal request was re-sent to the broker.',
  },
}

export const STAGE_CONFIG: Record<EnforcementStage, { label: string; icon: LucideIcon; color: string; bgColor: string; borderColor: string; barColor: string; description: string }> = {
  request_sent: { label: 'Request Sent', icon: Send, color: 'text-zinc-400', bgColor: 'bg-zinc-500/10', borderColor: 'border-zinc-500/20', barColor: 'bg-zinc-500/45', description: 'The initial data removal request was sent to the broker.' },
  deadline_approaching: { label: 'Deadline Approaching', icon: Clock, color: 'text-amber-400', bgColor: 'bg-amber-500/10', borderColor: 'border-amber-500/20', barColor: 'bg-amber-500/45', description: 'The broker’s statutory response deadline is coming up.' },
  deadline_passed: { label: 'Deadline Passed', icon: TriangleAlert, color: 'text-red-400', bgColor: 'bg-red-500/10', borderColor: 'border-red-500/20', barColor: 'bg-red-500/45', description: 'The broker missed their statutory response deadline without a valid response.' },
  followup_sent: { label: 'Follow-up Sent', icon: RefreshCw, color: 'text-blue-400', bgColor: 'bg-blue-500/10', borderColor: 'border-blue-500/20', barColor: 'bg-blue-500/45', description: 'A follow-up request was sent after the broker missed the deadline.' },
  complaint_eligible: { label: 'Complaint Eligible', icon: ShieldCheck, color: 'text-violet-400', bgColor: 'bg-violet-500/10', borderColor: 'border-violet-500/20', barColor: 'bg-violet-500/45', description: 'Jurisdiction has been confirmed, so a regulatory complaint can now be filed.' },
  complaint_filed: { label: 'Complaint Filed', icon: FileCheck2, color: 'text-emerald-400', bgColor: 'bg-emerald-500/10', borderColor: 'border-emerald-500/20', barColor: 'bg-emerald-500/45', description: 'A complaint has been filed with the enforcement authority.' },
}

// The non-stage events that also appear in a case's history timeline
// (components/case-tracker/case-detail.tsx) alongside STAGE_ADVANCED entries,
// which reuse STAGE_CONFIG above directly instead of needing their own labels.
export const CASE_EVENT_CONFIG: Record<'JURISDICTION_CONFIRMED' | 'AUTHORITY_CONFIRMED' | 'AUTO_CREATED' | 'EVIDENCE_CONFIRMED' | 'CASE_CLOSED', { label: string; icon: LucideIcon }> = {
  JURISDICTION_CONFIRMED: { label: 'Jurisdiction confirmed', icon: ShieldCheck },
  AUTHORITY_CONFIRMED: { label: 'Authority confirmed', icon: Gavel },
  AUTO_CREATED: { label: 'Auto-created from classified email', icon: Sparkles },
  EVIDENCE_CONFIRMED: { label: 'Evidence item confirmed', icon: FileCheck2 },
  CASE_CLOSED: { label: 'Case closed', icon: Lock },
}

// The evidence-completeness checklist (US-19/US-21) — see
// lib/case-tracker.ts EVIDENCE_ITEMS for the canonical item order and
// prisma/schema.prisma for the backing `evidence{Item}ConfirmedAt` fields.
export const EVIDENCE_ITEM_CONFIG: Record<EvidenceItem, { label: string; icon: LucideIcon; description: string }> = {
  request: {
    label: 'Original request',
    icon: FileText,
    description: 'The original removal request sent to the broker is on file.',
  },
  identity: {
    label: 'Identity verification',
    icon: UserCheck,
    description: 'The requester\'s identity was verified per the applicable regime\'s requirements.',
  },
  systems: {
    label: 'Systems confirmation',
    icon: Database,
    description: 'The broker confirmed which systems the removal action was taken in.',
  },
  reply: {
    label: 'Broker reply',
    icon: MessageSquare,
    description: 'A substantive (non-holding) reply from the broker confirming the action taken is on file.',
  },
  retentionException: {
    label: 'Retention exception',
    icon: Archive,
    description: 'Any data the broker is retaining under a legal exception is documented, or explicitly confirmed as none.',
  },
}

export const REGIME_LABELS: Record<RegimeCode, string> = {
  GDPR: 'GDPR',
  UK_GDPR: 'UK GDPR',
  CCPA: 'CCPA',
  VA_CDPA: 'VA CDPA',
  CO_CPA: 'CO CPA',
  CT_CTDPA: 'CT CTDPA',
  LGPD: 'LGPD',
}

export const REGIME_DESCRIPTIONS: Record<RegimeCode, string> = {
  GDPR: 'EU General Data Protection Regulation — applies when the user is in the European Union.',
  UK_GDPR: 'UK GDPR — applies when the user is in the United Kingdom.',
  CCPA: 'California Consumer Privacy Act (as amended by CPRA) — applies to California residents.',
  VA_CDPA: 'Virginia Consumer Data Protection Act — applies to Virginia residents.',
  CO_CPA: 'Colorado Privacy Act — applies to Colorado residents.',
  CT_CTDPA: 'Connecticut Data Privacy Act — applies to Connecticut residents.',
  LGPD: 'Lei Geral de Proteção de Dados — Brazil’s general data protection law.',
}

export const CLAUSE_CATEGORY_LABELS: Record<string, string> = {
  RIGHT_TO_ERASURE: 'Right to Erasure',
  RESPONSE_DEADLINE: 'Response Deadline',
  VERIFICATION_REQUIREMENTS: 'Verification Requirements',
  EXEMPTIONS: 'Exemptions',
  PENALTIES: 'Penalties',
  ENFORCEMENT_AUTHORITY: 'Enforcement Authority',
  DEFINITIONS: 'Definitions',
  OTHER: 'Other',
}

export const CLAUSE_CATEGORY_DESCRIPTIONS: Record<string, string> = {
  RIGHT_TO_ERASURE: 'The legal basis and scope for requesting deletion of personal data.',
  RESPONSE_DEADLINE: 'How long the broker has to respond to a removal request under this law.',
  VERIFICATION_REQUIREMENTS: 'What the broker is allowed to require to verify the requester’s identity.',
  EXEMPTIONS: 'Cases where the broker is not required to comply with the removal request.',
  PENALTIES: 'Fines or sanctions the broker faces for non-compliance.',
  ENFORCEMENT_AUTHORITY: 'The regulator responsible for enforcing this law and receiving complaints.',
  DEFINITIONS: 'Key terms as defined by this jurisdiction’s law.',
  OTHER: 'Provisions that don’t fit the other categories.',
}

export const EMAIL_TEMPLATES: Record<Tag, { subject: string; body: string }> = {
  CONFIRMED_REMOVAL: {
    subject: 'Re: Data Removal Confirmation',
    body: 'Thank you for confirming the removal of our client\'s data. We appreciate your prompt response and cooperation.',
  },
  CONFIRMED_NOT_FOUND: {
    subject: 'Re: Data Not Found Confirmation',
    body: 'Thank you for confirming that no matching record was found in your system. We appreciate your prompt response.',
  },
  NEEDS_MORE_INFO: {
    subject: 'Re: Additional Information – Data Removal Request',
    body: 'Thank you for your response. Please find below the additional information requested to process the data removal:\n\n[Please add the required information here]\n\nPlease proceed with the removal once you have reviewed the above.',
  },
  NEEDS_CONFIRMATION: {
    subject: 'Re: Confirmation of Data Removal Request',
    body: 'We confirm that this is a legitimate data removal request and hereby request you to action the removal at your earliest convenience.',
  },
  FORM_REQUIRED: {
    subject: 'Re: Data Removal Form Submission',
    body: 'Thank you for your response. Could you please provide the direct link to the form or portal where we can submit the removal request?',
  },
  DENIED_JURISDICTION: {
    subject: 'Re: Data Removal Request – Jurisdiction Clarification',
    body: 'We are writing to follow up on our data removal request which was denied on jurisdictional grounds. We would like to clarify our legal basis and request reconsideration.',
  },
  DENIED_FRAUD: {
    subject: 'Re: Data Removal Request – Fraud Flag Clarification',
    body: 'We understand our request was flagged. We assure you this is a legitimate request and can provide any additional verification required.',
  },
  DENIED_OTHER: {
    subject: 'Re: Data Removal Request – Follow Up',
    body: 'We are following up on our data removal request which was denied. We would appreciate clarification on the specific reason for denial and the steps to resolve this.',
  },
  OUT_OF_OFFICE: {
    subject: 'Re: Data Removal Request – Follow Up',
    body: 'We note that our previous correspondence received an out-of-office reply. We are following up to ensure our data removal request is processed upon your return.',
  },
  UNDELIVERABLE: {
    subject: 'Data Removal Request',
    body: 'We are re-sending this data removal request as our previous communication was undeliverable. Please process the removal of our client\'s data at your earliest convenience.',
  },
  SPAM_OR_IRRELEVANT: {
    subject: 'Re: Data Removal Request – Follow Up',
    body: 'We are following up on our data removal request. Please acknowledge receipt and confirm removal of our client\'s data.',
  },
  AMBIGUOUS: {
    subject: 'Re: Data Removal Request – Clarification Required',
    body: 'Thank you for your response. Could you please clarify the current status of our data removal request and confirm the next steps?',
  },
}
