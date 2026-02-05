import { ErrorCode } from "./errorCodes";

export class HttpException extends Error {
  constructor(
    public readonly status: number,
    public readonly errorCode: ErrorCode,
    message: string,
  ) {
    super(message);

    this.name = this.constructor.name;
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace?.(this, this.constructor);
  }
}
