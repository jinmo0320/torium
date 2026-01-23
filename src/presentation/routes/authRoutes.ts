import { Router } from "express";
import {
  register,
  login,
  sendVerificationCode,
  checkVerificationCode,
  sendForgotCode,
  checkForgotCode,
  resetPassword,
  refreshToken,
} from "../controllers/authController";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/verification/send", sendVerificationCode);
router.post("/verification/verify", checkVerificationCode);
router.post("/forgot-password/send", sendForgotCode);
router.post("/forgot-password/verify", checkForgotCode);
router.post("/reset-password", resetPassword);
router.post("/refresh", refreshToken);

export default router;
