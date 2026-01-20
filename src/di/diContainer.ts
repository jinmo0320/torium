import "reflect-metadata";
import { container } from "tsyringe";

import { UserRepository } from "../domain/repositories/userRepository";
import { UserRepositoryImpl } from "../data/repositories/userRepositoryImpl";
import { AuthRepository } from "../domain/repositories/authRepository";
import { AuthRepositoryImpl } from "../data/repositories/authRepositoryImpl";
import { SurveyRepository } from "../domain/repositories/surveyRepository";
import { SurveyRepositoryImpl } from "../data/repositories/surveyRepositoryImpl";

import { AuthService, AuthServiceImpl } from "../domain/services/authService";
import { UserService, UserServiceImpl } from "../domain/services/userService";
import {
  SurveyService,
  SurveyServiceImpl,
} from "../domain/services/surveyService";

container.registerSingleton<UserRepository>(
  "UserRepository",
  UserRepositoryImpl,
);

container.registerSingleton<AuthRepository>(
  "AuthRepository",
  AuthRepositoryImpl,
);

container.registerSingleton<SurveyRepository>(
  "SurveyRepository",
  SurveyRepositoryImpl,
);

container.register<AuthService>("AuthService", { useClass: AuthServiceImpl });
container.register<UserService>("UserService", { useClass: UserServiceImpl });
container.register<SurveyService>("SurveyService", {
  useClass: SurveyServiceImpl,
});
