import { UUID } from "crypto";
import { RiskType, InvestmentPlan } from "./invProfile.entity";

export type InvProfileRepository = {
  getRiskType: (userId: UUID) => Promise<RiskType | null>;
  upsertRiskType: (userId: UUID, riskType: RiskType | null) => Promise<void>;

  // Plan 관련
  getActivePlan: (userId: UUID) => Promise<InvestmentPlan | null>;
  createPlan: (userId: UUID, plan: Partial<InvestmentPlan>) => Promise<number>;
  deactivatePlans: (userId: UUID) => Promise<void>;
};
