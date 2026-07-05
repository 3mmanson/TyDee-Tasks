const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { addClient } = require('../services/notificationService');

const JWT_SECRET = process.env.JWT_SECRET;

router.get('/stream', (req, res) => {
  const token = req.query.token;
  if (!token) {
    return res.status(401).json({ success: false, error: 'Token required' });
  }

  let decoded;
  try {
    decoded = jwt.verify(token, JWT_SECRET);
  } catch {
    return res.status(401).json({ success: false, error: 'Invalid token' });
  }

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no',
  });

  res.write(`event: connected\ndata: {"message":"connected"}\n\n`);

  addClient(decoded.userId, res);

  const heartbeat = setInterval(() => {
    res.write(': heartbeat\n\n');
  }, 30000);

  res.on('close', () => {
    clearInterval(heartbeat);
  });
});

module.exports = router;
