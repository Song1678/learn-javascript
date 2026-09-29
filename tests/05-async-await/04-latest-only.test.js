import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { load, sleep } from '../_helpers.js';

const { latestOnly, abortable } = await load('05-async-await/04-latest-only.js');

const isAbortError = (err) => err?.name === 'AbortError';

describe('latestOnly：订单筛选竞态', () => {
  test('慢的旧请求被取代，只有最新请求的结果生效', async () => {
    const fetchOrders = latestOnly(async (status) => {
      await sleep(status === '待付款' ? 60 : 10);
      return `${status}订单列表`;
    });
    const a = fetchOrders('待付款');
    const b = fetchOrders('已完成');
    await assert.rejects(a, isAbortError);
    assert.equal(await b, '已完成订单列表');
  });

  test('被取代的请求收到的 signal 被 abort', async () => {
    const signals = [];
    const fetchOrders = latestOnly(async (status, signal) => {
      signals.push(signal);
      await sleep(10);
      return status;
    });
    const a = fetchOrders('A');
    const b = fetchOrders('B');
    await Promise.allSettled([a, b]);
    assert.ok(signals[0] instanceof AbortSignal);
    assert.equal(signals[0].aborted, true);
    assert.equal(signals[1].aborted, false);
  });

  test('已完成的调用不受后续调用影响', async () => {
    const fn = latestOnly(async (x) => x);
    assert.equal(await fn(1), 1);
    assert.equal(await fn(2), 2);
  });

  test('asyncFn 的错误正常传递', async () => {
    const fn = latestOnly(async () => {
      throw new Error('服务器错误');
    });
    await assert.rejects(fn(), /服务器错误/);
  });

  test('abort() 取消当前请求（组件卸载）', async () => {
    let seenSignal;
    const fn = latestOnly(async (x, signal) => {
      seenSignal = signal;
      await sleep(20);
      return x;
    });
    const p = fn('x');
    fn.abort();
    await assert.rejects(p, isAbortError);
    assert.equal(seenSignal.aborted, true);
  });

  test('配合真实的可取消操作：signal 被 abort 后停止工作', async () => {
    let pagesLoaded = 0;
    const loadAllPages = latestOnly(async (keyword, signal) => {
      for (let page = 1; page <= 5; page++) {
        if (signal.aborted) return 'stopped';
        await sleep(10);
        pagesLoaded++;
      }
      return 'done';
    });
    const first = loadAllPages('手机');
    await sleep(15);
    const second = loadAllPages('耳机');
    await assert.rejects(first, isAbortError);
    assert.equal(await second, 'done');
    assert.ok(pagesLoaded <= 7, `第一次调用应在被取消后停止加载，实际共加载 ${pagesLoaded} 页`);
  });
});

describe('abortable', () => {
  test('未取消时跟随原结果', async () => {
    const c = new AbortController();
    assert.equal(await abortable(sleep(5).then(() => 'ok'), c.signal), 'ok');
    await assert.rejects(abortable(Promise.reject(new Error('x')), c.signal), /x/);
  });

  test('已经取消的 signal 立即失败', async () => {
    const c = new AbortController();
    c.abort();
    await assert.rejects(abortable(sleep(5), c.signal), isAbortError);
  });

  test('中途取消', async () => {
    const c = new AbortController();
    const p = abortable(sleep(50), c.signal);
    setTimeout(() => c.abort(), 5);
    const start = Date.now();
    await assert.rejects(p, isAbortError);
    assert.ok(Date.now() - start < 40);
  });

  test('完成后移除 abort 监听', async () => {
    const c = new AbortController();
    let added = 0;
    let removed = 0;
    const signal = c.signal;
    const origAdd = signal.addEventListener.bind(signal);
    const origRemove = signal.removeEventListener.bind(signal);
    signal.addEventListener = (...a) => {
      added++;
      return origAdd(...a);
    };
    signal.removeEventListener = (...a) => {
      removed++;
      return origRemove(...a);
    };
    await abortable(Promise.resolve(1), signal);
    await abortable(Promise.reject(new Error('e')), signal).catch(() => {});
    await sleep(0);
    assert.equal(added, 2);
    assert.equal(removed, 2);
  });
});
