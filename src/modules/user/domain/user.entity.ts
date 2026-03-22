import { UUID } from "crypto";

export namespace User {
  export type RiskType =
    | "STABLE"
    | "STABLE_SEEK"
    | "NEUTRAL"
    | "ACTIVE"
    | "AGGRESSIVE";

  export type Entity = {
    id: UUID;
    email: string;
    name: string;
    tag: string;
    hashedPassword: string;
    riskType: RiskType | null;
    createdAt: Date;
  };

  export type RegisterInput = Pick<
    Entity,
    "email" | "hashedPassword" | "name" | "tag"
  >;

  export type Info = Pick<Entity, "id" | "email" | "name" | "tag" | "riskType">;
  export type PasswordInfo = Pick<Entity, "id" | "email" | "hashedPassword">;
}
