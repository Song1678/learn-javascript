/**
 * 练习 0-3：修 Bug 热身 —— 学会读测试、定位问题  ⭐
 *
 * 【业务背景】
 * 商城上线后，测试同学提了 4 个 Bug 单：
 *   Bug 1：购物车里放了 0.1 元和 0.2 元的商品，结算页显示「合计 ¥0.30000000000000004」
 *   Bug 2：订单列表第 1 页显示的是第 2 页的数据，而且最后一页永远看不到
 *   Bug 3：点了「按价格排序」之后，推荐区的商品顺序也跟着变了（它们用的是同一份数据）
 *   Bug 4：新用户（还没有领过优惠券）打开「我的」页面直接白屏
 *
 * 【任务】修复下面 4 个函数中的 Bug。
 *
 * 【推荐做法 —— 这也是真实工作中排查 Bug 的流程】
 *   1. 运行 npm test -- 00/debug，看看哪个测试失败了，失败信息里 actual（实际）和 expected（期望）分别是什么
 *   2. 打开 tests/00-warmup/03-debug.test.js，找到对应的测试，看它传入了什么数据
 *   3. 在函数里加 console.log 打印中间结果，找出和预期不一致的那一步
 *   4. 修改代码，重新运行测试
 */

/**
 * Bug 1：计算购物车合计金额（单位：元），结果保留两位小数，返回数字
 *   items = [{ price: 0.1, qty: 1 }, { price: 0.2, qty: 1 }]  =>  0.3
 */
export function calcTotal(items) {
  return items.reduce((sum, item) => sum + item.price * item.qty, 0);
}

/**
 * Bug 2：前端分页，page 从 1 开始
 *   paginate([1, 2, 3, 4, 5], 1, 2)  =>  [1, 2]
 *   paginate([1, 2, 3, 4, 5], 3, 2)  =>  [5]
 */
export function paginate(list, page, pageSize) {
  const start = page * pageSize;
  return list.slice(start, start + pageSize - 1);
}

/**
 * Bug 3：返回按价格从低到高排序的「新数组」，不能改变原数组的顺序
 */
export function sortByPrice(products) {
  return products.sort((a, b) => a.price - b.price);
}

/**
 * Bug 4：获取用户可用优惠券数量；新用户的 coupons 字段不存在
 */
export function getCouponCount(user) {
  return user.coupons.length || 0;
}
