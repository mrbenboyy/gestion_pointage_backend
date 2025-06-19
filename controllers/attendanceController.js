import Attendance from "../models/Attendance.js";
import Employee from "../models/Employee.js";

// Fonction pour calculer les minutes de retard
const calculateLateMinutes = (actualTime, expectedTime) => {
  const actual = new Date(actualTime);
  const expected = new Date(expectedTime);
  const diff = actual - expected;
  return diff > 0 ? Math.floor(diff / 60000) : 0; // Convertir en minutes
};

// @desc    Record attendance
// @route   POST /api/attendance
// @access  Private (Manager, Supervisor)
export const recordAttendance = async (req, res) => {
  const { employeeId, date, morning, afternoon, comments } = req.body;
  const recordedBy = req.user.id;

  try {
    // Vérifier que l'employé existe
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    // Vérifier les permissions (manager doit être dans le même département)
    if (req.user.role === "manager") {
      if (!employee.department.equals(req.user.department)) {
        return res
          .status(403)
          .json({ message: "Not authorized for this employee" });
      }
    }

    // Heures attendues
    const attendanceDate = new Date(date);
    const expectedMorningStart = new Date(attendanceDate);
    expectedMorningStart.setHours(8, 0, 0, 0); // 8h00

    const expectedAfternoonStart = new Date(attendanceDate);
    expectedAfternoonStart.setHours(14, 0, 0, 0); // 14h00

    // Calculer les retards
    const morningLateMinutes = morning.start
      ? calculateLateMinutes(morning.start, expectedMorningStart)
      : 0;

    const afternoonLateMinutes = afternoon.start
      ? calculateLateMinutes(afternoon.start, expectedAfternoonStart)
      : 0;

    // Créer ou mettre à jour le pointage
    const attendance = await Attendance.findOneAndUpdate(
      { employee: employeeId, date: attendanceDate },
      {
        recordedBy,
        morning: {
          ...morning,
          lateMinutes: morningLateMinutes,
          status: morning.start ? "present" : morning.status || "absent",
        },
        afternoon: {
          ...afternoon,
          lateMinutes: afternoonLateMinutes,
          status: afternoon.start ? "present" : afternoon.status || "absent",
        },
        comments,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.status(201).json(attendance);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get attendance records
// @route   GET /api/attendance
// @access  Private (Manager, Supervisor, Admin)
export const getAttendance = async (req, res) => {
  const { employeeId, startDate, endDate } = req.query;

  try {
    let filter = {};

    // Filtrer par employé
    if (employeeId) {
      filter.employee = employeeId;
    }

    // Filtrer par date
    if (startDate && endDate) {
      filter.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    // Pour les managers, filtrer par département
    if (req.user.role === "manager") {
      const employees = await Employee.find({
        department: req.user.department,
      });
      const employeeIds = employees.map((e) => e._id);
      filter.employee = { $in: employeeIds };
    }

    const attendance = await Attendance.find(filter)
      .populate("employee", "firstName lastName")
      .populate("recordedBy", "firstName lastName");

    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
