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
  sendVerificationCode(email: string): Promise<void>;
  checkVerificationCode(email: string, code: string): Promise<void>;
  sendForgotCode(email: string): Promise<void>;
  checkForgotCode(email: string, code: string): Promise<void>;
  resetPassword(email: string, newPassword: string): Promise<void>;
  refreshToken(): Promise<void>;
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
    if (Validator.validateEmail(email))
      throw new HttpException(
        400,
        ErrorCode.WRONG_EMAIL_FORMAT,
        "The email format is incorrect."
      );
    if (Validator.validatePassword(password))
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
  ): Promise<{ accessToken: string; refreshToken: string }> {
    /* 에러: 각 필드가 비었을 경우 */
    if (!email || !password) {
      throw new HttpException(400, "Invalid input");
    }

    /* 에러: 유저가 존재하지 않거나 비밀번호가 일치하지 않는 경우 */
    const user = await this.userRepository.findUser(email);
    if (
      !user ||
      !(await BcryptHelper.comparePassword(password, user.password))
    ) {
      throw new HttpException(401, "Invalid credentials");
    }

    /* 토큰 생성 및 반환 */
    const token = jwt.sign(
      { id: user.id, name: user.nickname },
      process.env.JWT_SECRET as string,
      {
        expiresIn: "1h",
      }
    );

    return token;
  }

  async sendVerificationCode(email: string): Promise<void> {
    /* 에러: 이메일이 비었을 경우 */
    if (!email) {
      throw new HttpException(400, "Invalid input");
    }

    /* 이메일 전송 */
    const code = Array.from({ length: 6 }, () =>
      Math.floor(Math.random() * 10)
    ).join("");

    const isEmailSended = await EmailSender.sendMail(email, code);
    if (!isEmailSended) {
      throw new HttpException(
        500,
        "Failed to send verification code email. Please try again later."
      );
    }

    /* 코드 저장 */
    await this.authRepository.saveVerificationCode(email, code);
  }

  async checkVerificationCode(email: string, code: string): Promise<void> {
    /* 에러: 이메일이 비었을 경우 */
    if (!email || !code) {
      throw new HttpException(400, "Invalid input");
    }

    const isVerified = await this.authRepository.checkVerificationCode(
      email,
      code
    );

    /* 에러: 코드가 일치하지 않는 경우 */
    if (!isVerified) {
      throw new HttpException(401, "Invalid verification code");
    }

    /* 코드 삭제 */
    await this.authRepository.deleteVerificationCode(email);
  }

  async sendForgotCode(email: string): Promise<void> {}
  async checkForgotCode(email: string, code: string): Promise<void> {}
  async resetPassword(email: string, newPassword: string): Promise<void> {}
  async refreshToken(): Promise<void> {}
}
