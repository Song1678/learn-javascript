/**
 * 练习 6-5 参考答案：co 自动执行器
 */

export function run(genFn, ...args) {
  return new Promise((resolve, reject) => {
    let it;
    try {
      it = genFn.apply(this, args);
    } catch (err) {
      return reject(err);
    }

    // step 统一处理 next / throw 两种恢复方式
    function step(method, input) {
      let result;
      try {
        result = it[method](input);
      } catch (err) {
        // 生成器内部没有捕获的错误
        return reject(err);
      }
      const { value, done } = result;
      if (done) return resolve(value);
      // Promise.resolve 同时处理 Promise、thenable 和普通值
      Promise.resolve(value).then(
        (v) => step('next', v),
        (e) => step('throw', e),
      );
    }

    step('next', undefined);
  });
}

export function* checkoutFlow(api, cartId) {
  const cart = yield api.getCart(cartId);
  let coupon = null;
  try {
    coupon = yield api.getBestCoupon(cart.userId, cart.total);
  } catch {
    // 优惠券服务挂了不影响下单
  }
  const amount = coupon ? cart.total - coupon.amount : cart.total;
  const order = yield api.createOrder({ cartId, amount, couponId: coupon?.id ?? null });
  return order.id;
}

export function checkout(api, cartId) {
  return run(checkoutFlow, api, cartId);
}
