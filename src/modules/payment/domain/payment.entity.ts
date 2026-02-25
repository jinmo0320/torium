/**
 * PaymentSchedule: Represents a planned or completed payment.
 */
export type PaymentSchedule = {
  id: number;
  planId: number; // 납입 당시 적용 중이던 플랜 ID
  sequence: number; // 전체 기간 중 몇 회차인가
  expectedDate: string; // 납입 예정일
  amount: number; // 예정 금액

  // 상태 및 실적
  status: "PENDING" | "PAID" | "MISSED" | "SKIPPED";
  actualPaidAmount?: number; // 실제로 넣은 금액 (부분납 대응)
  actualPaidDate?: string; // 실제 납입 날짜
};

/**
 * InvestmentProgress: Dashboard summary data.
 */
export type InvestmentProgress = {
  totalPrincipal: number; // 현재까지 납입한 원금 총합
  currentAssetValue: number; // 원금 + 투자 수익 (포트폴리오 수익률 반영)

  totalReturnAmount: number; // 순수익 (평가금액 - 원금)
  totalReturnRate: number; // 전체 수익률 (%)

  totalProgressRate: number; // (currentAssetValue / targetAmount) * 100
  paidCount: number; // 납입 횟수 (예: 12회차 / 120개월)
  remainingPeriod: number; // 남은 기간 (개월)
};
