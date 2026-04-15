import { ROLES } from "../utils/constants.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/apiResponse.js";
import {
  createUserByRole,
  deleteUserByRole,
  getUserByRoleAndId,
  listUsersByRole,
  updateUserByRole,
} from "../services/user.service.js";

export const createStudent = asyncHandler(async (req, res) => {
  const result = await createUserByRole(ROLES.STUDENT, req.body);
  sendSuccess(
    res,
    {
      user: result.user,
      generatedLoginCode: result.generatedLoginCode,
    },
    201,
  );
});

export const listStudents = asyncHandler(async (req, res) => {
  const result = await listUsersByRole(ROLES.STUDENT, req.query);
  sendSuccess(res, result);
});

export const getStudent = asyncHandler(async (req, res) => {
  const user = await getUserByRoleAndId(ROLES.STUDENT, req.params.id);
  sendSuccess(res, { user });
});

export const updateStudent = asyncHandler(async (req, res) => {
  const user = await updateUserByRole(ROLES.STUDENT, req.params.id, req.body);
  sendSuccess(res, { user });
});

export const deleteStudent = asyncHandler(async (req, res) => {
  const result = await deleteUserByRole(ROLES.STUDENT, req.params.id);
  sendSuccess(res, result);
});

