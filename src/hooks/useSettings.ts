import { useState, useEffect } from 'react'
import { getSettings, SEED_SETTINGS } from '@/lib/api'
import type { Settings } from '@/lib/types'

export const DEFAULT_SETTINGS: Settings = {
  ...SEED_SETTINGS,
  name: 'Rabeeh',
}

const SETTINGS_CACHE_KEY = 'portfolio_cached_settings'

function getInitialSettings(): Settings {
  if (typeof window !== 'undefined') {
    try {
      const cached = localStorage.getItem(SETTINGS_CACHE_KEY)
      if (cached) {
        const parsed = JSON.parse(cached)
        if (parsed && typeof parsed === 'object') {
          return { ...DEFAULT_SETTINGS, ...parsed }
        }
      }
    } catch {
      // Ignore parse/storage errors
    }
  }
  return DEFAULT_SETTINGS
}

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(getInitialSettings)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getSettings()
      .then((data) => {
        const resolved = data ? { ...DEFAULT_SETTINGS, ...data } : DEFAULT_SETTINGS
        setSettings(resolved)
        try {
          localStorage.setItem(SETTINGS_CACHE_KEY, JSON.stringify(resolved))
        } catch {
          // Ignore storage quota errors
        }
      })
      .catch(() => setSettings(DEFAULT_SETTINGS))
      .finally(() => setLoading(false))
  }, [])

  return {
    settings,
    loading,
    refetch: () =>
      getSettings().then((data) => {
        if (data) {
          const resolved = { ...DEFAULT_SETTINGS, ...data }
          setSettings(resolved)
          try {
            localStorage.setItem(SETTINGS_CACHE_KEY, JSON.stringify(resolved))
          } catch {
            // Ignore storage errors
          }
        }
      }),
  }
}
