import { NextFunction, Request, Response } from "express";
import { AuthService } from "../../domain/services/authService";
import { container } from "tsyringe";

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

export const verifyEmail = async (
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
