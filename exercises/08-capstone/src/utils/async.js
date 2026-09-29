/**
 * 异步工具函数
 *
 * 这些函数你在第 04、05 章都已经实现过了。真实项目中，通用工具会被抽取到独立模块中复用。
 * 把你之前的实现搬过来（或者重新写一遍，检验自己是否真正掌握），并导出。
 *
 * 需要导出：
 *   TimeoutError                              name 为 'TimeoutError' 的错误类
 *   sleep(ms)
 *   withTimeout(promise, ms, message?)        超时以 TimeoutError 失败，并清理定时器
 *   retry(fn, { retries, delay, factor, shouldRetry })
 *   promisify(fn)                             透传 this
 *   mapLimit(items, limit, iteratee)
 */

export class TimeoutError extends Error {
  constructor(message = '操作超时') {
    super(message);
    this.name = 'TimeoutError';
  }
}

export function sleep(ms) {
  // TODO
  throw new Error('TODO');
}

export function withTimeout(promise, ms, message = `操作超时（${ms}ms）`) {
  // TODO
  throw new Error('TODO');
}

export async function retry(fn, { retries = 3, delay = 0, factor = 1, shouldRetry = () => true } = {}) {
  // TODO
  throw new Error('TODO');
}

export function promisify(fn) {
  // TODO
  throw new Error('TODO');
}

export async function mapLimit(items, limit, iteratee) {
  // TODO
  throw new Error('TODO');
}
