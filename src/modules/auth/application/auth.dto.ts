import { User } from "src/modules/user/domain/user.entity";

export type RegisterReqDto = {
  email: string;
  password: string;
};

export type RegisterResDto = {
  accessToken: string;
  refreshToken: string;
  user: User.Info;
};

export type LoginReqDto = {
  email: string;
  password: string;
};

export type LoginResDto = {
  accessToken: string;
  refreshToken: string;
  user: User.Info;
};

export type CheckCodeReqDto = {
  email: string;
  code: string;
};

export type ResetPasswordReqDto = {
  email: string;
  newPassword: string;
};

export type RefreshTokenResDto = {
  accessToken: string;
  refreshToken: string;
};
