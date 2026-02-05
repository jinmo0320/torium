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
  const portfolio = await portfolioService.getPortfolio(req.user!.id);
  res.status(200).json(portfolio);
};

export const getRecommendations = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const presets = await portfolioService.getRecommendations(req.user!.id);
  res.status(200).json(presets);
};

export const createFromPreset = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { presetCode } = req.body; // 프론트에서 선택한 프리셋 코드
  await portfolioService.createFromPreset(req.user!.id, presetCode);
  res
    .status(201)
    .json({ message: "Portfolio created from preset successfully." });
};

// === 자산군 ===
export const getCategories = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const categories = await portfolioService.getCategories(
    req.user!.portfolioId!,
  );
  res.status(200).json(categories);
};

export const updateCategoryPortions = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  await portfolioService.updateCategoryPortions(
    req.user!.portfolioId!,
    req.body.categoryPortions,
  );
  res.status(200).json({ message: "Asset Categories updated." });
};

export const addCategory = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { categoryId } = req.body;
  const customCategoryInfo = req.body.customCategoryInfo || req.body;
  await portfolioService.addCategory(
    req.user!.portfolioId!,
    categoryId,
    customCategoryInfo,
  );
  res.status(201).json({ message: "Asset Category added." });
};

export const deleteCategory = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  await portfolioService.deleteCategory(
    req.user!.portfolioId!,
    Number(req.params.categoryId),
  );
  res.status(200).json({ message: "Asset Category deleted." });
};

export const patchCategory = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const categoryInfo = req.body.categoryInfo || req.body;
  await portfolioService.updateCategoryInfo(
    Number(req.params.categoryId),
    categoryInfo,
  );
  res.status(200).json({ message: "Asset Category info updated." });
};

export const getAvailableCategories = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const categories = await portfolioService.getAvailableCategories(
    req.user!.portfolioId!,
  );
  res.status(200).json(categories);
};

// === 자산군 내 하위 자산 ===
export const getItemsRelative = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const items = await portfolioService.getItemsRelative(
    Number(req.params.categoryId),
  );
  res.status(200).json(items);
};

export const updateItemRelativePortions = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  await portfolioService.updateItemRelativePortions(
    Number(req.params.categoryId),
    req.body.itemPortions,
  );
  res.status(200).json({ message: "Relative portions updated." });
};

export const addItem = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { masterItemId } = req.body;
  const customItemInfo = req.body.customItemInfo || req.body;
  await portfolioService.addItem(
    Number(req.params.categoryId),
    masterItemId,
    customItemInfo,
  );
  res.status(201).json({ message: "Asset added." });
};

export const getAvailableItems = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const list = await portfolioService.getAvailableItems(
    Number(req.params.categoryId),
  );
  res.status(200).json(list);
};

// === 개별 하위 자산 ===
export const getItemsAbsolute = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const items = await portfolioService.getItemsAbsolute(req.user!.portfolioId!);
  res.status(200).json(items);
};

export const updateItemAbsolutePortions = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  await portfolioService.updateItemAbsolutePortions(
    req.user!.portfolioId!,
    req.body.itemPortions,
  );
  res.status(200).json({ message: "Absolute portions updated." });
};

export const deleteItem = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  await portfolioService.deleteItem(
    req.user!.portfolioId!,
    Number(req.params.itemId),
  );
  res.status(200).json({ message: "Asset Item deleted." });
};

export const patchItem = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const itemInfo = req.body.itemInfo || req.body;
  await portfolioService.updateItemInfo(Number(req.params.itemId), itemInfo);
  res.status(200).json({ message: "Asset Item info updated." });
};
