import { Attendance } from "../models/attendance.model.js";
import { Course } from "../models/course.model.js";
import { Enrollment } from "../models/enrollment.model.js";
import { AppError } from "../utils/appError.js";
import { ROLES } from "../utils/constants.js";

const normalizeDate = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new AppError("Invalid date value", 400);
  }
  date.setHours(0, 0, 0, 0);
  return date;
};

export const markAttendance = async ({
  actor,
  courseId,
  studentId,
  date,
  status,
  notes,
}) => {
  const course = await Course.findOne({ _id: courseId, isActive: true });
  if (!course) {
    throw new AppError("Course not found", 404);
  }

  if (actor.role === ROLES.TEACHER) {
    if (!course.assignedTeacher || String(course.assignedTeacher) !== String(actor.id)) {
      throw new AppError("You are not assigned to this course", 403);
    }
  }

  const enrollment = await Enrollment.findOne({
    student: studentId,
    course: courseId,
    status: "active",
  });

  if (!enrollment) {
    throw new AppError("Student is not enrolled in this course", 400);
  }

  const normalizedDate = normalizeDate(date || new Date());

  const attendance = await Attendance.findOneAndUpdate(
    { course: courseId, student: studentId, date: normalizedDate },
    {
      course: courseId,
      student: studentId,
      teacher: course.assignedTeacher,
      date: normalizedDate,
      status,
      notes: notes || "",
      markedBy: actor.id,
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  )
    .populate("student", "fullName")
    .populate("course", "name")
    .populate("teacher", "fullName");

  return attendance;
};

export const getStudentAttendance = async (studentId) => {
  return Attendance.find({ student: studentId })
    .populate("course", "name")
    .populate("teacher", "fullName")
    .sort({ date: -1 });
};

