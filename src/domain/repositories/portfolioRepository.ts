import { UUID } from "crypto";
import { PortfolioDto, PortfolioPresetDto } from "../models/dtos/portfolioDto";

export type PortfolioRepository = {
  // 전체 & 추천
  getPortfolioByUserId: (userId: UUID) => Promise<PortfolioDto | null>;
  findPresetsByReturn: (targetReturn: number) => Promise<PortfolioPresetDto[]>;
  createPortfolioFromPreset: (
    userId: UUID,
    presetCode: string,
  ) => Promise<void>;

  // 카테고리(Category) 관련
  getCategories: (portfolioId: number) => Promise<any[]>;
  updateCategoryPortions: (
    portfolioId: number,
    portions: { id: number; portion: number }[],
  ) => Promise<void>;
  addCategory: (
    portfolioId: number,
    masterCategoryId: number | null,
    customData?: any,
  ) => Promise<void>;
  deleteCategory: (portfolioId: number, categoryId: number) => Promise<void>;
  updateCategoryInfo: (
    categoryId: number,
    name?: string,
    description?: string,
  ) => Promise<void>;
  getAvailableCategories: (portfolioId: number) => Promise<any[]>;

  // 아이템(Item) 관련
  getItems: (portfolioId: number) => Promise<any[]>;
  getItemsByCategory: (categoryId: number) => Promise<any[]>;
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
    masterItemId: number | null,
    customData?: any,
  ) => Promise<void>;
  deleteItem: (itemId: number) => Promise<void>;
  updateItemInfo: (itemId: number, data: any) => Promise<void>;
  getAvailableItems: (categoryId: number) => Promise<any[]>;
};
