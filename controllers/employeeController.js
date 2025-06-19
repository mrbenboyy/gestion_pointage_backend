import Employee from "../models/Employee.js";
import Department from "../models/Department.js";

// @desc    Create an employee
// @route   POST /api/employees
// @access  Private (Admin, Manager)
export const createEmployee = async (req, res) => {
  const { firstName, lastName, departmentId, position, hireDate } = req.body;

  try {
    // Vérifier si le département existe
    const department = await Department.findById(departmentId);
    if (!department) {
      return res.status(404).json({ message: "Department not found" });
    }

    // Vérifier si le manager appartient au département
    if (
      req.user.role === "manager" &&
      !department.manager.equals(req.user._id)
    ) {
      return res
        .status(403)
        .json({ message: "Not authorized for this department" });
    }

    const employee = new Employee({
      firstName,
      lastName,
      department: departmentId,
      position,
      hireDate: hireDate || Date.now(),
    });

    await employee.save();
    res.status(201).json(employee);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get employees
// @route   GET /api/employees
// @access  Private (Admin, Manager, Supervisor)
export const getEmployees = async (req, res) => {
  try {
    let filter = {};

    // Filtrer par département pour les managers
    if (req.user.role === "manager") {
      filter = { department: req.user.department };
    }

    const employees = await Employee.find(filter).populate(
      "department",
      "name"
    );
    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Update an employee
// @route   PUT /api/employees/:id
// @access  Private (Admin, Manager)
export const updateEmployee = async (req, res) => {
  const { firstName, lastName, departmentId, position, status } = req.body;

  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    // Vérifier les permissions
    if (req.user.role === "manager") {
      const department = await Department.findById(employee.department);
      if (!department.manager.equals(req.user._id)) {
        return res.status(403).json({ message: "Not authorized" });
      }
    }

    employee.firstName = firstName || employee.firstName;
    employee.lastName = lastName || employee.lastName;
    employee.position = position || employee.position;
    employee.status = status || employee.status;

    if (departmentId) {
      employee.department = departmentId;
    }

    await employee.save();
    res.json(employee);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Delete an employee
// @route   DELETE /api/employees/:id
// @access  Private (Admin, Manager)
export const deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    // Vérifier les permissions
    if (req.user.role === "manager") {
      const department = await Department.findById(employee.department);
      if (!department.manager.equals(req.user._id)) {
        return res.status(403).json({ message: "Not authorized" });
      }
    }

    await employee.remove();
    res.json({ message: "Employee removed" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};