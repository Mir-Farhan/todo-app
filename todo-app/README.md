# Todo List Application

A full-stack todo list application built with **Next.js 14 (App Router)**, **Supabase** for backend (database & authentication), and **shadcn/ui** for UI components.

## Features

- **Authentication**: Email/password sign-up, sign-in, sign-out
- **Priority Flags**: Critical, High, Medium, Low (4 levels with color coding)
- **Labels**: Predefined + Custom labels with color coding
- **Sorting**: By due date, priority, creation date, and manual drag-and-drop
- **Optimistic UI**: Instant feedback for all operations
- **Soft Delete**: Items are marked as deleted instead of being permanently removed
- **Real-time Updates**: Live sync across devices
- **Dark Mode**: Built-in theme support

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router) |
| UI Library | shadcn/ui + Tailwind CSS |
| State Management | Zustand |
| Drag & Drop | @dnd-kit/core |
| Backend | Supabase (PostgreSQL + Auth) |
| Forms | React Hook Form + Zod |
| Type Safety | TypeScript |

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- A Supabase account (free tier works)

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd todo-app
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

You can find these values in your Supabase project dashboard:
- Go to https://supabase.com/dashboard
- Select your project
- Go to Settings → API
- Copy the Project URL and anon/public key

### 4. Set up Supabase database

Run the SQL schema from `supabase/schema.sql` in your Supabase SQL Editor:

```bash
# Go to your Supabase project dashboard
# Navigate to SQL Editor
# Paste the contents of supabase/schema.sql
# Click "Run" to execute the schema
```

This will create:
- `profiles` table - User metadata
- `todos` table - Todo items with soft delete
- `labels` table - Labels with soft delete
- `todo_labels` table - Junction table for many-to-many relationship
- All necessary indexes for performance
- Row Level Security (RLS) policies

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
todo-app/
├── app/                      # Next.js App Router pages
│   ├── (auth)/             # Authentication pages
│   ├── (dashboard)/         # Protected dashboard pages
│   ├── layout.tsx
│   └── page.tsx
├── components/               # React components
│   ├── ui/                  # shadcn/ui components
│   ├── todo/                # Todo-related components
│   └── label/               # Label-related components
├── stores/                   # Zustand stores
│   ├── authStore.ts          # Authentication state
│   ├── todoStore.ts          # Todos state with optimistic UI
│   └── labelStore.ts         # Labels state
├── lib/                      # Utility functions
│   ├── supabase/           # Supabase client & types
│   └── utils.ts             # Helper functions
└── supabase/               # Database schema SQL
```

## Database Schema

See [`supabase/schema.sql`](supabase/schema.sql) for the complete database schema including:
- Table definitions
- Indexes for performance
- Row Level Security (RLS) policies

## Features in Detail

### Priority System
| Priority | Color | Visual |
|----------|-------|--------|
| Critical | Red | 🔴 |
| High | Orange | 🟠 |
| Medium | Yellow | 🟡 |
| Low | Blue | 🔵 |

### Sorting Options
- By due date (ascending/descending)
- By priority (Critical → Low or Low → Critical)
- By creation date (newest/oldest)
- Manual drag-and-drop reordering

### Labels
Predefined labels included:
- Work (Blue)
- Personal (Green)
- Shopping (Purple)
- Health (Red)
- Urgent (Orange)
- Ideas (Pink)

Users can also create custom labels with any color.

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import your repository in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Other Platforms

This Next.js application can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- Render
- AWS Amplify
- DigitalOcean App Platform

## License

MIT
