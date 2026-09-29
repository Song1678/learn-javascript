import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { load, codeOf, advancedTest } from '../_helpers.js';

const { lines, map, filter, limit, chunk, pipe, parseLogLine } = await load('06-generator/03-lazy-pipeline.js');

/** 一个带计数的无限序列，用于验证惰性 */
function counter() {
  const stats = { pulled: 0 };
  function* naturals() {
    let n = 0;
    while (true) {
      stats.pulled++;
      yield n++;
    }
  }
  return { source: naturals(), stats };
}

describe('lines', () => {
  test('逐行产出', () => {
    assert.deepEqual([...lines('a\nb\nc')], ['a', 'b', 'c']);
    assert.deepEqual([...lines('a\nb\n')], ['a', 'b'], '末尾换行不产出空行');
    assert.deepEqual([...lines('')], []);
    assert.deepEqual([...lines('a\n\nb')], ['a', '', 'b'], '中间的空行要保留');
  });

  advancedTest('不使用 split，且是惰性的', () => {
    assert.doesNotMatch(codeOf(lines), /\.split\(/);
    const it = lines('first\nsecond');
    assert.equal(it.next().value, 'first');
  });
});

describe('操作符', () => {
  test('map / filter 带 index', () => {
    assert.deepEqual([...map((x, i) => `${i}:${x}`)(['a', 'b'])], ['0:a', '1:b']);
    assert.deepEqual([...filter((x, i) => i % 2 === 0)(['a', 'b', 'c'])], ['a', 'c']);
  });

  test('limit 取够后不再拉取上游', () => {
    const { source, stats } = counter();
    assert.deepEqual([...limit(3)(source)], [0, 1, 2]);
    assert.equal(stats.pulled, 3);
    assert.deepEqual([...limit(0)([1, 2])], []);
  });

  test('chunk 分批', () => {
    assert.deepEqual([...chunk(2)([1, 2, 3, 4, 5])], [[1, 2], [3, 4], [5]]);
    assert.deepEqual([...chunk(3)([])], []);
  });

  test('操作符返回的函数可以复用', () => {
    const double = map((x) => x * 2);
    assert.deepEqual([...double([1, 2])], [2, 4]);
    assert.deepEqual([...double([3])], [6]);
  });
});

describe('pipe：惰性管道', () => {
  test('按顺序组合操作符', () => {
    const result = pipe(
      [1, 2, 3, 4, 5, 6],
      filter((x) => x % 2 === 0),
      map((x) => x * 10),
    );
    assert.deepEqual([...result], [20, 40, 60]);
  });

  test('没有操作符时返回源', () => {
    const src = [1, 2];
    assert.equal(pipe(src), src);
  });

  test('处理无限序列：只拉取必要的数量', () => {
    const { source, stats } = counter();
    const result = pipe(
      source,
      map((x) => x * x),
      filter((x) => x % 3 === 0),
      limit(4),
    );
    assert.equal(stats.pulled, 0, '组装管道时不应拉取任何数据');
    assert.deepEqual([...result], [0, 9, 36, 81]);
    assert.equal(stats.pulled, 10);
  });

  test('chunk + 无限序列', () => {
    const { source } = counter();
    assert.deepEqual([...pipe(source, chunk(2), limit(2))], [[0, 1], [2, 3]]);
  });

  test('真实场景：从日志中找出前 3 条慢订单请求', () => {
    let parsed = 0;
    const logText = [
      '2026-09-29T10:00:00Z GET /api/product 30ms 200',
      '2026-09-29T10:00:01Z POST /api/order 1500ms 200',
      '2026-09-29T10:00:02Z GET /api/order 200ms 200',
      '2026-09-29T10:00:03Z GET /api/order 2300ms 504',
      '2026-09-29T10:00:04Z GET /api/user 3000ms 200',
      '2026-09-29T10:00:05Z POST /api/order 1001ms 200',
      '2026-09-29T10:00:06Z POST /api/order 5000ms 200',
      ...Array.from({ length: 10000 }, () => '2026-09-29T10:00:07Z GET /api/order 9999ms 200'),
    ].join('\n');

    const slowOrders = pipe(
      lines(logText),
      map((line) => {
        parsed++;
        return parseLogLine(line);
      }),
      filter((log) => log.path === '/api/order' && log.cost > 1000),
      map((log) => `${log.time} ${log.cost}ms`),
      limit(3),
    );

    assert.deepEqual(
      [...slowOrders],
      ['2026-09-29T10:00:01Z 1500ms', '2026-09-29T10:00:03Z 2300ms', '2026-09-29T10:00:05Z 1001ms'],
    );
    assert.equal(parsed, 6, '找到 3 条后应立即停止解析');
  });
});
