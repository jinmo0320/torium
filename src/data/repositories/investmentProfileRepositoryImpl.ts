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
    upsertRiskType: async (userId: UUID, riskType: RiskType): Promise<void> => {
      await db.execute(
        `INSERT INTO investment_profiles (user_id, risk_type)
       VALUES (?, ?)
       ON DUPLICATE KEY UPDATE risk_type = VALUES(risk_type)`,
        [userId, riskType],
      );
    },

    upsertPlan: async (userId: UUID, plan: InvestmentPlan): Promise<void> => {
      const {
        monthlyAmount,
        investmentYears,
        expectedReturnRate,
        targetAmount,
      } = plan;
      await db.execute(
        `INSERT INTO investment_profiles
         (user_id, monthly_amount, investment_years, expected_return_rate, target_amount)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         monthly_amount = VALUES(monthly_amount),
         investment_years = VALUES(investment_years),
         expected_return_rate = VALUES(expected_return_rate),
         target_amount = VALUES(target_amount)`,
        [
          userId,
          monthlyAmount,
          investmentYears,
          expectedReturnRate,
          targetAmount,
        ],
      );
    },

    getProfile: async (userId: UUID): Promise<InvestmentProfile> => {
      const [[row]] = await db.execute<RowDataPacket[]>(
        `SELECT
         risk_type,
         monthly_amount,
         investment_years,
         expected_return_rate,
         target_amount
       FROM investment_profiles
       WHERE user_id = ?`,
        [userId],
      );

      return {
        riskType: row?.risk_type,
        plan: {
          monthlyAmount: row?.monthly_amount,
          investmentYears: row?.investment_years,
          expectedReturnRate: row?.expected_return_rate,
          targetAmount: row?.target_amount,
        },
      };
    },
  });
