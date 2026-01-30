import { UUID } from "crypto";
import { PortfolioRepository } from "../repositories/portfolioRepository";
import { InvestmentProfileRepository } from "../repositories/investmentProfileRepository";
import { HttpException } from "../errors/error";
import { ErrorCode } from "../errors/errorCodes";
import { ExpectedReturn } from "../models/dtos/portfolioDto";

export const createPortfolioService = (
  portfolioRepository: PortfolioRepository,
  investmentProfileRepository: InvestmentProfileRepository,
) => ({
  // 전체 & 추천
  getPortfolio: async (userId: UUID) =>
    await portfolioRepository.getPortfolioByUserId(userId),
  getRecommendations: async (userId: UUID) => {
    const {
      plan: { expectedReturnRate },
    } = await investmentProfileRepository.getProfile(userId);
    return await portfolioRepository.findPresetsByReturn(
      expectedReturnRate * 100,
    );
  },
  createFromPreset: async (userId: UUID, presetCode: string) =>
    await portfolioRepository.createPortfolioFromPreset(userId, presetCode),

  // 자산군 관련
  getCategories: async (portfolioId: number) =>
    await portfolioRepository.getCategories(portfolioId),
  updateCategoryPortions: async (
    portfolioId: number,
    portions: { id: number; portion: number }[],
  ) => {
    const total = portions.reduce((acc, p) => acc + p.portion, 0);
    if (Math.abs(total - 1.0) > 0.001)
      throw new HttpException(
        400,
        ErrorCode.INVALID_PORTIONS,
        "자산군 비중 합은 100%여야 합니다.",
      );
    return await portfolioRepository.updateCategoryPortions(
      portfolioId,
      portions,
    );
  },
  addCategory: async (
    portfolioId: number,
    categoryId?: number,
    customCategoryInfo?: { name: string; description: string },
  ) => {
    if (!(categoryId ?? customCategoryInfo))
      throw new HttpException(
        400,
        ErrorCode.INVALID_DATA_FOR_ADDING_CATEGORY,
        "Invalid data for adding category.",
      );
    return await portfolioRepository.addCategory(
      portfolioId,
      categoryId,
      customCategoryInfo,
    );
  },
  deleteCategory: async (portfolioId: number, categoryId: number) =>
    await portfolioRepository.deleteCategory(portfolioId, categoryId),
  updateCategoryInfo: async (
    id: number,
    categoryInfo: { name?: string; description?: string },
  ) => await portfolioRepository.updateCategoryInfo(id, categoryInfo),
  getAvailableCategories: async (portfolioId: number) =>
    await portfolioRepository.getAvailableCategories(portfolioId),

  // 하위자산 관련
  getItemsAbsolute: async (portfolioId: number) =>
    await portfolioRepository.getItems(portfolioId),
  getItemsRelative: async (categoryId: number) =>
    await portfolioRepository.getItemsByCategory(categoryId),
  updateItemAbsolutePortions: async (
    portfolioId: number,
    portions: { id: number; portion: number }[],
  ) => {
    const total = portions.reduce((acc, p) => acc + p.portion, 0);
    if (Math.abs(total - 1.0) > 0.001) {
      throw new HttpException(
        400,
        ErrorCode.INVALID_PORTIONS,
        "전체 자산의 절대 비중 합은 100%여야 합니다.",
      );
    }
    return await portfolioRepository.updateItemAbsolutePortions(
      portfolioId,
      portions,
    );
  },
  updateItemRelativePortions: async (
    categoryId: number,
    portions: { id: number; portion: number }[],
  ) => {
    const total = portions.reduce((acc, p) => acc + p.portion, 0);
    if (Math.abs(total - 1.0) > 0.001)
      throw new HttpException(
        400,
        ErrorCode.INVALID_PORTIONS,
        "해당 자산군 내 상대 비중 합은 100%여야 합니다.",
      );
    return await portfolioRepository.updateItemRelativePortions(
      categoryId,
      portions,
    );
  },
  addItem: async (
    categoryId: number,
    masterItemId?: number,
    customItemInfo?: {
      name: string;
      description: string;
      expectedReturn: ExpectedReturn;
    },
  ) => {
    if (!(masterItemId ?? customItemInfo))
      throw new HttpException(
        400,
        ErrorCode.INVALID_DATA_FOR_ADDING_ITEM,
        "Invalid data for adding asset item.",
      );
    return await portfolioRepository.addItem(
      categoryId,
      masterItemId,
      customItemInfo,
    );
  },
  deleteItem: async (itemId: number) =>
    await portfolioRepository.deleteItem(itemId),
  updateItemInfo: async (
    itemId: number,
    itemInfo: {
      name?: string;
      description?: string;
      expectedReturn?: ExpectedReturn;
    },
  ) => await portfolioRepository.updateItemInfo(itemId, itemInfo),
  getAvailableItems: async (categoryId: number) =>
    await portfolioRepository.getAvailableItems(categoryId),
});
