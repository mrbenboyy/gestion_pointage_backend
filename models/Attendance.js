import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    recordedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    morning: {
      start: Date,
      end: Date,
      status: {
        type: String,
        enum: ["present", "absent", "late", "on_leave"],
        default: "absent",
      },
      lateMinutes: Number,
    },
    afternoon: {
      start: Date,
      end: Date,
      status: {
        type: String,
        enum: ["present", "absent", "late", "on_leave"],
        default: "absent",
      },
      lateMinutes: Number,
    },
    comments: String,
  },
  {
    timestamps: true,
  }
);

// Empêcher les doublons
attendanceSchema.index({ employee: 1, date: 1 }, { unique: true });

const Attendance = mongoose.model("Attendance", attendanceSchema);

export default Attendance;
