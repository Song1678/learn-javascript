/**
 * 练习 1-2：修复购物车模块中的 this Bug
 *
 * 【业务背景】
 * 这是商城前端的购物车模块，由一位离职同事编写。上线后用户反馈：
 *   - 「批量加入购物车」按钮点了报错；
 *   - 「清空购物车」按钮点了报错；
 *   - 「30 秒后自动清空（限时活动）」不生效，控制台报错；
 *   - 输入优惠券后金额没有变化。
 * 奇怪的是，同事在自测时直接调用 cart.clear()、cart.add() 都是好的。
 *
 * 【任务】
 * 找出并修复所有与 this 相关的 Bug（共 4 处），让 tests/01-this/02-cart.test.js 全部通过。
 * 要求：
 *   - 不要修改对外的方法名和参数；
 *   - 思考每一处用哪种修法最合适：箭头函数？bind？thisArg？类字段？
 *
 * 【页面中的使用方式】（测试会模拟这些用法）
 *   batchButton.onClick(() => cart.addMany(selectedProducts));
 *   clearButton.onClick(cart.clear);               // 直接把方法作为回调传入
 *   cart.scheduleClear(30_000);
 *   cart.applyCoupon('VIP100', couponService);     // couponService.check 返回 Promise
 */
export class Cart {
  constructor({ onChange } = {}) {
    this.items = [];
    this.discount = 0;
    this.onChange = onChange;
  }

  add(product, qty = 1) {
    const existing = this.items.find((item) => item.id === product.id);
    if (existing) {
      existing.qty += qty;
    } else {
      this.items.push({ ...product, qty });
    }
    this.notify();
  }

  addMany(products) {
    products.forEach(function (product) {
      this.add(product);
    });
  }

  clear() {
    this.items = [];
    this.discount = 0;
    this.notify();
  }

  scheduleClear(ms) {
    setTimeout(function () {
      this.clear();
    }, ms);
  }

  applyCoupon(code, couponService) {
    return couponService.check(code).then(function (result) {
      if (result.valid) {
        this.discount = result.amount;
        this.notify();
      }
      return result.valid;
    });
  }

  total() {
    const sum = this.items.reduce((acc, item) => acc + item.price * item.qty, 0);
    return Math.max(sum - this.discount, 0);
  }

  notify() {
    if (typeof this.onChange === 'function') {
      this.onChange(this.total());
    }
  }
}
