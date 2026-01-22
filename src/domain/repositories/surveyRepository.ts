import { UUID } from "crypto";
import { SurveyDto } from "../models/dtos/surveyDto";
import { InvestmentType } from "../../utils/investmentType";

export type SurveyRepository = {
  getSurvey: () => Promise<SurveyDto.Response>;
  submitAnswers: (userId: UUID, type: InvestmentType) => Promise<void>;
  plan: (userId: UUID, profile: SurveyDto.Profile) => Promise<void>;
};
