/**
 * 练习 6-5：用生成器实现 async/await（co 自动执行器）
 *
 * 【为什么要做这道题】
 * 在 async/await 出现之前（ES2017 之前），Koa 1.x、redux-saga、co 等库就用「生成器 + Promise」
 * 写出了同步风格的异步代码。事实上，async/await 就是「生成器 + 自动执行器」的语法糖：
 *
 *   async function f() {            function* f() {
 *     const a = await getA();   ≈     const a = yield getA();
 *     return a;                       return a;
 *   }                               }
 *                                   run(f);
 *
 * 理解了这道题，你就理解了 await 的本质：「暂停函数，等 Promise 完成后，把结果送回暂停点，继续执行」。
 */

/**
 * 自动执行生成器函数，返回 Promise
 *
 * @param {GeneratorFunction} genFn
 * @param {...any} args  传给 genFn 的参数
 * @returns {Promise} 以生成器的 return 值成功；以生成器内未捕获的错误失败
 *
 * 要求：
 *  1. yield 一个 Promise（或 thenable）：等待它，成功值通过 next(value) 送回生成器
 *  2. 等待的 Promise 失败：通过 it.throw(err) 把错误抛回生成器（生成器内部可以用 try/catch 捕获）
 *  3. yield 一个普通值：直接把它送回（相当于 await 普通值）
 *  4. 生成器同步抛出的错误（包括第一次 next 之前的）也要转为 rejected Promise
 *  5. 生成器 function 内部的 this 与 run 被调用时的 this 一致（run.call(obj, genFn)）
 */
export function run(genFn, ...args) {
  // TODO
  throw new Error('TODO: 实现 run');
}

/**
 * 用生成器改写下面的结账流程，然后用 run 执行（不允许使用 async / await）。
 *
 *   async function checkoutFlow(api, cartId) {
 *     const cart = await api.getCart(cartId);
 *     let coupon = null;
 *     try {
 *       coupon = await api.getBestCoupon(cart.userId, cart.total);
 *     } catch {
 *       // 优惠券服务挂了不影响下单
 *     }
 *     const amount = coupon ? cart.total - coupon.amount : cart.total;
 *     const order = await api.createOrder({ cartId, amount, couponId: coupon?.id ?? null });
 *     return order.id;
 *   }
 */
export function* checkoutFlow(api, cartId) {
  // TODO
}

/** 对外暴露的 Promise 版本 */
export function checkout(api, cartId) {
  return run(checkoutFlow, api, cartId);
}
