import { NextFunction, Request, Response } from "express";
import { createUserService } from "src/domain/services/userService";
import { createUserRepository } from "src/data/repositories/userRepositoryImpl";

const userService = createUserService(createUserRepository());

/* ================= 내 정보 조회 ================= */
export const me = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const user = await userService.me(userId);
    res
      .status(200)
      .json({ message: "User information search successful", user });
  } catch (error) {
    next(error);
  }
};

/* ================= 비밀번호 변경 (로그인 상태) ================= */
export const changePassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user!.id;
    const { oldPassword, newPassword } = req.body;
    await userService.changePassword(userId, oldPassword, newPassword);
    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    next(error);
  }
};
