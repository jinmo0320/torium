import "reflect-metadata";
import { container } from "tsyringe";
import {
  UserRepository,
  UserRepositoryImpl,
} from "../repositories/userRepository";
import {
  AuthRepository,
  AuthRepositoryImpl,
} from "../repositories/authRepository";

container.registerSingleton<UserRepository>(
  "UserRepository",
  UserRepositoryImpl
);

container.registerSingleton<AuthRepository>(
  "AuthRepository",
  AuthRepositoryImpl
);
