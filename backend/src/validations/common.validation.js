import { z } from "zod";

export const objectIdSchema = z
  .string()
  .regex(/^[a-f\d]{24}$/i, "Invalid MongoDB ObjectId");

export const loginCodeSchema = z
  .string()
  .regex(/^\d{6}$/, "Login code must be a 6-digit number");

export const phoneItemSchema = z.object({
  number: z.string().min(3).max(30),
  label: z.string().min(1).max(30),
});

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().optional(),
  search: z.string().trim().optional(),
});

