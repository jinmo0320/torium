import { UUID } from "crypto";
import { User } from "../domain/user.entity";

export type UserRepository = {
  createUser: (user: User.RegisterInput) => Promise<User.Info>;

  findUserById: (id: UUID) => Promise<User.Info | null>;
  findUserByEmail: (email: string) => Promise<User.Info | null>;
  findUserByName: (name: string, tag: string) => Promise<User.Info | null>;

  getUserPassword: (id: UUID) => Promise<User.PasswordInfo | null>;
  updateUserPassword: (id: UUID, hashedPassword: string) => Promise<void>;
};
