const { query } = require('express');
const Task = require('../models/Task');
const isInputDataValid = require('../utils/isInputDataValid');

// Create new task handler.
const createNewTaskHandler = async (req, res) => {
  try {
    // Validate passed inputs.
    const passedFields = Object.keys(req.body);

    // Check if body object is empty.
    if (passedFields.length === 0) {
      return res.status(400).send({
        content: '',
        error: `please provide at least the task text to create it!`,
      });
    }

    const allowedFields = ['text', 'completed'];
    const isValidData = isInputDataValid(passedFields, allowedFields);
    if (!isValidData) {
      return res.status(400).send({
        content: '',
        error: `Not allowed fields passed, allowed feilds [${allowedFields}]`,
      });
    }

    // Add the task.
    const newTask = new Task({
      ...req.body,
      owner: req.user._id,
    });
    await newTask.save();
    res.status(201).send(newTask);
  } catch (err) {
    res.status(400).send(err.message);
  }
};

// Read all tasks handler.
// Get - /tasks?completed=TRUE
// Get - /tasks?limit=10
// Get - /tasks?limit=10&skip=0  - first page
// Get - /tasks?limit=10&skip=10  - second page
// Get - /tasks?limit=10&skip=20  - third page
// Get - /tasks?limit=10000&skip=10000&completed=FAlse
// Get - /tasks?sortBy=createdAt:desc
// Get - /tasks?sortBy=createdAt:asc
// Get - /tasks?limit=100&skip=0&completed=true&sortBy=createdAt:asc
// Get - /tasks?page=1&limit=100
const readAllTasksHandler = async (req, res) => {
  try {
    const match = {};
    const sort = {};
    let limit = +req.query.limit || 10;
    let skip = +req.query.skip;

    if (req.query.page) {
      // if limit is not provided.
      // page 1 return the first 10 tasks.
      // page 2 return the second 10 tasks.
      // ...
      skip = limit * (req.query.page - 1);
    }

    if (req.query.completed) {
      match.completed = req.query.completed.toLowerCase() === 'true';
    }

    if (req.query.sortBy) {
      const searchingTerm = req.query.sortBy.split(':');
      sort[searchingTerm[0]] =
        searchingTerm[1].toLowerCase() === 'desc' ? -1 : 1;
    }

    await req.user.populate({
      path: 'tasks',
      match,
      options: {
        limit,
        skip,
        sort,
      },
    });

    res.status(200).send(req.user.tasks);
  } catch (err) {
    res.status(500).send(err.message);
  }
};

// Read task handler.
const readTaskHandler = async (req, res) => {
  try {
    // Find the task.
    const task = await Task.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });

    // Validate the existing of the task.
    if (!task) {
      return res.status(404).send({
        content: '',
        error: 'Task does not found!',
      });
    }

    res.status(200).send(task);
  } catch (err) {
    res.status(500).send(err.message);
  }
};

// Update task handler.
const updateTaskHandler = async (req, res) => {
  try {
    // Check inputs.
    const updates = Object.keys(req.body);
    const allowedUpdates = ['text', 'completed'];
    const isValidUpdates = isInputDataValid(updates, allowedUpdates);

    if (!isValidUpdates)
      return res.status(400).send({
        content: '',
        error: 'Invalid updates passed!',
      });

    // Find the task by its id and authanticated user id.
    const task = await Task.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });

    // Check the existing of the task.
    if (!task)
      return res.status(400).send({
        content: '',
        error: 'There is no matching task!',
      });

    // Apply updates.
    updates.forEach((update) => {
      task[update] = req.body[update];
    });
    await task.save();

    // Success.
    res.status(200).send(task);
  } catch (err) {
    res.status(500).send({
      content: '',
      error: err.message,
    });
  }
};

// Delete task handler.
const deleteTaskHandler = async (req, res) => {
  try {
    // Delete.
    const removedTask = await Task.findOneAndDelete({
      _id: req.params.id,
      owner: req.user._id,
    });

    // Check task exsiting.
    if (!removedTask)
      return res.status(404).send({
        content: '',
        error: 'There is no matching task exist!',
      });

    res.status(200).send(removedTask);
  } catch (err) {
    res.status(400).send({
      content: '',
      error: err.message,
    });
  }
};

// Clear all Tasks handler.
const clearAllTasksHandler = async (req, res) => {
  try {
    // Delete.
    await Task.deleteMany({ owner: req.user._id });

    // Success.
    res.status(200).send({
      content: "All user's Tasks removed successfully.",
    });
  } catch (err) {
    res.status(500).send({
      content: '',
      error: err.message,
    });
  }
};

module.exports = {
  createNewTaskHandler,
  readAllTasksHandler,
  readTaskHandler,
  updateTaskHandler,
  deleteTaskHandler,
  clearAllTasksHandler,
};
