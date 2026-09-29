# 第 04 章：Promise

> 一句话：**Promise 是一个「未来值」的容器，它有三种状态，且状态只能从 pending 变一次。**
> `then` 永远返回一个**新的** Promise，链式调用靠的就是这一点。

## 知识点速览

### 事件循环（Event Loop）极简模型

```
┌──────────────────────┐
│  执行一段同步代码      │  ← 一个宏任务（script / setTimeout 回调 / I/O 回调）
└──────────┬───────────┘
           ▼
┌──────────────────────┐
│  清空「所有」微任务     │  ← Promise.then / await 之后的代码 / queueMicrotask
└──────────┬───────────┘     （微任务中产生的新微任务，也在这一轮执行完）
           ▼
     取下一个宏任务 ……
```

### then 的返回值决定了下一个 Promise

| then 回调中…… | 下一个 Promise |
| --- | --- |
| `return 普通值` | 以该值成功 |
| `return promise` | **等待**它，跟随它的结果 |
| `throw err` | 以 err 失败 |
| 什么都不 return | 以 `undefined` 成功（**不会等待回调里启动的异步操作！**） |

### 常见反模式

```js
// ❌ Promise 构造函数反模式：已经有 Promise 了，没必要再包一层
function getUser(id) {
  return new Promise((resolve, reject) => {
    api.get(`/users/${id}`).then(resolve).catch(reject);
  });
}
// ✅
const getUser = (id) => api.get(`/users/${id}`);

// ❌ 回调地狱式的嵌套 then
getUser(id).then((user) => {
  getOrders(user.id).then((orders) => { ... });   // 还忘了 return
});
// ✅ 扁平化
getUser(id)
  .then((user) => getOrders(user.id))
  .then((orders) => { ... });

// ❌ 吞掉错误
promise.catch(() => {});   // 出了问题谁也不知道
```

### 四个组合器怎么选

| 场景 | 选择 |
| --- | --- |
| 全部都要，缺一不可 | `Promise.all` |
| 各自独立，失败的单独处理 | `Promise.allSettled` |
| 谁快用谁（包括失败） | `Promise.race`（常用于超时） |
| 谁先成功用谁，全败才失败 | `Promise.any`（多节点容灾） |

## 练习

| 文件 | 类型 | 内容 |
| --- | --- | --- |
| `01-event-loop.js` | 🧠 预测输出 | 9 道执行顺序题 |
| `02-promisify.js` | ✍️ 实现 | 改造回调风格的老支付 SDK：`promisify` / `promisifyAll` / `callbackify` |
| `03-combinators.js` | ✍️ 手写实现 | `all` / `allSettled` / `race` / `any` |
| `04-timeout-retry.js` | ✍️ 实现 | 库存服务调用：超时控制 + 指数退避重试 |
| `05-my-promise.js` | 🏆 挑战 | 从零实现符合 Promise/A+ 核心语义的 `MyPromise` |

```bash
npm test -- 04
npm test -- 04/my-promise    # 挑战题单独跑
```

## 做题建议

- `05-my-promise.js` 难度较大，建议分步推进：先让「基础」组测试通过，再做「链式调用」，最后做 `finally` 和静态方法。
- 做完 `04-timeout-retry.js` 后想一想：`withTimeout` 超时后，原来那个请求**真的停止了吗**？（没有！它还在跑。第 05 章用 `AbortController` 解决这个问题。）

## 延伸思考

- 为什么 `Promise.resolve().then(...)` 中的回调是异步执行的？如果同步执行会出现什么问题？（搜索关键词：Zalgo）
- 一个 rejected 的 Promise 没有被 catch 会发生什么？在浏览器和 Node.js 中分别怎样全局监听？
