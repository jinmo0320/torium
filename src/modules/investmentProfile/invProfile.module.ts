import { Router } from "express";
import { authenticate } from "src/shared/middlewares/authMiddleware";
import { invProfileController } from "./interface/invProfile.controller";
import { createInvProfileService } from "./application/invProfile.service";
import { createInvProfileRepository } from "./infrastructure/invProfile.repo.impl";

const router = Router();

const ctrl = invProfileController(
  createInvProfileService({
    invProfileRepository: createInvProfileRepository(),
  }),
);

router.get("/investment-profile", authenticate, ctrl.getInvestmentProfile);
router.post(
  "/investment-profile/risk-type",
  authenticate,
  ctrl.assessInvestmentRisk,
);
router.patch(
  "/investment-profile/risk-type",
  authenticate,
  ctrl.clearInvestmentRisk,
);
router.put("/investment-profile/plan", authenticate, ctrl.updateInvestmentPlan);
router.patch(
  "/investment-profile/plan",
  authenticate,
  ctrl.clearInvestmentPlan,
);

export default router;
