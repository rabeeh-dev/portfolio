import { supabase } from './supabase'
import type { Settings, Project, Service } from './types'

export function isPlaceholderConfig(): boolean {
  const url = import.meta.env.VITE_SUPABASE_URL
  return !url || url.includes('your-project') || url.includes('placeholder')
}

export const SEED_SETTINGS: Settings = {
  id: 'default-settings',
  name: '',
  role: '',
  intro: '',
  about: '',
  avatar_url: null,
  hero_image_url: null,
  email: '',
  social_github: null,
  social_x: null,
  social_linkedin: null,
  social_instagram: null,
  available: true,
  years_experience: null,
  projects_done: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}

export const SEED_PROJECTS: Project[] = []

export const SEED_SERVICES: Service[] = []

// ── Settings ──────────────────────────────────────────────

export async function getSettings(): Promise<Settings | null> {
  if (isPlaceholderConfig()) {
    return SEED_SETTINGS
  }

  try {
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .single()

    if (error || !data) {
      console.warn('Could not fetch settings from Supabase, using seed defaults:', error)
      return SEED_SETTINGS
    }
    return data
  } catch {
    return SEED_SETTINGS
  }
}

export async function updateSettings(updates: Partial<Settings>) {
  if (isPlaceholderConfig()) {
    return { ...SEED_SETTINGS, ...updates }
  }

  // Only pass known settings columns to Supabase
  const allowedKeys: (keyof Settings)[] = [
    'name',
    'role',
    'intro',
    'about',
    'avatar_url',
    'hero_image_url',
    'email',
    'social_github',
    'social_x',
    'social_linkedin',
    'social_instagram',
    'available',
    'years_experience',
    'projects_done',
  ]

  const cleanPayload: Partial<Settings> = {
    updated_at: new Date().toISOString(),
  }

  for (const key of allowedKeys) {
    if (key in updates) {
      (cleanPayload as any)[key] = updates[key]
    }
  }

  const { data, error } = await supabase
    .from('settings')
    .update(cleanPayload)
    .eq('id', updates.id!)
    .select()
    .single()
  if (error) throw error
  return data
}

// ── Projects ──────────────────────────────────────────────

export async function getProjects(): Promise<Project[]> {
  if (isPlaceholderConfig()) {
    return []
  }

  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('display_order', { ascending: true })

    if (error || !data) {
      return []
    }
    return data
  } catch {
    return []
  }
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  if (isPlaceholderConfig()) {
    return null
  }

  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('slug', slug)
      .single()

    if (error || !data) {
      return null
    }
    return data
  } catch {
    return null
  }
}

export async function createProject(project: Omit<Project, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('projects')
    .insert(project)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateProject(id: string, updates: Partial<Project>) {
  const { data, error } = await supabase
    .from('projects')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteProject(id: string) {
  const { error } = await supabase.from('projects').delete().eq('id', id)
  if (error) throw error
}

// ── Services ──────────────────────────────────────────────

export async function getServices(): Promise<Service[]> {
  if (isPlaceholderConfig()) {
    return []
  }

  try {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .order('display_order', { ascending: true })

    if (error || !data) {
      return []
    }
    return data
  } catch {
    return []
  }
}

export async function createService(service: Omit<Service, 'id' | 'created_at'>) {
  const { data, error } = await supabase
    .from('services')
    .insert(service)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateService(id: string, updates: Partial<Service>) {
  const { data, error } = await supabase
    .from('services')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteService(id: string) {
  const { error } = await supabase.from('services').delete().eq('id', id)
  if (error) throw error
}

// ── Contact ───────────────────────────────────────────────

export async function sendMessage(msg: { name: string; email: string; message: string }) {
  const res = await fetch('/api/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(msg),
  })

  const data = await res.json().catch(() => ({}))

  if (!res.ok) {
    throw new Error(data.error || 'Failed to send message')
  }

  return data
}

// ── Auth ──────────────────────────────────────────────────

export async function signIn(email: string, password: string) {
  if (isPlaceholderConfig()) {
    throw new Error('Supabase credentials not configured in .env yet. Please follow the setup instructions in README.md.')
  }

  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function getSession() {
  if (isPlaceholderConfig()) return null
  const { data } = await supabase.auth.getSession()
  return data.session
}

// ── Image Upload ──────────────────────────────────────────

export async function uploadImage(file: File): Promise<string> {
  const session = await getSession()
  if (!session) throw new Error('Not authenticated')

  // 1. Try Supabase Storage first (direct CDN upload - works serverless in production)
  try {
    const ext = file.name.split('.').pop() || 'jpg'
    const filePath = `uploads/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('portfolio')
      .upload(filePath, file, {
        cacheControl: '31536000, immutable',
        upsert: false,
      })

    if (!uploadError && uploadData) {
      const { data: urlData } = supabase.storage
        .from('portfolio')
        .getPublicUrl(filePath)
      if (urlData?.publicUrl) {
        return urlData.publicUrl
      }
    }

    if (uploadError) {
      console.warn('[Upload] Supabase Storage upload skipped/failed:', uploadError.message)
      const isMissingBucket =
        uploadError.message?.toLowerCase().includes('bucket not found') ||
        (uploadError as any).code === 'NoSuchBucket' ||
        (uploadError as any).status === 400 ||
        (uploadError as any).statusCode === '404'
      if (isMissingBucket && typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
        throw new Error("Supabase Storage bucket 'portfolio' not found. Please create a public bucket named 'portfolio' in your Supabase Dashboard (Storage > New bucket), or run the storage SQL in supabase/schema.sql.")
      }
    }
  } catch (err: any) {
    if (err?.message?.includes('Supabase Storage bucket')) {
      throw err
    }
    // Fall back to local Express dev server if running locally
  }

  // 2. Fallback to /api/upload (for local Express dev server)
  const formData = new FormData()
  formData.append('image', file)

  const res = await fetch('/api/upload', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
    body: formData,
  })

  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error || 'Upload failed')
  }

  const data = await res.json()
  return data.url
}
