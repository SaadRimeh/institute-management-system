import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/apiResponse.js";
import { getCurrentUser, loginWithCode } from "../services/auth.service.js";

export const login = asyncHandler(async (req, res) => {
  const result = await loginWithCode(req.body.loginCode);
  sendSuccess(res, result);
});

export const me = asyncHandler(async (req, res) => {
  const user = await getCurrentUser(req.user.id);
  sendSuccess(res, { user });
});

