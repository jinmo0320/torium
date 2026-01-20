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
