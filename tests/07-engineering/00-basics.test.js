import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { load } from '../_helpers.js';

const { NotFoundError, createEmitter, validateOrder } = await load('07-engineering/00-basics.js');

describe('任务 1：NotFoundError', () => {
  test('属性正确', () => {
    const err = new NotFoundError('订单', 'SO001');
    assert.equal(err.message, '订单 SO001 不存在');
    assert.equal(err.name, 'NotFoundError');
    assert.equal(err.status, 404);
    assert.ok(err instanceof NotFoundError);
    assert.ok(err instanceof Error);
    assert.ok(err.stack, '继承 Error 后自动拥有堆栈信息');
  });

  test('可以被 throw 和 catch', () => {
    assert.throws(() => {
      throw new NotFoundError('商品', 42);
    }, NotFoundError);
  });
});

describe('任务 2：createEmitter', () => {
  test('按顺序调用监听器，并传递参数', () => {
    const emitter = createEmitter();
    const log = [];
    emitter.on('order.paid', (order, extra) => log.push(`sms:${order.id}:${extra}`));
    emitter.on('order.paid', (order) => log.push(`points:${order.id}`));
    emitter.emit('order.paid', { id: 'SO1' }, 'x');
    assert.deepEqual(log, ['sms:SO1:x', 'points:SO1']);
  });

  test('没有监听器时不报错；不同事件互不影响', () => {
    const emitter = createEmitter();
    const log = [];
    emitter.on('a', () => log.push('a'));
    emitter.emit('b');
    assert.deepEqual(log, []);
  });

  test('off 取消订阅', () => {
    const emitter = createEmitter();
    const log = [];
    const handler = () => log.push('x');
    emitter.on('e', handler);
    emitter.emit('e');
    emitter.off('e', handler);
    emitter.emit('e');
    assert.deepEqual(log, ['x']);
  });
});

describe('任务 3：validateOrder', () => {
  test('合法时返回空数组', () => {
    assert.deepEqual(validateOrder({ userId: 'u1', items: [{ sku: 'A', qty: 2 }] }), []);
  });

  test('报告所有错误', () => {
    assert.deepEqual(validateOrder({ userId: '', items: [] }), ['userId 不能为空', '至少购买一件商品']);
    assert.deepEqual(
      validateOrder({ userId: 'u1', items: [{ qty: 1 }, { qty: 0 }, { qty: 1.5 }, { qty: '2' }] }),
      ['第 2 件商品的数量不合法', '第 3 件商品的数量不合法', '第 4 件商品的数量不合法'],
    );
  });

  test('字段缺失', () => {
    assert.deepEqual(validateOrder({}), ['userId 不能为空', '至少购买一件商品']);
  });
});
