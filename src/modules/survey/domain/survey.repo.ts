import { Survey } from "../domain/survey.entity";

export type SurveyRepository = {
  getInvestmentQuestions: () => Promise<Survey.Question[]>;
};
