import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { load } from '../_helpers.js';
import { setup } from './_setup.js';

const { ValidationError, NotFoundError, ConflictError, AppError } = await load('08-capstone/src/errors.js');

describe('创建订单 createOrder', () => {
  test('正常下单：金额、明细、状态、库存', async () => {
    const { svc, inventory } = setup();
    const order = await svc.createOrder({
      userId: 'u1',
      items: [
        { sku: 'SKU1', qty: 1 },
        { sku: 'SKU3', qty: 2 },
      ],
    });
    assert.match(order.id, /^SO\d{14}$/);
    assert.equal(order.userId, 'u1');
    assert.equal(order.status, 'PENDING');
    assert.equal(order.total, 39900 + 1990 * 2, '金额以「分」为单位');
    assert.deepEqual(
      order.items.map(({ sku, name, price, qty }) => ({ sku, name, price, qty })),
      [
        { sku: 'SKU1', name: '机械键盘', price: 39900, qty: 1 },
        { sku: 'SKU3', name: '鼠标垫', price: 1990, qty: 2 },
      ],
    );
    assert.ok(order.items.every((it) => typeof it.reservationId === 'string'), '每个明细记录预占 ID');
    assert.equal(typeof order.createdAt, 'number');
    assert.equal(await inventory.getStock('SKU1'), 9);
    assert.equal(await inventory.getStock('SKU3'), 98);
  });

  test('订单被持久化，可以查询到', async () => {
    const { svc } = setup();
    const order = await svc.createOrder({ userId: 'u1', items: [{ sku: 'SKU2', qty: 1 }] });
    const found = await svc.getOrder(order.id);
    assert.equal(found.id, order.id);
    assert.equal(found.total, 12900);
  });

  test('订单号唯一', async () => {
    const { svc } = setup();
    const orders = await Promise.all(
      Array.from({ length: 5 }, () => svc.createOrder({ userId: 'u1', items: [{ sku: 'SKU3', qty: 1 }] })),
    );
    assert.equal(new Set(orders.map((o) => o.id)).size, 5);
  });

  test("发布 'order.created' 事件", async () => {
    const { svc, app } = setup();
    const events = [];
    app.bus.on('order.created', (o) => events.push(o.id));
    const order = await svc.createOrder({ userId: 'u1', items: [{ sku: 'SKU3', qty: 1 }] });
    assert.deepEqual(events, [order.id]);
  });

  test('同一 SKU 出现多次时合并数量', async () => {
    const { svc, inventory } = setup();
    const order = await svc.createOrder({
      userId: 'u1',
      items: [
        { sku: 'SKU3', qty: 1 },
        { sku: 'SKU1', qty: 1 },
        { sku: 'SKU3', qty: 2 },
      ],
    });
    assert.deepEqual(
      order.items.map((i) => [i.sku, i.qty]),
      [
        ['SKU3', 3],
        ['SKU1', 1],
      ],
    );
    assert.equal(inventory.stats.reserveCalls, 2);
  });

  test('参数校验：报告所有错误，HTTP 400', async () => {
    const { svc, app, inventory } = setup();
    await assert.rejects(
      svc.createOrder({ userId: '', items: [{ sku: 'SKU1', qty: 0 }, { qty: 1.5 }] }),
      (err) => {
        assert.ok(err instanceof ValidationError);
        const paths = err.details.map((d) => d.path).sort();
        assert.deepEqual(paths, ['items[0].qty', 'items[1].qty', 'items[1].sku', 'userId']);
        return true;
      },
    );
    const res = await app.handle(() => svc.createOrder({ userId: 'u1', items: [] }));
    assert.equal(res.status, 400);
    assert.equal(res.body.code, 'VALIDATION_FAILED');
    const res2 = await app.handle(() => svc.createOrder(undefined));
    assert.equal(res2.status, 400);
    assert.equal(inventory.stats.reserveCalls, 0, '校验失败时不应调用库存服务');
  });

  test('商品不存在：HTTP 404，不调用库存服务', async () => {
    const { svc, app, inventory } = setup();
    await assert.rejects(
      svc.createOrder({ userId: 'u1', items: [{ sku: 'SKU1', qty: 1 }, { sku: 'NOPE', qty: 1 }] }),
      NotFoundError,
    );
    const res = await app.handle(() => svc.createOrder({ userId: 'u1', items: [{ sku: 'NOPE', qty: 1 }] }));
    assert.equal(res.status, 404);
    assert.equal(inventory.stats.reserveCalls, 0);
  });

  test('库存不足：HTTP 409，并释放所有已预占的库存（包括较慢完成的）', async () => {
    // SKU1 预占很慢（40ms），SKU4 很快就返回库存不足
    const { svc, app, inventory } = setup({ latencyBySku: { SKU1: 40 } });
    const res = await app.handle(() =>
      svc.createOrder({
        userId: 'u1',
        items: [
          { sku: 'SKU1', qty: 1 },
          { sku: 'SKU3', qty: 1 },
          { sku: 'SKU4', qty: 99 },
        ],
      }),
    );
    assert.equal(res.status, 409);
    assert.equal(res.body.code, 'CONFLICT');
    assert.deepEqual(res.body.details, { sku: 'SKU4' });
    assert.equal(inventory.activeReservations, 0, '不能有泄漏的预占');
    assert.equal(await inventory.getStock('SKU1'), 10);
    assert.equal(await inventory.getStock('SKU3'), 100);
    assert.equal(await inventory.getStock('SKU4'), 3);
  });

  test('库存服务偶发不可用：自动重试后成功', async () => {
    const { svc, inventory } = setup({ flaky: { SKU2: 2 } });
    const order = await svc.createOrder({ userId: 'u1', items: [{ sku: 'SKU2', qty: 1 }] });
    assert.equal(order.status, 'PENDING');
    assert.equal(inventory.stats.reserveCalls, 3, '失败 2 次 + 成功 1 次');
  });

  test('库存不足不重试', async () => {
    const { svc, inventory } = setup();
    await assert.rejects(svc.createOrder({ userId: 'u1', items: [{ sku: 'SKU4', qty: 4 }] }), ConflictError);
    assert.equal(inventory.stats.reserveCalls, 1);
  });

  test('重试耗尽：HTTP 503 INVENTORY_UNAVAILABLE，保留原始错误，释放已预占库存', async () => {
    const { svc, inventory } = setup({ flaky: { SKU2: 10 } });
    await assert.rejects(
      svc.createOrder({ userId: 'u1', items: [{ sku: 'SKU1', qty: 1 }, { sku: 'SKU2', qty: 1 }] }),
      (err) => {
        assert.ok(err instanceof AppError);
        assert.equal(err.status, 503);
        assert.equal(err.code, 'INVENTORY_UNAVAILABLE');
        assert.equal(err.cause?.code, 'UNAVAILABLE', '应通过 cause 保留库存服务的原始错误');
        return true;
      },
    );
    assert.equal(inventory.stats.reserveCalls, 1 + 3, 'SKU1 一次成功；SKU2 默认 inventoryRetries = 2，共 3 次');
    assert.equal(inventory.activeReservations, 0);
  });

  test('库存预占并发受控（reserveConcurrency）', async () => {
    const { svc, inventory } = setup({ config: { reserveConcurrency: 2 } });
    await svc.createOrder({
      userId: 'u1',
      items: ['SKU1', 'SKU2', 'SKU3', 'SKU4', 'SKU5', 'SKU6'].map((sku) => ({ sku, qty: 1 })),
    });
    assert.equal(inventory.stats.maxConcurrentReserves, 2);
  });
});
