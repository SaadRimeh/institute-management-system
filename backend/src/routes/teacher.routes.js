import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/authorize.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { ROLES } from "../utils/constants.js";
import {
  createTeacherAttendance,
  createTeacherGrade,
  createTeacherNotification,
  getTeacherCourseStudents,
  getTeacherCourses,
} from "../controllers/teacher.controller.js";
import {
  createTeacherAttendanceSchema,
  createTeacherGradeSchema,
  createTeacherNotificationSchema,
  getTeacherCourseStudentsSchema,
} from "../validations/teacher.validation.js";

const router = Router();

router.use(authenticate, authorize(ROLES.TEACHER));

router.get("/courses", getTeacherCourses);
router.get(
  "/courses/:courseId/students",
  validate(getTeacherCourseStudentsSchema),
  getTeacherCourseStudents,
);
router.post(
  "/notifications",
  validate(createTeacherNotificationSchema),
  createTeacherNotification,
);
router.post("/grades", validate(createTeacherGradeSchema), createTeacherGrade);
router.post("/attendance", validate(createTeacherAttendanceSchema), createTeacherAttendance);

export default router;

