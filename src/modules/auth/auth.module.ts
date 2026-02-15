import { Router } from "express";

import { createUserRepository } from "src/modules/user/infrastructure/user.repo.impl";
import { createAuthRepository } from "./infrastructure/auth.repo.impl";
import { createEmailSender } from "./infrastructure/external/auth.emailSender.impl";
import { createTokenProvider } from "src/shared/infrastructure/tokenProvider";
import { createBcryptHelper } from "src/shared/infrastructure/bcryptHelper";
import { authUsecase } from "./application/auth.usecase";
import { authContoller } from "./interface/auth.controller";

const router = Router();

const usecase = authUsecase(
  createUserRepository(),
  createAuthRepository(),
  createTokenProvider(),
  createEmailSender(),
  createBcryptHelper(),
);
const ctrl = authContoller(usecase);

router.post("/register", ctrl.register);
router.post("/login", ctrl.login);
router.post("/verification/send", ctrl.sendVerificationCode);
router.post("/verification/verify", ctrl.checkVerificationCode);
router.post("/forgot-password/send", ctrl.sendForgotCode);
router.post("/forgot-password/verify", ctrl.checkForgotCode);
router.post("/reset-password", ctrl.resetPassword);
router.post("/refresh", ctrl.refreshToken);

export default router;
