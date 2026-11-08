import type { VercelRequest, VercelResponse } from '@vercel/node'
import nodemailer from 'nodemailer'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { name, email, message } = req.body || {}

  if (!name?.trim() || !email?.trim() || !message?.trim()) {
    return res.status(400).json({ error: 'Name, email, and message are required.' })
  }

  const gmailUser = process.env.GMAIL_USER
  const gmailPass = process.env.GMAIL_APP_PASSWORD
  const recipient = process.env.CONTACT_TO_EMAIL || gmailUser

  if (!gmailUser || !gmailPass) {
    console.log('[Vercel Contact Form] Missing Gmail credentials in env:', { name, email })
    return res.status(200).json({
      success: true,
      message: 'Message received! (Note: Configure GMAIL_USER and GMAIL_APP_PASSWORD in Vercel project environment variables)',
    })
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: gmailUser,
        pass: gmailPass,
      },
    })

    await transporter.sendMail({
      from: `"${name}" <${gmailUser}>`,
      replyTo: email,
      to: recipient,
      subject: `New Portfolio Message from ${name}`,
      text: `You received a new message from your portfolio contact form:\n\nName: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
      html: `
        <div style="font-family: sans-serif; line-height: 1.6; color: #1A1A1A; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #E5E7EB; border-radius: 12px;">
          <h2 style="margin-top: 0; color: #111;">New Portfolio Contact Message</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
          <div style="margin-top: 20px; padding: 16px; background: #F9FAFB; border-radius: 8px;">
            <p style="margin: 0; white-space: pre-wrap;">${message}</p>
          </div>
          <p style="font-size: 12px; color: #6B7280; margin-top: 24px;">Click "Reply" to respond directly to ${email}.</p>
        </div>
      `,
    })

    return res.status(200).json({ success: true, message: 'Message sent successfully!' })
  } catch (error: any) {
    console.error('[Vercel Contact Form Error]', error)
    return res.status(500).json({ error: error.message || 'Failed to send email.' })
  }
}
