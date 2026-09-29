import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { load } from '../_helpers.js';

const { calcTotal, paginate, sortByPrice, getCouponCount } = await load('00-warmup/03-debug.js');

describe('Bug 1：calcTotal', () => {
  test('0.1 + 0.2 应该等于 0.3', () => {
    assert.equal(calcTotal([{ price: 0.1, qty: 1 }, { price: 0.2, qty: 1 }]), 0.3);
  });

  test('常规金额', () => {
    assert.equal(calcTotal([{ price: 19.9, qty: 3 }]), 59.7);
    assert.equal(calcTotal([]), 0);
  });
});

describe('Bug 2：paginate', () => {
  const list = [1, 2, 3, 4, 5];

  test('第 1 页', () => {
    assert.deepEqual(paginate(list, 1, 2), [1, 2]);
  });

  test('第 2 页', () => {
    assert.deepEqual(paginate(list, 2, 2), [3, 4]);
  });

  test('最后一页不满一页', () => {
    assert.deepEqual(paginate(list, 3, 2), [5]);
  });

  test('超出范围返回空数组', () => {
    assert.deepEqual(paginate(list, 4, 2), []);
  });
});

describe('Bug 3：sortByPrice', () => {
  test('按价格升序', () => {
    const products = [{ price: 30 }, { price: 10 }, { price: 20 }];
    assert.deepEqual(
      sortByPrice(products).map((p) => p.price),
      [10, 20, 30],
    );
  });

  test('不改变原数组', () => {
    const products = [{ price: 30 }, { price: 10 }, { price: 20 }];
    sortByPrice(products);
    assert.deepEqual(
      products.map((p) => p.price),
      [30, 10, 20],
    );
  });
});

describe('Bug 4：getCouponCount', () => {
  test('老用户', () => {
    assert.equal(getCouponCount({ coupons: ['C1', 'C2'] }), 2);
  });

  test('新用户没有 coupons 字段', () => {
    assert.equal(getCouponCount({}), 0);
  });
});
