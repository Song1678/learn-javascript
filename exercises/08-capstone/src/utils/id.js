/**
 * 订单号生成器（参考第 06 章练习 6-2）
 * 格式：前缀 + yyyyMMdd + 6 位当日流水号，例如 SO20260929000001；日期变化时流水号重置
 */

/** 无限生成器 */
export function* orderNoGenerator({ prefix = 'SO', now = () => new Date() } = {}) {
  // TODO
}

/**
 * 把生成器包装成一个普通函数，方便注入到 OrderService：
 *   const nextId = createIdFactory();
 *   nextId(); // 'SO20260929000001'
 *   nextId(); // 'SO20260929000002'
 */
export function createIdFactory(options) {
  // TODO
  throw new Error('TODO');
}
