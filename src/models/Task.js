const { query, run } = require('./database');

class Task {
  static async getAll(userId, month) {
    if (month) {
      const start = `${month}-01`;
      const tasks = await query(
        "SELECT * FROM tasks WHERE user_id = ? AND deleted_at IS NULL AND due_date IS NOT NULL AND due_date >= ? AND due_date < date(?, '+1 month') ORDER BY due_date ASC",
        [userId, start, start]
      );
      return tasks.map(t => this._checkOverdue(t));
    }
    const tasks = await query('SELECT * FROM tasks WHERE user_id = ? AND deleted_at IS NULL ORDER BY created_at DESC', [userId]);
    return tasks.map(t => this._checkOverdue(t));
  }

  static async getById(id, userId) {
    const rows = await query('SELECT * FROM tasks WHERE id = ? AND user_id = ? AND deleted_at IS NULL', [id, userId]);
    return rows[0] ? this._checkOverdue(rows[0]) : null;
  }

  static async create({ title, description, status, userId, priority, category, due_date }) {
    const now = new Date().toISOString();
    const dueDateStr = due_date || null;
    const result = await run(
      'INSERT INTO tasks (title, description, status, user_id, priority, category, due_date, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [title, description || null, status || 'pending', userId, priority || 'Medium', category || 'Personal', dueDateStr, now, now]
    );
    return this.getById(result.lastInsertRowid, userId);
  }

  static async update(id, userId, { title, description, status, priority, category, due_date }) {
    const now = new Date().toISOString();
    const dueDateStr = due_date || null;
    const completedAt = status === 'completed' ? now : null;
    await run(
      'UPDATE tasks SET title = ?, description = ?, status = ?, priority = ?, category = ?, due_date = ?, completed_at = ?, updated_at = ? WHERE id = ? AND user_id = ?',
      [title, description, status, priority, category || 'Personal', dueDateStr, completedAt, now, id, userId]
    );
    return this.getById(id, userId);
  }

  static async delete(id, userId) {
    const now = new Date().toISOString();
    return run('UPDATE tasks SET deleted_at = ?, updated_at = ? WHERE id = ? AND user_id = ?', [now, now, id, userId]);
  }

  static async clearAll(userId) {
    const now = new Date().toISOString();
    return run('UPDATE tasks SET deleted_at = ?, updated_at = ? WHERE user_id = ? AND deleted_at IS NULL', [now, now, userId]);
  }

  static async clearSnapshots(userId) {
    return run('DELETE FROM kpi_daily_snapshots WHERE user_id = ?', [userId]);
  }

  static async purgeOldDeleted(days = 30) {
    const cutoff = new Date(Date.now() - days * 86400000).toISOString();
    return run("DELETE FROM tasks WHERE deleted_at IS NOT NULL AND deleted_at < ?", [cutoff]);
  }

  static async computeSnapshot(userId, dateStr) {
    const dayStart = `${dateStr}T00:00:00.000Z`;
    const dayEnd = new Date(new Date(dayStart).getTime() + 86400000).toISOString();

    const completed = await query(
      'SELECT COUNT(*) as count FROM tasks WHERE user_id = ? AND deleted_at IS NULL AND completed_at >= ? AND completed_at < ?',
      [userId, dayStart, dayEnd]
    );
    const pending = await query(
      "SELECT COUNT(*) as count FROM tasks WHERE user_id = ? AND deleted_at IS NULL AND status NOT IN ('completed') AND (due_date IS NULL OR due_date >= ?) AND created_at < ?",
      [userId, dayEnd, dayEnd]
    );
    const atRisk = await query(
      "SELECT COUNT(*) as count FROM tasks WHERE user_id = ? AND deleted_at IS NULL AND status != 'completed' AND due_date IS NOT NULL AND due_date < ?",
      [userId, dayEnd]
    );
    const totalDue = await query(
      'SELECT COUNT(*) as count FROM tasks WHERE user_id = ? AND deleted_at IS NULL AND due_date >= ? AND due_date < ?',
      [userId, dayStart, dayEnd]
    );
    const completedOnTime = await query(
      "SELECT COUNT(*) as count FROM tasks WHERE user_id = ? AND deleted_at IS NULL AND due_date >= ? AND due_date < ? AND status = 'completed'",
      [userId, dayStart, dayEnd]
    );

    const completedCount = Number(completed[0]?.count || 0);
    const pendingCount = Number(pending[0]?.count || 0);
    const atRiskCount = Number(atRisk[0]?.count || 0);
    const dueCount = Number(totalDue[0]?.count || 0);
    const onTimeCount = Number(completedOnTime[0]?.count || 0);
    const rate = dueCount > 0 ? Math.round((onTimeCount / dueCount) * 100) : 0;

    return {
      tasks_completed: completedCount,
      pending_tasks: pendingCount,
      at_risk: atRiskCount,
      completion_rate: rate,
    };
  }

  static async ensureSnapshot(userId, dateStr) {
    const existing = await query(
      'SELECT id FROM kpi_daily_snapshots WHERE user_id = ? AND snapshot_date = ?',
      [userId, dateStr]
    );
    if (existing.length > 0) return;

    const data = await this.computeSnapshot(userId, dateStr);
    await run(
      'INSERT INTO kpi_daily_snapshots (user_id, snapshot_date, tasks_completed, pending_tasks, at_risk, completion_rate) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, dateStr, data.tasks_completed, data.pending_tasks, data.at_risk, data.completion_rate]
    );
  }

  static async getHistory(userId, days = 30) {
    const cutoff = new Date(Date.now() - days * 86400000).toISOString().split('T')[0];
    return query(
      'SELECT * FROM kpi_daily_snapshots WHERE user_id = ? AND snapshot_date >= ? ORDER BY snapshot_date ASC',
      [userId, cutoff]
    );
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

    const thisRate = tt > 0 ? tc / tt : 0;
    const lastRate = lt > 0 ? lc / lt : 0;
    const completionChange = lastRate === 0
      ? (thisRate > 0 ? 100 : 0)
      : Math.round(((thisRate - lastRate) / lastRate) * 100);

    return {
      tasksCompleted: { count: tc, change: pctChange(tc, lc) },
      pendingTasks: { count: tp, change: pctChange(tp, lp) },
      atRisk: { count: ta, change: pctChange(ta, la) },
      completionRate: {
        rate: Math.round(thisRate * 100),
        change: completionChange,
      },
    };
  }
}

module.exports = Task;
