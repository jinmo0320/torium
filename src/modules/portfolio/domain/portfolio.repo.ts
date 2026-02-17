import { UUID } from "crypto";
import { Portfolio, ExpectedReturn } from "../domain/portfolio.entity";

export type PortfolioRepository = {
  // 전체 & 추천
  getPortfolioByUserId: (userId: UUID) => Promise<Portfolio.Root | null>;
  findPresetsByReturn: (
    targetReturnPercent: number,
  ) => Promise<Portfolio.Preset[]>;
  createPortfolioFromPreset: (
    userId: UUID,
    presetCode: string,
  ) => Promise<void>;

  // 자산군 관련
  getCategories: (portfolioId: number) => Promise<Portfolio.Category[]>;
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
  ) => Promise<Portfolio.AvailableCategory[]>;

  // 하위자산 관련
  getItems: (portfolioId: number) => Promise<Portfolio.Item[]>;
  getItemsByCategory: (categoryId: number) => Promise<Portfolio.Item[]>;
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
  getAvailableItems: (categoryId: number) => Promise<Portfolio.AvailableItem[]>;
};
