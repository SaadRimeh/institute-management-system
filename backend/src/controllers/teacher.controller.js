import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/apiResponse.js";
import {
  getCourseStudentsForTeacher,
  getTeacherCoursesWithStats,
  teacherAddGrade,
  teacherMarkAttendance,
  teacherSendAnnouncement,
} from "../services/teacher.service.js";

export const getTeacherCourses = asyncHandler(async (req, res) => {
  const courses = await getTeacherCoursesWithStats(req.user.id);
  sendSuccess(res, { courses });
});

export const getTeacherCourseStudents = asyncHandler(async (req, res) => {
  const result = await getCourseStudentsForTeacher(req.user.id, req.params.courseId);
  sendSuccess(res, result);
});

export const createTeacherNotification = asyncHandler(async (req, res) => {
  const notification = await teacherSendAnnouncement(req.user.id, req.body);
  sendSuccess(res, { notification }, 201);
});

export const createTeacherGrade = asyncHandler(async (req, res) => {
  const grade = await teacherAddGrade(req.user.id, req.body);
  sendSuccess(res, { grade }, 201);
});

export const createTeacherAttendance = asyncHandler(async (req, res) => {
  const attendance = await teacherMarkAttendance(req.user.id, req.body);
  sendSuccess(res, { attendance }, 201);
});

