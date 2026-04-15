import { z } from "zod";
import { loginCodeSchema } from "./common.validation.js";

export const loginSchema = z.object({
  body: z.object({
    loginCode: loginCodeSchema,
  }),
  params: z.object({}).passthrough(),
  query: z.object({}).passthrough(),
});

