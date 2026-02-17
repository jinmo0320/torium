import { Router } from "express";
import { surveyController } from "./presentation/survey.controller";
import { createSurveyService } from "./application/survey.service";
import { createSurveyRepository } from "./infrastructure/survey.repo.impl";

const router = Router();

const ctrl = surveyController(
  createSurveyService({
    surveyRepository: createSurveyRepository(),
  }),
);

router.get("/investment/questions", ctrl.getInvestmentQuestions);

export default router;
