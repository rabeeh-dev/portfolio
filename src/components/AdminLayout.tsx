import { useEffect, useState, type ReactNode } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { signOut } from '@/lib/api'
import type { Session } from '@supabase/supabase-js'

interface AdminLayoutProps {
  children: ReactNode
}

const navItems = [
  { path: '/admin', label: 'Settings', exact: true },
  { path: '/admin/projects', label: 'Projects' },
  { path: '/admin/services', label: 'Services' },
]

export function AdminLayout({ children }: AdminLayoutProps) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
      if (!data.session) navigate('/admin/login')
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (!session) navigate('/admin/login')
    })

    return () => subscription.unsubscribe()
  }, [navigate])

  const handleSignOut = async () => {
    await signOut()
    navigate('/admin/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-page-light dark:bg-page-dark flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-heading-light/20 border-t-heading-light rounded-full animate-spin" />
      </div>
    )
  }

  if (!session) return null

  return (
    <div className="min-h-screen bg-page-light dark:bg-page-dark">
      <div className="max-w-content mx-auto px-3 py-6">
        {/* Header */}
        <div className="bg-card-light dark:bg-card-dark rounded-card px-6 py-4 mb-3 flex items-center justify-between">
          <h1 className="text-heading-light dark:text-heading-dark font-medium text-lg">Admin</h1>
          <button
            onClick={handleSignOut}
            className="px-4 py-1.5 rounded-full border border-gray-200 dark:border-gray-700 text-sm text-body-light dark:text-body-dark hover:text-heading-light dark:hover:text-heading-dark transition-colors"
          >
            Sign Out
          </button>
        </div>

        {/* Nav */}
        <div className="bg-card-light dark:bg-card-dark rounded-card px-6 py-3 mb-3 flex flex-wrap gap-2">
          {navItems.map((item) => {
            const isActive = item.exact
              ? location.pathname === item.path
              : location.pathname.startsWith(item.path)
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`px-4 py-2 rounded-full text-sm transition-colors ${
                  isActive
                    ? 'bg-heading-light dark:bg-heading-dark text-white dark:text-page-dark'
                    : 'text-body-light dark:text-body-dark hover:text-heading-light dark:hover:text-heading-dark'
                }`}
              >
                {item.label}
              </Link>
            )
          })}
        </div>

        {/* Content */}
        {children}
      </div>
    </div>
  )
}
