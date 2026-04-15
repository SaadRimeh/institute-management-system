import { Course } from "../models/course.model.js";
import { Enrollment } from "../models/enrollment.model.js";
import { Grade } from "../models/grade.model.js";
import { AppError } from "../utils/appError.js";
import { ROLES } from "../utils/constants.js";

export const createGrade = async ({
  actor,
  courseId,
  studentId,
  examName,
  score,
  maxScore,
  examDate,
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

  const grade = await Grade.create({
    course: courseId,
    student: studentId,
    teacher: course.assignedTeacher,
    examName,
    score,
    maxScore,
    examDate: examDate || new Date(),
    notes: notes || "",
  });

  return grade;
};

export const getStudentGrades = async (studentId) => {
  return Grade.find({ student: studentId })
    .populate("course", "name")
    .populate("teacher", "fullName")
    .sort({ examDate: -1 });
};

