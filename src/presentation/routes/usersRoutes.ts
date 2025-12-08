import { Router } from "express";
import { me, changePassword } from "../controllers/usersController";

const router = Router();

router.post("/me", me);
router.post("/change-password", changePassword);

export default router;
