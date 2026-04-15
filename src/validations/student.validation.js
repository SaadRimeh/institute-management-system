import { z } from "zod";
import { objectIdSchema } from "./common.validation.js";

export const getStudentCourseSchema = z.object({
  body: z.object({}).passthrough(),
  params: z.object({
    id: objectIdSchema,
  }),
  query: z.object({}).passthrough(),
});

