import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/apiResponse.js";
import {
  createStudentPayment,
  createTeacherSalaryPayment,
  getStudentPayments,
} from "../services/payment.service.js";

export const createAdminStudentPayment = asyncHandler(async (req, res) => {
  const result = await createStudentPayment({
    ...req.body,
    createdBy: req.user.id,
  });

  sendSuccess(res, result, 201);
});

export const getAdminStudentPayments = asyncHandler(async (req, res) => {
  const result = await getStudentPayments(req.params.studentId);
  sendSuccess(res, result);
});

export const createAdminTeacherPayment = asyncHandler(async (req, res) => {
  const result = await createTeacherSalaryPayment({
    ...req.body,
    createdBy: req.user.id,
  });

  sendSuccess(res, result, 201);
});

