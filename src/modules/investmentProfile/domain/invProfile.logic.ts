import { InvestmentPlanReqDto } from "../application/invProfile.dto";
import { RiskType, InvestmentPlan } from "./invProfile.entity";

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

/**
 * 혼합식 투자 최종 금액 계산
 * - 적립식: F_1 = M * ((1+R)^t - 1) / R
 * - 거치식: F_2 = P * (1+R)^t
 *
 * @param initialAmount 초기 거치금 (원)
 * @param monthlyAmount 월 투자금 (원)
 * @param period 투자 기간 (개월)
 * @param expectedReturn 연 수익률 (소수: 0.06)
 * @returns 최종 투자금 (원)
 */
export const calculateFutureValue = (
  initialAmount: number,
  monthlyAmount: number,
  period: number,
  expectedReturn: number,
): number => {
  const P = initialAmount;
  const M = monthlyAmount;
  const t = period; // 총 납입 횟수
  const R = expectedReturn / 12; // 월 수익률

  const lumpSumFV = P * (1 + R) ** t;
  const dcaFV = M * (((1 + R) ** t - 1) / R);
  return Math.round(lumpSumFV + dcaFV);
};

/**
 * 투자 계획 유효성 검증
 *
 * @param plan 투자 계획
 * @param tolerance 허용 오차 비율 (default 1%)
 * @returns 유효 여부
 */
export const isValidInvestmentPlan = (
  plan: Partial<InvestmentPlan>,
  tolerance: number = 0.01,
): boolean => {
  const {
    initialAmount = 0,
    monthlyAmount,
    period,
    expectedReturn,
    targetAmount,
  } = plan;

  if (
    monthlyAmount === undefined ||
    period === undefined ||
    expectedReturn === undefined ||
    targetAmount === undefined
  ) {
    return false;
  }

  // initialAmount이 0이면 적립식 투자
  // monthlyAmount도 옵션으로 만들기 가능
  if (
    initialAmount < 0 ||
    monthlyAmount <= 0 ||
    period <= 0 ||
    expectedReturn <= 0 ||
    targetAmount <= 0
  ) {
    return false;
  }

  const calculatedAmount = calculateFutureValue(
    initialAmount,
    monthlyAmount,
    period,
    expectedReturn,
  );

  const lowerBound = targetAmount * (1 - tolerance);
  const upperBound = targetAmount * (1 + tolerance);

  return calculatedAmount >= lowerBound && calculatedAmount <= upperBound;
};
