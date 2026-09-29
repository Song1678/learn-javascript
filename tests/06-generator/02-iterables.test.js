import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { load, advancedTest } from '../_helpers.js';

const { take, createOrderNoGenerator, OrderBook } = await load('06-generator/02-iterables.js');

describe('take', () => {
  test('从数组 / Set / 字符串中取前 n 项', () => {
    assert.deepEqual(take([1, 2, 3, 4], 2), [1, 2]);
    assert.deepEqual(take(new Set(['a', 'b']), 5), ['a', 'b']);
    assert.deepEqual(take('你好世界', 2), ['你', '好']);
    assert.deepEqual(take([1, 2], 0), []);
  });

  test('对无限序列安全，且只拉取 n 次', () => {
    let pulled = 0;
    function* naturals() {
      let n = 0;
      while (true) {
        pulled++;
        yield n++;
      }
    }
    assert.deepEqual(take(naturals(), 3), [0, 1, 2]);
    assert.equal(pulled, 3);
  });

  advancedTest('取完后关闭迭代器（finally 被执行）', () => {
    let closed = false;
    function* source() {
      try {
        yield 1;
        yield 2;
        yield 3;
      } finally {
        closed = true;
      }
    }
    take(source(), 2);
    assert.equal(closed, true);
  });
});

describe('createOrderNoGenerator', () => {
  const fixedNow = () => new Date(2026, 8, 29, 10, 0, 0); // 2026-09-29

  test('生成格式正确的递增订单号', () => {
    const gen = createOrderNoGenerator({ now: fixedNow });
    assert.equal(gen.next().value, 'SO20260929000001');
    assert.equal(gen.next().value, 'SO20260929000002');
    assert.equal(gen.next().done, false);
  });

  test('自定义前缀与位数', () => {
    const gen = createOrderNoGenerator({ prefix: 'RF', width: 4, now: fixedNow });
    assert.deepEqual(take(gen, 2), ['RF202609290001', 'RF202609290002']);
  });

  test('跨天自动重置流水号', () => {
    let current = new Date(2026, 8, 29, 23, 59, 59);
    const gen = createOrderNoGenerator({ now: () => current });
    assert.equal(gen.next().value, 'SO20260929000001');
    assert.equal(gen.next().value, 'SO20260929000002');
    current = new Date(2026, 8, 30, 0, 0, 1);
    assert.equal(gen.next().value, 'SO20260930000001');
  });

  advancedTest("next('reset') 手动重置", () => {
    const gen = createOrderNoGenerator({ now: fixedNow });
    gen.next();
    gen.next();
    gen.next();
    assert.equal(gen.next('reset').value, 'SO20260929000001');
    assert.equal(gen.next().value, 'SO20260929000002');
  });

  test('是生成器对象', () => {
    const gen = createOrderNoGenerator();
    assert.equal(typeof gen.next, 'function');
    assert.equal(gen[Symbol.iterator](), gen);
  });
});

describe('OrderBook', () => {
  const orders = [
    { id: 1, status: 'PAID', amount: 100 },
    { id: 2, status: 'PENDING', amount: 50 },
    { id: 3, status: 'PAID', amount: 30 },
  ];

  test('可以被 for...of / 展开 / 解构，且能多次遍历', () => {
    const book = new OrderBook(orders);
    const ids = [];
    for (const o of book) ids.push(o.id);
    assert.deepEqual(ids, [1, 2, 3]);
    assert.deepEqual(
      [...book].map((o) => o.id),
      [1, 2, 3],
      '第二次遍历应得到完整结果',
    );
    const [first] = book;
    assert.equal(first.id, 1);
  });

  test('add 支持链式调用，size 正确', () => {
    const book = new OrderBook();
    assert.equal(book.add(orders[0]).add(orders[1]), book);
    assert.equal(book.size, 2);
  });

  test('byStatus 惰性筛选', () => {
    const book = new OrderBook(orders);
    const paid = book.byStatus('PAID');
    assert.equal(typeof paid.next, 'function', 'byStatus 应返回迭代器');
    assert.deepEqual(
      [...paid].map((o) => o.id),
      [1, 3],
    );
    assert.deepEqual([...book.byStatus('REFUNDED')], []);
  });

  advancedTest('不暴露内部存储', () => {
    const input = [...orders];
    const book = new OrderBook(input);
    input.push({ id: 99 });
    assert.equal(book.size, 3, '修改构造函数传入的数组不应影响 OrderBook');
    const exported = [...book];
    exported.pop();
    assert.equal(book.size, 3);
    const enumerable = Object.values(book);
    assert.ok(!enumerable.some(Array.isArray), '不应通过公开属性暴露内部数组');
  });

  test('OrderBook.from 支持任意可迭代对象', () => {
    function* gen() {
      yield orders[0];
      yield orders[1];
    }
    const a = OrderBook.from(gen());
    assert.ok(a instanceof OrderBook);
    assert.equal(a.size, 2);
    const b = OrderBook.from(a);
    assert.equal(b.size, 2);
    assert.notEqual(a, b);
  });
});
