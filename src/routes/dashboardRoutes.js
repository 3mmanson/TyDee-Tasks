const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const Task = require('../models/Task');

router.use(authMiddleware);

router.get('/stats', async (req, res) => {
  try {
    const userId = req.user.userId;
    const stats = await Task.getStats(userId);

    // Compute yesterday's snapshot if missing (first load of a new day)
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    await Task.ensureSnapshot(userId, yesterday).catch(() => {});

    res.json({ success: true, data: stats });
  } catch (err) {
    console.error('Dashboard stats error:', err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.get('/history', async (req, res) => {
  try {
    const userId = req.user.userId;
    const days = Math.min(Math.max(parseInt(req.query.days) || 30, 1), 365);
    const history = await Task.getHistory(userId, days);
    res.json({ success: true, data: history });
  } catch (err) {
    console.error('Dashboard history error:', err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

module.exports = router;
