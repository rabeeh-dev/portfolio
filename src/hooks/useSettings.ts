import { useState, useEffect } from 'react'
import { getSettings, SEED_SETTINGS } from '@/lib/api'
import type { Settings } from '@/lib/types'

export const DEFAULT_SETTINGS: Settings = SEED_SETTINGS

export function useSettings() {
  const [settings, setSettings] = useState<Settings | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getSettings()
      .then((data) => setSettings(data || DEFAULT_SETTINGS))
      .catch(() => setSettings(DEFAULT_SETTINGS))
      .finally(() => setLoading(false))
  }, [])

  return { settings: settings || DEFAULT_SETTINGS, loading, refetch: () => getSettings().then(setSettings) }
}
