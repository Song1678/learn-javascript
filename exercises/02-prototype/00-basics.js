/**
 * 练习 2-0：从 class 语法开始  ⭐
 *
 * class 是大多数人最熟悉的写法，我们先用它写一个商品模型，
 * 然后在任务 4 中「揭开」它背后的原型链。练习 2-2 会要求你不用 class 实现同样的功能。
 */

/**
 * 任务 1：普通商品
 *   const p = new Product({ id: 1, name: '机械键盘', price: 399 });
 *   p.getPrice()   // 399
 *   p.describe()   // '机械键盘 ¥399.00'（价格保留两位小数；注意要调用 this.getPrice()，而不是直接用 this.price）
 */
export class Product {
  // TODO: constructor、getPrice、describe
}

/**
 * 任务 2：折扣商品，继承 Product
 *   const p = new DiscountProduct({ id: 2, name: '显示器', price: 1000, discount: 0.8 });
 *   p.getPrice()   // 800
 *   p.describe()   // '显示器 ¥800.00'   ← describe 不需要重写，想想为什么会自动得到折扣价？
 *
 * 提示：
 *   - constructor 中先调用 super(options)，才能使用 this
 *   - getPrice 中用 super.getPrice() 拿到原价
 */
export class DiscountProduct extends Product {
  // TODO
}

/**
 * 任务 3：静态方法
 * 给 Product 添加静态方法 fromJSON(json)：把后端返回的 JSON 字符串转换成 Product 实例
 *   Product.fromJSON('{"id":1,"name":"键盘","price":399}')  // => Product 实例
 * 进阶：DiscountProduct.fromJSON(...) 应该返回 DiscountProduct 实例（提示：静态方法中的 this 是谁？）
 *
 * 请直接写在上面的 Product 类中（static fromJSON(json) { ... }）
 */

/**
 * 任务 4：观察原型链
 * 返回 obj 的原型链上每一个原型对象的 constructor.name，直到 null 为止
 *   getPrototypeChain(new DiscountProduct({...}))   // ['DiscountProduct', 'Product', 'Object']
 *   getPrototypeChain([])                            // ['Array', 'Object']
 * 用到：Object.getPrototypeOf(obj) 获取原型；while 循环
 */
export function getPrototypeChain(obj) {
  // TODO
}
