import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/apiResponse.js";
import { createAdminNotification } from "../services/notification.service.js";

export const createNotification = asyncHandler(async (req, res) => {
  const notification = await createAdminNotification(req.user.id, req.body);
  sendSuccess(res, { notification }, 201);
});

