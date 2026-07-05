const { query, run } = require('./database');

class Task {
  static async getAll(userId, month) {
    if (month) {
      const start = `${month}-01`;
      const tasks = await query(
        "SELECT * FROM tasks WHERE user_id = ? AND due_date IS NOT NULL AND due_date >= ? AND due_date < date(?, '+1 month') ORDER BY due_date ASC",
        [userId, start, start]
      );
      return tasks.map(t => this._checkOverdue(t));
    }
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
    const completedAt = status === 'completed' ? now : null;
    await run(
      'UPDATE tasks SET title = ?, description = ?, status = ?, priority = ?, due_date = ?, completed_at = ?, updated_at = ? WHERE id = ? AND user_id = ?',
      [title, description, status, priority, dueDateStr, completedAt, now, id, userId]
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

  static async getPendingForAllUsers() {
    return query(
      `SELECT t.*, u.email, u.username FROM tasks t
       JOIN users u ON t.user_id = u.id
       WHERE t.status = 'pending'`
    );
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

  static async getStats(userId) {
    const now = new Date();
    const weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const twoWeeksAgo = new Date(now);
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

    const weekAgoStr = weekAgo.toISOString();
    const twoWeeksAgoStr = twoWeeksAgo.toISOString();
    const nowStr = now.toISOString();

    // This week's completed
    const thisWeekCompleted = await query(
      'SELECT COUNT(*) as count FROM tasks WHERE user_id = ? AND completed_at IS NOT NULL AND completed_at >= ?',
      [userId, weekAgoStr]
    );
    // Last week's completed
    const lastWeekCompleted = await query(
      'SELECT COUNT(*) as count FROM tasks WHERE user_id = ? AND completed_at IS NOT NULL AND completed_at >= ? AND completed_at < ?',
      [userId, twoWeeksAgoStr, weekAgoStr]
    );

    // This week's pending (not completed, not overdue)
    const thisWeekPending = await query(
      "SELECT COUNT(*) as count FROM tasks WHERE user_id = ? AND status NOT IN ('completed') AND (due_date IS NULL OR due_date >= ?)",
      [userId, nowStr]
    );
    const lastWeekPending = await query(
      "SELECT COUNT(*) as count FROM tasks WHERE user_id = ? AND status NOT IN ('completed') AND (due_date IS NULL OR due_date >= ?) AND created_at < ?",
      [userId, nowStr, weekAgoStr]
    );

    // At risk: overdue and not completed
    const thisWeekAtRisk = await query(
      "SELECT COUNT(*) as count FROM tasks WHERE user_id = ? AND status != 'completed' AND due_date IS NOT NULL AND due_date < ?",
      [userId, nowStr]
    );
    const lastWeekAtRisk = await query(
      "SELECT COUNT(*) as count FROM tasks WHERE user_id = ? AND status != 'completed' AND due_date IS NOT NULL AND due_date < ? AND created_at < ?",
      [userId, nowStr, weekAgoStr]
    );

    // Completion rate: completed / (completed + pending due this week)
    const thisWeekTotalDue = await query(
      'SELECT COUNT(*) as count FROM tasks WHERE user_id = ? AND due_date IS NOT NULL AND due_date >= ? AND due_date <= ?',
      [userId, weekAgoStr, nowStr]
    );
    const lastWeekTotalDue = await query(
      'SELECT COUNT(*) as count FROM tasks WHERE user_id = ? AND due_date IS NOT NULL AND due_date >= ? AND due_date < ?',
      [userId, twoWeeksAgoStr, weekAgoStr]
    );

    const tc = Number(thisWeekCompleted[0]?.count || 0);
    const lc = Number(lastWeekCompleted[0]?.count || 0);
    const tp = Number(thisWeekPending[0]?.count || 0);
    const lp = Number(lastWeekPending[0]?.count || 0);
    const ta = Number(thisWeekAtRisk[0]?.count || 0);
    const la = Number(lastWeekAtRisk[0]?.count || 0);
    const tt = Number(thisWeekTotalDue[0]?.count || 0);
    const lt = Number(lastWeekTotalDue[0]?.count || 0);

    const pctChange = (curr, prev) => {
      if (prev === 0) return curr > 0 ? 100 : 0;
      return Math.round(((curr - prev) / prev) * 100);
    };

    return {
      tasksCompleted: { count: tc, change: pctChange(tc, lc) },
      pendingTasks: { count: tp, change: pctChange(lp, tp) },
      atRisk: { count: ta, change: pctChange(ta, la) },
      completionRate: {
        rate: tt > 0 ? Math.round((tc / tt) * 100) : 0,
        change: lt > 0 ? Math.round(((tc / tt - lc / lt) / (lc / lt)) * 100) : (tc > 0 ? 100 : 0),
      },
    };
  }
}

module.exports = Task;
