import { useState, useEffect } from 'react'
import { Card } from '@/components/Card'
import { Loading } from '@/components/Loading'
import { ImageUpload } from '@/components/ImageUpload'
import { getSettings, updateSettings } from '@/lib/api'
import type { Settings as SettingsType } from '@/lib/types'

export function AdminSettings() {
  const [settings, setSettings] = useState<SettingsType | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    getSettings()
      .then((data) => {
        if (data) setSettings(data)
      })
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    if (!settings) return
    setSaving(true)
    setMessage('')
    try {
      const updated = await updateSettings(settings)
      setSettings(updated)
      setMessage('Settings saved!')
      setTimeout(() => setMessage(''), 3000)
    } catch (err: any) {
      setMessage(`Error: ${err.message}`)
    } finally {
      setSaving(false)
    }
  }

  const update = (field: keyof SettingsType, value: any) => {
    if (settings) setSettings({ ...settings, [field]: value })
  }

  if (loading) return <Loading />
  if (!settings) return <p className="text-body-light p-6">No settings found.</p>

  return (
    <div className="space-y-3">
      <Card>
        <h2 className="text-xl font-medium text-heading-light dark:text-heading-dark mb-6">
          Site Settings
        </h2>

        <div className="space-y-5 max-w-2xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-heading-light dark:text-heading-dark mb-1">Name</label>
              <input
                value={settings.name}
                onChange={(e) => update('name', e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl bg-page-light dark:bg-page-dark text-heading-light dark:text-heading-dark text-sm focus:outline-none focus:ring-2 focus:ring-heading-light/20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-heading-light dark:text-heading-dark mb-1">Role</label>
              <input
                value={settings.role}
                onChange={(e) => update('role', e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl bg-page-light dark:bg-page-dark text-heading-light dark:text-heading-dark text-sm focus:outline-none focus:ring-2 focus:ring-heading-light/20"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-heading-light dark:text-heading-dark mb-1">Intro</label>
            <textarea
              value={settings.intro}
              onChange={(e) => update('intro', e.target.value)}
              rows={3}
              className="w-full px-4 py-2.5 rounded-2xl bg-page-light dark:bg-page-dark text-heading-light dark:text-heading-dark text-sm focus:outline-none focus:ring-2 focus:ring-heading-light/20 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-heading-light dark:text-heading-dark mb-1">About</label>
            <textarea
              value={settings.about}
              onChange={(e) => update('about', e.target.value)}
              rows={5}
              className="w-full px-4 py-2.5 rounded-2xl bg-page-light dark:bg-page-dark text-heading-light dark:text-heading-dark text-sm focus:outline-none focus:ring-2 focus:ring-heading-light/20 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-heading-light dark:text-heading-dark mb-1">Email</label>
            <input
              type="email"
              value={settings.email}
              onChange={(e) => update('email', e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl bg-page-light dark:bg-page-dark text-heading-light dark:text-heading-dark text-sm focus:outline-none focus:ring-2 focus:ring-heading-light/20"
            />
          </div>

          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-heading-light dark:text-heading-dark">Available for work</label>
            <button
              type="button"
              onClick={() => update('available', !settings.available)}
              className={`relative w-12 h-6 rounded-full transition-colors ${settings.available ? 'bg-accent' : 'bg-gray-300 dark:bg-gray-600'}`}
            >
              <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${settings.available ? 'left-[26px]' : 'left-0.5'}`} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-heading-light dark:text-heading-dark mb-1">Years of Experience</label>
              <input
                type="number"
                value={settings.years_experience || ''}
                onChange={(e) => update('years_experience', e.target.value ? parseInt(e.target.value) : null)}
                className="w-full px-4 py-2.5 rounded-2xl bg-page-light dark:bg-page-dark text-heading-light dark:text-heading-dark text-sm focus:outline-none focus:ring-2 focus:ring-heading-light/20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-heading-light dark:text-heading-dark mb-1">Projects Done</label>
              <input
                type="number"
                value={settings.projects_done || ''}
                onChange={(e) => update('projects_done', e.target.value ? parseInt(e.target.value) : null)}
                className="w-full px-4 py-2.5 rounded-2xl bg-page-light dark:bg-page-dark text-heading-light dark:text-heading-dark text-sm focus:outline-none focus:ring-2 focus:ring-heading-light/20"
              />
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <h3 className="text-lg font-medium text-heading-light dark:text-heading-dark mb-4">Images</h3>
        <div className="flex flex-wrap gap-8">
          <ImageUpload
            label="Avatar"
            value={settings.avatar_url}
            onChange={(url) => update('avatar_url', url || null)}
            aspectRatio={1}
            cropShape="round"
            helpText="1:1 square or circular avatar"
          />
          <ImageUpload
            label="Hero Photo"
            value={settings.hero_image_url}
            onChange={(url) => update('hero_image_url', url || null)}
            aspectRatio={4 / 3}
            helpText="4:3 hero ratio recommended"
          />
        </div>
      </Card>

      <Card>
        <h3 className="text-lg font-medium text-heading-light dark:text-heading-dark mb-4">Social Links</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
          {[
            { key: 'social_github' as const, label: 'GitHub', placeholder: 'https://github.com/username' },
            { key: 'social_x' as const, label: 'X', placeholder: 'https://x.com/username' },
            { key: 'social_linkedin' as const, label: 'LinkedIn', placeholder: 'https://linkedin.com/in/username' },
            { key: 'social_instagram' as const, label: 'Instagram', placeholder: 'https://instagram.com/username' },
          ].map(({ key, label, placeholder }) => (
            <div key={key}>
              <label className="block text-sm font-medium text-heading-light dark:text-heading-dark mb-1">
                {label}
              </label>
              <input
                value={settings[key] || ''}
                onChange={(e) => update(key, e.target.value || null)}
                placeholder={placeholder}
                className="w-full px-4 py-2.5 rounded-2xl bg-page-light dark:bg-page-dark text-heading-light dark:text-heading-dark text-sm focus:outline-none focus:ring-2 focus:ring-heading-light/20"
              />
            </div>
          ))}
        </div>
      </Card>

      <div className="flex items-center gap-4">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-8 py-3 rounded-full bg-heading-light dark:bg-heading-dark text-white dark:text-page-dark text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
        {message && (
          <span className={`text-sm ${message.startsWith('Error') ? 'text-red-500' : 'text-accent'}`}>
            {message}
          </span>
        )}
      </div>
    </div>
  )
}
