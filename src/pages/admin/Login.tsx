import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { signIn } from '@/lib/api'

export function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email.trim() || !password.trim()) {
      setError('Email and password are required')
      return
    }

    setLoading(true)
    try {
      await signIn(email, password)
      navigate('/admin')
    } catch (err: any) {
      setError(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-page-light dark:bg-page-dark flex items-center justify-center px-4">
      <div className="bg-card-light dark:bg-card-dark rounded-card p-8 md:p-10 w-full max-w-md">
        <h1 className="text-2xl font-light text-heading-light dark:text-heading-dark tracking-tight mb-6">
          Admin Login
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-2xl bg-page-light dark:bg-page-dark border-0 text-heading-light dark:text-heading-dark placeholder:text-body-light/50 dark:placeholder:text-body-dark/50 text-sm focus:outline-none focus:ring-2 focus:ring-heading-light/20 dark:focus:ring-heading-dark/20"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-2xl bg-page-light dark:bg-page-dark border-0 text-heading-light dark:text-heading-dark placeholder:text-body-light/50 dark:placeholder:text-body-dark/50 text-sm focus:outline-none focus:ring-2 focus:ring-heading-light/20 dark:focus:ring-heading-dark/20"
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-full bg-heading-light dark:bg-heading-dark text-white dark:text-page-dark text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  )
}
