import { Router } from "express";
import { authenticate } from "../middlewares/authMiddleware";
import { me, changePassword } from "../controllers/userController";
import {
  assessInvestmentRisk,
  getInvestmentProfile,
  updateInvestmentPlan,
} from "../controllers/investmentController";

const router = Router();

router.get("/", authenticate, me);
router.patch("/password", authenticate, changePassword);

// Survey & Investment
router.get("/investment-profile", authenticate, getInvestmentProfile);
router.post(
  "/investment-profile/risk-type",
  authenticate,
  assessInvestmentRisk,
);
router.put("/investment-profile/plan", authenticate, updateInvestmentPlan);

export default router;
