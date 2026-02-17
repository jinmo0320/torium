import { UUID } from "crypto";
import { InvProfileRepository } from "../domain/invProfile.repo";
import {
  RiskType,
  InvestmentPlan,
  InvestmentProfile,
} from "../domain/invProfile.entity";
import {
  determineRiskType,
  isValidInvestmentPlan,
} from "../domain/invProfile.logic";

import { AssessRiskTypeReqDto, UpdatePlanReqDto } from "./invProfile.dto";
import { DomainError } from "src/shared/errors/error";
import { ErrorCodes } from "src/shared/errors/errorCodes";

export type InvProfileService = {
  /**
   * 설문 점수로 유저의 투자 성향 업데이트
   * @param userId   user id
   * @param score    투자 성향 총점
   * @errors         INVALID_INVESTMENT_SCORE
   */
  assessRiskType: ({
    userId,
    score,
  }: AssessRiskTypeReqDto) => Promise<RiskType>;
  /**
   * 유저의 투자 성향 비우기
   * @param userId   user id
   */
  clearRiskType: (userId: UUID) => Promise<void>;
  /**
   * 예산 계획 업데이트
   * @param userId   user id
   * @param plan     투자 계획 요소
   * @errors         INVALID_INVESTMENT_PROFILE
   */
  updatePlan: ({ userId, plan }: UpdatePlanReqDto) => Promise<void>;
  /**
   * 예산 계획 비우기
   * @param userId   user id
   */
  clearPlan: (userId: UUID) => Promise<void>;
  /**
   * 유저의 투자 프로필 조회
   * @param userId   user id
   * @errors         INVALID_INVESTMENT_PROFILE
   * @returns        유저의 투자 프로필
   */
  getProfile: (userId: UUID) => Promise<InvestmentProfile | null>;
};

export const createInvProfileService = ({
  invProfileRepository,
}: {
  invProfileRepository: InvProfileRepository;
}): InvProfileService => ({
  assessRiskType: async ({ userId, score }) => {
    const riskType = determineRiskType(score);
    if (!riskType) {
      throw new DomainError(
        ErrorCodes.INV_PROFILE.INVALID_RISK_SCORE,
        "Invalid risk assessment score",
      );
    }
    await invProfileRepository.upsertRiskType(userId, riskType);
    return riskType;
  },

  clearRiskType: async (userId) =>
    await invProfileRepository.upsertRiskType(userId, null),

  updatePlan: async ({ userId, plan }) => {
    if (!isValidInvestmentPlan(plan)) {
      throw new DomainError(
        ErrorCodes.INV_PROFILE.INVALID_INVESTMENT_PLAN,
        "Invalid investment plan",
      );
    }
    await invProfileRepository.upsertPlan(userId, plan);
  },

  clearPlan: async (userId) =>
    await invProfileRepository.upsertPlan(userId, null),

  getProfile: async (userId) => {
    const profile = await invProfileRepository.getProfile(userId);

    if (!profile) {
      throw new DomainError(
        ErrorCodes.INV_PROFILE.INVESTMENT_PROFILE_NOT_FOUND,
        "Investment profile Not Found",
      );
    }

    return profile;
  },
});
