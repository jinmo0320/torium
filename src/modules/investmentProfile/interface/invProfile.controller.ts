import { Request, Response } from "express";
import { InvProfileService } from "../application/invProfile.service";

export const invProfileController = (invProfileService: InvProfileService) => ({
  assessInvestmentRisk: async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { score } = req.body;
    const riskType = await invProfileService.assessRiskType(
      userId,
      Number(score),
    );
    res.status(200).json({ riskType });
  },

  clearInvestmentRisk: async (req: Request, res: Response) => {
    const userId = req.user!.id;
    await invProfileService.clearRiskType(userId);
    res.status(200).json({ message: "Cleared investment plan." });
  },

  updateInvestmentPlan: async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { plan } = req.body;
    await invProfileService.updatePlan(userId, plan);
    res.status(200).json({ message: "Updated investment plan." });
  },

  clearInvestmentPlan: async (req: Request, res: Response) => {
    const userId = req.user!.id;
    await invProfileService.clearPlan(userId);
    res.status(200).json({ message: "Cleared investment plan." });
  },

  getInvestmentProfile: async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.id;
    const profile = await invProfileService.getProfile(userId);
    res.status(200).json(profile);
  },
});
