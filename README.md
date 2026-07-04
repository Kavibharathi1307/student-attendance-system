# Student Attendance Monitoring and Analytics System

Production-quality project foundation for a Student Attendance Monitoring and Analytics System.

This scaffold includes:

- React with Vite
- Tailwind CSS
- React Router DOM
- Axios
- Chart.js and React Chart.js bindings
- Node.js and Express.js
- JWT authentication utilities
- bcryptjs dependency
- SQLite with better-sqlite3
- dotenv and CORS configuration
- multer upload configuration

Application features are intentionally not implemented yet. The project currently provides the structure, configuration, dependency setup, starter route wiring, and database initialization needed to begin feature development.

## Project Structure

```text
student-attendance-system/
  client/
  server/
  database/
  docs/
```

## Prerequisites

- Node.js 20 or newer
- npm 10 or newer

## Setup

Install dependencies for both apps:

```bash
npm run install:all
```

Create environment files:

```bash
cp client/.env.example client/.env
cp server/.env.example server/.env
```

Initialize the SQLite database:

```bash
npm run db:init --prefix server
```

Run the backend:

```bash
npm run dev:server
```

Run the frontend in a second terminal:

```bash
npm run dev:client
```

Frontend: `http://localhost:5173`

Backend health check: `http://localhost:5000/api/health`

## Environment Variables

Client variables live in `client/.env`.

Server variables live in `server/.env`.

Use `.env.example`, `client/.env.example`, and `server/.env.example` as templates.

## Database

The server uses SQLite through `better-sqlite3`.

Default database path:

```text
server/database/attendance.sqlite
```

The starter schema only creates a `schema_migrations` table. Feature tables should be added when application features are implemented.
