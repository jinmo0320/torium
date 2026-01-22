import { Router } from "express";
import { questions, answers, plan } from "../controllers/surveyController";

const router = Router();

router.get("/questions", questions);
router.post("/answers", answers);
router.post("/asset-plan", plan);

export default router;
