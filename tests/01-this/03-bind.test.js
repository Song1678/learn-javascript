import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { load, codeOf } from '../_helpers.js';

const { myCall, myApply, myBind, bindAll } = await load('01-this/03-bind.js');

function assertNoNative(fn) {
  const src = codeOf(fn);
  assert.doesNotMatch(src, /\.(call|apply|bind)\s*\(/, `${fn.name} 中不允许使用原生 call/apply/bind`);
  assert.doesNotMatch(src, /Reflect\.apply/, `${fn.name} 中不允许使用 Reflect.apply`);
}

function introduce(greeting, punctuation = '') {
  return `${greeting}，我是${this.name}${punctuation}`;
}

describe('myCall', () => {
  test('不使用原生 call/apply/bind', () => assertNoNative(myCall));

  test('指定 this 并传参', () => {
    assert.equal(myCall(introduce, { name: '张三' }, '你好', '！'), '你好，我是张三！');
  });

  test('调用后不在 thisArg 上残留任何属性', () => {
    const user = { name: '李四' };
    myCall(introduce, user, '嗨');
    assert.deepEqual(Reflect.ownKeys(user), ['name']);
  });

  test('thisArg 为 null / undefined 时指向 globalThis', () => {
    function getThis() {
      return this;
    }
    assert.equal(myCall(getThis, null), globalThis);
    assert.equal(myCall(getThis, undefined), globalThis);
  });

  test('thisArg 为原始值时装箱', () => {
    function getThis() {
      return this;
    }
    const result = myCall(getThis, 42);
    assert.equal(typeof result, 'object');
    assert.equal(result.valueOf(), 42);
  });

  test('被调用函数抛错时也不残留属性', () => {
    const obj = {};
    assert.throws(() =>
      myCall(function () {
        throw new Error('boom');
      }, obj),
    );
    assert.deepEqual(Reflect.ownKeys(obj), []);
  });
});

describe('myApply', () => {
  test('不使用原生 call/apply/bind', () => assertNoNative(myApply));

  test('参数以数组传入', () => {
    assert.equal(myApply(introduce, { name: '王五' }, ['早上好', '。']), '早上好，我是王五。');
  });

  test('参数数组可省略', () => {
    function count() {
      return arguments.length;
    }
    assert.equal(myApply(count, {}), 0);
    assert.equal(myApply(count, {}, null), 0);
  });
});

describe('myBind', () => {
  test('不使用原生 call/apply/bind', () => assertNoNative(myBind));

  test('固定 this，且后续无法更改', () => {
    const bound = myBind(introduce, { name: '赵六' });
    assert.equal(bound('你好'), '你好，我是赵六');
    const other = { name: '钱七', bound };
    assert.equal(other.bound('你好'), '你好，我是赵六');
  });

  test('预置参数（柯里化）', () => {
    const sayHi = myBind(introduce, { name: '孙八' }, '嗨');
    assert.equal(sayHi('~'), '嗨，我是孙八~');
  });

  test('作为构造函数被 new 调用时忽略 thisArg', () => {
    function Order(id, amount) {
      this.id = id;
      this.amount = amount;
    }
    Order.prototype.describe = function () {
      return `订单${this.id}：¥${this.amount}`;
    };
    const fakeThis = {};
    const BoundOrder = myBind(Order, fakeThis, 'SO001');
    const order = new BoundOrder(99);
    assert.equal(order.id, 'SO001');
    assert.equal(order.amount, 99);
    assert.ok(order instanceof Order, 'new 出来的实例应当 instanceof 原函数');
    assert.equal(order.describe(), '订单SO001：¥99');
    assert.deepEqual(fakeThis, {}, 'thisArg 不应被修改');
  });
});

describe('bindAll', () => {
  class Tracker {
    constructor(appId) {
      this.appId = appId;
      this.queue = [];
    }
    track(event) {
      this.queue.push(`${this.appId}:${event}`);
    }
    flush() {
      const sent = this.queue;
      this.queue = [];
      return sent;
    }
  }

  test('绑定后方法可以脱离实例调用', () => {
    const tracker = bindAll(new Tracker('shop'), ['track', 'flush']);
    const { track, flush } = tracker;
    track('page_view');
    ['click_buy', 'click_cart'].forEach(track);
    assert.deepEqual(flush(), ['shop:page_view', 'shop:click_buy', 'shop:click_cart']);
  });

  test('只影响当前实例，不修改原型', () => {
    const t = bindAll(new Tracker('a'), ['track']);
    assert.ok(Object.hasOwn(t, 'track'));
    assert.ok(!Object.hasOwn(new Tracker('b'), 'track'));
  });

  test('方法不存在时抛出 TypeError', () => {
    assert.throws(() => bindAll(new Tracker('a'), ['nope']), TypeError);
  });
});
