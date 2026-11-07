import { useEffect } from 'react'
import { Loading } from '@/components/Loading'
import { Hero } from '@/sections/Hero'
import { About } from '@/sections/About'
import { Projects } from '@/sections/Projects'
import { Services } from '@/sections/Services'
import { Contact } from '@/sections/Contact'
import type { Settings } from '@/lib/types'

interface HomeProps {
  settings: Settings | null
  loading: boolean
}

export function Home({ settings, loading }: HomeProps) {
  useEffect(() => {
    if (window.location.hash) {
      const id = window.location.hash.replace('#', '')
      const el = document.getElementById(id)
      if (el) {
        setTimeout(() => el.scrollIntoView({ behavior: 'smooth' }), 100)
      }
    }
  }, [])

  if (loading) return <Loading />
  if (!settings) return <div className="text-center py-20 text-body-light">Failed to load site data.</div>

  return (
    <div className="space-y-3 pb-3">
      <Hero settings={settings} />
      <About settings={settings} />
      <Projects />
      <Services />
      <Contact settings={settings} />
    </div>
  )
}
