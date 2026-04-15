import { Enrollment } from "../models/enrollment.model.js";
import { Attendance } from "../models/attendance.model.js";
import { Grade } from "../models/grade.model.js";
import { User } from "../models/user.model.js";
import { AppError } from "../utils/appError.js";
import { getUserNotifications } from "./notification.service.js";

export const getStudentProfile = async (studentId) => {
  const user = await User.findById(studentId);
  if (!user || !user.isActive) {
    throw new AppError("Student not found", 404);
  }

  return user;
};

export const getStudentCourses = async (studentId) => {
  return Enrollment.find({ student: studentId })
    .populate({
      path: "course",
      populate: { path: "assignedTeacher", select: "fullName primaryContact" },
    })
    .sort({ createdAt: -1 });
};

export const getStudentCourseById = async (studentId, courseId) => {
  const enrollment = await Enrollment.findOne({
    student: studentId,
    course: courseId,
  }).populate({
    path: "course",
    populate: { path: "assignedTeacher", select: "fullName primaryContact" },
  });

  if (!enrollment) {
    throw new AppError("Course enrollment not found", 404);
  }

  const [attendance, grades] = await Promise.all([
    Attendance.find({ student: studentId, course: courseId })
      .populate("course", "name")
      .populate("teacher", "fullName")
      .sort({ date: -1 }),
    Grade.find({ student: studentId, course: courseId })
      .populate("course", "name")
      .populate("teacher", "fullName")
      .sort({ examDate: -1 }),
  ]);

  return {
    enrollment,
    attendance,
    grades,
  };
};

export const getStudentNotifications = async (studentId) => getUserNotifications(studentId);
