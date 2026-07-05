const Task = require('../models/Task');
const ActivityLog = require('../models/ActivityLog');
const { validateTask, validateTaskUpdate } = require('../validators/taskValidator');

const taskController = {
  async getAllTasks(req, res) {
    try {
      const userId = req.user.userId;
      const tasks = await Task.getAll(userId);
      res.json({ success: true, count: tasks.length, data: tasks });
    } catch (err) {
      res.status(500).json({ success: false, error: 'Server error' });
    }
  },

  async getTaskById(req, res) {
    try {
      const userId = req.user.userId;
      const id = parseInt(req.params.id);
      const task = await Task.getById(id, userId);
      if (!task) {
        return res.status(404).json({ success: false, error: 'Task not found' });
      }
      res.json({ success: true, data: task });
    } catch (err) {
      res.status(500).json({ success: false, error: 'Server error' });
    }
  },

  async createTask(req, res) {
    try {
      const { error, value } = validateTask(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: error.details.map(d => d.message)
        });
      }

      const userId = req.user.userId;
      const task = await Task.create({ ...value, userId });
      await ActivityLog.create({ userId, taskId: task.id, action: 'task_created', details: `Created "${task.title}"` });
      res.status(201).json({ success: true, data: task });
    } catch (err) {
      res.status(500).json({ success: false, error: 'Server error' });
    }
  },

  async updateTask(req, res) {
    try {
      const userId = req.user.userId;
      const id = parseInt(req.params.id);
      const existingTask = await Task.getById(id, userId);

      if (!existingTask) {
        return res.status(404).json({ success: false, error: 'Task not found' });
      }

      const { error, value } = validateTaskUpdate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: error.details.map(d => d.message)
        });
      }

      const task = await Task.update(id, userId, value);

      if (value.status && value.status !== existingTask.status) {
        await ActivityLog.create({ userId, taskId: id, action: 'status_changed', details: `Status changed from "${existingTask.status}" to "${value.status}"` });
      } else {
        await ActivityLog.create({ userId, taskId: id, action: 'task_updated', details: `Updated "${task.title}"` });
      }

      res.json({ success: true, data: task });
    } catch (err) {
      res.status(500).json({ success: false, error: 'Server error' });
    }
  },

  async deleteTask(req, res) {
    try {
      const userId = req.user.userId;
      const id = parseInt(req.params.id);
      const existingTask = await Task.getById(id, userId);

      if (!existingTask) {
        return res.status(404).json({ success: false, error: 'Task not found' });
      }

      await ActivityLog.create({ userId, taskId: id, action: 'task_deleted', details: `Deleted "${existingTask.title}"` });
      await Task.delete(id, userId);
      res.json({ success: true, message: 'Task deleted successfully' });
    } catch (err) {
      res.status(500).json({ success: false, error: 'Server error' });
    }
  }
};

module.exports = taskController;
