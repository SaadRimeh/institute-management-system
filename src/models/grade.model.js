import mongoose from "mongoose";

const gradeSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
      index: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    examName: { type: String, required: true, trim: true },
    score: { type: Number, required: true, min: 0 },
    maxScore: { type: Number, required: true, min: 1 },
    examDate: { type: Date, default: Date.now },
    notes: { type: String, default: "" },
  },
  { timestamps: true },
);

gradeSchema.index({ course: 1, student: 1, examName: 1, examDate: 1 });

export const Grade = mongoose.model("Grade", gradeSchema);

