import User from "../models/User.js";
import Department from "../models/Department.js";
import bcrypt from "bcryptjs";

// @desc    Create a user (Admin only)
// @route   POST /api/users
// @access  Private (Admin)
export const createUser = async (req, res) => {
  const { firstName, lastName, email, password, role, departmentId } = req.body;

  try {
    // Check if user exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Create user
    user = new User({
      firstName,
      lastName,
      email,
      password,
      role,
      department: departmentId,
    });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

    // If manager, assign to department
    if (role === "manager" && departmentId) {
      await Department.findByIdAndUpdate(departmentId, { manager: user._id });
    }

    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get all users
// @route   GET /api/users
// @access  Private (Admin)
export const getUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select("-password")
      .populate("department", "name");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Update a user
// @route   PUT /api/users/:id
// @access  Private (Admin)
export const updateUser = async (req, res) => {
  const { firstName, lastName, email, role, departmentId } = req.body;

  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update fields
    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;
    user.email = email || user.email;
    user.role = role || user.role;
    user.department = departmentId || user.department;

    await user.save();
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Delete a user
// @route   DELETE /api/users/:id
// @access  Private (Admin)
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // If manager, remove from department
    if (user.role === "manager") {
      await Department.updateMany(
        { manager: user._id },
        { $unset: { manager: 1 } }
      );
    }

    await user.remove();
    res.json({ message: "User removed" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
