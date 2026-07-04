const { query, run } = require('./database');

class Task {
  static async getAll(userId) {
    return query('SELECT * FROM tasks WHERE user_id = ? ORDER BY created_at DESC', [userId]);
  }

  static async getById(id, userId) {
    const rows = await query('SELECT * FROM tasks WHERE id = ? AND user_id = ?', [id, userId]);
    return rows[0] || null;
  }

  static async create({ title, description, status, userId, priority, due_date }) {
    const now = new Date().toISOString();
    const dueDateStr = due_date instanceof Date ? due_date.toISOString().split('T')[0] : (due_date || null);
    const result = await run(
      'INSERT INTO tasks (title, description, status, user_id, priority, due_date, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [title, description || null, status || 'pending', userId, priority || 'Medium', dueDateStr, now, now]
    );
    return this.getById(result.lastInsertRowid, userId);
  }

  static async update(id, userId, { title, description, status, priority, due_date }) {
    const now = new Date().toISOString();
    const dueDateStr = due_date instanceof Date ? due_date.toISOString().split('T')[0] : (due_date || null);
    await run(
      'UPDATE tasks SET title = ?, description = ?, status = ?, priority = ?, due_date = ?, updated_at = ? WHERE id = ? AND user_id = ?',
      [title, description, status, priority, dueDateStr, now, id, userId]
    );
    return this.getById(id, userId);
  }

  static async delete(id, userId) {
    return run('DELETE FROM tasks WHERE id = ? AND user_id = ?', [id, userId]);
  }
}

module.exports = Task;
