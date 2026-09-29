/**
 * 练习 2-2 参考答案：用「构造函数 + 原型」实现商品模型继承
 *
 * 这就是所谓的「寄生组合式继承」，也是 class extends 编译到 ES5 后的核心逻辑：
 *   1. 子类构造函数中 Parent.call(this, ...) —— 继承实例属性
 *   2. Child.prototype = Object.create(Parent.prototype) —— 继承原型方法
 *   3. 修复 Child.prototype.constructor
 *   4.（可选）Object.setPrototypeOf(Child, Parent) —— 继承静态方法
 */

export function Product(options) {
  this.id = options.id;
  this.name = options.name;
  this.price = options.price;
}

Product.prototype.getPrice = function () {
  return this.price;
};

Product.prototype.getShippingFee = function () {
  return this.getPrice() >= 99 ? 0 : 10;
};

Product.prototype.describe = function () {
  // this.getPrice() 会沿原型链查找：DiscountProduct 实例先找到自己原型上重写的版本 —— 这就是多态
  return `${this.name} ¥${this.getPrice().toFixed(2)}`;
};

/** 封装继承的样板代码 */
function inherits(Child, Parent) {
  Child.prototype = Object.create(Parent.prototype, {
    constructor: { value: Child, writable: true, configurable: true, enumerable: false },
  });
  Object.setPrototypeOf(Child, Parent);
}

export function DiscountProduct(options) {
  if (!(options.discount > 0 && options.discount <= 1)) {
    throw new RangeError(`discount 必须在 (0, 1] 范围内，收到 ${options.discount}`);
  }
  Product.call(this, options);
  this.discount = options.discount;
}

inherits(DiscountProduct, Product);

DiscountProduct.prototype.getPrice = function () {
  // 调用父类方法：相当于 class 中的 super.getPrice()
  const base = Product.prototype.getPrice.call(this);
  return Math.round(base * this.discount * 100) / 100;
};

export function DigitalProduct(options) {
  Product.call(this, options);
  this.downloadUrl = options.downloadUrl;
}

inherits(DigitalProduct, Product);

DigitalProduct.prototype.getShippingFee = function () {
  return 0;
};
