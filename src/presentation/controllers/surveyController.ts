import { NextFunction, Request, Response } from "express";
import { createSurveyService } from "src/domain/services/surveyService";
import { createSurveyRepository } from "src/data/repositories/surveyRepositoryImpl";

const surveyService = createSurveyService(createSurveyRepository());

export const getInvestmentQuestions = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const questions = await surveyService.getInvestmentQuestions();
    res.status(200).json(questions);
  } catch (error) {
    next(error);
  }
};
