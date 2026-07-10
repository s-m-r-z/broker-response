import { Inbox, CheckCircle2, AlertCircle, XCircle, Clock, HelpCircle, Mail, Scale, Send, StickyNote, TriangleAlert, RefreshCw, ShieldCheck, FileCheck2, type LucideIcon } from 'lucide-react'
import { type Tag, type Bucket, type Status, type ActionType } from './types'
import { type EnforcementStage } from './case-tracker'
import { type RegimeCode } from './jurisdiction-map'

export const BUCKET_CONFIG: Record<Bucket, {
  label: string
  icon: LucideIcon
  color: string
  dotColor: string
  bgColor: string
  borderColor: string
}> = {
  all: { label: 'All Responses', icon: Inbox, color: 'text-zinc-900 dark:text-zinc-100', dotColor: 'bg-zinc-400', bgColor: 'bg-zinc-500/10', borderColor: 'border-zinc-500/20' },
  done: { label: 'Done', icon: CheckCircle2, color: 'text-emerald-400', dotColor: 'bg-emerald-400', bgColor: 'bg-emerald-500/10', borderColor: 'border-emerald-500/20' },
  'needs-action': { label: 'Needs Action', icon: AlertCircle, color: 'text-amber-400', dotColor: 'bg-amber-400', bgColor: 'bg-amber-500/10', borderColor: 'border-amber-500/20' },
  denied: { label: 'Denied', icon: XCircle, color: 'text-red-400', dotColor: 'bg-red-400', bgColor: 'bg-red-500/10', borderColor: 'border-red-500/20' },
  'no-action': { label: 'No Action', icon: Clock, color: 'text-zinc-900 dark:text-zinc-100', dotColor: 'bg-zinc-400', bgColor: 'bg-zinc-500/10', borderColor: 'border-zinc-500/20' },
  review: { label: 'Review', icon: HelpCircle, color: 'text-zinc-900 dark:text-zinc-100', dotColor: 'bg-zinc-400', bgColor: 'bg-zinc-500/10', borderColor: 'border-zinc-500/20' },
}

export const ACTION_LABELS: Record<ActionType, string> = {
  EMAIL_SENT: 'Email sent',
  ESCALATED_TO_LEGAL: 'Escalated to legal',
  MARKED_RESOLVED: 'Marked resolved',
  RE_SENT: 'Re-sent request',
  NOTE_ADDED: 'Note added',
}

// Monotone by design: this is a history log of what happened, not a current
// status needing attention, so the icon glyph alone differentiates entries.
export const ACTION_ICON_CONFIG: Record<ActionType, { icon: LucideIcon; color: string; bgColor: string }> = {
  EMAIL_SENT: { icon: Mail, color: 'text-zinc-400', bgColor: 'bg-zinc-500/10' },
  ESCALATED_TO_LEGAL: { icon: Scale, color: 'text-zinc-400', bgColor: 'bg-zinc-500/10' },
  MARKED_RESOLVED: { icon: CheckCircle2, color: 'text-zinc-400', bgColor: 'bg-zinc-500/10' },
  RE_SENT: { icon: Send, color: 'text-zinc-400', bgColor: 'bg-zinc-500/10' },
  NOTE_ADDED: { icon: StickyNote, color: 'text-zinc-400', bgColor: 'bg-zinc-500/10' },
}

export const TAG_CONFIG: Record<Tag, {
  label: string
  color: string
  dotColor: string
  bgColor: string
  borderColor: string
  bucket: Bucket
}> = {
  CONFIRMED_REMOVAL: {
    label: 'Confirmed Removal',
    color: 'text-emerald-400',
    dotColor: 'bg-emerald-400',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/20',
    bucket: 'done',
  },
  CONFIRMED_NOT_FOUND: {
    label: 'Confirmed Not Found',
    color: 'text-emerald-400',
    dotColor: 'bg-emerald-400',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/20',
    bucket: 'done',
  },
  NEEDS_MORE_INFO: {
    label: 'Needs More Info',
    color: 'text-amber-400',
    dotColor: 'bg-amber-400',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/20',
    bucket: 'needs-action',
  },
  NEEDS_CONFIRMATION: {
    label: 'Needs Confirmation',
    color: 'text-amber-400',
    dotColor: 'bg-amber-400',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/20',
    bucket: 'needs-action',
  },
  FORM_REQUIRED: {
    label: 'Form Required',
    color: 'text-amber-400',
    dotColor: 'bg-amber-400',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/20',
    bucket: 'needs-action',
  },
  DENIED_JURISDICTION: {
    label: 'Denied: Jurisdiction',
    color: 'text-red-400',
    dotColor: 'bg-red-400',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/20',
    bucket: 'denied',
  },
  DENIED_FRAUD: {
    label: 'Denied: Fraud',
    color: 'text-red-400',
    dotColor: 'bg-red-400',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/20',
    bucket: 'denied',
  },
  DENIED_OTHER: {
    label: 'Denied: Other',
    color: 'text-red-400',
    dotColor: 'bg-red-400',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/20',
    bucket: 'denied',
  },
  OUT_OF_OFFICE: {
    label: 'Out of Office',
    color: 'text-zinc-400',
    dotColor: 'bg-zinc-400',
    bgColor: 'bg-zinc-800',
    borderColor: 'border-zinc-700',
    bucket: 'no-action',
  },
  UNDELIVERABLE: {
    label: 'Undeliverable',
    color: 'text-red-400',
    dotColor: 'bg-red-400',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/20',
    bucket: 'denied',
  },
  SPAM_OR_IRRELEVANT: {
    label: 'Spam / Irrelevant',
    color: 'text-zinc-400',
    dotColor: 'bg-zinc-400',
    bgColor: 'bg-zinc-800',
    borderColor: 'border-zinc-700',
    bucket: 'no-action',
  },
  AMBIGUOUS: {
    label: 'Ambiguous',
    color: 'text-violet-400',
    dotColor: 'bg-violet-400',
    bgColor: 'bg-violet-500/10',
    borderColor: 'border-violet-500/20',
    bucket: 'review',
  },
}

