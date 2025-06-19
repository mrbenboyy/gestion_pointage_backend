import express from "express";
import {
  createDepartment,
  getDepartments,
  updateDepartment,
  deleteDepartment,
} from "../controllers/departmentController.js";
import { auth } from "../middleware/auth.js";
import { checkRole } from "../middleware/role.js";

const router = express.Router();

// Protected routes
router.use(auth);

// Admin only
router
  .route("/")
  .post(checkRole(["admin"]), createDepartment)
  .get(checkRole(["admin", "manager", "supervisor"]), getDepartments);

router
  .route("/:id")
  .put(checkRole(["admin"]), updateDepartment)
  .delete(checkRole(["admin"]), deleteDepartment);

export default router;
