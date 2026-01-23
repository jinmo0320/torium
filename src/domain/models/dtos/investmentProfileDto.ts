export type RiskType =
  | "STABLE"
  | "STABLE_SEEK"
  | "NEUTRAL"
  | "ACTIVE"
  | "AGGRESSIVE";

export type InvestmentPlan = {
  monthlyAmount: number; // 단위: 만 원 > 근데 그냥 원 단위로 바꾸는 게 나을 것 같아..
  years: number; // 단위: 연
  returnRate: number; // 소수 형태 (예: 0.06 === 6%)
  targetAmount: number; // 단위: 원
};

export type InvestmentProfile = {
  riskType: RiskType | null;
  plan: InvestmentPlan | null;
};
