/**
 * 练习 5-0 参考答案：async/await 入门
 */

export async function getUserDiscount(api, userId) {
  const user = await api.getUser(userId);
  return api.getDiscount(user.level); // async 函数中 return 一个 Promise，会自动等待它
}

export async function getNickname(api, userId) {
  try {
    const user = await api.getUser(userId);
    return user.name;
  } catch {
    return '游客';
  }
}

export async function checkout(api, cart) {
  const order = await api.createOrder(cart);
  const payment = await api.pay(order.id);
  await api.sendReceipt(order.id, payment.transactionId);
  return { orderId: order.id, transactionId: payment.transactionId };
}

export async function loadProductPage(api, id) {
  // 三个请求先同时发出，再一起等待；解构赋值按顺序取出结果
  const [product, stock, reviews] = await Promise.all([api.getProduct(id), api.getStock(id), api.getReviews(id)]);
  return { product, stock, reviews };
}

export async function sumOrderAmounts(api, orderIds) {
  let total = 0;
  for (const id of orderIds) {
    total += await api.getOrderAmount(id);
  }
  return total;
}
