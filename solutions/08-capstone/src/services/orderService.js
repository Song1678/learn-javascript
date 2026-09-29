/**
 * 订单服务（参考答案）
 */
import { AppError, ValidationError, ConflictError, assertFound } from '../errors.js';
import { withTimeout, retry, promisify, mapLimit, TimeoutError } from '../utils/async.js';

export const OrderStatus = Object.freeze({
  PENDING: 'PENDING',
  PAID: 'PAID',
  CANCELLED: 'CANCELLED',
});

const DEFAULT_CONFIG = {
  paymentTimeout: 3000,
  inventoryRetries: 2,
  retryDelay: 10,
  reserveConcurrency: 3,
};

export class OrderService {
  #db;
  #inventory;
  #charge;
  #bus;
  #nextId;
  #config;
  #paying = new Set(); // 正在支付中的订单号（防止重复支付）

  constructor({ db, inventory, payment, bus, nextId, config = {} }) {
    this.#db = db;
    this.#inventory = inventory;
    this.#bus = bus;
    this.#nextId = nextId;
    this.#config = { ...DEFAULT_CONFIG, ...config };
    // promisify 后的函数仍然需要以 payment 为 this 调用，这里直接 bind 好
    this.#charge = promisify(payment.charge).bind(payment);
  }

  /* ----------------------------- 创建订单 ----------------------------- */

  async createOrder(input) {
    const { userId, items } = this.#validateCreateInput(input);

    // 1. 并行查询商品信息
    const products = await Promise.all(items.map(({ sku }) => this.#db.getProduct(sku)));
    products.forEach((p, i) => assertFound(p, '商品', items[i].sku));

    // 2. 预占库存（限制并发 + 重试 + 失败补偿）
    const reservations = await this.#reserveAll(items);

    // 3. 计算金额（单位：分），保存订单
    const orderItems = items.map((item, i) => ({
      sku: item.sku,
      name: products[i].name,
      price: products[i].price,
      qty: item.qty,
      reservationId: reservations[i].reservationId,
    }));
    const order = {
      id: this.#nextId(),
      userId,
      items: orderItems,
      total: orderItems.reduce((sum, it) => sum + it.price * it.qty, 0),
      status: OrderStatus.PENDING,
      createdAt: Date.now(),
      paidAt: null,
      transactionId: null,
    };

    try {
      await this.#db.insertOrder(order);
    } catch (err) {
      // 订单没存下来，预占的库存也要还回去
      await this.#releaseAll(orderItems);
      throw err;
    }

    this.#bus.emit('order.created', order);
    return order;
  }

  #validateCreateInput(input) {
    const issues = [];
    const { userId, items } = input ?? {};
    if (typeof userId !== 'string' || userId.trim() === '') {
      issues.push({ path: 'userId', message: '必须是非空字符串' });
    }
    if (!Array.isArray(items) || items.length === 0) {
      issues.push({ path: 'items', message: '至少购买一件商品' });
    } else {
      items.forEach((item, i) => {
        if (typeof item?.sku !== 'string' || item.sku === '') {
          issues.push({ path: `items[${i}].sku`, message: '必须是非空字符串' });
        }
        if (!Number.isInteger(item?.qty) || item.qty <= 0) {
          issues.push({ path: `items[${i}].qty`, message: '必须是正整数' });
        }
      });
    }
    if (issues.length) throw new ValidationError('参数校验失败', issues);

    // 同一 SKU 出现多次时合并数量（保持首次出现的顺序）
    const merged = new Map();
    for (const { sku, qty } of items) merged.set(sku, (merged.get(sku) ?? 0) + qty);
    return { userId, items: [...merged].map(([sku, qty]) => ({ sku, qty })) };
  }

  async #reserveAll(items) {
    const { reserveConcurrency, inventoryRetries, retryDelay } = this.#config;

    // 关键：这里不能用「失败即停止」的方式！
    // 如果 A 失败时 B 还在预占途中，B 稍后成功了却没有人去释放它 → 库存泄漏。
    // 所以让每个预占都「不抛错」，等全部结束后再统一判断、统一补偿。
    const results = await mapLimit(items, reserveConcurrency, async ({ sku, qty }) => {
      try {
        const value = await retry(() => this.#inventory.reserve(sku, qty), {
          retries: inventoryRetries,
          delay: retryDelay,
          factor: 2,
          shouldRetry: (err) => err.retryable === true,
        });
        return { ok: true, value };
      } catch (error) {
        return { ok: false, error, sku };
      }
    });

