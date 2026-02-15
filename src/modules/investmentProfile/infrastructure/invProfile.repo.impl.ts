import { RowDataPacket } from "mysql2";
import db from "src/shared/infrastructure/db";
import { InvProfileRepository } from "../application/invProfile.repo";

export const createInvProfileRepository = (): InvProfileRepository => ({
  upsertRiskType: async (userId, riskType) => {
    await db.execute(
      `INSERT INTO investment_profiles (user_id, risk_type)
       VALUES (?, ?)
       ON DUPLICATE KEY UPDATE risk_type = VALUES(risk_type)`,
      [userId, riskType],
    );
  },

  upsertPlan: async (userId, plan) => {
    const {
      monthlyAmount = null,
      period = null,
      expectedReturn = null,
      targetAmount = null,
    } = plan ?? {};
    await db.execute(
      `INSERT INTO investment_profiles
         (user_id, monthly_amount, period, expected_return, target_amount)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         monthly_amount = VALUES(monthly_amount),
         period = VALUES(period),
         expected_return = VALUES(expected_return),
         target_amount = VALUES(target_amount)`,
      [userId, monthlyAmount, period, expectedReturn, targetAmount],
    );
  },

  getProfile: async (userId) => {
    const [[profile]] = await db.execute<RowDataPacket[]>(
      `SELECT
         risk_type,
         monthly_amount,
         period,
         expected_return,
         target_amount
       FROM investment_profiles
       WHERE user_id = ?`,
      [userId],
    );

    return {
      riskType: profile?.risk_type,
      plan: {
        monthlyAmount: profile?.monthly_amount,
        period: profile?.period,
        expectedReturn: profile?.expected_return,
        targetAmount: profile?.target_amount,
      },
    };
  },
});
