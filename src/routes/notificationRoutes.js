const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const authMiddleware = require('../middleware/authMiddleware');
const Notification = require('../models/Notification');
const { addClient } = require('../services/notificationService');

const JWT_SECRET = process.env.JWT_SECRET;

// SSE stream
router.get('/stream', (req, res) => {
  const token = req.query.token;
  if (!token) return res.status(401).json({ success: false, error: 'Token required' });

  let decoded;
  try { decoded = jwt.verify(token, JWT_SECRET); } catch { return res.status(401).json({ success: false, error: 'Invalid token' }); }

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no',
  });

  res.write(`event: connected\ndata: {"message":"connected"}\n\n`);
  addClient(decoded.userId, res);

  const heartbeat = setInterval(() => res.write(': heartbeat\n\n'), 30000);
  res.on('close', () => clearInterval(heartbeat));
});

// Get all notifications
router.get('/', authMiddleware, async (req, res) => {
  try {
    const notifications = await Notification.getAll(req.user.userId);
    res.json({ success: true, data: notifications });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// Mark one as read
router.put('/:id/read', authMiddleware, async (req, res) => {
  try {
    await Notification.markRead(parseInt(req.params.id), req.user.userId);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// Mark all as read
router.put('/read-all', authMiddleware, async (req, res) => {
  try {
    await Notification.markAllRead(req.user.userId);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// Clear all
router.delete('/', authMiddleware, async (req, res) => {
  try {
    await Notification.deleteAll(req.user.userId);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

module.exports = router;
