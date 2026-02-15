import { NextFunction, Request, Response } from "express";
import type { AuthUsecase } from "../application/auth.usecase";

export const authContoller = (authUsecase: AuthUsecase) => ({
  /* ================= 회원가입 ================= */
  register: async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;
    const { accessToken, refreshToken, user } = await authUsecase.register(
      email,
      password,
    );
    res.status(201).json({
      message: "User created",
      accessToken,
      refreshToken,
      user,
    });
  },

  /* ================= 로그인 ================= */
  login: async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;
    const { accessToken, refreshToken, user } = await authUsecase.login(
      email,
      password,
    );
    res.status(200).json({
      message: "Login successful",
      accessToken,
      refreshToken,
      user,
    });
  },

  /* ================= 이메일 인증코드 전송 ================= */
  sendVerificationCode: async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    const { email } = req.body;
    await authUsecase.sendVerificationCode(email);
    res.status(200).json({ message: "Verification email sent" });
  },

  /* ================= 이메일 인증코드 검증 ================= */
  checkVerificationCode: async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    const { email, code } = req.body;
    await authUsecase.checkVerificationCode(email, code);
    res.status(200).json({ message: "Email verified" });
  },

  /* ================= 비밀번호 재설정 코드 전송 ================= */
  sendForgotCode: async (req: Request, res: Response, next: NextFunction) => {
    const { email } = req.body;
    await authUsecase.sendForgotCode(email);
    res.status(200).json({ message: "Verification email sent" });
  },

  /* ================= 비밀번호 재설정 코드 검증 ================= */
  checkForgotCode: async (req: Request, res: Response, next: NextFunction) => {
    const { email, code } = req.body;
    await authUsecase.checkForgotCode(email, code);
    res.status(200).json({ message: "Email verified" });
  },

  /* ================= 비밀번호 재설정 ================= */
  resetPassword: async (req: Request, res: Response, next: NextFunction) => {
    const { email, newPassword } = req.body;
    await authUsecase.resetPassword(email, newPassword);
    res.status(200).json({ message: "Password reset successfully" });
  },

  /* ================= 토큰 리프레쉬 ================= */
  refreshToken: async (req: Request, res: Response, next: NextFunction) => {
    const { refreshToken } = req.body;
    const { accessToken, refreshToken: newRefreshToken } =
      await authUsecase.refreshToken(refreshToken);
    res.status(200).json({
      message: "Token refreshed successfully",
      accessToken,
      refreshToken: newRefreshToken,
    });
  },
});
