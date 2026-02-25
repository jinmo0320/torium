import { Request, Response } from "express";
import { PaymentService } from "../application/payment.service";

export const paymentController = (paymentService: PaymentService) => ({
  getInvestmentProgress: async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const progress = await paymentService.getInvestmentProgress(userId);
    res.status(200).json({
      success: true,
      message: "Successfully fetched.",
      data: { progress },
    });
  },

  getInvestmentPayments: async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const payments = await paymentService.getInvestmentPayments(userId);
    res.status(200).json({
      success: true,
      message: "Successfully fetched.",
      data: { payments },
    });
  },

  recordInvestmentPayment: async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { scheduleId, amount, paidAt } = req.body;
    await paymentService.recordPayment({
      userId,
      scheduleId: Number(scheduleId),
      amount: Number(amount),
      paidAt,
    });
    res.status(201).json({
      success: true,
      message: "Recorded investment payment.",
    });
  },
});
