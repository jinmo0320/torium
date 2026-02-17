import { Request, Response } from "express";
import { SurveyService } from "../application/survey.service";

export const surveyController = (surveyService: SurveyService) => ({
  getInvestmentQuestions: async (req: Request, res: Response) => {
    const questions = await surveyService.getInvestmentQuestions();
    res.status(200).json({
      success: true,
      message: "질문 목록을 대령했습니다.",
      data: { questions },
    });
  },
});
