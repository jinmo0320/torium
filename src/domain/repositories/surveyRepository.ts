import { SurveyDto } from "../models/dtos/surveyDto";

export interface SurveyRepository {
  getSurvey(): Promise<SurveyDto.Response>;
}
