import { z } from "zod";
import { ATTENDANCE_STATUSES } from "../utils/constants.js";
import { objectIdSchema } from "./common.validation.js";

export const getTeacherCourseStudentsSchema = z.object({
  body: z.object({}).passthrough(),
  params: z.object({
    courseId: objectIdSchema,
  }),
  query: z.object({}).passthrough(),
});

export const createTeacherNotificationSchema = z.object({
  body: z.object({
    courseId: objectIdSchema,
    title: z.string().min(2).max(150),
    message: z.string().min(2).max(1000),
  }),
  params: z.object({}).passthrough(),
  query: z.object({}).passthrough(),
});

export const createTeacherGradeSchema = z.object({
  body: z.object({
    courseId: objectIdSchema,
    studentId: objectIdSchema,
    examName: z.string().min(2).max(120),
    score: z.number().nonnegative(),
    maxScore: z.number().positive(),
    examDate: z.string().datetime().optional(),
    notes: z.string().max(500).optional(),
  }),
  params: z.object({}).passthrough(),
  query: z.object({}).passthrough(),
});

export const createTeacherAttendanceSchema = z.object({
  body: z.object({
    courseId: objectIdSchema,
    studentId: objectIdSchema,
    date: z.string().datetime().optional(),
    status: z.enum(ATTENDANCE_STATUSES),
    notes: z.string().max(500).optional(),
  }),
  params: z.object({}).passthrough(),
  query: z.object({}).passthrough(),
});

