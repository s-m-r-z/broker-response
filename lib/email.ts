import nodemailer from 'nodemailer'

export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST ?? 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT ?? 587),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

export interface SendEmailOptions {
  to: string
  subject: string
  body: string
}

export async function sendEmail({ to, subject, body }: SendEmailOptions) {
  return transporter.sendMail({
    from: `"PureWL Compliance" <${process.env.SMTP_FROM}>`,
    to,
    subject,
    text: body,
    html: body.replace(/\n/g, '<br/>'),
  })
}
