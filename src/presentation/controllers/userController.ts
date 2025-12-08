import { NextFunction, Request, Response } from "express";
import { container } from "tsyringe";

/* ================= 내 정보 조회 ================= */
export const me = async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.status(201).json({ message: "User information search successful" });
  } catch (error) {
    next(error);
  }
};

/* ================= 비밀번호 변경 (로그인 상태) ================= */
export const changePassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { oldPassword, newPassword } = req.body;
    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    next(error);
  }
};
