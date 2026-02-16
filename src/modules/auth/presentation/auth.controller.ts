import { Request, Response } from "express";
import { AuthService } from "../application/auth.service";

export const authContoller = (authService: AuthService) => ({
  /* ================= 회원가입 ================= */
  register: async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const { accessToken, refreshToken, user } = await authService.register(
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
  login: async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const { accessToken, refreshToken, user } = await authService.login(
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
  sendVerificationCode: async (req: Request, res: Response) => {
    const { email } = req.body;
    await authService.sendVerificationCode(email);
    res.status(200).json({ message: "Verification email sent" });
  },

  /* ================= 이메일 인증코드 검증 ================= */
  checkVerificationCode: async (req: Request, res: Response) => {
    const { email, code } = req.body;
    await authService.checkVerificationCode(email, code);
    res.status(200).json({ message: "Email verified" });
  },

  /* ================= 비밀번호 재설정 코드 전송 ================= */
  sendForgotCode: async (req: Request, res: Response) => {
    const { email } = req.body;
    await authService.sendForgotCode(email);
    res.status(200).json({ message: "Verification email sent" });
  },

  /* ================= 비밀번호 재설정 코드 검증 ================= */
  checkForgotCode: async (req: Request, res: Response) => {
    const { email, code } = req.body;
    await authService.checkForgotCode(email, code);
    res.status(200).json({ message: "Email verified" });
  },

  /* ================= 비밀번호 재설정 ================= */
  resetPassword: async (req: Request, res: Response) => {
    const { email, newPassword } = req.body;
    await authService.resetPassword(email, newPassword);
    res.status(200).json({ message: "Password reset successfully" });
  },

  /* ================= 토큰 리프레쉬 ================= */
  refreshToken: async (req: Request, res: Response) => {
    const { refreshToken } = req.body;
    const { accessToken, refreshToken: newRefreshToken } =
      await authService.refreshToken(refreshToken);
    res.status(200).json({
      message: "Token refreshed successfully",
      accessToken,
      refreshToken: newRefreshToken,
    });
  },
});
