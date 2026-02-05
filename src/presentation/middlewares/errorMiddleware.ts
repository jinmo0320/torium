import { Request, Response, NextFunction } from "express";
import { HttpException } from "src/domain/errors/error";
import { Timer } from "src/utils/timer";

export default function errorMiddleware(
  error: Error, // 모든 종류의 Error를 받음
  req: Request,
  res: Response,
  next: NextFunction,
) {
  console.error(error);

  const timestamp = Timer.getTimestampKST();

  if (error instanceof HttpException) {
    res.status(error.status).json({
      message: error.message,
      code: error.errorCode,
      timestamp,
    });
    return;
  }

  res.status(500).json({
    message: "Internal Server Error",
    code: "INTERNAL_SERVER_ERROR",
    timestamp,
  });
}
