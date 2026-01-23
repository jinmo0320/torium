import { UUID } from "crypto";
import { UserRepository } from "../repositories/userRepository";
import { UserDto } from "../models/dtos/userDto";
import { HttpException } from "../errors/error";
import { ErrorCode } from "../errors/errorCodes";
import { Validator } from "src/utils/validator";
import { BcryptHelper } from "src/utils/bcryptHelper";

export type UserService = {
  /**
   * 내 정보 조회
   * @param userId  유저 id
   * @errors        USER_NOT_FOUND
   * @returns       user data
   */
  me: (userId: UUID) => Promise<UserDto.Response>;
  /**
   * 비밀번호 바꾸기
   * @param userId      유저 id
   * @param oldPassword 기존 비밀번호
   * @param newPassword 새 비밀번호
   * @errors            WRONG_PASSWORD_FORMAT, CURRENT_PASSWORD_NOT_MATCHED
   */
  changePassword: (
    userId: UUID,
    oldPassword: string,
    newPassword: string,
  ) => Promise<void>;
};

export const createUserService = (
  userRepository: UserRepository,
): UserService => ({
  me: async (userId: UUID): Promise<UserDto.Response> => {
    /* 0. User 조회 */
    const user = await userRepository.findUserById(userId);
    if (!user) {
      throw new HttpException(404, ErrorCode.USER_NOT_FOUND, "User not found");
    }

    return user;
  },

  changePassword: async (
    userId: UUID,
    oldPassword: string,
    newPassword: string,
  ): Promise<void> => {
    /* [Error] input validation */
    if (
      Validator.validatePassword(oldPassword) ||
      Validator.validatePassword(newPassword)
    )
      throw new HttpException(
        400,
        ErrorCode.WRONG_PASSWORD_FORMAT,
        "The password format is incorrect.",
      );

    /* [Error] Password mismatch */
    const userPassword = await userRepository.getUserPassword(userId);
    if (
      !userPassword ||
      !(await BcryptHelper.comparePassword(
        oldPassword,
        userPassword.hashedPassword,
      ))
    )
      throw new HttpException(
        401,
        ErrorCode.CURRENT_PASSWORD_NOT_MATCHED,
        "Your current password is incorrect.",
      );

    /* 0. 새 비밀번호 해싱 */
    const hashedNewPassword = await BcryptHelper.hashPassword(newPassword);
    /* 1. 비밀번호 업데이트 */
    await userRepository.updateUserPassword(userId, hashedNewPassword);
  },
});
