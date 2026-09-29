/**
 * 练习 6-4：异步生成器与 for await...of
 *
 * 【业务背景】
 * 1. 订单导出：运营要导出「全部订单」到 Excel。订单接口是分页的（每页最多 100 条，用游标翻页），
 *    总共可能有几十万条。不能一次全部拉到内存里，需要「边拉边写」，每 500 条写一次文件。
 * 2. 支付状态轮询：用户扫码支付后，前端每隔一段时间查询一次支付状态，直到成功/失败/超时。
 *
 * 异步生成器（async function*）= 生成器 + await：可以在 yield 之间 await 异步操作，
 * 消费方用 for await...of 遍历。
 */

/**
 * 把「游标分页接口」包装成一个逐条产出数据的异步迭代器
 *
 * @param {(cursor: string | null) => Promise<{ items: any[], nextCursor: string | null }>} fetchPage
 *        第一页传入 null；nextCursor 为 null 表示没有下一页
 *
 * 要求：
 *  - 逐条 yield 每一条数据（消费方不需要关心分页）
 *  - 惰性：当前页的数据消费完之前，不请求下一页
 *  - 消费方提前 break 时，不再请求后续页面
 */
export async function* paginate(fetchPage) {
  // TODO
}

/**
 * 把异步可迭代对象按 size 分批
 * （与 6-3 的 chunk 类似，但输入是异步的；提示：for await...of 也可以遍历普通的同步可迭代对象）
 */
export async function* batchAsync(asyncIterable, size) {
  // TODO
}

/**
 * 导出全部订单：组合 paginate + batchAsync
 *   - 每凑满 batchSize 条调用一次 await writer.write(batch)，最后不足一批的也要写
 *   - 全部写完后调用 await writer.close()
 *   - 返回导出的总条数
 *   - 如果过程中出错（拉取失败或写入失败），也要调用 writer.close()，然后把错误继续抛出
 */
export async function exportAllOrders(fetchPage, writer, { batchSize = 500 } = {}) {
  // TODO
  throw new Error('TODO: 实现 exportAllOrders');
}

/**
 * 轮询：每隔 interval 毫秒调用一次 check()，产出每次的结果，直到满足条件
 *
 * @param {() => Promise<any>} check
 * @param {object} options
 * @param {number} options.interval             两次检查之间的间隔
 * @param {(result) => boolean} options.until   返回 true 时，产出该结果后结束
 * @param {number} [options.maxAttempts=Infinity]  最多检查次数，超过后抛出 new Error('轮询超时')
 *
 * 用法：
 *   for await (const status of poll(() => api.queryPayment(id), { interval: 2000, until: (s) => s !== 'PENDING' })) {
 *     showStatus(status);
 *   }
 *
 * 要求：第一次检查立即进行（不等待）；消费方 break 后不再继续检查。
 */
export async function* poll(check, { interval, until, maxAttempts = Infinity }) {
  // TODO
}
