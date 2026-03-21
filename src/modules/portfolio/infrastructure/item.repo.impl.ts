import { RowDataPacket, PoolConnection, ResultSetHeader } from "mysql2/promise";
import db from "src/shared/infrastructure/db";
import { ItemRepository } from "../domain/item.repo";

export const createItemRepository = (): ItemRepository => {
  return {
    getAll: async (userId) => {
      const [rows] = await db.execute<RowDataPacket[]>(
        `SELECT i.* FROM items i
         JOIN item_ownership io ON i.id = io.item_id
         WHERE io.user_id = ?`,
        [userId],
      );

      return rows.map((r) => ({
        id: r.id,
        categoryId: r.category_id,
        name: r.name,
        description: r.description || "",
        portion: 0,
        expectedReturn: {
          min: Number(r.min_return),
          max: Number(r.max_return),
        },
      }));
    },

    create: async (userId, info, expectedReturn, categoryId) => {
      const conn = await db.getConnection();
      try {
        await conn.beginTransaction();

        // items 테이블에 기본 정보 삽입
        const [itemResult] = await conn.execute<ResultSetHeader>(
          `INSERT INTO items (category_id, name, description, min_return, max_return)
           VALUES (?, ?, ?, ?, ?)`,
          [
            categoryId,
            info.name,
            info.description || null,
            expectedReturn.min,
            expectedReturn.max,
          ],
        );

        const newItemId = itemResult.insertId;

        // 소유권 관계 설정
        await conn.execute(
          `INSERT INTO item_ownership (user_id, item_id)
           VALUES (?, ?)`,
          [userId, newItemId],
        );

        await conn.commit();
      } catch (e) {
        await conn.rollback();
        throw e;
      } finally {
        conn.release();
      }
    },

    update: async (itemId, info, expectedReturn, categoryId) => {
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
      if (expectedReturn?.min !== undefined) {
        updates.push("min_return = ?");
        values.push(expectedReturn.min);
      }
      if (expectedReturn?.max !== undefined) {
        updates.push("max_return = ?");
        values.push(expectedReturn.max);
      }
      if (categoryId) {
        updates.push("category_id = ?");
        values.push(categoryId);
      }

      if (updates.length === 0) return;

      values.push(itemId);
      await db.execute(
        `UPDATE items SET ${updates.join(", ")} WHERE id = ?`,
        values,
      );
    },

    delete: async (itemId) => {
      await db.execute(`DELETE FROM items WHERE id = ?`, [itemId]);
    },
  };
};
