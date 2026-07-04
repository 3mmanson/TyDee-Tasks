const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const DB_PATH = process.env.DB_PATH || path.join(process.cwd(), 'tasks.db');

let db;
let sqlPromise;

function getSql() {
  if (!sqlPromise) sqlPromise = initSqlJs();
  return sqlPromise;
}

async function getDb() {
  if (db) return db;

  const SQL = await getSql();

  if (fs.existsSync(DB_PATH)) {
    const buffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
  }

  db.run('PRAGMA foreign_keys = ON');
  return db;
}

function saveDb() {
  if (!db) return;
  const data = db.export();
  fs.writeFileSync(DB_PATH, Buffer.from(data));
}

process.on('exit', saveDb);
process.on('SIGINT', () => { saveDb(); process.exit(); });
process.on('SIGTERM', () => { saveDb(); process.exit(); });

let dirty = false;
function markDirty() { dirty = true; }
setInterval(() => {
  if (dirty) { saveDb(); dirty = false; }
}, 5000);

async function query(sql, params = []) {
  const database = await getDb();
  const stmt = database.prepare(sql);
  if (params.length) stmt.bind(params);
  const results = [];
  while (stmt.step()) {
    results.push(stmt.getAsObject());
  }
  stmt.free();
  markDirty();
  return results;
}

async function run(sql, params = []) {
  const database = await getDb();
  database.run(sql, params);
  const changes = database.getRowsModified();
  const lastId = database.exec('SELECT last_insert_rowid() as id')[0]?.values[0][0];
  markDirty();
  return { changes, lastInsertRowid: lastId };
}

module.exports = { getDb, saveDb, query, run };
