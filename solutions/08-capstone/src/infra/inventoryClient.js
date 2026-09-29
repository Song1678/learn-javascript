/**
 * 库存服务客户端（已提供，无需修改）
 *
 * 模拟一个远程的库存服务，它有以下「真实世界」的特点：
 *   - 网络延迟（可配置，也可以针对某个 SKU 单独配置）
 *   - 偶发的服务不可用：错误对象带有 code: 'UNAVAILABLE'、retryable: true，重试即可
 *   - 库存不足：错误对象带有 code: 'OUT_OF_STOCK'、retryable: false，重试也没用
 *
 * 预占（reserve）成功后会扣减可用库存；释放（release）预占后归还库存。
 */
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export class InventoryError extends Error {
  constructor(message, { code, retryable }) {
    super(message);
    this.name = 'InventoryError';
    this.code = code;
    this.retryable = retryable;
  }
}

/**
 * @param {object} options
 * @param {Record<string, number>} options.stock        初始库存 { SKU: 数量 }
 * @param {Record<string, number>} [options.flaky]      前 N 次对该 SKU 的 reserve 调用返回 UNAVAILABLE
 * @param {number} [options.latency=2]                  默认延迟
 * @param {Record<string, number>} [options.latencyBySku]  针对某个 SKU 的延迟
 */
export function createInventoryClient({ stock = {}, flaky = {}, latency = 2, latencyBySku = {} } = {}) {
  const available = new Map(Object.entries(stock));
  const failuresLeft = new Map(Object.entries(flaky));
  const reservations = new Map(); // reservationId -> { sku, qty }
  let seq = 0;
  let running = 0;

  const stats = { reserveCalls: 0, releaseCalls: 0, maxConcurrentReserves: 0 };

  return {
    stats,

    async reserve(sku, qty) {
      stats.reserveCalls++;
      running++;
      stats.maxConcurrentReserves = Math.max(stats.maxConcurrentReserves, running);
      try {
        await sleep(latencyBySku[sku] ?? latency);
        const left = failuresLeft.get(sku) ?? 0;
        if (left > 0) {
          failuresLeft.set(sku, left - 1);
          throw new InventoryError('库存服务暂时不可用', { code: 'UNAVAILABLE', retryable: true });
        }
        const current = available.get(sku) ?? 0;
        if (current < qty) {
          throw new InventoryError(`${sku} 库存不足`, { code: 'OUT_OF_STOCK', retryable: false });
        }
        available.set(sku, current - qty);
        const reservationId = `R${++seq}`;
        reservations.set(reservationId, { sku, qty });
        return { reservationId };
      } finally {
        running--;
      }
    },

    async release(reservationId) {
      stats.releaseCalls++;
      await sleep(latency);
      const r = reservations.get(reservationId);
      if (!r) return false; // 重复释放是安全的
      reservations.delete(reservationId);
      available.set(r.sku, (available.get(r.sku) ?? 0) + r.qty);
      return true;
    },

    /** 查询可用库存（测试辅助） */
    async getStock(sku) {
      return available.get(sku) ?? 0;
    },

    /** 当前未释放的预占数量（测试辅助：用于检查是否有「泄漏」的预占） */
    get activeReservations() {
      return reservations.size;
    },
  };
}
