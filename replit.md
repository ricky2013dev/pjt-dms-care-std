# DMS Care Center

## Overview
A student management system (DMS Care Center) with user authentication, student tracking, and notes management.

## Tech Stack
- **Frontend**: React with Vite, TailwindCSS, Radix UI components
- **Backend**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Passport.js with local strategy

## Project Structure
```
├── client/             # React frontend
│   ├── src/           # Source files
│   └── index.html     # Entry HTML
├── server/            # Express backend
│   ├── auth/          # Authentication logic
│   ├── routes.ts      # API routes
│   └── index.ts       # Server entry point
├── shared/            # Shared types and schemas
│   └── schema.ts      # Drizzle database schema
└── data/              # Data files
```

## Database Schema
- `users` - User accounts with authentication
- `login_history` - User login tracking
- `birthdays` - Birthday records
- `students` - Student management records
- `student_notes` - Notes attached to students

## Running the App
- Development: `npm run dev`
- Production build: `npm run build`
- Production start: `npm run start`

## Environment Variables
- `DATABASE_URL` - PostgreSQL connection string (auto-configured)
