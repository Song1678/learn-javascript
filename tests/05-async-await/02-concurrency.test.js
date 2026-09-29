import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { load, sleep, trackConcurrency } from '../_helpers.js';

const { mapLimit, TaskQueue } = await load('05-async-await/02-concurrency.js');

describe('mapLimit：批量上传商品图片', () => {
  test('结果顺序与输入一致', async () => {
    const images = ['a.jpg', 'b.jpg', 'c.jpg', 'd.jpg', 'e.jpg'];
    const urls = await mapLimit(images, 2, async (name, i) => {
      await sleep(Math.random() * 15);
      return `https://oss/${i}/${name}`;
    });
    assert.deepEqual(
      urls,
      images.map((n, i) => `https://oss/${i}/${n}`),
    );
  });

  test('并发数不超过 limit，且能跑满 limit', async () => {
    const { fn, stats } = trackConcurrency(() => sleep(10));
    await mapLimit(Array.from({ length: 10 }), 3, fn);
    assert.equal(stats.max, 3);
    assert.equal(stats.calls, 10);
  });

  test('一个完成立即补一个，而不是整批等待', async () => {
    // 任务耗时：[50, 10, 10, 10, 10]，limit = 2
    // 正确的并发池：约 50ms 完成；「分批」实现：50 + 10 + 10 = 70ms 以上
    const costs = [50, 10, 10, 10, 10];
    const start = Date.now();
    await mapLimit(costs, 2, (ms) => sleep(ms));
    const cost = Date.now() - start;
    assert.ok(cost < 65, `耗时应约为 50ms，实际 ${cost}ms`);
  });

  test('失败时立即 reject，且不再启动新任务', async () => {
    const started = [];
    const start = Date.now();
    await assert.rejects(
      mapLimit([1, 2, 3, 4, 5, 6], 2, async (n) => {
        started.push(n);
        await sleep(n === 2 ? 5 : 30);
        if (n === 2) throw new Error('图片 2 上传失败');
      }),
      /图片 2 上传失败/,
    );
    assert.ok(Date.now() - start < 25, '应在失败时立即 reject');
    await sleep(80);
    assert.deepEqual(started, [1, 2], '失败后不应再启动新任务');
  });

  test('空数组 / limit 大于数量', async () => {
    assert.deepEqual(await mapLimit([], 3, async () => 1), []);
    assert.deepEqual(await mapLimit([1, 2], 10, async (x) => x * 2), [2, 4]);
  });
});

describe('TaskQueue：陆续加入的上传任务', () => {
  test('add 返回任务结果，并发受控', async () => {
    const queue = new TaskQueue({ concurrency: 2 });
    const { fn, stats } = trackConcurrency(async (x) => {
      await sleep(10);
      return x * 10;
    });
    const results = await Promise.all([1, 2, 3, 4, 5].map((x) => queue.add(() => fn(x))));
    assert.deepEqual(results, [10, 20, 30, 40, 50]);
    assert.equal(stats.max, 2);
  });

  test('单个任务失败不影响其它任务', async () => {
    const queue = new TaskQueue({ concurrency: 1 });
    const p1 = queue.add(async () => {
      throw new Error('fail');
    });
    const p2 = queue.add(() => 'ok'); // 同步任务也要支持
    const p3 = queue.add(() => {
      throw new Error('sync fail');
    });
    await assert.rejects(p1, /fail/);
    assert.equal(await p2, 'ok');
    await assert.rejects(p3, /sync fail/);
  });

  test('pending / running 计数', async () => {
    const queue = new TaskQueue({ concurrency: 2 });
    for (let i = 0; i < 5; i++) queue.add(() => sleep(20));
    await sleep(0);
    assert.equal(queue.running, 2);
    assert.equal(queue.pending, 3);
    await queue.onIdle();
    assert.equal(queue.running, 0);
    assert.equal(queue.pending, 0);
  });

  test('onIdle：已空闲时立即 resolve；否则等待全部完成', async () => {
    const queue = new TaskQueue({ concurrency: 2 });
    await queue.onIdle();
    const done = [];
    [30, 10, 20].forEach((ms) => queue.add(() => sleep(ms).then(() => done.push(ms))));
    await queue.onIdle();
    assert.equal(done.length, 3);
  });

  test('pause / resume', async () => {
    const queue = new TaskQueue({ concurrency: 1 });
    const log = [];
    queue.pause();
    queue.add(() => log.push('A'));
    await sleep(10);
    assert.deepEqual(log, [], '暂停时不应启动任务');
    queue.resume();
    await queue.onIdle();
    assert.deepEqual(log, ['A']);
  });

  test('clear 取消排队中的任务', async () => {
    const queue = new TaskQueue({ concurrency: 1 });
    const running = queue.add(() => sleep(10).then(() => 'first'));
    const queued = queue.add(() => 'second');
    queue.clear();
    await assert.rejects(queued, /任务已取消/);
    assert.equal(await running, 'first', '正在运行的任务不受影响');
    await queue.onIdle();
  });
});
