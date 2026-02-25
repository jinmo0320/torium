import { PaymentDeps } from "../payment.service";
import { RecordPaymentReqDto } from "../payment.dto";

type RecordPayment = (req: RecordPaymentReqDto) => Promise<void>;

export const recordPayment =
  ({ paymentRepository }: PaymentDeps): RecordPayment =>
  async ({ scheduleId, amount, paidAt }) => {
    await paymentRepository.updateSchedulePaid(
      scheduleId,
      amount,
      new Date(paidAt),
    );
  };