    const failure = results.find((r) => !r.ok);
    if (!failure) return results.map((r) => r.value);

    // 补偿：释放所有已成功的预占
    await Promise.all(results.filter((r) => r.ok).map((r) => this.#inventory.release(r.value.reservationId)));

    if (failure.error.code === 'OUT_OF_STOCK') {
      throw new ConflictError('库存不足', { sku: failure.sku });
    }
    throw new AppError('库存服务不可用', {
      code: 'INVENTORY_UNAVAILABLE',
      status: 503,
      details: { sku: failure.sku },
      cause: failure.error,
    });
  }

  async #releaseAll(orderItems) {
    await Promise.all(orderItems.map((it) => this.#inventory.release(it.reservationId)));
  }

  /* ----------------------------- 查询 ----------------------------- */

  async getOrder(id) {
    return assertFound(await this.#db.getOrder(id), '订单', id);
  }

  /** 逐条遍历某用户的全部订单（自动翻页、惰性加载） */
  async *iterateOrders(userId, { pageSize = 20 } = {}) {
    let cursor = null;
    do {
      const page = await this.#db.listOrders({ userId, cursor, limit: pageSize });
      yield* page.items;
      cursor = page.nextCursor;
    } while (cursor !== null);
  }

  async getUserStats(userId) {
    const stats = {
      total: 0,
      byStatus: { [OrderStatus.PENDING]: 0, [OrderStatus.PAID]: 0, [OrderStatus.CANCELLED]: 0 },
      paidAmount: 0,
    };
    for await (const order of this.iterateOrders(userId, { pageSize: 50 })) {
      stats.total++;
      stats.byStatus[order.status]++;
      if (order.status === OrderStatus.PAID) stats.paidAmount += order.total;
    }
    return stats;
  }

  /* ----------------------------- 支付 ----------------------------- */

  async payOrder(id) {
    if (this.#paying.has(id)) {
      throw new ConflictError('订单正在支付中，请勿重复提交', { id });
    }
    this.#paying.add(id);
    try {
      const order = await this.getOrder(id);
      if (order.status !== OrderStatus.PENDING) {
        throw new ConflictError('订单状态不允许支付', { status: order.status });
      }

      let result;
      try {
        result = await withTimeout(
          this.#charge({ orderId: order.id, amount: order.total }),
          this.#config.paymentTimeout,
        );
      } catch (err) {
        if (err instanceof TimeoutError) {
          throw new AppError('支付超时，请稍后查询支付结果', { code: 'PAYMENT_TIMEOUT', status: 504, cause: err });
        }
        throw new AppError('支付失败', { code: 'PAYMENT_FAILED', status: 402, cause: err });
      }

      const paid = await this.#db.updateOrder(id, {
        status: OrderStatus.PAID,
        paidAt: Date.now(),
        transactionId: result.transactionId,
      });
      // 通知类的副作用失败不影响支付结果（EventBus 已做错误隔离）
      await this.#bus.emitAsync('order.paid', paid);
      return paid;
    } finally {
      this.#paying.delete(id);
    }
  }

  /* ----------------------------- 取消 ----------------------------- */

  async cancelOrder(id) {
    const order = await this.getOrder(id);
    if (order.status !== OrderStatus.PENDING) {
      throw new ConflictError('只有待支付的订单可以取消', { status: order.status });
    }
    if (this.#paying.has(id)) {
      throw new ConflictError('订单正在支付中，无法取消', { id });
    }
    await this.#releaseAll(order.items);
    const cancelled = await this.#db.updateOrder(id, { status: OrderStatus.CANCELLED });
    await this.#bus.emitAsync('order.cancelled', cancelled);
    return cancelled;
  }
}

