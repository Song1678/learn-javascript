# 第 05 章：async/await 与异步流程控制

> 一句话：**`async` 函数永远返回 Promise；`await` 让出执行权，等 Promise 完成后再从这里继续。**
> 语法看起来像同步代码，但每个 `await` 都是一个「断点」，断点前后之间，世界可能已经变了。

## 知识点速览

### 串行 vs 并行

```js
// 串行：总耗时 = a + b
const a = await getA();
const b = await getB();

// 并行：总耗时 = max(a, b)
const [a, b] = await Promise.all([getA(), getB()]);

// 并行的另一种写法：先启动，再等待
const pa = getA();
const pb = getB();
const a = await pa;   // ⚠️ 如果 pb 在 pa 之前 reject，会产生「未处理的 rejection」警告，更推荐 Promise.all
const b = await pb;
```

### 数组方法 + async 的四个坑

| 写法 | 实际效果 |
| --- | --- |
| `arr.forEach(async x => await f(x))` | ❌ forEach 不等待，立即返回 |
| `arr.map(async x => await f(x))` | 得到 Promise 数组，需要 `await Promise.all(...)` |
| `arr.filter(async x => await f(x))` | ❌ Promise 永远是 truthy，全部保留 |
| `arr.reduce(async (acc, x) => ...)` | acc 变成了 Promise，需要 `await acc` |
| `for (const x of arr) await f(x)` | ✅ 真正的串行 |

### try/catch 只能捕获被 await 的错误

```js
async function f() {
  try {
    return fetchData();         // ❌ 没有 await，Promise 被原样返回，reject 时已离开 try
  } catch { ... }
}
async function f() {
  try {
    return await fetchData();   // ✅
  } catch { ... }
}
```

### 真实项目中的三大异步问题

1. **并发过高** → 并发池 `mapLimit` / 任务队列（练习 2）
2. **重复请求** → in-flight 去重 + 缓存（练习 3）
3. **竞态条件** → AbortController 取消过期请求（练习 4）

## 练习

| 文件 | 类型 | 内容 |
| --- | --- | --- |
| `01-fix-bugs.js` | 🐞 修 Bug | 运营后台 5 个典型 async/await Bug |
| `02-concurrency.js` | ✍️ 实现 | 批量上传图片：并发池 `mapLimit` + 任务队列 `TaskQueue` |
| `03-request-dedupe.js` | ✍️ 实现 | 首页多组件同时请求用户信息：请求去重 + 缓存 + 失效 |
| `04-latest-only.js` | ✍️ 实现 | 订单筛选竞态：`AbortController` 取消过期请求 |

```bash
npm test -- 05
```

## 做题建议

- `01-fix-bugs.js`：先不要看代码，只运行测试，根据失败信息推测 Bug 在哪，再对照代码验证。这是真实工作中排查问题的方式。
- `02-concurrency.js`：TaskQueue 是一个完整的小类，练习用 `#私有字段` 封装内部状态，只通过 getter 暴露只读信息。
- 做完本章，你已经能看懂 `p-limit`、`p-queue`、SWR / React Query 的核心原理了。

## 延伸思考

- `03-request-dedupe.js` 中，如果缓存的数据量很大，如何避免内存无限增长？（回顾第 03 章 LRU）
- React 的 `useEffect` 里请求数据时，为什么官方推荐在清理函数里取消请求或设置 `ignore = true`？这和练习 4 是同一个问题吗？
