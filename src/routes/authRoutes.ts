import { Router } from "express";
import {
  login,
  register,
  verifyEmail,
  checkVerificationCode,
} from "../controllers/authController";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/verify-email", verifyEmail);
router.post("/check-verification-code", checkVerificationCode);

export default router;
