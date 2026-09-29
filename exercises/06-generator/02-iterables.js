/**
 * 练习 6-2：迭代器协议与生成器基础
 *
 * 【业务背景】
 * 1. 订单号生成：格式为「前缀 + 日期 + 当日流水号」，例如 SO20260929000001。
 *    流水号每天从 1 重新开始。用生成器实现，业务代码只需要不断 next() 取号。
 * 2. 订单簿（OrderBook）：一个订单集合类，希望它能像数组一样被 for...of、展开运算符、解构使用，
 *    并提供按状态筛选的迭代方法。
 */

/**
 * 从任意可迭代对象中取前 n 项，返回数组。
 *  - 只从迭代器中拉取 n 次（对无限序列也安全）
 *  - 取完后要关闭迭代器（调用其 return 方法），让生成器的 finally 得以执行
 *    提示：for...of + break 会自动做到这一点
 */
export function take(iterable, n) {
  // TODO
  throw new Error('TODO: 实现 take');
}

/**
 * 订单号生成器（无限生成器）
 *
 * @param {object} options
 * @param {string} [options.prefix='SO']  前缀
 * @param {number} [options.width=6]      流水号位数，不足补 0
 * @param {() => Date} [options.now]      获取当前时间，默认 () => new Date()（测试时会注入假的时间）
 *
 * 行为：
 *  - 每次 next() 产出一个订单号：`${prefix}${yyyyMMdd}${流水号}`，流水号从 1 开始递增
 *  - 日期（本地时间）变化时，流水号自动重置为 1
 *  - 调用 it.next('reset') 时，流水号重置为 1，并产出重置后的第一个订单号
 *    （提示：next 的参数会成为上一个 yield 表达式的值）
 */
export function* createOrderNoGenerator({ prefix = 'SO', width = 6, now = () => new Date() } = {}) {
  // TODO
}

/**
 * 订单簿：可迭代的订单集合
 *
 *   const book = new OrderBook([{ id: 1, status: 'PAID', amount: 100 }]);
 *   book.add({ id: 2, status: 'PENDING', amount: 50 }).add(...);  // 链式调用
 *   for (const order of book) { ... }                              // 按加入顺序遍历
 *   [...book.byStatus('PAID')]                                     // 按状态筛选
 *   book.size                                                      // 订单数量
 *
 * 要求：
 *  - 实现 [Symbol.iterator]，使实例可以被「多次」遍历（每次返回新的迭代器）
 *  - byStatus(status) 是一个生成器方法，惰性地产出指定状态的订单
 *  - 不暴露内部存储数组（外部修改拿到的东西不应影响 OrderBook）
 *  - 静态方法 OrderBook.from(iterable) 用任意可迭代对象创建 OrderBook（包括另一个 OrderBook、生成器）
 */
export class OrderBook {
  constructor(orders = []) {
    // TODO
  }

  add(order) {
    // TODO
  }

  get size() {
    // TODO
    return 0;
  }

  // TODO: [Symbol.iterator]

  // TODO: byStatus

  static from(iterable) {
    // TODO
  }
}
