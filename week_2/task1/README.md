# User Management API

## Overview
A RESTful microservice for user management, built with Node.js, Express.js, SQLite3, JWT authentication, Joi validation, Winston logging, and tested with Jest.

## Tech Stack
- Node.js
- Express.js
- SQLite3
- JWT (jsonwebtoken)
- Joi (validation)
- Winston (logging)
- Jest & Supertest (testing)

## Folder Structure
```
src/
  app.js                # Express app setup
  db/
    database.js         # SQLite3 connection and user schema
  controllers/
    userController.js   # Request handlers
  services/
    userService.js      # Business logic
  routes/
    userRoutes.js       # User routes
    authRoutes.js       # Auth routes
  middleware/
    auth.js             # JWT authentication middleware
    errorHandler.js     # Centralized error handler
    validate.js         # Joi validation middleware
  models/
    userModel.js        # User DB operations
  utils/
    logger.js           # Winston logger
validators/
  user.js               # Joi schemas
__tests__/
  user.test.js          # Sample Jest test
```

## Setup Instructions

1. **Install dependencies**
   ```bash
   npm install
   ```
2. **Run the server**
   ```bash
   npm start
   ```
   Or for development with auto-reload:
   ```bash
   npm run dev
   ```
3. **Run tests**
   ```bash
   npm test
   ```

## API Endpoints

### User Management
- `POST /users` — Create a new user
- `GET /users/:id` — Get user by ID
- `PUT /users/:id` — Update user information
- `DELETE /users/:id` — Delete user

### Authentication
- `POST /login` — Authenticate user and return JWT

## User Schema
- `id` (INTEGER, PRIMARY KEY, AUTOINCREMENT)
- `name` (TEXT, required)
- `email` (TEXT, unique, required)
- `password` (TEXT, hashed, required)

## Features
- User CRUD operations
- JWT-based authentication
- Input validation with Joi
- Centralized error handling
- Logging with Winston
- Unit/integration tests with Jest & Supertest

--- 