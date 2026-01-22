import { RowDataPacket } from "mysql2";
import { UUID } from "crypto";
import db from "src/data/config/db";
import { UserRepository } from "src/domain/repositories/userRepository";
import { UserDto } from "src/domain/models/dtos/userDto";

export const createUserRepository = (): UserRepository => ({
  createUser: async (
    user: UserDto.CreateRequest,
  ): Promise<UserDto.Response> => {
    await db.execute(
      "INSERT INTO users (name, tag, email, password) VALUES (?, ?, ?, ?)",
      [user.name, user.tag, user.email, user.hashedPassword],
    );

    const [rows] = await db.execute<RowDataPacket[]>(
      "SELECT * FROM users WHERE email = ?",
      [user.email],
    );

    const { id, name, tag, email } = rows[0];
    return new UserDto.Response(id, name, tag, email);
  },

  findUserById: async (id: UUID): Promise<UserDto.Response | null> => {
    const [rows] = await db.execute<RowDataPacket[]>(
      "SELECT * FROM users WHERE id = ?",
      [id],
    );

    if (rows.length === 0) {
      return null;
    }

    const { name, tag, email } = rows[0];
    return new UserDto.Response(id, name, tag, email);
  },

  findUserByEmail: async (email: string): Promise<UserDto.Response | null> => {
    const [rows] = await db.execute<RowDataPacket[]>(
      "SELECT * FROM users WHERE email = ?",
      [email],
    );

    if (rows.length === 0) {
      return null;
    }

    const { id, name, tag } = rows[0];
    return new UserDto.Response(id, name, tag, email);
  },

  findUserByName: async (
    name: string,
    tag: string,
  ): Promise<UserDto.Response | null> => {
    const [rows] = await db.execute<RowDataPacket[]>(
      "SELECT * FROM users WHERE name = ? AND tag = ?",
      [name, tag],
    );

    if (rows.length === 0) {
      return null;
    }

    const { id, email } = rows[0];
    return new UserDto.Response(id, name, tag, email);
  },

  getUserPassword: async (
    id: UUID,
  ): Promise<UserDto.PasswordResponse | null> => {
    const [rows] = await db.execute<RowDataPacket[]>(
      "SELECT id, email, password FROM users WHERE id = ?",
      [id],
    );

    if (rows.length === 0) {
      return null;
    }

    const { email, password } = rows[0];
    return new UserDto.PasswordResponse(id, email, password);
  },

  updateUserPassword: async (
    id: UUID,
    hashedPassword: string,
  ): Promise<void> => {
    await db.query("UPDATE users SET password = ? WHERE id = ?", [
      hashedPassword,
      id,
    ]);
  },
});
