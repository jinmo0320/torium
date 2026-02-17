import { PortfolioDeps } from "../portfolio.service";
import { ExpectedReturn, Portfolio } from "../../domain/portfolio.entity";
import { isValidPortions } from "../../domain/portfolio.logic";

import {
  AddItemReqDto,
  DeleteItemReqDto,
  UpdateItemAbsolutePortionsReqDto,
  UpdateItemInfoReqDto,
  UpdateItemRelativePortionsReqDto,
} from "../portfolio.dto";
import { DomainError } from "src/shared/errors/error";
import { ErrorCodes } from "src/shared/errors/errorCodes";

/**
 * 포트폴리오 내 모든 하위 자산 목록 조회 (절대 비중 포함)
 */
type GetItemsAbsoluteUsecase = (
  portfolioId: number,
) => Promise<Portfolio.Item[]>;

export const createGetItemsAbsolute =
  ({ portfolioRepository }: PortfolioDeps): GetItemsAbsoluteUsecase =>
  async (portfolioId) =>
    await portfolioRepository.getItems(portfolioId);

/**
 * 특정 자산군 내에 속한 하위 자산 목록 조회 (해당 자산군 내 상대 비중으로 계산됨)
 */
type GetItemsRelativeUsecase = (
  categoryId: number,
) => Promise<Portfolio.Item[]>;

export const createGetItemsRelative =
  ({ portfolioRepository }: PortfolioDeps): GetItemsRelativeUsecase =>
  async (categoryId) =>
    await portfolioRepository.getItemsByCategory(categoryId);

/**
 * 하위 자산들의 전체 포트폴리오 대비 절대 비중 업데이트
 */
type UpdateItemAbsolutePortionsUsecase = ({
  portfolioId,
  portions,
}: UpdateItemAbsolutePortionsReqDto) => Promise<void>;

export const createUpdateItemAbsolutePortions =
  ({ portfolioRepository }: PortfolioDeps): UpdateItemAbsolutePortionsUsecase =>
  async ({ portfolioId, portions }) => {
    if (!isValidPortions(portions)) {
      throw new DomainError(
        ErrorCodes.PORTFOLIO.INVALID_PORTIONS,
        "전체 자산의 절대 비중 합은 100%여야 합니다.",
      );
    }
    return await portfolioRepository.updateItemAbsolutePortions(
      portfolioId,
      portions,
    );
  };

/**
 * 특정 자산군 내 하위 자산들의 상대 비중 업데이트
 * @errors INVALID_PORTIONS (상대 비중 합계가 100%가 아닐 때)
 */
type UpdateItemRelativePortionsUsecase = ({
  categoryId,
  portions,
}: UpdateItemRelativePortionsReqDto) => Promise<void>;

export const createUpdateItemRelativePortions =
  ({ portfolioRepository }: PortfolioDeps): UpdateItemRelativePortionsUsecase =>
  async ({ categoryId, portions }) => {
    if (!isValidPortions(portions))
      throw new DomainError(
        ErrorCodes.PORTFOLIO.INVALID_PORTIONS,
        "해당 자산군 내 상대 비중 합은 100%여야 합니다.",
      );
    return await portfolioRepository.updateItemRelativePortions(
      categoryId,
      portions,
    );
  };

/**
 * 자산군 내 새로운 하위 자산 추가
 * @errors INVALID_DATA_FOR_ADDING_ITEM
 */
type AddItemUsecase = ({
  categoryId,
  masterItemId,
  customItemInfo,
}: AddItemReqDto) => Promise<void>;

export const createAddItem =
  ({ portfolioRepository }: PortfolioDeps): AddItemUsecase =>
  async ({ categoryId, masterItemId, customItemInfo }) => {
    if (!(masterItemId ?? customItemInfo))
      throw new DomainError(
        ErrorCodes.PORTFOLIO.INVALID_DATA_FOR_ADDING_ITEM,
        "Invalid data for adding asset item.",
      );
    return await portfolioRepository.addItem(
      categoryId,
      masterItemId,
      customItemInfo,
    );
  };

/**
 * 하위 자산 삭제
 */
type DeleteItemUsecase = ({
  portfolioId,
  itemId,
}: DeleteItemReqDto) => Promise<void>;

export const createDeleteItem =
  ({ portfolioRepository }: PortfolioDeps): DeleteItemUsecase =>
  async ({ portfolioId, itemId }) =>
    await portfolioRepository.deleteItem(portfolioId, itemId);

/**
 * 하위 자산 상세 정보 및 기대 수익률 수정
 */
type UpdateItemInfoUsecase = ({
  itemId,
  itemInfo,
}: UpdateItemInfoReqDto) => Promise<void>;

export const createUpdateItemInfo =
  ({ portfolioRepository }: PortfolioDeps): UpdateItemInfoUsecase =>
  async ({ itemId, itemInfo }) =>
    await portfolioRepository.updateItemInfo(itemId, itemInfo);

/**
 * 특정 자산군 내에서 추가 가능한 마스터 자산 목록 조회
 */
type GetAvailableItemsUsecase = (
  categoryId: number,
) => Promise<Portfolio.AvailableItem[]>;

export const createGetAvailableItems =
  ({ portfolioRepository }: PortfolioDeps): GetAvailableItemsUsecase =>
  async (categoryId) =>
    await portfolioRepository.getAvailableItems(categoryId);
