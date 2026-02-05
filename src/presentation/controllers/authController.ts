import { NextFunction, Request, Response } from "express";
import { createAuthService } from "src/domain/services/authService";
import { createUserRepository } from "src/data/repositories/userRepositoryImpl";
import { createAuthRepository } from "src/data/repositories/authRepositoryImpl";

const authService = createAuthService(
  createUserRepository(),
  createAuthRepository(),
);

/* ================= 회원가입 ================= */
export const register = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
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
};

/* ================= 로그인 ================= */
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
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
};

/* ================= 이메일 인증코드 전송 ================= */
export const sendVerificationCode = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { email } = req.body;
  await authService.sendVerificationCode(email);
  res.status(200).json({ message: "Verification email sent" });
};

/* ================= 이메일 인증코드 검증 ================= */
export const checkVerificationCode = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { email, code } = req.body;
  await authService.checkVerificationCode(email, code);
  res.status(200).json({ message: "Email verified" });
};

/* ================= 비밀번호 재설정 코드 전송 ================= */
export const sendForgotCode = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { email } = req.body;
  await authService.sendForgotCode(email);
  res.status(200).json({ message: "Verification email sent" });
};

/* ================= 비밀번호 재설정 코드 검증 ================= */
export const checkForgotCode = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { email, code } = req.body;
  await authService.checkForgotCode(email, code);
  res.status(200).json({ message: "Email verified" });
};

/* ================= 비밀번호 재설정 ================= */
export const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { email, newPassword } = req.body;
  await authService.resetPassword(email, newPassword);
  res.status(200).json({ message: "Password reset successfully" });
};

/* ================= 토큰 리프레쉬 ================= */
export const refreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { refreshToken } = req.body;
  const { accessToken, refreshToken: newRefreshToken } =
    await authService.refreshToken(refreshToken);
  res.status(200).json({
    message: "Token refreshed successfully",
    accessToken,
    refreshToken: newRefreshToken,
  });
};
