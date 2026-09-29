import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { load, sleep } from '../_helpers.js';

const { promisify, promisifyAll, callbackify } = await load('04-promise/02-promisify.js');

/** 模拟老支付 SDK：错误优先回调、内部依赖 this */
class LegacyPaySdk {
  constructor(merchantId) {
    this.merchantId = merchantId;
    this.version = '1.0.3';
  }
  createPayment(orderId, amount, cb) {
    setTimeout(() => {
      if (amount <= 0) return cb(new Error('金额必须大于 0'));
      cb(null, { id: `PAY-${orderId}`, merchantId: this.merchantId, amount });
    }, 5);
  }
  queryStatus(paymentId, cb) {
    setTimeout(() => cb(null, paymentId.startsWith('PAY-') ? 'SUCCESS' : 'NOT_FOUND'), 5);
  }
}

describe('promisify', () => {
  test('成功时 resolve 结果', async () => {
    const sdk = new LegacyPaySdk('M001');
    const create = promisify(sdk.createPayment);
    const payment = await create.call(sdk, 'SO1', 100);
    assert.deepEqual(payment, { id: 'PAY-SO1', merchantId: 'M001', amount: 100 });
  });

  test('失败时 reject 错误', async () => {
    const sdk = new LegacyPaySdk('M001');
    const create = promisify(sdk.createPayment);
    await assert.rejects(create.call(sdk, 'SO1', 0), /金额必须大于 0/);
  });

  test('透传 this（作为对象方法调用）', async () => {
    const sdk = new LegacyPaySdk('M002');
    sdk.createPaymentAsync = promisify(sdk.createPayment);
    const payment = await sdk.createPaymentAsync('SO2', 50);
    assert.equal(payment.merchantId, 'M002');
  });

  test('原函数同步抛错时返回 rejected Promise', async () => {
    const broken = promisify(() => {
      throw new Error('SDK 未初始化');
    });
    let result;
    assert.doesNotThrow(() => {
      result = broken();
    });
    await assert.rejects(result, /SDK 未初始化/);
  });

  test('回调被多次调用时，只有第一次有效', async () => {
    const flaky = promisify((cb) => {
      cb(null, 'first');
      cb(new Error('second'));
      cb(null, 'third');
    });
    assert.equal(await flaky(), 'first');
  });

  test('err 为 null / undefined 都视为成功', async () => {
    assert.equal(await promisify((cb) => cb(undefined, 1))(), 1);
    assert.equal(await promisify((cb) => cb(null, 2))(), 2);
  });
});

describe('promisifyAll', () => {
  test('为原型链上的方法生成 Async 版本', async () => {
    const sdk = promisifyAll(new LegacyPaySdk('M003'));
    const payment = await sdk.createPaymentAsync('SO3', 10);
    assert.equal(payment.merchantId, 'M003');
    assert.equal(await sdk.queryStatusAsync(payment.id), 'SUCCESS');
  });

  test('新对象可访问原对象的属性与原方法', () => {
    const raw = new LegacyPaySdk('M004');
    const sdk = promisifyAll(raw);
    assert.equal(sdk.version, '1.0.3');
    assert.equal(typeof sdk.createPayment, 'function');
  });

  test('不修改原对象，不处理 Object.prototype 上的方法', () => {
    const raw = new LegacyPaySdk('M005');
    const sdk = promisifyAll(raw);
    assert.equal(raw.createPaymentAsync, undefined);
    assert.equal(Object.getPrototypeOf(LegacyPaySdk.prototype).createPaymentAsync, undefined);
    assert.equal(sdk.toStringAsync, undefined);
    assert.equal(sdk.hasOwnPropertyAsync, undefined);
    assert.equal(sdk.constructorAsync, undefined);
  });

  test('普通对象字面量同样适用', async () => {
    const legacyGeo = {
      city: '杭州',
      locate(cb) {
        setTimeout(() => cb(null, this.city), 1);
      },
    };
    assert.equal(await promisifyAll(legacyGeo).locateAsync(), '杭州');
  });
});

describe('callbackify', () => {
  test('成功：callback(null, result)', (t, done) => {
    const getUser = callbackify(async (id) => ({ id, name: 'Tom' }));
    getUser(1, (err, user) => {
      assert.equal(err, null);
      assert.deepEqual(user, { id: 1, name: 'Tom' });
      done();
    });
  });

  test('失败：callback(err)', (t, done) => {
    const getUser = callbackify(async () => {
      throw new Error('not found');
    });
    getUser(1, (err) => {
      assert.equal(err.message, 'not found');
      done();
    });
  });

  test('透传 this', (t, done) => {
    const repo = {
      table: 'users',
      find: callbackify(async function () {
        return this.table;
      }),
    };
    repo.find((err, table) => {
      assert.equal(table, 'users');
      done();
    });
  });

  test('callback 自身抛错时，不会被再次调用', async () => {
    let calls = 0;
    const fn = callbackify(async () => 'ok');
    const originalListeners = process.listeners('unhandledRejection');
    process.removeAllListeners('unhandledRejection');
    const unhandled = [];
    process.on('unhandledRejection', (e) => unhandled.push(e));
    try {
      fn(() => {
        calls++;
        throw new Error('callback 内部出错');
      });
      await sleep(20);
    } finally {
      process.removeAllListeners('unhandledRejection');
      originalListeners.forEach((l) => process.on('unhandledRejection', l));
    }
    assert.equal(calls, 1);
  });
});
