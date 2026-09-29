# 第 07 章：工程实践 —— 可维护代码的基本功

前面六章练的是「语言特性」，这一章练「如何把代码组织得像一个真实项目」。三个练习都是几乎每个后端/前端项目都会有的基础设施。

## 知识点速览

### 1. 解耦：发布-订阅

```
❌ 紧耦合                                ✅ 事件驱动
payOrder() {                              payOrder() {
  ...                                       ...
  smsService.send(...)                      bus.emit('order.paid', order)
  pointsService.add(...)                  }
  warehouse.notify(...)                   // 各模块自己订阅，订单模块对它们一无所知
  analytics.track(...)                    smsModule:       bus.on('order.paid', ...)
}                                         pointsModule:    bus.on('order.paid', ...)
```

代价：调用链不再直观，调试更难。所以事件总线必须做好**错误隔离**和**日志**。

### 2. 错误是 API 的一部分

- **永远 throw `Error` 实例**，不要 throw 字符串（没有堆栈）。
- 用 **错误类型/错误码** 区分错误，而不是匹配 message 字符串。
- 包装错误时用 **`cause`** 保留根因：`throw new AppError('创建订单失败', { cause: err })`。
- **对外隐藏内部细节**：未知错误统一返回「服务器内部错误」，详细信息只写日志。

### 3. 在系统边界校验输入

「不信任任何外部输入」：HTTP 请求体、第三方接口返回、用户上传的文件。
在入口处用 schema 一次性校验并「清洗」数据，内部代码就可以放心使用，不用到处写防御性判断。

### 4. 依赖注入让代码可测试

注意本项目所有练习的写法：`sendCoupons(userIds, api)`、`createApp({ db, inventory })` —— 依赖从参数传入，而不是在模块内部 `import` 真实的服务。测试时传入假的实现，就能精确地控制各种边界情况（超时、失败、并发）。

## 练习

| 文件 | 类型 | 内容 |
| --- | --- | --- |
| `01-event-bus.js` | ✍️ 实现 | 订单事件总线：错误隔离、once、通配符、异步 emit |
| `02-errors.js` | ✍️ 实现 | 业务错误体系：`AppError` 及其子类、HTTP 响应转换 |
| `03-validator.js` | 🏆 挑战 | 迷你 zod：链式调用、不可变、嵌套校验、错误路径 |

```bash
npm test -- 07
```

## 做题建议

- `01-event-bus.js`：用 `#私有字段` 存储监听器，只暴露公开方法。
- `03-validator.js` 是整个项目中综合性最强的练习之一，同时考察 this、原型（`_clone`）、继承、闭包、递归。建议先只实现 `v.string()` 与 `parse`，让第一组测试通过，再逐步扩展。
- 做完之后，读一读 [zod](https://github.com/colinhacks/zod) 的 README，看看它还提供了哪些你没实现的功能（`transform`、`union`、类型推导……）。
