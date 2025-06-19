import Leave from "../models/Leave.js";
import Employee from "../models/Employee.js";
import AbsenceReason from "../models/AbsenceReason.js";

// @desc    Create a leave request
// @route   POST /api/leaves
// @access  Private (Manager)
export const createLeaveRequest = async (req, res) => {
  const { employeeId, reasonId, startDate, endDate, comments } = req.body;

  try {
    // Vérifier que l'employé existe
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    // Vérifier que le motif existe
    const reason = await AbsenceReason.findById(reasonId);
    if (!reason) {
      return res.status(404).json({ message: "Absence reason not found" });
    }

    // Vérifier que le manager est du même département que l'employé
    if (!employee.department.equals(req.user.department)) {
      return res
        .status(403)
        .json({ message: "Not authorized for this employee" });
    }

    const leave = new Leave({
      employee: employeeId,
      reason: reasonId,
      startDate,
      endDate,
      comments,
      requestedBy: req.user._id,
    });

    await leave.save();
    res.status(201).json(leave);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get leave requests
// @route   GET /api/leaves
// @access  Private (Manager, Supervisor, Admin)
export const getLeaveRequests = async (req, res) => {
  const { status, employeeId } = req.query;

  try {
    let filter = {};

    // Filtre par statut
    if (status) {
      filter.status = status;
    }

    // Filtre par employé
    if (employeeId) {
      filter.employee = employeeId;
    }

    // Pour les managers, seulement les demandes de leur département
    if (req.user.role === "manager") {
      const employees = await Employee.find({
        department: req.user.department,
      });
      const employeeIds = employees.map((e) => e._id);
      filter.employee = { $in: employeeIds };
    }

    const leaves = await Leave.find(filter)
      .populate("employee", "firstName lastName")
      .populate("reason", "name")
      .populate("requestedBy", "firstName lastName")
      .populate("approvedBy", "firstName lastName");

    res.json(leaves);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Update leave request status (approval)
// @route   PUT /api/leaves/:id/approve
// @access  Private (Supervisor)
export const approveLeaveRequest = async (req, res) => {
  const { status, comments } = req.body;

  try {
    const leave = await Leave.findById(req.params.id);
    if (!leave) {
      return res.status(404).json({ message: "Leave request not found" });
    }

    // Seul un superviseur peut approuver/rejeter
    if (req.user.role !== "supervisor") {
      return res
        .status(403)
        .json({ message: "Only supervisors can approve leave requests" });
    }

    leave.status = status || leave.status;
    leave.comments = comments || leave.comments;
    leave.approvedBy = req.user._id;

    await leave.save();
    res.json(leave);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Update a leave request
// @route   PUT /api/leaves/:id
// @access  Private (Manager)
export const updateLeaveRequest = async (req, res) => {
  const { reasonId, startDate, endDate, comments } = req.body;

  try {
    const leave = await Leave.findById(req.params.id);
    if (!leave) {
      return res.status(404).json({ message: "Leave request not found" });
    }

    // Vérifier que le manager modifie une demande qu'il a créée
    if (!leave.requestedBy.equals(req.user._id)) {
      return res
        .status(403)
        .json({ message: "Not authorized to modify this leave request" });
    }

    // Vérifier que le statut est toujours "pending"
    if (leave.status !== "pending") {
      return res
        .status(400)
        .json({ message: "Only pending leave requests can be modified" });
    }

    if (reasonId) {
      const reason = await AbsenceReason.findById(reasonId);
      if (!reason) {
        return res.status(404).json({ message: "Absence reason not found" });
      }
      leave.reason = reasonId;
    }

    leave.startDate = startDate || leave.startDate;
    leave.endDate = endDate || leave.endDate;
    leave.comments = comments || leave.comments;

    await leave.save();
    res.json(leave);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Delete a leave request
// @route   DELETE /api/leaves/:id
// @access  Private (Manager)
export const deleteLeaveRequest = async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id);
    if (!leave) {
      return res.status(404).json({ message: "Leave request not found" });
    }

    // Vérifier que le manager supprime une demande qu'il a créée
    if (!leave.requestedBy.equals(req.user._id)) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this leave request" });
    }

    // Vérifier que le statut est toujours "pending"
    if (leave.status !== "pending") {
      return res
        .status(400)
        .json({ message: "Only pending leave requests can be deleted" });
    }

    await leave.remove();
    res.json({ message: "Leave request removed" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
