import { UUID } from "crypto";

// user.dto.ts 한 파일 안에 정의
export namespace UserDto {
  export class CreateRequest {
    constructor(
      public readonly name: string,
      public readonly tag: string,
      public readonly email: string,
      public readonly hashedPassword: string,
    ) {}
  }

  export class Response {
    constructor(
      public readonly id: UUID,
      public readonly name: string,
      public readonly tag: string,
      public readonly email: string,
    ) {}
  }

  export class PasswordResponse {
    constructor(
      public readonly id: UUID,
      public readonly email: string,
      public readonly hashedPassword: string,
    ) {}
  }
}
