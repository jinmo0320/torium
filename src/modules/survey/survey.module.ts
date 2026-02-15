import { Router } from "express";
import { surveyController } from "./interface/survey.controller";
import { surveyUsecase } from "./application/survey.usecase";
import { createSurveyRepository } from "./infrastructure/survey.repo.impl";

const router = Router();

const usecase = surveyUsecase(createSurveyRepository());
const ctrl = surveyController(usecase);

router.get("/investment/questions", ctrl.getInvestmentQuestions);

export default router;
