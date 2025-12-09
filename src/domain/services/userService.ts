import { inject, injectable } from "tsyringe";
import { User } from "../models/user";
import { HttpException } from "../../utils/errors";

export interface UserService {
  me(): Promise<User>;
  changePassword(oldPassword: string, newPassword: string): Promise<void>;
}

@injectable()
export class UserServiceImpl implements UserService {
  async me(): Promise<User> {
    throw new HttpException(404, "User not found");
  }

  async changePassword(
    oldPassword: string,
    newPassword: string
  ): Promise<void> {}
}
