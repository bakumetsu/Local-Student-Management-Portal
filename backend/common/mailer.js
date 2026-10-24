// common/mailer.js
// Gửi email qua SMTP bằng Nodemailer (thay cho Amazon SES).
// Nếu chưa cấu hình SMTP_HOST, email được ghi vào log + data/logs/outbox.log
// để vẫn xem được nội dung (vd. mật khẩu tạm, mã OTP) khi chạy offline.
import fs from 'node:fs'
import path from 'node:path'
import nodemailer from 'nodemailer'
import config from './config.js'

const outboxFile = path.join(config.logDir, 'outbox.log')
let transporter = null

function getTransporter() {
  if (!config.mail.host) return null
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: config.mail.host,
      port: config.mail.port,
      secure: config.mail.secure,
      auth: config.mail.user ? { user: config.mail.user, pass: config.mail.pass } : undefined
    })
  }
  return transporter
}

export const FROM_EMAIL = config.mail.from

export async function sendEmail(to, subject, bodyText) {
  const smtp = getTransporter()
  if (smtp) {
    return smtp.sendMail({ from: config.mail.from, to, subject, text: bodyText })
  }
  const entry = `--- ${new Date().toISOString()}\nTo: ${to}\nSubject: ${subject}\n\n${bodyText}\n\n`
  await fs.promises.appendFile(outboxFile, entry)
  console.log(`📧 [outbox] Email tới ${to}: "${subject}" (chưa cấu hình SMTP, xem data/logs/outbox.log)`)
  return { outbox: true }
}

export default { sendEmail, FROM_EMAIL }
