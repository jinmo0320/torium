import { Router } from "express";
import { authenticate } from "../middlewares/authMiddleware";
import { loadPortfolio } from "../middlewares/portfolioMiddleware";
import * as controller from "../controllers/portfolioController";

const router = Router();
const portFolioLoader = loadPortfolio(controller.portfolioService);

// === 전체 & 추천 ===
router.get("/", authenticate, controller.getMyPortfolio);
router.get("/recommendations", authenticate, controller.getRecommendations);
router.post("/create-from-preset", authenticate, controller.createFromPreset);

// === 자산군 ===
router.get(
  "/categories",
  authenticate,
  portFolioLoader,
  controller.getCategories,
);
router.put(
  "/categories",
  authenticate,
  portFolioLoader,
  controller.updateCategoryPortions,
);
router.post(
  "/categories",
  authenticate,
  portFolioLoader,
  controller.addCategory,
);
router.delete(
  "/categories/:categoryId",
  authenticate,
  portFolioLoader,
  controller.deleteCategory,
);
router.patch("/categories/:categoryId", authenticate, controller.patchCategory);
router.get(
  "/categories/available",
  authenticate,
  controller.getAvailableCategories,
);
router.post(
  "/categories/available",
  authenticate,
  portFolioLoader,
  controller.addCategory,
);

// == 자산군 내 하위 자산
router.get(
  "/categories/:categoryId/items",
  authenticate,
  controller.getItemsRelative,
);
router.put(
  "/categories/:categoryId/items",
  authenticate,
  controller.updateItemRelativePortions,
);
router.post("/categories/:categoryId/items", authenticate, controller.addItem);
router.get(
  "/categories/:categoryId/items/available",
  authenticate,
  controller.getAvailableItems,
);
router.post(
  "/categories/:categoryId/items/available",
  authenticate,
  controller.addItem,
);

// === 개별 하위 자산 ===
router.get(
  "/items",
  authenticate,
  portFolioLoader,
  controller.getItemsAbsolute,
);
router.put(
  "/items",
  authenticate,
  portFolioLoader,
  controller.updateItemAbsolutePortions,
);
router.delete(
  "/items/:itemId",
  authenticate,
  portFolioLoader,
  controller.deleteItem,
);
router.patch("/items/:itemId", authenticate, controller.patchItem);

export default router;
