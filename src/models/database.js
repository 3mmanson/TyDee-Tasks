const { createClient } = require('@libsql/client');

let client;

function getClient() {
  if (!client) {
    client = createClient({
      url: process.env.TURSO_DATABASE_URL || 'file:local.db',
      authToken: process.env.TURSO_AUTH_TOKEN || undefined,
    });
  }
  return client;
}

async function query(sql, params = []) {
  const db = getClient();
  const result = await db.execute({ sql, args: params });
  return result.rows;
}

async function run(sql, params = []) {
  const db = getClient();
  const result = await db.execute({ sql, args: params });
  return { changes: result.rowsAffected, lastInsertRowid: Number(result.lastInsertRowid) };
}

async function execute(sql) {
  const db = getClient();
  return db.execute(sql);
}

async function migrate() {
  try {
    await execute("ALTER TABLE tasks ADD COLUMN completed_at TEXT");
  } catch {
    // Column already exists — ignore
  }
  try {
    await execute("ALTER TABLE users ADD COLUMN is_admin INTEGER DEFAULT 0");
  } catch {
    // Column already exists — ignore
  }
  try {
    await execute("ALTER TABLE tasks ADD COLUMN deleted_at TEXT");
  } catch {
    // Column already exists — ignore
  }
  try {
    await execute(`CREATE TABLE IF NOT EXISTS kpi_daily_snapshots (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      snapshot_date TEXT NOT NULL,
      tasks_completed INTEGER DEFAULT 0,
      pending_tasks INTEGER DEFAULT 0,
      at_risk INTEGER DEFAULT 0,
      completion_rate REAL DEFAULT 0,
      UNIQUE(user_id, snapshot_date)
    )`);
  } catch {
    // Table already exists — ignore
  }
  // Ensure emmansonstronger@gmail.com is admin
  try {
    await execute("UPDATE users SET is_admin = 1 WHERE email = 'emmansonstronger@gmail.com'");
  } catch {
    // Ignore if user doesn't exist yet
  }
}

module.exports = { query, run, execute, getClient, migrate };
