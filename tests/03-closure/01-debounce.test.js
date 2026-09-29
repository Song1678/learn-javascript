import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { load, sleep, advancedDescribe, advancedTest } from '../_helpers.js';

const { debounce, throttle } = await load('03-closure/01-debounce.js');

describe('debounce', () => {
  test('停止调用 wait 毫秒后只执行一次，参数为最后一次', async () => {
    const calls = [];
    const search = debounce((kw) => calls.push(kw), 30);
    for (const kw of ['手', '手机', '手机壳']) {
      search(kw);
      await sleep(5);
    }
    assert.deepEqual(calls, []);
    await sleep(50);
    assert.deepEqual(calls, ['手机壳']);
  });

  test('每次调用都会重新计时', async () => {
    let count = 0;
    const fn = debounce(() => count++, 30);
    fn();
    await sleep(20);
    fn();
    await sleep(20);
    assert.equal(count, 0, '第二次调用应重新计时');
    await sleep(30);
    assert.equal(count, 1);
  });

  test('保留调用时的 this', async () => {
    let seenThis;
    const input = { value: 'abc' };
    input.onInput = debounce(function () {
      seenThis = this;
    }, 10);
    input.onInput();
    await sleep(30);
    assert.equal(seenThis, input);
  });

  test('cancel 取消等待中的调用', async () => {
    let count = 0;
    const fn = debounce(() => count++, 10);
    fn();
    fn.cancel();
    await sleep(30);
    assert.equal(count, 0);
    fn();
    await sleep(30);
    assert.equal(count, 1, 'cancel 后仍可继续使用');
  });

  advancedTest('flush 立即执行并返回结果', async () => {
    let count = 0;
    const fn = debounce((x) => {
      count++;
      return x * 2;
    }, 50);
    assert.equal(fn.flush(), undefined, '没有等待中的调用时返回 undefined');
    fn(21);
    assert.equal(fn.flush(), 42);
    assert.equal(count, 1);
    await sleep(70);
    assert.equal(count, 1, 'flush 之后原定时器不应再次执行');
  });

  test('多个防抖函数互不影响', async () => {
    const calls = [];
    const a = debounce(() => calls.push('a'), 10);
    const b = debounce(() => calls.push('b'), 10);
    a();
    b();
    await sleep(30);
    assert.deepEqual(calls.sort(), ['a', 'b']);
  });
});

advancedDescribe('throttle（附加题）', () => {
  test('首次立即执行，窗口期内的调用合并为结尾的一次', async () => {
    const calls = [];
    const onScroll = throttle((y) => calls.push(y), 40);
    onScroll(1);
    assert.deepEqual(calls, [1], '首次调用应立即执行');
    onScroll(2);
    onScroll(3);
    assert.deepEqual(calls, [1]);
    await sleep(60);
    assert.deepEqual(calls, [1, 3], '窗口结束时用最后一次参数补执行');
  });

  test('窗口期内无调用则不补执行', async () => {
    let count = 0;
    const fn = throttle(() => count++, 20);
    fn();
    await sleep(80);
    assert.equal(count, 1);
    fn();
    assert.equal(count, 2, '窗口期结束后再次调用应立即执行');
  });

  test('持续调用时执行频率受控', async () => {
    let count = 0;
    const fn = throttle(() => count++, 30);
    const start = Date.now();
    while (Date.now() - start < 100) {
      fn();
      await sleep(5);
    }
    await sleep(50);
    assert.ok(count >= 3 && count <= 6, `100ms 内每 30ms 最多一次，实际执行 ${count} 次`);
  });

  test('保留 this，支持 cancel', async () => {
    const seen = [];
    const obj = {
      name: 'page',
      onScroll: throttle(function () {
        seen.push(this.name);
      }, 20),
    };
    obj.onScroll();
    obj.onScroll();
    obj.onScroll.cancel();
    await sleep(40);
    assert.deepEqual(seen, ['page']);
  });
});
