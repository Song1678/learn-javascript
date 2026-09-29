/**
 * 练习 4-4：接口超时与失败重试  ⭐⭐⭐ 选做
 *
 * 卡住时看同目录的 HINTS.md；[进阶] 要求可以第二遍再做（--basic 模式会跳过对应测试）。
 *
 * 【业务背景】
 * 下单流程要调用「库存服务」，这个服务偶尔会抖动：
 *   - 有时 10 秒都不返回，用户一直看着转圈 → 需要超时控制
 *   - 有时返回 503（服务繁忙），过一会儿再试就好了 → 需要自动重试
 *   - 但如果返回 400（参数错误），重试多少次都没用，应立即失败 → 需要判断是否可重试
 *   - 服务繁忙时如果所有客户端都立即重试，会把服务彻底打垮 → 需要「指数退避」
 *
 * 最终业务代码会这样使用：
 *
 *   const stock = await retry(
 *     () => withTimeout(inventoryApi.reserve(sku, qty), 2000),
 *     { retries: 3, delay: 200, factor: 2, shouldRetry: (err) => err.status !== 400 },
 *   );
 */

/** 超时错误。业务方可以通过 err instanceof TimeoutError 或 err.name === 'TimeoutError' 判断 */
export class TimeoutError extends Error {
  constructor(message = '操作超时') {
    super(message);
    this.name = 'TimeoutError';
  }
}

/** 返回一个在 ms 毫秒后 resolve 的 Promise */
export function sleep(ms) {
  // TODO
  throw new Error('TODO: 实现 sleep');
}

/**
 * 为 Promise 增加超时限制：
 *  - promise 在 ms 内完成（成功或失败），则返回的 Promise 跟随它的结果
 *  - 超过 ms 未完成，则以 new TimeoutError(message) 失败
 *  - promise 先完成时，要清除定时器（否则进程会被挂起的定时器拖住无法退出，也是一种资源泄漏）
 */
export function withTimeout(promise, ms, message = `操作超时（${ms}ms）`) {
  // TODO
  throw new Error('TODO: 实现 withTimeout');
}

/**
 * 失败自动重试
 * @param {(attempt: number) => Promise<any>} fn  要执行的异步函数，参数为当前是第几次尝试（从 1 开始）
 * @param {object} options
 * @param {number} [options.retries=3]    最多「重试」次数（总尝试次数 = retries + 1）
 * @param {number} [options.delay=0]      第一次重试前的等待时间（毫秒）
 * @param {number} [options.factor=1]     退避系数：第 n 次重试前等待 delay * factor^(n-1)
 * @param {(err, attempt) => boolean} [options.shouldRetry]  返回 false 时不再重试，立即失败。默认总是重试
 * @param {(err, attempt) => void} [options.onRetry]         每次决定重试时调用（可用于打日志）
 * @returns 第一次成功的结果；全部失败时，以「最后一次」的错误失败
 */
export async function retry(fn, options = {}) {
  // TODO
  throw new Error('TODO: 实现 retry');
}
