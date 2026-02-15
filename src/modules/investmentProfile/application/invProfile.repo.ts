import { UUID } from "crypto";
import {
  RiskType,
  InvestmentPlan,
  InvestmentProfile,
} from "../domain/invProfile.entity";

export type InvProfileRepository = {
  upsertRiskType: (userId: UUID, riskType: RiskType | null) => Promise<void>;
  upsertPlan: (userId: UUID, plan: InvestmentPlan | null) => Promise<void>;
  getProfile: (userId: UUID) => Promise<InvestmentProfile>;
};
