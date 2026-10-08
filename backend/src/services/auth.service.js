import { User } from "../models/user.model.js";
import { AppError } from "../utils/appError.js";
import {
  buildLoginCodeIndex,
  compareLoginCode,
  validateLoginCodeFormat,
} from "../utils/code.js";
import { signToken } from "../utils/jwt.js";

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

export const loginWithCode = async (loginCode, identifier = null) => {
  if (!validateLoginCodeFormat(loginCode)) {
    throw new AppError("Login code must be a 6-digit number", 400);
  }

  let user;
  if (identifier && typeof identifier === "string" && identifier.trim()) {
    const contact = identifier.trim();
    user = await User.findOne({
      $or: [{ primaryContact: contact }, { "phones.number": contact }],
      isActive: true,
    }).select("+loginCodeHash +loginCodeIndex");
  } else {
    const codeIndex = buildLoginCodeIndex(loginCode);
    user = await User.findOne({ loginCodeIndex: codeIndex, isActive: true }).select(
      "+loginCodeHash +loginCodeIndex",
    );
  }

  if (!user) {
    throw new AppError("Invalid login credentials", 401);
  }

  if (user.lockUntil && user.lockUntil > new Date()) {
    const remainingMins = Math.max(
      1,
      Math.ceil((user.lockUntil.getTime() - Date.now()) / (60 * 1000)),
    );
    throw new AppError(
      `Account is temporarily locked due to multiple failed login attempts. Please try again in ${remainingMins} minute(s).`,
      429,
    );
  }

  const isValidCode = await compareLoginCode(loginCode, user.loginCodeHash);
  if (!isValidCode) {
    user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
    if (user.failedLoginAttempts >= MAX_FAILED_ATTEMPTS) {
      user.lockUntil = new Date(Date.now() + LOCKOUT_DURATION_MS);
      user.failedLoginAttempts = 0;
    }
    await user.save();
    throw new AppError("Invalid login credentials", 401);
  }

  if (user.failedLoginAttempts > 0 || user.lockUntil) {
    user.failedLoginAttempts = 0;
    user.lockUntil = null;
    await user.save();
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

