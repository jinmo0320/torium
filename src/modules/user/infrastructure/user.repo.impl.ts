import { RowDataPacket } from "mysql2";
import db from "src/shared/infrastructure/db";
import { UserRepository } from "../domain/user.repo";
import { User } from "../domain/user.entity";

export const createUserRepository = (): UserRepository => ({
  createUser: async (user) => {
    await db.execute(
      "INSERT INTO users (name, tag, email, password) VALUES (?, ?, ?, ?)",
      [user.name, user.tag, user.email, user.hashedPassword],
    );

    const [rows] = await db.execute<RowDataPacket[]>(
      "SELECT * FROM users WHERE email = ?",
      [user.email],
    );

    const { id, name, tag, email, riskType } = rows[0];
    return { id, name, tag, email, riskType };
  },

  findUserById: async (id) => {
    const [rows] = await db.execute<RowDataPacket[]>(
      "SELECT * FROM users WHERE id = ?",
      [id],
    );

    if (rows.length === 0) {
      return null;
    }

    const { name, tag, email, riskType } = rows[0];
    return { id, name, tag, email, riskType };
  },

  findUserByEmail: async (email) => {
    const [rows] = await db.execute<RowDataPacket[]>(
      "SELECT * FROM users WHERE email = ?",
      [email],
    );

    if (rows.length === 0) {
      return null;
    }

    const { id, name, tag, riskType } = rows[0];
    return { id, name, tag, email, riskType };
  },

  findUserByName: async (name, tag) => {
    const [rows] = await db.execute<RowDataPacket[]>(
      "SELECT * FROM users WHERE name = ? AND tag = ?",
      [name, tag],
    );

    if (rows.length === 0) {
      return null;
    }

    const { id, email, riskType } = rows[0];
    return { id, name, tag, email, riskType };
  },

  getUserPassword: async (id) => {
    const [rows] = await db.execute<RowDataPacket[]>(
      "SELECT id, email, password FROM users WHERE id = ?",
      [id],
    );

    if (rows.length === 0) {
      return null;
    }

    const { email, password } = rows[0];
    return { id, email, hashedPassword: password };
  },

  updateUserPassword: async (id, hashedPassword) => {
    await db.query("UPDATE users SET password = ? WHERE id = ?", [
      hashedPassword,
      id,
    ]);
  },

  getRiskType: async (userId) => {
    const [rows] = await db.execute<RowDataPacket[]>(
      "SELECT risk_type FROM users WHERE id = ?",
      [userId],
    );

    if (rows.length === 0) {
      return null;
    }

    return rows[0].risk_type as User.RiskType | null;
  },

  setRiskType: async (userId, riskType) => {
    await db.execute("UPDATE users SET risk_type = ? WHERE id = ?", [
      riskType,
      userId,
    ]);
  },
});
