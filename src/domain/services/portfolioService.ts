import { UUID } from "crypto";
import { PortfolioRepository } from "../repositories/portfolioRepository";
import { InvestmentProfileRepository } from "../repositories/investmentProfileRepository";
import { HttpException } from "../errors/error";
import { ErrorCode } from "../errors/errorCodes";
import {
  ExpectedReturn,
  PortfolioAvailableCategoryDto,
  PortfolioAvailableItemDto,
  PortfolioCategoryDto,
  PortfolioDto,
  PortfolioItemDto,
  PortfolioPresetDto,
} from "../models/dtos/portfolioDto";

export type PortfolioService = {
  // ==========================================
  // 1. 전체 & 추천 (Global & Recommendations)
  // ==========================================

  /**
   * 유저의 포트폴리오 전체 데이터 조회
   * @param userId user id
   */
  getPortfolio: (userId: UUID) => Promise<PortfolioDto | null>;

  /**
   * 유저의 투자 계획(목표 수익률)에 기반한 추천 프리셋 리스트 조회
   * @param userId user id
   */
  getRecommendations: (userId: UUID) => Promise<PortfolioPresetDto[]>;

  /**
   * 프리셋 코드를 기반으로 유저의 포트폴리오 초기 생성/복제
   * @param userId user id
   * @param presetCode 프리셋 식별 코드
   */
  createFromPreset: (userId: UUID, presetCode: string) => Promise<void>;

  // ==========================================
  // 2. 자산군(Category) 관련
  // ==========================================

  /**
   * 포트폴리오 내 자산군 목록 조회
   */
  getCategories: (portfolioId: number) => Promise<PortfolioCategoryDto[]>;

  /**
   * 자산군들 간의 비중 업데이트 및 하위 자산 비중 전파
   * @errors INVALID_PORTIONS (합계가 100%가 아닐 때)
   */
  updateCategoryPortions: (
    portfolioId: number,
    portions: { id: number; portion: number }[],
  ) => Promise<void>;

  /**
   * 새로운 자산군 추가 (마스터 카테고리 기반 혹은 커스텀)
   */
  addCategory: (
    portfolioId: number,
    masterCategoryId?: number,
    customCategoryInfo?: { name: string; description: string },
  ) => Promise<void>;

  /**
   * 자산군 삭제 (하위 자산도 함께 삭제됨)
   */
  deleteCategory: (portfolioId: number, categoryId: number) => Promise<void>;

  /**
   * 자산군 이름/설명 수정
   */
  updateCategoryInfo: (
    categoryId: number,
    categoryInfo: { name?: string; description?: string },
  ) => Promise<void>;

  /**
   * 유저가 아직 추가하지 않은 선택 가능한 마스터 자산군 목록 조회
   */
  getAvailableCategories: (
    portfolioId: number,
  ) => Promise<PortfolioAvailableCategoryDto[]>;

  // ==========================================
  // 3. 하위자산(Item) 관련
  // ==========================================

  /**
   * 포트폴리오 내 모든 하위 자산 목록 조회 (절대 비중 포함)
   */
  getItemsAbsolute: (portfolioId: number) => Promise<PortfolioItemDto[]>;

  /**
   * 특정 자산군 내에 속한 하위 자산 목록 조회 (해당 자산군 내 상대 비중으로 계산됨)
   */
  getItemsRelative: (categoryId: number) => Promise<PortfolioItemDto[]>;

  /**
   * 하위 자산들의 전체 포트폴리오 대비 절대 비중 업데이트
   */
  updateItemAbsolutePortions: (
    portfolioId: number,
    portions: { id: number; portion: number }[],
  ) => Promise<void>;

  /**
   * 특정 자산군 내 하위 자산들의 상대 비중 업데이트
   * @errors INVALID_PORTIONS (상대 비중 합계가 100%가 아닐 때)
   */
  updateItemRelativePortions: (
    categoryId: number,
    portions: { id: number; portion: number }[],
  ) => Promise<void>;

  /**
   * 자산군 내 새로운 하위 자산 추가
   * @errors INVALID_DATA_FOR_ADDING_ITEM
   */
  addItem: (
    categoryId: number,
    masterItemId?: number,
    customItemInfo?: {
      name: string;
      description: string;
      expectedReturn: ExpectedReturn;
    },
  ) => Promise<void>;

  /**
   * 하위 자산 삭제
   */
  deleteItem: (portfolioId: number, itemId: number) => Promise<void>;

  /**
   * 하위 자산 상세 정보 및 기대 수익률 수정
   */
  updateItemInfo: (
    itemId: number,
    itemInfo: {
      name?: string;
      description?: string;
      expectedReturn?: ExpectedReturn;
    },
  ) => Promise<void>;

  /**
   * 특정 자산군 내에서 추가 가능한 마스터 자산 목록 조회
   */
  getAvailableItems: (
    categoryId: number,
  ) => Promise<PortfolioAvailableItemDto[]>;
};

export const createPortfolioService = (
  portfolioRepository: PortfolioRepository,
  investmentProfileRepository: InvestmentProfileRepository,
): PortfolioService => ({
  // 전체 & 추천
  getPortfolio: async (userId) =>
    await portfolioRepository.getPortfolioByUserId(userId),
  getRecommendations: async (userId) => {
    const {
      plan: { expectedReturn },
    } = await investmentProfileRepository.getProfile(userId);
    return await portfolioRepository.findPresetsByReturn(expectedReturn * 100);
  },
  createFromPreset: async (userId, presetCode) =>
    await portfolioRepository.createPortfolioFromPreset(userId, presetCode),

  // 자산군 관련
  getCategories: async (portfolioId) =>
    await portfolioRepository.getCategories(portfolioId),
  updateCategoryPortions: async (portfolioId, portions) => {
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
  addCategory: async (portfolioId, categoryId, customCategoryInfo) => {
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
  deleteCategory: async (portfolioId, categoryId) =>
    await portfolioRepository.deleteCategory(portfolioId, categoryId),
  updateCategoryInfo: async (id, categoryInfo) =>
    await portfolioRepository.updateCategoryInfo(id, categoryInfo),
  getAvailableCategories: async (portfolioId) =>
    await portfolioRepository.getAvailableCategories(portfolioId),

  // 하위 자산 관련
  getItemsAbsolute: async (portfolioId) =>
    await portfolioRepository.getItems(portfolioId),
  getItemsRelative: async (categoryId) =>
    await portfolioRepository.getItemsByCategory(categoryId),
  updateItemAbsolutePortions: async (portfolioId, portions) => {
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
  updateItemRelativePortions: async (categoryId, portions) => {
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
  addItem: async (categoryId, masterItemId, customItemInfo) => {
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
  deleteItem: async (portfolioId, itemId) =>
    await portfolioRepository.deleteItem(portfolioId, itemId),
  updateItemInfo: async (itemId, itemInfo) =>
    await portfolioRepository.updateItemInfo(itemId, itemInfo),
  getAvailableItems: async (categoryId) =>
    await portfolioRepository.getAvailableItems(categoryId),
});
