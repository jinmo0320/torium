import { UUID } from "crypto";
import { InvestmentProfileRepository } from "../repositories/investmentProfileRepository";
import {
  RiskType,
  InvestmentPlan,
  InvestmentProfile,
} from "../models/dtos/investmentProfileDto";
import { HttpException } from "../errors/error";
import { ErrorCode } from "../errors/errorCodes";

const determineRiskType = (score: number): RiskType => {
  if (score >= 10 && score <= 15) return "STABLE";
  if (score <= 20) return "STABLE_SEEK";
  if (score <= 25) return "NEUTRAL";
  if (score <= 30) return "ACTIVE";
  if (score <= 40) return "AGGRESSIVE";

  throw new HttpException(
    400,
    ErrorCode.INVALID_RISK_SCORE,
    "Invalid risk assessment score",
  );
};

export type InvestmentProfileService = {
  /**
   * 설문 점수로 유저의 투자 성향 업데이트
   * @param userId   user id
   * @param score    투자 성향 총점
   * @errors         INVALID_INVESTMENT_SCORE
   */
  assessRisk: (userId: UUID, score: number) => Promise<void>;
  /**
   * 예산 계획 업데이트
   * @param userId   user id
   * @param plan     투자 계획 요소
   * @errors         INVALID_INVESTMENT_PROFILE
   */
  updatePlan: (userId: UUID, plan: InvestmentPlan) => Promise<void>;
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
  assessRisk: async (userId: UUID, score: number): Promise<void> => {
    const type = determineRiskType(score);
    await investmentProfileRepository.updateRiskType(userId, type);
  },

  updatePlan: async (userId: UUID, plan: InvestmentPlan): Promise<void> => {
    // if (!validatePlan(plan)) {
    //         throw new HttpException(
    //     400,
    //     ErrorCode.INVALID_INVESTMENT_PLAN,
    //     "Invalid investment plan",
    //   );
    // }
    await investmentProfileRepository.upsertPlan(userId, plan);
  },

  getProfile: async (userId: UUID): Promise<InvestmentProfile | null> => {
    const profile = await investmentProfileRepository.getProfile(userId);

    if (!profile) {
      throw new HttpException(
        404,
        ErrorCode.INVESTMENT_PROFILE_NOT_FOUND,
        "User Not Found",
      );
    }

    return profile;
  },
});
