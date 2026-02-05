import { UUID } from "crypto";
import {
  PortfolioDto,
  PortfolioPresetDto,
  PortfolioCategoryDto,
  PortfolioAvailableCategoryDto,
  PortfolioItemDto,
  PortfolioAvailableItemDto,
  ExpectedReturn,
} from "../models/dtos/portfolioDto";

export type PortfolioRepository = {
  // 전체 & 추천
  getPortfolioByUserId: (userId: UUID) => Promise<PortfolioDto | null>;
  findPresetsByReturn: (
    targetReturnPercent: number,
  ) => Promise<PortfolioPresetDto[]>;
  createPortfolioFromPreset: (
    userId: UUID,
    presetCode: string,
  ) => Promise<void>;

  // 자산군 관련
  getCategories: (portfolioId: number) => Promise<PortfolioCategoryDto[]>;
  updateCategoryPortions: (
    portfolioId: number,
    portions: { id: number; portion: number }[],
  ) => Promise<void>;
  addCategory: (
    portfolioId: number,
    masterCategoryId?: number,
    customCategoryInfo?: { name: string; description: string },
  ) => Promise<void>;
  deleteCategory: (portfolioId: number, categoryId: number) => Promise<void>;
  updateCategoryInfo: (
    categoryId: number,
    categoryInfo: { name?: string; description?: string },
  ) => Promise<void>;
  getAvailableCategories: (
    portfolioId: number,
  ) => Promise<PortfolioAvailableCategoryDto[]>;

  // 하위자산 관련
  getItems: (portfolioId: number) => Promise<PortfolioItemDto[]>;
  getItemsByCategory: (categoryId: number) => Promise<PortfolioItemDto[]>;
  updateItemAbsolutePortions: (
    portfolioId: number,
    portions: { id: number; portion: number }[],
  ) => Promise<void>;
  updateItemRelativePortions: (
    categoryId: number,
    portions: { id: number; portion: number }[],
  ) => Promise<void>;
  addItem: (
    categoryId: number,
    masterItemId?: number,
    customItemInfo?: {
      name: string;
      description: string;
      expectedReturn: ExpectedReturn;
    },
  ) => Promise<void>;
  deleteItem: (portfolioId: number, itemId: number) => Promise<void>;
  updateItemInfo: (
    itemId: number,
    itemInfo: {
      name?: string;
      description?: string;
      expectedReturn?: ExpectedReturn;
    },
  ) => Promise<void>;
  getAvailableItems: (
    categoryId: number,
  ) => Promise<PortfolioAvailableItemDto[]>;
};
