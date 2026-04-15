import mongoose from "mongoose";
import { ROLES } from "../utils/constants.js";

const phoneSchema = new mongoose.Schema(
  {
    number: { type: String, required: true, trim: true },
    label: { type: String, required: true, trim: true },
  },
  { _id: false },
);

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    role: {
      type: String,
      required: true,
      enum: Object.values(ROLES),
      index: true,
    },
    loginCodeHash: { type: String, required: true, select: false },
    loginCodeIndex: { type: String, required: true, select: false, unique: true },
    phones: {
      type: [phoneSchema],
      default: [],
    },
    primaryContact: { type: String, required: true, trim: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export const User = mongoose.model("User", userSchema);

