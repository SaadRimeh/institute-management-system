import mongoose from "mongoose";
import { Attendance } from "../models/attendance.model.js";
import { Course } from "../models/course.model.js";
import { Enrollment } from "../models/enrollment.model.js";
import { Grade } from "../models/grade.model.js";
import { Notification } from "../models/notification.model.js";
import { Payment } from "../models/payment.model.js";
import { User } from "../models/user.model.js";
import { PAYMENT_KINDS, ROLES } from "../utils/constants.js";

const sumPayments = async (kind) => {
  const rows = await Payment.aggregate([
    { $match: { kind } },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);
  return rows[0]?.total || 0;
};

export const getAdminDashboard = async () => {
  const [
    totalUsers,
    totalStudents,
    totalTeachers,
    totalCourses,
    totalEnrollments,
    studentPayments,
    teacherPayments,
    balanceRows,
    recentAttendances,
    recentGrades,
    recentTeacherNotifications,
  ] = await Promise.all([
    User.countDocuments({ isActive: true }),
    User.countDocuments({ role: ROLES.STUDENT, isActive: true }),
    User.countDocuments({ role: ROLES.TEACHER, isActive: true }),
    Course.countDocuments({ isActive: true }),
    Enrollment.countDocuments({}),
    sumPayments(PAYMENT_KINDS.STUDENT_PAYMENT),
    sumPayments(PAYMENT_KINDS.TEACHER_SALARY),
    Enrollment.aggregate([{ $group: { _id: null, total: { $sum: "$remainingBalance" } } }]),
    Attendance.find({})
      .populate("teacher", "fullName")
      .populate("student", "fullName")
      .populate("course", "name")
      .sort({ createdAt: -1 })
      .limit(8),
    Grade.find({})
      .populate("teacher", "fullName")
      .populate("student", "fullName")
      .populate("course", "name")
      .sort({ createdAt: -1 })
      .limit(8),
    Notification.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "sender",
          foreignField: "_id",
          as: "senderUser",
        },
      },
      { $unwind: "$senderUser" },
      { $match: { "senderUser.role": ROLES.TEACHER } },
      { $sort: { createdAt: -1 } },
      { $limit: 8 },
      {
        $project: {
          _id: 1,
          title: 1,
          message: 1,
          createdAt: 1,
          teacherName: "$senderUser.fullName",
          recipientCount: { $size: "$recipients" },
        },
      },
    ]),
  ]);

  const courseSalarySummary = await Course.aggregate([
    { $match: { isActive: true, assignedTeacher: { $ne: null } } },
    {
      $lookup: {
        from: "payments",
        let: { courseId: "$_id", teacherId: "$assignedTeacher" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$course", "$$courseId"] },
                  { $eq: ["$teacher", "$$teacherId"] },
                  { $eq: ["$kind", PAYMENT_KINDS.TEACHER_SALARY] },
                ],
              },
            },
          },
          { $group: { _id: null, paid: { $sum: "$amount" } } },
        ],
        as: "salaryPayments",
      },
    },
    {
      $project: {
        _id: 1,
        name: 1,
        teacherSalary: 1,
        paidSalary: {
          $ifNull: [{ $arrayElemAt: ["$salaryPayments.paid", 0] }, 0],
        },
        remainingSalary: {
          $max: [
            {
              $subtract: [
                "$teacherSalary",
                {
                  $ifNull: [{ $arrayElemAt: ["$salaryPayments.paid", 0] }, 0],
                },
              ],
            },
            0,
          ],
        },
      },
    },
    { $sort: { createdAt: -1 } },
    { $limit: 20 },
  ]);

  const recentTeacherActions = [
    ...recentAttendances.map((item) => ({
      actionType: "attendance",
      teacher: item.teacher?.fullName,
      student: item.student?.fullName,
      course: item.course?.name,
      status: item.status,
      createdAt: item.createdAt,
    })),
    ...recentGrades.map((item) => ({
      actionType: "grade",
      teacher: item.teacher?.fullName,
      student: item.student?.fullName,
      course: item.course?.name,
      examName: item.examName,
      score: item.score,
      maxScore: item.maxScore,
      createdAt: item.createdAt,
    })),
    ...recentTeacherNotifications.map((item) => ({
      actionType: "announcement",
      teacher: item.teacherName,
      title: item.title,
      recipientCount: item.recipientCount,
      createdAt: item.createdAt,
    })),
  ]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 20);

  return {
    totals: {
      users: totalUsers,
      students: totalStudents,
      teachers: totalTeachers,
      courses: totalCourses,
      enrollments: totalEnrollments,
    },
    finance: {
      studentPayments,
      teacherPayments,
      outstandingStudentBalance: balanceRows[0]?.total || 0,
    },
    courseSalarySummary,
    recentTeacherActions,
  };
};

