import { Router } from "express";
import { authenticate } from "src/shared/middlewares/authMiddleware";
import { invProfileController } from "./presentation/invProfile.controller";
import { createInvProfileService } from "./application/invProfile.service";
import { createInvProfileRepository } from "./infrastructure/invProfile.repo.impl";
import { createPaymentService } from "../payment/application/payment.service";
import { createPaymentRepository } from "../payment/infrastructure/payment.repo.impl";
import { createPortfolioRepository } from "../portfolio/infrastructure/portfolio.repo.impl";

const router = Router();

const invProfileRepo = createInvProfileRepository();
const portfolioRepo = createPortfolioRepository();

const ctrl = invProfileController(
  createInvProfileService({
    invProfileRepository: invProfileRepo,
    paymentService: createPaymentService({
      paymentRepository: createPaymentRepository(),
      portfolioRepository: portfolioRepo,
      invProfileRepository: invProfileRepo,
    }),
  }),
);

// 투자 성향 관련
router.get("/risk-type", authenticate, ctrl.getInvestmentRisk);
router.post("/risk-type", authenticate, ctrl.assessInvestmentRisk);
router.patch("/risk-type", authenticate, ctrl.clearInvestmentRisk);

// 투자 계획 관련
router.get("/plan", authenticate, ctrl.getInvestmentPlan);
router.post("/plan", authenticate, ctrl.createInvestmentPlan); // 플랜 만들기
router.put("/plan", authenticate, ctrl.updateInvestmentPlan);
router.patch("/plan", authenticate, ctrl.clearInvestmentPlan); // 실제로는 비활성화

export default router;
