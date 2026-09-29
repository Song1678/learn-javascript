/**
 * 通知服务（参考答案）：订阅订单事件，发送短信、增加积分
 */
import { retry } from '../utils/async.js';

export const formatYuan = (cents) => `¥${(cents / 100).toFixed(2)}`;

export function registerNotificationHandlers({ bus, db, sms, smsRetries = 2 }) {
  const sendSms = (userId, text) => retry(() => sms.send(userId, text), { retries: smsRetries, delay: 5 });

  const unsubscribers = [
    bus.on('order.paid', (order) =>
      sendSms(order.userId, `您的订单 ${order.id} 已支付成功，金额 ${formatYuan(order.total)}`),
    ),
    // 每消费 1 元积 1 分，不足 1 元的部分不计
    bus.on('order.paid', (order) => db.addPoints(order.userId, Math.floor(order.total / 100))),
    bus.on('order.cancelled', (order) => sendSms(order.userId, `您的订单 ${order.id} 已取消`)),
  ];

  return () => unsubscribers.forEach((off) => off());
}
