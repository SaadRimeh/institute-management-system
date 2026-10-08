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

export const createTeacher = asyncHandler(async (req, res) => {
  const result = await createUserByRole(ROLES.TEACHER, req.body);
  sendSuccess(
    res,
    {
      user: result.user,
      generatedLoginCode: result.generatedLoginCode,
    },
    201,
  );
});

export const listTeachers = asyncHandler(async (req, res) => {
  const result = await listUsersByRole(ROLES.TEACHER, req.query);
  sendSuccess(res, result);
});

export const getTeacher = asyncHandler(async (req, res) => {
  const user = await getUserByRoleAndId(ROLES.TEACHER, req.params.id);
  sendSuccess(res, { user });
});

export const updateTeacher = asyncHandler(async (req, res) => {
  const user = await updateUserByRole(ROLES.TEACHER, req.params.id, req.body);
  sendSuccess(res, { user });
});

export const deleteTeacher = asyncHandler(async (req, res) => {
  const result = await deleteUserByRole(ROLES.TEACHER, req.params.id);
  sendSuccess(res, result);
});

