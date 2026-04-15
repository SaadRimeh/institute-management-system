import mongoose from "mongoose";
import { COURSE_LEVELS, COURSE_TYPES } from "../utils/constants.js";

const scheduleSchema = new mongoose.Schema(
  {
    day: { type: String, required: true, trim: true },
    time: { type: String, required: true, trim: true },
  },
  { _id: false },
);

const courseSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, index: true },
    price: { type: Number, required: true, min: 0 },
    teacherSalary: { type: Number, default: 0, min: 0 },
    duration: { type: String, required: true, trim: true },
    schedule: {
      type: [scheduleSchema],
      default: [],
    },
    level: {
      type: String,
      required: true,
      enum: COURSE_LEVELS,
    },
    type: {
      type: String,
      required: true,
      enum: COURSE_TYPES,
    },
    assignedTeacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export const Course = mongoose.model("Course", courseSchema);

