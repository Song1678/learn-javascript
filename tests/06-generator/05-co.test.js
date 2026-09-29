import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { load, sleep, codeOf, advancedDescribe } from '../_helpers.js';

const { run, checkoutFlow, checkout } = await load('06-generator/05-co.js');

advancedDescribe('run：生成器自动执行器', () => {
  test('等待 yield 的 Promise 并送回结果', async () => {
    const result = await run(function* () {
      const a = yield sleep(5).then(() => 1);
      const b = yield Promise.resolve(2);
      return a + b;
    });
    assert.equal(result, 3);
  });

  test('yield 普通值与 thenable', async () => {
    const result = await run(function* () {
      const a = yield 10;
      const b = yield { then: (r) => r(20) };
      return a + b;
    });
    assert.equal(result, 30);
  });

  test('传递参数与 this', async () => {
    const ctx = { base: 100 };
    const result = await run.call(
      ctx,
      function* (x) {
        return this.base + x;
      },
      5,
    );
    assert.equal(result, 105);
  });

  test('被 reject 的 Promise 以异常形式抛回生成器，可被 try/catch 捕获', async () => {
    const result = await run(function* () {
      try {
        yield Promise.reject(new Error('库存服务异常'));
        return 'unreachable';
      } catch (err) {
        return `已降级：${err.message}`;
      }
    });
    assert.equal(result, '已降级：库存服务异常');
  });

  test('未捕获的错误让返回的 Promise 失败', async () => {
    await assert.rejects(
      run(function* () {
        yield Promise.reject(new Error('uncaught'));
      }),
      /uncaught/,
    );
    await assert.rejects(
      run(function* () {
        yield 1;
        throw new Error('sync throw');
      }),
      /sync throw/,
    );
  });

  test('第一次 next 之前的错误也会被转换（不会同步抛出）', async () => {
    let p;
    assert.doesNotThrow(() => {
      p = run(function* () {
        throw new Error('first');
      });
    });
    await assert.rejects(p, /first/);
  });

  test('执行顺序与 async/await 一致', async () => {
    const log = [];
    const p = run(function* () {
      log.push('start');
      yield sleep(5);
      log.push('after-wait');
    });
    log.push('sync-after-run');
    await p;
    assert.deepEqual(log, ['start', 'sync-after-run', 'after-wait']);
  });
});

advancedDescribe('checkoutFlow：用生成器改写结账流程', () => {
  function createApi({ couponFails = false } = {}) {
    const calls = [];
    return {
      calls,
      async getCart(id) {
        calls.push(`getCart:${id}`);
        await sleep(2);
        return { id, userId: 'u1', total: 300 };
      },
      async getBestCoupon(userId, total) {
        calls.push(`getBestCoupon:${userId}:${total}`);
        await sleep(2);
        if (couponFails) throw new Error('优惠券服务不可用');
        return { id: 'C50', amount: 50 };
      },
      async createOrder(data) {
        calls.push(`createOrder:${JSON.stringify(data)}`);
        await sleep(2);
        return { id: 'SO123', ...data };
      },
    };
  }

  test('是生成器函数，且不使用 async/await', () => {
    assert.equal(checkoutFlow.constructor.name, 'GeneratorFunction');
    assert.doesNotMatch(codeOf(checkoutFlow), /\b(async|await)\b/);
  });

  test('正常流程：使用优惠券下单', async () => {
    const api = createApi();
    assert.equal(await checkout(api, 'cart1'), 'SO123');
    assert.deepEqual(api.calls, [
      'getCart:cart1',
      'getBestCoupon:u1:300',
      'createOrder:{"cartId":"cart1","amount":250,"couponId":"C50"}',
    ]);
  });

  test('优惠券服务异常时降级：原价下单', async () => {
    const api = createApi({ couponFails: true });
    assert.equal(await checkout(api, 'cart2'), 'SO123');
    assert.equal(api.calls[2], 'createOrder:{"cartId":"cart2","amount":300,"couponId":null}');
  });

  test('下单失败时错误向外传播', async () => {
    const api = createApi();
    api.createOrder = async () => {
      throw new Error('下单失败');
    };
    await assert.rejects(checkout(api, 'cart3'), /下单失败/);
  });
});
