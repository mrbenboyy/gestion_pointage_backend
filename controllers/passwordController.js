import User from "../models/User.js";
import crypto from "crypto";
import bcrypt from "bcryptjs";

// @desc    Request password reset
// @route   POST /api/password/reset
// @access  Public
export const requestPasswordReset = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Générer un token
    const resetToken = crypto.randomBytes(20).toString("hex");
    const resetExpires = Date.now() + 3600000; // 1 heure

    user.resetToken = resetToken;
    user.resetExpires = resetExpires;

    await user.save();

    // En production, on enverrait un email ici
    res.json({
      message: "Reset instructions sent",
      resetToken, // À retirer en production
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Reset password
// @route   PUT /api/password/reset/:token
// @access  Public
export const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    const user = await User.findOne({
      resetToken: token,
      resetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    // Hasher le nouveau mot de passe
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    user.resetToken = undefined;
    user.resetExpires = undefined;

    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
