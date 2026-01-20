import { inject, injectable } from "tsyringe";
import { HttpException } from "../errors/error";
import { SurveyDto } from "../models/dtos/surveyDto";
import { SurveyRepository } from "../repositories/surveyRepository";
import { ErrorCode } from "../errors/errorCodes";

export interface SurveyService {
  /**
   * 질문 가져오기
   * @errors        QUESTIONS_NOT_FOUND
   * @returns       question data
   */
  questions(): Promise<SurveyDto.Response>;
}

@injectable()
export class SurveyServiceImpl implements SurveyService {
  constructor(
    @inject("SurveyRepository") private surveyRepository: SurveyRepository,
  ) {}

  async questions(): Promise<SurveyDto.Response> {
    const questions = await this.surveyRepository.getSurvey();
    if (!questions) {
      throw new HttpException(
        404,
        ErrorCode.QUESTIONS_NOT_FOUND,
        "Questions not found",
      );
    }

    return questions;
  }
}
