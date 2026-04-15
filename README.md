# Institute Management System API

A practical, production-ready backend for managing day-to-day institute operations.
It is designed to keep the codebase clean, scalable, and easy to maintain while covering the core academic and administrative flows.

## What This Project Covers

- Authentication with JWT and role-based access control (`admin`, `teacher`, `student`)
- Student and teacher lifecycle management
- Course management and enrollments
- Attendance tracking and grading
- Financial flows (student payments and teacher payments)
- Internal notifications and dashboard reporting

## Tech Stack

- Node.js (ES Modules)
- Express.js
- MongoDB + Mongoose
- Zod for request validation
- JWT for authentication
- Helmet, CORS, and rate limiting for API hardening

## Project Structure

```txt
src/
|-- config/
|-- controllers/
|-- routes/
|-- models/
|-- services/
|-- middlewares/
|-- utils/
|-- validations/
|-- modules/
|-- app.js
`-- server.js
```

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Create a `.env` file using `.env.example` as a template.

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/institute_management
JWT_SECRET=replace_with_strong_secret
JWT_EXPIRES_IN=7d
LOGIN_CODE_PEPPER=replace_with_pepper
NODE_ENV=development
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=300
ADMIN_NAME=System Admin
ADMIN_CONTACT=admin-contact
ADMIN_CODE=123456
```

### 3. Seed the initial admin account

```bash
npm run seed:admin
```

### 4. Run the server

```bash
npm run dev
```

Server entry point: `src/server.js`

## Available Scripts

- `npm run dev` - start server in development mode with `nodemon`
- `npm start` - run server with Node.js
- `npm run check` - syntax check for `src/server.js`
- `npm run seed:admin` - create or update the initial admin account

## API Overview

Base URL pattern:

- `/api/v1/auth`
- `/api/v1/admin`
- `/api/v1/teacher`
- `/api/v1/student`

Health check endpoint:

- `GET /health`

Authentication flow:

1. Login with a 6-digit code via `POST /api/v1/auth/login`
2. Receive JWT token
3. Send token in `Authorization: Bearer <token>` for protected routes

## Design Notes

- The architecture follows a clear separation of concerns: routes -> controllers -> services -> models.
- Validation and error handling are centralized to keep behavior consistent across all modules.
- Module registration is centralized in `src/modules/index.js` to keep route composition clean.


