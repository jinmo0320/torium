import { RowDataPacket } from "mysql2";
import db from "src/shared/infrastructure/db";
import { PaymentRepository } from "../domain/payment.repo";
import { PaymentSchedule } from "../domain/payment.entity";

export const createPaymentRepository = (): PaymentRepository => ({
  getSchedules: async (planId) => {
    const [rows] = await db.execute<RowDataPacket[]>(
      `SELECT * FROM payment_schedules WHERE plan_id = ? ORDER BY sequence ASC`,
      [planId],
    );

    return rows.map((row) => ({
      id: Number(row.id),
      planId: Number(row.plan_id),
      sequence: Number(row.sequence),
      expectedDate: row.expected_date,
      amount: Number(row.expected_amount),
      status: row.status,
      actualPaidAmount:
        row.actual_paid_amount !== null
          ? Number(row.actual_paid_amount)
          : undefined,
      actualPaidDate: row.actual_paid_date,
    })) as PaymentSchedule[];
  },

  createSchedules: async (schedules) => {
    if (schedules.length === 0) return;
    const values = schedules.map((s) => [
      s.planId,
      s.sequence,
      s.expectedDate,
      s.amount,
      s.status || "PENDING",
    ]);
    await db.query(
      `INSERT INTO payment_schedules (plan_id, sequence, expected_date, expected_amount, status) VALUES ?`,
      [values],
    );
  },

  updateSchedulePaid: async (scheduleId, amount, paidAt) => {
    await db.execute(
      `UPDATE payment_schedules 
       SET status = 'PAID', actual_paid_amount = ?, actual_paid_date = ?
       WHERE id = ?`,
      [amount, paidAt, scheduleId],
    );
  },

  getAllPaidSchedules: async (userId) => {
    const [rows] = await db.execute<RowDataPacket[]>(
      `SELECT ps.* FROM payment_schedules ps
       JOIN investment_plans ip ON ps.plan_id = ip.id
       WHERE ip.user_id = ? AND ps.status = 'PAID'`,
      [userId],
    );

    return rows.map((row) => ({
      id: Number(row.id),
      planId: Number(row.plan_id),
      sequence: Number(row.sequence),
      expectedDate: row.expected_date,
      amount: Number(row.expected_amount),
      status: row.status,
      actualPaidAmount:
        row.actual_paid_amount !== null
          ? Number(row.actual_paid_amount)
          : undefined,
      actualPaidDate: row.actual_paid_date,
    })) as PaymentSchedule[];
  },
});
