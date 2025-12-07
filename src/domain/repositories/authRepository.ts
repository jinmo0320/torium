export interface AuthRepository {
  saveVerificationCode(email: string, code: string): Promise<void>;
  checkVerificationCode(email: string, code: string): Promise<boolean>;
  deleteVerificationCode(email: string): Promise<void>;
}
