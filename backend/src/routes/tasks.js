const express = require('express');
const mongoose = require('mongoose');
const Task = require('../models/Task');
const { validateTaskInput } = require('../validate');

const router = express.Router();

function rejectInvalidId(req, res, next) {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ error: 'Invalid task id.' });
  }
  next();
}

router.get('/', async (req, res) => {
  const tasks = await Task.find().sort({ createdAt: -1 });
  res.json(tasks);
});

router.post('/', async (req, res) => {
  const { value, errors } = validateTaskInput(req.body);
  if (errors.length) return res.status(400).json({ error: errors.join(' ') });

  const task = await Task.create(value);
  res.status(201).json(task);
});

router.patch('/:id', rejectInvalidId, async (req, res) => {
  const { value, errors } = validateTaskInput(req.body, { partial: true });
  if (errors.length) return res.status(400).json({ error: errors.join(' ') });

  const task = await Task.findByIdAndUpdate(req.params.id, value, { new: true, runValidators: true });
  if (!task) return res.status(404).json({ error: 'Task not found.' });
  res.json(task);
});

router.delete('/:id', rejectInvalidId, async (req, res) => {
  const task = await Task.findByIdAndDelete(req.params.id);
  if (!task) return res.status(404).json({ error: 'Task not found.' });
  res.status(204).end();
});

module.exports = router;
