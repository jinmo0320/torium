import { Router } from "express";
import { authenticate } from "src/shared/middlewares/authMiddleware";
import { paymentController } from "./presentation/payment.controller";
import { createPaymentService } from "./application/payment.service";
import { createPaymentRepository } from "./infrastructure/payment.repo.impl";
import { createPortfolioRepository } from "../portfolio/infrastructure/portfolio.repo.impl";
import { createInvProfileRepository } from "../investmentProfile/infrastructure/invProfile.repo.impl";

const router = Router();

const ctrl = paymentController(
  createPaymentService({
    paymentRepository: createPaymentRepository(),
    portfolioRepository: createPortfolioRepository(),
    invProfileRepository: createInvProfileRepository(),
  }),
);

// 납입 관련
router.get("/progress", authenticate, ctrl.getInvestmentProgress);
router.get("/payments", authenticate, ctrl.getInvestmentPayments);
router.post("/payments", authenticate, ctrl.recordInvestmentPayment);

export default router;
