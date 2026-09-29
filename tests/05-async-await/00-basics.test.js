import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { load, sleep, codeOf, trackConcurrency } from '../_helpers.js';

const mod = await load('05-async-await/00-basics.js');
const { getUserDiscount, getNickname, checkout, loadProductPage, sumOrderAmounts } = mod;

const later = (ms, value) => sleep(ms).then(() => value);

test('使用 async/await，不使用 .then / .catch', () => {
  for (const fn of Object.values(mod)) {
    assert.doesNotMatch(codeOf(fn), /\.(then|catch)\(/, `${fn.name} 中使用了 .then/.catch，请改用 await 和 try/catch`);
  }
});

describe('任务 1：getUserDiscount', () => {
  test('先查用户，再查折扣', async () => {
    const api = {
      getUser: (id) => later(5, { id, level: 'gold' }),
      getDiscount: (level) => later(5, level === 'gold' ? 0.8 : 1),
    };
    assert.equal(await getUserDiscount(api, 'u1'), 0.8);
  });
});

describe('任务 2：getNickname', () => {
  test('成功 / 失败', async () => {
    assert.equal(await getNickname({ getUser: async () => ({ name: '小明' }) }, 'u1'), '小明');
    const failing = {
      getUser: async () => {
        await sleep(5);
        throw new Error('未登录');
      },
    };
    assert.equal(await getNickname(failing, 'u1'), '游客');
  });
});

describe('任务 3：checkout', () => {
  test('按顺序执行三步', async () => {
    const calls = [];
    const api = {
      createOrder: async (cart) => {
        calls.push(`createOrder:${cart.id}`);
        return later(5, { id: 'SO1' });
      },
      pay: async (orderId) => {
        calls.push(`pay:${orderId}`);
        return later(5, { transactionId: 'TX1' });
      },
      sendReceipt: async (orderId, tx) => {
        await sleep(5);
        calls.push(`sendReceipt:${orderId}:${tx}`);
      },
    };
    assert.deepEqual(await checkout(api, { id: 'cart1' }), { orderId: 'SO1', transactionId: 'TX1' });
    assert.deepEqual(calls, ['createOrder:cart1', 'pay:SO1', 'sendReceipt:SO1:TX1']);
  });
});

describe('任务 4：loadProductPage', () => {
  test('三个请求并行', async () => {
    const api = {
      getProduct: (id) => later(40, { id, name: '键盘' }),
      getStock: () => later(40, 99),
      getReviews: () => later(40, ['好评']),
    };
    const start = Date.now();
    const page = await loadProductPage(api, 'p1');
    const cost = Date.now() - start;
    assert.deepEqual(page, { product: { id: 'p1', name: '键盘' }, stock: 99, reviews: ['好评'] });
    assert.ok(cost < 100, `三个请求应并行，总耗时约 40ms，实际 ${cost}ms`);
  });
});

describe('任务 5：sumOrderAmounts', () => {
  test('逐个查询并求和', async () => {
    const { fn, stats } = trackConcurrency(async (id) => {
      await sleep(5);
      return { SO1: 100, SO2: 250, SO3: 50 }[id];
    });
    assert.equal(await sumOrderAmounts({ getOrderAmount: fn }, ['SO1', 'SO2', 'SO3']), 400);
    assert.equal(stats.max, 1, '应该一个查完再查下一个');
    assert.equal(await sumOrderAmounts({ getOrderAmount: fn }, []), 0);
  });
});
