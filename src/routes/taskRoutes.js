const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const authMiddleware = require('../middleware/authMiddleware');

// All task routes are now protected
router.use(authMiddleware);

// GET all tasks
router.get('/', (req, res) => taskController.getAllTasks(req, res));

// GET task by ID
router.get('/:id', (req, res) => taskController.getTaskById(req, res));

// POST create new task
router.post('/', (req, res) => taskController.createTask(req, res));

// PUT update task
router.put('/:id', (req, res) => taskController.updateTask(req, res));

// DELETE task
router.delete('/:id', (req, res) => taskController.deleteTask(req, res));

module.exports = router;
