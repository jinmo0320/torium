export interface ExpectedReturn {
  min: number;
  max: number;
}

export interface PortfolioItemDto {
  id: number;
  categoryId: number;
  name: string;
  description: string;
  portion: number; // 자산의 절대 비중
  expectedReturn: ExpectedReturn;
  isCustomReturn: boolean;
  isCustom: boolean;
}

export interface PortfolioAvailableItemDto {
  id: number;
  categoryId: number;
  name: string;
  description: string;
  expectedReturn: ExpectedReturn;
}

export interface PortfolioCategoryDto {
  id: number;
  code: string;
  name: string;
  description: string;
  portion: number;
}

export interface PortfolioAvailableCategoryDto {
  id: number;
  name: string;
  description: string;
}

export interface PortfolioDto {
  id: number;
  name: string;
  description: string;
  categories: PortfolioCategoryDto[];
  items: PortfolioItemDto[];
  expectedReturn: ExpectedReturn;
  isCustomized: boolean;
  updatedAt: string;
}

export interface PortfolioPresetDto {
  code: string;
  name: string;
  description: string;
  targetReturnPercent: number;
  expectedReturn: ExpectedReturn;
}
