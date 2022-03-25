const express = require('express');
const auth = require('../middleware/auth');
const {
  createNewTaskHandler,
  readAllTasksHandler,
  readTaskHandler,
  updateTaskHandler,
  deleteTaskHandler,
  clearAllTasksHandler,
} = require('../controllers/taskController');

const taskRounter = new express.Router();

// Create new (task) endpoint.
taskRounter.post('/v1/tasks', auth, createNewTaskHandler);

// Read (task) endpoint.
taskRounter.get('/v1/tasks/:id', auth, readTaskHandler);

// Read all (tasks) endpoint.
taskRounter.get('/v1/tasks', auth, readAllTasksHandler);

// Update (task) endpoint.
taskRounter.patch('/v1/tasks/:id', auth, updateTaskHandler);

// Delete (task) endpoint.
taskRounter.delete('/v1/tasks/:id', auth, deleteTaskHandler);

// Clear all (tasks) endpoint.
taskRounter.delete('/v1/tasks', auth, clearAllTasksHandler);

module.exports = taskRounter;
