import { ErrorCode } from "./errorCodes";

export class DomainError extends Error {
  constructor(
    public readonly code: ErrorCode,
    public readonly message: string,
  ) {
    super(message);
    this.name = this.constructor.name;
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace?.(this, this.constructor);
  }
}
