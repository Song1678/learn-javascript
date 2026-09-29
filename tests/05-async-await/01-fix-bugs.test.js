import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { load, sleep, trackConcurrency } from '../_helpers.js';

const { sendCoupons, loadDashboard, getUserName, deductInOrder, filterInStock } = await load(
  '05-async-await/01-fix-bugs.js',
);

describe('Bug 1：批量发券', () => {
  test('等待全部发放完成，并正确统计成功数', async () => {
    const sent = [];
    const api = {
      async sendCoupon(id) {
        await sleep(10);
        sent.push(id);
        return id !== 'u3'; // u3 发放失败
      },
    };
    const count = await sendCoupons(['u1', 'u2', 'u3', 'u4'], api);
    assert.equal(sent.length, 4, '返回时应已全部发放');
    assert.equal(count, 3);
  });

  test('各用户并行发放', async () => {
    const { fn, stats } = trackConcurrency(async () => {
      await sleep(10);
      return true;
    });
    await sendCoupons(['a', 'b', 'c'], { sendCoupon: fn });
    assert.equal(stats.max, 3);
  });
});

describe('Bug 2：数据看板', () => {
  test('三个接口并行请求', async () => {
    const slow = (v) => async () => {
      await sleep(50);
      return v;
    };
    const api = { getSales: slow(1000), getVisitors: slow(300), getOrders: slow(42) };
    const start = Date.now();
    const data = await loadDashboard(api);
    const cost = Date.now() - start;
    assert.deepEqual(data, { sales: 1000, visitors: 300, orders: 42 });
    assert.ok(cost < 120, `应并行请求，总耗时约 50ms，实际 ${cost}ms`);
  });
});

describe('Bug 3：用户名展示', () => {
  test('正常返回用户名', async () => {
    const api = { getUser: async () => ({ name: '张三' }) };
    assert.equal(await getUserName(1, api), '张三');
  });

  test('接口失败时返回「匿名用户」', async () => {
    const api = {
      async getUser() {
        await sleep(5);
        throw new Error('用户不存在');
      },
    };
    assert.equal(await getUserName(999, api), '匿名用户');
  });
});

describe('Bug 4：批量扣库存', () => {
  test('严格串行，顺序一致', async () => {
    const log = [];
    const { fn, stats } = trackConcurrency(async (order) => {
      log.push(`start:${order.id}`);
      await sleep(order.cost);
      log.push(`end:${order.id}`);
      return `${order.id}-ok`;
    });
    const orders = [
      { id: 'A', cost: 20 },
      { id: 'B', cost: 5 },
      { id: 'C', cost: 10 },
    ];
    const results = await deductInOrder(orders, { deduct: fn });
    assert.deepEqual(results, ['A-ok', 'B-ok', 'C-ok']);
    assert.equal(stats.max, 1, '同一时刻只能有一个扣减请求');
    assert.deepEqual(log, ['start:A', 'end:A', 'start:B', 'end:B', 'start:C', 'end:C']);
  });

  test('中途失败则停止，后续订单不再扣减', async () => {
    const called = [];
    const api = {
      async deduct(order) {
        called.push(order.id);
        if (order.id === 'B') throw new Error('库存不足');
        return 'ok';
      },
    };
    await assert.rejects(deductInOrder([{ id: 'A' }, { id: 'B' }, { id: 'C' }], api), /库存不足/);
    assert.deepEqual(called, ['A', 'B']);
  });
});

describe('Bug 5：筛选有货商品', () => {
  test('只返回有货的 SKU，保持顺序', async () => {
    const stock = { S1: true, S2: false, S3: true, S4: false };
    const api = {
      async inStock(sku) {
        await sleep(Math.random() * 10);
        return stock[sku];
      },
    };
    assert.deepEqual(await filterInStock(['S1', 'S2', 'S3', 'S4'], api), ['S1', 'S3']);
  });
});
