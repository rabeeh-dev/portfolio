import { useState } from 'react'
import { Card } from '@/components/Card'
import { FadeIn } from '@/components/FadeIn'
import { sendMessage } from '@/lib/api'
import type { Settings } from '@/lib/types'

interface ContactProps {
  settings: Settings
}

export function Contact({ settings }: ContactProps) {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const validate = () => {
    if (!form.name.trim()) return 'Name is required'
    if (!form.email.trim()) return 'Email is required'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return 'Invalid email format'
    if (!form.message.trim()) return 'Message is required'
    if (form.message.trim().length < 10) return 'Message must be at least 10 characters'
    return ''
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const validationError = validate()
    if (validationError) {
      setError(validationError)
      return
    }

    setSending(true)
    try {
      await sendMessage(form)
      setSent(true)
      setForm({ name: '', email: '', message: '' })
    } catch (err: any) {
      setError(err?.message || 'Failed to send message. Please try again.')
    } finally {
      setSending(false)
    }
  }

  return (
    <FadeIn>
      <Card id="contact">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-light text-heading-light dark:text-heading-dark tracking-tight mb-8">
          Let's work together
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div>
            {sent ? (
              <div className="bg-accent/10 text-accent rounded-2xl p-6 text-center">
                <p className="font-medium mb-1">Message sent!</p>
                <p className="text-sm opacity-80">I'll get back to you soon.</p>
                <button
                  onClick={() => setSent(false)}
                  className="mt-4 text-sm underline opacity-70 hover:opacity-100"
                >
                  Send another
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="text"
                  placeholder="Your name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl bg-page-light dark:bg-page-dark border-0 text-heading-light dark:text-heading-dark placeholder:text-body-light/50 dark:placeholder:text-body-dark/50 text-sm focus:outline-none focus:ring-2 focus:ring-heading-light/20 dark:focus:ring-heading-dark/20"
                />
                <input
                  type="email"
                  placeholder="Your email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl bg-page-light dark:bg-page-dark border-0 text-heading-light dark:text-heading-dark placeholder:text-body-light/50 dark:placeholder:text-body-dark/50 text-sm focus:outline-none focus:ring-2 focus:ring-heading-light/20 dark:focus:ring-heading-dark/20"
                />
                <textarea
                  placeholder="Your message"
                  rows={4}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl bg-page-light dark:bg-page-dark border-0 text-heading-light dark:text-heading-dark placeholder:text-body-light/50 dark:placeholder:text-body-dark/50 text-sm focus:outline-none focus:ring-2 focus:ring-heading-light/20 dark:focus:ring-heading-dark/20 resize-none"
                />
                {error && <p className="text-red-500 text-sm">{error}</p>}
                <button
                  type="submit"
                  disabled={sending}
                  className="px-8 py-3 rounded-full bg-heading-light dark:bg-heading-dark text-white dark:text-page-dark text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {sending ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            )}
          </div>

          <div className="space-y-6">
            {settings.email && (
              <div>
                <p className="text-sm text-body-light dark:text-body-dark mb-1">Email</p>
                <a
                  href={`mailto:${settings.email}`}
                  className="text-heading-light dark:text-heading-dark text-sm hover:opacity-70 transition-opacity"
                >
                  {settings.email}
                </a>
              </div>
            )}
            <div>
              <p className="text-sm text-body-light dark:text-body-dark mb-3">Social</p>
              <div className="flex flex-wrap gap-3">
                {settings.social_github && (
                  <a href={settings.social_github} target="_blank" rel="noopener noreferrer" className="px-4 py-2 rounded-full border border-gray-200 dark:border-gray-700 text-sm text-heading-light dark:text-heading-dark hover:bg-page-light dark:hover:bg-page-dark transition-colors">
                    GitHub
                  </a>
                )}
                {/* {settings.social_x && (
                  <a href={settings.social_x} target="_blank" rel="noopener noreferrer" className="px-4 py-2 rounded-full border border-gray-200 dark:border-gray-700 text-sm text-heading-light dark:text-heading-dark hover:bg-page-light dark:hover:bg-page-dark transition-colors">
                    X
                  </a>
                )} */}
                {settings.social_linkedin && (
                  <a href={settings.social_linkedin} target="_blank" rel="noopener noreferrer" className="px-4 py-2 rounded-full border border-gray-200 dark:border-gray-700 text-sm text-heading-light dark:text-heading-dark hover:bg-page-light dark:hover:bg-page-dark transition-colors">
                    LinkedIn
                  </a>
                )}
                {settings.social_instagram && (
                  <a href={settings.social_instagram} target="_blank" rel="noopener noreferrer" className="px-4 py-2 rounded-full border border-gray-200 dark:border-gray-700 text-sm text-heading-light dark:text-heading-dark hover:bg-page-light dark:hover:bg-page-dark transition-colors">
                    Instagram
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </Card>
    </FadeIn>
  )
}
