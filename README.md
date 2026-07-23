# 🌞 Sun Forge

**A digital service and support platform for decentralised solar systems** — real-time monitoring, AI-powered panel inspection, and automated issue triage in one dashboard.

🔗 **Live demo:** [v0-sun-forge-app.vercel.app](https://v0-sun-forge-app.vercel.app)

---

## Overview

Sun Forge bridges solar hardware and digital intelligence for operators managing distributed solar installations. It combines live IoT telemetry from ESP32-based sensor units with an AI vision model that inspects panel photos for dust, cracks, bird droppings, and other defects — then routes each detected issue down a DIY-guide path or a technician-dispatch path depending on severity.

## Features

| Area | What it does |
|---|---|
| **Dashboard** | System-wide stats, energy production/consumption charts, weekly output trends, and an active alerts feed |
| **Live Monitor** | Streams voltage/current/power telemetry (blends real ESP32 readings from Supabase with a simulated INA219 sensor feed), tracks uptime/downtime, efficiency, and a computed performance grade |
| **Devices** | Fleet view of all connected panels/inverters, merging live Supabase-backed devices with demo devices; search and status filtering |
| **AI Inspection** | Upload a panel photo and get an AI-generated condition report — issue type, severity, confidence score, bounding-box region, and recommended action |
| **Issues** | Classifies faults as customer-solvable (with step-by-step DIY guides, tools, time estimate, safety notes) or technician-required (critical/electrical faults) |
| **Recovery** | Before/after power-output comparisons for resolved issues, with energy recovered and estimated cost savings (₹/kWh) |
| **Technicians** | Searchable directory of certified technicians with contact info, rating, and availability |
| **Theming** | Light/dark mode via `next-themes`, default dark |

## Tech Stack

- **Framework:** Next.js 16 (App Router), React 19, TypeScript
- **Styling/UI:** Tailwind CSS 4, shadcn/ui (`new-york` style) on Radix UI primitives, Lucide icons
- **Charts:** Recharts
- **Backend/DB:** Supabase (Postgres) for device registry and sensor readings
- **AI:** Vercel AI SDK (`ai`) with `@ai-sdk/groq` — panel inspection runs on Groq's `meta-llama/llama-4-scout-17b-16e-instruct` vision model via structured (Zod-validated) output. `@ai-sdk/openai` and `@ai-sdk/google` are also present as dependencies for optional provider swaps.
- **Analytics:** Vercel Analytics
- **Package manager:** pnpm (npm lockfile also present)

## Project Structure

```
SunForge/
├── app/
│   ├── about/                    # Platform overview, feature grid, "how it works"
│   ├── api/
│   │   ├── devices/               # GET all devices + latest reading
│   │   │   └── [id]/readings/     # GET last 50 readings for one device
│   │   ├── inspect-panel/         # POST photo → AI panel inspection
│   │   └── iot-ingest/            # POST sensor reading from an ESP32 device
│   ├── devices/                   # Device fleet management UI
│   ├── inspection/                # AI photo-inspection UI
│   ├── issues/                    # Issue triage: DIY guides vs. technician escalation
│   ├── monitoring/                # Live monitor (real + simulated telemetry)
│   ├── recovery/                  # Before/after recovery & savings reports
│   ├── technicians/               # Technician directory
│   ├── layout.tsx                 # Root layout, theming, metadata
│   └── page.tsx                   # Dashboard (home)
├── components/
│   ├── app-shell.tsx              # Sidebar nav, top bar, alerts popover
│   ├── dashboard/                 # Stat cards, energy chart, weekly chart, alerts panel
│   ├── devices/                   # Device card
│   ├── issues/                    # DIY guide, power recordings
│   ├── ui/                        # shadcn/ui primitives
│   ├── theme-provider.tsx
│   └── theme-toggle.tsx
├── hooks/                         # use-mobile, use-toast
├── lib/
│   ├── solar-data.ts              # Domain types, problem database, demo dataset, helpers
│   ├── supabase.ts                # Supabase client
│   └── utils.ts
├── public/                        # Icons, placeholders
├── styles/                        # Global styles
├── test-ai.js                     # Standalone script to sanity-check the Groq API key
└── package.json
```

## Getting Started

### Prerequisites
- Node.js 18+
- pnpm (recommended) or npm
- A [Groq API key](https://console.groq.com) for AI inspection
- A [Supabase](https://supabase.com) project for live device data (optional — see below)

### Installation

```bash
git clone https://github.com/DSiddharth24/SunForge.git
cd SunForge
pnpm install   # or: npm install
```

### Environment Variables

Create a `.env.local` file in the project root:

```env
GROQ_API_KEY=your_groq_api_key
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
IOT_API_KEY=your_shared_secret_for_esp32_devices
```

| Variable | Required | Used by | Notes |
|---|---|---|---|
| `GROQ_API_KEY` | Yes | `/api/inspect-panel` | Without it, AI inspection returns a config error |
| `NEXT_PUBLIC_SUPABASE_URL` | Recommended | `lib/supabase.ts` | Currently falls back to a hardcoded project URL if unset — set your own before deploying |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Recommended | `lib/supabase.ts` | Same as above — replace the fallback for your own deployment |
| `IOT_API_KEY` | Recommended | `/api/iot-ingest` | Shared secret ESP32 units send as `x-api-key`; defaults to `test1234` if unset |

### Run the dev server

```bash
pnpm dev   # or: npm run dev
```

Visit `http://localhost:3000`.

## Database Schema (Supabase)

No migrations are checked into the repo — the tables below are inferred from the queries in `app/api/`. Create them in your Supabase project's SQL editor:

```sql
create table devices (
  device_id   text primary key,
  name        text,
  location    text,
  status      text default 'offline',   -- online | warning | offline
  last_seen   timestamptz,
  created_at  timestamptz default now()
);

create table esp32_solar_readings (
  id                 bigint generated always as identity primary key,
  device_id          text references devices(device_id),
  voltage            numeric,
  current_estimated  numeric,
  power_watts        numeric,
  efficiency         numeric,
  shunt_voltage      numeric,
  recorded_at        timestamptz default now()
);
```

## API Reference

| Method | Route | Purpose | Auth |
|---|---|---|---|
| `GET` | `/api/devices` | List all devices with each device's latest reading | none |
| `GET` | `/api/devices/[id]/readings` | Last 50 readings for a device, newest first | none |
| `POST` | `/api/iot-ingest` | Insert a new sensor reading and mark the device online | `x-api-key` header |
| `POST` | `/api/inspect-panel` | Run AI vision inspection on an uploaded panel photo | `GROQ_API_KEY` (server-side) |

### Posting from an ESP32

```bash
curl -X POST https://your-deployment-url/api/iot-ingest \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_IOT_API_KEY" \
  -d '{
    "device_id": "ESP32-001",
    "voltage": 34.8,
    "current": 8.9,
    "power": 309.7,
    "efficiency": 92,
    "shunt_voltage": 0.045
  }'
```

The Live Monitor page polls `/api/devices/ESP32-001/readings` every 5 seconds, so a device registered with that ID appears there automatically.

## App Routes

| Route | Page |
|---|---|
| `/` | Dashboard |
| `/monitoring` | Live Monitor |
| `/devices` | Devices |
| `/inspection` | AI Inspection |
| `/issues` | Issues |
| `/recovery` | Recovery |
| `/technicians` | Technicians |
| `/about` | About |

## Scripts

| Command | Description |
|---|---|
| `pnpm dev` | Start the development server |
| `pnpm build` | Production build |
| `pnpm start` | Start the production server |
| `pnpm lint` | Run ESLint |

## Deployment

Built with [v0.app](https://v0.app) and deployed on [Vercel](https://vercel.com). `next.config.mjs` currently sets `typescript.ignoreBuildErrors: true` and `images.unoptimized: true` — tighten these before a production launch.

## Notes for Contributors

- `lib/solar-data.ts` seeds the UI with a demo dataset (devices, alerts, technicians, recovery reports) so the app is fully explorable without any live hardware connected. Live Supabase devices, once present, are merged in and take precedence over demo entries with matching IDs.
- Rotate the hardcoded Supabase URL/anon key fallback in `lib/supabase.ts` before deploying your own instance.
