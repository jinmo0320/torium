import { AuthDeps } from "../auth.service";
import { validatePassword } from "src/modules/auth/domain/auth.logic";

import { DomainError } from "src/shared/errors/error";
import { ErrorCodes } from "src/shared/errors/errorCodes";

/**
 * 비밀번호 재설정
 * @param email
 * @param newPassword
 * @errors  EMAIL_NOT_VERIFIED, WRONG_PASSWORD_FORMAT, USER_NOT_FOUND
 */
type ResetPasswordUsecase = (
  email: string,
  newPassword: string,
) => Promise<void>;

export const createResetPassword =
  ({
    userRepository,
    authRepository,
    BcryptHelper,
  }: AuthDeps): ResetPasswordUsecase =>
  async (email, newPassword) => {
    /* [Error] input validation */
    if (!validatePassword(newPassword))
      throw new DomainError(
        ErrorCodes.AUTH.WRONG_PASSWORD_FORMAT,
        "The password format is incorrect.",
      );

    /* [Error] 인증되지 않은 이메일 */
    if (!(await authRepository.isEmailVerified(email)))
      throw new DomainError(
        ErrorCodes.AUTH.EMAIL_NOT_VERIFIED,
        "This email has not been verified.",
      );

    /* 0. 비밀번호 해싱 */
    const hashedPassword = await BcryptHelper.hashPassword(newPassword);
    /* 1. 비밀번호 재설정 */
    const user = await userRepository.findUserByEmail(email);
    if (!user) {
      throw new DomainError(ErrorCodes.USER.NOT_FOUND, "User not found");
    }
    await userRepository.updateUserPassword(user.id, hashedPassword);
  };
