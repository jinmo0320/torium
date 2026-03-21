import { UUID } from "crypto";
import { Portfolio, ExpectedReturn } from "../domain/portfolio.entity";

export type ItemRepository = {
  /**
   * 사용자가 소유한 모든 아이템을 반환
   * @param userId 사용자 ID
   */
  getAll: (userId: UUID) => Promise<Portfolio.Item[]>;

  /**
   * 새로운 아이템을 생성
   * @param userId 사용자 ID
   * @param info 아이템 정보 (이름, 설명)
   * @param expectedReturn 아이템의 기대 수익률
   * @param categoryId 아이템이 속할 카테고리 ID
   */
  create: (
    userId: UUID,
    info: { name: string; description?: string },
    expectedReturn: ExpectedReturn,
    categoryId: number,
  ) => Promise<void>;

  /**
   * 기존 아이템을 업데이트
   * @param itemId 업데이트할 아이템 ID
   * @param info 업데이트할 아이템 정보 (이름, 설명)
   * @param expectedReturn 업데이트할 아이템의 기대 수익률
   * @param categoryId 업데이트할 아이템이 속할 카테고리 ID
   */
  update: (
    itemId: number,
    info?: { name?: string; description?: string },
    expectedReturn?: ExpectedReturn,
    categoryId?: number,
  ) => Promise<void>;

  /**
   * 아이템을 삭제
   * @param itemId 삭제할 아이템 ID
   */
  delete: (itemId: number) => Promise<void>;
};
