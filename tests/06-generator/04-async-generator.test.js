import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { load, sleep } from '../_helpers.js';

const { paginate, batchAsync, exportAllOrders, poll } = await load('06-generator/04-async-generator.js');

/** 模拟游标分页的订单接口：共 total 条，每页 pageSize 条 */
function createOrderApi(total, pageSize) {
  const requested = [];
  async function fetchPage(cursor) {
    requested.push(cursor);
    await sleep(1);
    const start = cursor === null ? 0 : Number(cursor);
    const items = Array.from({ length: Math.min(pageSize, total - start) }, (_, i) => ({ id: start + i + 1 }));
    const next = start + pageSize;
    return { items, nextCursor: next < total ? String(next) : null };
  }
  return { fetchPage, requested };
}

describe('paginate', () => {
  test('逐条产出所有页面的数据', async () => {
    const { fetchPage, requested } = createOrderApi(25, 10);
    const ids = [];
    for await (const order of paginate(fetchPage)) ids.push(order.id);
    assert.deepEqual(
      ids,
      Array.from({ length: 25 }, (_, i) => i + 1),
    );
    assert.deepEqual(requested, [null, '10', '20']);
  });

  test('空结果', async () => {
    const { fetchPage } = createOrderApi(0, 10);
    const all = [];
    for await (const o of paginate(fetchPage)) all.push(o);
    assert.deepEqual(all, []);
  });

  test('惰性：消费完当前页之前不请求下一页', async () => {
    const { fetchPage, requested } = createOrderApi(30, 10);
    const it = paginate(fetchPage);
    assert.equal(requested.length, 0, '创建迭代器时不应发起请求');
    for (let i = 0; i < 10; i++) await it.next();
    assert.equal(requested.length, 1);
    await it.next();
    assert.equal(requested.length, 2);
  });

  test('提前 break 后不再请求', async () => {
    const { fetchPage, requested } = createOrderApi(1000, 10);
    for await (const order of paginate(fetchPage)) {
      if (order.id === 15) break;
    }
    await sleep(10);
    assert.equal(requested.length, 2);
  });
});

describe('batchAsync', () => {
  test('对异步可迭代对象分批', async () => {
    async function* source() {
      for (let i = 1; i <= 5; i++) {
        await sleep(1);
        yield i;
      }
    }
    const batches = [];
    for await (const b of batchAsync(source(), 2)) batches.push(b);
    assert.deepEqual(batches, [[1, 2], [3, 4], [5]]);
  });

  test('也支持同步可迭代对象', async () => {
    const batches = [];
    for await (const b of batchAsync([1, 2, 3], 3)) batches.push(b);
    assert.deepEqual(batches, [[1, 2, 3]]);
  });
});

describe('exportAllOrders', () => {
  function createWriter({ failOnBatch } = {}) {
    const writer = {
      batches: [],
      closed: false,
      async write(batch) {
        await sleep(1);
        if (writer.batches.length === failOnBatch) throw new Error('磁盘已满');
        writer.batches.push(batch.map((o) => o.id));
      },
      async close() {
        writer.closed = true;
      },
    };
    return writer;
  }

  test('边拉边写，按批写入，返回总数并关闭', async () => {
    const { fetchPage } = createOrderApi(23, 10);
    const writer = createWriter();
    const total = await exportAllOrders(fetchPage, writer, { batchSize: 8 });
    assert.equal(total, 23);
    assert.deepEqual(
      writer.batches.map((b) => b.length),
      [8, 8, 7],
    );
    assert.equal(writer.batches.flat().length, 23);
    assert.equal(writer.closed, true);
  });

  test('写入失败时也要关闭 writer，并抛出错误', async () => {
    const { fetchPage } = createOrderApi(50, 10);
    const writer = createWriter({ failOnBatch: 1 });
    await assert.rejects(exportAllOrders(fetchPage, writer, { batchSize: 10 }), /磁盘已满/);
    assert.equal(writer.closed, true);
  });

  test('拉取失败时也要关闭 writer', async () => {
    const writer = createWriter();
    const fetchPage = async (cursor) => {
      if (cursor) throw new Error('接口超时');
      return { items: [{ id: 1 }], nextCursor: 'x' };
    };
    await assert.rejects(exportAllOrders(fetchPage, writer), /接口超时/);
    assert.equal(writer.closed, true);
  });
});

describe('poll：支付状态轮询', () => {
  test('产出每次结果，满足条件后结束', async () => {
    const statuses = ['PENDING', 'PENDING', 'SUCCESS', 'SHOULD_NOT_REACH'];
    let calls = 0;
    const seen = [];
    for await (const s of poll(async () => statuses[calls++], { interval: 5, until: (s) => s !== 'PENDING' })) {
      seen.push(s);
    }
    assert.deepEqual(seen, ['PENDING', 'PENDING', 'SUCCESS']);
    assert.equal(calls, 3);
  });

  test('第一次立即检查，之后按间隔', async () => {
    const times = [];
    const start = Date.now();
    let n = 0;
    for await (const _ of poll(
      async () => {
        times.push(Date.now() - start);
        return ++n;
      },
      { interval: 30, until: (x) => x === 3 },
    )) {
      // consume
    }
    assert.ok(times[0] < 15, '第一次应立即检查');
    assert.ok(times[1] >= 25, '第二次应在间隔后检查');
    assert.ok(times[2] >= 55);
  });

  test('超过最大次数抛出错误', async () => {
    const seen = [];
    await assert.rejects(async () => {
      for await (const s of poll(async () => 'PENDING', { interval: 1, until: () => false, maxAttempts: 3 })) {
        seen.push(s);
      }
    }, /轮询超时/);
    assert.equal(seen.length, 3);
  });

  test('消费方 break 后停止检查', async () => {
    let calls = 0;
    for await (const _ of poll(async () => ++calls, { interval: 5, until: () => false })) {
      if (calls === 2) break;
    }
    await sleep(30);
    assert.equal(calls, 2);
  });
});
