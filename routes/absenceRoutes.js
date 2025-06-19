import express from "express";
import {
  createAbsenceReason,
  getAbsenceReasons,
  updateAbsenceReason,
  deleteAbsenceReason,
} from "../controllers/absenceReasonController.js";
import { auth } from "../middleware/auth.js";
import { checkRole } from "../middleware/role.js";

const router = express.Router();

router.use(auth, checkRole(["manager", "supervisor", "admin"]));

router
  .route("/")
  .post(checkRole(["manager"]), createAbsenceReason)
  .get(getAbsenceReasons);

router
  .route("/:id")
  .put(checkRole(["manager"]), updateAbsenceReason)
  .delete(checkRole(["manager"]), deleteAbsenceReason);

export default router;
