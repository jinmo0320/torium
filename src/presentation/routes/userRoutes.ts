import { Router } from "express";
import portfolioRoutes from "./portfolioRoutes";
import { authenticate } from "../middlewares/authMiddleware";
import { me, changePassword } from "../controllers/userController";
import {
  assessInvestmentRisk,
  clearInvestmentRisk,
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
router.patch(
  "/investment-profile/risk-type",
  authenticate,
  clearInvestmentRisk,
);
router.put("/investment-profile/plan", authenticate, updateInvestmentPlan);
// Portfolio
router.use("/portfolio", authenticate, portfolioRoutes);

export default router;
