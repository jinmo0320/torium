export type RiskType =
  | "STABLE"
  | "STABLE_SEEK"
  | "NEUTRAL"
  | "ACTIVE"
  | "AGGRESSIVE";

export type InvestmentPlan = {
  monthlyAmount: number; // 월 투자금 (단위: 원)
  period: number; // 투자 기간 (단위: 개월)
  expectedReturn: number; // 연간 기대 수익률 (소수 형태: 6% -> 0.06)
  targetAmount: number; // 목표 금액 (단위: 원)
};

export type InvestmentProfile = {
  riskType: RiskType;
  plan: InvestmentPlan;
};
