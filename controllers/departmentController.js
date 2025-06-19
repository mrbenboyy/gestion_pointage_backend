import Department from "../models/Department.js";

// @desc    Create a department
// @route   POST /api/departments
// @access  Private (Admin)
export const createDepartment = async (req, res) => {
  const { name } = req.body;

  try {
    const department = new Department({ name });
    await department.save();
    res.status(201).json(department);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get all departments
// @route   GET /api/departments
// @access  Private (Admin, Manager, Supervisor)
export const getDepartments = async (req, res) => {
  try {
    const departments = await Department.find().populate(
      "manager",
      "firstName lastName email"
    );
    res.json(departments);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Update a department
// @route   PUT /api/departments/:id
// @access  Private (Admin)
export const updateDepartment = async (req, res) => {
  const { name, managerId } = req.body;

  try {
    const department = await Department.findById(req.params.id);
    if (!department) {
      return res.status(404).json({ message: "Department not found" });
    }

    department.name = name || department.name;

    if (managerId) {
      department.manager = managerId;
    }

    await department.save();
    res.json(department);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Delete a department
// @route   DELETE /api/departments/:id
// @access  Private (Admin)
export const deleteDepartment = async (req, res) => {
  try {
    const department = await Department.findById(req.params.id);
    if (!department) {
      return res.status(404).json({ message: "Department not found" });
    }

    await department.remove();
    res.json({ message: "Department removed" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
