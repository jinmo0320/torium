import { NextFunction, Request, Response } from "express";
import { createInvestmentProfileService } from "src/domain/services/investmentProfileService";
import { createSurveyRepository } from "src/data/repositories/investmentProfileRepositoryImpl";

const investmentProfileService = createInvestmentProfileService(
  createSurveyRepository(),
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
    res.status(200).json({ message: "Updated investment type." });
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
    const { profile } = req.body;
    await investmentProfileService.updatePlan(userId, profile);
    res.status(204).send();
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
  const userId = req.user!.id;

  const profile = await investmentProfileService.getProfile(userId); // 못 가져왔을 때를 대비하자

  res.status(200).json(profile);
};
