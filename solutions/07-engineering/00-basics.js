/**
 * 练习 7-0 参考答案：工程实践入门
 */

export class NotFoundError extends Error {
  constructor(resource, id) {
    super(`${resource} ${id} 不存在`);
    this.name = 'NotFoundError';
    this.status = 404;
  }
}

export function createEmitter() {
  const listeners = {}; // { 事件名: [handler1, handler2] }
  return {
    on(event, handler) {
      (listeners[event] ??= []).push(handler);
    },
    off(event, handler) {
      listeners[event] = (listeners[event] ?? []).filter((h) => h !== handler);
    },
    emit(event, ...args) {
      (listeners[event] ?? []).forEach((handler) => handler(...args));
    },
  };
}

export function validateOrder(body) {
  const errors = [];
  if (typeof body.userId !== 'string' || body.userId === '') {
    errors.push('userId 不能为空');
  }
  if (!Array.isArray(body.items) || body.items.length === 0) {
    errors.push('至少购买一件商品');
  } else {
    body.items.forEach((item, i) => {
      if (!Number.isInteger(item.qty) || item.qty <= 0) {
        errors.push(`第 ${i + 1} 件商品的数量不合法`);
      }
    });
  }
  return errors;
}
