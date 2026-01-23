import { InvestmentPlan } from "../domain/models/dtos/investmentProfileDto";

/**
 * 적립식 투자 최종 금액 계산
 * F = M * ((1+R)^t - 1) / R
 *
 * @param monthlyAmount 월 투자금 (만원)
 * @param years 투자 기간 (년)
 * @param returnRate 연 수익률 (소수)
 * @returns 최종 투자금 (원)
 */
export const calculateFutureValue = (
  monthlyAmount: number,
  years: number,
  returnRate: number,
): number => {
  const M = monthlyAmount * 10000; // 만원 -> 원 변환
  const t = 12 * years; // 총 납입 횟수
  const R = returnRate / 12; // 월간 수익률

  const futureValue = M * ((Math.pow(1 + R, t) - 1) / R);
  return Math.round(futureValue);
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
  const { monthlyAmount, years, returnRate, targetAmount } = plan;

  if (monthlyAmount <= 0 || years <= 0 || returnRate < 0 || targetAmount <= 0) {
    return false;
  }

  const calculatedAmount = calculateFutureValue(
    monthlyAmount,
    years,
    returnRate,
  );

  const lowerBound = targetAmount * (1 - tolerance);
  const upperBound = targetAmount * (1 + tolerance);

  return calculatedAmount >= lowerBound && calculatedAmount <= upperBound;
};
