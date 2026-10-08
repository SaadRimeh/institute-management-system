import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/authorize.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { ROLES } from "../utils/constants.js";
import {
  createStudent,
  deleteStudent,
  getStudent,
  listStudents,
  updateStudent,
} from "../controllers/adminStudent.controller.js";
import {
  createTeacher,
  deleteTeacher,
  getTeacher,
  listTeachers,
  updateTeacher,
} from "../controllers/adminTeacher.controller.js";
import {
  createAdminCourse,
  deleteAdminCourse,
  getAdminCourse,
  listAdminCourses,
  updateAdminCourse,
} from "../controllers/adminCourse.controller.js";
import { createAdminEnrollment } from "../controllers/adminEnrollment.controller.js";
import {
  createAdminStudentPayment,
  createAdminTeacherPayment,
  getAdminStudentPayments,
} from "../controllers/adminPayment.controller.js";
import { createNotification } from "../controllers/adminNotification.controller.js";
import { getAdminStudentAttendance } from "../controllers/adminAttendance.controller.js";
import { getDashboard } from "../controllers/adminDashboard.controller.js";
import {
  createCourseSchema,
  createEnrollmentSchema,
  createNotificationSchema,
  createStudentPaymentSchema,
  createStudentSchema,
  createTeacherPaymentSchema,
  createTeacherSchema,
  deleteCourseSchema,
  deleteStudentSchema,
  deleteTeacherSchema,
  getAttendanceSchema,
  getCourseSchema,
  getDashboardSchema,
  getStudentPaymentsSchema,
  getStudentSchema,
  getTeacherSchema,
  listCoursesSchema,
  listStudentsSchema,
  listTeachersSchema,
  updateCourseSchema,
  updateStudentSchema,
  updateTeacherSchema,
} from "../validations/admin.validation.js";

const router = Router();

router.use(authenticate, authorize(ROLES.ADMIN));


// Student Routes
router.post("/students", validate(createStudentSchema), createStudent);
router.get("/students", validate(listStudentsSchema), listStudents);
router.get("/students/:id", validate(getStudentSchema), getStudent);
router.put("/students/:id", validate(updateStudentSchema), updateStudent);
router.delete("/students/:id", validate(deleteStudentSchema), deleteStudent);

// Teacher Routes
router.post("/teachers", validate(createTeacherSchema), createTeacher);
router.get("/teachers", validate(listTeachersSchema), listTeachers);
router.get("/teachers/:id", validate(getTeacherSchema), getTeacher);
router.put("/teachers/:id", validate(updateTeacherSchema), updateTeacher);
router.delete("/teachers/:id", validate(deleteTeacherSchema), deleteTeacher);

// Course Routes
router.post("/courses", validate(createCourseSchema), createAdminCourse);
router.get("/courses", validate(listCoursesSchema), listAdminCourses);
router.get("/courses/:id", validate(getCourseSchema), getAdminCourse);
router.put("/courses/:id", validate(updateCourseSchema), updateAdminCourse);
router.delete("/courses/:id", validate(deleteCourseSchema), deleteAdminCourse);

// Enrollment Routes
router.post("/enrollments", validate(createEnrollmentSchema), createAdminEnrollment);


// Payment Routes
router.post("/payments", validate(createStudentPaymentSchema), createAdminStudentPayment);
router.get("/payments/:studentId", validate(getStudentPaymentsSchema), getAdminStudentPayments);

// Teacher Payments
router.post(
  "/teacher-payments",
  validate(createTeacherPaymentSchema),
  createAdminTeacherPayment,
);
// Notification Routes
router.post("/notifications", validate(createNotificationSchema), createNotification);
// Attendance Routes
router.get("/attendance/:studentId", validate(getAttendanceSchema), getAdminStudentAttendance);
// Dashboard Route
router.get("/dashboard", validate(getDashboardSchema), getDashboard);

export default router;

