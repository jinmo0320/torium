import { UUID } from "crypto";
import jwt from "jsonwebtoken";

export interface JwtPayload {
  userId: UUID;
}

export class TokenProvider {
  private static accessSecret = `${process.env.JWT_ACCESS_SECRET}`;
  private static refreshSecret = `${process.env.JWT_REFRESH_SECRET}`;

  static generateAccessToken(payload: JwtPayload): string {
    return jwt.sign(payload, this.accessSecret, {
      expiresIn: "1h",
    });
  }

  static generateRefreshToken(payload: JwtPayload): string {
    return jwt.sign(payload, this.refreshSecret, {
      expiresIn: "14d",
    });
  }

  static verifyAccessToken(token: string): JwtPayload | null {
    try {
      return jwt.verify(token, this.accessSecret) as JwtPayload;
    } catch (error) {
      return null;
    }
  }

  static verifyRefreshToken(token: string): JwtPayload | null {
    try {
      return jwt.verify(token, this.refreshSecret) as JwtPayload;
    } catch (error) {
      return null;
    }
  }
}
