import { RowDataPacket } from "mysql2";
import { UUID } from "crypto";
import db from "src/data/config/db";
import { AuthRepository } from "src/domain/repositories/authRepository";

export const createAuthRepository = (): AuthRepository => ({
  saveVerificationCode: async (email: string, code: string): Promise<void> => {
    await db.execute(
      `
      INSERT INTO verification_codes (email, verification_code) 
      VALUES (?, ?) 
      ON DUPLICATE KEY UPDATE 
        verification_code = VALUES(verification_code),
        expires_at = NOW() + INTERVAL 5 MINUTE,
        created_at = NOW()
      `,
      [email, code],
    );
  },

  checkVerificationCode: async (
    email: string,
    code: string,
  ): Promise<boolean> => {
    const [rows] = await db.execute<RowDataPacket[]>(
      "SELECT * FROM verification_codes WHERE email = ? AND verification_code = ? AND expires_at > NOW()",
      [email, code],
    );

    return rows.length > 0;
  },

  deleteVerificationCode: async (email: string): Promise<void> => {
    await db.execute("DELETE FROM verification_codes WHERE email = ?", [email]);
  },

  setEmailVerified: async (email: string): Promise<void> => {
    await db.execute(
      `
      INSERT INTO email_verification_status (email, is_email_verified) 
      VALUES (?, TRUE) 
      ON DUPLICATE KEY UPDATE 
        is_email_verified = TRUE
      `,
      [email],
    );
  },

  setEmailUnverified: async (email: string): Promise<void> => {
    await db.execute(
      `
      UPDATE email_verification_status 
      SET is_email_verified = FALSE 
      WHERE email = ?
      `,
      [email],
    );
  },

  isEmailVerified: async (email: string): Promise<boolean> => {
    const [rows] = await db.execute<RowDataPacket[]>(
      "SELECT is_email_verified FROM email_verification_status WHERE email = ?",
      [email],
    );

    return rows.length > 0 && rows[0].is_email_verified;
  },

  saveRefreshToken: async (userId: UUID, token: string): Promise<void> => {
    await db.execute(
      `
      INSERT INTO refresh_tokens (user_id, token_value) 
      VALUES (?, ?) 
      ON DUPLICATE KEY UPDATE
        token_value = ?,
        expires_at = NOW() + INTERVAL 14 DAY,
        created_at = NOW()
      `,
      [userId, token, token],
    );
  },

  checkRefreshToken: async (userId: UUID, token: string): Promise<boolean> => {
    const [rows] = await db.execute<RowDataPacket[]>(
      `
      SELECT * FROM refresh_tokens 
      WHERE 
        user_id = ? AND 
        token_value = ? AND 
        expires_at > NOW() AND 
        is_revoked = FALSE
      `,
      [userId, token],
    );

    return rows.length > 0;
  },

  deleteRefreshToken: async (userId: UUID): Promise<void> => {
    await db.execute("DELETE FROM refresh_tokens WHERE user_id = ?", [userId]);
  },
});
