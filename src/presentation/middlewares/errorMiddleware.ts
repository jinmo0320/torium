import { Request, Response, NextFunction } from "express";
import { HttpException } from "../../utils/errors";

export default function errorMiddleware(
  error: HttpException,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error(error);
  const status = error.statusCode || 500;
  const message = error.message || "internal server error";
  res.status(status).json({ message: message });
}
