export interface ExpectedReturn {
  min: number;
  max: number;
}

export interface PortfolioItemDto {
  id: number;
  categoryId: number; // 부모 Category의 ID
  name: string;
  description: string;
  portion: number; // 절대/상대 비중
  expectedReturn: ExpectedReturn;
  isCustomReturn: boolean;
  isCustom: boolean;
}

export interface PortfolioCategoryDto {
  id: number;
  categoryCode: string; // EQUITY, BOND, CUSTOM 등
  name: string;
  description: string;
  portion: number;
}

export interface PortfolioDto {
  id: number;
  name: string;
  description: string;
  categories: PortfolioCategoryDto[];
  items: PortfolioItemDto[];
  totalExpectedReturn: ExpectedReturn;
  isCustomized: boolean;
  updatedAt: string;
}

export interface PortfolioPresetDto {
  presetCode: string;
  name: string;
  description: string;
  targetReturnPercent: number;
  expectedReturn: ExpectedReturn;
}
