import { UUID } from "crypto";
import { PaymentSchedule } from "./payment.entity";

export type PaymentRepository = {
  // Schedule 관련
  getSchedules: (planId: number) => Promise<PaymentSchedule[]>;
  createSchedules: (schedules: Partial<PaymentSchedule>[]) => Promise<void>;
  updateSchedulePaid: (
    scheduleId: number,
    amount: number,
    paidAt: Date,
  ) => Promise<void>;

  getAllPaidSchedules: (userId: UUID) => Promise<PaymentSchedule[]>;
};
