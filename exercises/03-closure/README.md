# 第 03 章：闭包与高阶函数

> 一句话：**函数 + 它创建时所在的词法环境 = 闭包。** 函数「记住」了创建它时能访问的变量，哪怕外层函数早已返回。

后面章节的 Promise 工具、并发控制、事件总线，几乎全部建立在闭包之上，所以这一章是承上启下的基础。

## 知识点速览

### 闭包的三大用途

1. **保存私有状态**：`debounce` 里的 `timer`，`createStore` 里的 `state` —— 外部无法直接访问。
2. **工厂函数**：每次调用 `debounce()` 都生成一套**独立**的状态，互不干扰。
3. **柯里化 / 函数组合**：Redux 中间件 `store => next => action => {}` 的每一层都在闭包里保存上一层的参数。

### 经典陷阱

```js
for (var i = 0; i < 3; i++) setTimeout(() => console.log(i));  // 3 3 3：共享同一个 i
for (let i = 0; i < 3; i++) setTimeout(() => console.log(i));  // 0 1 2：每轮循环一个新的 i
```

```js
function debounce(fn, wait) {
  let timer;
  return (...args) => {          // ❌ 箭头函数：拿不到调用者传入的 this
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), wait);
  };
}
```

包装函数（decorator）如果要透传 `this`，外层返回的必须是**普通函数**，内层再用箭头函数捕获它。

### 内存泄漏

闭包引用的变量不会被回收。缓存（memoize）没有过期和容量限制时，就是一个「合法的」内存泄漏。

## 练习

| 文件 | 类型 | 内容 |
| --- | --- | --- |
| `01-debounce.js` | ✍️ 实现 | 搜索联想防抖（含 `cancel` / `flush`）；附加题：滚动节流 |
| `02-memoize.js` | ✍️ 实现 | 带 TTL、LRU 淘汰、异步失败自动清除的缓存函数 |
| `03-store.js` | ✍️ 实现 | 迷你 Redux：私有 state、订阅快照；附加题：中间件机制 |

```bash
npm test -- 03
```

## 做题建议

- `02-memoize.js` 中「缓存 Promise 本身而不是结果」是一个非常实用的技巧，第 05 章的请求去重还会用到。
- `03-store.js` 的附加题很烧脑。如果卡住，先手动写出两个中间件嵌套后的样子：`logger(api)(thunk(api)(store.dispatch))`，再想怎么用 `reduceRight` 自动化。

## 延伸思考

- React 的 `useState`、`useCallback` 为什么会有「闭包陷阱」（stale closure）？
- 在 Vue / React 组件里使用 `debounce` 时，为什么不能在每次渲染时都重新调用 `debounce()`？
