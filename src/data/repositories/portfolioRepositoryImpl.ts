import { RowDataPacket, ResultSetHeader } from "mysql2/promise";
import { UUID } from "crypto";
import db from "src/data/config/db";
import { PortfolioRepository } from "src/domain/repositories/portfolioRepository";
import {
  PortfolioDto,
  PortfolioPresetDto,
} from "src/domain/models/dtos/portfolioDto";

export const createPortfolioRepository = (): PortfolioRepository => ({
  // ==========================================
  // 1. 전체 & 추천 (Global & Recommendations)
  // ==========================================

  getPortfolioByUserId: async (userId: UUID): Promise<PortfolioDto | null> => {
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
       JOIN user_categories uc ON ui.user_category_id = uc.id
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
        categoryId: i.user_category_id,
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

  findPresetsByReturn: async (
    targetReturnPercent: number,
  ): Promise<PortfolioPresetDto[]> => {
    const [presets] = await db.execute<RowDataPacket[]>(
      `SELECT * FROM portfolio_presets ORDER BY ABS(target_return_percent - ?) ASC LIMIT 3`,
      [targetReturnPercent],
    );
    return presets.map((preset) => ({
      code: preset.code,
      name: preset.name,
      description: preset.description,
      targetReturnPercent: preset.target_return_percent,
      expectedReturn: {
        min: Number(preset.min_total_return),
        max: Number(preset.max_total_return),
      },
    }));
  },

  createPortfolioFromPreset: async (userId, presetCode) => {
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();

      const [[preset]] = await conn.execute<RowDataPacket[]>(
        "SELECT * FROM portfolio_presets WHERE preset_code = ?",
        [presetCode],
      );
      if (!preset) throw new Error("Preset not found");

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
      await conn.execute("DELETE FROM user_categories WHERE portfolio_id = ?", [
        pf.id,
      ]);

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
        `INSERT INTO user_items (user_category_id, name, description, abs_portion, min_return, max_return)
         SELECT uc.id, mi.name, mi.description, ppi.abs_portion, mi.min_return, mi.max_return
         FROM portfolio_preset_items ppi
         JOIN master_items mi ON ppi.master_asset_id = mi.id
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

  getCategories: async (portfolioId: number) => {
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

  // TODO: MUST BE TESTED !!!
  updateCategoryPortions: async (portfolioId, portions) => {
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();
      for (const p of portions) {
        // 수익률 업데이트 하기 위해서 미리 받아놓기
        const [items] = await conn.execute<RowDataPacket[]>(
          `SELECT ui.id, ui.portion as old_abs_portion, uc.portion as old_cat_portion
           FROM user_items ui
           JOIN user_categories uc ON ui.user_category_id = uc.id
           WHERE uc.portfolio_id = ? AND uc.id = ?`,
          [portfolioId, p.id],
        );

        // 자산군에 새 비중 반영
        await conn.execute(
          "UPDATE user_categories SET portion = ? WHERE id = ?",
          [p.portion, p.id],
        );

        for (const item of items) {
          const oldCatPortion = Number(item.old_cat_portion) || 0;
          const oldAbsPortion = Number(item.old_abs_portion) || 0;

          let newAbsPortion = 0;
          // 기존 자산군이 쓰이고 있었다면 (비중이 0 이상)
          if (oldCatPortion > 0) {
            // 기존 상대 비중 그대로 이용
            newAbsPortion = (oldAbsPortion / oldCatPortion) * p.portion;
          } else if (items.length > 0) {
            // 기존에 자산군 비중 0이었으면 균등 분배
            newAbsPortion = p.portion / items.length;
          }

          // 새로운 수익률 반영
          await conn.execute("UPDATE user_items SET portion = ? WHERE id = ?", [
            newAbsPortion,
            item.id,
          ]);
        }
      }

      // 포트폴리오 전체 수익률 재계산
      // SUM(하위자산 비중 * 하위자산 수익률)
      const [[totalReturn]] = await conn.execute<RowDataPacket[]>(
        `SELECT 
         SUM(ui.portion * ui.min_return) as new_min,
         SUM(ui.portion * ui.max_return) as new_max
         FROM user_items ui
         JOIN user_categories uc ON ui.user_category_id = uc.id
         WHERE uc.portfolio_id = ?`,
        [portfolioId],
      );
      const { new_min, new_max } = totalReturn;

      // 유저 포폴 수익률 및 플래그 업데이트
      await conn.execute(
        `UPDATE user_portfolios 
         SET min_return = ?, max_return = ?, is_customized = 1 
         WHERE id = ?`,
        [new_min || 0, new_max || 0, portfolioId],
      );

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
      await conn.execute("DELETE FROM user_items WHERE user_category_id = ?", [
        categoryId,
      ]);
      await conn.execute(
        "DELETE FROM user_categories WHERE id = ? AND portfolio_id = ?",
        [categoryId, portfolioId],
      );
      await conn.commit();
    } catch (e) {
      await conn.rollback();
      throw e;
    } finally {
      conn.release();
    }
  },

  updateCategoryInfo: async (id, categoryInfo) => {
    const { name, description } = categoryInfo;
    await db.execute(
      "UPDATE user_categories SET name = COALESCE(?, name), description = COALESCE(?, description) WHERE id = ?",
      [name ?? null, description ?? null, id],
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
       JOIN user_categories uc ON ui.user_category_id = uc.id
       WHERE uc.portfolio_id = ?`,
      [portfolioId],
    );
    return items.map((item) => ({
      id: item.id,
      categoryId: item.categoryId,
      name: item.name,
      description: item.description,
      portion: Number(item.portion),
      expectedReturn: {
        min: Number(item.min_return),
        max: Number(item.max_return),
      },
      isCustomReturn: Boolean(item.isCustomReturn),
      isCustom: Boolean(item.isCustom),
    }));
  },

  getItemsByCategory: async (categoryId) => {
    const [items] = await db.execute<RowDataPacket[]>(
      "SELECT * FROM user_items WHERE user_category_id = ?",
      [categoryId],
    );
    return items.map((item) => ({
      id: item.id,
      categoryId: item.categoryId,
      name: item.name,
      description: item.description,
      portion: Number(item.portion),
      expectedReturn: {
        min: Number(item.min_return),
        max: Number(item.max_return),
      },
      isCustomReturn: Boolean(item.isCustomReturn),
      isCustom: Boolean(item.isCustom),
    }));
  },

  // TODO: MUST BE TESTED !!!
  updateItemAbsolutePortions: async (portfolioId, portions) => {
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();

      // 하위자산들 절대비중 업데이트
      for (const p of portions) {
        await conn.execute("UPDATE user_items SET portion = ? WHERE id = ?", [
          p.portion,
          p.id,
        ]);
      }

      // 자산군 비중 동기화 (하위자산 비중들의 합)
      await conn.execute(
        `UPDATE user_categories uc
         SET portion = (SELECT SUM(portion) FROM user_items WHERE user_category_id = uc.id)
         WHERE portfolio_id = ?`,
        [portfolioId],
      );

      // 포폴 전체 수익률 재계산
      const [[totalReturn]] = await conn.execute<RowDataPacket[]>(
        `SELECT 
        SUM(ui.portion * ui.min_return) as new_min,
        SUM(ui.portion * ui.max_return) as new_max
        FROM user_items ui
        JOIN user_categories uc ON ui.user_category_id = uc.id
        WHERE uc.portfolio_id = ?`,
        [portfolioId],
      );
      const { new_min, new_max } = totalReturn;

      // 전체 포폴 수익률 및 플래그 업데이트
      await conn.execute(
        "UPDATE user_portfolios SET min_return = ?, max_return = ?, is_customized = 1 WHERE id = ?",
        [new_min || 0, new_max || 0, portfolioId],
      );

      await conn.commit();
    } catch (e) {
      await conn.rollback();
      throw e;
    } finally {
      conn.release();
    }
  },

  // TODO: MUST BE TESTED !!!
  updateItemRelativePortions: async (categoryId, portions) => {
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();

      // 해당 자산군의 현재 비중 및 포폴 id 조회
      const [[category]] = await conn.execute<RowDataPacket[]>(
        "SELECT portion, portfolio_id FROM user_categories WHERE id = ?",
        [categoryId],
      );
      if (!category) throw new Error("Category not found");

      // 상대비중으로 절대비중 계산 및 업데이트
      for (const p of portions) {
        // 새로운 절대비중 = 자산군 비중 * 새로운 상대비중
        const newAbsPortion = category.portion * p.portion;
        // 새로운 절대비중 반영
        await conn.execute("UPDATE user_items SET portion = ? WHERE id = ?", [
          newAbsPortion,
          p.id,
        ]);
      }

      // 포폴 전체 수익률 동기화
      const [[totalReturn]] = await conn.execute<RowDataPacket[]>(
        `SELECT 
        SUM(ui.portion * ui.min_return) as new_min,
        SUM(ui.portion * ui.max_return) as new_max
        FROM user_items ui
        JOIN user_categories uc ON ui.user_category_id = uc.id
        WHERE uc.portfolio_id = ?`,
        [category.portfolio_id],
      );
      const { new_min, new_max } = totalReturn;

      // 전체 포폴 수익률 및 플래그 업데이트
      await conn.execute(
        "UPDATE user_portfolios SET min_return = ?, max_return = ?, is_customized = 1 WHERE id = ?",
        [new_min || 0, new_max || 0, category.portfolio_id],
      );

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
        `INSERT INTO user_items (user_category_id, name, description, min_return, max_return)
         SELECT ?, name, description, min_return, max_return FROM master_asset_items WHERE id = ?`,
        [categoryId, masterItemId],
      );
    } else {
      await db.execute(
        `INSERT INTO user_items (user_category_id, name, description, min_return, max_return, is_custom)
         VALUES (?, ?, ?, ?, ?, 1)`,
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

  deleteItem: async (id) => {
    await db.execute("DELETE FROM user_items WHERE id = ?", [id]);
  },

  updateItemInfo: async (id, itemInfo) => {
    await db.execute(
      `UPDATE user_items SET 
       name=COALESCE(?, name), description=COALESCE(?, description), 
       min_return=COALESCE(?, min_return), max_return=COALESCE(?, max_return), 
       is_custom_return=CASE WHEN ? IS NOT NULL THEN 1 ELSE is_custom_return END 
       WHERE id = ?`,
      [
        itemInfo.name ?? null,
        itemInfo.description ?? null,
        itemInfo.expectedReturn?.min ?? null,
        itemInfo.expectedReturn?.max ?? null,
        itemInfo.expectedReturn?.min ?? null,
        id,
      ],
    );
  },

  // TODO: MUST BE TESTED !!!
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
         WHERE user_category_id = ? AND master_item_id IS NOT NULL
       )`,
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
});
