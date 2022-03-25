const mongoose = require('mongoose');

// Connect to our local database.
mongoose.connect(
  `${process.env.MONGODB_URL}`,
  () => {
    console.log('Conntected.');
  },
  (err) => {
    console.log(err.message);
  },
  {
    useNewUrlParser: true,
  }
);
