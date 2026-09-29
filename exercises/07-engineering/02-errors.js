/**
 * 练习 7-2：设计业务错误体系  ⭐⭐
 *
 * 卡住时看同目录的 HINTS.md；[进阶] 要求可以第二遍再做（--basic 模式会跳过对应测试）。
 *
 * 【业务背景】
 * 后端 API 项目里，错误处理一团糟：
 *   - 有人 throw '订单不存在'（字符串，没有堆栈）
 *   - 有人 throw new Error('参数错误')，Controller 层只能靠 message 字符串匹配来决定返回 400 还是 404
 *   - 数据库报错时，原始 SQL 错误信息直接返回给了前端（安全隐患！）
 *   - 包装错误时丢失了原始错误，排查问题时找不到根因
 *
 * 【任务】设计一套错误类，统一由全局错误处理中间件转换成 HTTP 响应。
 *
 *   class AppError extends Error
 *     constructor(message, { code = 'INTERNAL_ERROR', status = 500, details, cause } = {})
 *       - name：等于「实际被 new 的类」的名字（子类不需要各自设置 name）
 *         提示：new.target 或 this.constructor
 *       - code / status / details 保存为实例属性
 *       - cause：保留原始错误（ES2022 Error 构造函数原生支持 { cause } 参数）
 *     toJSON() => { name, code, message, details }（便于写日志）
 *
 *   class ValidationError extends AppError    status 400，code 'VALIDATION_FAILED'
 *     constructor(message, details)
 *   class NotFoundError extends AppError      status 404，code 'NOT_FOUND'
 *     constructor(resource, id)  message 为 `${resource} ${id} 不存在`，details 为 { resource, id }
 *   class ConflictError extends AppError      status 409，code 'CONFLICT'
 *     constructor(message, details)
 *
 *   子类的所有实例都要满足 instanceof AppError、instanceof Error，并且有 stack。
 */

export class AppError extends Error {
  // TODO
}

export class ValidationError extends AppError {
  // TODO
}

export class NotFoundError extends AppError {
  // TODO
}

export class ConflictError extends AppError {
  // TODO
}

/**
 * 全局错误处理：把任意错误转换为 HTTP 响应 { status, body: { code, message, details } }
 *   - AppError：使用它自身的 status / code / message / details
 *   - 其它任何错误（包括非 Error 类型的 throw，如字符串）：
 *       status 500，code 'INTERNAL_ERROR'，message 固定为 '服务器内部错误'（不能泄露原始信息），details 为 undefined
 */
export function toHttpResponse(err) {
  // TODO
  throw new Error('TODO: 实现 toHttpResponse');
}

/**
 * 小工具：value 为 null / undefined 时抛出 NotFoundError(resource, id)，否则原样返回 value
 *   const order = assertFound(await db.findOrder(id), '订单', id);
 */
export function assertFound(value, resource, id) {
  // TODO
  throw new Error('TODO: 实现 assertFound');
}
