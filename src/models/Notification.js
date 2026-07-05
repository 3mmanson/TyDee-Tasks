const { query, run } = require('./database');

class Notification {
  static async create({ userId, taskId, type, message }) {
    const result = await run(
      'INSERT INTO notifications (user_id, task_id, type, message) VALUES (?, ?, ?, ?)',
      [userId, taskId || null, type, message]
    );
    return { id: result.lastInsertRowid, user_id: userId, task_id: taskId, type, message, read: 0, created_at: new Date().toISOString() };
  }

  static async getAll(userId) {
    return query(
      'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 100',
      [userId]
    );
  }

  static async markRead(id, userId) {
    await run('UPDATE notifications SET read = 1 WHERE id = ? AND user_id = ?', [id, userId]);
  }

  static async markAllRead(userId) {
    await run('UPDATE notifications SET read = 1 WHERE user_id = ? AND read = 0', [userId]);
  }

  static async deleteAll(userId) {
    await run('DELETE FROM notifications WHERE user_id = ?', [userId]);
  }

  static async exists(userId, taskId, type) {
    const rows = await query(
      'SELECT id FROM notifications WHERE user_id = ? AND task_id = ? AND type = ? AND created_at > datetime("now", "-1 hour")',
      [userId, taskId, type]
    );
    return rows.length > 0;
  }
}

module.exports = Notification;
