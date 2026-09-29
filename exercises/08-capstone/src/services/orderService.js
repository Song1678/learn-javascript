/**
 * 订单服务 —— 本项目的核心业务逻辑，也是你要完成的主要部分
 *
 * 详细需求和「关卡」划分见 exercises/08-capstone/README.md，这里只列出每个方法的要点。
 * 卡住时看同目录的 ../../HINTS.md。
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
  #paying = new Set(); // 正在支付中的订单号（用于防重复支付，关卡 5）

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
   * 这个方法比较长，已经帮你拆成了 5 步和 3 个私有辅助方法。
   * 建议：先实现第 1、2、4、5 步（预占库存时暂时直接 for 循环逐个调用 inventory.reserve），
   *      让「正常下单」的测试通过；然后再按关卡说明完善 #reserveAll。
   */
  async createOrder(input) {
    // 第 1 步：校验参数并合并重复 SKU
    const { userId, items } = this.#validateCreateInput(input);

    // 第 2 步：并行查询所有商品（Promise.all + this.#db.getProduct），
    //         任何一个是 null 就抛出 NotFoundError('商品', sku)（提示：assertFound(商品, '商品', sku)）
    // TODO: const products = ...

    // 第 3 步：预占库存，得到每个商品的 { reservationId }（顺序与 items 一致）
    // TODO: const reservations = await this.#reserveAll(items);

    // 第 4 步：组装订单对象并保存（this.#db.insertOrder）
    //   {
    //     id: this.#nextId(),
    //     userId,
    //     items: [{ sku, name, price, qty, reservationId }],   // name、price 来自商品信息
    //     total: Σ price × qty,
    //     status: OrderStatus.PENDING,
    //     createdAt: Date.now(),
    //     paidAt: null,
    //     transactionId: null,
    //   }
    // TODO

    // 第 5 步：发布事件 this.#bus.emit('order.created', order)，返回订单
    // TODO
    throw new Error('TODO: 实现 createOrder');
  }

  /**
   * 校验下单参数（关卡 2）
   *   - 不合法时抛出 new ValidationError('参数校验失败', issues)，issues 为 [{ path, message }]，要报告「所有」错误
   *       userId          必须是非空字符串           path: 'userId'
   *       items           必须是非空数组             path: 'items'
   *       items[i].sku    必须是非空字符串           path: `items[${i}].sku`
   *       items[i].qty    必须是正整数               path: `items[${i}].qty`
   *   - input 本身可能是 undefined
   *   - 合法时返回 { userId, items }；[进阶] 同一 SKU 出现多次时合并数量（提示：Map）
   */
  #validateCreateInput(input) {
    // TODO
    return input;
  }

  /**
   * 预占所有商品的库存（关卡 3），返回 [{ reservationId }]，顺序与 items 一致
   *
   * 分三个小步骤完成（每完成一步跑一次测试）：
   *   3.1 逐个调用 this.#inventory.reserve(sku, qty)
   *   3.2 加上重试：err.retryable 为 true 时重试（用 retry，参数见 this.#config），库存不足直接失败
   *   3.3 [进阶] 用 mapLimit 限制并发；任一失败时释放所有已成功的预占，再抛出：
   *         库存不足（err.code === 'OUT_OF_STOCK'）→ new ConflictError('库存不足', { sku })
   *         其它 → new AppError('库存服务不可用', { code: 'INVENTORY_UNAVAILABLE', status: 503, details: { sku }, cause: err })
   *       ⚠️ 陷阱：如果失败时还有预占在「途中」，它稍后成功了就没人释放了。
   *         解决思路：让每个预占任务都「不抛错」，而是返回 { ok: true, value } 或 { ok: false, error, sku }，
   *         等全部结束后再统一检查、统一释放。
   */
  async #reserveAll(items) {
    // TODO
  }

  /** 释放订单明细中所有的库存预占（并行）：this.#inventory.release(item.reservationId) */
  async #releaseAll(orderItems) {
    // TODO
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
    // 第 1 步（关卡 5 再做）：[进阶] 防重复支付
    //   if (this.#paying.has(id)) throw new ConflictError(...)
    //   this.#paying.add(id)，并用 try { 下面所有步骤 } finally { this.#paying.delete(id) } 包起来

    // 第 2 步：查询订单（this.getOrder 会自动处理不存在的情况），检查状态必须为 PENDING
    // TODO

    // 第 3 步：扣款，加超时。把可能出现的两种错误转换成业务错误：
    //   let result;
    //   try {
    //     result = await withTimeout(this.#charge({ orderId: order.id, amount: order.total }), this.#config.paymentTimeout);
    //   } catch (err) {
    //     if (err instanceof TimeoutError) throw new AppError(...PAYMENT_TIMEOUT...);
    //     throw new AppError(...PAYMENT_FAILED...);
    //   }
    // TODO

    // 第 4 步：更新订单 { status: PAID, paidAt: Date.now(), transactionId: result.transactionId }
    // 第 5 步：await this.#bus.emitAsync('order.paid', 更新后的订单)，返回更新后的订单
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
    // 第 1 步：查询订单，状态必须为 PENDING；[进阶] 正在支付中（this.#paying.has(id)）也不能取消
    // 第 2 步：释放库存 await this.#releaseAll(order.items)
    // 第 3 步：更新状态为 CANCELLED，await this.#bus.emitAsync('order.cancelled', 更新后的订单)，返回更新后的订单
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
