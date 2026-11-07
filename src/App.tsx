import { Routes, Route } from 'react-router-dom'
import { useTheme } from '@/hooks/useTheme'
import { useSettings } from '@/hooks/useSettings'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { Home } from '@/pages/Home'
import { ProjectDetail } from '@/pages/ProjectDetail'
import { AdminLogin } from '@/pages/admin/Login'
import { AdminLayout } from '@/components/AdminLayout'
import { AdminSettings } from '@/pages/admin/Settings'
import { AdminProjects } from '@/pages/admin/Projects'
import { AdminProjectForm } from '@/pages/admin/ProjectForm'
import { AdminServices } from '@/pages/admin/Services'

export function App() {
  const themeHook = useTheme()
  const { settings, loading } = useSettings()

  return (
    <Routes>
      {/* Admin routes */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route
        path="/admin"
        element={
          <AdminLayout>
            <AdminSettings />
          </AdminLayout>
        }
      />
      <Route
        path="/admin/projects"
        element={
          <AdminLayout>
            <AdminProjects />
          </AdminLayout>
        }
      />
      <Route
        path="/admin/projects/:id"
        element={
          <AdminLayout>
            <AdminProjectForm />
          </AdminLayout>
        }
      />
      <Route
        path="/admin/services"
        element={
          <AdminLayout>
            <AdminServices />
          </AdminLayout>
        }
      />


      {/* Public routes */}
      <Route
        path="/"
        element={
          <div className="min-h-screen">
            <Navbar settings={settings} themeHook={themeHook} />
            <main className="max-w-content mx-auto px-3 pt-6 sm:pt-8">
              <Home settings={settings} loading={loading} />
              <Footer settings={settings} />
            </main>
          </div>
        }
      />
      <Route
        path="/projects/:slug"
        element={
          <div className="min-h-screen">
            <Navbar settings={settings} themeHook={themeHook} />
            <main className="max-w-content mx-auto px-3 pt-6 sm:pt-8">
              <ProjectDetail />
              <Footer settings={settings} />
            </main>
          </div>
        }
      />
    </Routes>
  )
}

