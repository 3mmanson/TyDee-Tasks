const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const authMiddleware = require('../middleware/authMiddleware');

// All task routes are now protected
router.use(authMiddleware);

// GET all tasks (supports ?view=calendar&month=YYYY-MM)
router.get('/', (req, res) => taskController.getAllTasks(req, res));

// POST parse natural language into task fields
router.post('/parse', (req, res) => taskController.parseTask(req, res));

// GET task by ID
router.get('/:id', (req, res) => taskController.getTaskById(req, res));

// POST create new task
router.post('/', (req, res) => taskController.createTask(req, res));

// PUT update task
router.put('/:id', (req, res) => taskController.updateTask(req, res));

// DELETE all tasks (with optional ?snapshots=true&activity=true)
router.delete('/all', (req, res) => taskController.clearAllTasks(req, res));

// DELETE task
router.delete('/:id', (req, res) => taskController.deleteTask(req, res));

module.exports = router;
