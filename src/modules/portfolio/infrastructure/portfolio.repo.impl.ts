import { RowDataPacket, PoolConnection } from "mysql2/promise";
import db from "src/shared/infrastructure/db";
import { PortfolioRepository } from "../domain/portfolio.repo";

export const createPortfolioRepository = (): PortfolioRepository => {
  // 내부 헬퍼 함수
  const propagateCategoryPortionToItems = async (
    conn: PoolConnection,
    p: { id: number; portion: number },
  ) => {
    const { id, portion } = p;
    // 만약 기존 자산군 비중이 0 이었을다면 자산 종류에 맞춰 균등 분배한다.
    await conn.execute(
      `UPDATE user_items
       SET portion = CASE 
         WHEN (SELECT portion FROM (SELECT portion FROM user_categories WHERE id = ?) as tmp) > 0
         THEN (portion / (SELECT portion FROM (SELECT portion FROM user_categories WHERE id = ?) as tmp2)) * ?
         ELSE ? / (SELECT count FROM (SELECT COUNT(*) as count FROM user_items WHERE category_id = ?) as tmp3)
       END
       WHERE category_id = ?`,
      [id, id, portion, portion, id, id],
    );
  };

  const syncCategoryPortionFromItems = async (
    conn: PoolConnection,
    portfolioId: number,
  ) => {
    await conn.execute(
      `UPDATE user_categories uc
       SET portion = (
         SELECT COALESCE(SUM(ui.portion), 0) 
         FROM user_items ui 
         WHERE ui.category_id = uc.id
       )
       WHERE uc.portfolio_id = ?`,
      [portfolioId],
    );
  };

  const recalculatePortfolioMetrics = async (
    conn: PoolConnection,
    portfolioId: number,
  ) => {
    const [[totalReturn]] = await conn.execute<RowDataPacket[]>(
      `SELECT 
       COALESCE(SUM(ui.portion * ui.min_return), 0) as new_min,
       COALESCE(SUM(ui.portion * ui.max_return), 0) as new_max
       FROM user_items ui
       JOIN user_categories uc ON ui.category_id = uc.id
       WHERE uc.portfolio_id = ?`,
      [portfolioId],
    );
    const { new_min = 0, new_max = 0 } = totalReturn ?? {};

    await conn.execute(
      `UPDATE user_portfolios 
       SET min_return = ?, max_return = ?, is_customized = 1 
       WHERE id = ?`,
      [Number(new_min), Number(new_max), portfolioId],
    );
  };

  return {
    // ==========================================
    // 1. 전체 & 추천 (Global & Recommendations)
    // ==========================================
    getPortfolioByUserId: async (userId) => {
      const [[pf]] = await db.execute<RowDataPacket[]>(
        "SELECT * FROM user_portfolios WHERE user_id = ?",
        [userId],
      );
      if (!pf) return null;

      const [categories] = await db.execute<RowDataPacket[]>(
        "SELECT * FROM user_categories WHERE portfolio_id = ?",
        [pf.id],
      );
      const [items] = await db.execute<RowDataPacket[]>(
        `SELECT ui.* FROM user_items ui
         JOIN user_categories uc ON ui.category_id = uc.id
         WHERE uc.portfolio_id = ?`,
        [pf.id],
      );

      return {
        id: pf.id,
        name: pf.name,
        description: pf.description,
        categories: categories.map((c) => ({
          id: c.id,
          code: c.code,
          name: c.name,
          description: c.description,
          portion: Number(c.portion),
        })),
        items: items.map((i) => ({
          id: i.id,
          categoryId: i.category_id,
          masterItemId: i.master_item_id,
          name: i.name,
          description: i.description,
          portion: Number(i.portion),
          isCustom: Boolean(i.is_custom),
          isCustomReturn: Boolean(i.is_custom_return),
          expectedReturn: {
            min: Number(i.min_return),
            max: Number(i.max_return),
          },
        })),
        expectedReturn: {
          min: Number(pf.min_return),
          max: Number(pf.max_return),
        },
        isCustomized: Boolean(pf.is_customized),
        updatedAt: pf.updated_at,
      };
    },

    findPresetsByReturn: async (targetReturnPercent) => {
      const [presets] = await db.execute<RowDataPacket[]>(
        `SELECT * FROM portfolio_presets ORDER BY ABS(target_return_percent - ?) ASC LIMIT 3`,
        [targetReturnPercent],
      );
      const mappedPresets = presets.map(async (preset) => {
        const [categories] = await db.execute<RowDataPacket[]>(
          `SELECT mc.name, ppc.portion FROM portfolio_preset_categories ppc
           JOIN master_categories mc ON ppc.master_category_id = mc.id
           WHERE ppc.preset_id = ?`,
          [preset.id],
        );
        return {
          code: preset.code,
          name: preset.name,
          description: preset.description,
          categories: categories.map((c) => ({
            name: c.name,
            portion: Number(c.portion),
          })),
          targetReturnPercent: preset.target_return_percent,
          expectedReturn: {
            min: Number(preset.min_return),
            max: Number(preset.max_return),
          },
        };
      });

      return await Promise.all(mappedPresets);
    },

    createPortfolioFromPreset: async (userId, presetCode) => {
      const conn = await db.getConnection();
      try {
        await conn.beginTransaction();

        const [[preset]] = await conn.execute<RowDataPacket[]>(
          "SELECT * FROM portfolio_presets WHERE code = ?",
          [presetCode],
        );

        // 프리셋 복제
        await conn.execute(
          `INSERT INTO user_portfolios (user_id, name, description, min_return, max_return, is_customized) 
           VALUES (?, ?, ?, ?, ?, 0)
           ON DUPLICATE KEY UPDATE 
           name = VALUES(name), 
           description = VALUES(description),
           min_return = VALUES(min_return),
           max_return = VALUES(max_return),
           is_customized = 0`,
          [
            userId,
            preset.name,
            preset.description,
            preset.min_return,
            preset.max_return,
          ],
        );

        const [[pf]] = await conn.execute<RowDataPacket[]>(
          "SELECT id FROM user_portfolios WHERE user_id = ?",
          [userId],
        );
        // 기존 자산군 있으면 모두 삭제
        await conn.execute(
          "DELETE FROM user_categories WHERE portfolio_id = ?",
          [pf.id],
        );

        // 프리셋 자산군 복제
        await conn.execute(
          `INSERT INTO user_categories (portfolio_id, code, name, description, portion)
           SELECT ?, mc.code, mc.name, mc.description, ppc.portion
           FROM portfolio_preset_categories ppc
           JOIN master_categories mc ON ppc.master_category_id = mc.id
           WHERE ppc.preset_id = ?`,
          [pf.id, preset.id],
        );
        // 프리셋 자산 복제
        await conn.execute(
          `INSERT INTO user_items (category_id, master_item_id, name, description, portion, min_return, max_return)
           SELECT uc.id, mi.id, mi.name, mi.description, ppi.portion, mi.min_return, mi.max_return
           FROM portfolio_preset_items ppi
           JOIN master_items mi ON ppi.master_item_id = mi.id
           JOIN master_categories mc ON mi.category_id = mc.id
           JOIN user_categories uc ON uc.portfolio_id = ? AND uc.code = mc.code
           WHERE ppi.preset_id = ?`,
          [pf.id, preset.id],
        );
        await conn.commit();
      } catch (e) {
        await conn.rollback();
        throw e;
      } finally {
        conn.release();
      }
    },

    // ==========================================
    // 2. 자산군(Category) 관련
    // ==========================================
    getCategories: async (portfolioId) => {
      const [categories] = await db.execute<RowDataPacket[]>(
        "SELECT * FROM user_categories WHERE portfolio_id = ?",
        [portfolioId],
      );
      return categories.map((category) => ({
        id: category.id,
        code: category.code,
        name: category.name,
        description: category.description,
        portion: Number(category.portion),
      }));
    },

    updateCategoryPortions: async (portfolioId, portions) => {
      const conn = await db.getConnection();
      try {
        await conn.beginTransaction();

        // 자산군 별로 업데이트 프로세스가 독립적이므로 병렬화 가능
        const updatePromises = portions.map(async (p) => {
          // 자산군에 속한 하위 자산에 먼저 자산군의 새 비중 전파
          await propagateCategoryPortionToItems(conn, p);
          // 자산군에 새 비중 반영
          await conn.execute(
            "UPDATE user_categories SET portion = ? WHERE id = ?",
            [p.portion, p.id],
          );
        });
        await Promise.all(updatePromises);

        await recalculatePortfolioMetrics(conn, portfolioId);
        await conn.commit();
      } catch (e) {
        await conn.rollback();
        throw e;
      } finally {
        conn.release();
      }
    },

    addCategory: async (portfolioId, masterCategoryId, customCategoryInfo) => {
      if (masterCategoryId) {
        await db.execute(
          `INSERT INTO user_categories (portfolio_id, code, name, description)
           SELECT ?, code, name, description FROM master_categories WHERE id = ?`,
          [portfolioId, masterCategoryId],
        );
      } else {
        await db.execute(
          `INSERT INTO user_categories (portfolio_id, code, name, description)
           VALUES (?, 'CUSTOM', ?, ?)`,
          [
            portfolioId,
            customCategoryInfo?.name,
            customCategoryInfo?.description,
          ],
        );
      }
    },

    deleteCategory: async (portfolioId, categoryId) => {
      const conn = await db.getConnection();
      try {
        await conn.beginTransaction();
        // 삭제 대상 카테고리의 비중 확인
        const [[category]] = await conn.execute<RowDataPacket[]>(
          "SELECT portion FROM user_categories WHERE id = ? AND portfolio_id = ?",
          [categoryId, portfolioId],
        );
        const p = Number(category?.portion) || 0;

        // 카테고리 삭제
        await conn.execute("DELETE FROM user_categories WHERE id = ?", [
          categoryId,
        ]);

        // 재분배: 남은 카테고리가 있을 때만 실행
        // p == 0 | 삭제하려는 카테고리의 비중이 0 > 지워도 변화 없음
        // p == 1 | 포트폴리오에 카테고리가 삭제하려는 카테고리 하나 밖에 없는 상태 > 그냥 0
        if (p > 0 && p < 1) {
          const ratio = 1 / (1 - p);
          await conn.execute(
            "UPDATE user_categories SET portion = portion * ? WHERE portfolio_id = ?",
            [ratio, portfolioId],
          );
          // 아이템 비중 업데이트
          await conn.execute(
            `UPDATE user_items ui JOIN user_categories uc ON ui.category_id = uc.id 
             SET ui.portion = ui.portion * ? WHERE uc.portfolio_id = ?`,
            [ratio, portfolioId],
          );
        }

        await recalculatePortfolioMetrics(conn, portfolioId);
        await conn.commit();
      } catch (e) {
        await conn.rollback();
        throw e;
      } finally {
        conn.release();
      }
    },

    updateCategoryInfo: async (id, categoryInfo) => {
      const { name = null, description = null } = categoryInfo;
      await db.execute(
        "UPDATE user_categories SET name = COALESCE(?, name), description = COALESCE(?, description) WHERE id = ?",
        [name, description, id],
      );
    },

    getAvailableCategories: async (portfolioId) => {
      const [availableCategories] = await db.execute<RowDataPacket[]>(
        `SELECT * FROM master_categories WHERE code NOT IN 
         (SELECT code FROM user_categories WHERE portfolio_id = ? AND code != 'CUSTOM')`,
        [portfolioId],
      );
      return availableCategories.map((category) => ({
        id: category.id,
        name: category.name,
        description: category.description,
      }));
    },

    // ==========================================
    // 3. 하위자산(Item) 관련
    // ==========================================
    getItems: async (portfolioId) => {
      const [items] = await db.execute<RowDataPacket[]>(
        `SELECT ui.* FROM user_items ui
         JOIN user_categories uc ON ui.category_id = uc.id
         WHERE uc.portfolio_id = ?`,
        [portfolioId],
      );
      return items.map((item) => ({
        id: item.id,
        categoryId: item.category_id,
        masterItemId: item.master_item_id,
        name: item.name,
        description: item.description,
        portion: Number(item.portion),
        expectedReturn: {
          min: Number(item.min_return),
          max: Number(item.max_return),
        },
        isCustomReturn: Boolean(item.is_custom_return),
        isCustom: Boolean(item.is_custom),
      }));
    },

    getItemsByCategory: async (categoryId) => {
      const [items] = await db.execute<RowDataPacket[]>(
        "SELECT * FROM user_items WHERE category_id = ?",
        [categoryId],
      );
      const [[category]] = await db.execute<RowDataPacket[]>(
        "SELECT portion FROM user_categories WHERE id = ?",
        [categoryId],
      );
      return items.map((item) => ({
        id: item.id,
        categoryId: item.category_id,
        masterItemId: item.master_item_id,
        name: item.name,
        description: item.description,
        portion:
          Number(category.portion) <= 0
            ? 0
            : Number(item.portion) / Number(category.portion),
        expectedReturn: {
          min: Number(item.min_return),
          max: Number(item.max_return),
        },
        isCustomReturn: Boolean(item.is_custom_return),
        isCustom: Boolean(item.is_custom),
      }));
    },

    updateItemAbsolutePortions: async (portfolioId, portions) => {
      const conn = await db.getConnection();
      try {
        await conn.beginTransaction();

        // 하위 자산들 절대비중 업데이트
        await Promise.all(
          portions.map(
            async (p) =>
              await conn.execute(
                "UPDATE user_items SET portion = ? WHERE id = ?",
                [p.portion, p.id],
              ),
          ),
        );

        // 자산군 비중 동기화
        await syncCategoryPortionFromItems(conn, portfolioId);
        await recalculatePortfolioMetrics(conn, portfolioId);
        await conn.commit();
      } catch (e) {
        await conn.rollback();
        throw e;
      } finally {
        conn.release();
      }
    },

    updateItemRelativePortions: async (categoryId, portions) => {
      const conn = await db.getConnection();
      try {
        await conn.beginTransaction();

        // 해당 자산군의 현재 비중 및 포폴 id 조회
        // 자산군 비중 -> 상대비중을 절대비중으로 변환시키기 위함
        // 포폴 id -> 수익률 재계산 위함
        const [[category]] = await conn.execute<RowDataPacket[]>(
          "SELECT portion, portfolio_id FROM user_categories WHERE id = ?",
          [categoryId],
        );

        await Promise.all(
          // 새로운 절대비중 = 자산군 비중 * 새로운 상대비중
          // 새로운 절대비중 반영
          portions.map(
            async (p) =>
              await conn.execute(
                "UPDATE user_items SET portion = ? WHERE id = ?",
                [category.portion * p.portion, p.id],
              ),
          ),
        );

        await recalculatePortfolioMetrics(conn, category.portfolio_id);
        await conn.commit();
      } catch (e) {
        await conn.rollback();
        throw e;
      } finally {
        conn.release();
      }
    },

    addItem: async (categoryId, masterItemId, customItemInfo) => {
      if (masterItemId) {
        await db.execute(
          `INSERT INTO user_items (category_id, master_item_id, name, description, min_return, max_return)
           SELECT ?, id, name, description, min_return, max_return FROM master_items WHERE id = ?`,
          [categoryId, masterItemId],
        );
      } else {
        await db.execute(
          `INSERT INTO user_items (category_id, name, description, min_return, max_return, is_custom, is_custom_return)
           VALUES (?, ?, ?, ?, ?, 1, 1)`,
          [
            categoryId,
            customItemInfo?.name,
            customItemInfo?.description,
            customItemInfo?.expectedReturn.min,
            customItemInfo?.expectedReturn.max,
          ],
        );
      }
    },

    deleteItem: async (portfolioId, itemId) => {
      const conn = await db.getConnection();
      try {
        await conn.beginTransaction();

        // 삭제 대상 아이템 조회
        const [[item]] = await conn.execute<RowDataPacket[]>(
          "SELECT portion FROM user_items WHERE id = ?",
          [itemId],
        );
        const p = Number(item?.portion) || 0;

        // 아이템 삭제
        await conn.execute("DELETE FROM user_items WHERE id = ?", [itemId]);

        // 아이템 비중 재분배 > 포트폴리오 전체 카테고리 비중 재계산 필요 X
        // item.p == 0 | 아이템의 비중이 0 > 지워도 변화 X
        // item.p == 1 | 아이템의 비중이 100% > 지우면 아이템 하나도 없으므로 아무것도 할 필요 X
        if (p > 0 && p < 1) {
          const ratio = 1 / (1 - p);
          await conn.execute(
            `UPDATE user_items ui
               JOIN user_categories uc ON ui.category_id = uc.id
               SET ui.portion = ui.portion * ?
               WHERE uc.portfolio_id = ?`,
            [ratio, portfolioId],
          );
          // 카테고리 비중 동기화
          await syncCategoryPortionFromItems(conn, portfolioId);
        }

        await recalculatePortfolioMetrics(conn, portfolioId);
        await conn.commit();
      } catch (e) {
        await conn.rollback();
        throw e;
      } finally {
        conn.release();
      }
    },

    updateItemInfo: async (itemId, itemInfo) => {
      const { name = null, description = null, expectedReturn } = itemInfo;
      const { min = null, max = null } = expectedReturn ?? {};
      await db.execute(
        `UPDATE user_items SET 
         name=COALESCE(?, name), description=COALESCE(?, description), 
         min_return=COALESCE(?, min_return), max_return=COALESCE(?, max_return), 
         is_custom_return=CASE WHEN ? IS NOT NULL THEN 1 ELSE is_custom_return END 
         WHERE id = ?`,
        [name, description, min, max, min, itemId],
      );
    },

    getAvailableItems: async (categoryId) => {
      const [[category]] = await db.execute<RowDataPacket[]>(
        "SELECT code FROM user_categories WHERE id = ?",
        [categoryId],
      );
      if (!category || category.code === "CUSTOM") return [];

      const [items] = await db.execute<RowDataPacket[]>(
        `SELECT mi.* FROM master_items mi
         JOIN master_categories mc ON mi.category_id = mc.id
         WHERE mc.code = ? 
         AND mi.id NOT IN (
         SELECT master_item_id FROM user_items 
         WHERE category_id = ? AND master_item_id IS NOT NULL)`,
        [category.code, categoryId],
      );

      return items.map((item) => ({
        id: item.id,
        categoryId: item.category_id,
        name: item.name,
        description: item.description,
        expectedReturn: {
          min: Number(item.min_return),
          max: Number(item.max_return),
        },
      }));
    },
  };
};
