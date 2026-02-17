import { Request, Response } from "express";
import { InvProfileService } from "../application/invProfile.service";

export const invProfileController = (invProfileService: InvProfileService) => ({
  assessInvestmentRisk: async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { score } = req.body;
    const riskType = await invProfileService.assessRiskType({
      userId,
      score: Number(score),
    });
    res.status(200).json({
      success: true,
      message: "Updated risk type.",
      data: { riskType },
    });
  },

  clearInvestmentRisk: async (req: Request, res: Response) => {
    const userId = req.user!.id;
    await invProfileService.clearRiskType(userId);
    res.status(200).json({ success: true, message: "Cleared risk type." });
  },

  updateInvestmentPlan: async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { plan } = req.body;
    await invProfileService.updatePlan({ userId, plan });
    res.status(200).json({
      success: true,
      message: "Updated investment plan.",
    });
  },

  clearInvestmentPlan: async (req: Request, res: Response) => {
    const userId = req.user!.id;
    await invProfileService.clearPlan(userId);
    res.status(200).json({
      success: true,
      message: "Cleared investment plan.",
    });
  },

  getInvestmentProfile: async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.id;
    const profile = await invProfileService.getProfile(userId);
    res.status(200).json({
      success: true,
      message: "여기 있습니다.",
      data: { profile },
    });
  },
});
