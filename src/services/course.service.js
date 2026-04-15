import { Course } from "../models/course.model.js";
import { User } from "../models/user.model.js";
import { AppError } from "../utils/appError.js";
import { parsePagination } from "../utils/pagination.js";
import { ROLES } from "../utils/constants.js";

const ensureTeacher = async (teacherId) => {
  if (!teacherId) return;
  const teacher = await User.findOne({
    _id: teacherId,
    role: ROLES.TEACHER,
    isActive: true,
  });

  if (!teacher) {
    throw new AppError("Assigned teacher not found", 404);
  }
};

export const createCourse = async (payload) => {
  await ensureTeacher(payload.assignedTeacher);
  const course = await Course.create(payload);
  return course;
};

export const listCourses = async (query) => {
  const { page, limit, skip } = parsePagination(query);
  const filter = { isActive: true };

  if (query.level) filter.level = query.level;
  if (query.type) filter.type = query.type;
  if (query.assignedTeacher) filter.assignedTeacher = query.assignedTeacher;
  if (query.search) filter.name = { $regex: query.search, $options: "i" };

  const [items, total] = await Promise.all([
    Course.find(filter)
      .populate("assignedTeacher", "fullName role primaryContact")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Course.countDocuments(filter),
  ]);

  return {
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
};

export const getCourseById = async (courseId) => {
  const course = await Course.findOne({ _id: courseId, isActive: true }).populate(
    "assignedTeacher",
    "fullName role primaryContact",
  );

  if (!course) {
    throw new AppError("Course not found", 404);
  }

  return course;
};

export const updateCourse = async (courseId, payload) => {
  const course = await Course.findOne({ _id: courseId, isActive: true });
  if (!course) {
    throw new AppError("Course not found", 404);
  }

  if (payload.assignedTeacher !== undefined) {
    await ensureTeacher(payload.assignedTeacher);
  }

  const allowed = [
    "name",
    "price",
    "teacherSalary",
    "duration",
    "schedule",
    "level",
    "type",
    "assignedTeacher",
    "isActive",
  ];
  for (const key of allowed) {
    if (payload[key] !== undefined) course[key] = payload[key];
  }

  await course.save();
  return course;
};

export const deleteCourse = async (courseId) => {
  const course = await Course.findOne({ _id: courseId, isActive: true });
  if (!course) {
    throw new AppError("Course not found", 404);
  }

  course.isActive = false;
  await course.save();
  return { id: course.id };
};

export const getTeacherCourses = async (teacherId) => {
  return Course.find({ assignedTeacher: teacherId, isActive: true }).sort({ createdAt: -1 });
};

