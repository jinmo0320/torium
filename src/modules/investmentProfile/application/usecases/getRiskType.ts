import { InvProfileRepository } from "../../domain/invProfile.repo";
import { UUID } from "crypto";

/**
 * 유저의 투자 성향 조회
 */
type GetRiskType = (userId: UUID) => Promise<any>;

export const getRiskType = (deps: { invProfileRepository: InvProfileRepository }): GetRiskType => {
  return async (userId: UUID) => {
    const riskType = await deps.invProfileRepository.getRiskType(userId);
    return riskType;
  };
};