const Task = require('../models/Task');
const Notification = require('../models/Notification');

const clients = new Map();
const lastPendingReminder = new Map();

const THRESHOLDS = [
  { label: 'overdue', ms: 0 },
  { label: '5 minutes', ms: 5 * 60 * 1000 },
  { label: '30 minutes', ms: 30 * 60 * 1000 },
  { label: '1 hour', ms: 60 * 60 * 1000 },
];

function addClient(userId, res) {
  if (!clients.has(userId)) clients.set(userId, new Set());
  clients.get(userId).add(res);
  res.on('close', () => {
    clients.get(userId)?.delete(res);
    if (clients.get(userId)?.size === 0) clients.delete(userId);
  });
}

function sendToUser(userId, event, data) {
  const userClients = clients.get(userId);
  if (!userClients) return;
  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const res of userClients) {
    res.write(payload);
  }
}

async function notify(userId, taskId, type, message) {
  const exists = await Notification.exists(userId, taskId, type);
  if (exists) return;

  const saved = await Notification.create({ userId, taskId, type, message });
  sendToUser(userId, 'notification', saved);
}

async function checkUpcomingTasks() {
  try {
    const tasks = await Task.getUpcomingForAllUsers();
    const now = Date.now();

    for (const task of tasks) {
      if (!task.due_date) continue;

      const dueTime = new Date(task.due_date).getTime();
      const diff = dueTime - now;

      if (task.status === 'overdue' && diff > 0) continue;

      for (const threshold of THRESHOLDS) {
        if (threshold.label === 'overdue') {
          if (diff <= 0 && task.status !== 'overdue') {
            await Task.markOverdue(task.id);
            await notify(task.user_id, task.id, 'overdue', `"${task.title}" is now overdue!`);
          }
        } else {
          if (diff > 0 && diff <= threshold.ms) {
            const mins = Math.round(diff / 60000);
            const timeLabel = mins < 60 ? `${mins} minute${mins !== 1 ? 's' : ''}` : `${Math.round(mins / 60)} hour${Math.round(mins / 60) !== 1 ? 's' : ''}`;
            await notify(task.user_id, task.id, threshold.label, `"${task.title}" is due in ${timeLabel}`);
          }
        }
      }
    }
  } catch (err) {
    console.error('Upcoming check failed:', err.message);
  }
}

async function checkPendingTasks() {
  try {
    const tasks = await Task.getPendingForAllUsers();
    const now = Date.now();

    for (const task of tasks) {
      const lastSent = lastPendingReminder.get(task.id) || 0;
      if (now - lastSent < 60 * 60 * 1000) continue;

      lastPendingReminder.set(task.id, now);
      await notify(task.user_id, task.id, 'pending_reminder', `Reminder: "${task.title}" is still pending. Time to start!`);
    }
  } catch (err) {
    console.error('Pending check failed:', err.message);
  }
}

async function checkTasks() {
  await checkUpcomingTasks();
  await checkPendingTasks();
}

let checkInterval = null;

function startChecker() {
  if (checkInterval) return;
  checkTasks();
  checkInterval = setInterval(checkTasks, 30000);
  console.log('Notification checker started (every 30s)');
}

function stopChecker() {
  if (checkInterval) {
    clearInterval(checkInterval);
    checkInterval = null;
  }
}

module.exports = { addClient, sendToUser, startChecker, stopChecker };
