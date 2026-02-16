import { Router } from "express";
import { authenticate } from "src/shared/middlewares/authMiddleware";
import { createUserService } from "./application/user.service";
import { createUserRepository } from "./infrastructure/user.repo.impl";
import { createBcryptHelper } from "src/shared/infrastructure/bcryptHelper";
import { userController } from "./interface/user.controller";

const router = Router();

const service = createUserService({
  userRepository: createUserRepository(),
  BcryptHelper: createBcryptHelper(),
});
const ctrl = userController(service);

router.get("/", authenticate, ctrl.me);
router.patch("/password", authenticate, ctrl.changePassword);

export default router;
