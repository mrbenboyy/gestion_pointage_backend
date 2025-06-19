import express from "express";
import {
  createUser,
  getUsers,
  updateUser,
  deleteUser,
} from "../controllers/userController.js";
import { auth } from "../middleware/auth.js";
import { checkRole } from "../middleware/role.js";

const router = express.Router();

// Admin only routes
router.use(auth, checkRole(["admin"]));

router.route("/").post(createUser).get(getUsers);

router.route("/:id").put(updateUser).delete(deleteUser);

export default router;
