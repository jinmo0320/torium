import { SurveyRepository } from "./survey.repo";
import { Survey } from "../domain/survey.entity";
import { DomainError } from "src/shared/errors/error";
import { ErrorCodes } from "src/shared/errors/errorCodes";

export type SurveyUsecase = {
  /**
   * 투자 성향 설문 질문 가져오기
   * @errors        QUESTIONS_NOT_FOUND
   * @returns       question data
   */
  getInvestmentQuestions: () => Promise<Survey.Question[]>;
};

export const surveyUsecase = (
  surveyRepository: SurveyRepository,
): SurveyUsecase => ({
  getInvestmentQuestions: async (): Promise<Survey.Question[]> => {
    const questions = await surveyRepository.getInvestmentQuestions();
    if (!questions) {
      throw new DomainError(
        ErrorCodes.SURVEY.QUESTIONS_NOT_FOUND,
        "Questions not found",
      );
    }

    return questions;
  },
});
