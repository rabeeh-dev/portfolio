-- ════════════════════════════════════════════════════════════
-- Portfolio Database Schema
-- Run this in the Supabase SQL Editor
-- ════════════════════════════════════════════════════════════

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ── Settings table ────────────────────────────────────────

create table if not exists settings (
  id uuid primary key default uuid_generate_v4(),
  name text not null default '',
  role text not null default '',
  intro text not null default '',
  about text not null default '',
  avatar_url text,
  hero_image_url text,
  email text not null default '',
  social_github text,
  social_x text,
  social_linkedin text,
  social_instagram text,
  available boolean not null default true,
  years_experience integer,
  projects_done integer,
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
-- Initial Setup (Blank slate - no dummy values)
-- ════════════════════════════════════════════════════════════

-- Ensure a blank settings row exists if the table is empty
insert into settings (name, role, intro, about, email, available)
select '', '', '', '', '', true
where not exists (select 1 from settings);

-- ════════════════════════════════════════════════════════════
-- Migration for existing databases (safe to run anytime)
-- ════════════════════════════════════════════════════════════
alter table settings add column if not exists social_x text;
alter table settings add column if not exists social_instagram text;

do $$
begin
  if exists (select 1 from information_schema.columns where table_name='settings' and column_name='social_twitter') then
    update settings set social_x = coalesce(social_x, social_twitter) where social_x is null;
  end if;
  if exists (select 1 from information_schema.columns where table_name='settings' and column_name='social_dribbble') then
    update settings set social_instagram = coalesce(social_instagram, social_dribbble) where social_instagram is null;
  end if;
end $$;
