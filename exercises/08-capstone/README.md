# 第 08 章：综合项目 —— 迷你商城订单服务

前面七章练的是一个个独立的「零件」，这一章要把它们组装成一个**像真实项目一样的服务**。
你会用到：this 与 bind（老 SDK）、类与私有字段、闭包、Promise 组合、async/await、并发控制、超时重试、异步生成器、事件总线、错误体系、依赖注入。

## 项目结构

```
08-capstone/src/
├── index.js                    ✅ 已提供  应用组装（组合根），依赖注入
├── demo.js                     ✅ 已提供  演示脚本：npm run demo
├── errors.js                   ✅ 已提供  错误体系（第 07 章）
├── eventBus.js                 ✅ 已提供  事件总线（第 07 章）
├── infra/                      ✅ 已提供  基础设施（模拟外部系统，不要修改）
│   ├── db.js                     内存数据库（异步、返回拷贝、金额单位为「分」）
│   ├── inventoryClient.js        库存服务客户端（会偶发不可用）
│   └── paymentSdk.js             支付 SDK（回调风格、依赖 this、可能永不回调）
├── utils/                      ✍️ 你来写
│   ├── async.js                  withTimeout / retry / promisify / mapLimit（复用第 04、05 章）
│   └── id.js                     订单号生成器（复用第 06 章）
└── services/                   ✍️ 你来写
    ├── orderService.js           ⭐ 核心：下单、支付、取消、查询
    └── notificationService.js    短信通知、积分
```

**这就是一个典型的分层结构**：`infra` 层封装外部系统，`services` 层写业务逻辑，`index.js` 负责把它们组装起来。
`services` 不直接 `import` 任何 `infra`，而是通过构造函数接收依赖 —— 所以测试可以注入各种「故障」来验证你的代码是否健壮。

## 需求文档（PRD）

### 1. 创建订单 `createOrder({ userId, items })`

| # | 需求 | 错误响应 |
| --- | --- | --- |
| 1.1 | 校验参数，一次性报告**所有**错误 | 400 `VALIDATION_FAILED` |
| 1.2 | [进阶] 同一 SKU 出现多次时合并数量 | |
| 1.3 | 并行查询商品信息 | 404 `NOT_FOUND` |
| 1.4 | [进阶] 预占库存，并发不超过 `reserveConcurrency` | |
| 1.5 | 库存服务返回 `retryable` 错误时，指数退避重试 | 重试耗尽：503 `INVENTORY_UNAVAILABLE` |
| 1.6 | 库存不足时返回 409；[进阶] 任一商品预占失败，**释放所有已成功的预占**（补偿） | 库存不足：409 `CONFLICT` |
| 1.7 | 金额以「分」计算，保存订单，发布 `order.created` | |

> ⚠️ **1.6 是本项目最大的坑（[进阶]）**：如果你直接用 `mapLimit`（失败即停止）预占，第一个失败发生时，其它还在「途中」的预占稍后会成功 —— 但此时已经没人去释放它们了。测试专门构造了这种场景（一个很慢的成功 + 一个很快的失败）。想想怎么保证「所有预占都结束之后」再统一判断和补偿？

### 2. 支付订单 `payOrder(id)`

| # | 需求 | 错误响应 |
| --- | --- | --- |
| 2.1 | 订单必须存在且为 `PENDING` | 404 / 409 |
| 2.2 | [进阶] **防重复支付**：用户连点两次「支付」，只能扣一次钱 | 409 |
| 2.3 | 调用回调风格的支付 SDK（注意 `this`！） | |
| 2.4 | 支付网关可能永不回调 → 超时控制 | 504 `PAYMENT_TIMEOUT` |
| 2.5 | 扣款失败 | 402 `PAYMENT_FAILED` |
| 2.6 | 超时/失败后订单保持 `PENDING`，用户可以再次支付 | |
| 2.7 | 成功后更新状态，`await bus.emitAsync('order.paid', order)` | |

