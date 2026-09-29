/**
 * 练习 4-2：把回调风格的老 SDK 改造成 Promise 风格  ⭐⭐
 *
 * 卡住时看同目录的 HINTS.md；[进阶] 要求可以第二遍再做（--basic 模式会跳过对应测试）。
 *
 * 【业务背景】
 * 公司接入的第三方支付 SDK 是很多年前写的，所有 API 都是 Node.js 风格的「错误优先回调」：
 *
 *   paySdk.createPayment(orderId, amount, (err, payment) => { ... })
 *   paySdk.queryStatus(paymentId, (err, status) => { ... })
 *
 * 业务代码里已经出现了「回调地狱」，还经常忘记处理 err。
 * 你需要写一组工具函数，让团队可以这样写：
 *
 *   const sdk = promisifyAll(paySdk);
 *   const payment = await sdk.createPaymentAsync(orderId, 100);
 *   const status = await sdk.queryStatusAsync(payment.id);
 *
 * 注意：SDK 的方法内部使用了 this（例如 this.merchantId），所以必须保证 this 正确。
 */

/**
 * 把「最后一个参数是 (err, result) => {} 回调」的函数，转换为返回 Promise 的函数。
 *  1. 回调的 err 不为 null/undefined 时 reject(err)，否则 resolve(result)
 *  2. 返回的函数被调用时的 this，要透传给原函数
 *     （即 obj.fooAsync = promisify(obj.foo); obj.fooAsync() 时，foo 内部 this === obj）
 *  3. 原函数同步抛出异常时，返回的 Promise 应 reject，而不是直接抛出
 *  4. 某些不规范的 SDK 会多次调用回调，只有第一次有效（想想 Promise 自带什么特性？）
 */
export function promisify(fn) {
  // TODO
  throw new Error('TODO: 实现 promisify');
}

/**
 * 为对象上所有「函数类型」的属性（包括原型链上的方法，但不包括 Object.prototype 上的）
 * 生成一个带 Async 后缀的 Promise 版本，挂在一个「新对象」上返回。
 *  - 不修改原对象
 *  - 新对象要能访问原对象的所有属性和方法（提示：以原对象为原型创建新对象）
 *  - xxxAsync 调用时，this 应为原对象
 */
export function promisifyAll(obj) {
  // TODO
  throw new Error('TODO: 实现 promisifyAll');
}

/**
 * 反向操作：把返回 Promise 的 async 函数转换为回调风格
 * （用于给仍在使用回调的老模块提供新实现）。
 *  - 成功：callback(null, result)
 *  - 失败：callback(err)
 *  - 注意：callback 自身抛出的异常不能被当成「fn 失败」再次调用 callback
 */
export function callbackify(fn) {
  // TODO
  throw new Error('TODO: 实现 callbackify');
}
