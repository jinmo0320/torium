import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { HttpException } from "../../utils/errors";
import { BcryptHelper } from "../../utils/bcryptHelper";
import { EmailSender } from "../../utils/emailSender";
import { inject, injectable } from "tsyringe";
import { UserRepository } from "../repositories/userRepository";
import { AuthRepository } from "../repositories/authRepository";

dotenv.config();

@injectable()
export class AuthService {
  constructor(
    @inject("UserRepository") private userRepository: UserRepository,
    @inject("AuthRepository") private authRepository: AuthRepository
  ) {}

  async register(
    nickname: string,
    email: string,
    password: string
  ): Promise<void> {
    /* 에러: 각 필드가 비었을 경우 */
    if (!nickname || !email || !password) {
      throw new HttpException(400, "Invalid input");
    }

    /* 에러: 이미 존재하는 이메일인 경우 */
    const user = await this.userRepository.findUser(email);
    if (user) {
      throw new HttpException(409, "User already exists");
    }

    /* 비밀번호 해싱 후 유저 생성 */
    const hashedPassword = await BcryptHelper.hashPassword(password);
    await this.userRepository.createUser(nickname, email, hashedPassword);
  }

  async login(email: string, password: string): Promise<string> {
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

  async verifyEmail(email: string): Promise<void> {
    /* 에러: 이메일이 비었을 경우 */
    if (!email) {
      throw new HttpException(400, "Invalid input");
    }

    /* 이메일 전송 */
    const code = Array.from({ length: 6 }, () =>
      Math.floor(Math.random() * 10)
    ).join("");

    await EmailSender.sendMail(email, code);

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
}
