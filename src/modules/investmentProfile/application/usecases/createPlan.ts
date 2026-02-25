import { InvProfileDeps } from "../invProfile.service";
import {
  CreatePlanReqDto,
  isValidInvestmentPlanReqDto,
} from "../invProfile.dto";
import { isValidInvestmentPlan } from "../../domain/invProfile.logic";
import { DomainError } from "src/shared/errors/error";
import { ErrorCodes } from "src/shared/errors/errorCodes";

type CreatePlan = (req: CreatePlanReqDto) => Promise<void>;

export const createPlan = ({
  invProfileRepository,
  paymentService,
}: InvProfileDeps): CreatePlan => {
  return async ({ userId, plan }) => {
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
    const planId = await invProfileRepository.createPlan(userId, plan);
    await paymentService.generateSchedulesForPlan(planId, {
      startDate: plan.startDate,
      paymentDay: plan.paymentDay,
      period: plan.period,
      monthlyAmount: plan.monthlyAmount,
    });
  };
};
