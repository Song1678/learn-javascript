import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { load, sleep } from '../_helpers.js';

const { shop, describeOtherShop, ClickCounter, Toast } = await load('01-this/00-basics.js');

describe('任务 1：对象方法中的 this', () => {
  test('addProduct 支持链式调用', () => {
    shop.products = [];
    const result = shop.addProduct({ name: '键盘' }).addProduct({ name: '鼠标' });
    assert.equal(result, shop);
    assert.equal(shop.products.length, 2);
  });

  test('getProductCount / describe', () => {
    shop.products = [{ name: '键盘' }, { name: '鼠标' }];
    assert.equal(shop.getProductCount(), 2);
    assert.equal(shop.describe(), '数码旗舰店共有2件商品');
  });

  test('方法中使用的是 this，而不是写死的 shop', () => {
    const copy = { ...shop, name: '复制的店', products: [] };
    copy.addProduct({ name: 'x' });
    assert.equal(copy.getProductCount(), 1);
    assert.equal(copy.describe(), '复制的店共有1件商品');
  });
});

describe('任务 2：call 借用方法', () => {
  test('describe 中的 this 指向其它店铺', () => {
    const otherShop = { name: '图书专营店', products: [1, 2, 3] };
    assert.equal(describeOtherShop(otherShop), '图书专营店共有3件商品');
  });
});

describe('任务 3：bind', () => {
  test('increment 作为回调传出去也能正常工作', () => {
    const counter = new ClickCounter();
    const button = {
      onClick(handler) {
        this.handler = handler;
      },
      click() {
        return this.handler(); // 以 button.handler() 的形式调用，this 是 button
      },
    };
    button.onClick(counter.increment);
    button.click();
    button.click();
    assert.equal(counter.count, 2);
  });
});

describe('任务 4：箭头函数', () => {
  test('ms 毫秒后自动隐藏', async () => {
    const toast = new Toast();
    toast.show(10);
    assert.equal(toast.visible, true);
    await sleep(30);
    assert.equal(toast.visible, false);
  });
});
