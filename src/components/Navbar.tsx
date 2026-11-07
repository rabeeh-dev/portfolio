import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useTheme } from '@/hooks/useTheme'
import type { Settings } from '@/lib/types'

interface NavbarProps {
  settings: Settings | null
  themeHook: ReturnType<typeof useTheme>
}

export function Navbar({ settings, themeHook }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const { dark, toggle } = themeHook
  const navigate = useNavigate()
  const location = useLocation()

  const scrollTo = (id: string) => {
    setMenuOpen(false)
    if (location.pathname !== '/') {
      navigate('/#' + id)
      setTimeout(() => {
        const el = document.getElementById(id)
        if (el) el.scrollIntoView({ behavior: 'smooth' })
      }, 100)
      return
    }
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <>
      <nav className="sticky top-3 z-50 mx-auto max-w-content px-3">
        <div className="bg-white dark:bg-[#2A2A2A] rounded-card px-4 sm:px-5 py-3 flex items-center justify-between shadow-sm">
          {/* Left */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <Link to="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity shrink-0">
              <div className="w-8 h-8 bg-heading-light dark:bg-heading-dark rounded-full flex items-center justify-center shrink-0">
                <span className="text-white dark:text-page-dark text-sm font-semibold">
                  {settings?.name?.charAt(0) || 'P'}
                </span>
              </div>
              <span className="font-medium text-heading-light dark:text-heading-dark text-sm hidden sm:block truncate max-w-[140px] md:max-w-[200px]">
                {settings?.name || 'Portfolio'}
              </span>
            </Link>

            {/* Available badge */}
            {settings?.available && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-accent/10 text-accent text-xs font-medium shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                Available
              </span>
            )}
          </div>

          {/* Right: Theme Toggle + Menu */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0 ml-2">
            {/* Animated Theme Switch Toggle */}
            <button
              type="button"
              onClick={toggle}
              aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
              role="switch"
              aria-checked={dark}
              className="relative inline-flex h-7 w-14 items-center rounded-full bg-[#E5E4E2] dark:bg-[#1C1C1E] p-0.5 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-heading-light/20 dark:focus:ring-heading-dark/20 border border-black/5 dark:border-white/10 shrink-0 cursor-pointer shadow-inner"
            >
              {/* Ambient icons inside track */}
              <span className="absolute left-2 flex items-center justify-center pointer-events-none select-none text-amber-500/70 dark:text-neutral-500 transition-opacity duration-300">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                    clipRule="evenodd"
                  />
                </svg>
              </span>
              <span className="absolute right-2 flex items-center justify-center pointer-events-none select-none text-neutral-400 dark:text-blue-300/80 transition-opacity duration-300">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              </span>

              {/* Sliding knob with icon */}
              <span
                className={`inline-flex h-6 w-6 items-center justify-center rounded-full bg-white dark:bg-[#2C2C2E] shadow-md transform transition-transform duration-300 ease-out z-10 ${
                  dark ? 'translate-x-7' : 'translate-x-0'
                }`}
              >
                {dark ? (
                  <svg className="w-3.5 h-3.5 text-blue-400 transition-transform duration-300 rotate-0" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                  </svg>
                ) : (
                  <svg className="w-3.5 h-3.5 text-amber-500 transition-transform duration-300 rotate-0" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </span>
            </button>

            {/* Menu button */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="px-4 py-1.5 rounded-full bg-heading-light dark:bg-heading-dark text-white dark:text-page-dark text-sm font-medium hover:opacity-90 transition-opacity shrink-0"
            >
              {menuOpen ? 'Close' : 'Menu'}
            </button>
          </div>
        </div>
      </nav>

      {/* Full-screen menu overlay */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 bg-white/95 dark:bg-page-dark/95 backdrop-blur-sm flex items-center justify-center">
          <nav className="flex flex-col items-center gap-8">
            {['about', 'projects', 'services', 'contact'].map((section) => (
              <button
                key={section}
                onClick={() => scrollTo(section)}
                className="text-4xl md:text-5xl font-light text-heading-light dark:text-heading-dark hover:opacity-60 transition-opacity capitalize tracking-tight"
              >
                {section}
              </button>
            ))}
          </nav>
        </div>
      )}
    </>
  )
}
