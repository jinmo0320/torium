import { Router } from "express";
import { me, changePassword } from "../controllers/userController";

const router = Router();

router.get("/me", me);
router.post("/change-password", changePassword);

export default router;
