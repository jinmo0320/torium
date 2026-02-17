import { Request, Response } from "express";
import { PortfolioService } from "../application/portfolio.service";

export const portfolioController = (portfolioService: PortfolioService) => ({
  // === 포폴 전체 & 추천 ===
  getMyPortfolio: async (req: Request, res: Response) => {
    const portfolio = await portfolioService.getPortfolio(req.user!.id);
    res.status(200).json({
      success: true,
      message: "포트폴리오를 가져왔습니다.",
      data: { portfolio },
    });
  },

  getRecommendations: async (req: Request, res: Response) => {
    const presets = await portfolioService.getRecommendations(req.user!.id);
    res.status(200).json({
      success: true,
      message: "추천 포트폴리오 프리셋을 가져왔습니다",
      data: { presets },
    });
  },

  createFromPreset: async (req: Request, res: Response) => {
    const { presetCode } = req.body; // 프론트에서 선택한 프리셋 코드
    await portfolioService.createFromPreset({
      userId: req.user!.id,
      presetCode,
    });
    res.status(201).json({
      success: true,
      message: "Portfolio created from preset successfully.",
    });
  },

  // === 자산군 ===
  getCategories: async (req: Request, res: Response) => {
    const categories = await portfolioService.getCategories(
      req.user!.portfolioId!,
    );
    res.status(200).json({
      success: true,
      message: "카테고리를 가져왔습니다",
      data: { categories },
    });
  },

  updateCategoryPortions: async (req: Request, res: Response) => {
    await portfolioService.updateCategoryPortions({
      portfolioId: req.user!.portfolioId!,
      portions: req.body.categoryPortions,
    });
    res
      .status(200)
      .json({ success: true, message: "Asset Categories updated." });
  },

  addCategory: async (req: Request, res: Response) => {
    const { categoryId } = req.body;
    const customCategoryInfo = req.body.customCategoryInfo || req.body;
    await portfolioService.addCategory({
      portfolioId: req.user!.portfolioId!,
      masterCategoryId: categoryId,
      customCategoryInfo,
    });
    res.status(201).json({ success: true, message: "Asset Category added." });
  },

  deleteCategory: async (req: Request, res: Response) => {
    await portfolioService.deleteCategory({
      categoryId: req.user!.portfolioId!,
      portfolioId: Number(req.params.categoryId),
    });
    res.status(200).json({ success: true, message: "Asset Category deleted." });
  },

  patchCategory: async (req: Request, res: Response) => {
    const categoryInfo = req.body.categoryInfo || req.body;
    await portfolioService.updateCategoryInfo({
      categoryId: Number(req.params.categoryId),
      categoryInfo,
    });
    res
      .status(200)
      .json({ success: true, message: "Asset Category info updated." });
  },

  getAvailableCategories: async (req: Request, res: Response) => {
    const categories = await portfolioService.getAvailableCategories(
      req.user!.portfolioId!,
    );
    res.status(200).json({
      success: true,
      message: "추가 가능한 카테고리를 가져왔습니다.",
      data: { categories },
    });
  },

  // === 자산군 내 하위 자산 ===
  getItemsRelative: async (req: Request, res: Response) => {
    const items = await portfolioService.getItemsRelative(
      Number(req.params.categoryId),
    );
    res.status(200).json({
      success: true,
      message: "상대 비중으로 아이템을 가져왔습니다.",
      data: { items },
    });
  },

  updateItemRelativePortions: async (req: Request, res: Response) => {
    await portfolioService.updateItemRelativePortions({
      categoryId: Number(req.params.categoryId),
      portions: req.body.itemPortions,
    });
    res
      .status(200)
      .json({ success: true, message: "Relative portions updated." });
  },

  addItem: async (req: Request, res: Response) => {
    const { masterItemId } = req.body;
    const customItemInfo = req.body.customItemInfo || req.body;
    await portfolioService.addItem({
      categoryId: Number(req.params.categoryId),
      masterItemId,
      customItemInfo,
    });
    res.status(201).json({ success: true, message: "Asset added." });
  },

  getAvailableItems: async (req: Request, res: Response) => {
    const list = await portfolioService.getAvailableItems(
      Number(req.params.categoryId),
    );
    res.status(200).json({
      success: true,
      message: "추가 가능한 아이템을 가져왔습니다.",
      data: { list },
    });
  },

  // === 개별 하위 자산 ===
  getItemsAbsolute: async (req: Request, res: Response) => {
    const items = await portfolioService.getItemsAbsolute(
      req.user!.portfolioId!,
    );
    res.status(200).json({
      success: true,
      message: "절대 비중으로 아이템을 가져왔습니다.",
      data: { items },
    });
  },

  updateItemAbsolutePortions: async (req: Request, res: Response) => {
    await portfolioService.updateItemAbsolutePortions({
      portfolioId: req.user!.portfolioId!,
      portions: req.body.itemPortions,
    });
    res
      .status(200)
      .json({ success: true, message: "Absolute portions updated." });
  },

  deleteItem: async (req: Request, res: Response) => {
    await portfolioService.deleteItem({
      portfolioId: req.user!.portfolioId!,
      itemId: Number(req.params.itemId),
    });
    res.status(200).json({ success: true, message: "Asset Item deleted." });
  },

  patchItem: async (req: Request, res: Response) => {
    const itemInfo = req.body.itemInfo || req.body;
    await portfolioService.updateItemInfo({
      itemId: Number(req.params.itemId),
      itemInfo,
    });
    res
      .status(200)
      .json({ success: true, message: "Asset Item info updated." });
  },
});
