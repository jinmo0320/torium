import { RowDataPacket } from "mysql2";
import db from "../../data/config/db";
import { injectable } from "tsyringe";
import { AuthRepository } from "../../domain/repositories/authRepository";
import { UUID } from "crypto";

// 인증 코드 데이터 구조 정의 (TTL 관리를 위해 expires_at 포함)
interface VerificationData {
  code: string;
  expiresAt: Date;
}

// 인증 코드 저장소 (Key: email, Value: VerificationData)
const verificationStore = new Map<string, VerificationData>();
const expirationMinutes = parseInt(process.env.EXPIRATION_MINUTES || "5", 10);

@injectable()
export class AuthRepositoryImpl implements AuthRepository {
  async saveVerificationCode(email: string, code: string): Promise<void> {
    const expiresAt = new Date(Date.now() + expirationMinutes * 60 * 1000);
    verificationStore.set(email, { code, expiresAt });
  }

  async findVerificationCode(email: string, code: string): Promise<boolean> {
    const storedData = verificationStore.get(email);

    if (!storedData) {
      return false;
    }

    // 1. 코드 일치 여부 확인
    if (storedData.code !== code) {
      return false;
    }

    // 2. 만료 시간 확인
    const isExpired = storedData.expiresAt.getTime() < Date.now();
    if (isExpired) {
      // 만료되었다면 맵에서 제거하고 false 반환 (TTL 기능 모방)
      this.deleteVerificationCode(email);
      return false;
    }

    return true;
  }

  async deleteVerificationCode(email: string): Promise<void> {
    verificationStore.delete(email);
  }

  async saveRefreshToken(userId: UUID, token: string): Promise<void> {}
  async findRefreshToken(userId: UUID, token: string): Promise<boolean> {}
  async deleteRefreshToken(userId: UUID): Promise<void> {}
}
