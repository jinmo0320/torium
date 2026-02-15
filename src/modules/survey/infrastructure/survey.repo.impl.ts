import { RowDataPacket } from "mysql2";
import db from "src/shared/infrastructure/db";
import { SurveyRepository } from "../application/survey.repo";
import { Survey } from "../domain/survey.entity";

export const createSurveyRepository = (): SurveyRepository => ({
  getInvestmentQuestions: async () => {
    const [rows] = await db.execute<RowDataPacket[]>(`
      SELECT
        q.id AS question_id,
        q.question_text,
        q.order_no AS question_order,
        a.answer_text,
        a.order_no AS answer_order
      FROM survey_questions q
      JOIN survey_answers a ON q.id = a.question_id
      ORDER BY q.order_no ASC, a.order_no ASC
    `);

    const questionMap = new Map<
      number,
      {
        text: string;
        order: number;
        answers: string[];
      }
    >();

    rows.forEach((row) => {
      if (!questionMap.has(row.question_id)) {
        questionMap.set(row.question_id, {
          text: row.question_text,
          order: row.question_order,
          answers: [],
        });
      }
      questionMap.get(row.question_id)!.answers.push(row.answer_text);
    });

    const questions: Survey.Question[] = Array.from(questionMap.values())
      .sort((a, b) => a.order - b.order)
      .map((q) => ({
        title: q.text,
        answers: q.answers as [string, string, string, string],
      }));

    return questions;
  },
});
