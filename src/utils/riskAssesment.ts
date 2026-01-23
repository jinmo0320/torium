import { RiskType } from "../domain/models/dtos/investmentProfileDto";

/**
 * 설문 점수로 투자 성향 결정
 *
 * @param score 총 설문 점수
 * @returns 투자 성향 타입 또는 null (유효하지 않은 점수)
 */
export const determineRiskType = (score: number): RiskType | null => {
  if (score >= 10 && score <= 15) return "STABLE";
  if (score <= 20) return "STABLE_SEEK";
  if (score <= 25) return "NEUTRAL";
  if (score <= 30) return "ACTIVE";
  if (score <= 40) return "AGGRESSIVE";

  return null;
};
