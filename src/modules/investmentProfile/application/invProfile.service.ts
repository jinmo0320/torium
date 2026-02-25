import { InvProfileRepository } from "../domain/invProfile.repo";
import { PaymentService } from "src/modules/payment/application/payment.service";

import * as Usecases from "./usecases";

export type InvProfileDeps = {
  invProfileRepository: InvProfileRepository;
  paymentService: PaymentService; // 추가
};

export const createInvProfileService = (deps: InvProfileDeps) => ({
  getRiskType: Usecases.getRiskType(deps),
  assessRiskType: Usecases.assessRiskType(deps),
  clearRiskType: Usecases.clearRiskType(deps),

  getPlan: Usecases.getPlan(deps),
  createPlan: Usecases.createPlan(deps),
  updatePlan: Usecases.updatePlan(deps),
  clearPlan: Usecases.clearPlan(deps),
});

export type InvProfileService = ReturnType<typeof createInvProfileService>;
