import { Router } from "express";
import { me, changePassword } from "../controllers/userController";
import { authenticate } from "../middlewares/authMiddleware";

const router = Router();

router.get("/me", authenticate, me);
router.post("/change-password", authenticate, changePassword);

export default router;
