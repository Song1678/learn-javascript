# 第 00 章 提示

> 使用方法：卡住时**只展开一级**，看完马上回去写代码。还是不会，再展开下一级。
> 提示 1 = 思路方向，提示 2 = 关键 API / 步骤，提示 3 = 代码骨架（接近答案）。

## 练习 0-1：订单报表

### findOrder

<details><summary>提示 1</summary>

`find` 接收一个回调，返回**第一个**让回调返回 `true` 的元素；找不到时返回 `undefined`。题目要求找不到时返回 `null`。
</details>

<details><summary>提示 2</summary>

`undefined ?? null` 的结果是 `null`。`??` 只在左边是 `null` 或 `undefined` 时才使用右边的值。
</details>

<details><summary>提示 3</summary>

```js
return orders.find((order) => /* 判断 id 是否相等 */) ?? null;
```
</details>

### orderTotal / totalRevenue

<details><summary>提示 1</summary>

`reduce` 把数组「折叠」成一个值：`arr.reduce((累加值, 当前元素) => 新的累加值, 初始值)`。
</details>

<details><summary>提示 2</summary>

```js
[1, 2, 3].reduce((sum, n) => sum + n, 0); // 6
```
订单金额：把 `n` 换成 `item.price * item.qty`。总营收：先 `getPaidOrders`，再对每个订单累加 `orderTotal(order)`。
</details>

<details><summary>提示 3</summary>

```js
export function orderTotal(order) {
  return order.items.reduce((sum, item) => sum + /* ? */, 0);
}
export function totalRevenue(orders) {
  return getPaidOrders(orders).reduce((sum, order) => sum + /* ? */, 0);
}
```
</details>

### countByStatus

<details><summary>提示 1</summary>

reduce 的初始值可以是对象 `{}`。每遇到一个订单，就把 `对象[订单状态]` 加 1。
</details>

<details><summary>提示 2</summary>

第一次遇到某个状态时，`counts[status]` 是 `undefined`，`undefined + 1` 是 `NaN`。用 `(counts[status] ?? 0) + 1`。
**回调最后必须 `return counts`**，否则下一轮拿到的累加值是 `undefined`。
</details>

<details><summary>提示 3</summary>

```js
return orders.reduce((counts, order) => {
  counts[order.status] = (counts[order.status] ?? 0) + 1;
  return counts;
}, {});
```
</details>

### topProducts

<details><summary>提示 1</summary>

分四步：① 只要已付款订单 ② 把所有订单的 items 合并成一个大数组 ③ 按 sku 累加数量 ④ 排序并取前 n 个。
</details>

<details><summary>提示 2</summary>

- ②：`orders.flatMap((o) => o.items)`
- ③：用 reduce 生成 `{ 'KB-01': { sku, name, qty }, ... }` 这样的对象，再用 `Object.values()` 变回数组
- ④：`.sort((a, b) => b.qty - a.qty).slice(0, n)`
</details>

<details><summary>提示 3</summary>

```js
const bySku = getPaidOrders(orders)
  .flatMap((order) => order.items)
  .reduce((acc, item) => {
    if (!acc[item.sku]) acc[item.sku] = { sku: item.sku, name: item.name, qty: 0 };
    acc[item.sku].qty += item.qty;
    return acc;
  }, {});
return Object.values(bySku) /* 排序、截取 */;
```
</details>

## 练习 0-2：用户资料与购物车

### normalizeUser

<details><summary>提示 1</summary>

解构赋值可以同时「重命名」和「设置默认值」：`const { nick_name: name, avatar_url: avatar = DEFAULT_AVATAR } = raw;`
</details>

<details><summary>提示 2</summary>

`raw.profile.city` 在 `profile` 不存在时会报错。用可选链：`raw.profile?.city`，再用 `?? '未知'` 兜底。
</details>

### mergeOptions

<details><summary>提示 1</summary>

`{ ...a, ...b }` 会把 a、b 的属性复制到新对象里，同名属性后面的覆盖前面的。但它是「浅」合并：`headers` 会被整个替换。
</details>

<details><summary>提示 2</summary>

先整体合并一次，再单独写一个 `headers` 属性覆盖它：`headers: { ...defaults.headers, ...options.headers }`。
展开 `undefined` 不会报错：`{ ...undefined }` 结果是 `{}`。
</details>

### pick / omit

<details><summary>提示 1</summary>

`Object.entries({ a: 1, b: 2 })` → `[['a', 1], ['b', 2]]`；`Object.fromEntries` 是它的反向操作。
</details>

<details><summary>提示 2</summary>

- omit：`Object.fromEntries(Object.entries(obj).filter(([key]) => /* key 不在 keys 中 */))`
- pick：遍历 `keys`，过滤掉 obj 中不存在的（`key in obj`），再 map 成 `[key, obj[key]]`
</details>

### updateQty

<details><summary>提示 1</summary>

「不修改原对象」意味着：要返回一个新的 cart 对象，里面是一个新的 items 数组，被修改的那个商品也是一个新对象。
</details>

<details><summary>提示 2</summary>

- 修改数量：`cart.items.map((item) => item.sku === sku ? { ...item, qty } : item)`
- 删除商品：`cart.items.filter((item) => item.sku !== sku)`
- 最后：`return { ...cart, items: 新数组 }`
</details>

## 练习 0-3：修 Bug 热身

<details><summary>Bug 1 提示</summary>

在控制台输入 `0.1 + 0.2` 看看结果。修复方法：`Math.round(total * 100) / 100` 四舍五入到两位小数。
</details>

<details><summary>Bug 2 提示</summary>

用 page = 1、pageSize = 2 手动算一下 start 和 end。第 1 页应该从下标 0 开始。另外查一下 `slice(start, end)` 包不包含 end。
</details>

<details><summary>Bug 3 提示</summary>

`sort` 会直接修改原数组。先复制一份再排序：`[...products]`。
</details>

<details><summary>Bug 4 提示</summary>

新用户的 `user.coupons` 是 `undefined`，读取 `undefined.length` 会报错。用 `?.` 和 `??`。
</details>
