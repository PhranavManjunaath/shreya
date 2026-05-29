# GrindTracker 🚀

> A dark-mode productivity dashboard for tracking gym workouts, work tasks, habits, water intake, weight, and more. Built with React + Supabase.

![Build](https://img.shields.io/badge/build-passing-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)
![Supabase](https://img.shields.io/badge/supabase-v2-3ECF8E)
![React](https://img.shields.io/badge/react-18-61DAFB)

## Features

| Feature | Description |
|---------|-------------|
| ⚡ **Dashboard** | Daily progress ring, stat cards, weekly productivity chart, water tracker, badge highlights |
| ✓ **Task Board** | Three-section board (Gym, Work, Habits) with priority levels and inline editing |
| ◈ **Analytics** | 14-day productivity line chart, gym vs. work bar chart, habit heatmap |
| ▦ **Calendar** | Color-coded monthly calendar showing daily productivity scores |
| ◎ **Pomodoro** | Built-in focus/break timer with circular progress indicator |
| ✍ **Journal** | Daily reflection entries with date-stamped history |
| ⬡ **Weight Tracker** | Log weight entries and view trends on a line chart |
| ★ **Badges** | Achievement system with 6 unlockable badges based on stats |
| 🔥 **Streaks** | Tracks consecutive productive days with XP and leveling system |

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, Vite 5, Framer Motion, Recharts |
| **Backend** | Supabase (PostgreSQL, Auth, RLS) |
| **Auth** | Supabase Auth (email/password) |
| **Database** | PostgreSQL with Row-Level Security |
| **Deployment** | Vercel (static SPA) |

## Project Structure

```
src/
├── lib/
│   ├── supabase.js        # Supabase client (env-based config)
│   ├── constants.js        # Badges, quotes, sections, nav items
│   └── helpers.js          # uid, today, fmtDate, getGreeting
├── components/
│   ├── shared/
│   │   ├── GlassCard.jsx       # Reusable glassmorphism card
│   │   ├── ProgressRing.jsx    # Circular progress SVG
│   │   ├── StatCard.jsx        # Metric display card
│   │   ├── PriorityDot.jsx     # Priority indicator dot
│   │   ├── HeatmapChart.jsx    # Activity heatmap grid
│   │   ├── SectionLabel.jsx    # Section header label
│   │   └── PageHeader.jsx      # Page title + subtitle
│   ├── Sidebar.jsx
│   ├── Dashboard.jsx
│   ├── Tasks.jsx
│   ├── Analytics.jsx
│   ├── CalendarView.jsx
│   ├── Pomodoro.jsx
│   ├── Journal.jsx
│   ├── WeightTracker.jsx
│   └── BadgesPage.jsx
├── Auth.jsx               # Login/signup form
├── GrindTracker.jsx        # Main app with Supabase state sync
└── App.jsx                # Auth-aware routing
```

## Getting Started

### Prerequisites

- Node.js 18+
- A Supabase account (free tier: [supabase.com](https://supabase.com))

### Setup

```bash
git clone https://github.com/YOUR_USERNAME/grindtracker.git
cd grindtracker
npm install
```

### Database

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** → paste the contents of `supabase/migrations/00001_initial_schema.sql` → **Run**
3. This creates all tables (`profiles`, `tasks`, `history`, `journal`, `water_log`, `weight_log`) with RLS policies

### Environment Variables

```bash
cp .env.example .env
```

Fill in your Supabase credentials:

| Variable | Value |
|----------|-------|
| `VITE_SUPABASE_URL` | `https://your-project.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | `sb_publishable_your-anon-key` |

> **Security:** The anon key is designed to be public (it's safe in client-side code). RLS policies enforce data access control.

### Development

```bash
npm run dev     # Start dev server with HMR
npm run build   # Production build to dist/
npm run preview # Preview production build
```

## Deployment (Vercel)

1. Push to GitHub
2. Import repo in Vercel
3. Add environment variables in Vercel project settings:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Deploy (Vercel auto-detects Vite)

### Security Headers

For production, add the following to your Vercel deployment (configured in `vercel.json`):

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" }
      ]
    }
  ]
}
```

## Security

- **Row-Level Security:** All tables have RLS enabled with policies scoped to `auth.uid()`
- **Input Validation:** Length limits on text inputs (500 chars for tasks, 2000 for journal); range checks on weight (20-500 kg) and water (0-3000ml)
- **Content-Security-Policy:** CSP meta tag configured in `index.html`
- **Auth:** Passwords managed by Supabase Auth with built-in rate limiting
- **No server-side deps:** `pg` and other server-only packages are excluded from production builds

## Database Schema

```
profiles
  id UUID [FK → auth.users]
  name TEXT
  created_at TIMESTAMPTZ

tasks
  id UUID | user_id UUID [FK] | section TEXT | text TEXT
  done BOOLEAN | priority TEXT | created_at TIMESTAMPTZ

history
  id UUID | user_id UUID [FK] | date DATE
  gym INT | work INT | habits INT | pct INT

journal
  id UUID | user_id UUID [FK] | date DATE | text TEXT

water_log
  id UUID | user_id UUID [FK] | date DATE | amount INT

weight_log
  id UUID | user_id UUID [FK] | date DATE | kg NUMERIC(5,1)
```

All user-scoped tables include `user_id` with FK to `auth.users` and RLS policies enforcing `auth.uid() = user_id`.

## Color Palette

| Color | Hex | Usage |
|-------|-----|-------|
| Background | `#0a0a0a` | App background |
| Surface | `#0f0f0f` | Sidebar |
| Accent | `#39ff14` | Primary accent, progress indicators |
| Water | `#30d0fe` | Water tracker |
| Gym | `#ff9f0a` | Gym section |
| Work | `#bf5af2` | Work section |
| Habits | `#39ff14` | Habits section |

## License

MIT — see [LICENSE](LICENSE)
