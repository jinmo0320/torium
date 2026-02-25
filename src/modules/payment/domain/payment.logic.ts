import { PaymentSchedule } from "./payment.entity";

export type PlanForSchedule = {
  startDate: string;
  paymentDay: number;
  period: number;
  monthlyAmount: number;
};

/**
 * 투자 계획을 바탕으로 미래의 납입 스케줄을 계산
 * @param planId 투자 계획 ID
 * @param plan 투자 계획 정보
 * @returns 납입 스케줄의 시리즈
 */
export const generateSchedules = (
  planId: number,
  plan: PlanForSchedule,
): Partial<PaymentSchedule>[] => {
  const start = new Date(plan.startDate);

  return Array.from({ length: plan.period }, (_, i) => i + 1).map((i) => {
    const expectedDate = new Date(start); // 참조 복사 방지
    expectedDate.setMonth(start.getMonth() + (i - 1)); // 매달 차례대로
    expectedDate.setDate(plan.paymentDay);

    return {
      planId,
      sequence: i,
      expectedDate: expectedDate.toISOString().split("T")[0],
      amount: plan.monthlyAmount,
      status: "PENDING" as const,
    };
  });
};
