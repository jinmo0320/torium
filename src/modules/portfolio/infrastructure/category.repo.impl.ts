import { RowDataPacket, PoolConnection, ResultSetHeader } from "mysql2/promise";
import db from "src/shared/infrastructure/db";
import { CategoryRepository } from "../domain/category.repo";

export const createCategoryRepository = (): CategoryRepository => {
  return {
    getAll: async (userId) => {
      const [rows] = await db.execute<RowDataPacket[]>(
        `SELECT 
          c.*,
          SUM(i.min_return) / NULLIF(COUNT(i.id), 0) as avg_min_return,
          SUM(i.max_return) / NULLIF(COUNT(i.id), 0) as avg_max_return
         FROM categories c
         JOIN category_ownership co ON c.id = co.category_id
         LEFT JOIN items i ON i.category_id = c.id
         WHERE co.user_id = ?
         GROUP BY c.id`,
        [userId],
      );

      return rows.map((r) => ({
        id: r.id,
        code: r.code,
        name: r.name,
        description: r.description || "",
        portion: 0, // 리스트 조회용 기본값
        expectedReturn: {
          min: 0,
          max: 0,
        },
      }));
    },

    create: async (userId, info) => {
      const conn = await db.getConnection();
      try {
        await conn.beginTransaction();

        const [result] = await conn.execute<ResultSetHeader>(
          `INSERT INTO categories (code, name, description)
           VALUES ('CUSTOM', ?, ?)`,
          [info.name, info.description || null],
        );

        const newCategoryId = result.insertId;

        await conn.execute(
          `INSERT INTO category_ownership (user_id, category_id, is_private)
           VALUES (?, ?, TRUE)`,
          [userId, newCategoryId],
        );

        await conn.commit();
      } catch (e) {
        await conn.rollback();
        throw e;
      } finally {
        conn.release();
      }
    },

    update: async (categoryId, info) => {
      const updates: string[] = [];
      const values: any[] = [];

      if (info?.name) {
        updates.push("name = ?");
        values.push(info.name);
      }
      if (info?.description !== undefined) {
        updates.push("description = ?");
        values.push(info.description);
      }

      if (updates.length === 0) return;

      values.push(categoryId);
      await db.execute(
        `UPDATE categories SET ${updates.join(", ")} WHERE id = ?`,
        values,
      );
    },

    delete: async (categoryId) => {
      await db.execute(`DELETE FROM categories WHERE id = ?`, [categoryId]);
    },
  };
};
