import { Request, Response, NextFunction } from "express";
import { createPortfolioService } from "src/domain/services/portfolioService";
import { createPortfolioRepository } from "src/data/repositories/portfolioRepositoryImpl";

const portfolioService = createPortfolioService(createPortfolioRepository());

/** === 포폴 전체 === */
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

// 쿼리 말고 사용자 슁ㄱ률 ㅏㄱ져ㅛ와소 한 걸로 바꿀거임
export const getRecommendations = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { targetReturn } = req.query;
    const presets = await portfolioService.getRecommendations(
      Number(targetReturn),
    );
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

/** === 자산군 === */
export const getCategories = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const portfolio = await portfolioService.getPortfolio(req.user!.id);
    const categories = await portfolioService.getCategories(portfolio!.id);
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
    const portfolio = await portfolioService.getPortfolio(req.user!.id);
    await portfolioService.updateCategoryPortions(
      portfolio!.id,
      req.body.assetCategories,
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
    const portfolio = await portfolioService.getPortfolio(req.user!.id);
    const { assetCategoryId } = req.body;

    const customData = req.body.customData || req.body;
    await portfolioService.addCategory(
      portfolio!.id,
      assetCategoryId,
      customData,
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
    const portfolio = await portfolioService.getPortfolio(req.user!.id);
    await portfolioService.deleteCategory(
      portfolio!.id,
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
    const { name, description } = req.body;
    await portfolioService.updateCategoryInfo(
      Number(req.params.categoryId),
      name,
      description,
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
    const portfolio = await portfolioService.getPortfolio(req.user!.id);
    const categories = await portfolioService.getAvailableCategories(
      portfolio!.id,
    );
    res.status(200).json(categories);
  } catch (e) {
    next(e);
  }
};

/** === 하위자산 === */
export const getItemsAbsolute = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const portfolio = await portfolioService.getPortfolio(req.user!.id);
    const items = await portfolioService.getItemsAbsolute(portfolio!.id);
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
    const portfolio = await portfolioService.getPortfolio(req.user!.id);
    await portfolioService.updateItemAbsolutePortions(
      portfolio!.id,
      req.body.assetItems,
    );
    res.status(200).json({ message: "Absolute portions updated." });
  } catch (e) {
    next(e);
  }
};

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
      req.body.assets,
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
    const { assetCategoryId, masterAssetItemId } = req.body;
    const customData = req.body.customData || req.body;
    await portfolioService.addItem(
      assetCategoryId,
      masterAssetItemId,
      customData,
    );
    res.status(201).json({ message: "Asset added." });
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
    await portfolioService.updateItemInfo(Number(req.params.itemId), req.body);
    res.status(200).json({ message: "Asset Item info updated." });
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
      // 쿼리로 특정하지 말고 그냥 모든 자산군 볼 수 있게
      Number(req.query.assetCategoryId),
    );
    res.status(200).json(list);
  } catch (e) {
    next(e);
  }
};
