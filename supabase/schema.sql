-- ════════════════════════════════════════════════════════════
-- Portfolio Database Schema
-- Run this in the Supabase SQL Editor
-- ════════════════════════════════════════════════════════════

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ── Settings table ────────────────────────────────────────

create table if not exists settings (
  id uuid primary key default uuid_generate_v4(),
  name text not null default 'Alex Morgan',
  role text not null default 'Digital Designer',
  intro text not null default 'I craft thoughtful digital experiences that merge form and function. Currently available for freelance work.',
  about text not null default 'I''m a digital designer and developer based in San Francisco with over 8 years of experience creating beautiful, functional digital products. I believe great design is invisible — it just works. My approach combines clean aesthetics with intuitive user experiences, always keeping the end user at the center of every decision.',
  avatar_url text,
  hero_image_url text,
  email text not null default 'hello@alexmorgan.design',
  social_github text default 'https://github.com',
  social_x text default 'https://x.com',
  social_linkedin text default 'https://linkedin.com',
  social_instagram text default 'https://instagram.com',
  available boolean not null default true,
  years_experience integer default 8,
  projects_done integer default 50,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ── Projects table ────────────────────────────────────────

create table if not exists projects (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  slug text not null unique,
  short_description text not null,
  long_description text not null default '',
  cover_image_url text,
  gallery_images text[] not null default '{}',
  tags text[] not null default '{}',
  live_url text,
  featured boolean not null default false,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ── Services table ────────────────────────────────────────

create table if not exists services (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text not null,
  display_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- ════════════════════════════════════════════════════════════
-- Row Level Security
-- ════════════════════════════════════════════════════════════

alter table settings enable row level security;
alter table projects enable row level security;
alter table services enable row level security;

-- Settings: public can read, only authenticated can update
create policy "Public can read settings" on settings
  for select using (true);

create policy "Admin can update settings" on settings
  for update using (auth.role() = 'authenticated');

create policy "Admin can insert settings" on settings
  for insert with check (auth.role() = 'authenticated');

-- Projects: public can read, only authenticated can manage
create policy "Public can read projects" on projects
  for select using (true);

create policy "Admin can insert projects" on projects
  for insert with check (auth.role() = 'authenticated');

create policy "Admin can update projects" on projects
  for update using (auth.role() = 'authenticated');

create policy "Admin can delete projects" on projects
  for delete using (auth.role() = 'authenticated');

-- Services: public can read, only authenticated can manage
create policy "Public can read services" on services
  for select using (true);

create policy "Admin can insert services" on services
  for insert with check (auth.role() = 'authenticated');

create policy "Admin can update services" on services
  for update using (auth.role() = 'authenticated');

create policy "Admin can delete services" on services
  for delete using (auth.role() = 'authenticated');



-- ════════════════════════════════════════════════════════════
-- Seed Data
-- ════════════════════════════════════════════════════════════

-- Settings
insert into settings (name, role, intro, about, email, available, years_experience, projects_done)
values (
  'Alex Morgan',
  'Digital Designer',
  'I craft thoughtful digital experiences that merge form and function. Currently available for freelance work.',
  'I''m a digital designer and developer based in San Francisco with over 8 years of experience creating beautiful, functional digital products. I believe great design is invisible — it just works. My approach combines clean aesthetics with intuitive user experiences, always keeping the end user at the center of every decision.',
  'hello@alexmorgan.design',
  true,
  8,
  50
);

-- Projects
insert into projects (title, slug, short_description, long_description, tags, featured, display_order) values
(
  'Meridian App',
  'meridian-app',
  'A meditation and wellness app with a calming interface designed to reduce digital anxiety.',
  'Meridian is a meditation and wellness application designed to help users find calm in their daily routines. The project involved creating a soothing visual language, intuitive navigation, and seamless audio integration. The interface was designed to feel peaceful from the first interaction, using soft gradients and minimal UI elements that fade away during meditation sessions.',
  ARRAY['UI/UX', 'Mobile', 'Wellness'],
  true,
  1
),
(
  'Folio Studio',
  'folio-studio',
  'Brand identity and website for a boutique architecture studio based in Portland.',
  'Folio Studio is a boutique architecture firm that needed a digital presence matching their refined aesthetic. The project encompassed brand identity design, a responsive portfolio website, and a custom CMS for showcasing their architectural projects. The design emphasizes generous white space and large photography to let their work speak for itself.',
  ARRAY['Branding', 'Web', 'Architecture'],
  true,
  2
),
(
  'Kinetic Dashboard',
  'kinetic-dashboard',
  'An analytics dashboard with real-time data visualization for a SaaS platform.',
  'Kinetic is a SaaS analytics platform that required a complete redesign of their dashboard experience. The goal was to transform complex data sets into clear, actionable visualizations. The design system includes over 40 chart components, dark and light themes, and responsive layouts that adapt from desktop monitors to tablets.',
  ARRAY['Dashboard', 'SaaS', 'Data Viz'],
  true,
  3
);

-- Services
insert into services (title, description, display_order) values
(
  'UI/UX Design',
  'Creating intuitive and beautiful user interfaces with a focus on user experience, accessibility, and modern design principles.',
  1
),
(
  'Web Development',
  'Building fast, responsive websites and web applications using modern technologies like React, Next.js, and TypeScript.',
  2
),
(
  'Brand Identity',
  'Crafting cohesive visual identities including logos, color systems, typography, and brand guidelines that tell your story.',
  3
);

-- ════════════════════════════════════════════════════════════
-- Migration for existing databases (safe to run anytime)
-- ════════════════════════════════════════════════════════════
alter table settings add column if not exists social_x text default 'https://x.com';
alter table settings add column if not exists social_instagram text default 'https://instagram.com';

do $$
begin
  if exists (select 1 from information_schema.columns where table_name='settings' and column_name='social_twitter') then
    update settings set social_x = coalesce(social_x, social_twitter) where social_x is null;
  end if;
  if exists (select 1 from information_schema.columns where table_name='settings' and column_name='social_dribbble') then
    update settings set social_instagram = coalesce(social_instagram, social_dribbble) where social_instagram is null;
  end if;
end $$;
