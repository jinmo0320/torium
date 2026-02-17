import { UserRepository } from "src/modules/user/domain/user.repo";
import { AuthRepository } from "../domain/auth.repo";
import {
  TokenProvider,
  EmailSender,
  BcryptHelper,
} from "../domain/auth.external";

import * as Usecases from "./usecases";

export type AuthDeps = {
  userRepository: UserRepository;
  authRepository: AuthRepository;
  TokenProvider: TokenProvider;
  EmailSender: EmailSender;
  BcryptHelper: BcryptHelper;
};

export const createAuthService = (deps: AuthDeps) => ({
  register: Usecases.createRegister(deps),
  login: Usecases.createLogin(deps),
  sendVerificationCode: Usecases.createSendVerificationCode(deps),
  checkVerificationCode: Usecases.createCheckVerificationCode(deps),
  sendForgotCode: Usecases.createSendForgotCode(deps),
  checkForgotCode: Usecases.createCheckForgotCode(deps),
  resetPassword: Usecases.createResetPassword(deps),
  refreshToken: Usecases.createRefreshToken(deps),
});

export type AuthService = ReturnType<typeof createAuthService>;
