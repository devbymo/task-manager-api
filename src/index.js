const express = require('express');
require('./db/mongoose');
const userRounter = require('./routers/userRouter');
const taskRounter = require('./routers/taskRounter');

const app = express();

// Set-up port.
const port = process.env.PORT;

// Automatically Parsing coming data to json.
app.use(express.json());

// Set-up routers.
app.use(userRounter);
app.use(taskRounter);

// Fire up the server.
app.listen(port, () => {
  console.log(`Server is up on port ${port}`);
});
