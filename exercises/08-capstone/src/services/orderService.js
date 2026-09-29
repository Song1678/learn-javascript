/**
 * 订单服务 —— 本项目的核心业务逻辑，也是你要完成的主要部分
 *
 * 详细需求见 exercises/08-capstone/README.md，这里只列出每个方法的要点。
 * 建议完成顺序：constructor → getOrder → createOrder → payOrder → cancelOrder → iterateOrders → getUserStats
 *
 * 可用的依赖（通过构造函数注入）：
 *   db         infra/db.js                  getProduct / insertOrder / getOrder / updateOrder / listOrders
 *   inventory  infra/inventoryClient.js     reserve(sku, qty) / release(reservationId)
 *   payment    infra/paymentSdk.js          charge({ orderId, amount }, callback) —— 回调风格，依赖 this
 *   bus        eventBus.js                  emit / emitAsync
 *   nextId     () => string                 生成订单号
 *   config     见 DEFAULT_CONFIG
 */
import { AppError, ValidationError, ConflictError, assertFound } from '../errors.js';
import { withTimeout, retry, promisify, mapLimit, TimeoutError } from '../utils/async.js';

export const OrderStatus = Object.freeze({
  PENDING: 'PENDING',
  PAID: 'PAID',
  CANCELLED: 'CANCELLED',
});

const DEFAULT_CONFIG = {
  paymentTimeout: 3000, // 支付超时（毫秒）
  inventoryRetries: 2, // 库存服务不可用时的重试次数
  retryDelay: 10, // 重试的初始间隔（毫秒），按 2 倍指数退避
  reserveConcurrency: 3, // 预占库存的最大并发数
};

export class OrderService {
  #db;
  #inventory;
  #bus;
  #nextId;
  #config;
  #charge; // Promise 版本的扣款函数

  constructor({ db, inventory, payment, bus, nextId, config = {} }) {
    this.#db = db;
    this.#inventory = inventory;
    this.#bus = bus;
    this.#nextId = nextId;
    this.#config = { ...DEFAULT_CONFIG, ...config };
    // TODO: 把 payment.charge 转换成返回 Promise 的函数，赋值给 this.#charge
    //       注意：charge 内部依赖 this（payment 实例）
  }

  /**
   * 创建订单
   * @param {{ userId: string, items: { sku: string, qty: number }[] }} input
   * @returns {Promise<Order>}
   *
   * 1. 校验参数，不合法时抛出 ValidationError(message, details)，details 为 [{ path, message }]，报告所有错误
   *      userId：非空字符串；items：非空数组；items[i].sku：非空字符串；items[i].qty：正整数
   *    同一 SKU 出现多次时合并数量
   * 2. 并行查询所有商品，任一不存在则抛出 NotFoundError('商品', sku)（提示：assertFound）
   * 3. 预占库存：
   *      - 并发数不超过 config.reserveConcurrency
   *      - err.retryable 为 true 时重试（config.inventoryRetries 次，config.retryDelay 起始间隔，2 倍退避）
   *      - 任一 SKU 预占失败 → 释放「所有已成功」的预占，然后：
   *          库存不足（err.code === 'OUT_OF_STOCK'）→ ConflictError('库存不足', { sku })
   *          其它（重试耗尽）→ AppError('库存服务不可用', { code: 'INVENTORY_UNAVAILABLE', status: 503, details: { sku }, cause: err })
   *      - ⚠️ 陷阱：如果用「失败即停止」的方式，失败时还在途中的预占稍后成功了，就没人释放了（库存泄漏）
   * 4. 生成订单并保存：
   *      { id, userId, items: [{ sku, name, price, qty, reservationId }], total, status: 'PENDING',
   *        createdAt: Date.now(), paidAt: null, transactionId: null }
   *      total = Σ price × qty（单位：分）
   * 5. 发布 'order.created' 事件，返回订单
   */
  async createOrder(input) {
    // TODO
    throw new Error('TODO: 实现 createOrder');
  }

  /**
   * 查询订单，不存在时抛出 NotFoundError('订单', id)
   */
  async getOrder(id) {
    // TODO
    throw new Error('TODO: 实现 getOrder');
  }

  /**
   * 支付订单
   * 1. 订单必须存在，且状态为 PENDING，否则 ConflictError('订单状态不允许支付', { status })
   * 2. 防重复支付：同一订单正在支付中时，再次调用立即抛出 ConflictError（不能扣两次钱！）
   *    提示：用一个 Set 记录「支付中」的订单号，无论成功失败都要在最后移除
   * 3. 调用 this.#charge({ orderId, amount: total })，并用 withTimeout 加上 config.paymentTimeout 超时
   *      超时 → AppError('支付超时，请稍后查询支付结果', { code: 'PAYMENT_TIMEOUT', status: 504, cause })
   *      失败 → AppError('支付失败', { code: 'PAYMENT_FAILED', status: 402, cause })
   *      以上两种情况订单保持 PENDING
   * 4. 成功 → 更新订单 { status: 'PAID', paidAt: Date.now(), transactionId }
   * 5. await bus.emitAsync('order.paid', 更新后的订单)，返回更新后的订单
   */
  async payOrder(id) {
    // TODO
    throw new Error('TODO: 实现 payOrder');
  }

  /**
   * 取消订单
   * 1. 只有 PENDING 状态的订单可以取消，否则 ConflictError
   * 2. 正在支付中的订单不能取消，ConflictError
   * 3. 释放该订单所有明细的库存预占（并行）
   * 4. 更新状态为 CANCELLED，await bus.emitAsync('order.cancelled', 更新后的订单)，返回更新后的订单
   */
  async cancelOrder(id) {
    // TODO
    throw new Error('TODO: 实现 cancelOrder');
  }

  /**
   * 异步生成器：逐条产出某用户的全部订单（按创建顺序）
   * 使用 db.listOrders({ userId, cursor, limit: pageSize }) 自动翻页；惰性加载，提前 break 不请求后续页
   */
  async *iterateOrders(userId, { pageSize = 20 } = {}) {
    // TODO
  }

  /**
   * 用户订单统计（使用 iterateOrders 实现）
   * @returns {Promise<{ total: number, byStatus: { PENDING, PAID, CANCELLED }, paidAmount: number }>}
   */
  async getUserStats(userId) {
    // TODO
    throw new Error('TODO: 实现 getUserStats');
  }
}
