import { connectDatabase } from "../config/database.js";
import { env } from "../config/env.js";
import { User } from "../models/user.model.js";
import { ROLES } from "./constants.js";
import {
  buildLoginCodeIndex,
  generateLoginCode,
  hashLoginCode,
  validateLoginCodeFormat,
} from "./code.js";

const seedAdmin = async () => {
  await connectDatabase();

  const fullName = process.env.ADMIN_NAME || "System Admin";
  const primaryContact = process.env.ADMIN_CONTACT || "admin-contact";
  const loginCode = process.env.ADMIN_CODE || generateLoginCode();

  if (!validateLoginCodeFormat(loginCode)) {
    throw new Error("ADMIN_CODE must be a 6-digit number");
  }

  const existing = await User.findOne({ role: ROLES.ADMIN, isActive: true });
  if (existing) {
    // eslint-disable-next-line no-console
    console.log("Active admin already exists. Skipping seed.");
    process.exit(0);
  }

  const loginCodeHash = await hashLoginCode(loginCode);
  const loginCodeIndex = buildLoginCodeIndex(loginCode);

  const admin = await User.create({
    fullName,
    role: ROLES.ADMIN,
    loginCodeHash,
    loginCodeIndex,
    phones: [],
    primaryContact,
  });

  // eslint-disable-next-line no-console
  console.log("Admin created successfully:");
  // eslint-disable-next-line no-console
  console.log({
    id: admin.id,
    fullName: admin.fullName,
    role: admin.role,
    loginCode,
    mongoUri: env.mongoUri,
  });

  process.exit(0);
};

seedAdmin().catch((error) => {
  // eslint-disable-next-line no-console
  console.error("Failed to seed admin:", error);
  process.exit(1);
});

