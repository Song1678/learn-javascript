import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { load, codeOf } from '../_helpers.js';

const { myNew, myInstanceOf, myCreate } = await load('02-prototype/03-new-instanceof.js');

function Order(id, amount) {
  this.id = id;
  this.amount = amount;
}
Order.prototype.pay = function () {
  return `支付订单 ${this.id}：¥${this.amount}`;
};

describe('myNew', () => {
  test('源码中不使用 new 关键字', () => {
    assert.doesNotMatch(codeOf(myNew), /\bnew\s+(?!\w*Error\b)[A-Za-z_$]/, '除了 new XxxError 之外不允许使用 new');
  });

  test('创建实例并执行构造函数', () => {
    const order = myNew(Order, 'SO1', 100);
    assert.equal(order.id, 'SO1');
    assert.equal(order.amount, 100);
    assert.equal(order.pay(), '支付订单 SO1：¥100');
    assert.equal(Object.getPrototypeOf(order), Order.prototype);
  });

  test('构造函数返回对象时，以返回值为准', () => {
    const cached = { id: 'cached' };
    function Singleton() {
      this.id = 'new';
      return cached;
    }
    assert.equal(myNew(Singleton), cached);
  });

  test('构造函数返回函数时，以返回值为准', () => {
    const fn = () => {};
    function Factory() {
      return fn;
    }
    assert.equal(myNew(Factory), fn);
  });

  test('构造函数返回原始值时，忽略返回值', () => {
    function Weird() {
      this.ok = true;
      return 42;
    }
    const w = myNew(Weird);
    assert.equal(w.ok, true);
    function ReturnsNull() {
      this.ok = true;
      return null;
    }
    assert.equal(myNew(ReturnsNull).ok, true);
  });
});

describe('myInstanceOf', () => {
  test('源码中不使用 instanceof 运算符', () => {
    assert.doesNotMatch(codeOf(myInstanceOf), /\binstanceof\b/);
  });

  test('沿原型链判断', () => {
    class Model {}
    class User extends Model {}
    const u = new User();
    assert.equal(myInstanceOf(u, User), true);
    assert.equal(myInstanceOf(u, Model), true);
    assert.equal(myInstanceOf(u, Object), true);
    assert.equal(myInstanceOf(u, Array), false);
    assert.equal(myInstanceOf([], Array), true);
    assert.equal(myInstanceOf(() => {}, Function), true);
  });

  test('原始值返回 false', () => {
    assert.equal(myInstanceOf(1, Number), false);
    assert.equal(myInstanceOf('s', String), false);
    assert.equal(myInstanceOf(null, Object), false);
    assert.equal(myInstanceOf(undefined, Object), false);
  });

  test('无原型对象', () => {
    assert.equal(myInstanceOf(Object.create(null), Object), false);
  });

  test('右侧不是函数时抛出 TypeError', () => {
    assert.throws(() => myInstanceOf({}, {}), TypeError);
  });
});

describe('myCreate', () => {
  test('源码中不使用 Object.create', () => {
    assert.doesNotMatch(codeOf(myCreate), /Object\.create/);
  });

  test('指定原型', () => {
    const base = { greet() { return `hi ${this.name}`; } };
    const o = myCreate(base);
    o.name = 'Tom';
    assert.equal(Object.getPrototypeOf(o), base);
    assert.equal(o.greet(), 'hi Tom');
    assert.deepEqual(Object.keys(o), ['name']);
  });

  test('原型为 null', () => {
    const dict = myCreate(null);
    assert.equal(Object.getPrototypeOf(dict), null);
    assert.equal(dict.toString, undefined);
  });

  test('支持属性描述符', () => {
    const o = myCreate(Object.prototype, {
      id: { value: 1, enumerable: true },
      secret: { value: 'x', enumerable: false },
    });
    assert.deepEqual(Object.keys(o), ['id']);
    assert.equal(o.secret, 'x');
    assert.throws(() => {
      o.id = 2; // writable 默认为 false，严格模式下赋值抛错
    }, TypeError);
  });

  test('非法原型抛出 TypeError', () => {
    assert.throws(() => myCreate(1), TypeError);
    assert.throws(() => myCreate(undefined), TypeError);
  });
});
