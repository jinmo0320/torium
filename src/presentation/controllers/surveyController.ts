import { NextFunction, Request, Response } from "express";
import { SurveyService } from "../../domain/services/surveyService";
import { container } from "tsyringe";

export const questions = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const surveyService = container.resolve<SurveyService>("SurveyService");
  try {
    const questions = await surveyService.questions();
    res.status(200).json(questions);
  } catch (error) {
    next(error);
  }
};

export const answers = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const surveyService = container.resolve<SurveyService>("SurveyService");

  try {
    const userId = req.user!.id;
    const { score } = req.body;
    await surveyService.answers(userId, Number(score));
    res.status(200).json({ message: "Updated investment type." });
  } catch (error) {
    next(error);
  }
};
