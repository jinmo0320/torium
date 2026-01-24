export type RiskType =
  | "STABLE"
  | "STABLE_SEEK"
  | "NEUTRAL"
  | "ACTIVE"
  | "AGGRESSIVE";

export type InvestmentPlan = {
  monthlyAmount: number; // 단위: 원
  investmentYears: number; // 단위: 연
  expectedReturnRate: number; // 소수 형태 (예: 0.06 === 6%)
  targetAmount: number; // 단위: 원
};

export type InvestmentProfile = {
  riskType: RiskType;
  plan: InvestmentPlan;
};
