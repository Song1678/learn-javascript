# 第 06 章：迭代器与生成器

> 一句话：**生成器是一个可以「暂停」和「恢复」的函数。**
> 每次 `yield` 交出一个值并暂停，下一次 `next()` 从暂停处继续 —— 函数的局部状态被完整保留。

## 知识点速览

### 迭代器协议

```js
// 可迭代对象：有 [Symbol.iterator]() 方法，返回一个迭代器
// 迭代器：有 next() 方法，返回 { value, done }
const iterable = {
  [Symbol.iterator]() {
    let i = 0;
    return { next: () => (i < 3 ? { value: i++, done: false } : { value: undefined, done: true }) };
  },
};
[...iterable]; // [0, 1, 2]
```

`for...of`、展开运算符 `...`、解构赋值、`Array.from`、`Promise.all`、`new Map(iterable)` 都使用这套协议。

### 生成器 = 写迭代器的语法糖

```js
function* range(start, end) {
  for (let i = start; i < end; i++) yield i;
}
```

| API | 作用 |
| --- | --- |
| `it.next(v)` | 恢复执行，`v` 成为上一个 `yield` 表达式的值 |
| `it.return(v)` | 提前结束（会执行 `finally`）；`for...of` 中 `break` 时自动调用 |
| `it.throw(e)` | 在暂停的 `yield` 处抛出错误 |
| `yield* other` | 委托给另一个可迭代对象，值为被委托生成器的 `return` 值 |

### 生成器在业务中的四种用途

1. **惰性序列**：ID 生成器、无限序列、只在需要时计算（练习 2）
2. **流式处理大数据**：管道式处理，内存占用恒定（练习 3）
3. **异步数据流**：`async function*` + `for await...of` 处理分页、轮询、流（练习 4）
4. **流程控制**：暂停/恢复 + 双向通信，async/await 的底层原理，redux-saga（练习 5）

> Node.js 的 `Readable` 流、浏览器的 `ReadableStream` 都支持 `for await...of`，例如逐行读取大文件：
> `for await (const line of readline.createInterface({ input: fs.createReadStream(file) }))`

## 练习

| 文件 | 难度 | 类型 | 内容 |
| --- | --- | --- | --- |
| `00-basics.js` | ⭐ 必做 | ✍️ 入门 | yield、range、分页、无限轮播、让对象可迭代 |
| `01-predict.js` | ⭐⭐ 必做 | 🧠 预测输出 | 9 道题：惰性、双向通信、return/throw、yield* |
| `02-iterables.js` | ⭐⭐ 必做 | ✍️ 实现 | 订单号生成器（每日重置）、可迭代的订单簿类 |
| `03-lazy-pipeline.js` | ⭐⭐ 必做 | ✍️ 实现 | 从海量日志中找慢请求：惰性 `map/filter/limit/chunk/pipe` |
| `04-async-generator.js` | ⭐⭐⭐ 选做 | ✍️ 实现 | 游标分页导出全部订单；[进阶] 支付状态轮询 |
| `05-co.js` | 🏆 挑战 | ✍️ 实现 | 实现 co 自动执行器，并用生成器改写结账流程（整道题都是 [进阶]） |

> 第一遍学习：按顺序完成「必做」，用 `--basic` 模式跑测试（跳过选做练习和 `[进阶]` 用例）。卡住时看 [HINTS.md](HINTS.md)，提示分三级，一次只展开一级。
> 学完全部章节后，再回来挑战「选做」和 `[进阶]`。

```bash
npm test -- 06 --basic      # 基础模式（第一遍推荐）
npm test -- 06              # 完整模式
```

## 延伸思考

- 为什么 `05-co.js` 中要用 `Promise.resolve(value).then(...)` 而不是直接判断 `value instanceof Promise`？
- 生成器的惰性和第 05 章的并发控制可以结合：能否写一个 `mapLimit` 的异步生成器版本，边产出结果边处理？
- 了解一下 [Iterator Helpers](https://github.com/tc39/proposal-iterator-helpers)（ES2025 已标准化，Node 22 可用）：`iterator.map().filter().take()`，和你在练习 3 中实现的东西有什么异同？
