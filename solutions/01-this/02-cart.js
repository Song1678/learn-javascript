/**
 * 练习 1-2 参考答案：修复购物车模块中的 this Bug
 *
 * 4 处 Bug 本质相同：函数被「别人」调用时，this 不再是 cart 实例。
 *   - forEach 回调：由 forEach 内部以普通函数方式调用
 *   - clear 作为事件回调：由按钮调用，this 变成按钮（或 undefined）
 *   - setTimeout 回调：由定时器调用，Node 中 this 是 Timeout 对象，浏览器中是 window
 *   - then 回调：由 Promise 机制调用，this 为 undefined
 *
 * 修法选择：
 *   - 回调「写在方法内部」时，优先用箭头函数（捕获外层方法的 this），最简洁。
 *   - 方法「会被当作回调传出去」时（如 clear），需要在构造函数中 bind，或改为箭头函数类字段。
 *     bind 的好处是方法仍在原型上（可被继承/重写/在测试中 mock），这里选择 bind。
 */
export class Cart {
  constructor({ onChange } = {}) {
    this.items = [];
    this.discount = 0;
    this.onChange = onChange;
    // 修复 2：会被当作回调传出去的方法，在构造时绑定
    this.clear = this.clear.bind(this);
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
    // 修复 1：箭头函数继承 addMany 的 this（也可以用 forEach 的第二个参数 thisArg）
    products.forEach((product) => {
      this.add(product);
    });
  }

  clear() {
    this.items = [];
    this.discount = 0;
    this.notify();
  }

  scheduleClear(ms) {
    // 修复 3
    setTimeout(() => {
      this.clear();
    }, ms);
  }

  applyCoupon(code, couponService) {
    // 修复 4
    return couponService.check(code).then((result) => {
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
