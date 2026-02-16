import { AuthDeps } from "../auth.service";
import { User } from "src/modules/user/domain/user.entity";
import {
  validateEmail,
  validatePassword,
} from "src/modules/auth/domain/auth.logic";
import { generateName, generateTag } from "src/modules/user/domain/user.logic";

import { DomainError } from "src/shared/errors/error";
import { ErrorCodes } from "src/shared/errors/errorCodes";

/**
 * 회원가입
 * @param   email
 * @param   password
 * @errors  EMAIL_ALREADY_REGISTERED, EMAIL_NOT_VERIFIED, WRONG_EMAIL_FORMAT, WRONG_PASSWORD_FORMAT
 * @returns JWT access token, refresh token and user data
 */
type RegisterUsecase = (
  email: string,
  password: string,
) => Promise<{
  accessToken: string;
  refreshToken: string;
  user: User.Info;
}>;

export const createRegister =
  ({
    userRepository,
    authRepository,
    BcryptHelper,
    TokenProvider,
  }: AuthDeps): RegisterUsecase =>
  async (email, password) => {
    /* [Error] input validation */
    if (!validateEmail(email))
      throw new DomainError(
        ErrorCodes.AUTH.WRONG_EMAIL_FORMAT,
        "The email format is incorrect.",
      );

    if (!validatePassword(password))
      throw new DomainError(
        ErrorCodes.AUTH.WRONG_PASSWORD_FORMAT,
        "The password format is incorrect.",
      );

    /* [Error] 이미 가입된 이메일 */
    if (await userRepository.findUserByEmail(email))
      throw new DomainError(
        ErrorCodes.AUTH.EMAIL_ALREADY_REGISTERED,
        "This email address is already registered.",
      );

    /* [Error] 인증되지 않은 이메일 */
    if (!(await authRepository.isEmailVerified(email)))
      throw new DomainError(
        ErrorCodes.AUTH.EMAIL_NOT_VERIFIED,
        "This email has not been verified.",
      );

    /* 0. 무작위 닉네임 생성 */
    const name = generateName();
    const tag = generateTag();
    /* 1. 비밀번호 해싱 */
    const hashedPassword = await BcryptHelper.hashPassword(password);
    /* 2. 유저 생성 */
    const user = await userRepository.createUser({
      name,
      tag,
      email,
      hashedPassword,
    });
    /* 3. 토큰 생성 및 반환 */
    const accessToken = TokenProvider.generateAccessToken({ userId: user.id });
    const refreshToken = TokenProvider.generateRefreshToken({
      userId: user.id,
    });
    await authRepository.saveRefreshToken(user.id, refreshToken);

    return { accessToken, refreshToken, user };
  };
