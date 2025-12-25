import { Request, Response, NextFunction } from "express";
import { HttpException } from "../../domain/errors/error";
import { Timer } from "../../utils/timer";

export default function errorMiddleware(
  error: HttpException,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error(error);
  const status = error.status || 500;
  const message = error.message || "internal server error";
  const code = error.errorCode || "INTERNAL_SERVER_ERROR";
  const timestamp = error.timestamp || Timer.getTimestampKST();
  res
    .status(status)
    .json({ message: message, code: code, timestamp: timestamp });
}
