import { Request, Response } from "express";
import { InvProfileService } from "../application/invProfile.service";

export const invProfileController = (invProfileService: InvProfileService) => ({
  getInvestmentRisk: async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const riskType = await invProfileService.getRiskType(userId);
    res.status(200).json({
      success: true,
      message: "Successfully fetched.",
      data: { riskType },
    });
  },

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

  getInvestmentPlan: async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const plan = await invProfileService.getPlan(userId);
    res.status(200).json({
      success: true,
      message: "Successfully fetched.",
      data: { plan },
    });
  },

  createInvestmentPlan: async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { plan } = req.body;
    await invProfileService.createPlan({ userId, plan });
    res.status(201).json({
      success: true,
      message: "Created investment plan.",
    });
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
});
