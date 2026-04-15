import mongoose from "mongoose";
import { NOTIFICATION_TARGET_TYPES, ROLES } from "../utils/constants.js";

const notificationSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    targetType: {
      type: String,
      enum: NOTIFICATION_TARGET_TYPES,
      required: true,
    },
    targetRole: {
      type: String,
      enum: [ROLES.STUDENT, ROLES.TEACHER],
      default: null,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      default: null,
    },
    recipients: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    isGlobal: { type: Boolean, default: false, index: true },
  },
  { timestamps: true },
);

notificationSchema.index({ recipients: 1, createdAt: -1 });

export const Notification = mongoose.model("Notification", notificationSchema);

