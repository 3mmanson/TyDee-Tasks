const Task = require('../models/Task');
const { validateTask } = require('../validators/taskValidator');

const taskController = {
  // GET /api/tasks - Get all tasks for the authenticated user
  async getAllTasks(req, res) {
    try {
      const userId = req.user.userId;
      const tasks = await Task.getAll(userId);
      res.json({ success: true, count: tasks.length, data: tasks });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Server error: ' + error.message });
    }
  },

  // GET /api/tasks/:id - Get task by ID for the authenticated user
  async getTaskById(req, res) {
    try {
      const userId = req.user.userId;
      const id = parseInt(req.params.id);
      const task = await Task.getById(id, userId);
      if (!task) {
        return res.status(404).json({ success: false, error: 'Task not found' });
      }
      res.json({ success: true, data: task });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Server error: ' + error.message });
    }
  },

  // POST /api/tasks - Create new task for the authenticated user
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
    } catch (error) {
      res.status(500).json({ success: false, error: 'Server error: ' + error.message });
    }
  },

  // PUT /api/tasks/:id - Update task for the authenticated user
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
    } catch (error) {
      res.status(500).json({ success: false, error: 'Server error: ' + error.message });
    }
  },

  // DELETE /api/tasks/:id - Delete task for the authenticated user
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
    } catch (error) {
      res.status(500).json({ success: false, error: 'Server error: ' + error.message });
    }
  }
};

module.exports = taskController;
