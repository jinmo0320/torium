import { UUID } from "crypto";
import { PortfolioRepository } from "../repositories/portfolioRepository";
import { HttpException } from "../errors/error";
import { ErrorCode } from "../errors/errorCodes";

export const createPortfolioService = (
  portfolioRepository: PortfolioRepository,
) => ({
  // 전체 & 추천
  getPortfolio: async (userId: UUID) =>
    await portfolioRepository.getPortfolioByUserId(userId),
  getRecommendations: async (targetReturn: number) =>
    await portfolioRepository.findPresetsByReturn(targetReturn),
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
    // 자산군 비중 0으로 만들었다가 다시 0 이상의 값으로 수정하면 하위 자산의 비율 복구 안 됨
    return await portfolioRepository.updateCategoryPortions(
      portfolioId,
      portions,
    );
  },
  // 커스텀 데이터 타입 지정하자....
  addCategory: async (
    portfolioId: number,
    categoryId: number | null,
    customData?: any,
  ) =>
    await portfolioRepository.addCategory(portfolioId, categoryId, customData),
  deleteCategory: async (portfolioId: number, categoryId: number) =>
    await portfolioRepository.deleteCategory(portfolioId, categoryId),
  updateCategoryInfo: async (id: number, name?: string, description?: string) =>
    await portfolioRepository.updateCategoryInfo(id, name, description),
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
    masterItemId: number | null,
    customData?: any,
  ) => await portfolioRepository.addItem(categoryId, masterItemId, customData),
  deleteItem: async (itemId: number) =>
    await portfolioRepository.deleteItem(itemId),
  updateItemInfo: async (itemId: number, data: any) =>
    await portfolioRepository.updateItemInfo(itemId, data),
  getAvailableItems: async (categoryId: number) =>
    await portfolioRepository.getAvailableItems(categoryId),
});
