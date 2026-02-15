import { ErrorCodes } from "./errorCodes";

/**
 * 에러 코드와 HTTP 상태 코드를 매핑하는 객체
 * - COMMON: 시스템 전역 규칙
 */
const ErrorStatusMap: Record<string, number> = {
  /* ================= COMMON ================= */
  [ErrorCodes.COMMON.INTERNAL_SERVER_ERROR]: 500,
  [ErrorCodes.COMMON.UNAUTHORIZED]: 401,

  /* ================= AUTH ================= */
  [ErrorCodes.AUTH.LOGIN_FAILED]: 401,
  [ErrorCodes.AUTH.EMAIL_NOT_VERIFIED]: 401,
  [ErrorCodes.AUTH.EMAIL_VERIFICATION_FAILED]: 401,
  [ErrorCodes.AUTH.EMAIL_ALREADY_REGISTERED]: 409, // 리소스 충돌
  [ErrorCodes.AUTH.EMAIL_NOT_REGISTERED]: 404,
  [ErrorCodes.AUTH.TOKEN_REQUIRED]: 401,
  [ErrorCodes.AUTH.TOKEN_INVALID]: 401,
  [ErrorCodes.AUTH.WRONG_EMAIL_FORMAT]: 400,
  [ErrorCodes.AUTH.WRONG_PASSWORD_FORMAT]: 400,

  /* ================= USER ================= */
  [ErrorCodes.USER.NOT_FOUND]: 404,
  [ErrorCodes.USER.CURRENT_PASSWORD_NOT_MATCHED]: 400,

  /* ================= SURVEY ================= */
  [ErrorCodes.SURVEY.QUESTIONS_NOT_FOUND]: 404,

  /* ================= INV_PROFILE ================= */
  [ErrorCodes.INV_PROFILE.INVALID_RISK_SCORE]: 400,
  [ErrorCodes.INV_PROFILE.INVALID_INVESTMENT_PLAN]: 400,
  [ErrorCodes.INV_PROFILE.INVESTMENT_PROFILE_NOT_FOUND]: 404,

  /* ================= PORTFOLIO ================= */
  [ErrorCodes.PORTFOLIO.NOT_FOUND]: 404,
  [ErrorCodes.PORTFOLIO.INVALID_PORTIONS]: 400,
  [ErrorCodes.PORTFOLIO.INVALID_DATA_FOR_ADDING_CATEGORY]: 400,
  [ErrorCodes.PORTFOLIO.INVALID_DATA_FOR_ADDING_ITEM]: 400,
};

/**
 * 에러 코드를 인자로 받아 해당하는 HTTP 상태 코드를 반환
 * 매핑되지 않은 에러 코드의 경우 기본값으로 400 반환
 */
export const getHttpStatus = (code: string): number => {
  return ErrorStatusMap[code] ?? 400;
};
