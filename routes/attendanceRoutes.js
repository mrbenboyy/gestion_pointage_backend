import express from "express";
import {
  recordAttendance,
  getAttendance,
} from "../controllers/attendanceController.js";
import { auth } from "../middleware/auth.js";
import { checkRole } from "../middleware/role.js";

const router = express.Router();

router.use(auth, checkRole(["manager", "supervisor", "admin"]));

router.route("/").post(recordAttendance).get(getAttendance);

export default router;
