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
  try {
    const userId = req.user!.id;
    const { score } = req.body;
    await investmentProfileService.assessRisk(userId, Number(score));
    res.status(200).json({ message: "Updated risk type." });
  } catch (error) {
    next(error);
  }
};

export const updateInvestmentPlan = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user!.id;
    const { plan } = req.body;
    await investmentProfileService.updatePlan(userId, plan);
    res.status(200).json({ message: "Updated investment plan." });
  } catch (error) {
    next(error);
  }
};

// TODO: error handling
export const getInvestmentProfile = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const profile = await investmentProfileService.getProfile(userId);
    res.status(200).json(profile);
  } catch (error) {
    next(error);
  }
};
