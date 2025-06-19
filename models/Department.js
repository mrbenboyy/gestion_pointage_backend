const mongoose = require("mongoose");

const departmentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    manager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Department", departmentSchema);
