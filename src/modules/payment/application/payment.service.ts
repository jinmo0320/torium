import { PaymentRepository } from "../domain/payment.repo";
import { PortfolioRepository } from "src/modules/portfolio/domain/portfolio.repo";
import { InvProfileRepository } from "src/modules/investmentProfile/domain/invProfile.repo";
import * as Usecases from "./usecases";

export type PaymentDeps = {
  paymentRepository: PaymentRepository;
  portfolioRepository: PortfolioRepository;
  invProfileRepository: InvProfileRepository;
};

export const createPaymentService = (deps: PaymentDeps) => ({
  getInvestmentProgress: Usecases.getInvestmentProgress(deps),
  getInvestmentPayments: Usecases.getInvestmentPayments(deps),
  recordPayment: Usecases.recordPayment(deps),
  generateSchedulesForPlan: Usecases.generateSchedulesForPlan(deps),
});

export type PaymentService = ReturnType<typeof createPaymentService>;
