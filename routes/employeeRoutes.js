import express from "express";
import {
  createEmployee,
  getEmployees,
  updateEmployee,
  deleteEmployee,
} from "../controllers/employeeController.js";
import { auth } from "../middleware/auth.js";
import { checkRole } from "../middleware/role.js";

const router = express.Router();

router.use(auth);

router
  .route("/")
  .post(checkRole(["admin", "manager"]), createEmployee)
  .get(checkRole(["admin", "manager", "supervisor"]), getEmployees);

router
  .route("/:id")
  .put(checkRole(["admin", "manager"]), updateEmployee)
  .delete(checkRole(["admin", "manager"]), deleteEmployee);

export default router;
