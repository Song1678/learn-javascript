/**
 * 练习 4-3 参考答案：Promise 组合器
 *
 * 共同的套路：
 *   1. 用 Array.from 把任意可迭代对象转成数组（生成器只能遍历一次，先固化下来）
 *   2. 用 Promise.resolve 把每一项统一包装成 Promise（兼容普通值和 thenable）
 *   3. 用「计数器 + 按索引写入结果」保证结果顺序与输入一致
 */

export function all(iterable) {
  return new Promise((resolve, reject) => {
    const items = Array.from(iterable);
    const results = new Array(items.length);
    let remaining = items.length;
    if (remaining === 0) return resolve(results);

    items.forEach((item, index) => {
      Promise.resolve(item).then((value) => {
        results[index] = value;
        if (--remaining === 0) resolve(results);
      }, reject); // 第一个失败直接 reject；之后的 reject 调用会被忽略
    });
  });
}

export function allSettled(iterable) {
  // 复用 all：先把每一项都转换成「必定成功」的 Promise
  return all(
    Array.from(iterable, (item) =>
      Promise.resolve(item).then(
        (value) => ({ status: 'fulfilled', value }),
        (reason) => ({ status: 'rejected', reason }),
      ),
    ),
  );
}

export function race(iterable) {
  return new Promise((resolve, reject) => {
    for (const item of iterable) {
      Promise.resolve(item).then(resolve, reject);
    }
  });
}

export function any(iterable) {
  return new Promise((resolve, reject) => {
    const items = Array.from(iterable);
    const errors = new Array(items.length);
    let remaining = items.length;
    if (remaining === 0) {
      return reject(new AggregateError([], 'All promises were rejected'));
    }
    items.forEach((item, index) => {
      Promise.resolve(item).then(resolve, (reason) => {
        errors[index] = reason;
        if (--remaining === 0) reject(new AggregateError(errors, 'All promises were rejected'));
      });
    });
  });
}
