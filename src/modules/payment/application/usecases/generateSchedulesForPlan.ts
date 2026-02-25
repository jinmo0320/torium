import { PaymentDeps } from "../payment.service";
import { generateSchedules, PlanForSchedule } from "../../domain/payment.logic";

type GenerateSchedulesForPlan = (
  planId: number,
  plan: PlanForSchedule,
) => Promise<void>;

export const generateSchedulesForPlan =
  ({ paymentRepository }: PaymentDeps): GenerateSchedulesForPlan =>
  async (planId, plan) => {
    const schedules = generateSchedules(planId, plan);
    await paymentRepository.createSchedules(schedules);
  };
