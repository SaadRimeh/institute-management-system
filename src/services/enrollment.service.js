import { Enrollment } from "../models/enrollment.model.js";
import { User } from "../models/user.model.js";
import { Course } from "../models/course.model.js";
import { AppError } from "../utils/appError.js";
import { ROLES } from "../utils/constants.js";

export const createEnrollment = async ({ studentId, courseId, coursePrice }) => {
  const [student, course] = await Promise.all([
    User.findOne({ _id: studentId, role: ROLES.STUDENT, isActive: true }),
    Course.findOne({ _id: courseId, isActive: true }),
  ]);

  if (!student) {
    throw new AppError("Student not found", 404);
  }

  if (!course) {
    throw new AppError("Course not found", 404);
  }

  const price = coursePrice ?? course.price;

  const enrollment = await Enrollment.create({
    student: student.id,
    course: course.id,
    coursePrice: price,
    paidAmount: 0,
    remainingBalance: price,
  });

  return enrollment;
};

export const getStudentEnrollments = async (studentId) => {
  return Enrollment.find({ student: studentId })
    .populate({
      path: "course",
      populate: {
        path: "assignedTeacher",
        select: "fullName primaryContact",
      },
    })
    .sort({ createdAt: -1 });
};

export const getStudentEnrollmentByCourse = async (studentId, courseId) => {
  const enrollment = await Enrollment.findOne({
    student: studentId,
    course: courseId,
  }).populate({
    path: "course",
    populate: {
      path: "assignedTeacher",
      select: "fullName primaryContact",
    },
  });

  if (!enrollment) {
    throw new AppError("Enrollment not found", 404);
  }

  return enrollment;
};

export const getCourseEnrollments = async (courseId) => {
  return Enrollment.find({ course: courseId, status: "active" })
    .populate("student", "fullName primaryContact phones")
    .sort({ createdAt: -1 });
};

