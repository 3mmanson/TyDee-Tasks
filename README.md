# TyDee Tasks

> **Note:** The live application has moved from [Render](https://tydee-tasks.onrender.com) to [Vercel](https://tydee-tasks-pro.vercel.app). The Render deployment is no longer active.

TyDee Tasks is a task management platform designed to help individuals organize, track, and manage their work more effectively through a simple and intuitive interface.

The project was built as an end-to-end exercise in product development and AI-assisted software engineering, covering product planning, user experience design, backend architecture, authentication, deployment, and continuous improvement.

More than just a task manager, TyDee Tasks represents an exploration of how AI can accelerate software development while still requiring human judgment, problem-solving, and ownership.

**Live Application:** [https://tydee-tasks-pro.vercel.app](https://tydee-tasks-pro.vercel.app)

---

## The Problem

Staying organized is often more difficult than the work itself.

Many productivity tools are either too simple to support meaningful workflows or too complex for individuals and small teams that simply want to stay organized and get things done.

TyDee Tasks was created to provide a practical and user-friendly solution for managing tasks without unnecessary complexity.

---

## Key Features

### Authentication & Security

* User registration
* Secure login
* JWT-based authentication
* Password recovery and reset functionality
* Protected routes and session management

### Task Management

* Create tasks
* View tasks
* Update tasks
* Delete tasks
* Manage task information through an intuitive interface

### Platform Infrastructure

* RESTful API architecture
* Input validation
* Cloud deployment
* Persistent data storage

---

## Technology Stack

### Frontend

* React
* Vite
* Tailwind CSS

### Backend

* Node.js
* Express

### Database

* SQLite (sql.js)
* Turso Cloud Database

### Authentication

* JWT
* bcrypt

---

## AI-Assisted Development Workflow

TyDee Tasks was developed using an AI-assisted workflow that combined AI-generated suggestions with hands-on development, testing, and debugging.

AI tools were used throughout the project for:

* Product planning
* Architecture decisions
* Code generation
* Debugging
* Refactoring
* Documentation
* Learning unfamiliar technologies

Rather than relying on AI to build the application independently, every solution required evaluation, modification, testing, and integration into the broader system.

One of the most valuable lessons from this project was learning how to use AI as a development partner while maintaining responsibility for technical decisions and implementation quality.

---

## Challenges & Lessons Learned

Building TyDee Tasks involved solving a variety of technical and product challenges, including:

* Implementing secure authentication workflows
* Connecting frontend and backend systems
* Managing database persistence
* Handling deployment and environment configuration
* Debugging and refining AI-generated solutions

The project reinforced an important lesson:

> AI can significantly accelerate development, but successful products still depend on technical judgment, critical thinking, and continuous iteration.

---

## Key Learnings

Through this project, I gained practical experience in:

* End-to-end product development
* Full-stack web application development
* Authentication and authorization systems
* API design and integration
* Database management
* Cloud deployment
* AI-assisted software development
* Product scoping and iterative improvement

---

## Local Setup

Clone the repository and install dependencies:

```bash
git clone https://github.com/3mmanson/TyDee-Tasks.git
cd TyDee-Tasks

npm install

cd frontend
npm install
cd ..

npm run build
npm start
```

The application will run locally at:

```bash
http://localhost:3000
```

---

## Environment Variables

| Variable   | Description                        |
| ---------- | ---------------------------------- |
| JWT_SECRET | Secret key used for authentication |
| PORT       | Server port                        |
| DB_PATH    | Database file path                 |

---

## Repository Structure

```text
TyDee-Tasks/
├── frontend/
│   └── src/
├── src/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   └── validators/
├── build-entry.js
├── package.json
└── README.md
```

---

## About the Builder

I'm a technology educator, UX practitioner, and AI-assisted builder passionate about creating practical solutions that help people work, learn, and solve problems more effectively.

TyDee Tasks is part of my ongoing journey exploring how AI and modern development tools can empower individuals to build meaningful software products—even when working with limited resources.

---

## Connect

**GitHub:** [https://github.com/3mmanson](https://github.com/3mmanson)

**LinkedIn:** [https://linkedin.com/in/davidemmanson](https://linkedin.com/in/davidemmanson)
