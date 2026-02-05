import { NextFunction, Request, Response } from "express";
import { createInvestmentProfileService } from "src/domain/services/investmentProfileService";
import { createInvestmentProfileRepository } from "src/data/repositories/investmentProfileRepositoryImpl";

const investmentProfileService = createInvestmentProfileService(
  createInvestmentProfileRepository(),
);

export const assessInvestmentRisk = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const userId = req.user!.id;
  const { score } = req.body;
  const riskType = await investmentProfileService.assessRiskType(
    userId,
    Number(score),
  );
  res.status(200).json({ riskType });
};

export const clearInvestmentRisk = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const userId = req.user!.id;
  await investmentProfileService.clearRiskType(userId);
  res.status(200).json({ message: "Cleared investment plan." });
};

export const updateInvestmentPlan = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const userId = req.user!.id;
  const { plan } = req.body;
  await investmentProfileService.updatePlan(userId, plan);
  res.status(200).json({ message: "Updated investment plan." });
};

export const clearInvestmentPlan = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const userId = req.user!.id;
  await investmentProfileService.clearPlan(userId);
  res.status(200).json({ message: "Cleared investment plan." });
};

export const getInvestmentProfile = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const userId = req.user!.id;
  const profile = await investmentProfileService.getProfile(userId);
  res.status(200).json(profile);
};