export const BUCKET_TAGS: Record<Bucket, Tag[]> = {
  all: [],
  done: ['CONFIRMED_REMOVAL', 'CONFIRMED_NOT_FOUND'],
  'needs-action': ['NEEDS_MORE_INFO', 'NEEDS_CONFIRMATION', 'FORM_REQUIRED'],
  denied: ['DENIED_JURISDICTION', 'DENIED_FRAUD', 'DENIED_OTHER', 'UNDELIVERABLE'],
  'no-action': ['OUT_OF_OFFICE', 'SPAM_OR_IRRELEVANT'],
  review: ['AMBIGUOUS'],
}

export const STATUS_CONFIG: Record<Status, { label: string; color: string; bgColor: string; borderColor: string }> = {
  OPEN: {
    label: 'Open',
    color: 'text-zinc-400',
    bgColor: 'bg-zinc-800',
    borderColor: 'border-zinc-700',
  },
  IN_PROGRESS: {
    label: 'In Progress',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/20',
  },
  ESCALATED_TO_LEGAL: {
    label: 'Legal',
    color: 'text-violet-400',
    bgColor: 'bg-violet-500/10',
    borderColor: 'border-violet-500/20',
  },
  RESOLVED: {
    label: 'Resolved',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/20',
  },
  RE_SENT: {
    label: 'Re-sent',
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/20',
  },
}

export const STAGE_CONFIG: Record<EnforcementStage, { label: string; icon: LucideIcon; color: string; bgColor: string; borderColor: string }> = {
  request_sent: { label: 'Request Sent', icon: Send, color: 'text-zinc-400', bgColor: 'bg-zinc-500/10', borderColor: 'border-zinc-500/20' },
  deadline_approaching: { label: 'Deadline Approaching', icon: Clock, color: 'text-amber-400', bgColor: 'bg-amber-500/10', borderColor: 'border-amber-500/20' },
  deadline_passed: { label: 'Deadline Passed', icon: TriangleAlert, color: 'text-red-400', bgColor: 'bg-red-500/10', borderColor: 'border-red-500/20' },
  followup_sent: { label: 'Follow-up Sent', icon: RefreshCw, color: 'text-blue-400', bgColor: 'bg-blue-500/10', borderColor: 'border-blue-500/20' },
  complaint_eligible: { label: 'Complaint Eligible', icon: ShieldCheck, color: 'text-violet-400', bgColor: 'bg-violet-500/10', borderColor: 'border-violet-500/20' },
  complaint_filed: { label: 'Complaint Filed', icon: FileCheck2, color: 'text-emerald-400', bgColor: 'bg-emerald-500/10', borderColor: 'border-emerald-500/20' },
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

// Home-overview donut charts only. Hex pairs (not Tailwind classes) from the
// dataviz skill's validated categorical palette, in the specific order run
// through scripts/validate_palette.js for this feature (see PR notes) — the
// order is the CVD-safety mechanism, so don't reorder without re-validating.
export const BUCKET_DONUT_COLORS: Record<Exclude<Bucket, 'all'>, { light: string; dark: string }> = {
  done: { light: '#008300', dark: '#008300' },
  'needs-action': { light: '#eda100', dark: '#c98500' },
  denied: { light: '#e34948', dark: '#e66767' },
  'no-action': { light: '#2a78d6', dark: '#3987e5' },
  review: { light: '#1baf7a', dark: '#199e70' },
}

export const STAGE_DONUT_COLORS: Record<EnforcementStage, { light: string; dark: string }> = {
  request_sent: { light: '#2a78d6', dark: '#3987e5' },
  followup_sent: { light: '#1baf7a', dark: '#199e70' },
  deadline_approaching: { light: '#eda100', dark: '#c98500' },
  deadline_passed: { light: '#e34948', dark: '#e66767' },
  complaint_eligible: { light: '#4a3aa7', dark: '#9085e9' },
  complaint_filed: { light: '#008300', dark: '#008300' },
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
