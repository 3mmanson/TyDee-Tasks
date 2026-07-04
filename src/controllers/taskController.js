const Task = require('../models/Task');
const { validateTask } = require('../validators/taskValidator');

const errMsg = (e) => (e instanceof Error ? e.message : String(e));

const taskController = {
  async getAllTasks(req, res) {
    try {
      const userId = req.user.userId;
      const tasks = await Task.getAll(userId);
      res.json({ success: true, count: tasks.length, data: tasks });
    } catch (err) {
      res.status(500).json({ success: false, error: 'Server error: ' + errMsg(err) });
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
      res.status(500).json({ success: false, error: 'Server error: ' + errMsg(err) });
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
      res.status(201).json({ success: true, data: task });
    } catch (err) {
      res.status(500).json({ success: false, error: 'Server error: ' + errMsg(err) });
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

      const { error, value } = validateTask(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: error.details.map(d => d.message)
        });
      }

      const task = await Task.update(id, userId, value);
      res.json({ success: true, data: task });
    } catch (err) {
      res.status(500).json({ success: false, error: 'Server error: ' + errMsg(err) });
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

      await Task.delete(id, userId);
      res.json({ success: true, message: 'Task deleted successfully' });
    } catch (err) {
      res.status(500).json({ success: false, error: 'Server error: ' + errMsg(err) });
    }
  }
};

module.exports = taskController;
