import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { load, advancedTest } from '../_helpers.js';

const { Product, DiscountProduct, DigitalProduct } = await load('02-prototype/02-product-models.js');

describe('商品模型（ES5 继承）', () => {
  test('源码中不使用 class / extends', async () => {
    const src = [Product, DiscountProduct, DigitalProduct].map(String).join('\n');
    assert.doesNotMatch(src, /\bclass\b|\bextends\b/);
    const file = process.env.SOLUTION === '1' ? 'solutions' : 'exercises';
    const full = await readFile(new URL(`../../${file}/02-prototype/02-product-models.js`, import.meta.url), 'utf8');
    const code = full.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
    assert.doesNotMatch(code, /\bclass\b|\bextends\b/);
  });

  test('Product 基础功能', () => {
    const p = new Product({ id: 1, name: '机械键盘', price: 399 });
    assert.equal(p.getPrice(), 399);
    assert.equal(p.getShippingFee(), 0);
    assert.equal(p.describe(), '机械键盘 ¥399.00');
    const cheap = new Product({ id: 2, name: '鼠标垫', price: 19.9 });
    assert.equal(cheap.getShippingFee(), 10);
  });

  test('方法定义在原型上，实例只保存数据', () => {
    const p = new Product({ id: 1, name: '机械键盘', price: 399 });
    assert.deepEqual(Object.keys(p).sort(), ['id', 'name', 'price']);
    for (const m of ['getPrice', 'getShippingFee', 'describe']) {
      assert.ok(Object.hasOwn(Product.prototype, m), `${m} 应定义在 Product.prototype 上`);
    }
    const q = new Product({ id: 2, name: 'x', price: 1 });
    assert.equal(p.describe, q.describe, '所有实例应共享同一个方法');
  });

  test('DiscountProduct：继承 + 重写 getPrice', () => {
    const p = new DiscountProduct({ id: 3, name: '显示器', price: 1299, discount: 0.85 });
    assert.equal(p.getPrice(), 1104.15);
    assert.equal(p.describe(), '显示器 ¥1104.15', 'describe 应体现折扣价（多态）');
    assert.equal(p.getShippingFee(), 0);
    const small = new DiscountProduct({ id: 4, name: '数据线', price: 109, discount: 0.5 });
    assert.equal(small.getShippingFee(), 10, '运费按折后价计算');
    assert.ok(!Object.hasOwn(DiscountProduct.prototype, 'describe'), '子类不应重写 describe');
  });

  test('DiscountProduct：非法折扣抛出 RangeError', () => {
    assert.throws(() => new DiscountProduct({ id: 1, name: 'x', price: 1, discount: 0 }), RangeError);
    assert.throws(() => new DiscountProduct({ id: 1, name: 'x', price: 1, discount: 1.2 }), RangeError);
    assert.throws(() => new DiscountProduct({ id: 1, name: 'x', price: 1 }), RangeError);
  });

  test('DigitalProduct：永远免运费', () => {
    const p = new DigitalProduct({ id: 5, name: '电子书', price: 9.9, downloadUrl: 'https://cdn/x.pdf' });
    assert.equal(p.getShippingFee(), 0);
    assert.equal(p.describe(), '电子书 ¥9.90');
    assert.equal(p.downloadUrl, 'https://cdn/x.pdf');
  });

  test('原型链结构正确', () => {
    const d = new DiscountProduct({ id: 1, name: 'x', price: 100, discount: 0.9 });
    const g = new DigitalProduct({ id: 2, name: 'y', price: 100, downloadUrl: '' });
    assert.ok(d instanceof DiscountProduct && d instanceof Product);
    assert.ok(g instanceof DigitalProduct && g instanceof Product);
    assert.ok(!(d instanceof DigitalProduct));
    assert.equal(Object.getPrototypeOf(DiscountProduct.prototype), Product.prototype);
    assert.equal(Object.getPrototypeOf(DigitalProduct.prototype), Product.prototype);
  });

  test('constructor 指向正确', () => {
    const d = new DiscountProduct({ id: 1, name: 'x', price: 100, discount: 0.9 });
    assert.equal(d.constructor, DiscountProduct);
    assert.equal(new DigitalProduct({ id: 2, name: 'y', price: 1 }).constructor, DigitalProduct);
    assert.equal(new Product({ id: 3, name: 'z', price: 1 }).constructor, Product);
  });

  advancedTest('子类原型上没有父类的实例属性（未使用 new Product() 创建原型）', () => {
    for (const Child of [DiscountProduct, DigitalProduct]) {
      for (const key of ['id', 'name', 'price']) {
        assert.ok(!Object.hasOwn(Child.prototype, key), `${Child.name}.prototype 上不应有 ${key}`);
      }
    }
  });

  test('子类实例的数据都是自有属性', () => {
    const d = new DiscountProduct({ id: 1, name: 'x', price: 100, discount: 0.9 });
    assert.deepEqual(Object.keys(d).sort(), ['discount', 'id', 'name', 'price']);
  });

  advancedTest('constructor 属性不可枚举（与原生行为一致，for...in 不会遍历到）', () => {
    const d = new DiscountProduct({ id: 1, name: 'x', price: 100, discount: 0.9 });
    const keys = [];
    for (const k in d) keys.push(k);
    assert.ok(!keys.includes('constructor'));
  });
});
