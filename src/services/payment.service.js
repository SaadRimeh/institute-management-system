import mongoose from "mongoose";
import { Course } from "../models/course.model.js";
import { Enrollment } from "../models/enrollment.model.js";
import { Payment } from "../models/payment.model.js";
import { User } from "../models/user.model.js";
import { AppError } from "../utils/appError.js";
import { PAYMENT_KINDS, ROLES } from "../utils/constants.js";

export const createStudentPayment = async ({
  studentId,
  courseId,
  amount,
  note,
  createdBy,
}) => {
  const enrollment = await Enrollment.findOne({
    student: studentId,
    course: courseId,
  });

  if (!enrollment) {
    throw new AppError("Enrollment not found for this student and course", 404);
  }

  const nextPaid = enrollment.paidAmount + amount;
  if (nextPaid > enrollment.coursePrice) {
    throw new AppError("Payment exceeds remaining balance", 400);
  }

  enrollment.paidAmount = nextPaid;
  enrollment.remainingBalance = Math.max(enrollment.coursePrice - nextPaid, 0);
  await enrollment.save();

  const payment = await Payment.create({
    kind: PAYMENT_KINDS.STUDENT_PAYMENT,
    student: studentId,
    course: courseId,
    enrollment: enrollment.id,
    amount,
    note: note || "",
    createdBy,
  });

  return { payment, enrollment };
};

export const getStudentPayments = async (studentId) => {
  const [student, payments, enrollments] = await Promise.all([
    User.findOne({ _id: studentId, role: ROLES.STUDENT, isActive: true }),
    Payment.find({ student: studentId, kind: PAYMENT_KINDS.STUDENT_PAYMENT })
      .populate("course", "name price")
      .sort({ paidAt: -1 }),
    Enrollment.find({ student: studentId }).populate("course", "name price"),
  ]);

  if (!student) {
    throw new AppError("Student not found", 404);
  }

  return {
    student,
    payments,
    balances: enrollments.map((item) => ({
      enrollmentId: item.id,
      course: item.course,
      coursePrice: item.coursePrice,
      paidAmount: item.paidAmount,
      remainingBalance: item.remainingBalance,
    })),
  };
};

export const createTeacherSalaryPayment = async ({
  teacherId,
  courseId,
  amount,
  note,
  createdBy,
}) => {
  const [teacher, course] = await Promise.all([
    User.findOne({ _id: teacherId, role: ROLES.TEACHER, isActive: true }),
    Course.findOne({ _id: courseId, isActive: true }),
  ]);

  if (!teacher) {
    throw new AppError("Teacher not found", 404);
  }

  if (!course) {
    throw new AppError("Course not found", 404);
  }

  if (!course.assignedTeacher || String(course.assignedTeacher) !== String(teacher.id)) {
    throw new AppError("Teacher is not assigned to this course", 400);
  }

  const totalPaidResult = await Payment.aggregate([
    {
      $match: {
        kind: PAYMENT_KINDS.TEACHER_SALARY,
        teacher: new mongoose.Types.ObjectId(teacherId),
        course: new mongoose.Types.ObjectId(courseId),
      },
    },
    {
      $group: {
        _id: null,
        total: { $sum: "$amount" },
      },
    },
  ]);

  const paidBefore = totalPaidResult[0]?.total || 0;
  const paidAfter = paidBefore + amount;

  if (course.teacherSalary > 0 && paidAfter > course.teacherSalary) {
    throw new AppError("Payment exceeds configured teacher salary for this course", 400);
  }

  const payment = await Payment.create({
    kind: PAYMENT_KINDS.TEACHER_SALARY,
    teacher: teacherId,
    course: courseId,
    amount,
    note: note || "",
    createdBy,
  });

  return {
    payment,
    summary: {
      teacherSalary: course.teacherSalary,
      paidAmount: paidAfter,
      remainingSalary: Math.max((course.teacherSalary || 0) - paidAfter, 0),
    },
  };
};

