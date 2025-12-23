import { UUID } from "crypto";

export interface AuthRepository {
  saveVerificationCode(email: string, code: string): Promise<void>;
  findVerificationCode(email: string, code: string): Promise<boolean>;
  deleteVerificationCode(email: string): Promise<void>;

  setEmailVerified(email: string): Promise<void>;
  isEmailVerified(email: string): Promise<boolean>;

  saveRefreshToken(userId: UUID, token: string): Promise<void>;
  findRefreshToken(userId: UUID, token: string): Promise<boolean>;
  deleteRefreshToken(userId: UUID): Promise<void>;
}
