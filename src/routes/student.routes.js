import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/authorize.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { ROLES } from "../utils/constants.js";
import {
  getCourseById,
  getCourses,
  getNotifications,
  getProfile,
} from "../controllers/student.controller.js";
import { getStudentCourseSchema } from "../validations/student.validation.js";

const router = Router();

router.use(authenticate, authorize(ROLES.STUDENT));

router.get("/profile", getProfile);
router.get("/courses", getCourses);
router.get("/courses/:id", validate(getStudentCourseSchema), getCourseById);
router.get("/notifications", getNotifications);

export default router;

