import { RowDataPacket, PoolConnection, ResultSetHeader } from "mysql2/promise";
import db from "src/shared/infrastructure/db";
import { PortfolioRepository } from "../domain/portfolio.repo";
import { Portfolio, ExpectedReturn } from "../domain/portfolio.entity";

export const createPortfolioRepository = (): PortfolioRepository => {
  // --- 내부 헬퍼 함수 ---
  /**
   * 포트폴리오의 카테고리 비중이 변경되었을 때, 하위 item들의 비중을 재조정.
   * 기존 자산 비중 합이 0이었다면 균등 분배,
   * 0보다 컸다면 비율에 맞춰 스케일링.
   */
  const scaleCategoryItems = async (
    conn: PoolConnection,
    portfolioId: number,
    categoryId: number,
    newCategoryPortion: number,
  ) => {
    const [[metrics]] = await conn.execute<RowDataPacket[]>(
      `SELECT 
         COALESCE(SUM(portion), 0) AS currentTotal, 
         COUNT(*) AS itemCount 
       FROM item_allocation 
       WHERE portfolio_id = ? AND category_id = ?`,
      [portfolioId, categoryId],
    );

    const currentTotal = Number(metrics.currentTotal);
    const itemCount = Number(metrics.itemCount);

    if (itemCount === 0) return; // 할당된 자산이 없으면 스킵

    if (currentTotal > 0) {
      const ratio = newCategoryPortion / currentTotal;
      await conn.execute(
        `UPDATE item_allocation 
         SET portion = portion * ? 
         WHERE portfolio_id = ? AND category_id = ?`,
        [ratio, portfolioId, categoryId],
      );
    } else {
      const evenPortion = newCategoryPortion / itemCount;
      await conn.execute(
        `UPDATE item_allocation 
         SET portion = ? 
         WHERE portfolio_id = ? AND category_id = ?`,
        [evenPortion, portfolioId, categoryId],
      );
    }
  };

  /**
   * 포트폴리오 내 자산(item)들의 비중과 기대 수익률을 바탕으로,
   * 포트폴리오 전체의 최소/최대 기대 수익률을 재계산하고 업데이트합니다.
   */
  const recalculatePortfolioMetrics = async (
    conn: PoolConnection,
    portfolioId: number,
  ) => {
    const [[totalReturn]] = await conn.execute<RowDataPacket[]>(
      `SELECT 
         COALESCE(SUM(alloc.portion * i.min_return), 0) as new_min,
         COALESCE(SUM(alloc.portion * i.max_return), 0) as new_max
       FROM item_allocation alloc
       JOIN items i ON alloc.item_id = i.id
       WHERE alloc.portfolio_id = ?`,
      [portfolioId],
    );

    const new_min = Number(totalReturn?.new_min || 0);
    const new_max = Number(totalReturn?.new_max || 0);

    // 주의: 현재 portfolios 테이블에는 is_customized 컬럼이 없으므로 제외했습니다. (필요 시 스키마 추가)
    await conn.execute(
      `UPDATE portfolios 
       SET min_return = ?, max_return = ? 
       WHERE id = ?`,
      [new_min, new_max, portfolioId],
    );
  };

  /**
   * 특정 아이템(fixedItemId)의 비중을 고정하고,
   * 나머지 아이템들의 비중을 합계가 1.0이 되도록 비례적으로 조정합니다.
   */
  const rebalancePortions = async (
    conn: PoolConnection,
    portfolioId: number,
    fixedItemId: number | null, // 새로 추가/수정된 아이템 ID (삭제 시에는 null)
    fixedPortion: number, // 고정된 비중 (0.0 ~ 1.0)
  ) => {
    // 1. 고정된 아이템을 제외한 나머지 아이템들의 현재 비중 합계를 구함
    const [rows] = await conn.execute<RowDataPacket[]>(
      `SELECT SUM(portion) as othersSum, COUNT(*) as othersCount 
     FROM item_allocation 
     WHERE portfolio_id = ? AND item_id != ?`,
      [portfolioId, fixedItemId ?? -1], // 삭제 시에는 모든 아이템이 대상
    );

    const othersSum = Number(rows[0].othersSum || 0);
    const othersCount = Number(rows[0].othersCount || 0);
    const targetRemaining = 1.0 - fixedPortion;

    if (othersCount === 0) return; // 다른 아이템이 없으면 조정 불필요

    if (othersSum > 0) {
      // 2. 기존 비중이 있는 경우: 비율대로 스케일링
      const scaleFactor = targetRemaining / othersSum;
      await conn.execute(
        `UPDATE item_allocation 
       SET portion = portion * ? 
       WHERE portfolio_id = ? AND item_id != ?`,
        [scaleFactor, portfolioId, fixedItemId ?? -1],
      );
    } else {
      // 3. 기존 비중 합이 0인 경우(예: 처음 추가): 남은 비중을 N분의 1로 균등 배분
      const evenPortion = targetRemaining / othersCount;
      await conn.execute(
        `UPDATE item_allocation 
       SET portion = ? 
       WHERE portfolio_id = ? AND item_id != ?`,
        [evenPortion, portfolioId, fixedItemId ?? -1],
      );
    }
  };

  return {
    getAllPortfolios: async (userId) => {
      // 1. 모든 포트폴리오와 아이템 정보를 한 번에 가져오기 (1차 쿼리)
      const [itemRows] = await db.execute<RowDataPacket[]>(
        `SELECT 
          po.*,
          alloc.item_id, alloc.category_id as item_category_id, alloc.alias as item_name,
          alloc.description as item_description, alloc.portion as item_portion,
          i.min_return as item_min_return, i.max_return as item_max_return
         FROM portfolios po
         JOIN portfolio_ownership owner ON owner.portfolio_id = po.id
         LEFT JOIN item_allocation alloc ON alloc.portfolio_id = po.id
         LEFT JOIN items i ON i.id = alloc.item_id
         WHERE owner.user_id = ?
         ORDER BY po.created_at DESC`,
        [userId],
      );

      if (itemRows.length === 0) return [];

      // 2. 모든 포트폴리오의 카테고리별 요약 정보 가져오기 (2차 쿼리)
      const [categoryRows] = await db.execute<RowDataPacket[]>(
        `SELECT 
          alloc.portfolio_id,
          ca.id, ca.code, ca.name, ca.description,
          SUM(alloc.portion) as portion,
          SUM(alloc.portion * i.min_return) / NULLIF(SUM(alloc.portion), 0) as min_return,
          SUM(alloc.portion * i.max_return) / NULLIF(SUM(alloc.portion), 0) as max_return
         FROM item_allocation alloc
         JOIN categories ca ON ca.id = alloc.category_id
         JOIN items i ON i.id = alloc.item_id
         JOIN portfolio_ownership owner ON owner.portfolio_id = alloc.portfolio_id
         WHERE owner.user_id = ?
         GROUP BY alloc.portfolio_id, ca.id`,
        [userId],
      );

      // 3. 데이터를 Map을 활용해 조립 (O(N) 성능)
      const portfolioMap = new Map<number, Portfolio.Root>();

      // 아이템 데이터 매핑
      itemRows.forEach((row) => {
        if (!portfolioMap.has(row.id)) {
          portfolioMap.set(row.id, {
            id: row.id,
            name: row.name,
            description: row.description,
            status: row.status,
            categories: [], // 일단 빈 배열로 초기화
            items: [],
            expectedReturn: {
              min: Number(row.min_return),
              max: Number(row.max_return),
            },
            createdAt: row.created_at,
            updatedAt: row.updated_at,
          });
        }

        const portfolio = portfolioMap.get(row.id)!;
        if (row.item_id) {
          portfolio.items.push({
            id: row.item_id,
            categoryId: row.item_category_id,
            name: row.item_name || "",
            description: row.item_description || "",
            portion: Number(row.item_portion),
            expectedReturn: {
              min: Number(row.item_min_return),
              max: Number(row.item_max_return),
            },
          });
        }
      });

      // 카테고리 데이터 매핑
      categoryRows.forEach((row) => {
        const portfolio = portfolioMap.get(row.portfolio_id);
        if (portfolio) {
          portfolio.categories.push({
            id: row.id,
            code: row.code,
            name: row.name,
            description: row.description,
            portion: Number(row.portion),
            expectedReturn: {
              min: Number(row.min_return || 0),
              max: Number(row.max_return || 0),
            },
          });
        }
      });

      return Array.from(portfolioMap.values());
    },

    getPortfolio: async (userId, portfolioId) => {
      // 1. 포트폴리오 기본 정보 및 아이템 조회 (기존 유지)
      const [portfolioItems] = await db.execute<RowDataPacket[]>(
        `SELECT
         po.*,
         alloc.alias AS item_name,
         alloc.description AS item_description,
         alloc.portion AS item_portion,
         items.id AS item_id,
         items.category_id AS item_category_id,
         items.min_return AS item_min_return,
         items.max_return AS item_max_return
         FROM portfolios po
         JOIN portfolio_ownership owner ON owner.portfolio_id = po.id
         LEFT JOIN item_allocation alloc ON alloc.portfolio_id = po.id
         LEFT JOIN items ON items.id = alloc.item_id
         WHERE owner.user_id = ? AND owner.portfolio_id = ?`,
        [userId, portfolioId],
      );

      if (!portfolioItems || portfolioItems.length === 0) return null;

      // 2. 카테고리 정보 조회 (수익률 계산 추가)
      const [categories] = await db.execute<RowDataPacket[]>(
        `SELECT
         ca.*,
         SUM(alloc.portion) AS category_portion,
         -- 가중 평균 수익률 계산: SUM(아이템비중 * 수익률) / 카테고리전체비중
         SUM(alloc.portion * items.min_return) / NULLIF(SUM(alloc.portion), 0) AS category_min_return,
         SUM(alloc.portion * items.max_return) / NULLIF(SUM(alloc.portion), 0) AS category_max_return
         FROM item_allocation alloc 
         JOIN categories ca ON ca.id = alloc.category_id
         JOIN items ON items.id = alloc.item_id
         WHERE alloc.portfolio_id = ?
         GROUP BY ca.id, ca.code, ca.name, ca.description`,
        [portfolioId],
      );

      const base = portfolioItems[0];
      const hasItems = !!base.item_id;

      return {
        id: base.id,
        name: base.name,
        description: base.description,
        status: base.status,
        categories: categories.map((ca) => ({
          id: ca.id,
          code: ca.code,
          name: ca.name,
          description: ca.description,
          portion: Number(ca.category_portion),
          expectedReturn: {
            min: Number(ca.category_min_return || 0),
            max: Number(ca.category_max_return || 0),
          },
        })),
        items: hasItems
          ? portfolioItems.map((i) => ({
              id: i.item_id,
              categoryId: i.item_category_id,
              name: i.item_name || "",
              description: i.item_description || "",
              portion: Number(i.item_portion),
              expectedReturn: {
                min: Number(i.item_min_return),
                max: Number(i.item_max_return),
              },
            }))
          : [],
        expectedReturn: {
          min: Number(base.min_return),
          max: Number(base.max_return),
        },
        createdAt: base.created_at,
        updatedAt: base.updated_at,
      };
    },

    getPreset: async (targetReturnPercent) => {
      const [presets] = await db.execute<RowDataPacket[]>(
        `SELECT 
         pre.code, 
         pre.name AS preset_name,
         pre.description, 
         pre.target_return_percent, 
         pre.min_return, 
         pre.max_return, 
         categories.id AS category_id, 
         categories.code AS category_code, 
         categories.name AS category_name,
         SUM(alloc.portion) AS category_portion,
         GROUP_CONCAT(alloc.item_id ORDER BY alloc.item_id) AS item_ids,
         GROUP_CONCAT(alloc.portion ORDER BY alloc.item_id) AS item_portions
         FROM portfolio_presets pre
         JOIN preset_item_allocation alloc ON alloc.preset_id = pre.id
         JOIN categories ON categories.id = alloc.category_id
         GROUP BY 
         pre.id, pre.code, pre.name, pre.description, pre.target_return_percent, pre.min_return, pre.max_return, 
         categories.id, categories.code, categories.name
         HAVING ABS(target_return_percent - ?) < 2
         ORDER BY ABS(target_return_percent - ?) ASC`,
        [targetReturnPercent, targetReturnPercent],
      );

      return presets.reduce((acc: Portfolio.Preset[], row: any) => {
        let preset = acc.find((p) => p.code === row.code);
        if (!preset) {
          preset = {
            code: row.code,
            name: row.preset_name,
            description: row.description,
            targetReturnPercent: row.target_return_percent,
            expectedReturn: { min: row.min_return, max: row.max_return },
            categories: [],
            items: [],
          };
          acc.push(preset);
        }

        preset.categories.push({
          name: row.category_name,
          portion: Number(row.category_portion),
        });

        const ids = row.item_ids ? row.item_ids.split(",").map(Number) : [];
        const portions = row.item_portions
          ? row.item_portions.split(",").map(Number)
          : [];
        const mappedItems = ids.map((id: number, index: number) => ({
          id,
          portion: portions[index],
        }));
        preset.items.push(...mappedItems);

        return acc;
      }, []);
    },

    createPortfolioFromPreset: async (userId, presetCode) => {
      const conn = await db.getConnection();
      try {
        await conn.beginTransaction();
        const [presets] = await conn.execute<RowDataPacket[]>(
          `SELECT * FROM portfolio_presets WHERE code = ? LIMIT 1`,
          [presetCode],
        );
        if (presets.length === 0) throw new Error("Preset not found");
        const preset = presets[0];

        const [insertResult] = await conn.execute<ResultSetHeader>(
          `INSERT INTO portfolios (name, description, status, min_return, max_return)
           VALUES (?, ?, 'PENDING', ?, ?)`,
          [
            preset.name,
            preset.description,
            preset.min_return,
            preset.max_return,
          ],
        );
        const newPortfolioId = insertResult.insertId;

        await conn.execute(
          `INSERT INTO portfolio_ownership (user_id, portfolio_id) VALUES (?, ?)`,
          [userId, newPortfolioId],
        );

        await conn.execute(
          `INSERT INTO item_allocation (
            portfolio_id, item_id, category_id, 
            alias, description,
            portion
          )
           SELECT 
            ?, pia.item_id, pia.category_id, 
            i.name, i.description,
            pia.portion
           FROM preset_item_allocation pia
           JOIN items i ON i.id = pia.item_id
           WHERE pia.preset_id = ?`,
          [newPortfolioId, preset.id],
        );
        await conn.commit();
      } catch (e) {
        await conn.rollback();
        throw e;
      } finally {
        conn.release();
      }
    },

    updatePortfolioInfo: async (portfolioId, info) => {
      const updates = [];
      const values = [];
      if (info.name !== undefined) {
        updates.push("name = ?");
        values.push(info.name);
      }
      if (info.description !== undefined) {
        updates.push("description = ?");
        values.push(info.description);
      }
      if (updates.length === 0) return;
      values.push(portfolioId);
      await db.execute(
        `UPDATE portfolios SET ${updates.join(", ")} WHERE id = ?`,
        values,
      );
    },

    getCategories: async (portfolioId) => {
      const [rows] = await db.execute<RowDataPacket[]>(
        `SELECT 
          ca.id, 
          ca.code, 
          ca.name, 
          ca.description, 
          SUM(alloc.portion) AS portion,
          SUM(alloc.portion * i.min_return) / NULLIF(SUM(alloc.portion), 0) AS min_return,
          SUM(alloc.portion * i.max_return) / NULLIF(SUM(alloc.portion), 0) AS max_return
         FROM item_allocation alloc
         JOIN categories ca ON ca.id = alloc.category_id
         JOIN items i ON i.id = alloc.item_id
         WHERE alloc.portfolio_id = ?
         GROUP BY ca.id, ca.code, ca.name, ca.description`,
        [portfolioId],
      );

      return rows.map((r) => ({
        id: r.id,
        code: r.code,
        name: r.name,
        description: r.description,
        portion: Number(r.portion),
        expectedReturn: {
          min: Number(r.min_return || 0),
          max: Number(r.max_return || 0),
        },
      }));
    },

    updateCategoryPortions: async (portfolioId, portions) => {
      const conn = await db.getConnection();
      try {
        await conn.beginTransaction();
        for (const p of portions) {
          await scaleCategoryItems(conn, portfolioId, p.categoryId, p.portion);
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

    deleteCategory: async (portfolioId, categoryId) => {
      const conn = await db.getConnection();
      try {
        await conn.beginTransaction();
        await conn.execute(
          `DELETE FROM item_allocation WHERE portfolio_id = ? AND category_id = ?`,
          [portfolioId, categoryId],
        );
        await rebalancePortions(conn, portfolioId, null, 0);
        await recalculatePortfolioMetrics(conn, portfolioId);
        await conn.commit();
      } catch (e) {
        await conn.rollback();
        throw e;
      } finally {
        conn.release();
      }
    },

    getItems: async (portfolioId) => {
      const [rows] = await db.execute<RowDataPacket[]>(
        `SELECT alloc.item_id, alloc.category_id, alloc.alias, alloc.description, alloc.portion, i.min_return, i.max_return
         FROM item_allocation alloc 
         JOIN items i ON i.id = alloc.item_id WHERE alloc.portfolio_id = ?`,
        [portfolioId],
      );
      return rows.map((r) => ({
        id: r.item_id,
        categoryId: r.category_id,
        name: r.alias || "",
        description: r.description || "",
        portion: Number(r.portion),
        expectedReturn: {
          min: Number(r.min_return),
          max: Number(r.max_return),
        },
      }));
    },

    getItemsByCategory: async (portfolioId, categoryId) => {
      const [rows] = await db.execute<RowDataPacket[]>(
        `SELECT 
           alloc.item_id, 
           alloc.category_id, 
           alloc.alias, 
           alloc.description, 
           alloc.portion, -- DB에는 절대 비중이 저장됨
           i.min_return, 
           i.max_return
         FROM item_allocation alloc 
         JOIN items i ON i.id = alloc.item_id 
         WHERE alloc.portfolio_id = ? AND alloc.category_id = ?`,
        [portfolioId, categoryId],
      );

      const categoryTotalPortion = rows.reduce(
        (sum, r) => sum + Number(r.portion),
        0,
      );

      return rows.map((r) => {
        const absolutePortion = Number(r.portion);
        const relativePortion =
          categoryTotalPortion > 0 ? absolutePortion / categoryTotalPortion : 0;

        return {
          id: r.item_id,
          categoryId: r.category_id,
          name: r.alias || "",
          description: r.description || "",
          portion: relativePortion,
          expectedReturn: {
            min: Number(r.min_return),
            max: Number(r.max_return),
          },
        };
      });
    },

    addItem: async (portfolioId, itemId, portion, customInfo) => {
      const conn = await db.getConnection();
      try {
        await conn.beginTransaction();

        // 1. 아이템 조회
        const [masterItems] = await conn.execute<RowDataPacket[]>(
          `SELECT category_id, name, description FROM items WHERE id = ?`,
          [itemId],
        );

        if (masterItems.length === 0) {
          throw new Error("item not found");
        }

        const master = masterItems[0];

        // 2. item_allocation 테이블에 삽입
        await conn.execute(
          `INSERT INTO item_allocation (
            portfolio_id, 
            item_id, 
            category_id, 
            alias, 
            description, 
            portion
          ) VALUES (?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE 
            portion = portion + VALUES(portion)
          `,
          [
            portfolioId,
            itemId,
            master.category_id,
            customInfo?.name ?? master.name,
            customInfo?.description ?? master.description,
            portion,
          ],
        );
        await rebalancePortions(conn, portfolioId, itemId, portion);
        await recalculatePortfolioMetrics(conn, portfolioId);
        await conn.commit();
      } catch (e) {
        await conn.rollback();
        throw e;
      } finally {
        conn.release();
      }
    },

    updateItemAbsolutePortions: async (portfolioId, portions) => {
      const conn = await db.getConnection();
      try {
        await conn.beginTransaction();
        for (const p of portions) {
          await conn.execute(
            `UPDATE item_allocation SET portion = ? WHERE portfolio_id = ? AND item_id = ?`,
            [p.portion, portfolioId, p.itemId],
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

    updateItemRelativePortions: async (portfolioId, categoryId, portions) => {
      const conn = await db.getConnection();
      try {
        await conn.beginTransaction();
        const [[{ total_portion }]] = await conn.execute<RowDataPacket[]>(
          `SELECT COALESCE(SUM(portion), 0) as total_portion FROM item_allocation WHERE portfolio_id = ? AND category_id = ?`,
          [portfolioId, categoryId],
        );
        const categoryTotal = Number(total_portion);

        for (const p of portions) {
          const absolutePortion = categoryTotal * p.portion;
          await conn.execute(
            `UPDATE item_allocation SET portion = ? WHERE portfolio_id = ? AND category_id = ? AND item_id = ?`,
            [absolutePortion, portfolioId, categoryId, p.itemId],
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

    updateItemInfo: async (portfolioId, itemId, itemInfo) => {
      const updates = [];
      const values = [];
      if (itemInfo.name !== undefined) {
        updates.push("alias = ?");
        values.push(itemInfo.name);
      }
      if (itemInfo.description !== undefined) {
        updates.push("description = ?");
        values.push(itemInfo.description);
      }
      if (updates.length === 0) return;
      values.push(portfolioId, itemId);
      await db.execute(
        `UPDATE item_allocation SET ${updates.join(", ")} WHERE portfolio_id = ? AND item_id = ?`,
        values,
      );
    },

    deleteItem: async (portfolioId, itemId) => {
      const conn = await db.getConnection();
      try {
        await conn.beginTransaction();
        await conn.execute(
          `DELETE FROM item_allocation WHERE portfolio_id = ? AND item_id = ?`,
          [portfolioId, itemId],
        );
        await recalculatePortfolioMetrics(conn, portfolioId);
        await conn.commit();
      } catch (e) {
        await conn.rollback();
        throw e;
      } finally {
        conn.release();
      }
    },

    getAvailableCategories: async (userId, portfolioId) => {
      const [rows] = await db.execute<RowDataPacket[]>(
        `SELECT c.id, c.code, c.name, c.description
         FROM categories c
         WHERE (
           -- 1. 마스터 카테고리: 코드가 'CUSTOM'이 아닌 것 (STOCK, BOND 등)
           c.code != 'CUSTOM'
           OR
           -- 2. 유저 커스텀 카테고리: 코드가 'CUSTOM'이면서 내가 소유한 것
           (c.code = 'CUSTOM' AND EXISTS (
             SELECT 1 FROM category_ownership 
             WHERE category_id = c.id AND user_id = ?
           ))
         )
         -- 3. 이미 현재 포트폴리오에 아이템이 하나라도 담긴 카테고리는 제외
         AND c.id NOT IN (
           SELECT DISTINCT category_id 
           FROM item_allocation 
           WHERE portfolio_id = ?
         )`,
        [userId, portfolioId],
      );

      const result: Portfolio.AvailableCategory[] = rows.map((r) => ({
        id: r.id,
        name: r.name,
        description: r.description,
      }));
      return result;
    },

    getAvailableItems: async (userId, portfolioId) => {
      const [rows] = await db.execute<RowDataPacket[]>(
        `SELECT i.id, i.category_id, i.name, i.description, i.min_return, i.max_return
         FROM items i
         WHERE (
           -- 1. 마스터 아이템: 소유권 등록이 없는 공통 아이템 (나스닥100 등)
           NOT EXISTS (SELECT 1 FROM item_ownership WHERE item_id = i.id)
           OR
           -- 2. 유저 커스텀 아이템: 내가 소유권을 가진 아이템
           EXISTS (SELECT 1 FROM item_ownership WHERE item_id = i.id AND user_id = ?)
         )
         -- 3. 이미 현재 포트폴리오에 추가된 아이템은 제외
         AND i.id NOT IN (
           SELECT item_id 
           FROM item_allocation 
           WHERE portfolio_id = ?
         )`,
        [userId, portfolioId],
      );

      const result: Portfolio.AvailableItem[] = rows.map((r) => ({
        id: r.id,
        categoryId: r.category_id,
        name: r.name,
        description: r.description,
        expectedReturn: {
          min: Number(r.min_return),
          max: Number(r.max_return),
        },
      }));
      return result;
    },
  };
};
