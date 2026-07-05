const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { query } = require('../models/database');

router.use(authMiddleware);

router.get('/users', async (req, res) => {
  try {
    const user = await query('SELECT is_admin FROM users WHERE id = ?', [req.user.userId]);
    if (!user[0] || !user[0].is_admin) {
      return res.status(403).json({ success: false, error: 'Forbidden' });
    }

    const users = await query(
      'SELECT id, username, email, created_at FROM users ORDER BY created_at DESC'
    );

    const stats = await query('SELECT COUNT(*) as total FROM users');
    const taskStats = await query(
      'SELECT user_id, COUNT(*) as task_count FROM tasks GROUP BY user_id'
    );
    const taskMap = {};
    taskStats.forEach(r => { taskMap[r.user_id] = r.task_count; });

    res.json({
      success: true,
      data: {
        totalUsers: stats[0].total,
        users: users.map(u => ({
          id: u.id,
          username: u.username,
          email: u.email,
          taskCount: taskMap[u.id] || 0,
          joinedAt: u.created_at,
        })),
      },
    });
  } catch (err) {
    console.error('Admin users error:', err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

module.exports = router;
