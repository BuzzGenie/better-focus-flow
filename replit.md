# BFF - Better Focus Flow

## Overview
A personal time-blocking and task scheduling app with an embedded Google Calendar view. Features task management with auto-scheduling, recurring habits, and a warm subdued UI that follows system theme preference. Built as a calmer alternative to bright calendar apps like Reclaim or Google Calendar.

## Architecture
- **Frontend**: React 18 + Vite + TailwindCSS + shadcn/ui components
- **Backend**: Express.js 5 REST API
- **Database**: PostgreSQL (Neon) with Drizzle ORM
- **Routing**: wouter (frontend), Express (backend)
- **State**: TanStack React Query v5
- **Forms**: react-hook-form + zod validation

## Key Features
- Task management (create, edit, delete, priority, duration, deadline, color)
- Auto-scheduling engine (finds open work-hour slots for unscheduled tasks, sorted by priority then deadline)
- Recurring habits (day-of-week selection, preferred time, toggle on/off)
- Embedded Google Calendar panel (toggleable, user-configurable email, dark-mode CSS filter)
- System theme detection with manual toggle (system -> light -> dark cycle)
- Warm, subdued color palette (charcoal/brown dark mode, cream/tan light mode)

## Design
- Default theme: follows system preference
- Dark mode: warm charcoal/brown tones
- Light mode: warm cream/tan tones
- Primary accent: muted teal-blue (hsl 200)
- Layout: Google Calendar (left, toggleable) | Tasks/Habits panel (right, 320px)
- Google Calendar iframe uses CSS invert+hue-rotate filter in dark mode

## Project Structure
- `shared/schema.ts` - Data models (tasks, habits, timeBlocks, settings), Zod schemas, TypeScript types
- `server/routes.ts` - REST API endpoints
- `server/storage.ts` - Database storage layer (IStorage interface + DatabaseStorage implementation)
- `server/scheduler.ts` - Auto-scheduling algorithm (priority-based, conflict-aware, 14-day window)
- `server/seed.ts` - Seed data for initial load
- `server/db.ts` - Drizzle database connection
- `client/src/pages/dashboard.tsx` - Main dashboard page (Google Calendar embed + task/habit tabs)
- `client/src/components/task-panel.tsx` - Task list with status/priority indicators
- `client/src/components/task-dialog.tsx` - Create/edit task form dialog
- `client/src/components/habit-panel.tsx` - Habit list with toggle controls
- `client/src/components/habit-dialog.tsx` - Create/edit habit form dialog
- `client/src/components/week-calendar.tsx` - Weekly calendar grid component
- `client/src/components/theme-provider.tsx` - Theme context (system/light/dark, localStorage sync)
- `client/src/components/theme-toggle.tsx` - Theme cycle button
- `client/src/lib/date-utils.ts` - Date range utilities
- `client/src/lib/queryClient.ts` - TanStack Query client + apiRequest helper

## API Endpoints
- `GET/POST /api/tasks` - List/create tasks
- `PATCH/DELETE /api/tasks/:id` - Update/delete tasks (delete also removes associated time blocks)
- `GET/POST /api/habits` - List/create habits
- `PATCH/DELETE /api/habits/:id` - Update/delete habits
- `GET /api/time-blocks?start=ISO&end=ISO` - Get time blocks for date range
- `POST /api/time-blocks` - Create a time block
- `DELETE /api/time-blocks/:id` - Delete a time block
- `POST /api/auto-schedule` - Auto-schedule all unscheduled tasks into open work-hour slots
- `GET/PATCH /api/settings` - Get/update settings (workStart, workEnd, workDays, minBlockMinutes, gcalEmail)

## Important Implementation Notes
- Deadline dates are sent with `T23:59:59` appended to prevent UTC timezone shift (e.g., Feb 18 stays Feb 18 in all timezones)
- Deadline display uses local date parsing (split on "T" and parse year/month/day) to avoid timezone offset
- Google Calendar embed URL includes browser timezone via `Intl.DateTimeFormat().resolvedOptions().timeZone`
- Task deletion cascades to remove associated time blocks
- Marking a task "done" clears its scheduled times and removes its time blocks
- Auto-scheduler scans 14 days ahead, snaps to 15-minute intervals, respects work hours/days settings

## User Preferences
- Prefers darker, subdued UI - explicitly not like Reclaim or Google Calendar's bright appearance
- Wants Google Calendar visible alongside BFF to avoid switching tabs
- GitHub repo: BuzzGenie/better-focus-flow
