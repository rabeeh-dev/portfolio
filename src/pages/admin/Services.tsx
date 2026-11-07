import { useState, useEffect } from 'react'
import { Card } from '@/components/Card'
import { Loading } from '@/components/Loading'
import { Empty } from '@/components/Empty'
import { getServices, createService, updateService, deleteService } from '@/lib/api'
import { useAlert } from '@/context/AlertContext'
import type { Service } from '@/lib/types'

export function AdminServices() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<string | null>(null)
  const [form, setForm] = useState({ title: '', description: '', display_order: 0 })
  const [showNew, setShowNew] = useState(false)
  const [saving, setSaving] = useState(false)
  const { showAlert, showConfirm } = useAlert()

  const load = () => {
    setLoading(true)
    getServices()
      .then(setServices)
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const handleCreate = async () => {
    if (!form.title.trim() || !form.description.trim()) return
    setSaving(true)
    try {
      await createService(form)
      setShowNew(false)
      setForm({ title: '', description: '', display_order: 0 })
      load()
    } catch (err: any) {
      await showAlert({
        title: 'Error Creating Service',
        message: err.message || 'Failed to create service.',
        variant: 'error',
      })
    } finally {
      setSaving(false)
    }
  }

  const handleUpdate = async (id: string) => {
    if (!form.title.trim() || !form.description.trim()) return
    setSaving(true)
    try {
      await updateService(id, form)
      setEditing(null)
      load()
    } catch (err: any) {
      await showAlert({
        title: 'Error Updating Service',
        message: err.message || 'Failed to update service.',
        variant: 'error',
      })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string, title: string) => {
    const confirmed = await showConfirm({
      title: 'Delete Service',
      message: `Are you sure you want to delete "${title}"? This cannot be undone.`,
      confirmText: 'Delete Service',
      cancelText: 'Cancel',
      variant: 'danger',
    })

    if (!confirmed) return

    try {
      await deleteService(id)
      load()
    } catch (err: any) {
      await showAlert({
        title: 'Delete Failed',
        message: err.message || 'Could not delete service.',
        variant: 'error',
      })
    }
  }

  const startEdit = (service: Service) => {
    setEditing(service.id)
    setForm({ title: service.title, description: service.description, display_order: service.display_order })
    setShowNew(false)
  }

  return (
    <Card>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-medium text-heading-light dark:text-heading-dark">Services</h2>
        <button
          onClick={() => {
            setShowNew(true)
            setEditing(null)
            setForm({ title: '', description: '', display_order: services.length + 1 })
          }}
          className="px-5 py-2 rounded-full bg-heading-light dark:bg-heading-dark text-white dark:text-page-dark text-sm font-medium hover:opacity-90 transition-opacity"
        >
          + Add Service
        </button>
      </div>

      {showNew && (
        <div className="p-4 rounded-2xl bg-page-light dark:bg-page-dark mb-4 space-y-3">
          <input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Title"
            className="w-full px-4 py-2.5 rounded-2xl bg-card-light dark:bg-card-dark text-heading-light dark:text-heading-dark text-sm focus:outline-none"
          />
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Description"
            rows={3}
            className="w-full px-4 py-2.5 rounded-2xl bg-card-light dark:bg-card-dark text-heading-light dark:text-heading-dark text-sm focus:outline-none resize-none"
          />
          <input
            type="number"
            value={form.display_order}
            onChange={(e) => setForm({ ...form, display_order: parseInt(e.target.value) || 0 })}
            placeholder="Order"
            className="w-32 px-4 py-2.5 rounded-2xl bg-card-light dark:bg-card-dark text-heading-light dark:text-heading-dark text-sm focus:outline-none"
          />
          <div className="flex gap-2">
            <button
              onClick={handleCreate}
              disabled={saving}
              className="px-5 py-2 rounded-full bg-heading-light dark:bg-heading-dark text-white dark:text-page-dark text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {saving ? 'Creating...' : 'Create'}
            </button>
            <button
              onClick={() => setShowNew(false)}
              className="px-5 py-2 rounded-full border border-gray-200 dark:border-gray-700 text-sm text-body-light"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <Loading />
      ) : services.length === 0 && !showNew ? (
        <Empty message="No services yet." />
      ) : (
        <div className="space-y-3">
          {services.map((service) => (
            <div key={service.id} className="p-4 rounded-2xl bg-page-light dark:bg-page-dark">
              {editing === service.id ? (
                <div className="space-y-3">
                  <input
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-2xl bg-card-light dark:bg-card-dark text-heading-light dark:text-heading-dark text-sm focus:outline-none"
                  />
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2.5 rounded-2xl bg-card-light dark:bg-card-dark text-heading-light dark:text-heading-dark text-sm focus:outline-none resize-none"
                  />
                  <input
                    type="number"
                    value={form.display_order}
                    onChange={(e) => setForm({ ...form, display_order: parseInt(e.target.value) || 0 })}
                    className="w-32 px-4 py-2.5 rounded-2xl bg-card-light dark:bg-card-dark text-heading-light dark:text-heading-dark text-sm focus:outline-none"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleUpdate(service.id)}
                      disabled={saving}
                      className="px-5 py-2 rounded-full bg-heading-light dark:bg-heading-dark text-white dark:text-page-dark text-sm font-medium disabled:opacity-50"
                    >
                      {saving ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      onClick={() => setEditing(null)}
                      className="px-5 py-2 rounded-full border border-gray-200 dark:border-gray-700 text-sm text-body-light"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-heading-light dark:text-heading-dark">
                      {service.display_order}. {service.title}
                    </p>
                    <p className="text-xs text-body-light dark:text-body-dark truncate mt-1">{service.description}</p>
                  </div>
                  <div className="flex gap-2 shrink-0 ml-4">
                    <button
                      onClick={() => startEdit(service)}
                      className="px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-700 text-xs text-heading-light dark:text-heading-dark"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(service.id, service.title)}
                      className="px-3 py-1.5 rounded-full border border-red-200 dark:border-red-900 text-xs text-red-500"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}
