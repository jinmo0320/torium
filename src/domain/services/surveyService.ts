import { SurveyRepository } from "../repositories/surveyRepository";
import { SurveyDto } from "../models/dtos/surveyDto";
import { HttpException } from "../errors/error";
import { ErrorCode } from "../errors/errorCodes";

export type SurveyService = {
  /**
   * 투자 성향 설문 질문 가져오기
   * @errors        QUESTIONS_NOT_FOUND
   * @returns       question data
   */
  getInvestmentQuestions: () => Promise<SurveyDto.Response>;
};

export const createSurveyService = (
  surveyRepository: SurveyRepository,
): SurveyService => ({
  getInvestmentQuestions: async (): Promise<SurveyDto.Response> => {
    const questions = await surveyRepository.getInvestmentQuestions();
    if (!questions) {
      throw new HttpException(
        404,
        ErrorCode.QUESTIONS_NOT_FOUND,
        "Questions not found",
      );
    }

    return questions;
  },
});
