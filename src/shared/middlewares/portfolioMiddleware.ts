import { Request, Response, NextFunction } from "express";
import { PortfolioUsecase } from "src/modules/portfolio/application/portfolio.usecase";
import { DomainError } from "src/shared/errors/error";
import { ErrorCodes } from "src/shared/errors/errorCodes";

export const loadPortfolio = (portfolioUsecase: PortfolioUsecase) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user!; // authMiddleware 선행 필요
      // 이미 있다면 굳이 또 조회하지 않음
      if (!user.portfolioId) {
        const portfolio = await portfolioUsecase.getPortfolio(user.id);
        if (!portfolio) {
          throw new DomainError(
            ErrorCodes.PORTFOLIO.NOT_FOUND,
            "해당 유저의 포트폴리오가 존재하지 않습니다.",
          );
        }
        user.portfolioId = portfolio.id;
      }
      next();
    } catch (e) {
      next(e);
    }
  };
};
