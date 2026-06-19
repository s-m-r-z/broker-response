import { type Tag, type Bucket, type Status } from './types'

export const TAG_CONFIG: Record<Tag, {
  label: string
  color: string
  bgColor: string
  borderColor: string
  bucket: Bucket
}> = {
  CONFIRMED_REMOVAL: {
    label: 'Confirmed Removal',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/20',
    bucket: 'done',
  },
  CONFIRMED_NOT_FOUND: {
    label: 'Confirmed Not Found',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/20',
    bucket: 'done',
  },
  NEEDS_MORE_INFO: {
    label: 'Needs More Info',
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/20',
    bucket: 'needs-action',
  },
  NEEDS_CONFIRMATION: {
    label: 'Needs Confirmation',
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/20',
    bucket: 'needs-action',
  },
  FORM_REQUIRED: {
    label: 'Form Required',
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/20',
    bucket: 'needs-action',
  },
  DENIED_JURISDICTION: {
    label: 'Denied: Jurisdiction',
    color: 'text-red-400',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/20',
    bucket: 'denied',
  },
  DENIED_FRAUD: {
    label: 'Denied: Fraud',
    color: 'text-red-400',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/20',
    bucket: 'denied',
  },
  DENIED_OTHER: {
    label: 'Denied: Other',
    color: 'text-red-400',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/20',
    bucket: 'denied',
  },
  OUT_OF_OFFICE: {
    label: 'Out of Office',
    color: 'text-zinc-400',
    bgColor: 'bg-zinc-800',
    borderColor: 'border-zinc-700',
    bucket: 'no-action',
  },
  UNDELIVERABLE: {
    label: 'Undeliverable',
    color: 'text-red-400',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/20',
    bucket: 'denied',
  },
  SPAM_OR_IRRELEVANT: {
    label: 'Spam / Irrelevant',
    color: 'text-zinc-400',
    bgColor: 'bg-zinc-800',
    borderColor: 'border-zinc-700',
    bucket: 'no-action',
  },
  AMBIGUOUS: {
    label: 'Ambiguous',
    color: 'text-violet-400',
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
