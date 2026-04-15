import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/apiResponse.js";
import {
  getStudentCourseById,
  getStudentCourses,
  getStudentNotifications,
  getStudentProfile,
} from "../services/student.service.js";

export const getProfile = asyncHandler(async (req, res) => {
  const profile = await getStudentProfile(req.user.id);
  sendSuccess(res, { profile });
});

export const getCourses = asyncHandler(async (req, res) => {
  const courses = await getStudentCourses(req.user.id);
  sendSuccess(res, { courses });
});

export const getCourseById = asyncHandler(async (req, res) => {
  const course = await getStudentCourseById(req.user.id, req.params.id);
  sendSuccess(res, { course });
});

export const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await getStudentNotifications(req.user.id);
  sendSuccess(res, {
    notifications,
  });
});
