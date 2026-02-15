import { Request, Response, NextFunction } from "express";
import { DomainError } from "src/shared/errors/error";
import { ErrorCodes } from "src/shared/errors/errorCodes";
import { createTokenProvider } from "src/shared/infrastructure/tokenProvider";

const TokenProvider = createTokenProvider();

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  /* 1. Header에서 토큰 추출 */
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new DomainError(
      ErrorCodes.AUTH.TOKEN_REQUIRED,
      "Access token is required.",
    );
  }
  const token = authHeader.split(" ")[1];
  if (!token) {
    throw new DomainError(
      ErrorCodes.AUTH.TOKEN_REQUIRED,
      "Access token is required.",
    );
  }

  /* 2. 토큰 검증 */
  const payload = TokenProvider.verifyAccessToken(token);
  if (!payload) {
    throw new DomainError(
      ErrorCodes.AUTH.TOKEN_INVALID,
      "Invalid access token.",
    );
  }

  /* 3. 토큰 속 사용자 정보 담아서 보냄 */
  req.user = { id: payload.userId };

  next();
};
