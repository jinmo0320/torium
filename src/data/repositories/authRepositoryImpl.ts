import { RowDataPacket } from "mysql2";
import db from "../../data/config/db";
import { injectable } from "tsyringe";
import { AuthRepository } from "../../domain/repositories/authRepository";
import { UUID } from "crypto";

@injectable()
export class AuthRepositoryImpl implements AuthRepository {
  async saveVerificationCode(email: string, code: string): Promise<void> {}
  async findVerificationCode(email: string, code: string): Promise<boolean> {
    return false;
  }
  async deleteVerificationCode(email: string): Promise<void> {}

  async saveRefreshToken(userId: UUID, token: string): Promise<void> {}
  async findRefreshToken(userId: UUID, token: string): Promise<boolean> {
    return false;
  }
  async deleteRefreshToken(userId: UUID): Promise<void> {}
}
