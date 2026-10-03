import { z } from "zod";
import { loginCodeSchema } from "./common.validation.js";

export const loginSchema = z.object({
  body: z.object({
    loginCode: loginCodeSchema,
    identifier: z.string().trim().min(3).max(50).optional(),
  }),
  params: z.object({}).passthrough(),
  query: z.object({}).passthrough(),
});

