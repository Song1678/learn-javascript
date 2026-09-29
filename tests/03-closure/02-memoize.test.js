import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { load, sleep } from '../_helpers.js';

const { memoize } = await load('03-closure/02-memoize.js');

describe('memoize', () => {
  test('相同 key 只计算一次（默认用第一个参数作为 key）', () => {
    let calls = 0;
    const calc = memoize((sku) => {
      calls++;
      return `${sku}-price`;
    });
    assert.equal(calc('A'), 'A-price');
    assert.equal(calc('A'), 'A-price');
    assert.equal(calc('B'), 'B-price');
    assert.equal(calls, 2);
  });

  test('自定义 resolver 处理多个参数', () => {
    let calls = 0;
    const calcVipPrice = memoize(
      (sku, level) => {
        calls++;
        return level === 'gold' ? 80 : 90;
      },
      { resolver: (sku, level) => `${sku}:${level}` },
    );
    assert.equal(calcVipPrice('A', 'gold'), 80);
    assert.equal(calcVipPrice('A', 'silver'), 90);
    assert.equal(calcVipPrice('A', 'gold'), 80);
    assert.equal(calls, 2);
  });

  test('保留 this', () => {
    const service = {
      rate: 0.5,
      calc: memoize(function (price) {
        return price * this.rate;
      }),
    };
    assert.equal(service.calc(100), 50);
  });

  test('ttl 过期后重新计算', async () => {
    let calls = 0;
    const fn = memoize(() => ++calls, { ttl: 30 });
    assert.equal(fn('x'), 1);
    assert.equal(fn('x'), 1);
    await sleep(40);
    assert.equal(fn('x'), 2);
  });

  test('异步：并发调用共享同一个 Promise', async () => {
    let calls = 0;
    const fetchStock = memoize(async (sku) => {
      calls++;
      await sleep(10);
      return 100;
    });
    const [a, b] = await Promise.all([fetchStock('A'), fetchStock('A')]);
    assert.equal(a, 100);
    assert.equal(b, 100);
    assert.equal(calls, 1);
  });

  test('异步：失败的结果不被缓存', async () => {
    let calls = 0;
    const fetchStock = memoize(async () => {
      calls++;
      if (calls === 1) throw new Error('网络错误');
      return 100;
    });
    await assert.rejects(fetchStock('A'), /网络错误/);
    await sleep(0);
    assert.equal(fetchStock.cache.has('A'), false, '失败后应从缓存中移除');
    assert.equal(await fetchStock('A'), 100);
    assert.equal(calls, 2);
  });

  test('maxSize：超出容量淘汰最久未使用的条目（LRU）', () => {
    let calls = 0;
    const fn = memoize((k) => {
      calls++;
      return k;
    }, { maxSize: 2 });
    fn('A');
    fn('B');
    fn('A'); // 访问 A，此时 B 是最久未使用的
    fn('C'); // 超出容量，淘汰 B
    assert.equal(fn.cache.size, 2);
    assert.equal(fn.cache.has('A'), true);
    assert.equal(fn.cache.has('B'), false);
    assert.equal(fn.cache.has('C'), true);
    assert.equal(calls, 3);
  });

  test('cache.delete / cache.clear', () => {
    let calls = 0;
    const fn = memoize(() => ++calls);
    fn('a');
    fn('b');
    fn.cache.delete('a');
    assert.equal(fn('a'), 3);
    fn.cache.clear();
    assert.equal(fn.cache.size, 0);
    assert.equal(fn('b'), 4);
  });

  test('不同 memoize 函数的缓存相互独立', () => {
    const f = memoize(() => 'f');
    const g = memoize(() => 'g');
    assert.equal(f(1), 'f');
    assert.equal(g(1), 'g');
    f.cache.clear();
    assert.equal(g.cache.size, 1);
  });
});
