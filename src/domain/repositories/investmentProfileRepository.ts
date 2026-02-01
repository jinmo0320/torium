import { UUID } from "crypto";
import {
  RiskType,
  InvestmentPlan,
  InvestmentProfile,
} from "../models/dtos/investmentProfileDto";

export type InvestmentProfileRepository = {
  upsertRiskType: (userId: UUID, riskType: RiskType | null) => Promise<void>;
  upsertPlan: (userId: UUID, plan: InvestmentPlan | null) => Promise<void>;
  getProfile: (userId: UUID) => Promise<InvestmentProfile>;
};
