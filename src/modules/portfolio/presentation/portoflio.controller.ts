import { Request, Response } from "express";
import { PortfolioService } from "../application/portfolio.service";

export const portfolioController = (portfolioService: PortfolioService) => ({
  // === 포폴 전체 & 추천 ===
  getMyPortfolio: async (req: Request, res: Response) => {
    const portfolio = await portfolioService.getPortfolio(req.user!.id);
    res.status(200).json(portfolio);
  },

  getRecommendations: async (req: Request, res: Response) => {
    const presets = await portfolioService.getRecommendations(req.user!.id);
    res.status(200).json(presets);
  },

  createFromPreset: async (req: Request, res: Response) => {
    const { presetCode } = req.body; // 프론트에서 선택한 프리셋 코드
    await portfolioService.createFromPreset(req.user!.id, presetCode);
    res
      .status(201)
      .json({ message: "Portfolio created from preset successfully." });
  },

  // === 자산군 ===
  getCategories: async (req: Request, res: Response) => {
    const categories = await portfolioService.getCategories(
      req.user!.portfolioId!,
    );
    res.status(200).json(categories);
  },

  updateCategoryPortions: async (req: Request, res: Response) => {
    await portfolioService.updateCategoryPortions(
      req.user!.portfolioId!,
      req.body.categoryPortions,
    );
    res.status(200).json({ message: "Asset Categories updated." });
  },

  addCategory: async (req: Request, res: Response) => {
    const { categoryId } = req.body;
    const customCategoryInfo = req.body.customCategoryInfo || req.body;
    await portfolioService.addCategory(
      req.user!.portfolioId!,
      categoryId,
      customCategoryInfo,
    );
    res.status(201).json({ message: "Asset Category added." });
  },

  deleteCategory: async (req: Request, res: Response) => {
    await portfolioService.deleteCategory(
      req.user!.portfolioId!,
      Number(req.params.categoryId),
    );
    res.status(200).json({ message: "Asset Category deleted." });
  },

  patchCategory: async (req: Request, res: Response) => {
    const categoryInfo = req.body.categoryInfo || req.body;
    await portfolioService.updateCategoryInfo(
      Number(req.params.categoryId),
      categoryInfo,
    );
    res.status(200).json({ message: "Asset Category info updated." });
  },

  getAvailableCategories: async (req: Request, res: Response) => {
    const categories = await portfolioService.getAvailableCategories(
      req.user!.portfolioId!,
    );
    res.status(200).json(categories);
  },

  // === 자산군 내 하위 자산 ===
  getItemsRelative: async (req: Request, res: Response) => {
    const items = await portfolioService.getItemsRelative(
      Number(req.params.categoryId),
    );
    res.status(200).json(items);
  },

  updateItemRelativePortions: async (req: Request, res: Response) => {
    await portfolioService.updateItemRelativePortions(
      Number(req.params.categoryId),
      req.body.itemPortions,
    );
    res.status(200).json({ message: "Relative portions updated." });
  },

  addItem: async (req: Request, res: Response) => {
    const { masterItemId } = req.body;
    const customItemInfo = req.body.customItemInfo || req.body;
    await portfolioService.addItem(
      Number(req.params.categoryId),
      masterItemId,
      customItemInfo,
    );
    res.status(201).json({ message: "Asset added." });
  },

  getAvailableItems: async (req: Request, res: Response) => {
    const list = await portfolioService.getAvailableItems(
      Number(req.params.categoryId),
    );
    res.status(200).json(list);
  },

  // === 개별 하위 자산 ===
  getItemsAbsolute: async (req: Request, res: Response) => {
    const items = await portfolioService.getItemsAbsolute(
      req.user!.portfolioId!,
    );
    res.status(200).json(items);
  },

  updateItemAbsolutePortions: async (req: Request, res: Response) => {
    await portfolioService.updateItemAbsolutePortions(
      req.user!.portfolioId!,
      req.body.itemPortions,
    );
    res.status(200).json({ message: "Absolute portions updated." });
  },

  deleteItem: async (req: Request, res: Response) => {
    await portfolioService.deleteItem(
      req.user!.portfolioId!,
      Number(req.params.itemId),
    );
    res.status(200).json({ message: "Asset Item deleted." });
  },

  patchItem: async (req: Request, res: Response) => {
    const itemInfo = req.body.itemInfo || req.body;
    await portfolioService.updateItemInfo(Number(req.params.itemId), itemInfo);
    res.status(200).json({ message: "Asset Item info updated." });
  },
});
