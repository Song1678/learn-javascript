/**
 * 应用组装（已提供，无需修改）
 *
 * 这里是「组合根」（composition root）：创建所有对象，并把依赖注入进去。
 * 业务代码（services/）只依赖抽象的接口，不知道也不关心 db、inventory 的具体实现是什么，
 * 所以测试时可以轻松换成可控的假实现。
 */
import { EventBus } from './eventBus.js';
import { toHttpResponse } from './errors.js';
import { createIdFactory } from './utils/id.js';
import { OrderService } from './services/orderService.js';
import { registerNotificationHandlers } from './services/notificationService.js';

export function createApp({ db, inventory, payment, sms, config, logger = console, now } = {}) {
  const bus = new EventBus({
    onError: (err, { event }) => logger.error(`[event:${event}] ${err.message}`),
  });

  const orderService = new OrderService({
    db,
    inventory,
    payment,
    bus,
    config,
    nextId: createIdFactory({ now }),
  });

  const unregister = registerNotificationHandlers({ bus, db, sms });

  /**
   * 模拟一个 HTTP 接口处理器：调用业务函数，把结果或错误转换成 HTTP 响应
   *   await app.handle(() => orderService.createOrder(body))
   *   // => { status: 200, body: order } 或 { status: 409, body: { code, message, details } }
   */
  async function handle(fn) {
    try {
      return { status: 200, body: await fn() };
    } catch (err) {
      const res = toHttpResponse(err);
      if (res.status >= 500) logger.error(err);
      return res;
    }
  }

  return { bus, orderService, handle, close: unregister };
}
