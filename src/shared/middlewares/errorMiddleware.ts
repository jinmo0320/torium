import { Request, Response, NextFunction } from "express";
import { DomainError } from "../errors/error";
import { getHttpStatus } from "../errors/errorMapper";
import { ErrorCodes } from "../errors/errorCodes";
import { Timer } from "src/shared/utils/timer";

const errorMiddleware = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const timestamp = Timer.getTimestampKST();
  // 비즈니스 에러 (DomainError) 처리
  if (error instanceof DomainError) {
    const statusCode = getHttpStatus(error.code);

    console.error("[DomainError]", error);
    res.status(statusCode).json({
      code: error.code,
      message: error.message,
      timestamp,
    });
    return;
  }

  // 그 외 예상치 못한 시스템 에러 처리 (DB 연결, 문법 오류, 외부 API 장애 등)
  // 에러 내용은 로그에만
  console.error("[SystemError]", error);
  res.status(500).json({
    code: ErrorCodes.COMMON.INTERNAL_SERVER_ERROR,
    message: "서버 내부 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
    timestamp,
  });
};

export default errorMiddleware;
