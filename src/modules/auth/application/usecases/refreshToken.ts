import { AuthDeps } from "../auth.service";

import { RefreshTokenResDto } from "../auth.dto";
import { DomainError } from "src/shared/errors/error";
import { ErrorCodes } from "src/shared/errors/errorCodes";

/**
 * 토큰 재발급
 * @param   refreshToken
 * @errors  TOKEN_INVALID
 * @returns JWT access token and refresh token
 */
type RefreshTokenUsecase = (
  refreshToken: string,
) => Promise<RefreshTokenResDto>;

export const createRefreshToken =
  ({ authRepository, TokenProvider }: AuthDeps): RefreshTokenUsecase =>
  async (refreshToken) => {
    /* [Error] Unverified tokens */
    const payload = TokenProvider.verifyRefreshToken(refreshToken);
    if (!payload) {
      throw new DomainError(
        ErrorCodes.AUTH.TOKEN_INVALID,
        "Invalid refresh token.",
      );
    }
    /* [Error] Invalid refresh token */
    const userId = payload.userId;
    const isTokenValid = await authRepository.checkRefreshToken(
      userId,
      refreshToken,
    );
    if (!isTokenValid) {
      await authRepository.deleteRefreshToken(userId);
      throw new DomainError(
        ErrorCodes.AUTH.TOKEN_INVALID,
        "Invalid refresh token.",
      );
    }
    /* 0. 토큰 생성 및 반환 */
    const newAccessToken = TokenProvider.generateAccessToken({
      userId,
    });
    const newRefreshToken = TokenProvider.generateRefreshToken({
      userId,
    });
    await authRepository.saveRefreshToken(userId, newRefreshToken);

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  };
