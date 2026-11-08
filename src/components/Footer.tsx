import type { Settings } from '@/lib/types'

interface FooterProps {
  settings: Settings | null
}

export function Footer({ settings }: FooterProps) {
  return (
    <footer className="text-center py-8 text-sm text-body-light dark:text-body-dark">
      © {new Date().getFullYear()} {settings?.name || 'Rabeeh'}. All rights reserved.
    </footer>
  )
}
