import { UUID } from "crypto";
import { InvestmentPlan } from "../domain/invProfile.entity";

export type AssessRiskTypeReqDto = {
  userId: UUID;
  score: number;
};

export type InvestmentPlanReqDto = Pick<
  InvestmentPlan,
  | "profileId"
  | "initialAmount"
  | "monthlyAmount"
  | "startDate"
  | "paymentDay"
  | "period"
  | "expectedReturn"
  | "targetAmount"
>;

export type CreatePlanReqDto = {
  userId: UUID;
  plan: InvestmentPlanReqDto;
};

export type UpdatePlanReqDto = {
  userId: UUID;
  plan: InvestmentPlanReqDto;
};

export const isValidInvestmentPlanReqDto = (req: any): boolean => {
  const required = [
    "profileId",
    "initialAmount",
    "monthlyAmount",
    "startDate",
    "paymentDay",
    "period",
    "expectedReturn",
    "targetAmount",
  ];
  return required.every((field) => req[field] !== undefined);
};
