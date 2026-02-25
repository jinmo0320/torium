import { RowDataPacket, ResultSetHeader } from "mysql2";
import db from "src/shared/infrastructure/db";
import { InvProfileRepository } from "../domain/invProfile.repo";
import { InvestmentPlan } from "../domain/invProfile.entity";

export const createInvProfileRepository = (): InvProfileRepository => ({
  getRiskType: async (userId) => {
    const [[profile]] = await db.execute<RowDataPacket[]>(
      `SELECT risk_type FROM investment_profiles WHERE user_id = ?`,
      [userId],
    );

    return profile?.risk_type || null;
  },

  upsertRiskType: async (userId, riskType) => {
    await db.execute(
      `INSERT INTO investment_profiles (user_id, risk_type)
       VALUES (?, ?)
       ON DUPLICATE KEY UPDATE risk_type = VALUES(risk_type)`,
      [userId, riskType],
    );
  },

  getActivePlan: async (userId) => {
    const [[plan]] = await db.execute<RowDataPacket[]>(
      `SELECT * FROM investment_plans WHERE user_id = ? AND is_active = TRUE`,
      [userId],
    );

    if (!plan) return null;

    return {
      id: Number(plan.id),
      version: Number(plan.version),
      initialAmount: Number(plan.initial_amount),
      monthlyAmount: Number(plan.monthly_amount),
      startDate: plan.start_date,
      paymentDay: Number(plan.payment_day),
      period: Number(plan.period),
      expectedReturn: Number(plan.expected_return),
      targetAmount: Number(plan.target_amount),
      createdAt: plan.created_at,
      isActive: Boolean(plan.is_active),
    } as InvestmentPlan;
  },

  createPlan: async (userId, plan) => {
    const [result] = await db.execute<ResultSetHeader>(
      `INSERT INTO investment_plans 
       (user_id, version, initial_amount, monthly_amount, start_date, payment_day, period, expected_return, target_amount, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, TRUE)`,
      [
        userId,
        plan.version,
        plan.initialAmount,
        plan.monthlyAmount,
        plan.startDate,
        plan.paymentDay,
        plan.period,
        plan.expectedReturn,
        plan.targetAmount,
      ],
    );
    return result.insertId;
  },

  deactivatePlans: async (userId) => {
    await db.execute(
      `UPDATE investment_plans SET is_active = FALSE WHERE user_id = ?`,
      [userId],
    );
  },
});
