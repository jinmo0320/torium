import { InvProfileDeps } from "../invProfile.service";
import { AssessRiskTypeReqDto } from "../invProfile.dto";
import { RiskType } from "../../domain/invProfile.entity";
import { determineRiskType } from "../../domain/invProfile.logic";
import { DomainError } from "src/shared/errors/error";
import { ErrorCodes } from "src/shared/errors/errorCodes";

/**
 * 설문 점수로 유저의 투자 성향 업데이트
 */
type AssessRiskType = (req: AssessRiskTypeReqDto) => Promise<RiskType>;

export const assessRiskType =
  ({ invProfileRepository }: InvProfileDeps): AssessRiskType =>
  async ({ userId, score }) => {
    const riskType = determineRiskType(score);
    if (!riskType) {
      throw new DomainError(
        ErrorCodes.INV_PROFILE.INVALID_RISK_SCORE,
        "Invalid risk assessment score",
      );
    }
    await invProfileRepository.upsertRiskType(userId, riskType);
    return riskType;
  };
