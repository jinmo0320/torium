import { Router } from "express";
import { authenticate } from "../middlewares/authMiddleware";
import * as controller from "../controllers/portfolioController";

const router = Router();

// === 전체 & 추천 ===
router.get("/", authenticate, controller.getMyPortfolio);
router.get("/recommendations", authenticate, controller.getRecommendations);
router.post("/create-from-preset", authenticate, controller.createFromPreset);

// === 자산군 ===
router.get("/categories", authenticate, controller.getCategories);
router.put("/categories", authenticate, controller.updateCategoryPortions);
router.post("/categories", authenticate, controller.addCategory);
router.delete(
  "/categories/:categoryId",
  authenticate,
  controller.deleteCategory,
);
router.patch("/categories/:categoryId", authenticate, controller.patchCategory);
router.get(
  "/categories/available",
  authenticate,
  controller.getAvailableCategories,
);
router.post("/categories/available", authenticate, controller.addCategory);

// === 하위자산 ===
router.get("/items", authenticate, controller.getItemsAbsolute); // 절대 비중 조회
router.put("/items", authenticate, controller.updateItemAbsolutePortions);
router.get(
  "/categories/:categoryId/items",
  authenticate,
  controller.getItemsRelative,
); // 상대 비중 조회
router.put(
  "/categories/:categoryId/items",
  authenticate,
  controller.updateItemRelativePortions,
);
router.post("/items", authenticate, controller.addItem);
router.delete("/items/:itemId", authenticate, controller.deleteItem);
router.patch("/items/:itemId", authenticate, controller.patchItem);
router.get("/items/available", authenticate, controller.getAvailableItems); // TODO: 라우트 구조 수정
router.post("/items/available", authenticate, controller.addItem);

export default router;
