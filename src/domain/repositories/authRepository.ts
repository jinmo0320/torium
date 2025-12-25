import { UUID } from "crypto";

export interface AuthRepository {
  saveVerificationCode(email: string, code: string): Promise<void>;
  checkVerificationCode(email: string, code: string): Promise<boolean>;
  deleteVerificationCode(email: string): Promise<void>;

  setEmailVerified(email: string): Promise<void>;
  setEmailUnverified(email: string): Promise<void>;
  isEmailVerified(email: string): Promise<boolean>;

  saveRefreshToken(userId: UUID, token: string): Promise<void>;
  checkRefreshToken(userId: UUID, token: string): Promise<boolean>;
  deleteRefreshToken(userId: UUID): Promise<void>;
}
