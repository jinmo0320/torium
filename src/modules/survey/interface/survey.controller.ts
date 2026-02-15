import { NextFunction, Request, Response } from "express";
import { SurveyUsecase } from "../application/survey.usecase";

export const surveyController = (surveyUsecase: SurveyUsecase) => ({
  getInvestmentQuestions: async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    const questions = await surveyUsecase.getInvestmentQuestions();
    res.status(200).json(questions);
  },
});
