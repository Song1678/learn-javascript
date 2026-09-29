/**
 * 练习 2-3：手写 new / instanceof / Object.create
 *
 * 【背景】
 * 阅读 Vue、Express、Koa 等框架源码时，经常会遇到直接操作原型链的代码。
 * 自己实现一遍这三个最基础的原型操作，是彻底理解原型链的最快途径。
 *
 * 可以使用：Object.getPrototypeOf / Object.setPrototypeOf / Object.defineProperties
 * 不可以使用：new 关键字（myNew 中）、instanceof 运算符（myInstanceOf 中）、Object.create（myCreate 中）
 */

/**
 * 模拟 new Ctor(...args)
 * new 做了四件事：
 *   1. 创建一个新对象
 *   2. 把新对象的原型指向 Ctor.prototype
 *   3. 以新对象为 this 执行 Ctor
 *   4. 如果 Ctor 返回了一个「对象」（包括函数），则以它为结果；否则返回新对象
 */
export function myNew(Ctor, ...args) {
  // TODO
  throw new Error('TODO: 实现 myNew');
}

/**
 * 模拟 obj instanceof Ctor：判断 Ctor.prototype 是否出现在 obj 的原型链上
 *  - obj 为原始值（数字、字符串、null、undefined 等）时返回 false
 *  - Ctor 不是函数时抛出 TypeError
 */
export function myInstanceOf(obj, Ctor) {
  // TODO
  throw new Error('TODO: 实现 myInstanceOf');
}

/**
 * 模拟 Object.create(proto, propertiesObject)
 *  - proto 必须是对象或 null，否则抛出 TypeError
 *  - propertiesObject 可选，格式与 Object.defineProperties 的第二个参数相同
 * 提示：除了 Object.setPrototypeOf，还有一种经典的 ES5 写法：借助一个空的临时构造函数。
 */
export function myCreate(proto, propertiesObject) {
  // TODO
  throw new Error('TODO: 实现 myCreate');
}
