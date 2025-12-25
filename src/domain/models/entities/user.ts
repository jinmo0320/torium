import { UUID } from "crypto";

export class User {
  constructor(
    public id: UUID,
    public name: string,
    public tag: string,
    public email: string,
    public password: string,
    public createdAt: Date
  ) {}
}
