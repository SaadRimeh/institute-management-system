# Institute Management Backend

Production-ready backend built with:

- Node.js (ES Modules only)
- Express.js
- MongoDB (Mongoose)
- JWT auth + role-based access

## Tech Highlights

- Clean modular architecture
- Centralized validation and error handling
- Login with secure 6-digit code (hashed + indexed)
- RBAC for `admin`, `teacher`, `student`
- Payment, attendance, grade, and notification flows

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

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env` from `.env.example` and fill values.

3. Seed initial admin:

```bash
npm run seed:admin
```

4. Run development server:

```bash
npm run dev
```

## Auth Flow

- Admin/Teacher/Student accounts use a 6-digit login code.
- Login endpoint: `POST /api/v1/auth/login`
- Returns JWT token for authenticated requests.

## Required API Endpoints

### Auth

- `POST /api/v1/auth/login`
- `GET /api/v1/auth/me`

### Admin - Students

- `POST /api/v1/admin/students`
- `GET /api/v1/admin/students`
- `GET /api/v1/admin/students/:id`
- `PUT /api/v1/admin/students/:id`
- `DELETE /api/v1/admin/students/:id`

### Admin - Teachers

- `POST /api/v1/admin/teachers`
- `GET /api/v1/admin/teachers`
- `GET /api/v1/admin/teachers/:id`
- `PUT /api/v1/admin/teachers/:id`
- `DELETE /api/v1/admin/teachers/:id`

### Admin - Courses

- `POST /api/v1/admin/courses`
- `GET /api/v1/admin/courses`
- `GET /api/v1/admin/courses/:id`
- `PUT /api/v1/admin/courses/:id`
- `DELETE /api/v1/admin/courses/:id`

### Admin - Enrollments

- `POST /api/v1/admin/enrollments`

### Admin - Payments

- `POST /api/v1/admin/payments`
- `GET /api/v1/admin/payments/:studentId`

### Admin - Teacher Payments

- `POST /api/v1/admin/teacher-payments`

### Admin - Notifications

- `POST /api/v1/admin/notifications`

### Admin - Attendance

- `GET /api/v1/admin/attendance/:studentId`

### Admin Dashboard

- `GET /api/v1/admin/dashboard`

### Teacher

- `GET /api/v1/teacher/courses`
- `GET /api/v1/teacher/courses/:courseId/students`
- `POST /api/v1/teacher/notifications`
- `POST /api/v1/teacher/grades`
- `POST /api/v1/teacher/attendance`

### Student

- `GET /api/v1/student/profile`
- `GET /api/v1/student/courses`
- `GET /api/v1/student/courses/:id`
- `GET /api/v1/student/notifications`

## Docs and Postman

Generated docs files:

- `docs/API_ENDPOINTS.md`
- `docs/postman/Institute-Management.openapi.json`
- `docs/postman/Institute-Management.postman_collection.json`
- `docs/postman/Institute-Management.postman_environment.json`

Import order in Postman:

1. Import environment file: `docs/postman/Institute-Management.postman_environment.json`
2. Import collection file: `docs/postman/Institute-Management.postman_collection.json`
3. If needed, import OpenAPI file instead: `docs/postman/Institute-Management.openapi.json`

Recommended test flow:

1. Run `POST /api/v1/auth/login` and copy `token` to environment variable `token`.
2. Create teacher, student, and course; set `teacherId`, `studentId`, and `courseId`.
3. Continue with enrollments, payments, notifications, attendance, and grade endpoints.
