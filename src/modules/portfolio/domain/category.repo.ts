import { UUID } from "crypto";
import { Portfolio } from "../domain/portfolio.entity";

export type CategoryRepository = {
  /**
   * 사용자가 소유한 모든 카테고리를 반환
   * @param userId 사용자 ID
   */
  getAll: (userId: UUID) => Promise<Portfolio.Category[]>;

  /**
   * 새로운 카테고리를 생성
   * @param userId 사용자 ID
   * @param info 카테고리 정보 (이름, 설명)
   */
  create: (
    userId: UUID,
    info: { name: string; description?: string },
  ) => Promise<void>;

  /**
   * 기존 카테고리를 업데이트
   * @param categoryId 업데이트할 카테고리 ID
   * @param info 업데이트할 카테고리 정보 (이름, 설명)
   */
  update: (
    categoryId: number,
    info?: { name?: string; description?: string },
  ) => Promise<void>;

  /**
   * 카테고리를 삭제
   * @param categoryId 삭제할 카테고리 ID
   */
  delete: (categoryId: number) => Promise<void>;
};
