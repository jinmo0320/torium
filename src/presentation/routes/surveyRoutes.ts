import { Router } from "express";
import { questions } from "../controllers/surveyController";

const router = Router();

router.get("/questions", questions);

export default router;
