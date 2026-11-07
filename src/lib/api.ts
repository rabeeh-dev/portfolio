import { supabase } from './supabase'
import type { Settings, Project, Service } from './types'

export function isPlaceholderConfig(): boolean {
  const url = import.meta.env.VITE_SUPABASE_URL
  return !url || url.includes('your-project') || url.includes('placeholder')
}

export const SEED_SETTINGS: Settings = {
  id: 'seed-settings-id',
  name: 'Alex Morgan',
  role: 'Digital Designer',
  intro: 'I craft thoughtful digital experiences that merge form and function. Currently available for freelance work.',
  about: "I'm a digital designer and developer based in San Francisco with over 8 years of experience creating beautiful, functional digital products. I believe great design is invisible — it just works. My approach combines clean aesthetics with intuitive user experiences, always keeping the end user at the center of every decision.",
  avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
  hero_image_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=1600&q=80',
  email: 'hello@alexmorgan.design',
  social_github: 'https://github.com',
  social_x: 'https://x.com',
  social_linkedin: 'https://linkedin.com',
  social_instagram: 'https://instagram.com',
  available: true,
  years_experience: 8,
  projects_done: 50,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}

export const SEED_PROJECTS: Project[] = [
  {
    id: '1',
    title: 'Meridian App',
    slug: 'meridian-app',
    short_description: 'A meditation and wellness app with a calming interface designed to reduce digital anxiety.',
    long_description: 'Meridian is a meditation and wellness application designed to help users find calm in their daily routines. The project involved creating a soothing visual language, intuitive navigation, and seamless audio integration. The interface was designed to feel peaceful from the first interaction, using soft gradients and minimal UI elements that fade away during meditation sessions.',
    cover_image_url: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=1200&q=80',
    gallery_images: [
      'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?auto=format&fit=crop&w=800&q=80',
    ],
    tags: ['UI/UX', 'Mobile', 'Wellness'],
    live_url: 'https://example.com',
    featured: true,
    display_order: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'Folio Studio',
    slug: 'folio-studio',
    short_description: 'Brand identity and website for a boutique architecture studio based in Portland.',
    long_description: 'Folio Studio is a boutique architecture firm that needed a digital presence matching their refined aesthetic. The project encompassed brand identity design, a responsive portfolio website, and a custom CMS for showcasing their architectural projects. The design emphasizes generous white space and large photography to let their work speak for itself.',
    cover_image_url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
    gallery_images: [
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80',
    ],
    tags: ['Branding', 'Web', 'Architecture'],
    live_url: 'https://example.com',
    featured: true,
    display_order: 2,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '3',
    title: 'Kinetic Dashboard',
    slug: 'kinetic-dashboard',
    short_description: 'An analytics dashboard with real-time data visualization for a SaaS platform.',
    long_description: 'Kinetic is a SaaS analytics platform that required a complete redesign of their dashboard experience. The goal was to transform complex data sets into clear, actionable visualizations. The design system includes over 40 chart components, dark and light themes, and responsive layouts that adapt from desktop monitors to tablets.',
    cover_image_url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
    gallery_images: [
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?auto=format&fit=crop&w=800&q=80',
    ],
    tags: ['Dashboard', 'SaaS', 'Data Viz'],
    live_url: 'https://example.com',
    featured: true,
    display_order: 3,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

export const SEED_SERVICES: Service[] = [
  {
    id: '1',
    title: 'UI/UX Design',
    description: 'Creating intuitive and beautiful user interfaces with a focus on user experience, accessibility, and modern design principles.',
    display_order: 1,
    created_at: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'Web Development',
    description: 'Building fast, responsive websites and web applications using modern technologies like React, Next.js, and TypeScript.',
    display_order: 2,
    created_at: new Date().toISOString(),
  },
  {
    id: '3',
    title: 'Brand Identity',
    description: 'Crafting cohesive visual identities including logos, color systems, typography, and brand guidelines that tell your story.',
    display_order: 3,
    created_at: new Date().toISOString(),
  },
]

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
    return SEED_PROJECTS
  }

  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('display_order', { ascending: true })

    if (error || !data || data.length === 0) {
      return SEED_PROJECTS
    }
    return data
  } catch {
    return SEED_PROJECTS
  }
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  if (isPlaceholderConfig()) {
    return SEED_PROJECTS.find((p) => p.slug === slug) || null
  }

  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('slug', slug)
      .single()

    if (error || !data) {
      return SEED_PROJECTS.find((p) => p.slug === slug) || null
    }
    return data
  } catch {
    return SEED_PROJECTS.find((p) => p.slug === slug) || null
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
    return SEED_SERVICES
  }

  try {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .order('display_order', { ascending: true })

    if (error || !data || data.length === 0) {
      return SEED_SERVICES
    }
    return data
  } catch {
    return SEED_SERVICES
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
