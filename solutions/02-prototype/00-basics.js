/**
 * 练习 2-0 参考答案：从 class 语法开始
 */

export class Product {
  constructor({ id, name, price }) {
    this.id = id;
    this.name = name;
    this.price = price;
  }

  getPrice() {
    return this.price;
  }

  describe() {
    // 调用 this.getPrice() 而不是读 this.price：子类重写 getPrice 后，describe 自动使用子类的版本（多态）
    return `${this.name} ¥${this.getPrice().toFixed(2)}`;
  }

  static fromJSON(json) {
    // 静态方法中的 this 是「调用它的类」：Product.fromJSON 时是 Product，DiscountProduct.fromJSON 时是 DiscountProduct
    return new this(JSON.parse(json));
  }
}

export class DiscountProduct extends Product {
  constructor(options) {
    super(options); // 调用父类构造函数，初始化 id、name、price
    this.discount = options.discount;
  }

  getPrice() {
    return super.getPrice() * this.discount;
  }
}

export function getPrototypeChain(obj) {
  const names = [];
  let proto = Object.getPrototypeOf(obj);
  while (proto !== null) {
    names.push(proto.constructor.name);
    proto = Object.getPrototypeOf(proto);
  }
  return names;
}
