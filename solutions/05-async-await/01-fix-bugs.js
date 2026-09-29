/**
 * 练习 5-1 参考答案：修复 async/await Bug
 */

/**
 * Bug：forEach 不会等待 async 回调，forEach 本身同步返回，success 还是 0。
 * 修复：map 出 Promise 数组，再用 Promise.all 等待。
 * （如果需要串行，可以用 for...of + await）
 */
export async function sendCoupons(userIds, api) {
  const results = await Promise.all(userIds.map((id) => api.sendCoupon(id)));
  return results.filter(Boolean).length;
}

/**
 * Bug：三个互不依赖的请求被串行 await，总耗时 = 三者之和。
 * 修复：先同时发起，再一起等待，总耗时 = 最慢的那一个。
 */
export async function loadDashboard(api) {
  const [sales, visitors, orders] = await Promise.all([api.getSales(), api.getVisitors(), api.getOrders()]);
  return { sales, visitors, orders };
}

/**
 * Bug：`return promise` 没有 await，try/catch 只能捕获「同步」错误。
 * Promise 在函数返回之后才 reject，此时早已离开 try 块。
 * 修复：`return await`。这是少数几个 return await 不多余的场景之一。
 */
export async function getUserName(id, api) {
  try {
    const user = await api.getUser(id);
    return user.name;
  } catch {
    return '匿名用户';
  }
}

/**
 * Bug：map 会「同时」启动所有请求，只是 Promise.all 按顺序收集结果而已。
 * 修复：for...of + await 实现真正的串行。
 */
export async function deductInOrder(orders, api) {
  const results = [];
  for (const order of orders) {
    results.push(await api.deduct(order));
  }
  return results;
}

/**
 * Bug：async 函数永远返回 Promise 对象，Promise 对象是 truthy，所以 filter 全部保留。
 * （本题测试里的数据会让它看起来像是「返回了所有商品」）
 * 修复：先并行拿到所有布尔结果，再同步 filter。
 */
export async function filterInStock(skus, api) {
  const flags = await Promise.all(skus.map((sku) => api.inStock(sku)));
  return skus.filter((_, i) => flags[i]);
}
