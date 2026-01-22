import { HttpException } from "../errors/error";
import { UUID } from "crypto";
import { SurveyDto } from "../models/dtos/surveyDto";
import { SurveyRepository } from "../repositories/surveyRepository";
import { ErrorCode } from "../errors/errorCodes";
import { determineInvestmentType } from "../../utils/investmentType";

export type SurveyService = {
  /**
   * 질문 가져오기
   * @errors        QUESTIONS_NOT_FOUND
   * @returns       question data
   */
  questions: () => Promise<SurveyDto.Response>;
  /**
   * 설문 점수로 유저의 투자 성향 업데이트 하기
   * @param userId   user id
   * @param score   투자 성향 총점
   * @errors        INVALID_INVESTMENT_SCORE
   */
  answers: (userId: UUID, score: number) => Promise<void>;
};

export const createSurveyService = (
  surveyRepository: SurveyRepository,
): SurveyService => ({
  questions: async (): Promise<SurveyDto.Response> => {
    const questions = await surveyRepository.getSurvey();
    if (!questions) {
      throw new HttpException(
        404,
        ErrorCode.QUESTIONS_NOT_FOUND,
        "Questions not found",
      );
    }

    return questions;
  },

  answers: async (userId: UUID, score: number): Promise<void> => {
    const type = determineInvestmentType(score);

    // 필요한 핸들링인가
    // 클라이언트에서 버튼식 설문으로 날아오는 값인데 유효성 보장되는 것 아닐까
    if (!type) {
      throw new HttpException(
        400,
        ErrorCode.INVALID_INVESTMENT_SCORE,
        "Invalid investment score",
      );
    }

    await surveyRepository.submitAnswers(userId, type);
  },
});
