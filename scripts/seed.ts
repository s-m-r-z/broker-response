import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const BROKERS = [
  { name: 'Acme Data Inc.', email: 'privacy@acmedata.com' },
  { name: 'InfoGroup', email: 'opt-out@infogroup.com' },
  { name: 'Spokeo', email: 'privacy@spokeo.com' },
  { name: 'BeenVerified', email: 'removal@beenverified.com' },
  { name: 'Whitepages', email: 'support@whitepages.com' },
  { name: 'Intelius', email: 'privacy@intelius.com' },
  { name: 'PeopleFinder', email: 'optout@peoplefinder.com' },
  { name: 'US Search', email: 'privacy@ussearch.com' },
  { name: 'ZoomInfo', email: 'privacy@zoominfo.com' },
  { name: 'LexisNexis', email: 'consumer@lexisnexis.com' },
]

const SAMPLES = [
  {
    tag: 'CONFIRMED_REMOVAL',
    tier: 'tier_2',
    content:
      'Thank you for contacting us. We have successfully processed your data removal request. The associated records have been permanently deleted from our systems. You will not appear in future searches.',
  },
  {
    tag: 'CONFIRMED_NOT_FOUND',
    tier: 'tier_2',
    content:
      'We have searched our database and were unable to locate any records matching the details you provided. No action was required on our end.',
  },
  {
    tag: 'NEEDS_MORE_INFO',
    tier: 'tier_2',
    content:
      'In order to process your request, we require additional information. Please provide a government-issued ID or additional verification details so we can locate the correct record.',
  },
  {
    tag: 'NEEDS_CONFIRMATION',
    tier: 'tier_2',
    content:
      'We have received your removal request. To proceed, please confirm your identity by clicking the verification link sent to the email address on file.',
  },
  {
    tag: 'FORM_REQUIRED',
    tier: 'tier_2',
    content:
      'Our data removal process requires you to submit a formal request through our official portal. Please visit our privacy portal at privacy.example.com to complete the form.',
  },
  {
    tag: 'DENIED_JURISDICTION',
    tier: 'tier_2',
    content:
      'After reviewing your request, we have determined that it falls outside the jurisdiction covered by our data removal policy. We are not required to comply with this request under applicable law.',
  },
  {
    tag: 'DENIED_FRAUD',
    tier: 'tier_2',
    content:
      'Your data removal request has been flagged as potentially fraudulent. We are unable to process this request at this time. If you believe this is an error, please contact our compliance team with valid identification.',
  },
  {
    tag: 'DENIED_OTHER',
    tier: 'tier_3',
    content:
      'We have reviewed your data removal request and are unable to fulfil it at this time. Please refer to our privacy policy for more information on your rights and our obligations.',
  },
  {
    tag: 'OUT_OF_OFFICE',
    tier: 'tier_1',
    content:
      'I am currently out of the office until [date] with limited access to email. Your request has been received and will be reviewed upon my return. For urgent matters, please contact our support team.',
  },
  {
    tag: 'UNDELIVERABLE',
    tier: 'tier_1',
    content:
      'Message undeliverable. The recipient mailbox does not exist or is full. Please check the address and try again.',
  },
  {
    tag: 'SPAM_OR_IRRELEVANT',
    tier: 'tier_1',
    content:
      'Thank you for subscribing to our newsletter! We will keep you updated with the latest news and promotions.',
  },
  {
    tag: 'AMBIGUOUS',
    tier: 'tier_2',
    content:
      'We acknowledge your request and will look into it. Our team will be in touch. Thank you for reaching out.',
  },
]

async function main() {
  console.log('Seeding database…')

  await prisma.actionLog.deleteMany()
  await prisma.brokerResponse.deleteMany()

  for (let i = 0; i < 60; i++) {
    const broker = BROKERS[i % BROKERS.length]
    const sample = SAMPLES[i % SAMPLES.length]
    const daysAgo = Math.floor(Math.random() * 14)
    const createdAt = new Date(Date.now() - daysAgo * 86400000)

    await prisma.brokerResponse.create({
      data: {
        brokerName: broker.name,
        brokerEmail: broker.email,
        responseContent: sample.content,
        tag: sample.tag,
        tier: sample.tier,
        status: 'OPEN',
        createdAt,
      },
    })
  }

  const count = await prisma.brokerResponse.count()
  console.log(`Done — ${count} responses seeded.`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
