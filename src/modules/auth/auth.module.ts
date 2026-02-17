import { Router } from "express";

import { createUserRepository } from "src/modules/user/infrastructure/user.repo.impl";
import { createAuthRepository } from "./infrastructure/auth.repo.impl";
import { createEmailSender } from "./infrastructure/external/auth.emailSender.impl";
import { createTokenProvider } from "src/shared/infrastructure/tokenProvider";
import { createBcryptHelper } from "src/shared/infrastructure/bcryptHelper";

import { createAuthService } from "./application/auth.service";
import { authContoller } from "./presentation/auth.controller";

const router = Router();

const service = createAuthService({
  userRepository: createUserRepository(),
  authRepository: createAuthRepository(),
  TokenProvider: createTokenProvider(),
  EmailSender: createEmailSender(),
  BcryptHelper: createBcryptHelper(),
});
const ctrl = authContoller(service);

router.post("/register", ctrl.register);
router.post("/login", ctrl.login);
router.post("/verification/send", ctrl.sendVerificationCode);
router.post("/verification/verify", ctrl.checkVerificationCode);
router.post("/forgot-password/send", ctrl.sendForgotCode);
router.post("/forgot-password/verify", ctrl.checkForgotCode);
router.post("/reset-password", ctrl.resetPassword);
router.post("/refresh", ctrl.refreshToken);

export default router;
