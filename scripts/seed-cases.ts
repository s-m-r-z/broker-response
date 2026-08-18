import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const responses = await prisma.brokerResponse.findMany({ take: 8 })

  const cases = [
    {
      userCountry: 'US',
      userState: 'CA',
      brokerName: responses[0]?.brokerName ?? 'Acme Data Inc.',
      brokerCountry: 'US',
      removalRequestDate: new Date('2024-11-01'),
      applicableRegime: 'CCPA',
      responseDeadlineDate: new Date('2024-12-01'),
      enforcementStage: 'request_sent',
      filingAuthority: 'California Attorney General',
      complaintUrl: 'https://oag.ca.gov/privacy/ccpa',
      maxFine: '$7,500 per intentional violation',
      status: 'IN_PROGRESS',
      sourceResponseId: responses[0]?.id,
    },
    {
      userCountry: 'US',
      userState: 'CA',
      brokerName: responses[1]?.brokerName ?? 'InfoGroup',
      brokerCountry: 'US',
      removalRequestDate: new Date('2024-10-15'),
      applicableRegime: 'CCPA',
      responseDeadlineDate: new Date('2024-11-15'),
      enforcementStage: 'followup_sent',
      filingAuthority: 'California Attorney General',
      complaintUrl: 'https://oag.ca.gov/privacy/ccpa',
      maxFine: '$7,500 per intentional violation',
      jurisdictionConfirmedAt: new Date('2024-10-20'),
      status: 'DEADLINE_APPROACHING',
      sourceResponseId: responses[1]?.id,
    },
    {
      userCountry: 'GB',
      userState: null,
      brokerName: responses[2]?.brokerName ?? 'Spokeo',
      brokerCountry: 'US',
      removalRequestDate: new Date('2024-09-01'),
      applicableRegime: 'UK GDPR',
      responseDeadlineDate: new Date('2024-10-01'),
      enforcementStage: 'complaint_eligible',
      filingAuthority: 'Information Commissioner\'s Office (ICO)',
      complaintUrl: 'https://ico.org.uk/make-a-complaint/',
      maxFine: '£17.5 million or 4% of global annual turnover',
      jurisdictionConfirmedAt: new Date('2024-09-10'),
      authorityConfirmedAt: new Date('2024-09-12'),
      draftReply: 'Dear ICO, I am writing to file a complaint regarding...',
      status: 'WAITING_ON_CONFIRMATION',
      confirmationRequestedAt: new Date('2024-09-20'),
      sourceResponseId: responses[2]?.id,
    },
    {
      userCountry: 'US',
      userState: 'TX',
      brokerName: responses[3]?.brokerName ?? 'BeenVerified',
      brokerCountry: 'US',
      removalRequestDate: new Date('2024-08-01'),
      applicableRegime: 'TDPSA',
      responseDeadlineDate: new Date('2024-09-01'),
      enforcementStage: 'complaint_filed',
      filingAuthority: 'Texas Attorney General',
      complaintUrl: 'https://www.texasattorneygeneral.gov/',
      maxFine: '$7,500 per violation',
      jurisdictionConfirmedAt: new Date('2024-08-10'),
      authorityConfirmedAt: new Date('2024-08-12'),
      evidenceRequestConfirmedAt: new Date('2024-08-15'),
      evidenceIdentityConfirmedAt: new Date('2024-08-15'),
      evidenceSystemsConfirmedAt: new Date('2024-08-16'),
      evidenceReplyConfirmedAt: new Date('2024-08-16'),
      evidenceRetentionConfirmedAt: new Date('2024-08-17'),
      evidenceRetentionNote: 'No retention exception applies.',
      draftReply: 'Dear Texas AG, I am filing this complaint...',
      approvedDraftText: 'Dear Texas AG, I am filing this complaint...',
      approvedBy: 'Compliance Team',
      approvedAt: new Date('2024-08-18'),
      status: 'COMPLETE',
      sourceResponseId: responses[3]?.id,
    },
    {
      userCountry: 'DE',
      userState: null,
      brokerName: responses[4]?.brokerName ?? 'Whitepages',
      brokerCountry: 'US',
      removalRequestDate: new Date('2024-11-10'),
      applicableRegime: 'GDPR',
      responseDeadlineDate: new Date('2024-12-10'),
      enforcementStage: 'request_sent',
      filingAuthority: 'Bundesbeauftragte für den Datenschutz (BfDI)',
      complaintUrl: 'https://www.bfdi.bund.de/EN/Service/Complaints/complaints_node.html',
      maxFine: '€20 million or 4% of global annual turnover',
      status: 'IN_PROGRESS',
      sourceResponseId: responses[4]?.id,
    },
  ]

  for (const c of cases) {
    await prisma.case.create({ data: c })
  }

  console.log(`Seeded ${cases.length} cases.`)
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
