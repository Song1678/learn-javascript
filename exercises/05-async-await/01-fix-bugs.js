/**
 * 练习 5-1：修复运营后台脚本中的 async/await Bug
 *
 * 【业务背景】
 * 运营同学反馈，后台的几个功能「时好时坏」：
 *   1. 批量发券：页面提示「发放成功 0 张」，但用户其实收到了券
 *   2. 数据看板：打开要等很久，明明三个接口都很快
 *   3. 用户名展示：用户不存在时页面直接白屏，而不是显示「匿名用户」
 *   4. 批量扣库存：偶尔出现超卖，库存服务要求同一批订单必须「按顺序、一个一个」扣减
 *   5. 查找有货商品：返回了所有商品，包括没货的
 *
 * 【任务】每个函数都有一个 Bug，找出并修复。
 * 所有依赖（api）都以参数形式注入，这也是「可测试代码」的常见写法 —— 测试时可以传入假的 api。
 */

/**
 * 1. 批量发券：给每个用户发一张券，返回「发放成功的数量」
 *    api.sendCoupon(userId) 返回 Promise<boolean>，true 表示成功
 *    要求：全部发放完成后再返回；各用户之间可以并行
 */
export async function sendCoupons(userIds, api) {
  let success = 0;
  userIds.forEach(async (id) => {
    const ok = await api.sendCoupon(id);
    if (ok) success++;
  });
  return success;
}

/**
 * 2. 数据看板：三个接口互不依赖
 *    返回 { sales, visitors, orders }
 */
export async function loadDashboard(api) {
  const sales = await api.getSales();
  const visitors = await api.getVisitors();
  const orders = await api.getOrders();
  return { sales, visitors, orders };
}

/**
 * 3. 获取用户名：接口失败（例如用户不存在）时返回 '匿名用户'
 *    api.getUser(id) 返回 Promise<{ name }>
 */
export async function getUserName(id, api) {
  try {
    return api.getUser(id).then((user) => user.name);
  } catch {
    return '匿名用户';
  }
}

/**
 * 4. 批量扣库存：必须严格按 orders 的顺序，上一个完成后才开始下一个
 *    api.deduct(order) 返回 Promise<结果>
 *    返回所有结果组成的数组（顺序与 orders 一致）
 */
export async function deductInOrder(orders, api) {
  return Promise.all(orders.map((order) => api.deduct(order)));
}

/**
 * 5. 找出所有有货的 SKU
 *    api.inStock(sku) 返回 Promise<boolean>
 *    返回有货的 sku 数组（保持原顺序）；各 sku 可以并行查询
 */
export async function filterInStock(skus, api) {
  return skus.filter(async (sku) => await api.inStock(sku));
}
