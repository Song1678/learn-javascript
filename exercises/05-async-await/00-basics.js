/**
 * 练习 5-0：async/await 入门  ⭐
 *
 * 本练习「必须」使用 async / await 来写（不使用 .then / .catch），体会它和上一章 Promise 链式写法的区别。
 * 记住三句话：
 *   1. async 函数永远返回 Promise
 *   2. await 会「等」Promise 完成，拿到它的结果；如果 Promise 失败，await 这一行会抛出错误
 *   3. 所以用 try / catch 处理错误
 */

/**
 * 任务 1：把下面的 then 链改写成 async/await
 *
 *   function getUserDiscount(api, userId) {
 *     return api.getUser(userId).then((user) => api.getDiscount(user.level));
 *   }
 */
export async function getUserDiscount(api, userId) {
  // TODO
}

/**
 * 任务 2：try / catch 处理错误
 * 获取用户昵称，接口失败时返回 '游客'
 */
export async function getNickname(api, userId) {
  // TODO
}

/**
 * 任务 3：按顺序执行（串行）
 * 下单流程：必须一步一步来，后一步依赖前一步的结果
 *   1. const order = await api.createOrder(cart)        => { id }
 *   2. const payment = await api.pay(order.id)          => { transactionId }
 *   3. await api.sendReceipt(order.id, payment.transactionId)
 * 返回 { orderId, transactionId }
 */
export async function checkout(api, cart) {
  // TODO
}

/**
 * 任务 4：同时执行（并行）
 * 商品详情页同时请求：商品信息、库存、评价。三个请求互不依赖。
 *   api.getProduct(id) / api.getStock(id) / api.getReviews(id)
 * 返回 { product, stock, reviews }
 * 提示：如果写成三个连续的 await，总耗时是三个请求之和；用 await Promise.all([...]) 让它们同时进行
 */
export async function loadProductPage(api, id) {
  // TODO
}

/**
 * 任务 5：循环中的 await
 * 依次查询每个订单的金额并求和（为了不给服务器太大压力，要求一个查完再查下一个）
 *   api.getOrderAmount(orderId) => Promise<number>
 * 提示：用 for...of 循环，不要用 forEach（forEach 不会等待 async 回调）
 */
export async function sumOrderAmounts(api, orderIds) {
  // TODO
}
