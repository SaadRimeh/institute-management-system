import { Attendance } from "../models/attendance.model.js";
import { Course } from "../models/course.model.js";
import { Grade } from "../models/grade.model.js";
import { Enrollment } from "../models/enrollment.model.js";
import { AppError } from "../utils/appError.js";
import { createGrade } from "./grade.service.js";
import { markAttendance } from "./attendance.service.js";
import { createTeacherAnnouncement } from "./notification.service.js";

export const getTeacherCoursesWithStats = async (teacherId) => {
  const courses = await Course.find({
    assignedTeacher: teacherId,
    isActive: true,
  }).sort({ createdAt: -1 });

  const courseIds = courses.map((item) => item._id);
  const [enrollmentCounts, attendanceCounts, gradeCounts] = await Promise.all([
    Enrollment.aggregate([
      { $match: { course: { $in: courseIds }, status: "active" } },
      { $group: { _id: "$course", count: { $sum: 1 } } },
    ]),
    Attendance.aggregate([
      { $match: { course: { $in: courseIds } } },
      { $group: { _id: "$course", count: { $sum: 1 } } },
    ]),
    Grade.aggregate([
      { $match: { course: { $in: courseIds } } },
      { $group: { _id: "$course", count: { $sum: 1 } } },
    ]),
  ]);

  const mapCount = (rows) =>
    rows.reduce((acc, item) => {
      acc[item._id.toString()] = item.count;
      return acc;
    }, {});

  const enrollmentMap = mapCount(enrollmentCounts);
  const attendanceMap = mapCount(attendanceCounts);
  const gradeMap = mapCount(gradeCounts);

  return courses.map((course) => ({
    ...course.toObject(),
    stats: {
      activeStudents: enrollmentMap[course.id] || 0,
      attendanceRecords: attendanceMap[course.id] || 0,
      gradeRecords: gradeMap[course.id] || 0,
    },
  }));
};

export const getCourseStudentsForTeacher = async (teacherId, courseId) => {
  const course = await Course.findOne({
    _id: courseId,
    assignedTeacher: teacherId,
    isActive: true,
  });

  if (!course) {
    throw new AppError("Course not found or not assigned to teacher", 404);
  }

  const enrollments = await Enrollment.find({
    course: courseId,
    status: "active",
  }).populate("student", "fullName primaryContact phones");

  return {
    course,
    students: enrollments.map((item) => ({
      enrollmentId: item.id,
      student: item.student,
      paidAmount: item.paidAmount,
      remainingBalance: item.remainingBalance,
    })),
  };
};

export const teacherMarkAttendance = async (teacherId, payload) =>
  markAttendance({
    actor: { id: teacherId, role: "teacher" },
    ...payload,
  });

export const teacherAddGrade = async (teacherId, payload) =>
  createGrade({
    actor: { id: teacherId, role: "teacher" },
    ...payload,
  });

export const teacherSendAnnouncement = async (teacherId, payload) =>
  createTeacherAnnouncement(teacherId, payload);

