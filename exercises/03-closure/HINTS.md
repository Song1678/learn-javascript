# 第 03 章 提示

> 卡住时**只展开一级**，看完马上回去写代码。

## 练习 3-0：闭包入门

<details><summary>createCounter 提示</summary>

```js
let count = initial;
return {
  increment: () => ++count,
  // decrement：count > 0 时才减
  get: () => count,
};
```
</details>

<details><summary>once 提示</summary>

用两个闭包变量：`called`（是否已调用过）和 `result`（第一次的结果）。返回的函数里：没调用过就调用 fn 并保存结果，然后总是返回 result。
</details>

<details><summary>循环闭包提示</summary>

`var` 在整个函数中只有一个变量；`let` 在 for 循环的每一轮都会创建一个新变量。
</details>

## 练习 3-1：防抖

<details><summary>提示 1：思路</summary>

用闭包保存一个 `timer`。每次调用：先 `clearTimeout(timer)` 取消上一次的计划，再 `timer = setTimeout(...)` 重新计划。
</details>

<details><summary>提示 2：this 与参数</summary>

返回的函数必须用 `function (...args) {}` 写（箭头函数拿不到调用者的 this），把 `this` 和 `args` 存到闭包变量里，定时器到期时 `fn.apply(savedThis, savedArgs)`。
</details>

<details><summary>提示 3：骨架</summary>

```js
let timer = null;
let lastArgs, lastThis;
function debounced(...args) {
  lastArgs = args;
  lastThis = this;
  clearTimeout(timer);
  timer = setTimeout(() => {
    timer = null;
    fn.apply(lastThis, lastArgs);
  }, wait);
}
debounced.cancel = () => { /* ... */ };
return debounced;
```
flush：如果 timer 不为 null，清除定时器并立即执行。
</details>

## 练习 3-2：memoize

<details><summary>提示 1：基础版（先让前几个测试通过）</summary>

```js
const store = new Map();
function memoized(...args) {
  const key = resolver.apply(this, args);  // 默认 resolver 返回第一个参数
  if (store.has(key)) return store.get(key);
  const value = fn.apply(this, args);
  store.set(key, value);
  return value;
}
```
</details>

<details><summary>提示 2：ttl</summary>

缓存时存 `{ value, expiresAt: Date.now() + ttl }`，读取时检查是否过期。ttl 不传时可以当作 `Infinity`。
</details>

<details><summary>提示 3：[进阶] 异步失败、LRU</summary>

- 异步失败：如果 value 有 `then` 方法，就 `value.catch(() => store.delete(key))`（或 `value.then(undefined, ...)`）。
- LRU：命中缓存时先 `delete` 再 `set`，把它移到 Map 的末尾；超出 maxSize 时删除 `store.keys().next().value`（最早的）。
</details>

## 练习 3-3：迷你 Redux

<details><summary>提示 1：基础结构</summary>

```js
let state = preloadedState;
let listeners = [];
function getState() { return state; }
function dispatch(action) {
  // 检查 action
  state = reducer(state, action);
  listeners.forEach((l) => l());
  return action;
}
function subscribe(listener) {
  listeners.push(listener);
  return () => { /* 从 listeners 中移除 */ };
}
dispatch({ type: '@@INIT' });
return { getState, dispatch, subscribe };
```
</details>

<details><summary>提示 2：[进阶] 快照与防止 reducer 中 dispatch</summary>

- 快照：subscribe/unsubscribe 时不要修改原数组，而是生成新数组（`[...listeners, l]` / `filter`）。dispatch 时先 `const snapshot = listeners` 再遍历。
- 用一个 `isDispatching` 标志，在 reducer 执行前后设置，用 `try/finally` 保证复位。
</details>

<details><summary>提示 3：[进阶] applyMiddleware</summary>

```js
return (createStore) => (reducer, preloadedState) => {
  const store = createStore(reducer, preloadedState);
  let dispatch = () => { throw new Error('...'); };
  const api = { getState: store.getState, dispatch: (action) => dispatch(action) };
  const chain = middlewares.map((mw) => mw(api));
  dispatch = chain.reduceRight((next, mw) => mw(next), store.dispatch);
  return { ...store, dispatch };
};
```
</details>
