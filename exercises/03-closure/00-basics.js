/**
 * 练习 3-0：闭包入门  ⭐
 *
 * 闭包最直观的理解：一个函数「记住」了它被创建时周围的变量。
 * 下面每个函数都是「返回一个函数（或包含函数的对象）」的工厂函数。
 */

/**
 * 任务 1：购物车角标计数器
 *   const badge = createCounter(3);
 *   badge.increment();   // 4
 *   badge.decrement();   // 3
 *   badge.get();         // 3
 * 要求：
 *   - 计数不能小于 0（decrement 到 0 就不再减少）
 *   - 计数变量是私有的：外部无法直接修改（返回的对象上只有这三个方法）
 *   - 每次调用 createCounter 得到的计数器互不影响
 */
export function createCounter(initial = 0) {
  // TODO
}

/**
 * 任务 2：函数工厂 —— 按税率计算含税价
 *   const withVat = createTaxCalculator(0.13);
 *   withVat(100);   // 113
 *   withVat(9.9);   // 11.19（保留两位小数，返回数字）
 */
export function createTaxCalculator(rate) {
  // TODO
}

/**
 * 任务 3：只执行一次（例如：第三方 SDK 的初始化函数被多个页面调用，但只能真正初始化一次）
 *   const init = once(() => { console.log('初始化'); return 'sdk'; });
 *   init();   // 打印「初始化」，返回 'sdk'
 *   init();   // 不打印，仍然返回 'sdk'（第一次的结果）
 * 要求：参数要透传给 fn
 */
export function once(fn) {
  // TODO
}

/**
 * 任务 4：修复经典的循环闭包 Bug
 * 期望：返回的三个函数分别返回 '第1个商品'、'第2个商品'、'第3个商品'
 * 实际：三个都返回 '第4个商品'。只需要改一个单词。
 */
export function createProductLabels() {
  const labels = [];
  for (var i = 1; i <= 3; i++) {
    labels.push(() => `第${i}个商品`);
  }
  return labels;
}
