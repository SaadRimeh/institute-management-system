import { User } from "../models/user.model.js";
import { AppError } from "../utils/appError.js";
import {
  buildLoginCodeIndex,
  generateLoginCode,
  hashLoginCode,
  validateLoginCodeFormat,
} from "../utils/code.js";
import { parsePagination } from "../utils/pagination.js";

const prepareCodeCredentials = async (providedCode) => {
  const plainCode = providedCode || generateLoginCode();

  if (!validateLoginCodeFormat(plainCode)) {
    throw new AppError("Login code must be a 6-digit number", 400);
  }

  const loginCodeHash = await hashLoginCode(plainCode);
  const loginCodeIndex = buildLoginCodeIndex(plainCode);

  return { plainCode, loginCodeHash, loginCodeIndex };
};

export const createUserByRole = async (role, payload) => {
  const createUserDocument = async (plainCode) => {
    const loginCodeHash = await hashLoginCode(plainCode);
    const loginCodeIndex = buildLoginCodeIndex(plainCode);

    const user = await User.create({
      fullName: payload.fullName,
      role,
      loginCodeHash,
      loginCodeIndex,
      phones: payload.phones || [],
      primaryContact: payload.primaryContact,
    });

    return { user, generatedLoginCode: plainCode };
  };

  if (payload.loginCode) {
    if (!validateLoginCodeFormat(payload.loginCode)) {
      throw new AppError("Login code must be a 6-digit number", 400);
    }
    return createUserDocument(payload.loginCode);
  }

  let lastError;
  for (let attempt = 0; attempt < 5; attempt += 1) {
    try {
      const generatedCode = generateLoginCode();
      return await createUserDocument(generatedCode);
    } catch (error) {
      if (error?.code === 11000) {
        lastError = error;
        continue;
      }
      throw error;
    }
  }

  throw lastError || new AppError("Failed to generate unique login code", 500);
};

export const listUsersByRole = async (role, query) => {
  const { page, limit, skip } = parsePagination(query);
  const search = query.search?.trim();

  const filter = {
    role,
    isActive: true,
  };

  if (search) {
    filter.$or = [
      { fullName: { $regex: search, $options: "i" } },
      { primaryContact: { $regex: search, $options: "i" } },
      { "phones.number": { $regex: search, $options: "i" } },
    ];
  }

  const [items, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    User.countDocuments(filter),
  ]);

  return {
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
};

export const getUserByRoleAndId = async (role, userId) => {
  const user = await User.findOne({
    _id: userId,
    role,
    isActive: true,
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  return user;
};

export const updateUserByRole = async (role, userId, payload) => {
  const user = await getUserByRoleAndId(role, userId);

  if (payload.loginCode) {
    const { loginCodeHash, loginCodeIndex } = await prepareCodeCredentials(payload.loginCode);
    user.loginCodeHash = loginCodeHash;
    user.loginCodeIndex = loginCodeIndex;
  }

  if (payload.fullName !== undefined) user.fullName = payload.fullName;
  if (payload.phones !== undefined) user.phones = payload.phones;
  if (payload.primaryContact !== undefined) user.primaryContact = payload.primaryContact;
  if (payload.isActive !== undefined) user.isActive = payload.isActive;

  await user.save();
  return user;
};

export const deleteUserByRole = async (role, userId) => {
  const user = await getUserByRoleAndId(role, userId);
  user.isActive = false;
  await user.save();

  return { id: user.id };
};
