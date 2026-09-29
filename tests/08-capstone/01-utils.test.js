import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { load, sleep, trackConcurrency } from '../_helpers.js';

const { withTimeout, retry, promisify, mapLimit, TimeoutError } = await load('08-capstone/src/utils/async.js');
const { orderNoGenerator, createIdFactory } = await load('08-capstone/src/utils/id.js');

describe('utils/async.js', () => {
  test('withTimeout', async () => {
    assert.equal(await withTimeout(Promise.resolve(1), 50), 1);
    await assert.rejects(withTimeout(sleep(100), 10), TimeoutError);
  });

  test('retry + shouldRetry', async () => {
    let n = 0;
    assert.equal(
      await retry(
        async () => {
          if (++n < 3) throw new Error('x');
          return 'ok';
        },
        { retries: 2 },
      ),
      'ok',
    );
    n = 0;
    await assert.rejects(
      retry(
        async () => {
          n++;
          throw new Error('fatal');
        },
        { retries: 5, shouldRetry: () => false },
      ),
    );
    assert.equal(n, 1);
  });

  test('promisify 透传 this', async () => {
    const obj = {
      v: 42,
      get(cb) {
        setTimeout(() => cb(null, this.v), 1);
      },
    };
    assert.equal(await promisify(obj.get).call(obj), 42);
  });

  test('mapLimit', async () => {
    const { fn, stats } = trackConcurrency(async (x) => {
      await sleep(5);
      return x * 2;
    });
    assert.deepEqual(await mapLimit([1, 2, 3, 4, 5], 2, fn), [2, 4, 6, 8, 10]);
    assert.equal(stats.max, 2);
  });
});

describe('utils/id.js', () => {
  test('订单号格式与递增', () => {
    const now = () => new Date(2026, 8, 29);
    const it = orderNoGenerator({ now });
    assert.equal(it.next().value, 'SO20260929000001');
    assert.equal(it.next().value, 'SO20260929000002');
    const nextId = createIdFactory({ now });
    assert.equal(nextId(), 'SO20260929000001');
    assert.equal(nextId(), 'SO20260929000002');
  });
});
