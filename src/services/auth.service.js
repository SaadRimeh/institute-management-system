import { User } from "../models/user.model.js";
import { AppError } from "../utils/appError.js";
import {
  buildLoginCodeIndex,
  compareLoginCode,
  validateLoginCodeFormat,
} from "../utils/code.js";
import { signToken } from "../utils/jwt.js";

export const loginWithCode = async (loginCode) => {
  if (!validateLoginCodeFormat(loginCode)) {
    throw new AppError("Login code must be a 6-digit number", 400);
  }

  const codeIndex = buildLoginCodeIndex(loginCode);
  const user = await User.findOne({ loginCodeIndex: codeIndex, isActive: true }).select(
    "+loginCodeHash +loginCodeIndex",
  );

  if (!user) {
    throw new AppError("Invalid login code", 401);
  }

  const isValidCode = await compareLoginCode(loginCode, user.loginCodeHash);
  if (!isValidCode) {
    throw new AppError("Invalid login code", 401);
  }

  const token = signToken({
    sub: user.id,
    role: user.role,
  });

  return {
    token,
    user: sanitizeUser(user),
  };
};

export const getCurrentUser = async (userId) => {
  const user = await User.findById(userId);
  if (!user || !user.isActive) {
    throw new AppError("User not found", 404);
  }

  return sanitizeUser(user);
};

const sanitizeUser = (user) => ({
  id: user.id,
  fullName: user.fullName,
  role: user.role,
  phones: user.phones,
  primaryContact: user.primaryContact,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

