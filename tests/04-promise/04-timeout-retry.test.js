import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { load } from '../_helpers.js';

const { sleep, withTimeout, retry, TimeoutError } = await load('04-promise/04-timeout-retry.js');

class HttpError extends Error {
  constructor(status) {
    super(`HTTP ${status}`);
    this.status = status;
  }
}

describe('sleep', () => {
  test('等待指定时间', async () => {
    const start = Date.now();
    await sleep(30);
    assert.ok(Date.now() - start >= 25);
  });
});

describe('withTimeout', () => {
  test('按时完成：返回原结果', async () => {
    assert.equal(await withTimeout(sleep(10).then(() => '库存 99'), 50), '库存 99');
  });

  test('按时失败：返回原错误', async () => {
    await assert.rejects(withTimeout(Promise.reject(new HttpError(500)), 50), { status: 500 });
  });

  test('超时：以 TimeoutError 失败', async () => {
    const start = Date.now();
    await assert.rejects(withTimeout(sleep(200), 20, '库存服务超时'), (err) => {
      assert.ok(err instanceof TimeoutError);
      assert.equal(err.name, 'TimeoutError');
      assert.equal(err.message, '库存服务超时');
      return true;
    });
    assert.ok(Date.now() - start < 150, '应在超时时间到达后立即失败');
  });

  test('先完成时清除定时器（不留下挂起的定时器）', async () => {
    const originalSet = globalThis.setTimeout;
    const originalClear = globalThis.clearTimeout;
    const active = new Set();
    globalThis.setTimeout = (fn, ms, ...args) => {
      const id = originalSet(() => {
        active.delete(id);
        fn(...args);
      }, ms);
      active.add(id);
      return id;
    };
    globalThis.clearTimeout = (id) => {
      active.delete(id);
      originalClear(id);
    };
    try {
      await withTimeout(Promise.resolve('fast'), 10_000);
      assert.equal(active.size, 0, '10 秒的超时定时器应该已被清除');
    } finally {
      globalThis.setTimeout = originalSet;
      globalThis.clearTimeout = originalClear;
    }
  });
});

describe('retry', () => {
  test('第一次就成功，不重试', async () => {
    let calls = 0;
    const result = await retry(async () => {
      calls++;
      return 'ok';
    });
    assert.equal(result, 'ok');
    assert.equal(calls, 1);
  });

  test('失败后重试，直到成功；fn 收到当前尝试次数', async () => {
    const attempts = [];
    const result = await retry(
      async (attempt) => {
        attempts.push(attempt);
        if (attempt < 3) throw new HttpError(503);
        return '预占成功';
      },
      { retries: 5 },
    );
    assert.equal(result, '预占成功');
    assert.deepEqual(attempts, [1, 2, 3]);
  });

  test('超过重试次数，以最后一次的错误失败', async () => {
    let calls = 0;
    await assert.rejects(
      retry(
        async () => {
          calls++;
          throw new Error(`第 ${calls} 次失败`);
        },
        { retries: 2 },
      ),
      /第 3 次失败/,
    );
    assert.equal(calls, 3, 'retries: 2 表示总共尝试 3 次');
  });

  test('默认 retries 为 3', async () => {
    let calls = 0;
    await assert.rejects(
      retry(async () => {
        calls++;
        throw new Error('x');
      }),
    );
    assert.equal(calls, 4);
  });

  test('shouldRetry 返回 false 时立即失败', async () => {
    let calls = 0;
    await assert.rejects(
      retry(
        async () => {
          calls++;
          throw new HttpError(calls === 1 ? 503 : 400);
        },
        { retries: 5, shouldRetry: (err) => err.status >= 500 },
      ),
      { status: 400 },
    );
    assert.equal(calls, 2);
  });

  test('指数退避：等待时间为 delay * factor^(n-1)', async () => {
    const times = [];
    await assert.rejects(
      retry(
        async () => {
          times.push(Date.now());
          throw new Error('busy');
        },
        { retries: 3, delay: 20, factor: 2 },
      ),
    );
    const gaps = times.slice(1).map((t, i) => t - times[i]);
    // 期望约为 20, 40, 80
    assert.ok(gaps[0] >= 15 && gaps[0] < 40, `第 1 次重试间隔约 20ms，实际 ${gaps[0]}`);
    assert.ok(gaps[1] >= 35 && gaps[1] < 70, `第 2 次重试间隔约 40ms，实际 ${gaps[1]}`);
    assert.ok(gaps[2] >= 75 && gaps[2] < 130, `第 3 次重试间隔约 80ms，实际 ${gaps[2]}`);
  });

  test('onRetry 在每次重试前被调用', async () => {
    const log = [];
    await retry(
      async (n) => {
        if (n < 3) throw new Error(`e${n}`);
        return 'ok';
      },
      { onRetry: (err, attempt) => log.push(`${attempt}:${err.message}`) },
    );
    assert.deepEqual(log, ['1:e1', '2:e2']);
  });

  test('fn 同步抛错也能被重试', async () => {
    let calls = 0;
    const result = await retry(() => {
      calls++;
      if (calls === 1) throw new Error('sync');
      return 'ok';
    });
    assert.equal(result, 'ok');
  });

  test('与 withTimeout 组合使用', async () => {
    let calls = 0;
    const result = await retry(
      () => {
        calls++;
        // 第一次请求卡住，第二次正常
        const request = calls === 1 ? sleep(500).then(() => 'late') : sleep(5).then(() => 'fast');
        return withTimeout(request, 30);
      },
      { retries: 1, shouldRetry: (err) => err instanceof TimeoutError },
    );
    assert.equal(result, 'fast');
    assert.equal(calls, 2);
  });
});
