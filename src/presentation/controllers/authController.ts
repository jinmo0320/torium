import { NextFunction, Request, Response } from "express";
import { AuthService } from "../../domain/services/authService";
import { container } from "tsyringe";

/* ================= 회원가입 ================= */
export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authService = container.resolve<AuthService>("AuthService");

  try {
    const { email, password } = req.body;
    const { accessToken, refreshToken, user } = await authService.register(
      email,
      password
    );

    // 1. Refresh Token을 HttpOnly 쿠키에 설정
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true, // 자바스크립트에서 접근 불가 (XSS 방지)
      secure: process.env.NODE_ENV === "production", // HTTPS에서만 전송(true)
      sameSite: "strict", // CSRF 공격 방지
      maxAge: 14 * 24 * 60 * 60 * 1000, // 쿠키 유효 기간
    });

    // 2. Access Token은 JSON Body로 응답
    res.status(201).json({
      message: "User created",
      accessToken,
      user,
    });
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
  const authService = container.resolve<AuthService>("AuthService");

  try {
    const { email, password } = req.body;
    const token = await authService.login(email, password);
    res.status(200).json({
      message: "Login successful",
      accessToken: token,
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
  const authService = container.resolve<AuthService>("AuthService");

  try {
    const { email } = req.body;
    await authService.sendVerificationCode(email);
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
  const authService = container.resolve<AuthService>("AuthService");

  try {
    const { email, code } = req.body;
    await authService.checkVerificationCode(email, code);
    res.status(200).json({ message: "Email verified" });
  } catch (error) {
    next(error);
  }
};

/* ================= 비밀번호 재설정코드 전송 ================= */
export const sendForgotCode = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authService = container.resolve<AuthService>("AuthService");

  try {
    const { email } = req.body;
    await authService.sendForgotCode(email);
    res.status(200).json({ message: "Verification email sent" });
  } catch (error) {
    next(error);
  }
};

/* ================= 비밀번호 재설정코드 검증 ================= */
export const checkForgotCode = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authService = container.resolve<AuthService>("AuthService");

  try {
    const { email, code } = req.body;
    await authService.checkForgotCode(email, code);
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
  const authService = container.resolve<AuthService>("AuthService");

  try {
    const { email, newPassword } = req.body;
    await authService.resetPassword(email, newPassword);
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
  const authService = container.resolve<AuthService>("AuthService");

  try {
    authService.refreshToken();
    res.status(200).json({ message: "Token refreshed" });
  } catch (error) {
    next(error);
  }
};
