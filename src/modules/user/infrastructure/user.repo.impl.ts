import { RowDataPacket } from "mysql2";
import db from "src/shared/infrastructure/db";
import { UserRepository } from "../application/user.repo";

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

    const { id, name, tag, email } = rows[0];
    return { id, name, tag, email };
  },

  findUserById: async (id) => {
    const [rows] = await db.execute<RowDataPacket[]>(
      "SELECT * FROM users WHERE id = ?",
      [id],
    );

    if (rows.length === 0) {
      return null;
    }

    const { name, tag, email } = rows[0];
    return { id, name, tag, email };
  },

  findUserByEmail: async (email) => {
    const [rows] = await db.execute<RowDataPacket[]>(
      "SELECT * FROM users WHERE email = ?",
      [email],
    );

    if (rows.length === 0) {
      return null;
    }

    const { id, name, tag } = rows[0];
    return { id, name, tag, email };
  },

  findUserByName: async (name, tag) => {
    const [rows] = await db.execute<RowDataPacket[]>(
      "SELECT * FROM users WHERE name = ? AND tag = ?",
      [name, tag],
    );

    if (rows.length === 0) {
      return null;
    }

    const { id, email } = rows[0];
    return { id, name, tag, email };
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
});
