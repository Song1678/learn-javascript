# 第 00 章：热身 —— 熟悉工具，找回手感

这一章不涉及任何进阶概念，目标只有两个：

1. **熟悉做题流程**：读需求 → 读测试 → 写代码 → 跑测试 → 看报错 → 修改。后面每一章都是这个流程。
2. **找回写代码的手感**：数组方法、对象操作、解构、展开运算符……这些是日常业务代码里出现频率最高的语法。

## 第一次运行测试

```bash
npm test -- 00/order
```

你会看到一堆红色的 ✖，这是正常的 —— 函数还没写。输出的最后有一段 `failing tests`，列出了每个失败用例的详情：

```
✖ 1. findOrder：找得到
  AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:
  + actual - expected

  + undefined          ← 以 + 开头的是你的函数实际返回的值（actual）
  - {                  ← 以 - 开头的是测试期望的值（expected）
  -   id: 'SO003',
  ...
```

打开 `exercises/00-warmup/01-order-report.js`，实现 `findOrder`，再运行一次，这一条就变成绿色的 ✔ 了。

## 知识点速览

### 最常用的数组方法

| 方法 | 作用 | 返回 |
| --- | --- | --- |
| `map(fn)` | 每个元素转换成新值 | 新数组（长度不变） |
| `filter(fn)` | 保留 fn 返回 true 的元素 | 新数组（长度 ≤ 原数组） |
| `find(fn)` | 找第一个满足条件的元素 | 元素 或 `undefined` |
| `some(fn)` / `every(fn)` | 是否有一个 / 是否全部满足 | 布尔值 |
| `reduce(fn, 初始值)` | 把数组「折叠」成一个值（求和、分组、计数……） | 任意值 |
| `flatMap(fn)` | map 之后拍平一层 | 新数组 |
| `sort(fn)` | 排序 | ⚠️ **修改原数组** |

### 对象操作速查

```js
const { id, nick_name: name, city = '未知' } = user;   // 解构 + 重命名 + 默认值
const merged = { ...defaults, ...options };           // 浅合并，后面的覆盖前面的
const city = user.profile?.city ?? '未知';             // 可选链 + 空值合并
Object.entries({ a: 1 });                              // [['a', 1]]
Object.fromEntries([['a', 1]]);                        // { a: 1 }
```

`??` 和 `||` 的区别：`0 || 10` 是 `10`，`0 ?? 10` 是 `0`。`??` 只在左边是 `null` / `undefined` 时才用右边的值，处理「数量」「金额」这类可能为 0 的字段时要用 `??`。

## 练习

| 文件 | 难度 | 类型 | 内容 |
| --- | --- | --- | --- |
| `01-order-report.js` | ⭐ 必做 | ✍️ 实现 | 订单报表：find / filter / map / reduce / sort |
| `02-user-profile.js` | ⭐ 必做 | ✍️ 实现 | 接口数据转换、配置合并、不可变更新购物车 |
| `03-debug.js` | ⭐ 必做 | 🐞 修 Bug | 浮点数精度、分页差一错误、sort 修改原数组、读取 undefined 的属性 |

卡住时看 [HINTS.md](HINTS.md)，提示分三级，一次只展开一级。

```bash
npm test -- 00
```

## 做题建议

- **一次只写一个函数**，写完马上跑测试。不要一口气写完所有函数再测试。
- 不确定某个方法怎么用时，打开浏览器控制台或者在终端输入 `node` 进入交互模式，直接试一试：`[1, 2, 3].reduce((s, n) => s + n, 0)`。
- 查文档首选 [MDN](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array)。
