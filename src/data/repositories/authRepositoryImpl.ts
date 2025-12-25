import { RowDataPacket } from "mysql2";
import db from "../../data/config/db";
import { injectable } from "tsyringe";
import { AuthRepository } from "../../domain/repositories/authRepository";
import { UUID } from "crypto";

@injectable()
export class AuthRepositoryImpl implements AuthRepository {
  async saveVerificationCode(email: string, code: string): Promise<void> {
    await db.query(
      "INSERT INTO verification_codes (email, code) VALUES (?, ?) ON DUPLICATE KEY UPDATE code = ?",
      [email, code, code]
    );
  }

  async checkVerificationCode(email: string, code: string): Promise<boolean> {
    const [rows] = await db.query<RowDataPacket[]>(
      "SELECT * FROM verification_codes WHERE email = ? AND code = ? AND expires_at > NOW()",
      [email, code]
    );

    return rows.length > 0;
  }

  async deleteVerificationCode(email: string): Promise<void> {
    await db.query("DELETE FROM verification_codes WHERE email = ?", [email]);
  }

  async setEmailVerified(email: string): Promise<void> {
    await db.query(
      "UPDATE email_verification_status SET is_email_verified = TRUE WHERE email = ?",
      [email]
    );
  }

  async isEmailVerified(email: string): Promise<boolean> {
    const [rows] = await db.query<RowDataPacket[]>(
      "SELECT is_email_verified FROM email_verification_status WHERE email = ?",
      [email]
    );

    return rows.length > 0 && rows[0].is_email_verified;
  }

  async saveRefreshToken(userId: UUID, token: string): Promise<void> {
    await db.query(
      "INSERT INTO refresh_tokens (user_id, token_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE token_value = ?",
      [userId, token, token]
    );
  }

  async checkRefreshToken(userId: UUID, token: string): Promise<boolean> {
    const [rows] = await db.query<RowDataPacket[]>(
      "SELECT * FROM refresh_tokens WHERE user_id = ? AND token_value = ? AND expires_at > NOW() AND is_revoked = FALSE",
      [userId, token]
    );

    return rows.length > 0;
  }

  async deleteRefreshToken(userId: UUID): Promise<void> {
    await db.query("DELETE FROM refresh_tokens WHERE user_id = ?", [userId]);
  }
}
