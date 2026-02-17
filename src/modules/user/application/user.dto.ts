import { UUID } from "crypto";

export type ChangePasswordReqDto = {
  userId: UUID;
  oldPassword: string;
  newPassword: string;
};
