import "reflect-metadata";
import { container } from "tsyringe";
import { UserRepository } from "../domain/repositories/userRepository";
import { UserRepositoryImpl } from "../data/repositories/userRepositoryImpl";
import { AuthRepository } from "../domain/repositories/authRepository";
import { AuthRepositoryImpl } from "../data/repositories/authRepositoryImpl";

container.registerSingleton<UserRepository>(
  "UserRepository",
  UserRepositoryImpl
);

container.registerSingleton<AuthRepository>(
  "AuthRepository",
  AuthRepositoryImpl
);
