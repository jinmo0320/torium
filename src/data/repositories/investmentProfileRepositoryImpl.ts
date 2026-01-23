import { RowDataPacket } from "mysql2";
import { UUID } from "crypto";
import db from "src/data/config/db";
import { InvestmentProfileRepository } from "src/domain/repositories/investmentProfileRepository";
import {
  RiskType,
  InvestmentPlan,
  InvestmentProfile,
} from "src/domain/models/dtos/investmentProfileDto";

export const createInvestmentProfileRepository =
  (): InvestmentProfileRepository => ({
    updateRiskType: async (userId: UUID, riskType: RiskType): Promise<void> => {
      await db.execute(`UPDATE users SET risk_type = ? WHERE id = ?`, [
        riskType,
        userId,
      ]);
    },

    upsertPlan: async (userId: UUID, plan: InvestmentPlan): Promise<void> => {
      const { monthlyAmount, years, returnRate, targetAmount } = plan;
      await db.execute(
        `
      INSERT INTO investment_plans
        (user_id, monthly_amount, investment_years, expected_return_rate, target_amount)
      VALUES (?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        monthly_amount = VALUES(monthly_amount),
        investment_years = VALUES(investment_years),
        expected_return_rate = VALUES(expected_return_rate),
        target_amount = VALUES(target_amount)
      `,
        [userId, monthlyAmount, years, returnRate, targetAmount],
      );
    },

    getProfile: async (userId: UUID): Promise<InvestmentProfile> => {
      const [[row]] = await db.query<RowDataPacket[]>(
        `
        SELECT
          u.risk_type,
          p.monthly_amount,
          p.investment_years,
          p.expected_return_rate,
          p.target_amount
        FROM users u
        LEFT JOIN investment_plans p ON u.id = p.user_id
        WHERE u.id = ?
        `,
        [userId],
      );

      return {
        riskType: row?.risk_type ?? null,
        plan: row?.monthly_amount
          ? {
              monthlyAmount: row.monthly_amount,
              years: row.investment_years,
              returnRate: row.expected_return_rate,
              targetAmount: row.target_amount,
            }
          : null,
      };
    },
  });
