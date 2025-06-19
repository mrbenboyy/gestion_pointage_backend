import express from "express";
import {
  getAdminStats,
  getManagerStats,
  getSupervisorStats,
} from "../controllers/statsController.js";
import { auth } from "../middleware/auth.js";
import { checkRole } from "../middleware/role.js";

const router = express.Router();

router.use(auth);

router.get("/admin", checkRole(["admin"]), getAdminStats);
router.get("/manager", checkRole(["manager"]), getManagerStats);
router.get("/supervisor", checkRole(["supervisor"]), getSupervisorStats);

export default router;
