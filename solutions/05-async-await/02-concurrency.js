/**
 * 练习 5-2 参考答案：并发控制
 */

export async function mapLimit(items, limit, iteratee) {
  const results = new Array(items.length);
  let nextIndex = 0;
  let failed = false;

  // 每个 worker 不停地领取下一个任务，直到没有任务或已经有任务失败
  // 因为 JS 是单线程的，nextIndex++ 不会有竞争问题
  async function worker() {
    while (!failed && nextIndex < items.length) {
      const index = nextIndex++;
      try {
        results[index] = await iteratee(items[index], index);
      } catch (err) {
        failed = true;
        throw err;
      }
    }
  }

  const workers = Array.from({ length: Math.min(limit, items.length) }, worker);
  // 任意 worker 失败，Promise.all 立即 reject
  await Promise.all(workers);
  return results;
}

export class TaskQueue {
  #concurrency;
  #queue = []; // { task, resolve, reject }
  #running = 0;
  #paused = false;
  #idleWaiters = [];

  constructor({ concurrency = 1 } = {}) {
    this.#concurrency = concurrency;
  }

  add(task) {
    return new Promise((resolve, reject) => {
      this.#queue.push({ task, resolve, reject });
      this.#next();
    });
  }

  get pending() {
    return this.#queue.length;
  }

  get running() {
    return this.#running;
  }

  onIdle() {
    if (this.#isIdle()) return Promise.resolve();
    return new Promise((resolve) => this.#idleWaiters.push(resolve));
  }

  pause() {
    this.#paused = true;
  }

  resume() {
    this.#paused = false;
    this.#next();
  }

  clear() {
    const cancelled = this.#queue;
    this.#queue = [];
    cancelled.forEach(({ reject }) => reject(new Error('任务已取消')));
    this.#checkIdle();
  }

  #isIdle() {
    return this.#queue.length === 0 && this.#running === 0;
  }

  #checkIdle() {
    if (!this.#isIdle()) return;
    const waiters = this.#idleWaiters;
    this.#idleWaiters = [];
    waiters.forEach((resolve) => resolve());
  }

  #next() {
    while (!this.#paused && this.#running < this.#concurrency && this.#queue.length > 0) {
      const { task, resolve, reject } = this.#queue.shift();
      this.#running++;
      // Promise.resolve().then(task)：task 同步抛错也会被转为 rejected
      Promise.resolve()
        .then(task)
        .then(resolve, reject)
        .finally(() => {
          this.#running--;
          this.#next();
          this.#checkIdle();
        });
    }
  }
}
