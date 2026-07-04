# TyDee Tasks

Task management app with React frontend and Node.js/Express backend. Runs fully offline with SQLite.

## Download (Windows)

Download **[TyDee-Tasks.zip](https://github.com/3mmanson/TyDee-Tasks/releases/download/v1.0.0/TyDee-Tasks.zip)** from Releases.

1. Extract the ZIP
2. Double-click **Start.bat**
3. Browser opens to http://localhost:3000

No Node.js installation required — it's bundled.

## Developer Setup

```bash
npm install
cd frontend && npm install && cd ..
npm run build
npm start
```

Open `http://localhost:3000`.

## Environment Variables

| Variable     | Description              | Default |
|-------------|--------------------------|---------|
| `JWT_SECRET` | Secret key for JWT tokens | Auto-generated |
| `PORT`       | Server port              | 3000    |
| `DB_PATH`    | Database file path       | ./data/tasks.db |

## Project Structure

```
TyDee-Tasks/
├── frontend/           # React frontend (Vite)
│   └── src/
├── src/
│   ├── controllers/    # Route handlers
│   ├── models/         # Database models (sql.js)
│   ├── routes/         # API routes
│   └── validators/     # Input validation
├── build-entry.js      # Entry point (DB init + server start)
├── knexfile.js         # Legacy config (unused)
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
- **Database**: SQLite (via sql.js — pure WASM, no native bindings)
- **Auth**: JWT (bcrypt for passwords)
