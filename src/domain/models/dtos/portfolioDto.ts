export type ExpectedReturn = {
  min: number;
  max: number;
};

export type PortfolioItemDto = {
  id: number;
  categoryId: number;
  name: string;
  description: string;
  portion: number; // 자산의 절대 비중
  expectedReturn: ExpectedReturn;
  isCustomReturn: boolean;
  isCustom: boolean;
};

export type PortfolioAvailableItemDto = Pick<
  PortfolioItemDto,
  "id" | "categoryId" | "name" | "description" | "expectedReturn"
>;

export type PortfolioCategoryDto = {
  id: number;
  code: string;
  name: string;
  description: string;
  portion: number;
};

export type PortfolioAvailableCategoryDto = Pick<
  PortfolioCategoryDto,
  "id" | "name" | "description"
>;

export type PortfolioDto = {
  id: number;
  name: string;
  description: string;
  categories: PortfolioCategoryDto[];
  items: PortfolioItemDto[];
  expectedReturn: ExpectedReturn;
  isCustomized: boolean;
  updatedAt: string;
};

export type PortfolioPresetDto = {
  code: string;
  name: string;
  description: string;
  categories: Pick<PortfolioCategoryDto, "name" | "portion">[];
  targetReturnPercent: number;
  expectedReturn: ExpectedReturn;
};
