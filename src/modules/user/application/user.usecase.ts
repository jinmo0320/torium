import { UUID } from "crypto";
import { UserRepository } from "../application/user.repo";
import { validatePassword } from "src/modules/auth/domain/auth.logic";
import { User } from "../domain/user.entity";
import { DomainError } from "src/shared/errors/error";
import { ErrorCodes } from "src/shared/errors/errorCodes";
import { BcryptHelper } from "./user.external";

export type UserUsecase = {
  /**
   * 내 정보 조회
   * @param userId  유저 id
   * @errors        USER_NOT_FOUND
   * @returns       user data
   */
  me: (userId: UUID) => Promise<User.Info>;
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

export const userUsecase = (
  userRepository: UserRepository,
  BcryptHelper: BcryptHelper,
): UserUsecase => ({
  me: async (userId: UUID): Promise<User.Info> => {
    /* 0. User 조회 */
    const user = await userRepository.findUserById(userId);
    if (!user) {
      throw new DomainError(ErrorCodes.USER.NOT_FOUND, "User not found");
    }

    return user;
  },

  changePassword: async (
    userId: UUID,
    oldPassword: string,
    newPassword: string,
  ): Promise<void> => {
    /* [Error] input validation */
    if (validatePassword(oldPassword) || validatePassword(newPassword))
      throw new DomainError(
        ErrorCodes.AUTH.WRONG_PASSWORD_FORMAT,
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
      throw new DomainError(
        ErrorCodes.USER.CURRENT_PASSWORD_NOT_MATCHED,
        "Your current password is incorrect.",
      );

    /* 0. 새 비밀번호 해싱 */
    const hashedNewPassword = await BcryptHelper.hashPassword(newPassword);
    /* 1. 비밀번호 업데이트 */
    await userRepository.updateUserPassword(userId, hashedNewPassword);
  },
});
