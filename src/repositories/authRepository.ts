import { RowDataPacket } from "mysql2";
import db from "../config/db";
import { injectable } from "tsyringe";

export interface AuthRepository {
  saveVerificationCode(email: string, code: string): Promise<void>;
  checkVerificationCode(email: string, code: string): Promise<boolean>;
  deleteVerificationCode(email: string): Promise<void>;
}

@injectable()
export class AuthRepositoryImpl implements AuthRepository {
  async saveVerificationCode(email: string, code: string): Promise<void> {
    await db.query(
      "INSERT INTO email_verifications (email, code) VALUES (?, ?) ON DUPLICATE KEY UPDATE code = VALUES(code), created_at = CURRENT_TIMESTAMP;",
      [email, code]
    );
  }

  async checkVerificationCode(email: string, code: string): Promise<boolean> {
    const [rows] = await db.query<RowDataPacket[]>(
      "SELECT code, expires_at FROM email_verifications WHERE email = ?",
      [email]
    );

    if (rows.length === 0) {
      return false;
    }

    if (rows[0].code !== code || rows[0].expires_at < new Date()) {
      return false;
    }

    return true;
  }

  async deleteVerificationCode(email: string): Promise<void> {
    await db.query("DELETE FROM email_verifications WHERE email = ?", [email]);
  }
}
