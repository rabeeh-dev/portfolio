import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Card } from '@/components/Card'
import { Loading } from '@/components/Loading'
import { Empty } from '@/components/Empty'
import { getProjects, deleteProject } from '@/lib/api'
import { useAlert } from '@/context/AlertContext'
import type { Project } from '@/lib/types'

export function AdminProjects() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const { showAlert, showConfirm } = useAlert()

  const load = () => {
    setLoading(true)
    getProjects()
      .then(setProjects)
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const handleDelete = async (id: string, title: string) => {
    const confirmed = await showConfirm({
      title: 'Delete Project',
      message: `Are you sure you want to delete "${title}"? This action cannot be undone.`,
      confirmText: 'Delete Project',
      cancelText: 'Cancel',
      variant: 'danger',
    })

    if (!confirmed) return

    try {
      await deleteProject(id)
      load()
    } catch (err: any) {
      await showAlert({
        title: 'Delete Failed',
        message: err.message || 'Could not delete project.',
        variant: 'error',
      })
    }
  }

  return (
    <Card>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-medium text-heading-light dark:text-heading-dark">Projects</h2>
        <Link
          to="/admin/projects/new"
          className="px-5 py-2 rounded-full bg-heading-light dark:bg-heading-dark text-white dark:text-page-dark text-sm font-medium hover:opacity-90 transition-opacity"
        >
          + Add Project
        </Link>
      </div>

      {loading ? (
        <Loading />
      ) : projects.length === 0 ? (
        <Empty message="No projects yet." />
      ) : (
        <div className="space-y-3">
          {projects.map((project) => (
            <div
              key={project.id}
              className="flex items-center justify-between p-4 rounded-2xl bg-page-light dark:bg-page-dark"
            >
              <div className="flex items-center gap-4 min-w-0">
                {project.cover_image_url ? (
                  <img src={project.cover_image_url} alt="" className="w-12 h-12 rounded-xl object-cover shrink-0" />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-gray-200 dark:bg-gray-700 shrink-0" />
                )}
                <div className="min-w-0">
                  <p className="text-sm font-medium text-heading-light dark:text-heading-dark truncate">
                    {project.title}
                  </p>
                  <p className="text-xs text-body-light dark:text-body-dark truncate">
                    /{project.slug}
                    {project.featured && ' • Featured'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0 ml-4">
                <Link
                  to={`/admin/projects/${project.id}`}
                  className="px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-700 text-xs text-heading-light dark:text-heading-dark hover:bg-card-light dark:hover:bg-card-dark transition-colors"
                >
                  Edit
                </Link>
                <button
                  onClick={() => handleDelete(project.id, project.title)}
                  className="px-3 py-1.5 rounded-full border border-red-200 dark:border-red-900 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}
