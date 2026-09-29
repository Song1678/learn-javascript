import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { load, advancedTest } from '../_helpers.js';

const { Product, DiscountProduct, getPrototypeChain } = await load('02-prototype/00-basics.js');

describe('任务 1：Product', () => {
  test('构造与方法', () => {
    const p = new Product({ id: 1, name: '机械键盘', price: 399 });
    assert.equal(p.id, 1);
    assert.equal(p.name, '机械键盘');
    assert.equal(p.getPrice(), 399);
    assert.equal(p.describe(), '机械键盘 ¥399.00');
  });
});

describe('任务 2：DiscountProduct', () => {
  test('继承与重写', () => {
    const p = new DiscountProduct({ id: 2, name: '显示器', price: 1000, discount: 0.8 });
    assert.equal(p.getPrice(), 800);
    assert.equal(p.describe(), '显示器 ¥800.00');
    assert.ok(p instanceof DiscountProduct);
    assert.ok(p instanceof Product);
  });

  test('describe 继承自 Product，没有在子类中重写', () => {
    assert.ok(!Object.hasOwn(DiscountProduct.prototype, 'describe'));
  });
});

describe('任务 3：静态方法 fromJSON', () => {
  test('Product.fromJSON', () => {
    const p = Product.fromJSON('{"id":1,"name":"键盘","price":399}');
    assert.ok(p instanceof Product);
    assert.equal(p.describe(), '键盘 ¥399.00');
  });

  advancedTest('DiscountProduct.fromJSON 返回子类实例', () => {
    const p = DiscountProduct.fromJSON('{"id":2,"name":"显示器","price":1000,"discount":0.5}');
    assert.ok(p instanceof DiscountProduct);
    assert.equal(p.getPrice(), 500);
  });
});

describe('任务 4：getPrototypeChain', () => {
  test('类实例', () => {
    const p = new DiscountProduct({ id: 2, name: 'x', price: 1, discount: 1 });
    assert.deepEqual(getPrototypeChain(p), ['DiscountProduct', 'Product', 'Object']);
  });

  test('内置对象', () => {
    assert.deepEqual(getPrototypeChain([]), ['Array', 'Object']);
    assert.deepEqual(getPrototypeChain({}), ['Object']);
    assert.deepEqual(getPrototypeChain(Object.create(null)), []);
  });
});
