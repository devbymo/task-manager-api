const bcrypt = require('bcryptjs/dist/bcrypt');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const validator = require('validator');
const Task = require('./Task');

// Create User schema.
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      validate(value) {
        if (value.length < 2 || value.length > 50) {
          throw new Error(`In-correct Name entered!`);
        }
      },
    },
    userName: {
      type: String,
      unique: true,
      required: true,
      trim: true,
      validate(value) {
        if (value.length < 4 || value.length > 30) {
          throw new Error(`In-correct userName entered!`);
        }
      },
    },
    age: {
      type: Number,
      default: 12,
      min: 12,
      max: 100,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error(`In-correct email entered!`);
        }
      },
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      validate(value) {
        if (value.toLowerCase().includes('password')) {
          throw new Error(`Password cannot contain "password"`);
        }
      },
    },
    avatar: {
      type: Buffer,
    },
    tokens: [
      {
        token: {
          type: String,
          required: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Set-up a virtual property to enable user get tasks.
userSchema.virtual('tasks', {
  ref: 'Task',
  localField: '_id',
  foreignField: 'owner',
});

// (Model Methods)

// Find user by email and password provided.
userSchema.statics.findByCredentials = async ({
  email,
  userName,
  password,
}) => {
  // Check email or userName.
  let user;
  if (email) {
    user = await User.findOne({ email });
  } else {
    user = await User.findOne({ userName });
  }
  if (!user) throw new Error('Unable to login');

  // Check password.
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error('Unable to login');

  // User founded.
  return user;
};

// (Instances Methods)

// Generate user authantication token.
userSchema.methods.generateAuthToken = async function () {
  const user = this;
  const secretkeys = process.env.JWT_SECRET;
  const expiresIn = '1h';

  const token = jwt.sign({ _id: user._id.toString() }, secretkeys, {
    expiresIn,
  });

  // Add tokens to db.
  user.tokens.push({ token });

  // Save new added tokens.
  user.save();

  return token;
};

// Limiting the data taht send to client-side. (the manual way)
// using this approach you have to call
// user.projectingUserData() manually.
userSchema.methods.projectingUserData = function () {
  const user = this;
  // Not working.
  // const userObjectCopy = { ...user };
  const userObjectCopy = user.toObject();

  delete userObjectCopy.password;
  delete userObjectCopy.tokens;

  return userObjectCopy;
};

// Limiting the data taht send to client-side. (the auto way)
// toJSON automatically run otherwise you call it or not.
// This works because when we use res.send() the toJSON called automatically behind the scence
userSchema.methods.toJSON = function () {
  const user = this;
  // Not working.
  // const userObjectCopy = { ...user };
  const userObjectCopy = user.toObject();

  delete userObjectCopy.password;
  delete userObjectCopy.tokens;
  delete userObjectCopy.avatar;

  return userObjectCopy;
};

// (Model Middlewares)

// Hash the plain text password before saving.
userSchema.pre('save', async function (next) {
  const user = this;

  // Hash password but only if the password modifyed.
  if (user.isModified('password')) {
    // Only re-hash the password if modifyed.
    user.password = await bcrypt.hash(user.password, 8);
  }

  next();
});

// Delete all user's taks before execute the remove event.
userSchema.pre('remove', async function (next) {
  const user = this;
  // Get all user's tasks.
  await user.populate('tasks');

  // Delete all tasks that has user's id.
  await Task.deleteMany({ owner: user._id });

  next();
});

// Create the model.
const User = mongoose.model('User', userSchema);

// Export it.
module.exports = User;
