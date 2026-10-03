# 🎓 Institute Management System (IMS) API

[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/express-4.19.2-blue.svg)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/mongodb-mongoose-green.svg)](https://mongoosejs.com/)
[![Security: Helmet & RateLimit](https://img.shields.io/badge/security-helmet%20%7C%20rate--limit-red.svg)](https://helmetjs.github.io/)
[![Validation: Zod](https://img.shields.io/badge/validation-zod-purple.svg)](https://zod.dev/)
[![License: ISC](https://img.shields.io/badge/License-ISC-yellow.svg)](https://opensource.org/licenses/ISC)

A robust, enterprise-grade RESTful API designed to power modern educational institutes, academies, and training centers. Built with **Node.js**, **Express.js**, and **MongoDB**, it provides clean separation of concerns, strict schema validation, role-based authorization, ACID financial transactions, and proactive security against brute-force attacks.

---

## 📑 Table of Contents

- [Key Features](#-key-features)
- [Architecture & Tech Stack](#-architecture--tech-stack)
- [Project Structure](#-project-structure)
- [Prerequisites](#-prerequisites)
- [Getting Started](#-getting-started)
- [Environment Configuration](#-environment-configuration)
- [API Reference](#-api-reference)
  - [Authentication](#authentication-public--protected)
  - [Admin Module](#admin-module-role-admin)
  - [Teacher Module](#teacher-module-role-teacher)
  - [Student Module](#student-module-role-student)
- [Security & Data Integrity](#-security--data-integrity)
- [Available Scripts](#-available-scripts)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Key Features

### 🔐 Authentication & Access Control
- **Dual Login Options:** Login via rapid 6-digit access code, or targeted login with `contact identifier + 6-digit code`.
- **Brute-Force & Lockout Protection:** Automatically locks user accounts for 15 minutes after 5 consecutive failed login attempts.
- **Dedicated Auth Rate Limiting:** Restricts aggressive IP requests to authentication endpoints.
- **Granular RBAC:** Strict role isolation for `admin`, `teacher`, and `student`.

### 👥 Student & Teacher Lifecycle
- Complete CRUD operations for students and teachers.
- Multiple contact phone numbers management per user profile.
- Soft-delete capability and activation status tracking.

### 📚 Academic Management
- **Course Catalog:** Configurable durations, schedules, levels, course types, prices, and teacher compensations.
- **Enrollment Management:** Unique database indexing to prevent accidental duplicate enrollments with real-time balance calculations.
- **Attendance Tracking:** Daily session attendance (`present`, `absent`, `late`, `excused`) with automated unique per-day date normalization.
- **Grading System:** Test and exam recording with strict constraint validations (`score <= maxScore`).

### 💰 Financial Engine & Data Integrity
- **ACID MongoDB Transactions:** Wraps student fee payments and teacher salary payouts in atomic transactions to guarantee financial consistency.
- **Balance & Overpayment Protection:** Automatically prevents student payments from exceeding outstanding course balances or teacher payouts exceeding assigned course salaries.
- **Salary Tracking:** Aggregated visibility into paid vs. remaining salaries per course and instructor.

### 📊 Management Dashboard & Analytics
- Comprehensive real-time metrics: active students, teachers, courses, and total enrollments.
- Financial health KPIs: total revenue collected, teacher salaries disbursed, and outstanding student receivables.
- Recent activity audit feed tracking real-time teacher attendances, gradings, and announcements.

---

## 🛠 Architecture & Tech Stack

- **Runtime:** [Node.js](https://nodejs.org/) (ES Modules)
- **Framework:** [Express.js](https://expressjs.com/)
- **Database & ODM:** [MongoDB](https://www.mongodb.com/) with [Mongoose 8](https://mongoosejs.com/)
- **Validation:** [Zod](https://zod.dev/)
- **Authentication:** [JSON Web Tokens (JWT)](https://jwt.io/) & [Bcrypt.js](https://github.com/dcodeIO/bcrypt.js)
- **Security Hardening:** [Helmet](https://helmetjs.github.io/), [CORS](https://github.com/expressjs/cors), and [express-rate-limit](https://github.com/express-rate-limit/express-rate-limit)

---

## 📁 Project Structure

```txt
institute-management-system/
├── src/
│   ├── config/          # Database connection and environment parsing
│   ├── controllers/     # HTTP controllers mapping requests to responses
│   ├── middlewares/     # Auth, RBAC, Zod validation, error handling, rate limits
│   ├── models/          # Mongoose database schemas and compound indexes
│   ├── modules/         # Centralized modular route aggregators
│   ├── routes/          # REST route declarations
│   ├── services/        # Pure business logic and database interactions
│   ├── utils/           # JWT, hashing, pagination, AppError, transactions
│   ├── validations/     # Zod input verification schemas
│   ├── app.js           # Express app setup and middleware pipeline
│   └── server.js        # Server bootstrap and database lifecycle
├── .env.example         # Template for environment configuration
├── .gitignore           # Git ignore declarations
├── package.json         # Project manifests and scripts
└── README.md            # Comprehensive documentation
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js:** v18.0.0 or higher
- **MongoDB:** v5.0 or higher (Local or MongoDB Atlas cluster)
- **npm** or **yarn** / **pnpm**

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/SaadRimeh/institute-management-system.git
   cd institute-management-system
   ```

2. **Install project dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   ```bash
   cp .env.example .env
   ```

4. **Seed the initial administrator account:**
   ```bash
   npm run seed:admin
   ```

5. **Start development server:**
   ```bash
   npm run dev
   ```

The server will boot on `http://localhost:5000` (or your configured `PORT`).

---

## ⚙️ Environment Configuration

Edit your `.env` file based on `.env.example`:

| Variable | Description | Default / Example |
| :--- | :--- | :--- |
| `PORT` | HTTP Server port | `5000` |
| `MONGO_URI` | MongoDB connection connection string | `mongodb://127.0.0.1:27017/institute_management` |
| `JWT_SECRET` | Secret key for signing JSON Web Tokens | `your_ultra_secure_jwt_secret_key` |
| `JWT_EXPIRES_IN` | JWT token validity window | `7d` |
| `LOGIN_CODE_PEPPER`| Server-side secret pepper for hashing 6-digit codes | `your_secret_pepper_string` |
| `NODE_ENV` | Application environment (`development` / `production` / `test`) | `development` |
| `RATE_LIMIT_WINDOW_MS` | Global rate limit window in milliseconds | `900000` (15 mins) |
| `RATE_LIMIT_MAX` | Maximum API requests permitted per window per IP | `300` |
| `ADMIN_NAME` | Initial administrator name (for `seed:admin`) | `System Admin` |
| `ADMIN_CONTACT` | Initial administrator contact identifier | `admin-contact` |
| `ADMIN_CODE` | Initial administrator 6-digit code | `123456` |

---

## 📡 API Reference

Base API prefix: `/api/v1`

### Health Check
- `GET /health` - Service health status & active environment.

### Authentication (`/api/v1/auth`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/login` | Public (Rate-limited) | Login with `{ "loginCode": "123456" }` or `{ "identifier": "...", "loginCode": "..." }` |
| `GET` | `/me` | Authenticated | Retrieve current user profile from token |

### Admin Module (`/api/v1/admin`)
*Requires `Authorization: Bearer <token>` with role `admin`.*

| Domain | Method | Endpoint | Description |
| :--- | :--- | :--- | :--- |
| **Students** | `POST` | `/students` | Register a new student |
| | `GET` | `/students` | List students with search & pagination |
| | `GET` | `/students/:id` | Get student details |
| | `PUT` | `/students/:id` | Update student profile |
| | `DELETE` | `/students/:id` | Deactivate/remove student |
| **Teachers** | `POST` | `/teachers` | Register a new teacher |
| | `GET` | `/teachers` | List teachers with search & pagination |
| | `GET` | `/teachers/:id` | Get teacher details |
| | `PUT` | `/teachers/:id` | Update teacher profile |
| | `DELETE` | `/teachers/:id` | Deactivate/remove teacher |
| **Courses** | `POST` | `/courses` | Create a new course |
| | `GET` | `/courses` | List courses (filter by level, type, teacher) |
| | `GET` | `/courses/:id` | Retrieve course details |
| | `PUT` | `/courses/:id` | Update course information |
| | `DELETE` | `/courses/:id` | Deactivate course |
| **Enrollment**| `POST` | `/enrollments` | Enroll student into a course |
| **Finance** | `POST` | `/payments` | Record student payment (Atomic transaction) |
| | `GET` | `/payments/:studentId` | Get student payment records & course balances |
| | `POST` | `/teacher-payments` | Disburse teacher salary payment (Atomic transaction) |
| **Attendance**| `GET` | `/attendance/:studentId` | View student attendance history |
| **Broadcasts**| `POST` | `/notifications` | Send targeted notification |
| **Dashboard** | `GET` | `/dashboard` | Institute analytics, totals, and financial metrics |

### Teacher Module (`/api/v1/teacher`)
*Requires `Authorization: Bearer <token>` with role `teacher`.*

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/courses` | Get courses assigned to the logged-in teacher |
| `GET` | `/courses/:courseId/students` | List enrolled students in teacher's course |
| `POST` | `/attendance` | Mark student attendance (`present`, `absent`, `late`, `excused`) |
| `POST` | `/grades` | Record student exam score (`score <= maxScore`) |
| `POST` | `/notifications` | Broadcast announcement to enrolled course students |

### Student Module (`/api/v1/student`)
*Requires `Authorization: Bearer <token>` with role `student`.*

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/profile` | View student profile & active contact information |
| `GET` | `/courses` | List enrolled courses and assigned teachers |
| `GET` | `/courses/:id` | View course details, remaining balance, and teacher details |
| `GET` | `/notifications` | View received institute and teacher notifications |

---

## 🔒 Security & Data Integrity

1. **Brute-Force & Credential Protection:**
   - Auth endpoint throttled to a maximum of 10 requests per 15-minute window per IP.
   - Accounts enter a 15-minute lock state after 5 failed password attempts.
   - Stored 6-digit access codes are hashed using `bcrypt` and augmented with an HMAC-SHA256 server-side pepper.
2. **ACID Financial Transactions:**
   - Both student payments and teacher salary payments execute via `runInTransaction()`, ensuring MongoDB atomic session guarantees with automatic rollback on error.
3. **Data Integrity & Constraints:**
   - Unique compound indexes prevent duplicate enrollments (`{ student, course }`) and duplicate daily attendance logs.
   - Zod validation enforces score constraints (`score <= maxScore`) on grades.

---

## 📜 Available Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Runs the server in development mode using `nodemon` |
| `npm start` | Launches server in production mode with standard `node` |
| `npm run check` | Runs syntax check across entry points |
| `npm run seed:admin` | Seeds or updates the primary system administrator account |

---

## 🤝 Contributing

Contributions, bug reports, and feature suggestions are welcome!

1. Fork the Project.
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`).
3. Commit your Changes (`git commit -m 'feat: add some AmazingFeature'`).
4. Push to the Branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

---

## 📄 License

This project is open-source and licensed under the [ISC License](LICENSE).
