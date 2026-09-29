/**
 * 通知服务：订阅订单事件，发送短信、增加积分
 *
 * 需求：
 *   1. 订单支付成功（'order.paid'）→ 给用户发短信：
 *        `您的订单 ${order.id} 已支付成功，金额 ¥418.90`   （order.total 单位是分，展示时转为元，保留两位小数）
 *   2. 订单支付成功（'order.paid'）→ 增加积分：每消费 1 元积 1 分，不足 1 元的部分不计
 *        db.addPoints(userId, points)
 *   3. 订单取消（'order.cancelled'）→ 发短信：`您的订单 ${order.id} 已取消`
 *
 *   - 短信和积分必须是「两个独立的监听器」：短信失败不能影响积分（EventBus 已经做了错误隔离）
 *   - 短信网关偶尔抖动：发送失败时重试 smsRetries 次（可以使用 utils/async.js 中的 retry，间隔几毫秒即可）
 *   - 监听器要 return 它的 Promise，这样 bus.emitAsync 才能等待它完成、捕获它的错误
 *   - sms.send(userId, text) 返回 Promise
 *
 * @returns {() => void} 取消所有订阅的函数
 */
import { retry } from '../utils/async.js';

export function registerNotificationHandlers({ bus, db, sms, smsRetries = 2 }) {
  // TODO
  return () => {};
}
