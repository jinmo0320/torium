import { Request, Response } from "express";
import { UserService } from "../application/user.service";

export const userController = (userService: UserService) => ({
  /* ================= 내 정보 조회 ================= */
  me: async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const user = await userService.me(userId);
    res
      .status(200)
      .json({ message: "User information search successful", user });
  },

  /* ================= 비밀번호 변경 (로그인 상태) ================= */
  changePassword: async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { oldPassword, newPassword } = req.body;
    await userService.changePassword(userId, oldPassword, newPassword);
    res.status(200).json({ message: "Password changed successfully" });
  },
});
