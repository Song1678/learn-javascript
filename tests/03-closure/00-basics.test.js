import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { load } from '../_helpers.js';

const { createCounter, createTaxCalculator, once, createProductLabels } = await load('03-closure/00-basics.js');

describe('任务 1：createCounter', () => {
  test('增加、减少、读取', () => {
    const badge = createCounter(3);
    assert.equal(badge.increment(), 4);
    assert.equal(badge.decrement(), 3);
    assert.equal(badge.get(), 3);
  });

  test('默认从 0 开始，不会小于 0', () => {
    const badge = createCounter();
    assert.equal(badge.decrement(), 0);
    assert.equal(badge.get(), 0);
  });

  test('计数是私有的，多个计数器互不影响', () => {
    const a = createCounter();
    const b = createCounter(10);
    a.increment();
    assert.equal(a.get(), 1);
    assert.equal(b.get(), 10);
    assert.deepEqual(Object.keys(a).sort(), ['decrement', 'get', 'increment']);
  });
});

describe('任务 2：createTaxCalculator', () => {
  test('计算含税价', () => {
    const withVat = createTaxCalculator(0.13);
    assert.equal(withVat(100), 113);
    assert.equal(withVat(9.9), 11.19);
    const withNoTax = createTaxCalculator(0);
    assert.equal(withNoTax(50), 50);
  });
});

describe('任务 3：once', () => {
  test('只执行一次，之后返回第一次的结果', () => {
    let calls = 0;
    const init = once((appId) => {
      calls++;
      return `sdk-${appId}`;
    });
    assert.equal(init('shop'), 'sdk-shop');
    assert.equal(init('other'), 'sdk-shop');
    assert.equal(calls, 1);
  });
});

describe('任务 4：循环中的闭包', () => {
  test('每个函数记住自己的序号', () => {
    const labels = createProductLabels();
    assert.deepEqual(
      labels.map((fn) => fn()),
      ['第1个商品', '第2个商品', '第3个商品'],
    );
  });
});
