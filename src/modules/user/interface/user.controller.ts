import { NextFunction, Request, Response } from "express";
import { UserUsecase } from "../application/user.usecase";

export const userController = (userUsecase: UserUsecase) => ({
  /* ================= 내 정보 조회 ================= */
  me: async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user!.id;
    const user = await userUsecase.me(userId);
    res
      .status(200)
      .json({ message: "User information search successful", user });
  },

  /* ================= 비밀번호 변경 (로그인 상태) ================= */
  changePassword: async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user!.id;
    const { oldPassword, newPassword } = req.body;
    await userUsecase.changePassword(userId, oldPassword, newPassword);
    res.status(200).json({ message: "Password changed successfully" });
  },
});
