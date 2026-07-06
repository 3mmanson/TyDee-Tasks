const { query, run } = require('./database');

class ActivityLog {
  static async create({ userId, taskId, action, details }) {
    const result = await run(
      'INSERT INTO activity_log (user_id, task_id, action, details) VALUES (?, ?, ?, ?)',
      [userId, taskId || null, action, details || null]
    );
    return { id: result.lastInsertRowid, user_id: userId, task_id: taskId, action, details };
  }

  static async getAll(userId, limit = 50) {
    return query(
      'SELECT * FROM activity_log WHERE user_id = ? ORDER BY created_at DESC LIMIT ?',
      [userId, limit]
    );
  }

  static async clearAll(userId) {
    return run('DELETE FROM activity_log WHERE user_id = ?', [userId]);
  }
}

module.exports = ActivityLog;
