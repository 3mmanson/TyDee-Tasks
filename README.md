# TyDee Tasks

Task management app with React frontend and Node.js/Express backend. Runs fully offline with SQLite.

## Quick Start

```bash
# Install dependencies and build everything
npm run setup

# Start the app
npm start
```

Open `http://localhost:3000` in your browser.

## Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher

That's it. No database server, no internet required after install.

## Manual Setup

```bash
# Install backend dependencies
npm install

# Install and build frontend
cd frontend && npm install && cd .. && npm run build

# Set up database
npm run migrate
npm run seed

# Start
npm start
```

## Environment Variables

Copy `.env.example` to `.env` and set your values:

```bash
cp .env.example .env
```

| Variable     | Description                  | Default |
|-------------|------------------------------|---------|
| `JWT_SECRET` | Secret key for JWT tokens   | (none)  |
| `PORT`       | Server port                 | 3000    |

## Project Structure

```
TyDee-Tasks/
├── frontend/           # React frontend (Vite)
│   ├── src/
│   └── dist/           # Built frontend (served by Express)
├── src/
│   ├── controllers/    # Route handlers
│   ├── models/         # Database models
│   ├── routes/         # API routes
│   ├── validators/     # Input validation
│   ├── migrations/     # Database migrations
│   └── seeds/          # Sample data
├── .env.example        # Environment template
├── knexfile.js         # Database config
└── package.json
```

## API Endpoints

| Method | Endpoint             | Description         |
|--------|---------------------|---------------------|
| POST   | /api/auth/register  | Register new user   |
| POST   | /api/auth/login     | Login               |
| GET    | /api/auth/me        | Get current user    |
| POST   | /api/auth/forgot-password | Request reset  |
| POST   | /api/auth/reset-password | Reset password  |
| GET    | /api/tasks          | Get all tasks       |
| GET    | /api/tasks/:id      | Get task by ID      |
| POST   | /api/tasks          | Create task         |
| PUT    | /api/tasks/:id      | Update task         |
| DELETE | /api/tasks/:id      | Delete task         |

## Tech Stack

- **Frontend**: React, Vite, Tailwind CSS
- **Backend**: Node.js, Express
- **Database**: SQLite (via Knex.js)
- **Auth**: JWT (bcrypt for passwords)
