export type RiskType =
  | "STABLE"
  | "STABLE_SEEK"
  | "NEUTRAL"
  | "ACTIVE"
  | "AGGRESSIVE";

export type InvestmentPlan = {
  monthlyAmount: number;
  years: number;
  returnRate: number;
  targetAmount: number;
};

export type InvestmentProfile = {
  riskType: RiskType | null;
  plan: InvestmentPlan | null;
};
