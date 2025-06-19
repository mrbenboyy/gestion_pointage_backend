const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    date: { type: Date, required: true, default: Date.now },
    morning: {
      start: Date,
      end: Date,
      status: {
        type: String,
        enum: ["present", "absent", "late", "on_mission"],
      },
      lateMinutes: Number,
    },
    afternoon: {
      start: Date,
      end: Date,
      status: {
        type: String,
        enum: ["present", "absent", "late", "on_mission"],
      },
      lateMinutes: Number,
    },
    recordedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    comments: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Attendance", attendanceSchema);
