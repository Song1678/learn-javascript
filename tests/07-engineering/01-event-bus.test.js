import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { load, sleep } from '../_helpers.js';

const { EventBus } = await load('07-engineering/01-event-bus.js');

const silent = () => new EventBus({ onError: () => {} });

describe('EventBus：订阅与发布', () => {
  test('按订阅顺序调用，参数透传，返回是否有监听器', () => {
    const bus = silent();
    const log = [];
    bus.on('order.paid', (order, extra) => log.push(`sms:${order.id}:${extra}`));
    bus.on('order.paid', (order) => log.push(`points:${order.id}`));
    assert.equal(bus.emit('order.paid', { id: 1 }, 'x'), true);
    assert.equal(bus.emit('order.unknown'), false);
    assert.deepEqual(log, ['sms:1:x', 'points:1']);
  });

  test('监听器的 this 是 bus', () => {
    const bus = silent();
    let seen;
    bus.on('e', function () {
      seen = this;
    });
    bus.emit('e');
    assert.equal(seen, bus);
  });

  test('同一 handler 重复订阅只算一次', () => {
    const bus = silent();
    let n = 0;
    const h = () => n++;
    bus.on('e', h);
    bus.on('e', h);
    bus.emit('e');
    assert.equal(n, 1);
    assert.equal(bus.listenerCount('e'), 1);
  });

  test('on 返回取消订阅函数；off 按 handler 或全部取消', () => {
    const bus = silent();
    const log = [];
    const a = () => log.push('a');
    const b = () => log.push('b');
    const c = () => log.push('c');
    const unA = bus.on('e', a);
    bus.on('e', b);
    bus.on('e', c);
    unA();
    bus.off('e', b);
    bus.emit('e');
    bus.off('e');
    bus.emit('e');
    assert.deepEqual(log, ['c']);
    assert.equal(bus.listenerCount('e'), 0);
  });

  test('once 只触发一次，可以用原 handler 通过 off 取消', () => {
    const bus = silent();
    let n = 0;
    bus.once('e', () => n++);
    bus.emit('e');
    bus.emit('e');
    assert.equal(n, 1);
    assert.equal(bus.listenerCount('e'), 0);

    const h = () => n++;
    bus.once('e', h);
    bus.off('e', h);
    bus.emit('e');
    assert.equal(n, 1);

    const un = bus.once('e', () => n++);
    un();
    bus.emit('e');
    assert.equal(n, 1);
  });

  test('once 监听器内部再次 emit 同一事件，不会重复触发', () => {
    const bus = silent();
    let n = 0;
    bus.once('e', () => {
      n++;
      bus.emit('e');
    });
    bus.emit('e');
    assert.equal(n, 1);
  });

  test('emit 过程中增删订阅不影响本次 emit', () => {
    const bus = silent();
    const log = [];
    const b = () => log.push('b');
    bus.on('e', () => {
      log.push('a');
      bus.off('e', b);
      bus.on('e', () => log.push('new'));
    });
    bus.on('e', b);
    bus.emit('e');
    assert.deepEqual(log, ['a', 'b']);
  });
});

describe('EventBus：错误隔离', () => {
  test('一个监听器出错不影响其它监听器，错误交给 onError', () => {
    const errors = [];
    const bus = new EventBus({ onError: (err, ctx) => errors.push({ msg: err.message, ...ctx }) });
    const log = [];
    const smsHandler = () => {
      throw new Error('短信服务不可用');
    };
    bus.on('order.paid', smsHandler);
    bus.on('order.paid', () => log.push('通知仓库发货'));
    assert.doesNotThrow(() => bus.emit('order.paid', {}));
    assert.deepEqual(log, ['通知仓库发货']);
    assert.equal(errors.length, 1);
    assert.equal(errors[0].msg, '短信服务不可用');
    assert.equal(errors[0].event, 'order.paid');
    assert.equal(errors[0].handler, smsHandler);
  });

  test('未配置 onError 时使用 console.error', (t) => {
    const spy = t.mock.method(console, 'error', () => {});
    const bus = new EventBus();
    bus.on('e', () => {
      throw new Error('x');
    });
    bus.emit('e');
    assert.equal(spy.mock.callCount(), 1);
  });
});

describe('EventBus：通配符', () => {
  test("'*' 收到所有事件，参数为 (event, ...args)，在普通监听器之后调用", () => {
    const bus = silent();
    const log = [];
    bus.on('*', (event, payload) => log.push(`*:${event}:${payload}`));
    bus.on('order.paid', (p) => log.push(`paid:${p}`));
    assert.equal(bus.emit('order.created', 1), true, "只有 '*' 监听器时也算有监听器");
    bus.emit('order.paid', 2);
    assert.deepEqual(log, ['*:order.created:1', 'paid:2', '*:order.paid:2']);
    assert.equal(bus.listenerCount('order.paid'), 1);
  });
});

describe('EventBus：emitAsync', () => {
  test('并发执行所有监听器，等待全部完成，统计成败', async () => {
    const errors = [];
    const bus = new EventBus({ onError: (err) => errors.push(err.message) });
    const log = [];
    bus.on('order.paid', async () => {
      await sleep(30);
      log.push('slow');
    });
    bus.on('order.paid', async () => {
      await sleep(30);
      throw new Error('积分服务超时');
    });
    bus.on('order.paid', () => log.push('sync'));
    bus.on('*', async () => {
      await sleep(30);
      log.push('analytics');
    });
    const start = Date.now();
    const result = await bus.emitAsync('order.paid', {});
    assert.ok(Date.now() - start < 80, '监听器应并发执行');
    assert.deepEqual(result, { ok: 3, failed: 1 });
    assert.deepEqual(log.sort(), ['analytics', 'slow', 'sync']);
    assert.deepEqual(errors, ['积分服务超时']);
  });

  test('同步抛错的监听器也计为失败', async () => {
    const bus = silent();
    bus.on('e', () => {
      throw new Error('x');
    });
    assert.deepEqual(await bus.emitAsync('e'), { ok: 0, failed: 1 });
  });
});
