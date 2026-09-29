import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { load, sleep } from '../_helpers.js';

const { Cart } = await load('01-this/02-cart.js');

/** 模拟页面上的按钮：触发回调时 this 指向按钮本身（与 DOM 事件一致） */
class FakeButton {
  onClick(handler) {
    this.handler = handler;
  }
  click() {
    this.handler.call(this, { type: 'click' });
  }
}

const keyboard = { id: 'p1', name: '机械键盘', price: 399 };
const mouse = { id: 'p2', name: '无线鼠标', price: 129 };

describe('购物车 Cart', () => {
  test('直接调用 add / total 正常（同事自测通过的部分）', () => {
    const cart = new Cart();
    cart.add(keyboard);
    cart.add(keyboard, 2);
    cart.add(mouse);
    assert.equal(cart.items.length, 2);
    assert.equal(cart.total(), 399 * 3 + 129);
  });

  test('Bug 1：批量加入购物车 addMany', () => {
    const cart = new Cart();
    const button = new FakeButton();
    button.onClick(() => cart.addMany([keyboard, mouse, keyboard]));
    button.click();
    assert.equal(cart.total(), 399 * 2 + 129);
  });

  test('Bug 2：clear 直接作为按钮回调', () => {
    const changes = [];
    const cart = new Cart({ onChange: (total) => changes.push(total) });
    cart.add(keyboard);
    const button = new FakeButton();
    button.onClick(cart.clear);
    button.click();
    assert.equal(cart.items.length, 0);
    assert.equal(cart.total(), 0);
    assert.deepEqual(changes, [399, 0]);
  });

  test('Bug 2 补充：clear 被解构出来单独调用也能工作', () => {
    const cart = new Cart();
    cart.add(mouse);
    const { clear } = cart;
    clear();
    assert.equal(cart.items.length, 0);
  });

  test('Bug 3：scheduleClear 定时清空', async () => {
    const cart = new Cart();
    cart.add(keyboard);
    cart.scheduleClear(10);
    assert.equal(cart.items.length, 1, '时间未到之前不应清空');
    await sleep(30);
    assert.equal(cart.items.length, 0);
  });

  test('Bug 4：applyCoupon 优惠券生效', async () => {
    const changes = [];
    const cart = new Cart({ onChange: (total) => changes.push(total) });
    cart.add(keyboard);
    const couponService = {
      check: async (code) => (code === 'VIP100' ? { valid: true, amount: 100 } : { valid: false }),
    };
    assert.equal(await cart.applyCoupon('BAD', couponService), false);
    assert.equal(cart.total(), 399);
    assert.equal(await cart.applyCoupon('VIP100', couponService), true);
    assert.equal(cart.total(), 299);
    assert.deepEqual(changes, [399, 299]);
  });

  test('多个购物车实例互不影响', () => {
    const a = new Cart();
    const b = new Cart();
    a.add(keyboard);
    b.add(mouse);
    const { clear } = a;
    clear();
    assert.equal(a.items.length, 0);
    assert.equal(b.items.length, 1);
  });
});
