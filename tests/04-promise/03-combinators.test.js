import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { load, sleep, codeOf, advancedDescribe, advancedTest } from '../_helpers.js';

const { all, allSettled, race, any } = await load('04-promise/03-combinators.js');

const ok = (value, ms) => sleep(ms).then(() => value);
const fail = (message, ms) => sleep(ms).then(() => Promise.reject(new Error(message)));

function* gen(...items) {
  yield* items;
}

test('不使用原生组合器', () => {
  for (const fn of [all, allSettled, race, any]) {
    assert.doesNotMatch(codeOf(fn), /Promise\.(all|allSettled|race|any)\b/, `${fn.name} 中使用了原生组合器`);
  }
});

describe('all：商品详情页核心信息', () => {
  test('结果顺序与输入顺序一致', async () => {
    const result = await all([ok('详情', 30), ok('价格', 10), ok('库存', 20)]);
    assert.deepEqual(result, ['详情', '价格', '库存']);
  });

  test('支持普通值与任意可迭代对象', async () => {
    assert.deepEqual(await all([1, ok(2, 5), Promise.resolve(3)]), [1, 2, 3]);
    assert.deepEqual(await all(new Set([ok('a', 1), 'b'])), ['a', 'b']);
    assert.deepEqual(await all(gen(ok(1, 5), 2)), [1, 2]);
  });

  test('空输入立即 resolve([])', async () => {
    assert.deepEqual(await all([]), []);
  });

  test('任意一个失败，立即失败（不等待其它）', async () => {
    const start = Date.now();
    await assert.rejects(all([ok('详情', 100), fail('库存服务异常', 10)]), /库存服务异常/);
    assert.ok(Date.now() - start < 80, '应在第一个失败时立即 reject');
  });
});

describe('allSettled：首页推荐位', () => {
  test('返回每一项的状态，不会 reject', async () => {
    const result = await allSettled([ok('猜你喜欢', 10), fail('排行榜超时', 5), '新品']);
    assert.deepEqual(result[0], { status: 'fulfilled', value: '猜你喜欢' });
    assert.equal(result[1].status, 'rejected');
    assert.equal(result[1].reason.message, '排行榜超时');
    assert.deepEqual(result[2], { status: 'fulfilled', value: '新品' });
  });

  test('支持生成器 / 空输入', async () => {
    assert.deepEqual(await allSettled(gen()), []);
    assert.equal((await allSettled(gen(1))).length, 1);
  });
});

describe('race：超时控制', () => {
  test('以最先完成者为准（成功）', async () => {
    assert.equal(await race([ok('慢', 30), ok('快', 5)]), '快');
  });

  test('以最先完成者为准（失败）', async () => {
    await assert.rejects(race([ok('请求结果', 50), fail('请求超时', 10)]), /请求超时/);
  });

  test('普通值立即胜出', async () => {
    assert.equal(await race([ok('慢', 10), '缓存值']), '缓存值');
  });

  advancedTest('空输入永远 pending', async () => {
    const result = await Promise.race([race([]).then(() => 'settled'), ok('pending', 20)]);
    assert.equal(result, 'pending');
  });
});

advancedDescribe('any：多 CDN 节点', () => {
  test('返回第一个成功的结果，忽略失败', async () => {
    const result = await any([fail('节点 A 故障', 5), ok('节点 B', 20), ok('节点 C', 30)]);
    assert.equal(result, '节点 B');
  });

  test('全部失败时抛出 AggregateError，errors 按输入顺序', async () => {
    await assert.rejects(any([fail('A', 20), fail('B', 5)]), (err) => {
      assert.ok(err instanceof AggregateError);
      assert.deepEqual(
        err.errors.map((e) => e.message),
        ['A', 'B'],
      );
      return true;
    });
  });

  test('空输入立即以 AggregateError 失败', async () => {
    await assert.rejects(any([]), AggregateError);
  });
});
