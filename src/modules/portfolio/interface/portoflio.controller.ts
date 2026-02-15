import { Request, Response, NextFunction } from "express";
import { PortfolioUsecase } from "../application/portfolio.usecase";

export const portfolioController = (portfolioUsecase: PortfolioUsecase) => ({
  // === 포폴 전체 & 추천 ===
  getMyPortfolio: async (req: Request, res: Response, next: NextFunction) => {
    const portfolio = await portfolioUsecase.getPortfolio(req.user!.id);
    res.status(200).json(portfolio);
  },

  getRecommendations: async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    const presets = await portfolioUsecase.getRecommendations(req.user!.id);
    res.status(200).json(presets);
  },

  createFromPreset: async (req: Request, res: Response, next: NextFunction) => {
    const { presetCode } = req.body; // 프론트에서 선택한 프리셋 코드
    await portfolioUsecase.createFromPreset(req.user!.id, presetCode);
    res
      .status(201)
      .json({ message: "Portfolio created from preset successfully." });
  },

  // === 자산군 ===
  getCategories: async (req: Request, res: Response, next: NextFunction) => {
    const categories = await portfolioUsecase.getCategories(
      req.user!.portfolioId!,
    );
    res.status(200).json(categories);
  },

  updateCategoryPortions: async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    await portfolioUsecase.updateCategoryPortions(
      req.user!.portfolioId!,
      req.body.categoryPortions,
    );
    res.status(200).json({ message: "Asset Categories updated." });
  },

  addCategory: async (req: Request, res: Response, next: NextFunction) => {
    const { categoryId } = req.body;
    const customCategoryInfo = req.body.customCategoryInfo || req.body;
    await portfolioUsecase.addCategory(
      req.user!.portfolioId!,
      categoryId,
      customCategoryInfo,
    );
    res.status(201).json({ message: "Asset Category added." });
  },

  deleteCategory: async (req: Request, res: Response, next: NextFunction) => {
    await portfolioUsecase.deleteCategory(
      req.user!.portfolioId!,
      Number(req.params.categoryId),
    );
    res.status(200).json({ message: "Asset Category deleted." });
  },

  patchCategory: async (req: Request, res: Response, next: NextFunction) => {
    const categoryInfo = req.body.categoryInfo || req.body;
    await portfolioUsecase.updateCategoryInfo(
      Number(req.params.categoryId),
      categoryInfo,
    );
    res.status(200).json({ message: "Asset Category info updated." });
  },

  getAvailableCategories: async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    const categories = await portfolioUsecase.getAvailableCategories(
      req.user!.portfolioId!,
    );
    res.status(200).json(categories);
  },

  // === 자산군 내 하위 자산 ===
  getItemsRelative: async (req: Request, res: Response, next: NextFunction) => {
    const items = await portfolioUsecase.getItemsRelative(
      Number(req.params.categoryId),
    );
    res.status(200).json(items);
  },

  updateItemRelativePortions: async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    await portfolioUsecase.updateItemRelativePortions(
      Number(req.params.categoryId),
      req.body.itemPortions,
    );
    res.status(200).json({ message: "Relative portions updated." });
  },

  addItem: async (req: Request, res: Response, next: NextFunction) => {
    const { masterItemId } = req.body;
    const customItemInfo = req.body.customItemInfo || req.body;
    await portfolioUsecase.addItem(
      Number(req.params.categoryId),
      masterItemId,
      customItemInfo,
    );
    res.status(201).json({ message: "Asset added." });
  },

  getAvailableItems: async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    const list = await portfolioUsecase.getAvailableItems(
      Number(req.params.categoryId),
    );
    res.status(200).json(list);
  },

  // === 개별 하위 자산 ===
  getItemsAbsolute: async (req: Request, res: Response, next: NextFunction) => {
    const items = await portfolioUsecase.getItemsAbsolute(
      req.user!.portfolioId!,
    );
    res.status(200).json(items);
  },

  updateItemAbsolutePortions: async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    await portfolioUsecase.updateItemAbsolutePortions(
      req.user!.portfolioId!,
      req.body.itemPortions,
    );
    res.status(200).json({ message: "Absolute portions updated." });
  },

  deleteItem: async (req: Request, res: Response, next: NextFunction) => {
    await portfolioUsecase.deleteItem(
      req.user!.portfolioId!,
      Number(req.params.itemId),
    );
    res.status(200).json({ message: "Asset Item deleted." });
  },

  patchItem: async (req: Request, res: Response, next: NextFunction) => {
    const itemInfo = req.body.itemInfo || req.body;
    await portfolioUsecase.updateItemInfo(Number(req.params.itemId), itemInfo);
    res.status(200).json({ message: "Asset Item info updated." });
  },
});
