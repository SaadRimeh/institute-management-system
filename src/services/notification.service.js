import { Course } from "../models/course.model.js";
import { Enrollment } from "../models/enrollment.model.js";
import { Notification } from "../models/notification.model.js";
import { User } from "../models/user.model.js";
import { AppError } from "../utils/appError.js";
import { ROLES } from "../utils/constants.js";

const uniqueIds = (ids) => [...new Set(ids.map((id) => String(id)))];

export const createAdminNotification = async (senderId, payload) => {
  let recipients = [];
  let targetRole = null;
  let isGlobal = false;
  let course = null;

  if (payload.targetType === "all") {
    const users = await User.find({ isActive: true }).select("_id");
    recipients = users.map((item) => item.id);
    isGlobal = true;
  } else if (payload.targetType === "student" || payload.targetType === "teacher") {
    const user = await User.findOne({
      _id: payload.userId,
      role: payload.targetType,
      isActive: true,
    }).select("_id");
    if (!user) {
      throw new AppError("Target user not found", 404);
    }
    recipients = [user.id];
  } else if (payload.targetType === "group") {
    targetRole = payload.role;
    if (!targetRole || ![ROLES.STUDENT, ROLES.TEACHER].includes(targetRole)) {
      throw new AppError("Group notifications require role (student|teacher)", 400);
    }

    const users = await User.find({
      role: targetRole,
      isActive: true,
    }).select("_id");
    recipients = users.map((item) => item.id);

    if (payload.courseId) {
      course = payload.courseId;
      if (targetRole === ROLES.STUDENT) {
        const enrollments = await Enrollment.find({ course: payload.courseId }).select("student");
        recipients = enrollments.map((item) => item.student.toString());
      }
    }
  }

  if (!recipients.length) {
    throw new AppError("No recipients found for this notification", 400);
  }

  const notification = await Notification.create({
    sender: senderId,
    targetType: payload.targetType,
    targetRole,
    course,
    recipients: uniqueIds(recipients),
    title: payload.title,
    message: payload.message,
    isGlobal,
  });

  return notification;
};

export const createTeacherAnnouncement = async (teacherId, payload) => {
  const course = await Course.findOne({
    _id: payload.courseId,
    assignedTeacher: teacherId,
    isActive: true,
  });

  if (!course) {
    throw new AppError("Course not found or not assigned to teacher", 404);
  }

  const enrollments = await Enrollment.find({
    course: payload.courseId,
    status: "active",
  }).select("student");

  const recipients = uniqueIds(enrollments.map((item) => item.student.toString()));

  if (!recipients.length) {
    throw new AppError("No students enrolled in this course", 400);
  }

  const notification = await Notification.create({
    sender: teacherId,
    targetType: "group",
    targetRole: ROLES.STUDENT,
    course: payload.courseId,
    recipients,
    title: payload.title,
    message: payload.message,
    isGlobal: false,
  });

  return notification;
};

export const getUserNotifications = async (userId) => {
  return Notification.find({
    $or: [{ isGlobal: true }, { recipients: userId }],
  })
    .populate("sender", "fullName role")
    .populate("course", "name")
    .sort({ createdAt: -1 });
};

