# BFF - Better Focus Flow

A personal time-blocking and task scheduling app with an embedded Google Calendar view, built for people who want a calmer, more focused planning experience.

---

## Features

### Task Management
- Create, edit, and delete tasks with title, description, priority, duration, deadline, and color
- Four priority levels: critical, high, medium, low
- Status tracking: todo, in-progress, done
- Configurable duration in minutes for accurate scheduling
- Optional deadline dates with timezone-safe storage

### Auto-Scheduling Engine
- One-click scheduling of all unscheduled tasks into open work-hour slots
- Prioritizes tasks by priority level (critical first), then by earliest deadline
- Respects configurable work hours and work days
- Avoids conflicts with existing time blocks
- Scans a 14-day window from today to find available slots
- Snaps to 15-minute intervals for clean calendar placement

### Recurring Habits
- Create habits with preferred time of day (morning, afternoon, evening)
- Select which days of the week each habit is active
- Toggle habits on/off without deleting them
- Configurable duration and color per habit

### Google Calendar Integration
- Embedded Google Calendar iframe displayed side-by-side with the task panel
- User-configurable email address (stored in settings, not hardcoded)
- Toggleable panel to show/hide the calendar view
- Automatic dark-mode filter applied to the iframe (CSS invert + hue-rotate) for visual consistency
- Detects browser timezone and passes it to the embed URL

### Theming
- System theme detection (follows OS light/dark preference by default)
- Manual toggle cycles through: system, light, dark
- Dark mode: warm charcoal/brown tones (not bright like typical calendar apps)
- Light mode: warm cream/tan tones
- Primary accent: muted teal-blue

### Settings
- Configurable work start and end times (default 09:00 - 17:00)
- Configurable work days (default Monday - Friday)
- Minimum scheduling block size in minutes
- Google Calendar email address

---

## Tech Stack

| Layer     | Technology                                |
|-----------|-------------------------------------------|
| Frontend  | React 18, Vite, TailwindCSS, shadcn/ui   |
| Backend   | Express.js 5 (REST API)                   |
| Database  | PostgreSQL (Neon), Drizzle ORM            |
| Routing   | wouter (client), Express (server)         |
| State     | TanStack React Query v5                   |
| Forms     | react-hook-form + zod validation          |
| Icons     | lucide-react                              |
| Dates     | date-fns                                  |

---

## Project Structure

```
├── client/
│   └── src/
│       ├── pages/
│       │   ├── dashboard.tsx          # Main app page (Google Calendar + task/habit panels)
│       │   └── not-found.tsx          # 404 page
│       ├── components/
│       │   ├── task-panel.tsx          # Task list with filters and actions
│       │   ├── task-dialog.tsx         # Create/edit task form dialog
│       │   ├── habit-panel.tsx         # Habit list with toggle controls
│       │   ├── habit-dialog.tsx        # Create/edit habit form dialog
│       │   ├── week-calendar.tsx       # Weekly calendar grid component
│       │   ├── theme-provider.tsx      # Theme context (system/light/dark)
│       │   ├── theme-toggle.tsx        # Theme toggle button
│       │   └── ui/                    # shadcn/ui base components
│       ├── hooks/
│       │   ├── use-toast.ts           # Toast notification hook
│       │   └── use-mobile.tsx         # Mobile detection hook
│       └── lib/
│           ├── queryClient.ts         # TanStack Query client + API helper
│           ├── date-utils.ts          # Date range utilities
│           ├── constants.ts           # App-wide constants
│           └── utils.ts              # Utility functions (cn, etc.)
├── server/
│   ├── index.ts                       # Server entry point
│   ├── routes.ts                      # REST API route definitions
│   ├── storage.ts                     # Database storage layer (IStorage interface)
│   ├── scheduler.ts                   # Auto-scheduling algorithm
│   ├── seed.ts                        # Initial seed data
│   ├── db.ts                          # Drizzle database connection
│   ├── vite.ts                        # Vite dev server integration
│   └── static.ts                      # Static file serving (production)
├── shared/
│   └── schema.ts                      # Data models, Zod schemas, TypeScript types
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── vite.config.ts
└── drizzle.config.ts
```

---

## Data Models

