import { SurveyDto } from "../models/dtos/surveyDto";

export type SurveyRepository = {
  getInvestmentQuestions: () => Promise<SurveyDto.Response>;
};
