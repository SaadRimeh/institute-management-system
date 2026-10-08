import { z } from "zod";
import { COURSE_LEVELS, COURSE_TYPES, ROLES } from "../utils/constants.js";
import {
  loginCodeSchema,
  objectIdSchema,
  paginationQuerySchema,
  phoneItemSchema,
} from "./common.validation.js";

const withEmptyParams = (bodySchema, querySchema = z.object({}).passthrough()) =>
  z.object({
    body: bodySchema,
    params: z.object({}).passthrough(),
    query: querySchema,
  });

const userCreateBodySchema = z.object({
  fullName: z.string().min(2).max(120),
  loginCode: loginCodeSchema.optional(),
  phones: z.array(phoneItemSchema).default([]),
  primaryContact: z.string().min(3).max(40),
});

const userUpdateBodySchema = z.object({
  fullName: z.string().min(2).max(120).optional(),
  loginCode: loginCodeSchema.optional(),
  phones: z.array(phoneItemSchema).optional(),
  primaryContact: z.string().min(3).max(40).optional(),
  isActive: z.boolean().optional(),
});

const byIdParamsSchema = z.object({
  id: objectIdSchema,
});

const listQuerySchema = paginationQuerySchema;

const courseScheduleItemSchema = z.object({
  day: z.string().min(2).max(20),
  time: z.string().min(1).max(30),
});

const courseCreateBodySchema = z.object({
  name: z.string().min(2).max(140),
  price: z.number().nonnegative(),
  teacherSalary: z.number().nonnegative().optional(),
  duration: z.string().min(1).max(80),
  schedule: z.array(courseScheduleItemSchema).min(1),
  level: z.enum(COURSE_LEVELS),
  type: z.enum(COURSE_TYPES),
  assignedTeacher: objectIdSchema.optional().nullable(),
});

const courseUpdateBodySchema = z.object({
  name: z.string().min(2).max(140).optional(),
  price: z.number().nonnegative().optional(),
  teacherSalary: z.number().nonnegative().optional(),
  duration: z.string().min(1).max(80).optional(),
  schedule: z.array(courseScheduleItemSchema).min(1).optional(),
  level: z.enum(COURSE_LEVELS).optional(),
  type: z.enum(COURSE_TYPES).optional(),
  assignedTeacher: objectIdSchema.optional().nullable(),
  isActive: z.boolean().optional(),
});

const enrollmentBodySchema = z.object({
  studentId: objectIdSchema,
  courseId: objectIdSchema,
  coursePrice: z.number().nonnegative().optional(),
});

const studentPaymentBodySchema = z.object({
  studentId: objectIdSchema,
  courseId: objectIdSchema,
  amount: z.number().positive(),
  note: z.string().max(300).optional(),
});

const teacherPaymentBodySchema = z.object({
  teacherId: objectIdSchema,
  courseId: objectIdSchema,
  amount: z.number().positive(),
  note: z.string().max(300).optional(),
});

const notificationBodySchema = z
  .object({
    targetType: z.enum(["student", "teacher", "group", "all"]),
    userId: objectIdSchema.optional(),
    role: z.enum([ROLES.STUDENT, ROLES.TEACHER]).optional(),
    courseId: objectIdSchema.optional(),
    title: z.string().min(2).max(150),
    message: z.string().min(2).max(1000),
  })
  .superRefine((data, ctx) => {
    if ((data.targetType === "student" || data.targetType === "teacher") && !data.userId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["userId"],
        message: "userId is required for single-user notifications",
      });
    }

    if (data.targetType === "group" && !data.role) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["role"],
        message: "role is required for group notifications",
      });
    }
  });

const attendanceParamsSchema = z.object({
  studentId: objectIdSchema,
});

export const createStudentSchema = withEmptyParams(userCreateBodySchema);
export const listStudentsSchema = z.object({
  body: z.object({}).passthrough(),
  params: z.object({}).passthrough(),
  query: listQuerySchema,
});
export const getStudentSchema = z.object({
  body: z.object({}).passthrough(),
  params: byIdParamsSchema,
  query: z.object({}).passthrough(),
});
export const updateStudentSchema = z.object({
  body: userUpdateBodySchema,
  params: byIdParamsSchema,
  query: z.object({}).passthrough(),
});
export const deleteStudentSchema = getStudentSchema;

export const createTeacherSchema = withEmptyParams(userCreateBodySchema);
export const listTeachersSchema = listStudentsSchema;
export const getTeacherSchema = getStudentSchema;
export const updateTeacherSchema = updateStudentSchema;
export const deleteTeacherSchema = getStudentSchema;

export const createCourseSchema = withEmptyParams(courseCreateBodySchema);
export const listCoursesSchema = z.object({
  body: z.object({}).passthrough(),
  params: z.object({}).passthrough(),
  query: listQuerySchema.extend({
    level: z.enum(COURSE_LEVELS).optional(),
    type: z.enum(COURSE_TYPES).optional(),
    assignedTeacher: objectIdSchema.optional(),
  }),
});
export const getCourseSchema = getStudentSchema;
export const updateCourseSchema = z.object({
  body: courseUpdateBodySchema,
  params: byIdParamsSchema,
  query: z.object({}).passthrough(),
});
export const deleteCourseSchema = getStudentSchema;

export const createEnrollmentSchema = withEmptyParams(enrollmentBodySchema);

export const createStudentPaymentSchema = withEmptyParams(studentPaymentBodySchema);
export const getStudentPaymentsSchema = z.object({
  body: z.object({}).passthrough(),
  params: z.object({ studentId: objectIdSchema }),
  query: z.object({}).passthrough(),
});

export const createTeacherPaymentSchema = withEmptyParams(teacherPaymentBodySchema);

export const createNotificationSchema = withEmptyParams(notificationBodySchema);

export const getAttendanceSchema = z.object({
  body: z.object({}).passthrough(),
  params: attendanceParamsSchema,
  query: z.object({}).passthrough(),
});

export const getDashboardSchema = z.object({
  body: z.object({}).passthrough(),
  params: z.object({}).passthrough(),
  query: z.object({}).passthrough(),
});

