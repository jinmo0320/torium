import { UUID } from "crypto";
import { InvProfileDeps } from "../invProfile.service";

/**
 * 유저의 투자 성향 비우기
 */
type ClearRiskType = (userId: UUID) => Promise<void>;

export const clearRiskType =
  ({ invProfileRepository }: InvProfileDeps): ClearRiskType =>
  async (userId) =>
    await invProfileRepository.upsertRiskType(userId, null);
