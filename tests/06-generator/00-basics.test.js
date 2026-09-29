import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { load, advancedTest } from '../_helpers.js';

const { orderStatusSteps, range, paginate, carousel, cart } = await load('06-generator/00-basics.js');

describe('任务 1：orderStatusSteps', () => {
  test('依次产出四个状态', () => {
    assert.deepEqual([...orderStatusSteps()], ['待付款', '待发货', '待收货', '已完成']);
  });

  test('可以用 next() 一步一步取', () => {
    const it = orderStatusSteps();
    assert.deepEqual(it.next(), { value: '待付款', done: false });
    it.next();
    it.next();
    it.next();
    assert.equal(it.next().done, true);
  });
});

describe('任务 2：range', () => {
  test('默认步长', () => {
    assert.deepEqual([...range(0, 5)], [0, 1, 2, 3, 4]);
  });

  test('指定步长 / 空范围', () => {
    assert.deepEqual([...range(1, 10, 3)], [1, 4, 7]);
    assert.deepEqual([...range(5, 5)], []);
  });
});

describe('任务 3：paginate', () => {
  test('分页', () => {
    assert.deepEqual([...paginate(['a', 'b', 'c', 'd', 'e'], 2)], [['a', 'b'], ['c', 'd'], ['e']]);
    assert.deepEqual([...paginate([], 2)], []);
  });
});

describe('任务 4：carousel', () => {
  test('循环播放', () => {
    const it = carousel(['a.jpg', 'b.jpg', 'c.jpg']);
    const shown = [];
    for (let i = 0; i < 7; i++) shown.push(it.next().value);
    assert.deepEqual(shown, ['a.jpg', 'b.jpg', 'c.jpg', 'a.jpg', 'b.jpg', 'c.jpg', 'a.jpg']);
  });

  advancedTest('空数组时直接结束', () => {
    assert.deepEqual([...carousel([])], []);
  });
});

describe('任务 5：可迭代的购物车', () => {
  test('for...of 与展开运算符', () => {
    const skus = [];
    for (const item of cart) skus.push(item.sku);
    assert.deepEqual(skus, ['A', 'B']);
    assert.deepEqual([...cart], cart.items);
  });

  test('可以遍历多次，并反映最新的 items', () => {
    [...cart];
    cart.items.push({ sku: 'C', qty: 1 });
    assert.equal([...cart].length, 3);
    cart.items.pop();
  });
});
