export type Settings = {
  id: string
  name: string
  role: string
  intro: string
  about: string
  avatar_url: string | null
  hero_image_url: string | null
  email: string
  social_github: string | null
  social_x: string | null
  social_linkedin: string | null
  social_instagram: string | null
  available: boolean
  years_experience: number | null
  projects_done: number | null
  created_at: string
  updated_at: string
}

export type Project = {
  id: string
  title: string
  slug: string
  short_description: string
  long_description: string
  cover_image_url: string | null
  gallery_images: string[]
  tags: string[]
  live_url: string | null
  featured: boolean
  display_order: number
  created_at: string
  updated_at: string
}

export type Service = {
  id: string
  title: string
  description: string
  display_order: number
  created_at: string
}

export type Database = {
  public: {
    Tables: {
      settings: {
        Row: Settings
        Insert: Partial<Settings>
        Update: Partial<Settings>
        Relationships: []
      }
      projects: {
        Row: Project
        Insert: Partial<Project>
        Update: Partial<Project>
        Relationships: []
      }
      services: {
        Row: Service
        Insert: Partial<Service>
        Update: Partial<Service>
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
