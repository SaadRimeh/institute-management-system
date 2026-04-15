import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/apiResponse.js";
import { createEnrollment } from "../services/enrollment.service.js";

export const createAdminEnrollment = asyncHandler(async (req, res) => {
  const enrollment = await createEnrollment(req.body);
  sendSuccess(res, { enrollment }, 201);
});

