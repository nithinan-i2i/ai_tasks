# Task Management Application

A full-stack task management application built with React, TypeScript, Material-UI, Express, and Sequelize.

## Features

- User authentication (login/register)
- Task management (create, read, update, delete)
- Task filtering and sorting
- Task status tracking
- Priority levels
- Due date management
- Responsive design
- Real-time updates

## Tech Stack

### Frontend

- React 18
- TypeScript
- Material-UI
- Redux Toolkit
- React Router
- Formik & Yup
- Axios
- Date-fns

### Backend

- Node.js
- Express
- Sequelize
- PostgreSQL
- JWT Authentication
- Bcrypt
- Cors
- Dotenv

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd task-management-app
```

2. Install dependencies:

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

3. Set up environment variables:

```bash
# Backend (.env)
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=task_management
DB_USER=your_username
DB_PASSWORD=your_password
JWT_SECRET=your_jwt_secret

# Frontend (.env)
REACT_APP_API_URL=http://localhost:3000/api
```

4. Set up the database:

```bash
# Create PostgreSQL database
createdb task_management

# Run migrations
cd backend
npm run migrate
```

## Running the Application

1. Start the backend server:

```bash
cd backend
npm run dev
```

2. Start the frontend development server:

```bash
cd frontend
npm start
```

The application will be available at:

- Frontend: http://localhost:3000
- Backend API: http://localhost:3000/api

## Testing

```bash
# Run backend tests
cd backend
npm test

# Run frontend tests
cd frontend
npm test
```

## Project Structure

```
task-management-app/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── utils/
│   │   ├── app.ts
│   │   └── server.ts
│   ├── tests/
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── store/
│   │   ├── styles/
│   │   ├── utils/
│   │   ├── App.tsx
│   │   └── index.tsx
│   └── package.json
└── README.md
```

## API Documentation

### Authentication

- POST /api/auth/register - Register a new user
- POST /api/auth/login - Login user
- GET /api/auth/me - Get current user

### Tasks

- GET /api/tasks - Get all tasks
- POST /api/tasks - Create a new task
- GET /api/tasks/:id - Get task by ID
- PUT /api/tasks/:id - Update task
- DELETE /api/tasks/:id - Delete task

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
