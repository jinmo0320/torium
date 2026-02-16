import { UUID } from "crypto";

export type JwtPayload = {
  userId: UUID;
};

export type TokenProvider = {
  generateAccessToken: (payload: JwtPayload) => string;
  generateRefreshToken: (payload: JwtPayload) => string;
  verifyAccessToken: (token: string) => JwtPayload | null;
  verifyRefreshToken: (token: string) => JwtPayload | null;
};

export type EmailSender = {
  sendMail: (email: string, code: string) => Promise<void>;
};

export type BcryptHelper = {
  hashPassword: (password: string) => Promise<string>;
  comparePassword: (
    password: string,
    hashedPassword: string,
  ) => Promise<boolean>;
};
