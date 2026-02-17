import { Router } from "express";
import { authenticate } from "src/shared/middlewares/authMiddleware";
import { loadPortfolio } from "src/shared/middlewares/portfolioMiddleware";
import { portfolioController } from "./presentation/portoflio.controller";
import { createPortfolioService } from "./application/portfolio.service";
import { createPortfolioRepository } from "./infrastructure/portfolio.repo.impl";
import { createInvProfileRepository } from "../investmentProfile/infrastructure/invProfile.repo.impl";

const router = Router();

const service = createPortfolioService({
  portfolioRepository: createPortfolioRepository(),
  invProfileRepository: createInvProfileRepository(),
});
const ctrl = portfolioController(service);

const portFolioLoader = loadPortfolio(service);

// === 전체 & 추천 ===
router.get("/", authenticate, ctrl.getMyPortfolio);
router.get("/recommendations", authenticate, ctrl.getRecommendations);
router.post("/create-from-preset", authenticate, ctrl.createFromPreset);

// === 자산군 ===
router.get("/categories", authenticate, portFolioLoader, ctrl.getCategories);
router.put(
  "/categories",
  authenticate,
  portFolioLoader,
  ctrl.updateCategoryPortions,
);
router.post("/categories", authenticate, portFolioLoader, ctrl.addCategory);
router.delete(
  "/categories/:categoryId",
  authenticate,
  portFolioLoader,
  ctrl.deleteCategory,
);
router.patch("/categories/:categoryId", authenticate, ctrl.patchCategory);
router.get("/categories/available", authenticate, ctrl.getAvailableCategories);
router.post(
  "/categories/available",
  authenticate,
  portFolioLoader,
  ctrl.addCategory,
);

// == 자산군 내 하위 자산
router.get(
  "/categories/:categoryId/items",
  authenticate,
  ctrl.getItemsRelative,
);
router.put(
  "/categories/:categoryId/items",
  authenticate,
  ctrl.updateItemRelativePortions,
);
router.post("/categories/:categoryId/items", authenticate, ctrl.addItem);
router.get(
  "/categories/:categoryId/items/available",
  authenticate,
  ctrl.getAvailableItems,
);
router.post(
  "/categories/:categoryId/items/available",
  authenticate,
  ctrl.addItem,
);

// === 개별 하위 자산 ===
router.get("/items", authenticate, portFolioLoader, ctrl.getItemsAbsolute);
router.put(
  "/items",
  authenticate,
  portFolioLoader,
  ctrl.updateItemAbsolutePortions,
);
router.delete("/items/:itemId", authenticate, portFolioLoader, ctrl.deleteItem);
router.patch("/items/:itemId", authenticate, ctrl.patchItem);

export default router;
