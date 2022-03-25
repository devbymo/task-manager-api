const User = require('../models/User');
const isInputDataValid = require('../utils/isInputDataValid');
const { sendWelcomeEmail, sendCancelationEmail } = require('../emails/account');

// Create new User handler.
const signupUserHandler = async (req, res) => {
  try {
    // Validate passed inputs.
    const passedFields = Object.keys(req.body);
    const allowedFields = ['name', 'userName', 'age', 'email', 'password'];
    const isValidData = isInputDataValid(passedFields, allowedFields);
    if (!isValidData) {
      return res.status(400).send({
        content: '',
        error: `Not allowed fields passed, allowed feilds [${allowedFields}]`,
      });
    }

    // Add new user.
    const newUser = new User(req.body);
    await newUser.save();

    // Send welcome email.
    sendWelcomeEmail(newUser.email, newUser.name);

    // Generate Authentication Token.
    const token = await newUser.generateAuthToken();

    // Success.
    res.status(201).send({
      newUser,
      token,
    });
  } catch (err) {
    res.status(400).send({
      content: '',
      error: err.message,
    });
  }
};

// Login User handler.
const loginUserHandler = async (req, res) => {
  try {
    // Validate the existing of (email or userName) and (password).
    if (!req.body.email && !req.body.userName) {
      return res.status(400).send({
        content: '',
        error: 'Invalid data passed!',
      });
    }

    if (!req.body.password) {
      return res.status(400).send({
        content: '',
        error: 'Invalid data passed!',
      });
    }

    // Validate coming data.
    const inputData = Object.keys(req.body);
    const allowedInput = ['email', 'userName', 'password'];
    const isPassedDataValid = isInputDataValid(inputData, allowedInput);
    if (!isPassedDataValid)
      return res.status(400).send({
        content: '',
        error: 'Unrequired data passed!',
      });

    // Start find the user.
    const loginData = {
      email: req.body.email,
      userName: req.body.userName,
      password: req.body.password,
    };
    const user = await User.findByCredentials(loginData);

    // Generate Authentication Token.
    const token = await user.generateAuthToken();

    res.status(200).send({
      user,
      token,
    });
  } catch (err) {
    res.status(400).send({
      content: '',
      error: err.message,
    });
  }
};

// Logout User Handler.
const logoutUserHandler = async (req, res) => {
  try {
    // Filter the current token out.
    // For that you have to send it through the request.
    req.user.tokens = req.user.tokens.filter(
      (token) => token.token !== req.token
    );

    // Save changes.
    await req.user.save();

    res.status(200).send({
      content: 'Logged-out successfully',
      error: '',
    });
  } catch (err) {
    res.status(500).send({
      content: '',
      error: 'Unable to loggout',
    });
  }
};

// Terminate all User sessions handler.
const terminateAllUserSessionsHandler = async (req, res) => {
  try {
    // Delete all tokens.
    req.user.tokens = [];

    // Save chagnes.
    await req.user.save();

    res.status(200).send({
      content: 'All session terminated successfully.',
      error: '',
    });
  } catch (err) {
    res.status(500).send({
      content: '',
      error: 'Unable to terminate all sessions',
    });
  }
};

// Get authanticated User handler.
const getAuthanticatedUserHandler = async (req, res) => {
  res.status(200).send(req.user);
};

// Read all Users handler.
const readAllUsersHandler = async (req, res) => {
  try {
    const users = await User.find({});
    res.status(200).send(users);
  } catch (err) {
    res.status(500).send(err.message);
  }
};

// Read User handler.
const readUserHandler = async (req, res) => {
  try {
    // Validate the inputs.
    if (!req.params.id) {
      return res.status(400).send({
        content: '',
        error: 'You should pass user ID!',
      });
    }

    // Find the user.
    const user = await User.findById(req.params.id);

    // Validate the existing of the user.
    if (!user) {
      return res.status(404).send({
        content: '',
        error: 'User does not found!',
      });
    }

    res.status(200).send(user);
  } catch (err) {
    res.status(500).send(err.message);
  }
};

// Update User handler.
const updateUserHandler = async (req, res) => {
  try {
    // Check inputs.
    const updates = Object.keys(req.body);

    // Check the empty of body.
    if (updates.length === 0) {
      return res.status(400).send({
        content: '',
        error: 'Please provide at least 1 field to update!',
      });
    }

    const allowedUpdates = ['name', 'email', 'password', 'age'];
    const isValidUpdates = isInputDataValid(updates, allowedUpdates);

    if (!isValidUpdates) {
      return res.status(400).send({
        content: '',
        error: 'Invalid updates passed!',
      });
    }

    // Apply updates to authanticated user.
    updates.forEach((update) => {
      req.user[update] = req.body[update];
    });
    await req.user.save();

    // Success.
    res.status(200).send(req.user);
  } catch (err) {
    res.status(400).send({
      content: '',
      error: err.message,
    });
  }
};

// Delete User handler.
const deleteUserHandler = async (req, res) => {
  try {
    // Delete.
    const removedUser = await req.user.remove();

    // Send email
    sendCancelationEmail(removedUser.email, removedUser.name);

    res.status(200).send(removedUser);
  } catch (err) {
    res.status(400).send({
      content: '',
      error: err.message,
    });
  }
};

module.exports = {
  signupUserHandler,
  loginUserHandler,
  logoutUserHandler,
  terminateAllUserSessionsHandler,
  readAllUsersHandler,
  readUserHandler,
  updateUserHandler,
  deleteUserHandler,
  getAuthanticatedUserHandler,
};
