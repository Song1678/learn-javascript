# 第 08 章 提示

> 卡住时**只展开一级**，看完马上回去写代码。

## 关卡 1：工具函数

<details><summary>提示</summary>

这些函数在第 04、05、06 章都写过，把你的实现复制过来即可。还没做过的话，可以直接复制 `solutions/08-capstone/src/utils/` 下的文件。

`createIdFactory`：
```js
const it = orderNoGenerator(options);
return () => it.next().value;
```
</details>

## 关卡 2：能下单

<details><summary>getOrder 提示</summary>

`return assertFound(await this.#db.getOrder(id), '订单', id);`
</details>

<details><summary>#validateCreateInput 提示</summary>

```js
const issues = [];
const { userId, items } = input ?? {};
if (typeof userId !== 'string' || userId.trim() === '') issues.push({ path: 'userId', message: '必须是非空字符串' });
if (!Array.isArray(items) || items.length === 0) {
  issues.push({ path: 'items', message: '至少购买一件商品' });
} else {
  items.forEach((item, i) => { /* 检查 sku、qty */ });
}
if (issues.length) throw new ValidationError('参数校验失败', issues);
return { userId, items };
```
</details>

<details><summary>createOrder 第 2 步提示</summary>

```js
const products = await Promise.all(items.map(({ sku }) => this.#db.getProduct(sku)));
products.forEach((p, i) => assertFound(p, '商品', items[i].sku));
```
</details>

<details><summary>createOrder 第 4 步提示</summary>

```js
const orderItems = items.map((item, i) => ({
  sku: item.sku,
  name: products[i].name,
  price: products[i].price,
  qty: item.qty,
  reservationId: reservations[i].reservationId,
}));
const total = orderItems.reduce((sum, it) => sum + it.price * it.qty, 0);
```
</details>

## 关卡 3：库存预占

<details><summary>3.1 提示</summary>

```js
const results = [];
for (const { sku, qty } of items) {
  results.push(await this.#inventory.reserve(sku, qty));
}
return results;
```
</details>

<details><summary>3.2 提示</summary>

把 `this.#inventory.reserve(sku, qty)` 换成：
```js
await retry(() => this.#inventory.reserve(sku, qty), {
  retries: this.#config.inventoryRetries,
  delay: this.#config.retryDelay,
  factor: 2,
  shouldRetry: (err) => err.retryable === true,
});
```
再用 try/catch 把库存服务的错误转换成 `ConflictError` / `AppError`（见方法注释）。
</details>

<details><summary>3.3 [进阶] 提示</summary>

```js
const results = await mapLimit(items, this.#config.reserveConcurrency, async ({ sku, qty }) => {
  try {
    return { ok: true, value: await retry(/* ... */) };
  } catch (error) {
    return { ok: false, error, sku };   // 不抛错！
  }
});
const failure = results.find((r) => !r.ok);
if (!failure) return results.map((r) => r.value);
// 释放所有 ok 的预占，然后根据 failure.error.code 抛出对应的错误
```
</details>

## 关卡 4：支付与通知

<details><summary>#charge 提示</summary>

`payment.charge` 是回调风格，并且依赖 this：
```js
this.#charge = promisify(payment.charge).bind(payment);
```
</details>

<details><summary>notificationService 提示</summary>

```js
const offs = [
  bus.on('order.paid', (order) => retry(() => sms.send(order.userId, `...`), { retries: smsRetries, delay: 5 })),
  bus.on('order.paid', (order) => db.addPoints(order.userId, Math.floor(order.total / 100))),
  bus.on('order.cancelled', (order) => /* ... */),
];
return () => offs.forEach((off) => off());
```
监听器一定要 **return** Promise，`emitAsync` 才能等待它并捕获它的错误。金额格式化：`(cents / 100).toFixed(2)`。
</details>

## 关卡 5：取消订单

<details><summary>提示</summary>

`#releaseAll`：`await Promise.all(orderItems.map((it) => this.#inventory.release(it.reservationId)));`

[进阶] 防重复支付：payOrder 最开始检查 `this.#paying.has(id)`，然后 `add`，把剩下的逻辑放在 `try { } finally { this.#paying.delete(id); }` 中。
</details>

## 关卡 6：查询与统计

<details><summary>提示</summary>

iterateOrders 和第 06 章的 paginate 几乎一样，只是换成调用 `this.#db.listOrders({ userId, cursor, limit: pageSize })`。

getUserStats：
```js
const stats = { total: 0, byStatus: { PENDING: 0, PAID: 0, CANCELLED: 0 }, paidAmount: 0 };
for await (const order of this.iterateOrders(userId)) { /* 累加 */ }
return stats;
```
</details>
