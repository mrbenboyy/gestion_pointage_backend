import Attendance from "../models/Attendance.js";
import Employee from "../models/Employee.js";
import Leave from "../models/Leave.js";
import Department from "../models/Department.js";

// @desc    Get dashboard stats for admin
// @route   GET /api/stats/admin
// @access  Private (Admin)
export const getAdminStats = async (req, res) => {
  try {
    // Compter les employés actifs
    const activeEmployees = await Employee.countDocuments({ status: "active" });

    // Compter les départements
    const departmentCount = await Department.countDocuments();

    // Taux d'absentéisme global
    const totalAttendances = await Attendance.countDocuments();
    const absentAttendances = await Attendance.countDocuments({
      $or: [{ "morning.status": "absent" }, { "afternoon.status": "absent" }],
    });
    const absenceRate =
      totalAttendances > 0 ? (absentAttendances / totalAttendances) * 100 : 0;

    // Congés en cours
    const pendingLeaves = await Leave.countDocuments({ status: "pending" });

    res.json({
      activeEmployees,
      departmentCount,
      absenceRate: absenceRate.toFixed(2),
      pendingLeaves,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get dashboard stats for manager
// @route   GET /api/stats/manager
// @access  Private (Manager)
export const getManagerStats = async (req, res) => {
  try {
    // Récupérer le département du manager
    const department = await Department.findById(req.user.department);
    if (!department) {
      return res.status(400).json({ message: "Department not found" });
    }

    // Statistiques du département
    const employees = await Employee.find({ department: department._id });
    const employeeIds = employees.map((e) => e._id);

    // Calculer le taux d'absentéisme
    const totalAttendances = await Attendance.countDocuments({
      employee: { $in: employeeIds },
    });
    const absentAttendances = await Attendance.countDocuments({
      employee: { $in: employeeIds },
      $or: [{ "morning.status": "absent" }, { "afternoon.status": "absent" }],
    });
    const absenceRate =
      totalAttendances > 0 ? (absentAttendances / totalAttendances) * 100 : 0;

    // Retards
    const lateAttendances = await Attendance.countDocuments({
      employee: { $in: employeeIds },
      $or: [
        { "morning.lateMinutes": { $gt: 0 } },
        { "afternoon.lateMinutes": { $gt: 0 } },
      ],
    });

    // Congés en attente
    const pendingLeaves = await Leave.countDocuments({
      employee: { $in: employeeIds },
      status: "pending",
    });

    res.json({
      totalEmployees: employees.length,
      absenceRate: absenceRate.toFixed(2),
      lateAttendances,
      pendingLeaves,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get dashboard stats for supervisor
// @route   GET /api/stats/supervisor
// @access  Private (Supervisor)
export const getSupervisorStats = async (req, res) => {
  try {
    // Récupérer tous les départements
    const departments = await Department.find();
    const departmentStats = [];

    // Statistiques par département
    for (const dept of departments) {
      const employees = await Employee.find({ department: dept._id });
      const employeeIds = employees.map((e) => e._id);

      const totalAttendances = await Attendance.countDocuments({
        employee: { $in: employeeIds },
      });
      const absentAttendances = await Attendance.countDocuments({
        employee: { $in: employeeIds },
        $or: [{ "morning.status": "absent" }, { "afternoon.status": "absent" }],
      });

      const absenceRate =
        totalAttendances > 0 ? (absentAttendances / totalAttendances) * 100 : 0;

      const pendingLeaves = await Leave.countDocuments({
        employee: { $in: employeeIds },
        status: "pending",
      });

      departmentStats.push({
        departmentId: dept._id,
        departmentName: dept.name,
        totalEmployees: employees.length,
        absenceRate: absenceRate.toFixed(2),
        pendingLeaves,
      });
    }

    // Congés à valider
    const leavesToApprove = await Leave.countDocuments({ status: "pending" });

    res.json({
      departmentStats,
      leavesToApprove,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
