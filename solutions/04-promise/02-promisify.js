/**
 * 练习 4-2 参考答案：promisify / promisifyAll / callbackify
 */

export function promisify(fn) {
  // 返回普通函数，才能拿到调用者的 this
  return function promisified(...args) {
    // 在 new Promise 的 executor 中调用 fn：
    //   - fn 同步抛错会被 Promise 构造函数捕获并转为 reject
    //   - 回调多次调用时，只有第一次 resolve/reject 生效（Promise 状态不可逆）
    return new Promise((resolve, reject) => {
      fn.call(this, ...args, (err, result) => {
        if (err != null) reject(err);
        else resolve(result);
      });
    });
  };
}

export function promisifyAll(obj) {
  const result = Object.create(obj);
  // 收集自身和原型链上（不含 Object.prototype）的所有方法名
  const names = new Set();
  for (let o = obj; o && o !== Object.prototype; o = Object.getPrototypeOf(o)) {
    for (const key of Object.getOwnPropertyNames(o)) {
      if (key === 'constructor') continue;
      const desc = Object.getOwnPropertyDescriptor(o, key);
      // 只看数据属性，避免触发 getter
      if (typeof desc.value === 'function') names.add(key);
    }
  }
  for (const name of names) {
    const promisified = promisify(obj[name]);
    result[`${name}Async`] = (...args) => promisified.apply(obj, args);
  }
  return result;
}

export function callbackify(fn) {
  return function callbackified(...args) {
    const callback = args.pop();
    // 用 then 的两个参数而不是 then().catch()：
    // 否则 callback(null, result) 内部抛错时会被 catch 捕获，导致 callback 被调用两次
    Promise.resolve()
      .then(() => fn.apply(this, args))
      .then(
        (result) => callback(null, result),
        (err) => callback(err),
      );
  };
}
