import { UUID } from "crypto";
import { SurveyDto } from "../models/dtos/surveyDto";
import { InvestmentType } from "../../utils/investmentType";

export interface SurveyRepository {
  getSurvey(): Promise<SurveyDto.Response>;
  submitAnswers(userId: UUID, type: InvestmentType): Promise<void>;
}
