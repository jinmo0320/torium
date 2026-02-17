import jwt from "jsonwebtoken";
import {
  TokenProvider,
  JwtPayload,
} from "src/modules/auth/domain/auth.external";

export const createTokenProvider = (): TokenProvider => {
  const accessSecret = `${process.env.JWT_ACCESS_SECRET}`;
  const refreshSecret = `${process.env.JWT_REFRESH_SECRET}`;

  return {
    generateAccessToken: (payload: JwtPayload): string =>
      jwt.sign(payload, accessSecret, { expiresIn: "1h" }),

    generateRefreshToken: (payload: JwtPayload): string =>
      jwt.sign(payload, refreshSecret, { expiresIn: "14d" }),

    verifyAccessToken: (token: string): JwtPayload | null => {
      try {
        return jwt.verify(token, accessSecret) as JwtPayload;
      } catch (error) {
        return null;
      }
    },

    verifyRefreshToken: (token: string): JwtPayload | null => {
      try {
        return jwt.verify(token, refreshSecret) as JwtPayload;
      } catch (error) {
        return null;
      }
    },
  };
};
