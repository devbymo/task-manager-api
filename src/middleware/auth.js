const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    // Catch the token.
    const token = req.header('Authorization').replace('Bearer ', '');

    // Get the payload.
    const secretkeys = process.env.JWT_SECRET;
    const decoded = jwt.verify(token, secretkeys);
    const user = await User.findOne({
      _id: decoded._id,
      'tokens.token': token,
    });

    // Check the existing of user.
    if (!user) {
      throw new Error();
    }

    // Send the founded user through the req.
    req.user = user;
    // Send the current token.
    req.token = token;
    next();
  } catch (err) {
    res.status(401).send({ error: 'Please authenticate', mes: err.message });
  }
};

module.exports = auth;
