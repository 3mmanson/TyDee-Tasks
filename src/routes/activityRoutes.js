const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const ActivityLog = require('../models/ActivityLog');

router.use(authMiddleware);

router.get('/', async (req, res) => {
  try {
    const logs = await ActivityLog.getAll(req.user.userId);
    res.json({ success: true, data: logs });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

module.exports = router;
