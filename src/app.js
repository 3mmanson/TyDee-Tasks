const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const taskRoutes = require('./routes/taskRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve frontend static files
const frontendDist = fs.existsSync(path.join(__dirname, '..', 'frontend', 'dist'))
  ? path.join(__dirname, '..', 'frontend', 'dist')
  : path.join(__dirname, '..', 'frontend-dist');
app.use(express.static(frontendDist));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

// Client-side routing fallback
app.get('/{*splat}', (req, res) => {
  res.sendFile(path.join(frontendDist, 'index.html'));
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, error: 'Internal server error' });
});

module.exports = { app, PORT };
