import { ZodError } from "zod";
import { AppError } from "../utils/appError.js";

export const validate =
  (schema) =>
  (req, _res, next) => {
    try {
      const result = schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      req.body = result.body;
      req.query = result.query;
      req.params = result.params;
      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        return next(
          new AppError("Validation failed", 400, error.issues.map((item) => item.message)),
        );
      }

      return next(error);
    }
  };

