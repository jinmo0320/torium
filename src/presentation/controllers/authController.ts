import { NextFunction, Request, Response } from "express";
import { AuthService } from "../../domain/services/authService";
import { container } from "tsyringe";

/* ================= 회원가입 ================= */
export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authService = container.resolve(AuthService);

  try {
    const { nickname, email, password } = req.body;
    await authService.register(nickname, email, password);
    res.status(201).json({ message: "User created" });
  } catch (error) {
    next(error);
  }
};

/* ================= 로그인 ================= */
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authService = container.resolve(AuthService);

  try {
    const { email, password } = req.body;
    const token = await authService.login(email, password);
    res.status(200).json({
      message: "Login successful",
      access_token: token,
    });
  } catch (error) {
    next(error);
  }
};

/* ================= 이메일 인증코드 전송 ================= */
export const sendVerificationCode = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authService = container.resolve(AuthService);

  try {
    const { email } = req.body;
    await authService.verifyEmail(email);
    res.status(200).json({ message: "Verification email sent" });
  } catch (error) {
    next(error);
  }
};

/* ================= 이메일 인증코드 검증 ================= */
export const checkVerificationCode = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authService = container.resolve(AuthService);

  try {
    const { email, code } = req.body;
    await authService.checkVerificationCode(email, code);
    res.status(200).json({ message: "Email verified" });
  } catch (error) {
    next(error);
  }
};

/* ================= 비밀번호 재설정 ================= */
export const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authService = container.resolve(AuthService);

  try {
    const { email, newPassword } = req.body;
    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    next(error);
  }
};

/* ================= 토큰 리프레쉬 ================= */
export const refreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authService = container.resolve(AuthService);

  try {
    res.status(200).json({ message: "Token refreshed" });
  } catch (error) {
    next(error);
  }
};
