import mongoose from "mongoose";
import { PAYMENT_KINDS } from "../utils/constants.js";

const paymentSchema = new mongoose.Schema(
  {
    kind: {
      type: String,
      enum: Object.values(PAYMENT_KINDS),
      required: true,
      index: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      default: null,
    },
    enrollment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Enrollment",
      default: null,
    },
    amount: { type: Number, required: true, min: 0 },
    note: { type: String, default: "" },
    paidAt: { type: Date, default: Date.now },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

export const Payment = mongoose.model("Payment", paymentSchema);

