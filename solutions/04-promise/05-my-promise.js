/**
 * 练习 4-5 参考答案：从零实现 Promise（符合 Promise/A+ 核心语义）
 */
const PENDING = 'pending';
const FULFILLED = 'fulfilled';
const REJECTED = 'rejected';

export class MyPromise {
  // 私有字段：外部无法篡改状态
  #state = PENDING;
  #value = undefined;
  #handlers = []; // pending 期间注册的 then 回调

  constructor(executor) {
    // resolve/reject 只能生效一次（包括「resolve 了一个 thenable 还在等待中」的情况）
    let called = false;
    const resolve = (value) => {
      if (called) return;
      called = true;
      this.#resolveWith(value);
    };
    const reject = (reason) => {
      if (called) return;
      called = true;
      this.#settle(REJECTED, reason);
    };
    try {
      executor(resolve, reject);
    } catch (err) {
      reject(err);
    }
  }

  get [Symbol.toStringTag]() {
    return 'MyPromise';
  }

  /** Promise 解决过程：处理 x 可能是 thenable 的情况 */
  #resolveWith(x) {
    if (x === this) {
      this.#settle(REJECTED, new TypeError('Chaining cycle detected for promise'));
      return;
    }
    if (x !== null && (typeof x === 'object' || typeof x === 'function')) {
      let then;
      try {
        then = x.then; // 只读取一次（getter 可能有副作用）
      } catch (err) {
        this.#settle(REJECTED, err);
        return;
      }
      if (typeof then === 'function') {
        let called = false;
        try {
          then.call(
            x,
            (y) => {
              if (called) return;
              called = true;
              this.#resolveWith(y); // y 可能还是 thenable，递归解决
            },
            (r) => {
              if (called) return;
              called = true;
              this.#settle(REJECTED, r);
            },
          );
        } catch (err) {
          if (!called) {
            called = true;
            this.#settle(REJECTED, err);
          }
        }
        return;
      }
    }
    this.#settle(FULFILLED, x);
  }

  #settle(state, value) {
    if (this.#state !== PENDING) return;
    this.#state = state;
    this.#value = value;
    const handlers = this.#handlers;
    this.#handlers = [];
    handlers.forEach((h) => this.#runHandler(h));
  }

  #runHandler({ onFulfilled, onRejected, resolve, reject }) {
    // then 回调必须异步执行
    queueMicrotask(() => {
      const callback = this.#state === FULFILLED ? onFulfilled : onRejected;
      if (typeof callback !== 'function') {
        // 值穿透 / 错误穿透
        (this.#state === FULFILLED ? resolve : reject)(this.#value);
        return;
      }
      try {
        resolve(callback(this.#value));
      } catch (err) {
        reject(err);
      }
    });
  }

  then(onFulfilled, onRejected) {
    return new MyPromise((resolve, reject) => {
      const handler = { onFulfilled, onRejected, resolve, reject };
      if (this.#state === PENDING) {
        this.#handlers.push(handler);
      } else {
        this.#runHandler(handler);
      }
    });
  }

  catch(onRejected) {
    return this.then(undefined, onRejected);
  }

  finally(onFinally) {
    if (typeof onFinally !== 'function') return this.then(onFinally, onFinally);
    return this.then(
      (value) => MyPromise.resolve(onFinally()).then(() => value),
      (reason) =>
        MyPromise.resolve(onFinally()).then(() => {
          throw reason;
        }),
    );
  }

  static resolve(value) {
    if (value instanceof MyPromise) return value;
    return new MyPromise((resolve) => resolve(value));
  }

  static reject(reason) {
    return new MyPromise((_, reject) => reject(reason));
  }

  static all(iterable) {
    return new MyPromise((resolve, reject) => {
      const items = Array.from(iterable);
      const results = new Array(items.length);
      let remaining = items.length;
      if (remaining === 0) return resolve(results);
      items.forEach((item, i) => {
        MyPromise.resolve(item).then((v) => {
          results[i] = v;
          if (--remaining === 0) resolve(results);
        }, reject);
      });
    });
  }
}
