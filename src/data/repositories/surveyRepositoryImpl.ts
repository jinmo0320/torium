import db from "../../data/config/db";
import { RowDataPacket } from "mysql2";
import { SurveyRepository } from "../../domain/repositories/surveyRepository";
import { SurveyDto } from "../../domain/models/dtos/surveyDto";
import { UUID } from "crypto";
import { InvestmentType } from "../../utils/investmentType";

export const createSurveyRepository = (): SurveyRepository => ({
  getSurvey: async (): Promise<SurveyDto.Response> => {
    const [rows] = await db.query<RowDataPacket[]>(`
      SELECT
        q.id AS question_id,
        q.question_text,
        q.order_no AS question_order,
        a.answer_text,
        a.order_no AS answer_order
      FROM survey_questions q
      JOIN survey_answers a ON q.id = a.question_id
      ORDER BY q.order_no ASC, a.order_no ASC`);

    const questions: SurveyDto.Question[] = [];
    for (let i = 0; i < rows.length; i += 4) {
      questions.push({
        title: rows[i].question_text,
        answers: [
          rows[i].answer_text,
          rows[i + 1].answer_text,
          rows[i + 2].answer_text,
          rows[i + 3].answer_text,
        ],
      });
    }

    return { questions };
  },

  submitAnswers: async (userId: UUID, type: InvestmentType): Promise<void> => {
    await db.query(`UPDATE users SET investment_type = ? WHERE id = ?`, [
      type,
      userId,
    ]);
  },
});
