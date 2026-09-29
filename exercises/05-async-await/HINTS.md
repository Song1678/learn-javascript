# 第 05 章 提示

> 卡住时**只展开一级**，看完马上回去写代码。

## 练习 5-0：async/await 入门

<details><summary>提示</summary>

```js
export async function getNickname(api, userId) {
  try {
    const user = await api.getUser(userId);
    return user.name;
  } catch {
    return '游客';
  }
}
```
- 并行：`const [a, b, c] = await Promise.all([api.x(), api.y(), api.z()]);`
- 串行循环：`for (const id of ids) { total += await api.getOrderAmount(id); }`
</details>

## 练习 5-1：修 Bug

<details><summary>Bug 1 提示</summary>

`forEach` 不会等待 async 回调，它同步地「启动」所有回调就返回了。换成 `await Promise.all(userIds.map(...))`。
</details>

<details><summary>Bug 2 提示</summary>

三个 await 一个接一个，总时间是三个之和。它们互不依赖，可以用 `Promise.all` 同时发出。
</details>

<details><summary>Bug 3 提示</summary>

`return promise`（没有 await）时，函数已经离开了 try 块，之后 Promise 失败，catch 捕获不到。加上 await。
</details>

<details><summary>Bug 4 提示</summary>

`orders.map((o) => api.deduct(o))` 会立即启动所有请求。需要一个接一个：`for...of` + `await`。
</details>

<details><summary>Bug 5 提示</summary>

async 函数返回的是 Promise 对象，Promise 对象永远是 truthy。先 `const flags = await Promise.all(skus.map(...))` 拿到布尔值，再同步 `filter((_, i) => flags[i])`。
</details>

## 练习 5-2：并发控制

<details><summary>mapLimit 提示 1</summary>

「worker 池」思路：同时启动 limit 个 worker，每个 worker 是一个循环：领取下一个下标 → 执行 → 保存结果 → 继续领取，直到没有任务。
</details>

<details><summary>mapLimit 提示 2</summary>

```js
const results = new Array(items.length);
let next = 0;
async function worker() {
  while (next < items.length) {
    const i = next++;               // JS 单线程，这里不会有竞争
    results[i] = await iteratee(items[i], i);
  }
}
await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
return results;
```
[进阶]：失败后不再领取新任务 → 加一个 `failed` 标志。
</details>

<details><summary>[进阶] TaskQueue 提示</summary>

队列里存 `{ task, resolve, reject }`。`add` 返回 `new Promise`，把 resolve/reject 存进队列，然后调用 `#next()`。
`#next()`：只要没暂停、运行数 < 并发数、队列非空，就取出一个执行；执行结束（finally）时运行数减一，再调用 `#next()`，并检查是否空闲。
</details>

## 练习 5-3：请求去重

<details><summary>提示 1</summary>

用一个 Map 保存「正在进行中的请求」：`key -> Promise`。同一个 key 再次请求时，直接返回这个 Promise。请求结束（无论成败）时从 Map 中删除。
</details>

<details><summary>提示 2：缓存</summary>

再用一个 Map 保存成功的结果：`key -> { value, expiresAt }`。请求时先查缓存，命中且未过期就 `return Promise.resolve(value)`。
</details>

<details><summary>提示 3：[进阶] invalidate 时的旧请求</summary>

给每个 key 维护一个「版本号」。发起请求时记下当时的版本；invalidate 时版本 +1；请求完成时，版本没变才写入缓存。
</details>

## 练习 5-4：竞态

<details><summary>提示 1</summary>

用闭包保存「当前请求」的 `AbortController`。每次新调用：先 `current?.abort()`，再创建新的 controller，把 `controller.signal` 作为最后一个参数传给 asyncFn。
</details>

<details><summary>提示 2</summary>

即使 asyncFn 不理会 signal，被取代的调用也要失败。先实现 `abortable(promise, signal)`：返回一个 new Promise，同时监听原 promise 的结果和 signal 的 `abort` 事件，谁先发生就用谁。然后在 latestOnly 中返回 `abortable(task, controller.signal)`。
</details>
