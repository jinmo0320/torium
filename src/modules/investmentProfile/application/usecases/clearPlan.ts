import { UUID } from "crypto";
import { InvProfileDeps } from "../invProfile.service";

/**
 * 예산 계획 비활성화
 */
type ClearPlan = (userId: UUID) => Promise<void>;

export const clearPlan =
  ({ invProfileRepository }: InvProfileDeps): ClearPlan =>
  async (userId) =>
    await invProfileRepository.deactivatePlans(userId);
