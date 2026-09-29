# 第 04 章 提示

> 卡住时**只展开一级**，看完马上回去写代码。

## 练习 4-0：Promise 入门

<details><summary>delay / loadConfig 提示</summary>

```js
return new Promise((resolve, reject) => {
  // 在异步操作完成时调用 resolve(结果)；失败时调用 reject(错误)
});
```
loadConfig：在 readFile 的回调里判断 err，有错就 `reject(err)` 并 return，否则 `resolve(JSON.parse(content))`。
</details>

<details><summary>getUserDiscount 提示</summary>

`api.getUser(userId).then((user) => api.getDiscount(user.level))` —— 在 then 的回调里 **return** 另一个 Promise。
</details>

<details><summary>getNickname / loadHomePage 提示</summary>

- `.then((user) => user.name).catch(() => '游客')`
- `Promise.all([a(), b()]).then(([banners, products]) => ({ banners, products }))`
</details>

## 练习 4-1：事件循环

<details><summary>解题方法</summary>

准备三列：**同步**、**微任务队列**、**宏任务队列**。逐行阅读代码：
- 普通代码 → 立即执行，写进输出
- `.then(cb)`：如果前面的 Promise 已经完成，cb 进入微任务队列；否则等它完成时再进入
- `await x` 之后的代码 → 相当于放进 `.then` 回调
- `setTimeout(cb)` → cb 进入宏任务队列

同步代码执行完 → 依次清空微任务（执行中产生的新微任务也排到队尾一起执行）→ 取一个宏任务 → 再清空微任务……
</details>

## 练习 4-2：promisify

<details><summary>提示 1</summary>

返回一个新函数，新函数返回 `new Promise(...)`，在 executor 中调用原函数，并在参数最后追加一个回调 `(err, result) => { ... }`。
</details>

<details><summary>提示 2：this</summary>

返回的新函数用 `function (...args)` 写，在里面用 `fn.call(this, ...args, callback)` 调用原函数。注意 Promise 的 executor 要用箭头函数，才能拿到外层的 this。
</details>

<details><summary>提示 3：promisifyAll</summary>

- `const result = Object.create(obj)`：新对象以原对象为原型，能访问原对象所有属性
- 沿原型链收集方法名：`for (let o = obj; o && o !== Object.prototype; o = Object.getPrototypeOf(o))`，用 `Object.getOwnPropertyNames(o)`，排除 `constructor`
- `result[name + 'Async'] = (...args) => promisify(obj[name]).apply(obj, args)`
</details>

## 练习 4-3：组合器

<details><summary>all 提示</summary>

```js
return new Promise((resolve, reject) => {
  const items = Array.from(iterable);
  const results = new Array(items.length);
  let remaining = items.length;
  if (remaining === 0) return resolve([]);
  items.forEach((item, index) => {
    Promise.resolve(item).then((value) => {
      results[index] = value;     // 按下标存，保证顺序
      if (--remaining === 0) resolve(results);
    }, reject);
  });
});
```
</details>

<details><summary>allSettled / race / any 提示</summary>

- allSettled：把每一项先 `.then(value => ({status:'fulfilled', value}), reason => ({status:'rejected', reason}))`，再交给 all
- race：每一项 `Promise.resolve(item).then(resolve, reject)`，谁先谁赢（之后的调用会被忽略）
- any：和 all 反过来——成功直接 resolve，失败计数，全部失败时 `reject(new AggregateError(errors, '...'))`
</details>

## 练习 4-4：超时与重试

<details><summary>withTimeout 提示</summary>

创建一个「到时间就 reject」的 Promise，与原 Promise 用 `Promise.race` 赛跑。最后 `.finally(() => clearTimeout(timer))` 清理定时器。
</details>

<details><summary>retry 提示</summary>

```js
for (let attempt = 1; ; attempt++) {
  try {
    return await fn(attempt);   // 必须 await，否则 catch 不到
  } catch (err) {
    if (attempt > retries || !shouldRetry(err, attempt)) throw err;
    await sleep(delay * factor ** (attempt - 1));
  }
}
```
</details>

## 练习 4-5：🏆 MyPromise

<details><summary>提示 1：先搭骨架</summary>

需要三个内部状态：`state`（pending/fulfilled/rejected）、`value`（结果或原因）、`handlers`（pending 时注册的回调数组）。
constructor 中定义 resolve / reject，调用 executor，用 try/catch 包住。
</details>

<details><summary>提示 2：then</summary>

then 返回 `new MyPromise((resolve, reject) => { ... })`。把 `{ onFulfilled, onRejected, resolve, reject }` 存起来：
- 如果当前已完成 → 立即安排执行
- 否则放进 handlers，等状态改变时再执行

执行时用 `queueMicrotask`：取对应的回调，不是函数就穿透（直接 resolve/reject 当前值），是函数就 `try { resolve(cb(value)) } catch (e) { reject(e) }`。
</details>

<details><summary>提示 3：resolve 一个 thenable</summary>

resolve(x) 时，如果 x 是对象/函数并且有 then 方法，就调用 `x.then(resolve, reject)`，让当前 Promise 跟随 x 的结果。注意 x === 当前 promise 时要以 TypeError 失败。
</details>
