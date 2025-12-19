export class HttpException extends Error {
  status: number;
  errorCode: ErrorCode;
  timestamp: string;

  constructor(status: number, code: ErrorCode, message: string) {
    super(message);
  }
}
