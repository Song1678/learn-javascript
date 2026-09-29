/**
 * 练习 6-0 参考答案：生成器入门
 */

export function* orderStatusSteps() {
  yield '待付款';
  yield '待发货';
  yield '待收货';
  yield '已完成';
}

export function* range(start, end, step = 1) {
  for (let i = start; i < end; i += step) {
    yield i;
  }
}

export function* paginate(list, pageSize) {
  for (let i = 0; i < list.length; i += pageSize) {
    yield list.slice(i, i + pageSize);
  }
}

export function* carousel(images) {
  if (images.length === 0) return; // 空数组时直接结束，否则会陷入真正的死循环
  let index = 0;
  while (true) {
    yield images[index];
    index = (index + 1) % images.length; // 取余，到末尾后回到 0
  }
}

export const cart = {
  items: [
    { sku: 'A', qty: 1 },
    { sku: 'B', qty: 2 },
  ],
  *[Symbol.iterator]() {
    // yield* 把另一个可迭代对象的每一项依次产出，等价于 for (const item of this.items) yield item;
    yield* this.items;
  },
};
