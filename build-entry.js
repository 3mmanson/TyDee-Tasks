const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

// Resolve paths relative to executable (for .exe) or CWD (for node)
const isPkg = typeof process.pkg !== 'undefined';
const appDir = isPkg ? path.dirname(process.execPath) : process.cwd();

// Ensure data directory exists next to the exe
const dataDir = path.join(appDir, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Generate JWT_SECRET if not set
const configPath = path.join(dataDir, 'config.json');
if (!process.env.JWT_SECRET) {
  if (fs.existsSync(configPath)) {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    process.env.JWT_SECRET = config.JWT_SECRET;
  } else {
    const secret = crypto.randomBytes(64).toString('hex');
    fs.writeFileSync(configPath, JSON.stringify({ JWT_SECRET: secret }, null, 2));
    process.env.JWT_SECRET = secret;
    console.log('Generated JWT secret and saved to data/config.json');
  }
}

// Set DB path to data directory
process.env.DB_PATH = path.join(dataDir, 'tasks.db');
if (!process.env.PORT) {
  process.env.PORT = '3000';
}

// Create tables and seed using sql.js directly
async function setupDatabase() {
  const initSqlJs = require('sql.js');
  const SQL = await initSqlJs();

  if (fs.existsSync(process.env.DB_PATH)) {
    console.log('Database found at ' + process.env.DB_PATH);
    return;
  }

  console.log('First run: setting up database...');
  const db = new SQL.Database();

  db.run('PRAGMA journal_mode = WAL');
  db.run('PRAGMA foreign_keys = ON');

  db.run(`CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`ALTER TABLE tasks ADD COLUMN user_id INTEGER REFERENCES users(id) ON DELETE CASCADE`);
  db.run(`ALTER TABLE tasks ADD COLUMN priority VARCHAR(10) DEFAULT 'Medium'`);
  db.run(`ALTER TABLE tasks ADD COLUMN due_date DATE`);

  db.run(`CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    used INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`);

  // Seed sample tasks
  const now = new Date().toISOString();
  const seedTasks = [
    ['Complete project documentation', 'Write comprehensive documentation for the REST API project', 'in_progress'],
    ['Review pull requests', 'Review and approve pending PRs from the team', 'pending'],
    ['Set up CI/CD pipeline', 'Configure GitHub Actions for automated testing and deployment', 'completed'],
    ['Fix authentication bug', 'Resolve the token expiration issue in the login flow', 'pending'],
    ['Database optimization', 'Add indexes and optimize queries for better performance', 'in_progress']
  ];

  const stmt = db.prepare('INSERT INTO tasks (title, description, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?)');
  for (const [title, desc, status] of seedTasks) {
    stmt.run([title, desc, status, now, now]);
  }
  stmt.free();

  // Save to file
  const data = db.export();
  fs.writeFileSync(process.env.DB_PATH, Buffer.from(data));
  db.close();

  console.log('Database initialized with sample tasks.');
}

// Start the app
async function main() {
  await setupDatabase();

  // Set CWD to app directory for knex/DB resolution
  process.chdir(appDir);

  require('./src/server');
}

main().catch(err => {
  console.error('Failed to start:', err);
  process.exit(1);
});
