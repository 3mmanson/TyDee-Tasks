require('dotenv').config();
const { app, PORT } = require('./app');
const { startChecker } = require('./services/notificationService');

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`API endpoints available at http://localhost:${PORT}/api/tasks`);
  startChecker();
});
