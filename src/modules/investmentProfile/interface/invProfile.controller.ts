import { NextFunction, Request, Response } from "express";
import { InvProfileUsecase } from "../application/invProfile.usecase";

export const invProfileController = (invProfileUsecase: InvProfileUsecase) => ({
  assessInvestmentRisk: async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    const userId = req.user!.id;
    const { score } = req.body;
    const riskType = await invProfileUsecase.assessRiskType(
      userId,
      Number(score),
    );
    res.status(200).json({ riskType });
  },

  clearInvestmentRisk: async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    const userId = req.user!.id;
    await invProfileUsecase.clearRiskType(userId);
    res.status(200).json({ message: "Cleared investment plan." });
  },

  updateInvestmentPlan: async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    const userId = req.user!.id;
    const { plan } = req.body;
    await invProfileUsecase.updatePlan(userId, plan);
    res.status(200).json({ message: "Updated investment plan." });
  },

  clearInvestmentPlan: async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    const userId = req.user!.id;
    await invProfileUsecase.clearPlan(userId);
    res.status(200).json({ message: "Cleared investment plan." });
  },

  getInvestmentProfile: async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    const userId = req.user!.id;
    const profile = await invProfileUsecase.getProfile(userId);
    res.status(200).json(profile);
  },
});
