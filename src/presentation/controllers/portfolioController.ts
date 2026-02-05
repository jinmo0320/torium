import { Request, Response, NextFunction } from "express";

import { createPortfolioService } from "src/domain/services/portfolioService";
import { createPortfolioRepository } from "src/data/repositories/portfolioRepositoryImpl";
import { createInvestmentProfileRepository } from "src/data/repositories/investmentProfileRepositoryImpl";

export const portfolioService = createPortfolioService(
  createPortfolioRepository(),
  createInvestmentProfileRepository(),
);

// === 포폴 전체 & 추천 ===
export const getMyPortfolio = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const portfolio = await portfolioService.getPortfolio(req.user!.id);
    res.status(200).json(portfolio);
  } catch (e) {
    next(e);
  }
};

export const getRecommendations = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const presets = await portfolioService.getRecommendations(req.user!.id);
    res.status(200).json(presets);
  } catch (e) {
    next(e);
  }
};

export const createFromPreset = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { presetCode } = req.body; // 프론트에서 선택한 프리셋 코드
    await portfolioService.createFromPreset(req.user!.id, presetCode);
    res
      .status(201)
      .json({ message: "Portfolio created from preset successfully." });
  } catch (e) {
    next(e);
  }
};

// === 자산군 ===
export const getCategories = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const categories = await portfolioService.getCategories(
      req.user!.portfolioId!,
    );
    res.status(200).json(categories);
  } catch (e) {
    next(e);
  }
};

export const updateCategoryPortions = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    await portfolioService.updateCategoryPortions(
      req.user!.portfolioId!,
      req.body.categoryPortions,
    );
    res.status(200).json({ message: "Asset Categories updated." });
  } catch (e) {
    next(e);
  }
};

export const addCategory = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { categoryId } = req.body;
    const customCategoryInfo = req.body.customCategoryInfo || req.body;
    await portfolioService.addCategory(
      req.user!.portfolioId!,
      categoryId,
      customCategoryInfo,
    );
    res.status(201).json({ message: "Asset Category added." });
  } catch (e) {
    next(e);
  }
};

export const deleteCategory = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    await portfolioService.deleteCategory(
      req.user!.portfolioId!,
      Number(req.params.categoryId),
    );
    res.status(200).json({ message: "Asset Category deleted." });
  } catch (e) {
    next(e);
  }
};

export const patchCategory = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const categoryInfo = req.body.categoryInfo || req.body;
    await portfolioService.updateCategoryInfo(
      Number(req.params.categoryId),
      categoryInfo,
    );
    res.status(200).json({ message: "Asset Category info updated." });
  } catch (e) {
    next(e);
  }
};

export const getAvailableCategories = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const categories = await portfolioService.getAvailableCategories(
      req.user!.portfolioId!,
    );
    res.status(200).json(categories);
  } catch (e) {
    next(e);
  }
};

// === 자산군 내 하위 자산 ===
export const getItemsRelative = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const items = await portfolioService.getItemsRelative(
      Number(req.params.categoryId),
    );
    res.status(200).json(items);
  } catch (e) {
    next(e);
  }
};

export const updateItemRelativePortions = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    await portfolioService.updateItemRelativePortions(
      Number(req.params.categoryId),
      req.body.itemPortions,
    );
    res.status(200).json({ message: "Relative portions updated." });
  } catch (e) {
    next(e);
  }
};

export const addItem = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { masterItemId } = req.body;
    const customItemInfo = req.body.customItemInfo || req.body;
    await portfolioService.addItem(
      Number(req.params.categoryId),
      masterItemId,
      customItemInfo,
    );
    res.status(201).json({ message: "Asset added." });
  } catch (e) {
    next(e);
  }
};

export const getAvailableItems = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const list = await portfolioService.getAvailableItems(
      Number(req.params.categoryId),
    );
    res.status(200).json(list);
  } catch (e) {
    next(e);
  }
};

// === 개별 하위 자산 ===
export const getItemsAbsolute = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const items = await portfolioService.getItemsAbsolute(
      req.user!.portfolioId!,
    );
    res.status(200).json(items);
  } catch (e) {
    next(e);
  }
};

export const updateItemAbsolutePortions = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    await portfolioService.updateItemAbsolutePortions(
      req.user!.portfolioId!,
      req.body.itemPortions,
    );
    res.status(200).json({ message: "Absolute portions updated." });
  } catch (e) {
    next(e);
  }
};

export const deleteItem = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    await portfolioService.deleteItem(Number(req.params.itemId));
    res.status(200).json({ message: "Asset Item deleted." });
  } catch (e) {
    next(e);
  }
};

export const patchItem = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const itemInfo = req.body.itemInfo || req.body;
    await portfolioService.updateItemInfo(Number(req.params.itemId), itemInfo);
    res.status(200).json({ message: "Asset Item info updated." });
  } catch (e) {
    next(e);
  }
};
