import dotenv from "dotenv";
import { HttpException } from "../errors/error";
import { BcryptHelper } from "../../utils/bcryptHelper";
import { EmailSender } from "../../utils/emailSender";
import { inject, injectable } from "tsyringe";
import { UserRepository } from "../repositories/userRepository";
import { AuthRepository } from "../repositories/authRepository";
import { Validator } from "../../utils/validator";
import { ErrorCode } from "../errors/errorCodes";
import { TokenProvider } from "../../utils/tokenProvider";
import { NameGenerator } from "../../utils/nameGenerator";
import { UserDto } from "../models/dtos/userDto";

dotenv.config();

export interface AuthService {
  /**
   * 회원가입
   * @param email
   * @param password
   * @returns  JWT access token, refresh token and user data
   */
  register(
    email: string,
    password: string
  ): Promise<{
    accessToken: string;
    refreshToken: string;
    user: UserDto.Response;
  }>;
  /**
   * 로그인
   * @param email
   * @param password
   * @returns  JWT access token, refresh token and user data
   */
  login(
    email: string,
    password: string
  ): Promise<{
    accessToken: string;
    refreshToken: string;
    user: UserDto.Response;
  }>;
  /**
   * 인증코드 이메일 전송
   * @param email
   */
  sendVerificationCode(email: string): Promise<void>;
  /**
   * 인증코드 검증
   * @param email
   * @param code
   */
  checkVerificationCode(email: string, code: string): Promise<void>;
  /**
   * 비밀번호 찾기 인증코드 이메일 전송
   * @param email
   */
  sendForgotCode(email: string): Promise<void>;
  /**
   * 비밀번호 찾기 인증코드 검증
   * @param email
   * @param code
   */
  checkForgotCode(email: string, code: string): Promise<void>;
  /**
   * 비밀번호 재설정
   * @param email
   * @param newPassword
   */
  resetPassword(email: string, newPassword: string): Promise<void>;
  /**
   * 토큰 재발급
   * @param refreshToken
   * @returns JWT access token and refresh token
   */
  refreshToken(refreshToken: string): Promise<{
    accessToken: string;
    refreshToken: string;
  }>;
}

@injectable()
export class AuthServiceImpl implements AuthService {
  constructor(
    @inject("UserRepository") private userRepository: UserRepository,
    @inject("AuthRepository") private authRepository: AuthRepository
  ) {}

