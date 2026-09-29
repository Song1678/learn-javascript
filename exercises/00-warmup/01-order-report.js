/**
 * 练习 0-1：订单报表 —— 数组方法热身  ⭐
 *
 * 【业务背景】
 * 运营同学每天早上都要看一份「昨日订单报表」。后端已经把订单数据查出来了（见下方数据结构），
 * 你要写几个函数，把原始数据加工成报表需要的数字。
 *
 * 【练习目标】
 * 熟练使用 filter / map / reduce / find / sort 这几个最常用的数组方法。
 * 要求：不使用 for / while 循环（这是为了练习，真实项目中两种写法都可以）。
 *
 * 【订单数据结构】
 *   {
 *     id: 'SO001',
 *     userId: 'u1',
 *     status: 'PAID',            // 'PENDING' 待付款 | 'PAID' 已付款 | 'CANCELLED' 已取消
 *     items: [
 *       { sku: 'KB-01', name: '机械键盘', price: 399, qty: 1 },   // price 单价，qty 数量
 *     ],
 *   }
 *
 * 【做题方法】
 *   1. 先打开 tests/00-warmup/01-order-report.test.js，看看测试是怎么调用这些函数的
 *   2. 一次只完成一个函数，完成后运行 npm test -- 00/order 看看是否通过
 *   3. 不会写的时候，打开同目录下的 HINTS.md，提示分为三级，从第一级开始看
 */

/**
 * 1. 根据订单号查找订单，找不到返回 null
 * 用到：find
 */
export function findOrder(orders, id) {
  // TODO
}

/**
 * 2. 筛选出所有「已付款」的订单
 * 用到：filter
 */
export function getPaidOrders(orders) {
  // TODO
}

/**
 * 3. 计算单个订单的金额：每个商品的 单价 × 数量，再加起来
 * 用到：reduce
 * 例：items = [{ price: 399, qty: 1 }, { price: 20, qty: 3 }]  =>  459
 */
export function orderTotal(order) {
  // TODO
}

/**
 * 4. 计算总营收：只统计「已付款」订单的金额之和
 * 提示：可以组合使用上面写好的 getPaidOrders 和 orderTotal
 */
export function totalRevenue(orders) {
  // TODO
}

/**
 * 5. 取出所有订单号组成的数组
 * 用到：map
 * 例：['SO001', 'SO002']
 */
export function getOrderIds(orders) {
  // TODO
}

/**
 * 6. 统计每种状态的订单数量
 * 例：{ PAID: 2, PENDING: 1, CANCELLED: 1 }（没有出现的状态不需要出现在结果里）
 * 用到：reduce，初始值是一个空对象 {}
 */
export function countByStatus(orders) {
  // TODO
}

/**
 * 7. 畅销商品排行 ⭐⭐（本练习中最难的一题）
 * 统计「已付款」订单中每个商品卖出的总数量，按数量从大到小排序，返回前 n 个：
 *   [{ sku: 'KB-01', name: '机械键盘', qty: 5 }, ...]
 * 思路：先把所有已付款订单的 items「拍平」成一个数组（flatMap），
 *       再用 reduce 按 sku 累加数量，最后排序、截取
 */
export function topProducts(orders, n) {
  // TODO
}
