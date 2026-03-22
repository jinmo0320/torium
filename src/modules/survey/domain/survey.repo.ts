import { Survey } from "../domain/survey.entity";

export type SurveyRepository = {
  /**
   * 투자 성향 질문 리스트를 반환
   * @returns 투자 성향 질문 리스트
   */
  getInvestmentQuestions: () => Promise<Survey.Question[]>;
};
