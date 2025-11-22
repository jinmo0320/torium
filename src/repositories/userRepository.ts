import { User } from "../models/user";
import db from "../config/db";
import { RowDataPacket } from "mysql2";
import { injectable } from "tsyringe";

export interface UserRepository {
  createUser(
    nickname: string,
    email: string,
    hashedPassword: string
  ): Promise<void>;

  findUser(email: string): Promise<User | null>;
}

@injectable()
export class UserRepositoryImpl implements UserRepository {
  async createUser(
    nickname: string,
    email: string,
    hashedPassword: string
  ): Promise<void> {
    await db.query(
      "INSERT INTO users (nickname, email, password) VALUES (?, ?, ?)",
      [nickname, email, hashedPassword]
    );
  }

  async findUser(email: string): Promise<User | null> {
    const [rows] = await db.query<RowDataPacket[]>(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (rows.length === 0) {
      return null;
    }

    const { id, nickname, password, created_at } = rows[0];
    return new User(id, nickname, email, password, created_at);
  }
}
