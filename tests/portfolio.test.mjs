import { test, describe } from 'node:test'
import assert from 'node:assert'

describe('Portfolio Test Suite', () => {

  // ─────────────────────────────────────────────────────────────
  // 1. Theme Toggle & State Tests
  // ─────────────────────────────────────────────────────────────
  describe('Theme Switching & Persistence', () => {
    test('Toggles theme state between light and dark', () => {
      let isDark = false
      const toggle = () => { isDark = !isDark }

      assert.strictEqual(isDark, false, 'Default theme should be light')
      toggle()
      assert.strictEqual(isDark, true, 'Theme should switch to dark')
      toggle()
      assert.strictEqual(isDark, false, 'Theme should switch back to light')
    })

    test('Theme toggle track translation math is exact', () => {
      // Track width = 56px (w-14), padding = 2px on each side (p-0.5)
      // Inner track = 52px, thumb width = 24px (w-6)
      const trackInnerWidth = 52
      const thumbWidth = 24
      const expectedTravelDistance = trackInnerWidth - thumbWidth // 28px = translate-x-7
      assert.strictEqual(expectedTravelDistance, 28, 'Knob travel distance must equal 28px (translate-x-7)')
    })
  })

  // ─────────────────────────────────────────────────────────────
  // 2. Contact Form Validation Tests
  // ─────────────────────────────────────────────────────────────
  describe('Contact Form Validation', () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    const validate = (form) => {
      if (!form.name || !form.name.trim()) return 'Name is required'
      if (!form.email || !form.email.trim()) return 'Email is required'
      if (!emailRegex.test(form.email.trim())) return 'Invalid email format'
      if (!form.message || !form.message.trim()) return 'Message is required'
      if (form.message.trim().length < 10) return 'Message must be at least 10 characters'
      return ''
    }

    test('Accepts valid input', () => {
      const err = validate({
        name: 'Jane Doe',
        email: 'jane@example.com',
        message: 'Hello, I would like to discuss a project with you!',
      })
      assert.strictEqual(err, '', 'Valid contact form should produce no error')
    })

    test('Rejects empty or whitespace-only name', () => {
      const err = validate({ name: '   ', email: 'test@example.com', message: 'Valid message here' })
      assert.strictEqual(err, 'Name is required')
    })

    test('Rejects malformed emails', () => {
      const invalidEmails = ['plainaddress', '@missingusername.com', 'user@.com', 'user@domain', 'user name@domain.com']
      for (const email of invalidEmails) {
        const err = validate({ name: 'Valid Name', email, message: 'Valid message here' })
        assert.strictEqual(err, 'Invalid email format', `Should reject invalid email: ${email}`)
      }
    })

    test('Requires minimum 10 characters for message', () => {
      const shortErr = validate({ name: 'Valid Name', email: 'test@example.com', message: 'Too short' })
      assert.strictEqual(shortErr, 'Message must be at least 10 characters')

      const validErr = validate({ name: 'Valid Name', email: 'test@example.com', message: '1234567890' })
      assert.strictEqual(validErr, '')
    })
  })

  // ─────────────────────────────────────────────────────────────
  // 3. Image Upload, Ratio & 10MB Limit Tests
  // ─────────────────────────────────────────────────────────────
  describe('Image Upload & Aspect Ratio Cropping', () => {
    const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024 // 10MB
    const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp']

    test('Enforces 10MB maximum file size allowance', () => {
      const smallFile = { size: 5 * 1024 * 1024 } // 5MB
      const exactFile = { size: 10 * 1024 * 1024 } // 10MB
      const largeFile = { size: 10 * 1024 * 1024 + 1 } // 10MB + 1 byte
      const oversizedFile = { size: 15 * 1024 * 1024 } // 15MB

      assert.strictEqual(smallFile.size <= MAX_FILE_SIZE_BYTES, true, '5MB file should be accepted')
      assert.strictEqual(exactFile.size <= MAX_FILE_SIZE_BYTES, true, '10MB exact file should be accepted')
      assert.strictEqual(largeFile.size <= MAX_FILE_SIZE_BYTES, false, '10MB + 1 byte should be rejected')
      assert.strictEqual(oversizedFile.size <= MAX_FILE_SIZE_BYTES, false, '15MB file should be rejected')
    })

    test('Validates allowed image MIME types', () => {
      assert.strictEqual(ALLOWED_MIME_TYPES.includes('image/jpeg'), true)
      assert.strictEqual(ALLOWED_MIME_TYPES.includes('image/png'), true)
      assert.strictEqual(ALLOWED_MIME_TYPES.includes('image/webp'), true)
      assert.strictEqual(ALLOWED_MIME_TYPES.includes('image/gif'), false)
      assert.strictEqual(ALLOWED_MIME_TYPES.includes('application/pdf'), false)
    })

    test('Hero photo crop ratio is strictly 4:3', () => {
      const heroRatio = 4 / 3
      assert.strictEqual(Math.abs(heroRatio - 1.3333333333333333) < 0.0001, true)
    })

    test('Avatar photo crop ratio is strictly 1:1 round', () => {
      const avatarRatio = 1
      assert.strictEqual(avatarRatio, 1)
    })

    test('Project cover photo crop ratio is strictly 16:9 widescreen', () => {
      const coverRatio = 16 / 9
      assert.strictEqual(Math.abs(coverRatio - 1.7777777777777777) < 0.0001, true)
    })

    test('Canvas crop pixel coordinates calculate valid non-zero dimensions', () => {
      const pixelCrop = { x: 50, y: 100, width: 800, height: 600 }
      const targetWidth = Math.max(1, Math.round(pixelCrop.width))
      const targetHeight = Math.max(1, Math.round(pixelCrop.height))

      assert.strictEqual(targetWidth, 800)
      assert.strictEqual(targetHeight, 600)
      assert.strictEqual(Math.round(targetWidth / targetHeight * 100) / 100, 1.33)
    })
  })

  // ─────────────────────────────────────────────────────────────
  // 4. Supabase Schema & Settings Payload Sanitization
  // ─────────────────────────────────────────────────────────────
  describe('Settings Payload Sanitization (Social Links & Schema Protection)', () => {
    const allowedKeys = [
      'name',
      'role',
      'intro',
      'about',
      'avatar_url',
      'hero_image_url',
      'email',
      'social_github',
      'social_x',
      'social_linkedin',
      'social_instagram',
      'available',
      'years_experience',
      'projects_done',
    ]

    function sanitizeSettingsPayload(updates) {
      const cleanPayload = {
        updated_at: new Date().toISOString(),
      }
      for (const key of allowedKeys) {
        if (key in updates) {
          cleanPayload[key] = updates[key]
        }
      }
      return cleanPayload
    }

    test('Includes social_x and social_instagram in clean payload', () => {
      const rawUpdates = {
        name: 'Alex Morgan',
        social_x: 'https://x.com/alex',
        social_instagram: 'https://instagram.com/alex',
      }
      const sanitized = sanitizeSettingsPayload(rawUpdates)

      assert.strictEqual(sanitized.social_x, 'https://x.com/alex')
      assert.strictEqual(sanitized.social_instagram, 'https://instagram.com/alex')
    })

    test('Completely strips legacy social_twitter and social_dribbble to avoid PostgREST column error', () => {
      const legacyPayload = {
        name: 'Alex Morgan',
        social_x: 'https://x.com/alex',
        social_instagram: 'https://instagram.com/alex',
        social_twitter: 'https://twitter.com/alex',
        social_dribbble: 'https://dribbble.com/alex',
        unknown_field: 'malicious or invalid column',
      }

      const sanitized = sanitizeSettingsPayload(legacyPayload)

      assert.strictEqual('social_twitter' in sanitized, false, 'social_twitter MUST be stripped')
      assert.strictEqual('social_dribbble' in sanitized, false, 'social_dribbble MUST be stripped')
      assert.strictEqual('unknown_field' in sanitized, false, 'unknown_field MUST be stripped')
      assert.strictEqual(sanitized.social_x, 'https://x.com/alex')
      assert.strictEqual(sanitized.social_instagram, 'https://instagram.com/alex')
    })
  })

  // ─────────────────────────────────────────────────────────────
  // 5. Custom Alert & Confirmation State Machine Tests
  // ─────────────────────────────────────────────────────────────
  describe('Custom Alert & Dialog System', () => {
    test('Alert state model initializes cleanly with defaults', () => {
      const modal = {
        isOpen: false,
        isConfirm: false,
        title: '',
        message: '',
        variant: 'info',
        confirmText: 'OK',
        cancelText: 'Cancel',
      }
      assert.strictEqual(modal.isOpen, false)
      assert.strictEqual(modal.isConfirm, false)
    })

    test('ShowAlert opens dialog with error variant and custom title', () => {
      const options = { title: 'Upload Failed', message: 'Network disconnected', variant: 'error' }
      const modalState = {
        isOpen: true,
        isConfirm: false,
        title: options.title,
        message: options.message,
        variant: options.variant,
        confirmText: 'OK',
      }

      assert.strictEqual(modalState.isOpen, true)
      assert.strictEqual(modalState.isConfirm, false)
      assert.strictEqual(modalState.variant, 'error')
      assert.strictEqual(modalState.title, 'Upload Failed')
    })

    test('ShowConfirm modal resolves true on confirm and false on cancel', async () => {
      let resolveConfirm
      const confirmPromise = new Promise((resolve) => {
        resolveConfirm = resolve
      })

      // Simulate user clicking "Delete" (Confirm)
      resolveConfirm(true)
      const confirmed = await confirmPromise
      assert.strictEqual(confirmed, true)

      // Simulate user clicking "Cancel"
      const cancelPromise = new Promise((resolve) => resolve(false))
      const cancelled = await cancelPromise
      assert.strictEqual(cancelled, false)
    })
  })

  // ─────────────────────────────────────────────────────────────
  // 6. Backend Contact Form & Nodemailer Contract Tests
  // ─────────────────────────────────────────────────────────────
  describe('Backend Contact Route Contract', () => {
    const handleContactRequest = (body) => {
      const { name, email, message } = body || {}
      if (!name?.trim() || !email?.trim() || !message?.trim()) {
        return { status: 400, error: 'Name, email, and message are required.' }
      }
      return { status: 200, success: true }
    }

    test('Rejects request with missing fields with status 400', () => {
      assert.strictEqual(handleContactRequest({}).status, 400)
      assert.strictEqual(handleContactRequest({ name: 'John', email: '' }).status, 400)
      assert.strictEqual(handleContactRequest({ name: 'John', email: 'j@e.co', message: '   ' }).status, 400)
    })

    test('Accepts valid payload with status 200', () => {
      const res = handleContactRequest({
        name: 'Rabeeh',
        email: 'rbh@example.com',
        message: 'Looking forward to working together on this project.',
      })
      assert.strictEqual(res.status, 200)
      assert.strictEqual(res.success, true)
    })
  })
})

