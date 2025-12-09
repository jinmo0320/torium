import "reflect-metadata";
import { container } from "tsyringe";
import { UserRepository } from "../domain/repositories/userRepository";
import { UserRepositoryImpl } from "../data/repositories/userRepositoryImpl";
import { AuthRepository } from "../domain/repositories/authRepository";
import { AuthRepositoryImpl } from "../data/repositories/authRepositoryImpl";
import { AuthService, AuthServiceImpl } from "../domain/services/authService";
import { UserService, UserServiceImpl } from "../domain/services/userService";

container.registerSingleton<UserRepository>(
  "UserRepository",
  UserRepositoryImpl
);

container.registerSingleton<AuthRepository>(
  "AuthRepository",
  AuthRepositoryImpl
);

container.register<AuthService>("AuthService", { useClass: AuthServiceImpl });
container.register<UserService>("UserService", { useClass: UserServiceImpl });
