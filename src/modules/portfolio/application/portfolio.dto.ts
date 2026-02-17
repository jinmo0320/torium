import { UUID } from "crypto";
import { ExpectedReturn } from "../domain/portfolio.entity";

export type CreateFromPresetReqDto = {
  userId: UUID;
  presetCode: string;
};

export type UpdateCategoryPortionsReqDto = {
  portfolioId: number;
  portions: { id: number; portion: number }[];
};

export type AddCategoryReqDto = {
  portfolioId: number;
  masterCategoryId?: number;
  customCategoryInfo?: { name: string; description: string };
};

export type DeleteCategoryReqDto = {
  portfolioId: number;
  categoryId: number;
};

export type PatchCategoryReqDto = {
  categoryId: number;
  categoryInfo: { name?: string; description?: string };
};

export type UpdateItemRelativePortionsReqDto = {
  categoryId: number;
  portions: { id: number; portion: number }[];
};

export type AddItemReqDto = {
  categoryId: number;
  masterItemId?: number;
  customItemInfo?: {
    name: string;
    description: string;
    expectedReturn: ExpectedReturn;
  };
};

export type UpdateItemAbsolutePortionsReqDto = {
  portfolioId: number;
  portions: { id: number; portion: number }[];
};

export type DeleteItemReqDto = {
  portfolioId: number;
  itemId: number;
};

export type UpdateItemInfoReqDto = {
  itemId: number;
  itemInfo: {
    name?: string;
    description?: string;
    expectedReturn?: ExpectedReturn;
  };
};
