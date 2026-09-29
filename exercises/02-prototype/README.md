# 第 02 章：原型与原型链

> 一句话：**每个对象都有一个隐藏的 `[[Prototype]]` 指针。读属性时自己没有，就沿着这条链往上找，找到 `null` 为止。**
> `class` 只是这套机制的语法糖。

## 知识点速览

### 三个容易混淆的东西

```js
function Product() {}
const p = new Product();

Object.getPrototypeOf(p) === Product.prototype;          // true：实例的原型
Product.prototype.constructor === Product;               // true：默认 prototype 对象指回构造函数
Object.getPrototypeOf(Product) === Function.prototype;   // true：函数自身也是对象，也有原型
```

- `prototype`：**只有函数才有**的一个普通属性，用于将来 `new` 出来的实例的原型。
- `[[Prototype]]`：**每个对象都有**的内部槽位，用 `Object.getPrototypeOf()` 读取。
- `__proto__`：`[[Prototype]]` 的历史遗留访问器，**不推荐在业务代码中使用**。

### 原型链示意

```
p ──> Product.prototype ──> Object.prototype ──> null
       │ getName()            │ toString()
       │ constructor          │ hasOwnProperty()
```

### 读和写是不对称的

- **读**：沿原型链查找。
- **写**（`obj.x = 1`）：通常直接在对象**自身**创建/修改属性，**不会**修改原型（除非原型链上有 setter 或只读属性）。
- 所以：`a.tags.push()` 是「读 tags 再调用方法」，会改到原型上共享的数组 → 经典 Bug。

### class 与原型的对应关系

```js
class DiscountProduct extends Product {       // Object.setPrototypeOf(DiscountProduct, Product)
                                              // DiscountProduct.prototype = Object.create(Product.prototype)
  constructor(opts) {
    super(opts);                              // Product.call(this, opts)
  }
  getPrice() {                                // DiscountProduct.prototype.getPrice = function () {...}
    return super.getPrice() * this.discount;  // Product.prototype.getPrice.call(this)
  }
  static create() {}                          // DiscountProduct.create = function () {...}
}
```

## 练习

| 文件 | 类型 | 内容 |
| --- | --- | --- |
| `01-predict.js` | 🧠 预测输出 | 11 道题：共享引用、属性遮蔽、constructor 丢失、instanceof 原理…… |
| `02-product-models.js` | ✍️ 实现 | 不用 class，用 ES5 方式实现商品模型继承（寄生组合式继承） |
| `03-new-instanceof.js` | ✍️ 手写实现 | 手写 `new` / `instanceof` / `Object.create` |
| `04-mixin.js` | 🐞+✍️ | 修复 `Object.assign` 做 mixin 时 getter 失效的问题，实现正确的 mixin |

```bash
npm test -- 02
```

## 做题建议

1. 做 `02-product-models.js` 前，先画出你打算构建的原型链图，再写代码。
2. 做完后，把 `02-product-models.js` 用 `class` 改写一遍（写在别的文件里），对照「class 与原型的对应关系」，体会语法糖背后的东西。
3. 在浏览器控制台里输入 `console.dir(someObject)`，展开 `[[Prototype]]`，亲眼看看原型链。

## 延伸思考

- 为什么 `Object.create(null)` 常被用作字典？和 `Map` 相比各有什么优劣？
- 「原型污染」（Prototype Pollution）是一种常见的安全漏洞：`merge({}, JSON.parse('{"__proto__": {"isAdmin": true}}'))`。它是怎么发生的？如何防御？
- 为什么说「组合优于继承」？mixin 有什么缺点？（提示：命名冲突、来源不清晰）
