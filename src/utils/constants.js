export const ROLES = Object.freeze({
  ADMIN: "admin",
  TEACHER: "teacher",
  STUDENT: "student",
});

export const COURSE_LEVELS = Object.freeze([
  "beginner",
  "intermediate",
  "advanced",
]);

export const COURSE_TYPES = Object.freeze(["online", "offline"]);

export const ATTENDANCE_STATUSES = Object.freeze([
  "present",
  "absent",
  "late",
  "excused",
]);

export const PAYMENT_KINDS = Object.freeze({
  STUDENT_PAYMENT: "student_payment",
  TEACHER_SALARY: "teacher_salary",
});

export const NOTIFICATION_TARGET_TYPES = Object.freeze([
  "student",
  "teacher",
  "group",
  "all",
]);

