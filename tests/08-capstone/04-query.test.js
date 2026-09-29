import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { advancedTest } from '../_helpers.js';
import { setup } from './_setup.js';

async function seed(svc) {
  const u1 = [];
  for (let i = 0; i < 7; i++) {
    u1.push(await svc.createOrder({ userId: 'u1', items: [{ sku: 'SKU3', qty: i + 1 }] }));
  }
  await svc.createOrder({ userId: 'u2', items: [{ sku: 'SKU3', qty: 1 }] });
  await svc.payOrder(u1[0].id); // 1990
  await svc.payOrder(u1[2].id); // 5970
  await svc.cancelOrder(u1[1].id);
  return u1;
}

describe('查询', () => {
  test('getOrder 返回的是拷贝，修改它不影响数据库', async () => {
    const { svc } = setup();
    const order = await svc.createOrder({ userId: 'u1', items: [{ sku: 'SKU3', qty: 1 }] });
    const found = await svc.getOrder(order.id);
    found.status = 'PAID';
    assert.equal((await svc.getOrder(order.id)).status, 'PENDING');
  });

  test('iterateOrders：自动翻页遍历某用户全部订单', async () => {
    const { svc } = setup();
    const created = await seed(svc);
    const ids = [];
    for await (const order of svc.iterateOrders('u1', { pageSize: 3 })) ids.push(order.id);
    assert.deepEqual(
      ids,
      created.map((o) => o.id),
    );
  });

  advancedTest('iterateOrders：惰性加载，提前 break 不再请求后续页', async () => {
    const { svc, db } = setup();
    await seed(svc);
    const before = db.stats.listOrdersCalls;
    let count = 0;
    for await (const _ of svc.iterateOrders('u1', { pageSize: 3 })) {
      if (++count === 2) break;
    }
    assert.equal(db.stats.listOrdersCalls - before, 1);
  });

  test('iterateOrders：没有订单的用户', async () => {
    const { svc } = setup();
    const all = [];
    for await (const o of svc.iterateOrders('nobody')) all.push(o);
    assert.deepEqual(all, []);
  });

  test('getUserStats：统计订单数量、各状态数量、已支付金额', async () => {
    const { svc } = setup();
    await seed(svc);
    assert.deepEqual(await svc.getUserStats('u1'), {
      total: 7,
      byStatus: { PENDING: 4, PAID: 2, CANCELLED: 1 },
      paidAmount: 1990 + 5970,
    });
    assert.deepEqual(await svc.getUserStats('nobody'), {
      total: 0,
      byStatus: { PENDING: 0, PAID: 0, CANCELLED: 0 },
      paidAmount: 0,
    });
  });
});
