import { UUID } from "crypto";
import { PaymentRepository } from "../../domain/payment.repo";

type GetInvestmentPaymentsDeps = {
  paymentRepository: PaymentRepository;
};

export const getInvestmentPayments =
  ({ paymentRepository }: GetInvestmentPaymentsDeps) =>
  async (userId: UUID) => {
    return await paymentRepository.getAllPaidSchedules(userId);
  };
