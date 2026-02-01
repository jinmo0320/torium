import { UUID } from "crypto";
import { InvestmentProfileRepository } from "../repositories/investmentProfileRepository";
import {
  RiskType,
  InvestmentPlan,
  InvestmentProfile,
} from "../models/dtos/investmentProfileDto";
import { HttpException } from "../errors/error";
import { ErrorCode } from "../errors/errorCodes";
import { determineRiskType } from "src/utils/riskAssesment";
import { isValidInvestmentPlan } from "src/utils/investmentCalculator";

export type InvestmentProfileService = {
  /**
   * 설문 점수로 유저의 투자 성향 업데이트
   * @param userId   user id
   * @param score    투자 성향 총점
   * @errors         INVALID_INVESTMENT_SCORE
   */
  assessRiskType: (userId: UUID, score: number) => Promise<RiskType>;
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
  updatePlan: (userId: UUID, plan: InvestmentPlan) => Promise<void>;
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

export const createInvestmentProfileService = (
  investmentProfileRepository: InvestmentProfileRepository,
): InvestmentProfileService => ({
  assessRiskType: async (userId: UUID, score: number): Promise<RiskType> => {
    const riskType = determineRiskType(score);
    if (!riskType) {
      throw new HttpException(
        400,
        ErrorCode.INVALID_RISK_SCORE,
        "Invalid risk assessment score",
      );
    }
    await investmentProfileRepository.upsertRiskType(userId, riskType);
    return riskType;
  },

  clearRiskType: async (userId: UUID): Promise<void> =>
    await investmentProfileRepository.upsertRiskType(userId, null),

  updatePlan: async (userId: UUID, plan: InvestmentPlan): Promise<void> => {
    if (!isValidInvestmentPlan(plan)) {
      throw new HttpException(
        400,
        ErrorCode.INVALID_INVESTMENT_PLAN,
        "Invalid investment plan",
      );
    }
    await investmentProfileRepository.upsertPlan(userId, plan);
  },

  clearPlan: async (userId: UUID): Promise<void> =>
    await investmentProfileRepository.upsertPlan(userId, null),

  getProfile: async (userId: UUID): Promise<InvestmentProfile | null> => {
    const profile = await investmentProfileRepository.getProfile(userId);

    if (!profile) {
      throw new HttpException(
        404,
        ErrorCode.INVESTMENT_PROFILE_NOT_FOUND,
        "Investment profile Not Found",
      );
    }

    return profile;
  },
});
