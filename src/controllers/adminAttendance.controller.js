import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/apiResponse.js";
import { getStudentAttendance } from "../services/attendance.service.js";

export const getAdminStudentAttendance = asyncHandler(async (req, res) => {
  const records = await getStudentAttendance(req.params.studentId);
  sendSuccess(res, { records });
});

