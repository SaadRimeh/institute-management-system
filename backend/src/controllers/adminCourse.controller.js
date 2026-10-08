import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/apiResponse.js";
import {
  createCourse,
  deleteCourse,
  getCourseById,
  listCourses,
  updateCourse,
} from "../services/course.service.js";

export const createAdminCourse = asyncHandler(async (req, res) => {
  const course = await createCourse(req.body);
  sendSuccess(res, { course }, 201);
});

export const listAdminCourses = asyncHandler(async (req, res) => {
  const result = await listCourses(req.query);
  sendSuccess(res, result);
});

export const getAdminCourse = asyncHandler(async (req, res) => {
  const course = await getCourseById(req.params.id);
  sendSuccess(res, { course });
});

export const updateAdminCourse = asyncHandler(async (req, res) => {
  const course = await updateCourse(req.params.id, req.body);
  sendSuccess(res, { course });
});

export const deleteAdminCourse = asyncHandler(async (req, res) => {
  const result = await deleteCourse(req.params.id);
  sendSuccess(res, result);
});

