import { AuthDeps } from "../auth.service";
import { User } from "src/modules/user/domain/user.entity";
import {
  validateEmail,
  validatePassword,
} from "src/modules/auth/domain/auth.logic";

import { LoginReqDto, LoginResDto } from "../auth.dto";
import { DomainError } from "src/shared/errors/error";
import { ErrorCodes } from "src/shared/errors/errorCodes";

/**
 * 로그인
 * @param   email
 * @param   password
 * @errors  LOGIN_FAILED, WRONG_EMAIL_FORMAT, WRONG_PASSWORD_FORMAT
 * @returns JWT access token, refresh token and user data
 */
type LoginUsecase = ({ email, password }: LoginReqDto) => Promise<LoginResDto>;

export const createLogin =
  ({
    userRepository,
    authRepository,
    BcryptHelper,
    TokenProvider,
  }: AuthDeps): LoginUsecase =>
  async ({ email, password }) => {
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

    /* [Error] Login failed */
    const user = await userRepository.findUserByEmail(email);
    if (!user) {
      throw new DomainError(
        ErrorCodes.AUTH.LOGIN_FAILED,
        "Invalid email or password.",
      );
    }
    const userPassword = await userRepository.getUserPassword(user.id);
    if (
      !userPassword ||
      !(await BcryptHelper.comparePassword(
        password,
        userPassword.hashedPassword,
      ))
    ) {
      throw new DomainError(
        ErrorCodes.AUTH.LOGIN_FAILED,
        "Invalid email or password.",
      );
    }

    /* 0. 토큰 생성 및 반환 */
    const accessToken = TokenProvider.generateAccessToken({ userId: user.id });
    const refreshToken = TokenProvider.generateRefreshToken({
      userId: user.id,
    });
    await authRepository.saveRefreshToken(user.id, refreshToken);

    return { accessToken, refreshToken, user };
  };
