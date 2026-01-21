import { Router } from "express";
import { questions, answers } from "../controllers/surveyController";

const router = Router();

router.get("/questions", questions);
router.post("/answers", answers);

export default router;
