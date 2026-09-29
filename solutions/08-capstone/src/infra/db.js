/**
 * 内存数据库（已提供，无需修改）
 *
 * 模拟一个异步的数据访问层：所有方法都返回 Promise，并带有少量延迟。
 * 返回的对象都是「拷贝」，修改它们不会影响数据库中的数据 —— 必须调用 update 方法才能持久化。
 * 金额单位统一为「分」（整数），避免浮点数精度问题（0.1 + 0.2 !== 0.3）。
 */
const clone = (v) => (v == null ? v : structuredClone(v));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export function createInMemoryDb({ products = [], latency = 1 } = {}) {
  const productTable = new Map(products.map((p) => [p.sku, { ...p }]));
  const orderTable = new Map(); // 按插入顺序
  const pointsTable = new Map();
  const stats = { listOrdersCalls: 0 };

  return {
    /** @returns {Promise<{ sku, name, price } | null>} price 单位：分 */
    async getProduct(sku) {
      await sleep(latency);
      return clone(productTable.get(sku) ?? null);
    },

    async insertOrder(order) {
      await sleep(latency);
      if (orderTable.has(order.id)) throw new Error(`Duplicate order id: ${order.id}`);
      orderTable.set(order.id, clone(order));
      return clone(order);
    },

    /** @returns {Promise<object | null>} */
    async getOrder(id) {
      await sleep(latency);
      return clone(orderTable.get(id) ?? null);
    },

    /** 合并更新，返回更新后的订单；订单不存在时返回 null */
    async updateOrder(id, patch) {
      await sleep(latency);
      const current = orderTable.get(id);
      if (!current) return null;
      const next = { ...current, ...clone(patch) };
      orderTable.set(id, next);
      return clone(next);
    },

    /**
     * 游标分页查询某用户的订单（按创建顺序）
     * @param {{ userId: string, cursor?: string | null, limit?: number }} query
     * @returns {Promise<{ items: object[], nextCursor: string | null }>}
     */
    async listOrders({ userId, cursor = null, limit = 20 }) {
      stats.listOrdersCalls++;
      await sleep(latency);
      const all = [...orderTable.values()].filter((o) => o.userId === userId);
      const start = cursor === null ? 0 : Number(cursor);
      const items = all.slice(start, start + limit);
      const next = start + limit;
      return { items: clone(items), nextCursor: next < all.length ? String(next) : null };
    },

    async addPoints(userId, points) {
      await sleep(latency);
      pointsTable.set(userId, (pointsTable.get(userId) ?? 0) + points);
      return pointsTable.get(userId);
    },

    async getPoints(userId) {
      await sleep(latency);
      return pointsTable.get(userId) ?? 0;
    },

    /** 测试辅助：listOrders 被调用的次数 */
    stats,
  };
}
