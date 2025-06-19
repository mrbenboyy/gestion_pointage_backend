const Attendance = require("../models/Attendance");

// @desc    Create attendance record
// @route   POST /api/attendance
// @access  Private/ManagerOrSupervisor
const createAttendance = async (req, res) => {
  try {
    const { employee, date, morning, afternoon, comments } = req.body;

    const attendance = new Attendance({
      employee,
      date,
      morning,
      afternoon,
      comments,
      recordedBy: req.user.id,
    });

    await attendance.save();
    res.status(201).json(attendance);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get attendance by employee
// @route   GET /api/attendance/employee/:id
// @access  Private/ManagerOrSupervisor
const getAttendanceByEmployee = async (req, res) => {
  try {
    const attendance = await Attendance.find({
      employee: req.params.id,
    }).populate("employee", "firstName lastName");

    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { createAttendance, getAttendanceByEmployee };
