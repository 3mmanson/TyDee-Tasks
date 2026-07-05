const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const Task = require('../models/Task');

router.use(authMiddleware);

router.get('/stats', async (req, res) => {
  try {
    const stats = await Task.getStats(req.user.userId);
    res.json({ success: true, data: stats });
  } catch (err) {
    console.error('Dashboard stats error:', err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

module.exports = router;
