import { PaymentDeps } from "../payment.service";
import { UUID } from "crypto";
import { InvestmentProgress } from "../../domain/payment.entity";

export type GetInvestmentProgress = (
  userId: UUID,
) => Promise<InvestmentProgress | null>;

export const getInvestmentProgress =
  ({
    paymentRepository,
    portfolioRepository,
    invProfileRepository,
  }: PaymentDeps): GetInvestmentProgress =>
  async (userId: UUID) => {
    // 1. 현재 활성 플랜 가져오기
    const activePlan = await invProfileRepository.getActivePlan(userId);
    if (!activePlan) {
      return null;
    }

    // 2. 전체 납입 기록 가져오기 (모든 버전 합산)
    // paymentReposiotry.getAllPaidSchedules 에서 가져오도록 되어있음.
    const paidSchedules = await paymentRepository.getAllPaidSchedules(userId);
    const totalPrincipal = paidSchedules.reduce(
      (acc, s) => acc + (s.actualPaidAmount || 0),
      0,
    );

    // 3. 현재 포트폴리오의 기대 수익률
    const portfolio = await portfolioRepository.getPortfolioByUserId(userId);
    const expectedReturn =
      portfolio && portfolio.items.length > 0
        ? (portfolio.expectedReturn.min + portfolio.expectedReturn.max) / 2 // 나중에 실제 자산 가격으로 변경
        : activePlan.expectedReturn; // 포폴도 없으면 계획 상 예상 수익률로..

    // 4. 현재 자산 가치 추정 (임시: 원금 + 기대수익률 기반 수익)
    // 실제로는 각 납입 시점부터 현재까지의 기간을 계산해야 하지만, 간단하게 구현
    const currentAssetValue =
      totalPrincipal * (1 + expectedReturn * (paidSchedules.length / 12)); // 단순화된 계산

    const totalReturnAmount = currentAssetValue - totalPrincipal;
    const totalReturnRate =
      totalPrincipal > 0 ? (totalReturnAmount / totalPrincipal) * 100 : 0;

    return {
      totalPrincipal,
      currentAssetValue: Math.round(currentAssetValue),
      totalReturnAmount: Math.round(totalReturnAmount),
      totalReturnRate: Number(totalReturnRate.toFixed(2)),
      totalProgressRate: Number(
        ((currentAssetValue / activePlan.targetAmount) * 100).toFixed(2),
      ),
      paidCount: paidSchedules.length,
      remainingPeriod: activePlan.period - paidSchedules.length,
    };
  };
