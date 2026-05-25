# Serenity Cove — Resort Management Dashboard

A full-stack hospitality management system for resort operations. Built with Next.js 14 App Router, Supabase, and Tailwind CSS.

---

## Features

| Module | Description |
|---|---|
| **Summary** | At-a-glance dashboard: occupancy, revenue, weather, and guest stats |
| **Calendar** | Visual booking calendar with check-in/check-out overview |
| **Reservations** | Reservation approval queue, guest records, and booking management |
| **Guests** | Guest profiles, stay history, and loyalty tracking |
| **Cleaning** | Venue/room cleaning assignments and status map |
| **Staff Tasks** | Task assignment and progress tracking for staff |
| **Records** | Financial records, incident logs, and venue records |
| **Reviews** | Customer feedback and review management |
| **Reports** | Analytical reports across three sub-tabs: |
| | — Revenue Reports: weekly revenue, outstanding balances, refunds |
| | — Occupancy Reports: occupancy rate trends, booking frequency, peak dates |
| | — Guest Analytics: source breakdown, frequent guests |
| **Settings** | App configuration and preferences |

---

## Tech Stack

- **Framework** — [Next.js 14.2](https://nextjs.org) (App Router, server components, `force-dynamic` pages)
- **Database** — [Supabase](https://supabase.com) (PostgreSQL + auth + real-time)
- **Styling** — [Tailwind CSS](https://tailwindcss.com) with custom CSS variable theming (light + dark)
- **Icons** — [react-bootstrap-icons](https://www.npmjs.com/package/react-bootstrap-icons)
- **Font** — [Geist](https://vercel.com/font)
- **Language** — TypeScript

---

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

> `SUPABASE_SERVICE_ROLE_KEY` is server-only and must never be exposed to the client.

### 3. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The app redirects to `/dashboard/summary` after login.

---

## Project Structure

```
app/
  login/                  # Auth page
  dashboard/
    summary/              # Overview page
    calendar/             # Booking calendar
    reservation/          # Reservation approval
    guests/               # Guest management
    cleaning/             # Cleaning assignments
    staff-task/           # Staff task board
    records/              # Financial & incident records
    reviews/              # Customer feedback
    reports/
      revenue-reports/    # Financial analytics
      occupancy-reports/  # Occupancy analytics
      guest-analytics/    # Guest source analytics
    settings/             # App settings
  api/
    live-conditions/      # Weather/live data API route

components/
  dashboard/              # Page-level view components
  reports/                # FinancialReportsClient, ReservationReportsClient, ScopeFilter
  layout/                 # Shell, sidebar, topbar
  ui/                     # Shared UI primitives

lib/
  supabase/               # Supabase client helpers (browser + service)
  data/                   # Server-side data query functions
  intelligence.ts         # AI/summary helpers
  weather.ts              # Live weather fetching
  utils.ts                # Shared utilities
```

---

## Authentication

Login is handled via Supabase Auth. The `middleware.ts` at the project root protects all `/dashboard` routes and redirects unauthenticated users to `/login`.

---

## Theming

The app supports light and dark modes via a `[data-theme="dark"]` CSS attribute on the root element. All colors are driven by CSS custom properties defined in `styles/globals.css`. SVG charts use `--chart-stroke` and `--chart-dot-bg` variables so graph lines and fills adapt to the active theme.

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

---

## License

Copyright 2026 Jekk

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
