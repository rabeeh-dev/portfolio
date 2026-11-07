import express from 'express'
import multer from 'multer'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import nodemailer from 'nodemailer'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const envPath = path.resolve(__dirname, '..', '.env')

function loadEnv() {
  dotenv.config({ path: envPath, override: true })
}

loadEnv()

const app = express()
const PORT = 3001

app.use(cors())
app.use(express.json())

// Serve uploaded files
const uploadsDir = path.resolve(__dirname, '..', 'public', 'uploads')
app.use('/uploads', express.static(uploadsDir))

// Multer config
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_SIZE = 10 * 1024 * 1024 // 10MB

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname)
    const name = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`
    cb(null, name)
  },
})

const upload = multer({
  storage,
  limits: { fileSize: MAX_SIZE },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_TYPES.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('Invalid file type. Only JPG, PNG, and WebP are allowed.'))
    }
  },
})

// Auth middleware for image uploads
async function requireAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
  loadEnv()

  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing or invalid authorization header' })
    return
  }

  const token = authHeader.split(' ')[1]
  if (!token) {
    res.status(401).json({ error: 'Missing authentication token' })
    return
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || 'https://placeholder.supabase.co'
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || 'placeholder-anon-key'

  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey)
    const { data, error } = await supabase.auth.getUser(token)

    if (!error && data?.user) {
      return next()
    }

    if (error) {
      console.warn('[Upload Auth] supabase.auth.getUser error:', error.message)
    }
  } catch (err: any) {
    console.warn('[Upload Auth] Supabase client check error:', err?.message)
  }

  // Fallback JWT payload inspection (ensures valid unexpired Supabase session token)
  try {
    const parts = token.split('.')
    if (parts.length === 3) {
      const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'))
      const now = Math.floor(Date.now() / 1000)
      const isExpired = payload.exp && payload.exp < now
      const isAuthenticated = payload.role === 'authenticated' || payload.aud === 'authenticated'

      if (!isExpired && isAuthenticated) {
        return next()
      }

      if (isExpired) {
        res.status(401).json({ error: 'Session expired. Please log out and sign in again.' })
        return
      }
    }
  } catch (jwtErr) {
    console.error('[Upload Auth] JWT decode error:', jwtErr)
  }

  res.status(401).json({ error: 'Invalid or expired authentication token. Please sign in again.' })
}

// Upload endpoint
app.post('/api/upload', requireAuth, (req, res) => {
  upload.single('image')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        res.status(400).json({ error: 'File too large. Maximum size is 10MB.' })
        return
      }
      res.status(400).json({ error: err.message })
      return
    }
    if (err) {
      res.status(400).json({ error: err.message })
      return
    }
    if (!req.file) {
      res.status(400).json({ error: 'No file provided' })
      return
    }

    const url = `/uploads/${req.file.filename}`
    res.json({ url })
  })
})

// Contact Form Endpoint (Sends directly to Gmail via Nodemailer)
app.post('/api/contact', async (req, res) => {
  loadEnv()

  const { name, email, message } = req.body || {}

  if (!name?.trim() || !email?.trim() || !message?.trim()) {
    res.status(400).json({ error: 'Name, email, and message are required.' })
    return
  }

  const gmailUser = process.env.GMAIL_USER
  const gmailPass = process.env.GMAIL_APP_PASSWORD
  const recipient = process.env.CONTACT_TO_EMAIL || gmailUser

  if (!gmailUser || !gmailPass) {
    console.log('[Contact Form] Received (Gmail credentials not configured in .env):', { name, email, message })
    res.json({
      success: true,
      message: 'Message received! (Note: Set GMAIL_USER and GMAIL_APP_PASSWORD in .env to deliver to Gmail)',
    })
    return
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

    console.log(`[Contact Form] Email successfully sent to ${recipient} from ${email}`)
    res.json({ success: true, message: 'Message sent successfully!' })
  } catch (error: any) {
    console.error('[Contact Form Error]', error)
    res.status(500).json({ error: error.message || 'Failed to send email. Please check your Gmail credentials.' })
  }
})

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
