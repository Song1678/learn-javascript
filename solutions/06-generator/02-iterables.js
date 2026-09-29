/**
 * 练习 6-2 参考答案：迭代器协议与生成器基础
 */

export function take(iterable, n) {
  const result = [];
  if (n <= 0) return result;
  for (const item of iterable) {
    result.push(item);
    // 注意：要在取到第 n 个后「立刻」break，而不是在下一轮循环开头判断，否则会多拉取一次
    if (result.length >= n) break; // break 会自动调用迭代器的 return()
  }
  return result;
}

const pad = (n, width) => String(n).padStart(width, '0');
const formatDate = (d) => `${d.getFullYear()}${pad(d.getMonth() + 1, 2)}${pad(d.getDate(), 2)}`;

export function* createOrderNoGenerator({ prefix = 'SO', width = 6, now = () => new Date() } = {}) {
  let seq = 0;
  let lastDate = null;
  while (true) {
    const date = formatDate(now());
    if (date !== lastDate) {
      lastDate = date;
      seq = 0;
    }
    seq++;
    const command = yield `${prefix}${date}${pad(seq, width)}`;
    if (command === 'reset') {
      // 下一轮循环 seq++ 后就是 1
      seq = 0;
    }
  }
}

export class OrderBook {
  #orders = [];

  constructor(orders = []) {
    for (const order of orders) this.add(order);
  }

  add(order) {
    this.#orders.push(order);
    return this;
  }

  get size() {
    return this.#orders.length;
  }

  // 生成器方法作为 [Symbol.iterator]：每次 for...of 都会调用它，得到一个全新的迭代器
  *[Symbol.iterator]() {
    yield* this.#orders;
  }

  *byStatus(status) {
    for (const order of this.#orders) {
      if (order.status === status) yield order;
    }
  }

  static from(iterable) {
    // new this() 而不是 new OrderBook()：子类调用 from 时能得到子类实例
    return new this(iterable);
  }
}
