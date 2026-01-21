export type InvestmentType =
  | "STABLE"
  | "STABLE_SEEK"
  | "NEUTRAL"
  | "ACTIVE"
  | "AGGRESSIVE";

export const determineInvestmentType = (score: number): InvestmentType | undefined=> {
  if (score >= 10 && score <= 15) return "STABLE";
  if (score <= 20) return "STABLE_SEEK";
  if (score <= 25) return "NEUTRAL";
  if (score <= 30) return "ACTIVE";
  if (score <= 40) return "AGGRESSIVE";

  return undefined;
};
