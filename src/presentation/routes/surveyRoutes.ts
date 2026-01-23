import { Router } from "express";
import { getInvestmentQuestions } from "../controllers/surveyController";

const router = Router();

router.get("/investment/questions", getInvestmentQuestions);

export default router;
