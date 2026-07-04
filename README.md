# Task Management REST API

A complete CRUD REST API for task management built with Node.js, Express, and SQLite.

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: SQLite (local file-based)
- **ORM**: Knex.js (for migrations and queries)
- **Validation**: Joi

## Project Structure

```
Demo_CRUD_REST_API/
├── src/
│   ├── controllers/    # Request handlers
│   ├── models/         # Data access layer
│   ├── routes/         # API route definitions
│   ├── validators/     # Input validation schemas
│   ├── migrations/     # Database migrations
│   ├── seeds/          # Database seed data
│   ├── app.js          # Express app configuration
│   └── server.js       # Server entry point
├── knexfile.js         # Knex configuration
├── tasks.db            # SQLite database file
└── package.json
```

## Installation

```bash
npm install
```

## Setup

1. Run migrations to create the database schema:
```bash
npm run migrate
```

2. Seed the database with sample data:
```bash
npm run seed
```

3. Start the server:
```bash
npm start
```

The API will be available at `http://local/host:3000`

## API Endpoints

| Method | Endpoint      | Description         |
|--------|---------------|---------------------|
| GET    | /api/tasks    | Get all tasks       |
| GET    | /api/tasks/:id| Get task by ID      |
| POST   | /api/tasks    | Create new task     |
| PUT    | /api/tasks/:id| Update task         |
| DELETE | /api/tasks/:id| Delete task         |

## Testing with cURL

### 1. Get All Tasks

```bash
curl -X GET http://localhost:3000/api/tasks
```

**Response:**
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "id": 1,
      "title": "Complete project documentation",
      "description": "Write comprehensive documentation for the REST API project",
      "status": "in_progress",
      "created_at": "2026-04-23T...",
      "updated_at": "2026-04-23T..."
    }
  ]
}
```

### 2. Get Task by ID

```bash
curl -X GET http://localhost:3000/api/tasks/1
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Complete project documentation",
    "description": "Write comprehensive documentation for the REST API project",
    "status": "in_progress",
    "created_at": "2026-04-23T...",
    "updated_at": "2026-04-23T..."
  }
}
```

### 3. Create New Task

```bash
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d "{\"title\":\"New Task\",\"description\":\"Task description\",\"status\":\"pending\"}"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 6,
    "title": "New Task",
    "description": "Task description",
    "status": "pending",
    "created_at": "2026-04-23T...",
    "updated_at": "2026-04-23T..."
  }
}
```

### 4. Update Task

```bash
curl -X PUT http://localhost:3000/api/tasks/1 \
  -H "Content-Type: application/json" \
  -d "{\"title\":\"Updated Task\",\"description\":\"Updated description\",\"status\":\"completed\"}"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Updated Task",
    "description": "Updated description",
    "status": "completed",
    "created_at": "2026-04-23T...",
    "updated_at": "2026-04-23T..."
  }
}
```

### 5. Delete Task

```bash
curl -X DELETE http://localhost:3000/api/tasks/1
```

**Response:**
```json
{
  "success": true,
  "message": "Task deleted successfully"
}
```

### 6. Test Validation (Missing Required Field)

```bash
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d "{\"description\":\"No title provided\"}"
```

**Response:**
```json
{
  "success": false,
  "error": "Validation failed",
  "details": ["Title is required"]
}
```

### 7. Test 404 (Task Not Found)

```bash
curl -X GET http://localhost:3000/api/tasks/999
```

**Response:**
```json
{
  "success": false,
  "error": "Task not found"
}
```

## Task Schema

| Field       | Type    | Required | Description                              |
|-------------|---------|----------|------------------------------------------|
| title       | string  | Yes      | Task title (1-255 characters)            |
| description | string  | No       | Task description                         |
| status      | string  | No       | One of: pending, in_progress, completed  |

## Available Scripts

| Command            | Description                                    |
|--------------------|------------------------------------------------|
| `npm start`        | Start the server                               |
| `npm run migrate`  | Run database migrations                        |
| `npm run seed`     | Seed database with sample data                 |
| `npm run db:reset` | Reset database (rollback + migrate + seed)     |

## Error Handling

All endpoints return consistent JSON responses:

**Success:**
```json
{ "success": true, "data": {...} }
```

**Error:**
```json
{ "success": false, "error": "Error message" }
```
