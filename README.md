### Task Manager API Documentation ⭐

This is a simple API for managing tasks. It is built using Node.js, Express, and MongoDB.

## ENVIRONMENT VARIABLES

The following environment variables are required:

- `MONGODB_URL` - The URI for the MongoDB database
- `PORT` - The port to run the server on
- `JWT_SECRET` - The secret used to sign JWTs
- `SENDGRID_API_KEY` - The API key for SendGrid
- `USER_AVATAR_MAX_SIZE` - The maximum size of a user avatar in bytes

## Installation and Setup ✈

1. Clone the repository
2. Run `npm install` to install the dependencies
3. Run `npm start` to start the server
4. Run `npm run dev` to start the server in development mode

## Usage 👀

1. Run `npm start` to start the server
2. Use Postman to test the API

## Endpoints

### Users 📌

- `POST /users` - Create a new user ✅
- `POST /users/login` - Login a user ✅
- `POST /users/logout` - Logout a user ✅
- `POST /users/logoutAll` - Logout all users ✅
- `GET /users/me` - Get the current user ✅
- `PATCH /users/me` - Update the current user ✅
- `DELETE /users/me` - Delete the current user ✅
- `POST /users/me/avatar` - Upload an avatar for the ✅current user
- `DELETE /users/me/avatar` - Delete the avatar for ✅the current user
- `GET /users/:id/avatar` - Get the avatar for a user ✅

### Tasks 📌

- `POST /tasks` - Create a new task ✅
- `GET /tasks` - Get all tasks ✅
- `GET /tasks/:id` - Get a task by ID ✅
- `PATCH /tasks/:id` - Update a task by ID ✅
- `DELETE /tasks/:id` - Delete a task by ID ✅
