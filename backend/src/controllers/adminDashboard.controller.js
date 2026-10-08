import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/apiResponse.js";
import { getAdminDashboard } from "../services/dashboard.service.js";

export const getDashboard = asyncHandler(async (_req, res) => {
  const dashboard = await getAdminDashboard();
  sendSuccess(res, { dashboard });
});

