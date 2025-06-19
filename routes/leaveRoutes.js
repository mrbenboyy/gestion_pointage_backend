import express from "express";
import {
  createLeaveRequest,
  getLeaveRequests,
  updateLeaveRequest,
  deleteLeaveRequest,
  approveLeaveRequest,
} from "../controllers/leaveController.js";
import { auth } from "../middleware/auth.js";
import { checkRole } from "../middleware/role.js";

const router = express.Router();

router.use(auth);

router
  .route("/")
  .post(checkRole(["manager"]), createLeaveRequest)
  .get(checkRole(["manager", "supervisor", "admin"]), getLeaveRequests);

router
  .route("/:id")
  .put(checkRole(["manager"]), updateLeaveRequest)
  .delete(checkRole(["manager"]), deleteLeaveRequest);

router
  .route("/:id/approve")
  .put(checkRole(["supervisor"]), approveLeaveRequest);

export default router;