### Task
| Field          | Type       | Description                           |
|----------------|------------|---------------------------------------|
| id             | varchar    | UUID primary key (auto-generated)     |
| title          | text       | Task name (required)                  |
| description    | text       | Optional description                  |
| priority       | text       | critical, high, medium, low           |
| duration       | integer    | Duration in minutes (default 30)      |
| deadline       | timestamp  | Optional deadline date                |
| scheduledStart | timestamp  | Auto-scheduled start time             |
| scheduledEnd   | timestamp  | Auto-scheduled end time               |
| status         | text       | todo, in-progress, done               |
| color          | text       | Hex color code (default #3B82F6)      |

### Habit
| Field         | Type       | Description                           |
|---------------|------------|---------------------------------------|
| id            | varchar    | UUID primary key (auto-generated)     |
| title         | text       | Habit name (required)                 |
| duration      | integer    | Duration in minutes (default 30)      |
| preferredTime | text       | morning, afternoon, evening           |
| daysOfWeek    | int[]      | Array of day numbers (0=Sun, 6=Sat)   |
| color         | text       | Hex color code (default #8B5CF6)      |
| active        | boolean    | Whether the habit is enabled          |
| startTime     | text       | Optional specific start time          |

### TimeBlock
| Field       | Type       | Description                           |
|-------------|------------|---------------------------------------|
| id          | varchar    | UUID primary key (auto-generated)     |
| title       | text       | Block label (required)                |
| startTime   | timestamp  | Block start time                      |
| endTime     | timestamp  | Block end time                        |
| blockType   | text       | task, habit, or manual                |
| referenceId | varchar    | Links to originating task/habit ID    |
| color       | text       | Hex color code                        |

### Settings
| Field           | Type    | Description                             |
|-----------------|---------|-----------------------------------------|
| id              | varchar | UUID primary key (auto-generated)       |
| workStart       | text    | Work day start time (default "09:00")   |
| workEnd         | text    | Work day end time (default "17:00")     |
| workDays        | int[]   | Active work days (default [1,2,3,4,5])  |
| minBlockMinutes | integer | Minimum scheduling block (default 15)   |
| gcalEmail       | text    | Google Calendar email for embed         |

---

## API Reference

### Tasks

| Method | Endpoint          | Description                   | Body                                                    |
|--------|-------------------|-------------------------------|---------------------------------------------------------|
| GET    | /api/tasks        | List all tasks                | -                                                       |
| POST   | /api/tasks        | Create a task                 | `{title, description?, priority?, duration?, deadline?, color?}` |
| PATCH  | /api/tasks/:id    | Update a task                 | Partial task fields                                     |
| DELETE | /api/tasks/:id    | Delete a task and its blocks  | -                                                       |

### Habits

| Method | Endpoint          | Description                   | Body                                                    |
|--------|-------------------|-------------------------------|---------------------------------------------------------|
| GET    | /api/habits       | List all habits               | -                                                       |
| POST   | /api/habits       | Create a habit                | `{title, duration?, preferredTime?, daysOfWeek?, color?}` |
| PATCH  | /api/habits/:id   | Update a habit                | Partial habit fields                                    |
| DELETE | /api/habits/:id   | Delete a habit and its blocks | -                                                       |

### Time Blocks

| Method | Endpoint             | Description                           | Query/Body                    |
|--------|----------------------|---------------------------------------|-------------------------------|
| GET    | /api/time-blocks     | Get blocks in a date range            | `?start=ISO&end=ISO`          |
| POST   | /api/time-blocks     | Create a time block                   | `{title, startTime, endTime, blockType?, referenceId?, color?}` |
| DELETE | /api/time-blocks/:id | Delete a time block                   | -                             |

### Auto-Schedule

| Method | Endpoint           | Description                                    |
|--------|--------------------|------------------------------------------------|
| POST   | /api/auto-schedule | Schedule all unscheduled tasks into open slots  |

### Settings

| Method | Endpoint       | Description                          | Body                                      |
|--------|----------------|--------------------------------------|-------------------------------------------|
| GET    | /api/settings  | Get current settings                 | -                                         |
| PATCH  | /api/settings  | Update settings                      | `{workStart?, workEnd?, workDays?, minBlockMinutes?, gcalEmail?}` |

---

## Auto-Scheduling Algorithm

1. Fetches all tasks with status != "done" and no `scheduledStart`
2. Sorts by priority (critical > high > medium > low), then by earliest deadline
3. Loads existing time blocks for the next 14 days to detect conflicts
4. For each unscheduled task:
   - Scans work hours on configured work days
   - Starts from the current time (rounded up to the next 15-minute mark)
   - Checks each potential slot against all existing blocks for conflicts
   - When a free slot is found, creates a time block and updates the task's scheduled times
   - Adds the new block to the busy list so subsequent tasks don't overlap

---

## Running Locally

```bash
# Install dependencies
npm install

# Push database schema
npm run db:push

# Start development server (frontend + backend on port 5000)
npm run dev
```

The app runs at `http://localhost:5000`.

---

## Environment Variables

| Variable       | Description                      |
|----------------|----------------------------------|
| DATABASE_URL   | PostgreSQL connection string     |
| SESSION_SECRET | Express session secret           |

---

## License

MIT
