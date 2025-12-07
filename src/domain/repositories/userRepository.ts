import { User } from "../models/user";

export interface UserRepository {
  createUser(
    nickname: string,
    email: string,
    hashedPassword: string
  ): Promise<void>;

  findUser(email: string): Promise<User | null>;
}
