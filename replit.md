# Reclaim - Personal Time Blocking & Task Scheduler

## Overview
A simplified personal version of Reclaim.ai for time blocking and task scheduling. Features a weekly calendar view, task management with auto-scheduling, and recurring habits.

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
- Dark/light theme toggle

## Project Structure
- `shared/schema.ts` - Data models (tasks, habits, timeBlocks, settings)
- `server/routes.ts` - API endpoints
- `server/storage.ts` - Database storage layer
- `server/scheduler.ts` - Auto-scheduling algorithm
- `server/seed.ts` - Seed data for initial load
- `client/src/pages/dashboard.tsx` - Main dashboard page
- `client/src/components/` - UI components (calendar, task/habit panels, dialogs)

## API Endpoints
- `GET/POST /api/tasks` - List/create tasks
- `PATCH/DELETE /api/tasks/:id` - Update/delete tasks
- `GET/POST /api/habits` - List/create habits
- `PATCH/DELETE /api/habits/:id` - Update/delete habits
- `GET /api/time-blocks?start=&end=` - Get time blocks for date range
- `POST /api/auto-schedule` - Auto-schedule unscheduled tasks
- `GET/PATCH /api/settings` - Get/update work hour settings
