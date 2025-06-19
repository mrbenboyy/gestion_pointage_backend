import express from "express";
import {
  requestPasswordReset,
  resetPassword,
} from "../controllers/passwordController.js";

const router = express.Router();

router.post("/reset", requestPasswordReset);
router.put("/reset/:token", resetPassword);

export default router;
