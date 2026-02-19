# BFF - Better Focus Flow

## Overview
A simplified personal time blocking and task scheduling app. Features a weekly calendar view, task management with auto-scheduling, recurring habits, and an embedded Google Calendar view for side-by-side reference.

## Architecture
- **Frontend**: React + Vite + TailwindCSS + shadcn/ui components
- **Backend**: Express.js REST API
- **Database**: PostgreSQL with Drizzle ORM
- **Routing**: wouter (frontend), Express (backend)

## Key Features
- Weekly calendar view with time blocks
- Task management (create, edit, delete, priority, duration, deadline)
- Habits (recurring time blocks with day-of-week selection)
- Auto-scheduling engine (finds open work-hour slots for unscheduled tasks)
- Embedded Google Calendar panel (toggleable, user-configurable email)
- Dark/light theme toggle (defaults to dark)
- Warm, subdued color palette (not bright like typical calendar apps)

## Design
- Default theme: dark with warm charcoal/brown tones
- Light theme: warm cream/tan tones
- Primary accent: muted teal-blue (hsl 200)
- Layout: Google Calendar (left, 45%) | BFF Calendar (center) | Tasks/Habits panel (right, 72px fixed)

## Project Structure
- `shared/schema.ts` - Data models (tasks, habits, timeBlocks, settings with gcalEmail)
- `server/routes.ts` - API endpoints
- `server/storage.ts` - Database storage layer
- `server/scheduler.ts` - Auto-scheduling algorithm
- `server/seed.ts` - Seed data for initial load
- `client/src/pages/dashboard.tsx` - Main dashboard page
- `client/src/components/` - UI components (calendar, task/habit panels, dialogs)
- `client/src/components/theme-provider.tsx` - Theme context (defaults to dark)

## API Endpoints
- `GET/POST /api/tasks` - List/create tasks
- `PATCH/DELETE /api/tasks/:id` - Update/delete tasks
- `GET/POST /api/habits` - List/create habits
- `PATCH/DELETE /api/habits/:id` - Update/delete habits
- `GET /api/time-blocks?start=&end=` - Get time blocks for date range
- `POST /api/auto-schedule` - Auto-schedule unscheduled tasks
- `GET/PATCH /api/settings` - Get/update settings (includes gcalEmail for Google Calendar embed)

## User Preferences
- Prefers darker, subdued UI - explicitly not like Reclaim or Google Calendar's bright appearance
- Wants Google Calendar visible alongside BFF to avoid switching tabs
- GitHub repo: BuzzGenie/better-focus-flow
