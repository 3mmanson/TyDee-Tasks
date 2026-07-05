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
}

module.exports = { query, run, execute, getClient, migrate };
