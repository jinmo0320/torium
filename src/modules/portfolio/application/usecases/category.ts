import { PortfolioDeps } from "../portfolio.service";
import { Portfolio } from "../../domain/portfolio.entity";
import { isValidPortions } from "../../domain/portfolio.logic";

import { DomainError } from "src/shared/errors/error";
import { ErrorCodes } from "src/shared/errors/errorCodes";

/**
 * 포트폴리오 내 자산군 목록 조회
 */
type GetCategoriesUsecase = (
  portfolioId: number,
) => Promise<Portfolio.Category[]>;

export const createGetCategories =
  ({ portfolioRepository }: PortfolioDeps): GetCategoriesUsecase =>
  async (portfolioId) =>
    await portfolioRepository.getCategories(portfolioId);

/**
 * 자산군들 간의 비중 업데이트 및 하위 자산 비중 전파
 * @errors INVALID_PORTIONS (합계가 100%가 아닐 때)
 */
type UpdateCategoryPortionsUsecase = (
  portfolioId: number,
  portions: { id: number; portion: number }[],
) => Promise<void>;

export const createUpdateCategoryPortions =
  ({ portfolioRepository }: PortfolioDeps): UpdateCategoryPortionsUsecase =>
  async (portfolioId, portions) => {
    if (!isValidPortions(portions))
      throw new DomainError(
        ErrorCodes.PORTFOLIO.INVALID_PORTIONS,
        "자산군 비중 합은 100%여야 합니다.",
      );
    return await portfolioRepository.updateCategoryPortions(
      portfolioId,
      portions,
    );
  };

/**
 * 새로운 자산군 추가 (마스터 카테고리 기반 혹은 커스텀)
 */
type AddCategoryUsecase = (
  portfolioId: number,
  masterCategoryId?: number,
  customCategoryInfo?: { name: string; description: string },
) => Promise<void>;

export const createAddCategory =
  ({ portfolioRepository }: PortfolioDeps): AddCategoryUsecase =>
  async (portfolioId, categoryId, customCategoryInfo) => {
    if (!(categoryId ?? customCategoryInfo))
      throw new DomainError(
        ErrorCodes.PORTFOLIO.INVALID_DATA_FOR_ADDING_CATEGORY,
        "Invalid data for adding category.",
      );
    return await portfolioRepository.addCategory(
      portfolioId,
      categoryId,
      customCategoryInfo,
    );
  };

/**
 * 자산군 삭제 (하위 자산도 함께 삭제됨)
 */
type DeleteCategoryUsecase = (
  portfolioId: number,
  categoryId: number,
) => Promise<void>;

export const createDeleteCategory =
  ({ portfolioRepository }: PortfolioDeps): DeleteCategoryUsecase =>
  async (portfolioId, categoryId) =>
    await portfolioRepository.deleteCategory(portfolioId, categoryId);

/**
 * 자산군 이름/설명 수정
 */
type UpdateCategoryInfoUsecase = (
  categoryId: number,
  categoryInfo: { name?: string; description?: string },
) => Promise<void>;

export const createUpdateCategoryInfo =
  ({ portfolioRepository }: PortfolioDeps): UpdateCategoryInfoUsecase =>
  async (id, categoryInfo) =>
    await portfolioRepository.updateCategoryInfo(id, categoryInfo);

/**
 * 유저가 아직 추가하지 않은 선택 가능한 마스터 자산군 목록 조회
 */
type GetAvailableCategoriesUsecase = (
  portfolioId: number,
) => Promise<Portfolio.AvailableCategory[]>;

export const createGetAvailableCategories =
  ({ portfolioRepository }: PortfolioDeps): GetAvailableCategoriesUsecase =>
  async (portfolioId) =>
    await portfolioRepository.getAvailableCategories(portfolioId);
