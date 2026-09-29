/**
 * 练习 6-0：生成器入门  ⭐
 *
 * 生成器函数写作 function*，函数体里用 yield「交出」一个值并暂停。
 *   function* hello() {
 *     yield 'a';
 *     yield 'b';
 *   }
 *   [...hello()]              // ['a', 'b']
 *   for (const x of hello())  // 依次得到 'a'、'b'
 */

/**
 * 任务 1：订单状态流转
 * 依次产出订单的四个状态：'待付款'、'待发货'、'待收货'、'已完成'
 */
export function* orderStatusSteps() {
  // TODO
}

/**
 * 任务 2：range
 * 产出从 start 开始、小于 end 的数字，步长为 step
 *   [...range(0, 5)]       // [0, 1, 2, 3, 4]
 *   [...range(1, 10, 3)]   // [1, 4, 7]
 * 用到：for 循环 + yield
 */
export function* range(start, end, step = 1) {
  // TODO
}

/**
 * 任务 3：把列表分页
 * 每次产出 pageSize 个元素组成的数组，最后一页可以不满
 *   [...paginate(['a', 'b', 'c', 'd', 'e'], 2)]   // [['a', 'b'], ['c', 'd'], ['e']]
 * 用到：slice
 */
export function* paginate(list, pageSize) {
  // TODO
}

/**
 * 任务 4：无限生成器 —— 首页轮播图
 * 按顺序循环产出 images 中的图片，播放到最后一张后回到第一张，永不结束
 *   const it = carousel(['a.jpg', 'b.jpg']);
 *   it.next().value   // 'a.jpg'
 *   it.next().value   // 'b.jpg'
 *   it.next().value   // 'a.jpg'
 * 提示：while (true) { ... }。别担心死循环 —— 生成器只有在调用 next() 时才会执行到下一个 yield
 */
export function* carousel(images) {
  // TODO
}

/**
 * 任务 5：让对象可以被 for...of 遍历
 * 给 cart 对象添加 [Symbol.iterator] 方法（写成生成器方法），依次产出 items 中的每个商品
 *   for (const item of cart) { ... }
 *   [...cart]   // [{ sku: 'A', qty: 1 }, { sku: 'B', qty: 2 }]
 * 写法：*[Symbol.iterator]() { ... }，方法中可以用 this 访问 cart
 */
export const cart = {
  items: [
    { sku: 'A', qty: 1 },
    { sku: 'B', qty: 2 },
  ],
  // TODO
};
