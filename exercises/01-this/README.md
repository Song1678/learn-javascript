# 第 01 章：this 指向

> 一句话：**this 是函数「被调用时」才确定的，看的是「怎么调用」，而不是「在哪定义」。**
> 唯一的例外是箭头函数：它根本没有自己的 this，用的是定义时外层函数的 this。

## 知识点速览

### 四条绑定规则（优先级从高到低）

| 规则 | 调用形式 | this 指向 |
| --- | --- | --- |
| new 绑定 | `new Foo()` | 新创建的对象 |
| 显式绑定 | `foo.call(obj)` / `foo.apply(obj)` / `foo.bind(obj)()` | `obj` |
| 隐式绑定 | `obj.foo()` | 点号左边**最近**的对象 `obj` |
| 默认绑定 | `foo()` | 严格模式：`undefined`；非严格模式：`globalThis` |

箭头函数不参与上面的规则：`call/apply/bind` 都改不了它的 this。

> ES Module 和 `class` 内部**永远是严格模式**。现代项目基本都是 ESM，所以默认绑定几乎都是 `undefined`。

### 高频踩坑场景：隐式绑定丢失

只要函数被「当作值」传递出去，隐式绑定就丢了：

```js
const { clear } = cart;              // 解构
const fn = cart.clear;               // 赋值
button.addEventListener('click', cart.clear);  // 作为回调
setTimeout(cart.clear, 1000);        // 作为回调
promise.then(cart.clear);            // 作为回调
arr.forEach(function () { this });   // 普通函数作为回调
```

### 常见修复手段对比

| 方式 | 写法 | 适用场景 | 代价 |
| --- | --- | --- | --- |
| 箭头函数包一层 | `setTimeout(() => this.clear())` | 回调写在方法内部 | 无 |
| 构造函数中 bind | `this.clear = this.clear.bind(this)` | 方法需要被传出去 | 每个实例多一个函数 |
| 箭头函数类字段 | `clear = () => {...}` | 同上，写法更简洁 | 方法不在原型上：子类无法 `super.clear()`，也不便于 mock |
| thisArg 参数 | `arr.forEach(fn, this)` | 数组方法 | 不是所有 API 都支持 |

## 练习

| 文件 | 类型 | 内容 |
| --- | --- | --- |
| `01-predict.js` | 🧠 预测输出 | 11 道题，覆盖所有绑定规则与常见陷阱 |
| `02-cart.js` | 🐞 修 Bug | 购物车模块：4 个线上 this Bug |
| `03-bind.js` | ✍️ 手写实现 | 手写 `call` / `apply` / `bind`（支持 new）/ `bindAll` |

```bash
npm test -- 01            # 跑本章全部测试
npm test -- 01/predict    # 只跑预测题
```

## 做题建议

1. **预测题先别运行代码**，在纸上写下答案和理由，再跑测试核对。答错的题一定要弄明白为什么。
2. 修 Bug 时，先读测试文件 `tests/01-this/02-cart.test.js`，看看页面上是怎么调用的，自己复现报错信息，再动手改。
3. 手写 bind 时，重点思考：`new` 一个 bind 后的函数时发生了什么？可以查一下 `new.target`。

## 延伸思考

- React 类组件为什么要在 constructor 里写 `this.handleClick = this.handleClick.bind(this)`？函数组件为什么没有这个问题？
- Vue 2 的 `methods` 里为什么可以直接 `this.xxx`，而且把方法传给子组件也不会丢 this？（提示：Vue 在初始化时做了什么？）
- 在 Node.js 中，`setTimeout(function () { console.log(this) })` 打印的是什么？和浏览器有什么不同？
