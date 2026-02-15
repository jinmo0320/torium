import { RowDataPacket } from "mysql2";
import db from "src/shared/infrastructure/db";
import { AuthRepository } from "../application/auth.repo";

export const createAuthRepository = (): AuthRepository => ({
  saveVerificationCode: async (email, code) => {
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

  checkVerificationCode: async (email, code) => {
    const [rows] = await db.execute<RowDataPacket[]>(
      "SELECT * FROM verification_codes WHERE email = ? AND verification_code = ? AND expires_at > NOW()",
      [email, code],
    );

    return rows.length > 0;
  },

  deleteVerificationCode: async (email) => {
    await db.execute("DELETE FROM verification_codes WHERE email = ?", [email]);
  },

  setEmailVerified: async (email) => {
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

  setEmailUnverified: async (email) => {
    await db.execute(
      `
      UPDATE email_verification_status 
      SET is_email_verified = FALSE 
      WHERE email = ?
      `,
      [email],
    );
  },

  isEmailVerified: async (email) => {
    const [rows] = await db.execute<RowDataPacket[]>(
      "SELECT is_email_verified FROM email_verification_status WHERE email = ?",
      [email],
    );

    return rows.length > 0 && rows[0].is_email_verified;
  },

  saveRefreshToken: async (userId, token) => {
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

  checkRefreshToken: async (userId, token) => {
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

  deleteRefreshToken: async (userId): Promise<void> => {
    await db.execute("DELETE FROM refresh_tokens WHERE user_id = ?", [userId]);
  },
});
