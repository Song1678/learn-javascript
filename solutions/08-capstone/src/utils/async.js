/**
 * 异步工具函数
 * 参考答案：与第 04、05 章的实现相同，这里集中放在一个模块中供业务代码复用。
 */

export class TimeoutError extends Error {
  constructor(message = '操作超时') {
    super(message);
    this.name = 'TimeoutError';
  }
}

export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export function withTimeout(promise, ms, message = `操作超时（${ms}ms）`) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new TimeoutError(message)), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

export async function retry(fn, { retries = 3, delay = 0, factor = 1, shouldRetry = () => true } = {}) {
  for (let attempt = 1; ; attempt++) {
    try {
      return await fn(attempt);
    } catch (err) {
      if (attempt > retries || !shouldRetry(err, attempt)) throw err;
      await sleep(delay * factor ** (attempt - 1));
    }
  }
}

export function promisify(fn) {
  return function (...args) {
    return new Promise((resolve, reject) => {
      fn.call(this, ...args, (err, result) => (err != null ? reject(err) : resolve(result)));
    });
  };
}

export async function mapLimit(items, limit, iteratee) {
  const results = new Array(items.length);
  let next = 0;
  let failed = false;
  async function worker() {
    while (!failed && next < items.length) {
      const i = next++;
      try {
        results[i] = await iteratee(items[i], i);
      } catch (err) {
        failed = true;
        throw err;
      }
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}