  /* ================= 회원가입 ================= */
  async register(
    email: string,
    password: string
  ): Promise<{
    accessToken: string;
    refreshToken: string;
    user: UserDto.Response;
  }> {
    /* [Error] input validation */
    if (!Validator.validateEmail(email))
      throw new HttpException(
        400,
        ErrorCode.WRONG_EMAIL_FORMAT,
        "The email format is incorrect."
      );
    if (!Validator.validatePassword(password))
      throw new HttpException(
        400,
        ErrorCode.WRONG_PASSWORD_FORMAT,
        "The password format is incorrect."
      );

    /* [Error] 이미 가입된 이메일 */
    if (await this.userRepository.findUserByEmail(email))
      throw new HttpException(
        409,
        ErrorCode.EMAIL_ALREADY_REGISTERED,
        "This email address is already registered."
      );

    /* [Error] 인증되지 않은 이메일 */
    if (!(await this.authRepository.isEmailVerified(email)))
      throw new HttpException(
        401,
        ErrorCode.EMAIL_NOT_VERIFIED,
        "This email has not been verified."
      );

    /* 0. 무작위 닉네임 생성 */
    const name = NameGenerator.generateName();
    const tag = NameGenerator.generateTag();
    /* 1. 비밀번호 해싱 */
    const hashedPassword = await BcryptHelper.hashPassword(password);
    /* 2. 유저 생성 */
    const user = await this.userRepository.createUser({
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
    await this.authRepository.saveRefreshToken(user.id, refreshToken);

    return { accessToken, refreshToken, user };
  }

  async login(
    email: string,
    password: string
  ): Promise<{
    accessToken: string;
    refreshToken: string;
    user: UserDto.Response;
  }> {
    /* [Error] input validation */
    if (!Validator.validateEmail(email))
      throw new HttpException(
        400,
        ErrorCode.WRONG_EMAIL_FORMAT,
        "The email format is incorrect."
      );
    if (!Validator.validatePassword(password))
      throw new HttpException(
        400,
        ErrorCode.WRONG_PASSWORD_FORMAT,
        "The password format is incorrect."
      );

    /* [Error] Login failed */
    const user = await this.userRepository.findUserByEmail(email);
    if (!user) {
      throw new HttpException(
        401,
        ErrorCode.LOGIN_FAILED,
        "Invalid email or password."
      );
    }
    const userPassword = await this.userRepository.getUserPassword(user.id);
    if (
      !userPassword ||
      !(await BcryptHelper.comparePassword(
        password,
        userPassword.hashedPassword
      ))
    ) {
      throw new HttpException(
        401,
        ErrorCode.LOGIN_FAILED,
        "Invalid email or password."
      );
    }

    /* 0. 토큰 생성 및 반환 */
    const accessToken = TokenProvider.generateAccessToken({ userId: user.id });
    const refreshToken = TokenProvider.generateRefreshToken({
      userId: user.id,
    });
    await this.authRepository.saveRefreshToken(user.id, refreshToken);

    return { accessToken, refreshToken, user };
  }

  async sendVerificationCode(email: string): Promise<void> {
    /* [Error] input validation */
    if (!Validator.validateEmail(email))
      throw new HttpException(
        400,
        ErrorCode.WRONG_EMAIL_FORMAT,
        "The email format is incorrect."
      );

    /* [Error] 이미 가입된 이메일 */
    if (await this.userRepository.findUserByEmail(email))
      throw new HttpException(
        409,
        ErrorCode.EMAIL_ALREADY_REGISTERED,
        "This email address is already registered."
      );

    /* 0. 인증코드 생성 */
    const code = Array.from({ length: 6 }, () =>
      Math.floor(Math.random() * 10)
    ).join("");
    /* 1. 이메일 전송 */
    await EmailSender.sendMail(email, code);
    /* 2. 인증 정보 저장 */
    await this.authRepository.saveVerificationCode(email, code);
  }

  async checkVerificationCode(email: string, code: string): Promise<void> {
    /* [Error] verification failed */
    const isVerified = await this.authRepository.checkVerificationCode(
      email,
      code
    );
    if (!isVerified) {
      throw new HttpException(
        401,
        ErrorCode.EMAIL_VERIFICATION_FAILED,
        "Email verification code is incorrect or expired."
      );
    }

    /* 0. 코드 삭제 */
    await this.authRepository.deleteVerificationCode(email);
    /* 1. 인증 정보 저장 */
    await this.authRepository.setEmailVerified(email);
  }

  async sendForgotCode(email: string): Promise<void> {
    /* [Error] input validation */
    if (!Validator.validateEmail(email))
      throw new HttpException(
        400,
        ErrorCode.WRONG_EMAIL_FORMAT,
        "The email format is incorrect."
      );

    /* [Error] 가입되지 않은 이메일 */
    if (!(await this.userRepository.findUserByEmail(email)))
      throw new HttpException(
        404,
        ErrorCode.EMAIL_NOT_REGISTERED,
        "You cannot retrieve your password with an unregistered email address."
      );

    /* 0. 인증코드 생성 */
    const code = Array.from({ length: 6 }, () =>
      Math.floor(Math.random() * 10)
    ).join("");
    /* 1. 이메일 전송 */
    await EmailSender.sendMail(email, code);
    /* 2. 인증 정보 저장 */
    await this.authRepository.saveVerificationCode(email, code);
  }

  async checkForgotCode(email: string, code: string): Promise<void> {
    /* [Error] verification failed */
    const isVerified = await this.authRepository.checkVerificationCode(
      email,
      code
    );
    if (!isVerified) {
      throw new HttpException(
        401,
        ErrorCode.EMAIL_VERIFICATION_FAILED,
        "Email verification code is incorrect or expired."
      );
    }

    /* 0. 코드 삭제 */
    await this.authRepository.deleteVerificationCode(email);
    /* 1. 인증 정보 저장 */
    await this.authRepository.setEmailVerified(email);
  }

  async resetPassword(email: string, newPassword: string): Promise<void> {
    /* [Error] input validation */
    if (!Validator.validatePassword(newPassword))
      throw new HttpException(
        400,
        ErrorCode.WRONG_PASSWORD_FORMAT,
        "The password format is incorrect."
      );

    /* [Error] 인증되지 않은 이메일 */
    if (!(await this.authRepository.isEmailVerified(email)))
      throw new HttpException(
        401,
        ErrorCode.EMAIL_NOT_VERIFIED,
        "This email has not been verified."
      );

    /* 0. 비밀번호 해싱 */
    const hashedPassword = await BcryptHelper.hashPassword(newPassword);
    /* 1. 비밀번호 재설정 */
    const user = await this.userRepository.findUserByEmail(email);
    if (!user) {
      throw new HttpException(404, ErrorCode.USER_NOT_FOUND, "User not found");
    }
    await this.userRepository.updateUserPassword(user.id, hashedPassword);
  }

  async refreshToken(refreshToken: string): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    /* [Error] Unverified tokens */
    const payload = TokenProvider.verifyRefreshToken(refreshToken);
    if (!payload) {
      throw new HttpException(
        401,
        ErrorCode.TOKEN_INVALID,
        "Invalid refresh token."
      );
    }
    /* [Error] Invalid refresh token */
    const userId = payload.userId;
    const isTokenValid = await this.authRepository.checkRefreshToken(
      userId,
      refreshToken
    );
    if (!isTokenValid) {
      await this.authRepository.deleteRefreshToken(userId);
      throw new HttpException(
        401,
        ErrorCode.TOKEN_INVALID,
        "Invalid refresh token."
      );
    }
    /* 0. 토큰 생성 및 반환 */
    const newAccessToken = TokenProvider.generateAccessToken({
      userId,
    });
    const newRefreshToken = TokenProvider.generateRefreshToken({
      userId,
    });
    await this.authRepository.saveRefreshToken(userId, newRefreshToken);

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  }
}
