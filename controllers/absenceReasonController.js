import AbsenceReason from "../models/AbsenceReason.js";

// @desc    Create an absence reason
// @route   POST /api/absence-reasons
// @access  Private (Manager)
export const createAbsenceReason = async (req, res) => {
  const { name, description } = req.body;

  try {
    // Vérifier que le manager appartient à un département
    if (!req.user.department) {
      return res
        .status(403)
        .json({ message: "Manager must be assigned to a department" });
    }

    const absenceReason = new AbsenceReason({
      name,
      description,
      department: req.user.department,
    });

    await absenceReason.save();
    res.status(201).json(absenceReason);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get absence reasons for a department
// @route   GET /api/absence-reasons
// @access  Private (Manager, Supervisor, Admin)
export const getAbsenceReasons = async (req, res) => {
  try {
    let filter = {};

    // Pour les managers, seulement les motifs de leur département
    if (req.user.role === "manager") {
      filter = { department: req.user.department };
    }

    const absenceReasons = await AbsenceReason.find(filter);
    res.json(absenceReasons);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Update an absence reason
// @route   PUT /api/absence-reasons/:id
// @access  Private (Manager)
export const updateAbsenceReason = async (req, res) => {
  const { name, description } = req.body;

  try {
    const absenceReason = await AbsenceReason.findById(req.params.id);
    if (!absenceReason) {
      return res.status(404).json({ message: "Absence reason not found" });
    }

    // Vérifier que le manager modifie un motif de son département
    if (!absenceReason.department.equals(req.user.department)) {
      return res
        .status(403)
        .json({ message: "Not authorized for this absence reason" });
    }

    absenceReason.name = name || absenceReason.name;
    absenceReason.description = description || absenceReason.description;

    await absenceReason.save();
    res.json(absenceReason);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Delete an absence reason
// @route   DELETE /api/absence-reasons/:id
// @access  Private (Manager)
export const deleteAbsenceReason = async (req, res) => {
  try {
    const absenceReason = await AbsenceReason.findById(req.params.id);
    if (!absenceReason) {
      return res.status(404).json({ message: "Absence reason not found" });
    }

    // Vérifier que le manager supprime un motif de son département
    if (!absenceReason.department.equals(req.user.department)) {
      return res
        .status(403)
        .json({ message: "Not authorized for this absence reason" });
    }

    await absenceReason.remove();
    res.json({ message: "Absence reason removed" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
