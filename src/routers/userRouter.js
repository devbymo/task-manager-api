const express = require('express');
const auth = require('../middleware/auth');
const sharp = require('sharp');
const {
  signupUserHandler,
  loginUserHandler,
  logoutUserHandler,
  terminateAllUserSessionsHandler,
  readAllUsersHandler,
  readUserHandler,
  uploadUserAvatarHandler,
  updateUserHandler,
  deleteUserHandler,
  getAuthanticatedUserHandler,
} = require('../controllers/userController');

const userRounter = new express.Router();

// Signup new (user) endpoint.
userRounter.post('/v1/users/signup', signupUserHandler);

// Login new (user) endpoint.
userRounter.post('/v1/users/login', loginUserHandler);

// Logout (user) endpoint.
userRounter.post('/v1/users/logout', auth, logoutUserHandler);

// Terminate all (user) sessions endpoint.
userRounter.post(
  '/v1/users/terminate-all-senssions',
  auth,
  terminateAllUserSessionsHandler
);

// Upload avatar image for (user) endpoint.
const multer = require('multer');
const User = require('../models/User');
const upload = multer({
  limits: {
    fileSize: +process.env.USER_AVATAR_MAX_SIZE, // 1MB
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|png|jpeg)$/)) {
      return cb(new Error('Please upload an image!'));
    }

    req.file = file;
    cb(undefined, true);
  },
});
userRounter.post(
  '/v1/users/me/avatar',
  auth,
  upload.single('avatar'),
  async (req, res) => {
    try {
      // Re-formatting the image using sharp.
      const Buffer = await sharp(req.file.buffer)
        .png()
        .resize({ width: 500, height: 500 })
        .toBuffer();

      // Save the image.
      req.user.avatar = Buffer;
      await req.user.save();

      // Success.
      res.send({
        mes: 'Avatar uploaded successfuly',
      });
    } catch (err) {
      console.log(err.message);
      res.status(500).send({
        content: '',
        error: err.message,
      });
    }
  },
  (err, req, res, next) => {
    res.status(400).send({
      error: err.message,
    });
  }
);

// Delete (user) avatar endpoint.
userRounter.delete('/v1/users/me/avatar', auth, async (req, res) => {
  try {
    // Delete.
    req.user.avatar = undefined;
    await req.user.save();

    // Success.
    res.status(200).send({
      mes: 'Avatar removed successfully',
    });
  } catch (err) {
    res.status(400).send({
      err: 'Unable to remove avatar image!',
    });
  }
});

// Read (user) avatar by id using url.
userRounter.get('/v1/users/:id/avatar', async (req, res) => {
  try {
    // Get the user.
    const user = await User.findById(req.params.id);

    // Check user existing.
    if (!user) {
      return res.status(400).send({
        mes: 'There is no matching user!',
      });
    }

    // check avatar existing.
    if (!user.avatar) {
      return res.status(400).send({
        mes: 'This user has no avatar image!',
      });
    }

    // Success.
    res.set('Content-Type', 'image/png');
    res.status(200).send(user.avatar);
  } catch (err) {
    res.status(400).send({
      mes: 'Unable to fetch user avatar image!',
    });
  }
});

// Get authanticated (user) endpoint.
userRounter.get('/v1/users/me', auth, getAuthanticatedUserHandler);

// Update (user) endpoint.
userRounter.patch('/v1/users/me', auth, updateUserHandler);

// Delete (user) endpoint.
userRounter.delete('/v1/users/me', auth, deleteUserHandler);

module.exports = userRounter;
