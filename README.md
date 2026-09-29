# JavaScript 进阶实战练习

面向「**学过 JS 语法，但写得少、进阶概念一知半解、缺少项目经验**」的开发者。

这里没有长篇大论的教程。每一章都是一组**练习 + 自动化测试**，背景全部取自真实的电商业务：购物车、支付 SDK、库存服务、订单导出、搜索联想……
你的目标只有一个：**让测试从红变绿。**

```
✖ 购物车 Cart > Bug 2：clear 直接作为按钮回调
  TypeError: Cannot set properties of undefined (setting 'items')
                                ↓ 修改代码
✔ 购物车 Cart > Bug 2：clear 直接作为按钮回调
```

## 快速开始

需要 **Node.js 20.11 及以上**（`node -v` 查看）。项目**零依赖**，不需要 `npm install`。

```bash
git clone <本仓库地址>
cd learn-javascript

npm test -- 01               # 运行第 01 章的测试（现在应该全是红的）
# 打开 exercises/01-this/README.md 开始学习
```

## 学习路线

| 章节 | 主题 | 业务场景 | 练习数 | 参考用时 |
| --- | --- | --- | --- | --- |
| [01](exercises/01-this/README.md) | **this 指向** | 购物车模块修 Bug、埋点 SDK | 3 | 2~3 小时 |
| [02](exercises/02-prototype/README.md) | **原型与原型链** | 商品模型继承、后台 Model mixin | 4 | 3~4 小时 |
| [03](exercises/03-closure/README.md) | 闭包与高阶函数 | 搜索防抖、价格缓存、迷你 Redux | 3 | 3~4 小时 |
| [04](exercises/04-promise/README.md) | **Promise** | 老支付 SDK 改造、多接口聚合、超时重试、手写 Promise | 5 | 5~8 小时 |
| [05](exercises/05-async-await/README.md) | async/await 与流程控制 | 运营脚本修 Bug、批量上传并发池、请求去重、竞态处理 | 4 | 4~6 小时 |
| [06](exercises/06-generator/README.md) | **迭代器与生成器** | 订单号生成、日志分析、分页导出、支付轮询、co 原理 | 5 | 4~6 小时 |
| [07](exercises/07-engineering/README.md) | 工程实践 | 事件总线、错误体系、Schema 校验 | 3 | 4~6 小时 |
| [08](exercises/08-capstone/README.md) | 🏗️ **综合项目** | 迷你商城订单服务（下单/支付/取消/查询/通知） | 1 | 8~12 小时 |

> 章节之间有依赖：03 是 04~06 的基础；08 会用到前面所有章节的成果。建议按顺序完成。

### 练习类型

| 图标 | 类型 | 做法 |
| --- | --- | --- |
| 🧠 | 预测输出 | 先**不运行**，读代码写下答案，再用测试核对。答错的题一定要搞懂原因 |
| 🐞 | 修 Bug | 代码能跑但有 Bug。先读测试理解「期望行为」，复现问题，再定位修复 |
| ✍️ | 实现 | 根据注释中的需求说明实现函数/类 |
| 🏆 | 挑战 | 难度较高，可以先跳过，学完后续章节再回来 |

## 做题流程

```
1. 读章节 README            → 了解知识点和业务背景
2. 读练习文件顶部的注释       → 理解需求
3. 读对应的测试文件           → tests/<章节>/<练习>.test.js，看看「验收标准」是什么
4. 写代码，运行测试           → npm test -- 01/cart
5. 全部通过后，对照参考答案    → solutions/<章节>/<练习>.js，看看有没有更好的写法
6. 回答 README 中的「延伸思考」
```

**关于参考答案**：`solutions/` 目录下是参考实现，里面有详细的注释解释「为什么这样写」。建议**独立完成后**再看；卡住超过 30 分钟可以看提示或部分答案，但看完后要合上答案自己重写一遍。

## 常用命令

```bash
npm test                        # 运行所有测试
npm test -- 04                  # 只运行第 04 章
npm test -- 04/retry            # 只运行第 04 章文件名包含 retry 的测试
npm test -- 01 03               # 运行多个章节
npm test -- 04 --solution       # 用参考答案运行（确认测试本身没问题 / 对照行为）
npm run demo                    # 运行综合项目的演示脚本
```

### 调试技巧

- **console.log** 是最快的方式，测试输出会显示在终端里。
- **只跑一个用例**：`node --test --test-name-pattern="Bug 2" tests/01-this/02-cart.test.js`
- **断点调试**：VS Code 中打开测试文件，按 `F5` 选择 Node.js，或在「运行和调试」面板中使用 JavaScript Debug Terminal 执行 `npm test -- 01`，断点就会生效。

## 目录结构

```
.
├── exercises/          ✍️ 你的工作区：练习题（每章一个目录，包含 README）
├── solutions/          📖 参考答案（与 exercises 结构一致）
├── tests/              ✅ 测试用例（不需要修改，但强烈建议阅读）
│   └── _helpers.js        测试工具：根据 --solution 决定加载 exercises 还是 solutions
└── scripts/
    ├── test.js            测试运行脚本
    └── make-quiz.js       维护者工具：从答案生成预测题
```

## 进度清单

复制到你自己的笔记里打勾：

```
- [ ] 01 this：预测题 / 购物车修 Bug / 手写 bind
- [ ] 02 原型：预测题 / ES5 继承 / 手写 new 与 instanceof / mixin
- [ ] 03 闭包：防抖节流 / memoize / 迷你 Redux
- [ ] 04 Promise：事件循环 / promisify / 组合器 / 超时重试 / 🏆 手写 Promise
- [ ] 05 async：修 Bug / 并发控制 / 请求去重 / 竞态处理
- [ ] 06 生成器：预测题 / 订单号与订单簿 / 惰性管道 / 异步生成器 / 🏆 co
- [ ] 07 工程：事件总线 / 错误体系 / 🏆 Schema 校验
- [ ] 08 综合项目：全部测试通过 / 进阶挑战
```

## 学完之后

- 再做一遍：隔两周后，删掉你的实现（`git checkout exercises/`），限时重做。能流畅写出来才是真掌握。
- 读源码：`p-limit`、`p-retry`、`mitt`（事件总线）、`zod`、Redux —— 你已经实现过它们的核心，读起来会很轻松。
- 读书：《你不知道的 JavaScript》（上卷讲 this 与原型，中卷讲异步）、《JavaScript 高级程序设计》。
