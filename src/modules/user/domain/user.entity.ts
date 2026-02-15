import { UUID } from "crypto";

export namespace User {
  export type Entity = {
    id: UUID;
    email: string;
    name: string;
    tag: string;
    hashedPassword: string;
    createdAt: Date;
  };

  export type RegisterInput = Pick<
    Entity,
    "email" | "hashedPassword" | "name" | "tag"
  >;
  export type Info = Pick<Entity, "id" | "email" | "name" | "tag">;
  export type PasswordInfo = Pick<Entity, "id" | "email" | "hashedPassword">;
}
