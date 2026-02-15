import dotenv from "dotenv";
import { UserRepository } from "src/modules/user/application/user.repo";
import { AuthRepository } from "./auth.repo";
import { User } from "src/modules/user/domain/user.entity";
import { DomainError } from "src/shared/errors/error";
import { ErrorCodes } from "src/shared/errors/errorCodes";
import {
  validateEmail,
  validatePassword,
  generateVerificationCode,
} from "../domain/auth.logic";
import { generateName, generateTag } from "src/modules/user/domain/user.logic";
import { TokenProvider, EmailSender, BcryptHelper } from "./auth.external";

dotenv.config();

export type AuthUsecase = {
  /**
   * 회원가입
   * @param   email
   * @param   password
   * @errors  EMAIL_ALREADY_REGISTERED, EMAIL_NOT_VERIFIED, WRONG_EMAIL_FORMAT, WRONG_PASSWORD_FORMAT
   * @returns JWT access token, refresh token and user data
   */
  register: (
    email: string,
    password: string,
  ) => Promise<{
    accessToken: string;
    refreshToken: string;
    user: User.Info;
  }>;
  /**
   * 로그인
   * @param   email
   * @param   password
   * @errors  LOGIN_FAILED, WRONG_EMAIL_FORMAT, WRONG_PASSWORD_FORMAT
   * @returns JWT access token, refresh token and user data
   */
  login: (
    email: string,
    password: string,
  ) => Promise<{
    accessToken: string;
    refreshToken: string;
    user: User.Info;
  }>;
  /**
   * 인증코드 이메일 전송
   * @param   email
   * @errors  EMAIL_ALREADY_REGISTERED, WRONG_EMAIL_FORMAT
   */
  sendVerificationCode: (email: string) => Promise<void>;
  /**
   * 인증코드 검증
   * @param   email
   * @param   code
   * @errors  EMAIL_VERIFICATION_FAILED
   */
  checkVerificationCode: (email: string, code: string) => Promise<void>;
  /**
   * 비밀번호 찾기 인증코드 이메일 전송
   * @param   email
   * @errors  EMAIL_NOT_REGISTERED, WRONG_EMAIL_FORMAT
   */
  sendForgotCode: (email: string) => Promise<void>;
  /**
   * 비밀번호 찾기 인증코드 검증
   * @param   email
   * @param   code
   * @errors  EMAIL_VERIFICATION_FAILED
   */
  checkForgotCode: (email: string, code: string) => Promise<void>;
  /**
   * 비밀번호 재설정
   * @param email
   * @param newPassword
   * @errors  EMAIL_NOT_VERIFIED, WRONG_PASSWORD_FORMAT, USER_NOT_FOUND
   */
  resetPassword: (email: string, newPassword: string) => Promise<void>;
  /**
   * 토큰 재발급
   * @param   refreshToken
   * @errors  TOKEN_INVALID
   * @returns JWT access token and refresh token
   */
  refreshToken: (refreshToken: string) => Promise<{
    accessToken: string;
    refreshToken: string;
  }>;
};

export const authUsecase = (
  userRepository: UserRepository,
  authRepository: AuthRepository,
  TokenProvider: TokenProvider,
  EmailSender: EmailSender,
  BcryptHelper: BcryptHelper,
): AuthUsecase => ({
  /* ================= 회원가입 ================= */
  register: async (email, password) => {
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
  },

  login: async (email, password) => {
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
  },

  sendVerificationCode: async (email) => {
    /* [Error] input validation */
    if (!validateEmail(email))
      throw new DomainError(
        ErrorCodes.AUTH.WRONG_EMAIL_FORMAT,
        "The email format is incorrect.",
      );

    /* [Error] 이미 가입된 이메일 */
    if (await userRepository.findUserByEmail(email))
      throw new DomainError(
        ErrorCodes.AUTH.EMAIL_ALREADY_REGISTERED,
        "This email address is already registered.",
      );

    /* 0. 인증코드 생성 */
    const code = generateVerificationCode();
    /* 1. 이메일 전송 */
    await EmailSender.sendMail(email, code);
    /* 2. 인증 정보 초기화 및 코드 저장 */
    await authRepository.setEmailUnverified(email);
    await authRepository.saveVerificationCode(email, code);
  },

  checkVerificationCode: async (email, code) => {
    /* [Error] verification failed */
    const isVerified = await authRepository.checkVerificationCode(email, code);
    if (!isVerified) {
      throw new DomainError(
        ErrorCodes.AUTH.EMAIL_VERIFICATION_FAILED,
        "Email verification code is incorrect or expired.",
      );
    }

    /* 0. 코드 삭제 */
    await authRepository.deleteVerificationCode(email);
    /* 1. 인증 정보 저장 */
    await authRepository.setEmailVerified(email);
  },

  sendForgotCode: async (email) => {
    /* [Error] input validation */
    if (!validateEmail(email))
      throw new DomainError(
        ErrorCodes.AUTH.WRONG_EMAIL_FORMAT,
        "The email format is incorrect.",
      );

    /* [Error] 가입되지 않은 이메일 */
    if (!(await userRepository.findUserByEmail(email)))
      throw new DomainError(
        ErrorCodes.AUTH.EMAIL_NOT_REGISTERED,
        "You cannot retrieve your password with an unregistered email address.",
      );

    /* 0. 인증코드 생성 */
    const code = generateVerificationCode();
    /* 1. 이메일 전송 */
    await EmailSender.sendMail(email, code);
    /* 2. 인증 정보 초기화 및 코드 저장 */
    await authRepository.setEmailUnverified(email);
    await authRepository.saveVerificationCode(email, code);
  },

  checkForgotCode: async (email, code) => {
    /* [Error] verification failed */
    const isVerified = await authRepository.checkVerificationCode(email, code);
    if (!isVerified) {
      throw new DomainError(
        ErrorCodes.AUTH.EMAIL_VERIFICATION_FAILED,
        "Email verification code is incorrect or expired.",
      );
    }

    /* 0. 코드 삭제 */
    await authRepository.deleteVerificationCode(email);
    /* 1. 인증 정보 저장 */
    await authRepository.setEmailVerified(email);
  },

  resetPassword: async (email, newPassword) => {
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
  },

  refreshToken: async (refreshToken) => {
    /* [Error] Unverified tokens */
    const payload = TokenProvider.verifyRefreshToken(refreshToken);
    if (!payload) {
      throw new DomainError(
        ErrorCodes.AUTH.TOKEN_INVALID,
        "Invalid refresh token.",
      );
    }
    /* [Error] Invalid refresh token */
    const userId = payload.userId;
    const isTokenValid = await authRepository.checkRefreshToken(
      userId,
      refreshToken,
    );
    if (!isTokenValid) {
      await authRepository.deleteRefreshToken(userId);
      throw new DomainError(
        ErrorCodes.AUTH.TOKEN_INVALID,
        "Invalid refresh token.",
      );
    }
    /* 0. 토큰 생성 및 반환 */
    const newAccessToken = TokenProvider.generateAccessToken({
      userId,
    });
    const newRefreshToken = TokenProvider.generateRefreshToken({
      userId,
    });
    await authRepository.saveRefreshToken(userId, newRefreshToken);

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  },
});
