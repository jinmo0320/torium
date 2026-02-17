import { UUID } from "crypto";
import { InvestmentPlan } from "../domain/invProfile.entity";

export type AssessRiskTypeReqDto = {
  userId: UUID;
  score: number;
};

export type UpdatePlanReqDto = {
  userId: UUID;
  plan: InvestmentPlan;
};
