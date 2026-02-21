import { Router } from "express";
import { authenticate } from "src/shared/middlewares/authMiddleware";
import { invProfileController } from "./presentation/invProfile.controller";
import { createInvProfileService } from "./application/invProfile.service";
import { createInvProfileRepository } from "./infrastructure/invProfile.repo.impl";

const router = Router();

const ctrl = invProfileController(
  createInvProfileService({
    invProfileRepository: createInvProfileRepository(),
  }),
);

router.get("/", authenticate, ctrl.getInvestmentProfile);
router.post("/risk-type", authenticate, ctrl.assessInvestmentRisk);
router.patch("/risk-type", authenticate, ctrl.clearInvestmentRisk);
router.put("/plan", authenticate, ctrl.updateInvestmentPlan);
router.patch("/plan", authenticate, ctrl.clearInvestmentPlan);

export default router;
