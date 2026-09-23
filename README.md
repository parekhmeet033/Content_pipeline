# ContentNova — AI-Powered Content Marketing Platform

Full-stack SaaS app: React + Vite frontend, Node/Express backend, PostgreSQL via Prisma, JWT auth, and AI content generation via an OpenAI-compatible API.

## Project structure

```
ContentNova/
  backend/            Express API (src/routes, controllers, services, middleware, validators, utils)
  backend/prisma/     schema.prisma + migrations
  frontend/           React (Vite) SPA (src/pages, components, api, context, hooks, routes)
  package.json        root convenience scripts (concurrently)
```

## Setup

1. Install dependencies:
   ```
   npm run install:all
   ```
2. Create the database (adjust for your Postgres install):
   ```
   psql -U postgres -c "CREATE ROLE contentnova_user WITH LOGIN PASSWORD 'yourpassword' CREATEDB;"
   psql -U postgres -c "CREATE DATABASE contentnova OWNER contentnova_user;"
   ```
3. Copy env templates and fill in real values:
   ```
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env
   ```
4. Run migrations:
   ```
   cd backend && npx prisma migrate dev
   ```
5. Start both servers:
   ```
   npm run dev
   ```
   Backend: http://localhost:5000 · Frontend: http://localhost:5173

## Environment variables

See `backend/.env.example` and `frontend/.env.example` for the full list. Required for AI features: `OPENAI_API_KEY` (works with OpenAI directly, or any OpenAI-compatible provider via `OPENAI_BASE_URL`, e.g. OpenRouter).

## Scope notes

- Scheduling sets a `scheduledAt` + `SCHEDULED` status; there's no background worker that auto-publishes at that time — publishing is a manual action.
- Notifications are in-app/DB-backed with polling, not real-time push.
- Search is case-insensitive `contains` matching, not full-text search.
