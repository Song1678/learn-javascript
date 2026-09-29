# 第 02 章 提示

> 卡住时**只展开一级**，看完马上回去写代码。

## 练习 2-0：从 class 语法开始

<details><summary>任务 1、2 提示</summary>

```js
class Product {
  constructor({ id, name, price }) {  // 参数可以直接解构
    this.id = id;
    // ...
  }
  getPrice() { return this.price; }
}

class DiscountProduct extends Product {
  constructor(options) {
    super(options);                   // 必须先调用 super，才能使用 this
    this.discount = options.discount;
  }
  getPrice() {
    return super.getPrice() * this.discount;
  }
}
```
</details>

<details><summary>任务 3 提示</summary>

`static fromJSON(json) { return new this(JSON.parse(json)); }` —— 静态方法中的 this 是调用它的类，所以 `DiscountProduct.fromJSON()` 时 `new this` 就是 `new DiscountProduct`。
</details>

<details><summary>任务 4 提示</summary>

```js
const names = [];
let proto = Object.getPrototypeOf(obj);
while (proto !== null) {
  names.push(/* 原型对象的 constructor 的 name */);
  proto = Object.getPrototypeOf(proto);
}
return names;
```
</details>

## 练习 2-1：预测题

<details><summary>通用解题方法</summary>

- **读属性**：先找自身，没有就沿 `[[Prototype]]` 一路往上找。
- **写属性**（`obj.x = 1`）：一般直接写在对象**自身**上，不会修改原型。
- `a.tags.push(x)` 是「读取 tags，然后调用它的方法」，不是给 tags 赋值。
- `instanceof` 检查的是 `构造函数.prototype` 的**当前值**是否出现在对象的原型链上。
- 画图！把每个对象画成一个框，用箭头连起它们的原型。
</details>

## 练习 2-2：ES5 商品模型

<details><summary>提示 1：Product</summary>

```js
export function Product(options) {
  this.id = options.id;
  // ...
}
Product.prototype.getPrice = function () { return this.price; };
```
方法挂在 `Product.prototype` 上，所有实例共享。
</details>

<details><summary>提示 2：继承的三步</summary>

以 DiscountProduct 为例：
1. 构造函数中复用父类的初始化逻辑：`Product.call(this, options);`（相当于 `super(options)`）
2. 让子类原型「继承」父类原型：`DiscountProduct.prototype = Object.create(Product.prototype);`
3. 修复 constructor：替换 prototype 后，constructor 丢了，要重新指回 DiscountProduct
</details>

<details><summary>提示 3：重写方法时调用父类版本</summary>

`Product.prototype.getPrice.call(this)` 相当于 `super.getPrice()`。
</details>

<details><summary>提示 4：[进阶] constructor 不可枚举</summary>

```js
Object.defineProperty(DiscountProduct.prototype, 'constructor', {
  value: DiscountProduct, writable: true, configurable: true, enumerable: false,
});
```
</details>

## 练习 2-3：手写 new / instanceof / Object.create

<details><summary>myNew 提示</summary>

四步：
1. `const obj = {}`，再 `Object.setPrototypeOf(obj, Ctor.prototype)`（或者先写完 myCreate 再用它）
2. `const result = Ctor.apply(obj, args)`
3. result 是对象或函数（且不是 null）→ 返回 result
4. 否则返回 obj
</details>

<details><summary>myInstanceOf 提示</summary>

```js
let proto = Object.getPrototypeOf(obj);
while (proto !== null) {
  if (proto === Ctor.prototype) return true;
  proto = Object.getPrototypeOf(proto);
}
return false;
```
别忘了先处理原始值（`typeof obj !== 'object' && typeof obj !== 'function'`，以及 null）。
</details>

<details><summary>myCreate 提示</summary>

创建空对象 → `Object.setPrototypeOf(obj, proto)` → 如果有第二个参数，`Object.defineProperties(obj, propertiesObject)`。
</details>

## 练习 2-4：mixin

<details><summary>提示 1：为什么 Object.assign 不行</summary>

`Object.assign` 读取 getter 的**返回值**再赋值给目标对象，getter 本身没有被复制过去。我们要复制的是「属性描述符」。
</details>

<details><summary>提示 2：关键 API</summary>

- `Object.getOwnPropertyDescriptors(obj)`：获取所有自有属性的描述符（包括 Symbol、不可枚举的），getter 不会被调用
- `Object.defineProperties(target, descriptors)`：按描述符定义属性
</details>

<details><summary>提示 3：骨架</summary>

```js
class Mixed extends Base {}
for (const m of mixins) {
  Object.defineProperties(Mixed.prototype, Object.getOwnPropertyDescriptors(m));
}
Object.defineProperty(Mixed, 'name', { value: /* ... */ });
return Mixed;
```
Serializable.toJSON 中，`this.constructor.fields` 就是类的静态属性 fields。
</details>
