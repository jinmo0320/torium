import { PortfolioRepository } from "../domain/portfolio.repo";
import { InvProfileRepository } from "src/modules/investmentProfile/domain/invProfile.repo";

import * as Usecases from "./usecases";

export type PortfolioDeps = {
  portfolioRepository: PortfolioRepository;
  invProfileRepository: InvProfileRepository;
};

export const createPortfolioService = (deps: PortfolioDeps) => ({
  getPortfolio: Usecases.createGetPortfolio(deps),
  getRecommendations: Usecases.createGetRecommendations(deps),
  createFromPreset: Usecases.createCreateFromPreset(deps),

  getCategories: Usecases.createGetCategories(deps),
  updateCategoryPortions: Usecases.createUpdateCategoryPortions(deps),
  addCategory: Usecases.createAddCategory(deps),
  deleteCategory: Usecases.createDeleteCategory(deps),
  updateCategoryInfo: Usecases.createUpdateCategoryInfo(deps),
  getAvailableCategories: Usecases.createGetAvailableCategories(deps),

  getItemsAbsolute: Usecases.createGetItemsAbsolute(deps),
  getItemsRelative: Usecases.createGetItemsRelative(deps),
  updateItemAbsolutePortions: Usecases.createUpdateItemAbsolutePortions(deps),
  updateItemRelativePortions: Usecases.createUpdateItemRelativePortions(deps),
  addItem: Usecases.createAddItem(deps),
  deleteItem: Usecases.createDeleteItem(deps),
  updateItemInfo: Usecases.createUpdateItemInfo(deps),
  getAvailableItems: Usecases.createGetAvailableItems(deps),
});

export type PortfolioService = ReturnType<typeof createPortfolioService>;
