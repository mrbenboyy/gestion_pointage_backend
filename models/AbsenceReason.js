import mongoose from "mongoose";

const absenceReasonSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    description: String,
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const AbsenceReason = mongoose.model("AbsenceReason", absenceReasonSchema);

export default AbsenceReason;
