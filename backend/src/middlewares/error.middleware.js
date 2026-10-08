import { AppError } from "../utils/appError.js";

export const errorHandler = (error, _req, res, _next) => {
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      success: false,
      message: error.message,
      details: error.details,
    });
  }

  if (error?.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      details: Object.values(error.errors).map((item) => item.message),
    });
  }

  if (error?.name === "CastError") {
    return res.status(400).json({
      success: false,
      message: "Invalid identifier",
    });
  }

  if (error?.code === 11000) {
    return res.status(409).json({
      success: false,
      message: "Duplicate value",
      details: error.keyValue,
    });
  }

  return res.status(500).json({
    success: false,
    message: "Internal server error",
  });
};

