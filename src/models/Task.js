const { query, run } = require('./database');

class Task {
  static async getAll(userId) {
    const tasks = await query('SELECT * FROM tasks WHERE user_id = ? ORDER BY created_at DESC', [userId]);
    return tasks.map(t => this._checkOverdue(t));
  }

  static async getById(id, userId) {
    const rows = await query('SELECT * FROM tasks WHERE id = ? AND user_id = ?', [id, userId]);
    return rows[0] ? this._checkOverdue(rows[0]) : null;
  }

  static async create({ title, description, status, userId, priority, due_date }) {
    const now = new Date().toISOString();
    const dueDateStr = due_date || null;
    const result = await run(
      'INSERT INTO tasks (title, description, status, user_id, priority, due_date, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [title, description || null, status || 'pending', userId, priority || 'Medium', dueDateStr, now, now]
    );
    return this.getById(result.lastInsertRowid, userId);
  }

  static async update(id, userId, { title, description, status, priority, due_date }) {
    const now = new Date().toISOString();
    const dueDateStr = due_date || null;
    await run(
      'UPDATE tasks SET title = ?, description = ?, status = ?, priority = ?, due_date = ?, updated_at = ? WHERE id = ? AND user_id = ?',
      [title, description, status, priority, dueDateStr, now, id, userId]
    );
    return this.getById(id, userId);
  }

  static async delete(id, userId) {
    return run('DELETE FROM tasks WHERE id = ? AND user_id = ?', [id, userId]);
  }

  static async getUpcomingForAllUsers() {
    const tasks = await query(
      `SELECT t.*, u.email, u.username FROM tasks t
       JOIN users u ON t.user_id = u.id
       WHERE t.due_date IS NOT NULL
       AND t.status NOT IN ('completed', 'overdue')
       AND t.due_date >= datetime('now', '-1 hour')
       AND t.due_date <= datetime('now', '+24 hours')`
    );
    return tasks.map(t => this._checkOverdue(t));
  }

  static async markOverdue(id) {
    await run(
      "UPDATE tasks SET status = 'overdue', updated_at = ? WHERE id = ? AND status != 'completed'",
      [new Date().toISOString(), id]
    );
  }

  static _checkOverdue(task) {
    if (task.status !== 'completed' && task.due_date && new Date(task.due_date) < new Date()) {
      return { ...task, status: 'overdue' };
    }
    return task;
  }
}

module.exports = Task;
