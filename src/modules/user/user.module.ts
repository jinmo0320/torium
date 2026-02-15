import { Router } from "express";
import { authenticate } from "src/shared/middlewares/authMiddleware";
import { userUsecase } from "./application/user.usecase";
import { createUserRepository } from "./infrastructure/user.repo.impl";
import { createBcryptHelper } from "src/shared/infrastructure/bcryptHelper";
import { userController } from "./interface/user.controller";

const router = Router();

const usecase = userUsecase(createUserRepository(), createBcryptHelper());
const ctrl = userController(usecase);

router.get("/", authenticate, ctrl.me);
router.patch("/password", authenticate, ctrl.changePassword);

export default router;
