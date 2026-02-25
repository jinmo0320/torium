import { UUID } from "crypto";

export type RecordPaymentReqDto = {
  userId: UUID;
  scheduleId: number;
  amount: number;
  paidAt: string;
};
