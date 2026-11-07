import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card } from '@/components/Card'
import { Loading } from '@/components/Loading'
import { ImageUpload } from '@/components/ImageUpload'
import { createProject, updateProject } from '@/lib/api'
import { supabase } from '@/lib/supabase'
import type { Project } from '@/lib/types'

export function AdminProjectForm() {
  const { id } = useParams<{ id: string }>()
  const isNew = id === 'new'
  const navigate = useNavigate()
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    title: '',
    slug: '',
    short_description: '',
    long_description: '',
    cover_image_url: '' as string | null,
    gallery_images: [] as string[],
    tags: [] as string[],
    live_url: '' as string | null,
    featured: false,
    display_order: 0,
  })

  const [tagInput, setTagInput] = useState('')
  const [galleryInput, setGalleryInput] = useState('')

  useEffect(() => {
    if (!isNew && id) {
      supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single()
        .then(({ data }) => {
          if (data) {
            setForm({
              title: data.title,
              slug: data.slug,
              short_description: data.short_description,
              long_description: data.long_description,
              cover_image_url: data.cover_image_url,
              gallery_images: data.gallery_images || [],
              tags: data.tags || [],
              live_url: data.live_url,
              featured: data.featured,
              display_order: data.display_order,
            })
          }
          setLoading(false)
        })
    }
  }, [id, isNew])

  const generateSlug = (title: string) =>
    title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

  const handleSave = async () => {
    setError('')
    if (!form.title.trim()) { setError('Title is required'); return }
    if (!form.slug.trim()) { setError('Slug is required'); return }
    if (!form.short_description.trim()) { setError('Short description is required'); return }

    setSaving(true)
    try {
      if (isNew) {
        await createProject(form as any)
      } else {
        await updateProject(id!, form)
      }
      navigate('/admin/projects')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const addTag = () => {
    const tag = tagInput.trim()
    if (tag && !form.tags.includes(tag)) {
      setForm({ ...form, tags: [...form.tags, tag] })
      setTagInput('')
    }
  }

  const removeTag = (tag: string) => {
    setForm({ ...form, tags: form.tags.filter((t) => t !== tag) })
  }

  const removeGalleryImage = (index: number) => {
    setForm({ ...form, gallery_images: form.gallery_images.filter((_, i) => i !== index) })
  }

  if (loading) return <Loading />

  return (
    <div className="space-y-3">
      <Card>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-medium text-heading-light dark:text-heading-dark">
            {isNew ? 'New Project' : 'Edit Project'}
          </h2>
          <button
            onClick={() => navigate('/admin/projects')}
            className="text-sm text-body-light dark:text-body-dark hover:text-heading-light dark:hover:text-heading-dark transition-colors"
          >
            ← Back
          </button>
        </div>

        <div className="space-y-4 max-w-2xl">
          <div>
            <label className="block text-sm font-medium text-heading-light dark:text-heading-dark mb-1">Title</label>
            <input
              value={form.title}
              onChange={(e) => {
                const title = e.target.value
                setForm({ ...form, title, slug: isNew ? generateSlug(title) : form.slug })
              }}
              className="w-full px-4 py-2.5 rounded-2xl bg-page-light dark:bg-page-dark text-heading-light dark:text-heading-dark text-sm focus:outline-none focus:ring-2 focus:ring-heading-light/20"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-heading-light dark:text-heading-dark mb-1">Slug</label>
            <input
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              className="w-full px-4 py-2.5 rounded-2xl bg-page-light dark:bg-page-dark text-heading-light dark:text-heading-dark text-sm focus:outline-none focus:ring-2 focus:ring-heading-light/20"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-heading-light dark:text-heading-dark mb-1">Short Description</label>
            <textarea
              value={form.short_description}
              onChange={(e) => setForm({ ...form, short_description: e.target.value })}
              rows={2}
              className="w-full px-4 py-2.5 rounded-2xl bg-page-light dark:bg-page-dark text-heading-light dark:text-heading-dark text-sm focus:outline-none focus:ring-2 focus:ring-heading-light/20 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-heading-light dark:text-heading-dark mb-1">Long Description</label>
            <textarea
              value={form.long_description}
              onChange={(e) => setForm({ ...form, long_description: e.target.value })}
              rows={6}
              className="w-full px-4 py-2.5 rounded-2xl bg-page-light dark:bg-page-dark text-heading-light dark:text-heading-dark text-sm focus:outline-none focus:ring-2 focus:ring-heading-light/20 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-heading-light dark:text-heading-dark mb-1">Live URL</label>
            <input
              value={form.live_url || ''}
              onChange={(e) => setForm({ ...form, live_url: e.target.value || null })}
              placeholder="https://..."
              className="w-full px-4 py-2.5 rounded-2xl bg-page-light dark:bg-page-dark text-heading-light dark:text-heading-dark text-sm focus:outline-none focus:ring-2 focus:ring-heading-light/20"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-heading-light dark:text-heading-dark mb-1">Display Order</label>
              <input
                type="number"
                value={form.display_order}
                onChange={(e) => setForm({ ...form, display_order: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2.5 rounded-2xl bg-page-light dark:bg-page-dark text-heading-light dark:text-heading-dark text-sm focus:outline-none focus:ring-2 focus:ring-heading-light/20"
              />
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 text-sm text-heading-light dark:text-heading-dark pb-2.5">
                <input
                  type="checkbox"
                  checked={form.featured}
                  onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                  className="w-4 h-4 rounded"
                />
                Featured
              </label>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-heading-light dark:text-heading-dark mb-1">Tags</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {form.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-page-light dark:bg-page-dark text-xs text-heading-light dark:text-heading-dark"
                >
                  {tag}
                  <button onClick={() => removeTag(tag)} className="text-body-light hover:text-red-500 ml-1">×</button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                placeholder="Add a tag"
                className="flex-1 px-4 py-2.5 rounded-2xl bg-page-light dark:bg-page-dark text-heading-light dark:text-heading-dark text-sm focus:outline-none focus:ring-2 focus:ring-heading-light/20"
              />
              <button
                type="button"
                onClick={addTag}
                className="px-4 py-2 rounded-full border border-gray-200 dark:border-gray-700 text-sm text-heading-light dark:text-heading-dark"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <h3 className="text-lg font-medium text-heading-light dark:text-heading-dark mb-4">Images</h3>
        <ImageUpload
          label="Cover Image"
          value={form.cover_image_url}
          onChange={(url) => setForm({ ...form, cover_image_url: url || null })}
          aspectRatio={16 / 9}
          helpText="16:9 widescreen cover recommended"
        />

        <div className="mt-6">
          <label className="block text-sm font-medium text-heading-light dark:text-heading-dark mb-2">Gallery Images</label>
          <div className="flex flex-wrap gap-3 mb-3">
            {form.gallery_images.map((img, i) => (
              <div key={i} className="relative">
                <img src={img} alt="" className="w-24 h-24 object-cover rounded-xl" />
                <button
                  type="button"
                  onClick={() => removeGalleryImage(i)}
                  className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          <ImageUpload
            label="Add Gallery Image"
            value={null}
            onChange={(url) => {
              if (url) setForm({ ...form, gallery_images: [...form.gallery_images, url] })
            }}
            aspectRatio={4 / 3}
            helpText="4:3 gallery view recommended"
          />
        </div>
      </Card>

      <div className="flex items-center gap-4">
        {error && <span className="text-red-500 text-sm">{error}</span>}
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-8 py-3 rounded-full bg-heading-light dark:bg-heading-dark text-white dark:text-page-dark text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {saving ? 'Saving...' : isNew ? 'Create Project' : 'Save Changes'}
        </button>
      </div>
    </div>
  )
}
