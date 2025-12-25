import db from "../../data/config/db";
import { RowDataPacket } from "mysql2";
import { injectable } from "tsyringe";
import { UserRepository } from "../../domain/repositories/userRepository";
import { User } from "../../domain/models/entities/user";
import { UserDto } from "../../domain/models/dtos/userDto";
import { UUID } from "crypto";

@injectable()
export class UserRepositoryImpl implements UserRepository {
  async createUser(user: UserDto.CreateRequest): Promise<UserDto.Response> {
    await db.query(
      "INSERT INTO users (name, tag, email, password) VALUES (?, ?, ?, ?)",
      [user.name, user.tag, user.email, user.hashedPassword]
    );

    const [rows] = await db.query<RowDataPacket[]>(
      "SELECT * FROM users WHERE email = ?",
      [user.email]
    );

    const { id, name, tag, email } = rows[0];
    return new UserDto.Response(id, name, tag, email);
  }

  async findUserById(id: UUID): Promise<UserDto.Response | null> {
    const [rows] = await db.query<RowDataPacket[]>(
      "SELECT * FROM users WHERE id = ?",
      [id]
    );

    if (rows.length === 0) {
      return null;
    }

    const { name, tag, email } = rows[0];
    return new UserDto.Response(id, name, tag, email);
  }

  async findUserByEmail(email: string): Promise<UserDto.Response | null> {
    const [rows] = await db.query<RowDataPacket[]>(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (rows.length === 0) {
      return null;
    }

    const { id, name, tag } = rows[0];
    return new UserDto.Response(id, name, tag, email);
  }

  async findUserByName(
    name: string,
    tag: string
  ): Promise<UserDto.Response | null> {
    const [rows] = await db.query<RowDataPacket[]>(
      "SELECT * FROM users WHERE name = ? AND tag = ?",
      [name, tag]
    );

    if (rows.length === 0) {
      return null;
    }

    const { id, email } = rows[0];
    return new UserDto.Response(id, name, tag, email);
  }

  async getUserPassword(id: UUID): Promise<UserDto.PasswordResponse | null> {
    const [rows] = await db.query<RowDataPacket[]>(
      "SELECT id, email, password FROM users WHERE id = ?",
      [id]
    );

    if (rows.length === 0) {
      return null;
    }

    const { email, password } = rows[0];
    return new UserDto.PasswordResponse(id, email, password);
  }

  async updateUserPassword(id: UUID, hashedPassword: string): Promise<void> {
    await db.query("UPDATE users SET password = ? WHERE id = ?", [
      hashedPassword,
      id,
    ]);
  }
}
