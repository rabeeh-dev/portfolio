# Portfolio

A minimal personal portfolio website with an admin panel.

## Tech Stack

- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Backend**: Express + TypeScript (image upload server)
- **Database**: Supabase (Postgres) with Row Level Security
- **Auth**: Supabase Auth (email + password)

## Setup

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Go to **SQL Editor** and run the contents of `supabase/schema.sql`
3. Go to **Authentication → Users** and create a new user with email + password (this will be your admin account)

### 2. Configure Environment Variables

```bash
cp .env.example .env
```

Fill in your Supabase project URL and anon key (found in **Project Settings → API**):

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Install Dependencies

```bash
npm install
cd server && npm install && cd ..
```

### 4. Start Development

```bash
npm run dev
```

This starts both the Vite dev server (port 5173) and the Express upload server (port 3001) using `concurrently`.

### 5. Access the Site

- **Portfolio**: [http://localhost:5173](http://localhost:5173)
- **Admin Panel**: [http://localhost:5173/admin](http://localhost:5173/admin)

Log in with the email and password you created in Supabase Auth.

## Project Structure

```
├── public/uploads/        # Uploaded images
├── server/                # Express image upload server
│   └── index.ts
├── src/
│   ├── components/        # Reusable UI components
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Supabase client, types, API
│   ├── pages/             # Page components
│   │   └── admin/         # Admin panel pages
│   └── sections/          # Homepage sections
├── supabase/
│   └── schema.sql         # Database schema + seed data
├── .env.example
└── package.json
```

## Features

- Responsive, mobile-first design
- Light/dark theme toggle
- Smooth scroll animations
- Contact form with validation
- Admin panel: settings, projects, services, messages
- Image uploads with auth verification
- Row Level Security on all tables

