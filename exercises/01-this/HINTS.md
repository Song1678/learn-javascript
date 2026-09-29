# 第 01 章 提示

> 卡住时**只展开一级**，看完马上回去写代码。提示 1 = 思路，提示 2 = 关键 API，提示 3 = 代码骨架。

## 练习 1-0：this 入门

<details><summary>任务 1 提示</summary>

以 `shop.addProduct(x)` 的方式调用时，方法里的 `this` 就是 `shop`。所以写 `this.products.push(product)`，然后 `return this`。
describe 里用 `this.name` 和 `this.products.length`。
</details>

<details><summary>任务 2 提示</summary>

`fn.call(obj, 参数1, 参数2)`：调用 fn，并让 fn 里的 this 指向 obj。所以是 `shop.describe.call(otherShop)`。
</details>

<details><summary>任务 3 提示</summary>

`this.increment.bind(this)` 返回一个新函数，它的 this 被永远固定为当前实例。把它赋值给实例自己：`this.increment = this.increment.bind(this);`
</details>

<details><summary>任务 4 提示</summary>

```js
setTimeout(() => {
  this.visible = false; // 箭头函数里的 this 就是 show 方法里的 this
}, ms);
```
</details>

## 练习 1-1：预测 this 的指向

<details><summary>通用解题方法</summary>

每道题都问自己两个问题：
1. 这个函数是**普通函数**还是**箭头函数**？箭头函数 → 去找它**定义时**外层函数的 this。
2. 普通函数 → 看它**被调用的那一行**长什么样：
   - `new Foo()` → 新对象
   - `foo.call(obj)` / `bind` → obj（bind 过的函数不能再改）
   - `obj.foo()` → obj（只看点号左边最近的对象）
   - `foo()` → 严格模式下是 undefined

本文件是 ES Module，所以是严格模式；`class` 内部也总是严格模式。
</details>

## 练习 1-2：修复购物车

<details><summary>提示 1：找 Bug</summary>

先运行测试，看报错信息。几乎每个 Bug 的报错都是 `Cannot read properties of undefined` 或 `this.xxx is not a function`。
找出所有「把函数交给别人调用」的地方：`forEach(function...)`、`setTimeout(function...)`、`.then(function...)`、以及页面上 `button.onClick(cart.clear)`。
</details>

<details><summary>提示 2：怎么修</summary>

- 回调写在方法内部（forEach、setTimeout、then）：把 `function () {}` 改成箭头函数 `() => {}`。
- 方法被整个传出去（`cart.clear`）：在 constructor 里 `this.clear = this.clear.bind(this);`
</details>

## 练习 1-3：手写 call / apply / bind

<details><summary>myCall 提示 1</summary>

回忆隐式绑定：`obj.fn()` 调用时 fn 里的 this 就是 obj。
那么想让 fn 以 thisArg 为 this 执行，只要**临时**把 fn 挂到 thisArg 上，用 `thisArg.临时名()` 调用，调用完删掉。
</details>

<details><summary>myCall 提示 2</summary>

- 临时属性名用 `Symbol()`，保证不会覆盖对象原有的属性。
- thisArg 为 null/undefined 时用 `globalThis`；为原始值时用 `Object(thisArg)` 包装成对象（数字上不能挂属性）。
- 用 `try { ... } finally { delete ... }` 保证出错时也能删掉临时属性。
</details>

<details><summary>myCall 提示 3</summary>

```js
const context = thisArg == null ? globalThis : Object(thisArg);
const key = Symbol('fn');
context[key] = fn;
try {
  return context[key](...args);
} finally {
  delete context[key];
}
```
</details>

<details><summary>myBind 提示 1（基础）</summary>

返回一个新函数，调用新函数时，用 myApply 以 thisArg 调用 fn，参数是「预置参数 + 新传入的参数」。
</details>

<details><summary>myBind 提示 2（[进阶] 支持 new）</summary>

- 在返回的函数中，`new.target` 不为 undefined 就说明它正在被 `new` 调用，此时应该用 `this`（新创建的实例）而不是 thisArg。
- 要让 `new Bound() instanceof fn` 成立，需要 `bound.prototype = Object.create(fn.prototype)`。
- 返回的函数必须用 `function` 声明（箭头函数不能被 new）。
</details>

<details><summary>bindAll 提示</summary>

遍历方法名，`obj[name] = myBind(obj[name], obj)`。方法不存在时 `throw new TypeError(...)`。
</details>
