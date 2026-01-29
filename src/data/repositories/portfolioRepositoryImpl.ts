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
      "SELECT * FROM user_portfolio_asset_categories WHERE portfolio_id = ?",
      [pf.id],
    );
    const [items] = await db.execute<RowDataPacket[]>(
      `SELECT upai.* FROM user_portfolio_asset_items upai
       JOIN user_portfolio_asset_categories upac ON upai.user_category_id = upac.id
       WHERE upac.portfolio_id = ?`,
      [pf.id],
    );

    return {
      id: pf.id,
      name: pf.name,
      description: pf.description,
      categories: categories.map((c) => ({
        id: c.id,
        categoryCode: c.category_code,
        name: c.name,
        description: c.description,
        portion: Number(c.portion),
      })),
      items: items.map((i) => ({
        id: i.id,
        categoryId: i.user_category_id,
        name: i.name,
        description: i.description,
        portion: Number(i.abs_portion),
        isCustom: Boolean(i.is_custom),
        isCustomReturn: Boolean(i.is_custom_return),
        expectedReturn: {
          min: Number(i.min_return),
          max: Number(i.max_return),
        },
      })),
      totalExpectedReturn: {
        min: Number(pf.total_min_return),
        max: Number(pf.total_max_return),
      },
      isCustomized: Boolean(pf.is_customized),
      updatedAt: pf.updated_at,
    };
  },

  findPresetsByReturn: async (
    targetReturn: number,
  ): Promise<PortfolioPresetDto[]> => {
    const [rows] = await db.execute<RowDataPacket[]>(
      `SELECT * FROM portfolio_presets ORDER BY ABS(target_return_percent - ?) ASC LIMIT 3`,
      [targetReturn],
    );
    return rows.map((r) => ({
      presetCode: r.preset_code,
      name: r.name,
      description: r.description,
      targetReturnPercent: r.target_return_percent,
      expectedReturn: {
        min: Number(r.min_total_return),
        max: Number(r.max_total_return),
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

      await conn.execute(
        `INSERT INTO user_portfolios (user_id, name, description, total_min_return, total_max_return, is_customized) 
         VALUES (?, ?, ?, ?, ?, 0)
         ON DUPLICATE KEY UPDATE 
            name = VALUES(name), 
            description = VALUES(description),
            total_min_return = VALUES(total_min_return),
            total_max_return = VALUES(total_max_return),
            is_customized = 0`,
        [
          userId,
          preset.name,
          preset.description,
          preset.min_total_return,
          preset.max_total_return,
        ],
      );

      // 유저의 포트폴리오 조회
      const [[pf]] = await conn.execute<RowDataPacket[]>(
        "SELECT id FROM user_portfolios WHERE user_id = ?",
        [userId],
      );

      // 추천 프리셋을 갈아타는 거면 원래 거를 지워야..
      await conn.execute(
        "DELETE FROM user_portfolio_asset_categories WHERE portfolio_id = ?",
        [pf.id],
      );

      await conn.execute(
        `INSERT INTO user_portfolio_asset_categories (portfolio_id, category_code, name, description, portion)
         SELECT ?, mac.category_code, mac.name, mac.description, ppc.portion
         FROM portfolio_preset_categories ppc
         JOIN master_asset_categories mac ON ppc.master_category_id = mac.id
         WHERE ppc.preset_id = ?`,
        [pf.id, preset.id],
      );

      await conn.execute(
        `INSERT INTO user_portfolio_asset_items (user_category_id, name, description, abs_portion, rel_portion, min_return, max_return)
         SELECT upac.id, mai.name, mai.description, ppi.abs_portion, (ppi.abs_portion / upac.portion), mai.min_return, mai.max_return
         FROM portfolio_preset_items ppi
         JOIN master_asset_items mai ON ppi.master_asset_id = mai.id
         JOIN master_asset_categories mac ON mai.category_id = mac.id
         JOIN user_portfolio_asset_categories upac ON upac.portfolio_id = ? AND upac.category_code = mac.category_code
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
  // 2. 자산군(AssetType) 관련
  // ==========================================

  getCategories: async (portfolioId: number) => {
    const [rows] = await db.execute(
      "SELECT * FROM user_portfolio_asset_categories WHERE portfolio_id = ?",
      [portfolioId],
    );
    // TODO: 구조 분해 할당
    return rows as any[];
  },

  updateCategoryPortions: async (portfolioId, portions) => {
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();
      for (const p of portions) {
        await conn.execute(
          "UPDATE user_portfolio_asset_categories SET portion = ? WHERE id = ?",
          [p.portion, p.id],
        );
        await conn.execute(
          "UPDATE user_portfolio_asset_items SET abs_portion = rel_portion * ? WHERE user_category_id = ?",
          [p.portion, p.id],
        );
      }
      await conn.execute(
        "UPDATE user_portfolios SET is_customized = 1 WHERE id = ?",
        [portfolioId],
      );
      await conn.commit();
    } catch (e) {
      await conn.rollback();
      throw e;
    } finally {
      conn.release();
    }
  },

  addCategory: async (portfolioId, masterCategoryId, customData) => {
    if (masterCategoryId) {
      await db.execute(
        `INSERT INTO user_portfolio_asset_categories (portfolio_id, category_code, name, description)
         SELECT ?, category_code, name, description FROM master_asset_categories WHERE id = ?`,
        [portfolioId, masterCategoryId],
      );
    } else {
      await db.execute(
        `INSERT INTO user_portfolio_asset_categories (portfolio_id, category_code, name, description)
         VALUES (?, 'CUSTOM', ?, ?)`,
        [portfolioId, customData.name, customData.description],
      );
    }
  },

  deleteCategory: async (portfolioId, categoryId) => {
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();
      // 하위 자산 먼저 모두 삭제
      await conn.execute(
        "DELETE FROM user_portfolio_asset_items WHERE user_category_id = ?",
        [categoryId],
      );
      await conn.execute(
        "DELETE FROM user_portfolio_asset_categories WHERE id = ? AND portfolio_id = ?",
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

  updateCategoryInfo: async (id, name, description) => {
    await db.execute(
      "UPDATE user_portfolio_asset_categories SET name = COALESCE(?, name), description = COALESCE(?, description) WHERE id = ?",
      [name, description, id],
    );
  },

  getAvailableCategories: async (portfolioId) => {
    const [rows] = await db.execute(
      `SELECT * FROM master_asset_categories 
       WHERE category_code NOT IN 
       (SELECT category_code FROM user_portfolio_asset_categories
       WHERE portfolio_id = ? AND category_code != 'CUSTOM')`,
      [portfolioId],
    );
    return rows as any[];
  },

  // ==========================================
  // 3. 하위자산(Asset) 관련
  // ==========================================

  getItems: async (portfolioId) => {
    const [rows] = await db.execute(
      `SELECT upai.* FROM user_portfolio_asset_items upai
       JOIN user_portfolio_asset_categories upac ON upai.user_category_id = upac.id
       WHERE upac.portfolio_id = ?`,
      [portfolioId],
    );
    return rows as any[];
  },

  getItemsByCategory: async (categoryId) => {
    const [rows] = await db.execute(
      "SELECT * FROM user_portfolio_asset_items WHERE user_category_id = ?",
      [categoryId],
    );
    return rows as any[];
  },

  // TODO[매우중요]: 자산군 비중도 업데이트 해야 한다.
  updateItemAbsolutePortions: async (portfolioId, portions) => {
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();
      for (const p of portions) {
        const [[item]] = await conn.execute<RowDataPacket[]>(
          `SELECT upai.*, upac.portion as category_portion FROM user_portfolio_asset_items upai
           JOIN user_portfolio_asset_categories upac ON upai.user_category_id = upac.id
           WHERE upai.id = ?`,
          [p.id],
        );
        // 자산군 비중 0이면 하위 자산도 0이어야 함
        const relPortion =
          item.category_portion > 0 ? p.portion / item.category_portion : 0;
        await conn.execute(
          "UPDATE user_portfolio_asset_items SET abs_portion = ?, rel_portion = ? WHERE id = ?",
          [p.portion, relPortion, p.id],
        );
      }
      await conn.execute(
        "UPDATE user_portfolios SET is_customized = 1 WHERE id = ?",
        [portfolioId],
      );
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
      const [[category]] = await conn.execute<RowDataPacket[]>(
        "SELECT portion, portfolio_id FROM user_portfolio_asset_categories WHERE id = ?",
        [categoryId],
      );
      for (const p of portions) {
        await conn.execute(
          "UPDATE user_portfolio_asset_items SET rel_portion = ?, abs_portion = ? * rel_portion WHERE id = ?",
          [p.portion, category.portion, p.id],
        );
      }
      await conn.execute(
        "UPDATE user_portfolios SET is_customized = 1 WHERE id = ?",
        [category.portfolio_id],
      );
      await conn.commit();
    } catch (e) {
      await conn.rollback();
      throw e;
    } finally {
      conn.release();
    }
  },

  addItem: async (categoryId, masterItemId, customData) => {
    if (masterItemId) {
      await db.execute(
        `INSERT INTO user_portfolio_asset_items (user_category_id, name, description, min_return, max_return)
         SELECT ?, name, description, min_return, max_return FROM master_asset_items WHERE id = ?`,
        [categoryId, masterItemId],
      );
    } else {
      await db.execute(
        `INSERT INTO user_portfolio_asset_items (user_category_id, name, description, min_return, max_return, is_custom)
         VALUES (?, ?, ?, ?, ?, 1)`,
        [
          categoryId,
          customData.name,
          customData.description,
          customData.minReturn,
          customData.maxReturn,
        ],
      );
    }
  },

  deleteItem: async (id) => {
    await db.execute("DELETE FROM user_portfolio_asset_items WHERE id = ?", [
      id,
    ]);
  },

  updateItemInfo: async (id, data) => {
    const { name, description, minReturn, maxReturn } = data;
    await db.execute(
      `UPDATE user_portfolio_asset_items SET name=COALESCE(?, name), description=COALESCE(?, description), 
       min_return=COALESCE(?, min_return), max_return=COALESCE(?, max_return), 
       is_custom_return=CASE WHEN ? IS NOT NULL THEN 1 ELSE is_custom_return END WHERE id=?`,
      [
        name ?? null,
        description ?? null,
        minReturn ?? null,
        maxReturn ?? null,
        minReturn ?? null,
        id,
      ],
    );
  },

  getAvailableItems: async (categoryId) => {
    const [[cat]] = await db.execute<RowDataPacket[]>(
      "SELECT category_code FROM user_portfolio_asset_categories WHERE id = ?",
      [categoryId],
    );
    if (!cat || cat.category_code === "CUSTOM") return [];

    const [rows] = await db.execute(
      `SELECT mai.id as masterItemId, mai.name, mai.description, mai.min_return as minReturn, mai.max_return as maxReturn
       FROM master_asset_items mai
       JOIN master_asset_categories mac ON mai.category_id = mac.id
       WHERE mac.category_code = ? AND mai.name NOT IN (SELECT name FROM user_portfolio_asset_items WHERE user_category_id = ?)`,
      [cat.category_code, categoryId],
    );
    return rows as any[];
  },
});
