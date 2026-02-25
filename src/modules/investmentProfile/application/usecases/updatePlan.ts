import { InvProfileDeps } from "../invProfile.service";
import {
  isValidInvestmentPlanReqDto,
  UpdatePlanReqDto,
} from "../invProfile.dto";
import { isValidInvestmentPlan } from "../../domain/invProfile.logic";
import { DomainError } from "src/shared/errors/error";
import { ErrorCodes } from "src/shared/errors/errorCodes";

/**
 * 투자 계획 업데이트 (기존 계획 비활성화 후 신규 생성)
 */
type UpdatePlan = (req: UpdatePlanReqDto) => Promise<void>;

export const updatePlan =
  ({ invProfileRepository, paymentService }: InvProfileDeps): UpdatePlan =>
  async ({ userId, plan }) => {
    if (!isValidInvestmentPlanReqDto(plan)) {
      throw new DomainError(
        ErrorCodes.INV_PROFILE.INVALID_INVESTMENT_PLAN,
        "Invalid investment plan request: missing required fields",
      );
    }
    if (!isValidInvestmentPlan(plan)) {
      throw new DomainError(
        ErrorCodes.INV_PROFILE.INVALID_INVESTMENT_PLAN,
        "Invalid investment plan: calculated future value does not match target",
      );
    }

    const activePlan = await invProfileRepository.getActivePlan(userId);
    const nextVersion = activePlan ? activePlan.version + 1 : 1;

    // 1. 기존 플랜 비활성화
    await invProfileRepository.deactivatePlans(userId);

    // 2. 새 플랜 생성
    const newPlanId = await invProfileRepository.createPlan(userId, {
      ...plan,
      version: nextVersion,
    });

    // 3. 납입 스케줄 생성
    await paymentService.generateSchedulesForPlan(newPlanId, {
      startDate: plan.startDate,
      paymentDay: plan.paymentDay,
      period: plan.period,
      monthlyAmount: plan.monthlyAmount,
    });
  };
