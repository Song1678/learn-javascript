/**
 * 练习 7-0：工程实践入门  ⭐
 *
 * 三个小任务，分别是后面三个练习的「简化版」。
 */

/**
 * 任务 1：自定义错误类
 * 查询的数据不存在时抛出它，调用方可以用 err instanceof NotFoundError 或 err.status 判断错误类型
 *   const err = new NotFoundError('订单', 'SO001');
 *   err.message   // '订单 SO001 不存在'
 *   err.name      // 'NotFoundError'
 *   err.status    // 404
 *   err instanceof Error   // true
 * 提示：class NotFoundError extends Error，在 constructor 中先调用 super(message)
 */
export class NotFoundError extends Error {
  // TODO
}

/**
 * 任务 2：最简单的发布-订阅
 *   const emitter = createEmitter();
 *   emitter.on('order.paid', (order) => sendSms(order));
 *   emitter.on('order.paid', (order) => addPoints(order));
 *   emitter.emit('order.paid', order);   // 按订阅顺序调用两个监听器，并把 order 传给它们
 *
 * 要求：
 *   - on(event, handler)：订阅
 *   - emit(event, ...args)：按顺序调用该事件的所有监听器，参数原样传入；没有监听器时什么也不做
 *   - off(event, handler)：取消订阅
 * 提示：用一个对象或 Map 保存「事件名 -> 监听器数组」
 */
export function createEmitter() {
  // TODO
}

/**
 * 任务 3：校验下单参数
 * 检查 body 是否合法，返回「错误信息数组」，全部合法时返回空数组 []
 *   - userId 必须是非空字符串，否则 push 'userId 不能为空'
 *   - items 必须是非空数组，否则 push '至少购买一件商品'
 *   - items 中每一项的 qty 必须是正整数，否则 push `第 ${i + 1} 件商品的数量不合法`
 * 用到：typeof、Array.isArray、Number.isInteger
 */
export function validateOrder(body) {
  // TODO
}
