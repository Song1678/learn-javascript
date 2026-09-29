/**
 * 练习 1-0 参考答案：this 入门
 */

export const shop = {
  name: '数码旗舰店',
  products: [],

  addProduct(product) {
    this.products.push(product);
    return this; // 返回 this，调用方就可以继续 .addProduct(...)，这就是「链式调用」的原理
  },

  getProductCount() {
    return this.products.length;
  },

  describe() {
    // 这里用 this.products.length 而不是 this.getProductCount()：
    // 任务 2 借用 describe 时，otherShop 上并没有 getProductCount 方法
    return `${this.name}共有${this.products.length}件商品`;
  },
};

export function describeOtherShop(otherShop) {
  // call 的第一个参数就是函数执行时的 this
  return shop.describe.call(otherShop);
}

export class ClickCounter {
  constructor() {
    this.count = 0;
    // bind 返回一个 this 被永久固定为当前实例的新函数，并把它存为实例自身的属性
    this.increment = this.increment.bind(this);
  }

  increment() {
    this.count++;
    return this.count;
  }
}

export class Toast {
  constructor() {
    this.visible = false;
  }

  show(ms) {
    this.visible = true;
    // 箭头函数没有自己的 this，使用的是外层 show 方法的 this，也就是 Toast 实例
    setTimeout(() => {
      this.visible = false;
    }, ms);
  }
}
