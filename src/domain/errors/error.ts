import { Timer } from "../../utils/timer";
import { ErrorCode } from "./errorCodes";

export class HttpException extends Error {
  readonly status: number;
  readonly errorCode: ErrorCode;
  readonly timestamp: string;

  constructor(status: number, errorCode: ErrorCode, message: string) {
    super(message);
    this.status = status;
    this.errorCode = errorCode;
    this.timestamp = Timer.getTimestampKST();
  }
}
