/**
 * 练习 4-4 参考答案：超时与重试
 */

export class TimeoutError extends Error {
  constructor(message = '操作超时') {
    super(message);
    this.name = 'TimeoutError';
  }
}

export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function withTimeout(promise, ms, message = `操作超时（${ms}ms）`) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new TimeoutError(message)), ms);
  });
  // finally 保证无论哪一方胜出，定时器都会被清理
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

export async function retry(fn, options = {}) {
  const { retries = 3, delay = 0, factor = 1, shouldRetry = () => true, onRetry } = options;

  for (let attempt = 1; ; attempt++) {
    try {
      // 注意这里的 await：没有它，fn 返回的 rejected Promise 不会被 catch 捕获
      return await fn(attempt);
    } catch (err) {
      const isLast = attempt > retries;
      if (isLast || !shouldRetry(err, attempt)) throw err;
      onRetry?.(err, attempt);
      await sleep(delay * factor ** (attempt - 1));
    }
  }
}
