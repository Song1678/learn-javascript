# 第 06 章 提示

> 卡住时**只展开一级**，看完马上回去写代码。

## 练习 6-0：生成器入门

<details><summary>提示</summary>

- range：`for (let i = start; i < end; i += step) yield i;`
- paginate：`for (let i = 0; i < list.length; i += pageSize) yield list.slice(i, i + pageSize);`
- carousel：用一个下标变量，`while (true) { yield images[index]; index = (index + 1) % images.length; }`
- 可迭代对象：`*[Symbol.iterator]() { yield* this.items; }`
</details>

## 练习 6-1：预测题

<details><summary>解题方法</summary>

- 调用生成器函数时，函数体**一行都不执行**，只返回一个迭代器对象。
- 每次 `next(v)`：从上次暂停的地方继续执行到下一个 `yield`，`v` 成为上一个 `yield` 表达式的值。
- `for...of`、`...` 会忽略 `return` 的值。
- `break` 会调用迭代器的 `return()`，从而执行 `finally`。
</details>

## 练习 6-2：订单号与订单簿

<details><summary>take 提示</summary>

用 `for...of` 遍历，push 到结果数组，**push 之后**立即判断是否够了，够了就 `break`（break 会自动关闭迭代器）。
</details>

<details><summary>createOrderNoGenerator 提示</summary>

```js
let seq = 0;
let lastDate = null;
while (true) {
  const date = /* 把 now() 格式化成 yyyyMMdd */;
  if (date !== lastDate) { lastDate = date; seq = 0; }
  seq++;
  const command = yield `${prefix}${date}${String(seq).padStart(width, '0')}`;
  if (command === 'reset') seq = 0;
}
```
月份用 `getMonth() + 1`（getMonth 从 0 开始）。
</details>

<details><summary>OrderBook 提示</summary>

用 `#orders = []` 私有字段存储；`*[Symbol.iterator]() { yield* this.#orders; }`；`*byStatus(status)` 中用 for...of 遍历，状态匹配就 yield；`static from(iterable) { return new this(iterable); }`。
</details>

## 练习 6-3：惰性管道

<details><summary>提示 1：操作符的形状</summary>

```js
export function map(fn) {
  return function* (iterable) {
    let i = 0;
    for (const item of iterable) yield fn(item, i++);
  };
}
```
filter、limit、chunk 都是同样的形状。limit 取够 n 个后直接 `return`。
</details>

<details><summary>提示 2：pipe</summary>

`operators.reduce((acc, op) => op(acc), source)`
</details>

<details><summary>提示 3：lines</summary>

用 `text.indexOf('\n', start)` 找到下一个换行符的位置，`yield text.slice(start, end)`，然后 `start = end + 1`；找不到换行符时 end 就是 `text.length`。
</details>

## 练习 6-4：异步生成器

<details><summary>paginate 提示</summary>

```js
let cursor = null;
do {
  const { items, nextCursor } = await fetchPage(cursor);
  yield* items;
  cursor = nextCursor;
} while (cursor !== null);
```
</details>

<details><summary>exportAllOrders 提示</summary>

`for await (const batch of batchAsync(paginate(fetchPage), batchSize)) { await writer.write(batch); total += batch.length; }`，整段用 `try { ... } finally { await writer.close(); }` 包起来。
</details>

<details><summary>poll 提示</summary>

`for (let attempt = 1; attempt <= maxAttempts; attempt++)`：`await check()` → `yield` 结果 → 满足 until 就 `return` → 否则 `await sleep(interval)`。循环结束还没返回，就 `throw new Error('轮询超时')`。
</details>

## 练习 6-5：🏆 co

<details><summary>提示 1</summary>

思路：调用 `genFn` 得到迭代器 `it`，写一个 `step(method, input)` 函数：调用 `it[method](input)`（method 是 'next' 或 'throw'），拿到 `{ value, done }`：
- done → resolve(value)
- 否则 `Promise.resolve(value).then(v => step('next', v), e => step('throw', e))`
</details>

<details><summary>提示 2</summary>

整个 run 返回 `new Promise((resolve, reject) => { ... })`；调用 genFn 和 `it[method]()` 都要 try/catch，出错就 reject。checkoutFlow 就是把原来 async 函数里的 `await` 换成 `yield`。
</details>
