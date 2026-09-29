/**
 * 练习 0-1 参考答案：订单报表
 */

export function findOrder(orders, id) {
  // find 找不到时返回 undefined，用 ?? 转换成 null
  return orders.find((order) => order.id === id) ?? null;
}

export function getPaidOrders(orders) {
  return orders.filter((order) => order.status === 'PAID');
}

export function orderTotal(order) {
  // reduce 的第二个参数 0 是初始值；不写初始值时，空数组会直接报错
  return order.items.reduce((sum, item) => sum + item.price * item.qty, 0);
}

export function totalRevenue(orders) {
  return getPaidOrders(orders).reduce((sum, order) => sum + orderTotal(order), 0);
}

export function getOrderIds(orders) {
  return orders.map((order) => order.id);
}

export function countByStatus(orders) {
  return orders.reduce((counts, order) => {
    counts[order.status] = (counts[order.status] ?? 0) + 1;
    return counts; // reduce 的回调必须返回累加值，忘记 return 是最常见的错误
  }, {});
}

export function topProducts(orders, n) {
  const bySku = getPaidOrders(orders)
    .flatMap((order) => order.items) // [[a, b], [c]] => [a, b, c]
    .reduce((acc, item) => {
      if (!acc[item.sku]) {
        acc[item.sku] = { sku: item.sku, name: item.name, qty: 0 };
      }
      acc[item.sku].qty += item.qty;
      return acc;
    }, {});

  return Object.values(bySku)
    .sort((a, b) => b.qty - a.qty) // 返回负数 a 排前面；b.qty - a.qty 即降序
    .slice(0, n);
}