### 3. 取消订单 `cancelOrder(id)`

只有 `PENDING` 且不在支付中的订单可以取消；释放库存；发布 `order.cancelled`。

### 4. 查询

- `getOrder(id)`：不存在时 404。
- `iterateOrders(userId, { pageSize })`：**异步生成器**，自动翻页，惰性加载。
- `getUserStats(userId)`：基于 `iterateOrders` 统计订单数、各状态数量、已支付金额。

### 5. 通知 `registerNotificationHandlers`

- 支付成功：发短信 + 加积分（1 元 = 1 分），两者互不影响。
- 取消：发短信。
- 短信网关偶发失败时重试。

## 闯关路线

这个项目比较大，已经拆成 6 个关卡。**每一关都用 `--basic`（基础模式）完成**，全部通关后再去掉 `--basic` 挑战 `[进阶]` 测试。
卡住时看 [HINTS.md](HINTS.md)。

| 关卡 | 内容 | 需要修改的文件 | 验证命令 | 难度 |
| --- | --- | --- | --- | --- |
| 1 | 工具函数 | `utils/async.js`、`utils/id.js` | `npm test -- 08/utils` | ⭐ |
| 2 | 能下单：校验参数、查询商品、逐个预占库存、保存订单 | `orderService.js`：`getOrder`、`createOrder`、`#validateCreateInput`、`#reserveAll` 的 3.1 | `npm test -- 08/create --basic`（前 6 个通过即可） | ⭐⭐ |
| 3 | 库存预占：重试、库存不足 | `orderService.js`：`#reserveAll` 的 3.2 | `npm test -- 08/create --basic` 全部通过 | ⭐⭐ |
| 4 | 支付与通知 | `constructor` 中的 `#charge`、`payOrder`、`notificationService.js` | `npm test -- 08/pay --basic` 中的支付部分 | ⭐⭐ |
| 5 | 取消订单 | `cancelOrder`、`#releaseAll` | `npm test -- 08/pay --basic` 全部通过 | ⭐⭐ |
| 6 | 查询与统计 | `iterateOrders`、`getUserStats` | `npm test -- 08/query --basic` | ⭐⭐ |
| 🏆 | 进阶：失败补偿、并发控制、防重复支付…… | 各处标记了 `[进阶]` 的部分 | `npm test -- 08` | ⭐⭐⭐ |

> **关卡 1 小贴士**：如果你还没做完第 04、05、06 章，可以直接从 `solutions/08-capstone/src/utils/` 复制这两个文件 —— 本章的重点是业务逻辑，不是工具函数。

每过一关，运行 `npm run demo` 看看你的服务跑起来的样子（还没实现的部分会显示 HTTP 500）。

**遇到测试失败时**：先读测试代码弄清楚它在构造什么场景，再用 `console.log` 或 VS Code 调试器（在测试文件上右键 → Debug）排查。这是真实工作中最重要的能力之一。

## 进阶挑战（没有测试，自己设计）

完成全部测试后，试着像一个真正的工程师一样继续迭代这个项目：

1. **写测试**：在 `tests/08-capstone/` 下新建 `05-my.test.js`，为「订单超时自动取消」写测试，然后实现它（提示：`setTimeout` + 创建订单时注册，支付/取消时清除）。
2. **退款功能**：`refundOrder(id)` —— 只有 `PAID` 可以退款；SDK 需要新增 `refund` 方法；退款成功后扣回积分、归还库存。先写需求表格，再写测试，最后写实现。
3. **用第 07 章的 validator 替换手写校验**：体会声明式校验的好处。
4. **加类型**：在文件顶部加上 `// @ts-check`，用 JSDoc 为 `Order` 定义类型，让 VS Code 帮你检查类型错误。
5. **接入真实 HTTP**：用 Node 内置的 `node:http` 模块，把 `handle` 包装成真正的 REST API（`POST /orders`、`POST /orders/:id/pay`）。
