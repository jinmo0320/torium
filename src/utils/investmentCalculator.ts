import { InvestmentPlan } from "../domain/models/dtos/investmentProfileDto";

/**
 * 적립식 투자 최종 금액 계산
 * F = M * ((1+R)^t - 1) / R
 *
 * @param monthlyAmount 월 투자금 (원)
 * @param period 투자 기간 (개월)
 * @param expectedReturn 연 수익률 (소수)
 * @returns 최종 투자금 (원)
 */
export const calculateFutureValue = (
  monthlyAmount: number,
  period: number,
  expectedReturn: number,
): number => {
  const M = monthlyAmount;
  const t = period; // 총 납입 횟수
  const R = expectedReturn / 12; // 월 수익률

  const F = M * (((1 + R) ** t - 1) / R);
  return Math.round(F);
};

/**
 * 투자 계획 유효성 검증
 *
 * @param plan 투자 계획
 * @param tolerance 허용 오차 비율 (default 1%)
 * @returns 유효 여부
 */
export const isValidInvestmentPlan = (
  plan: InvestmentPlan,
  tolerance: number = 0.01,
): boolean => {
  const { monthlyAmount, period, expectedReturn, targetAmount } = plan;

  if (
    monthlyAmount <= 0 ||
    period <= 0 ||
    expectedReturn <= 0 ||
    targetAmount <= 0
  ) {
    return false;
  }

  const calculatedAmount = calculateFutureValue(
    monthlyAmount,
    period,
    expectedReturn,
  );

  const lowerBound = targetAmount * (1 - tolerance);
  const upperBound = targetAmount * (1 + tolerance);

  return calculatedAmount >= lowerBound && calculatedAmount <= upperBound;
};
