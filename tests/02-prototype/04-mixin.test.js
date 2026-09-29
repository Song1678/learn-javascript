import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { load, sleep } from '../_helpers.js';

const { mixin, Timestamps, Serializable } = await load('02-prototype/04-mixin.js');

class Model {
  constructor(attrs) {
    Object.assign(this, attrs);
    this.createdAt = Date.now();
    this.updatedAt = this.createdAt;
  }
}

class User extends mixin(Model, Timestamps, Serializable) {
  static fields = ['id', 'name'];
  constructor(attrs) {
    super(attrs);
    this.password = 'secret';
  }
}

describe('mixin 基础行为', () => {
  test('返回继承自 Base 的新类，不修改 Base', () => {
    const Mixed = mixin(Model, { hello() { return 'hi'; } });
    assert.notEqual(Mixed, Model);
    assert.equal(Object.getPrototypeOf(Mixed.prototype), Model.prototype);
    assert.equal(new Mixed({}).hello(), 'hi');
    assert.ok(!('hello' in Model.prototype), '不能修改 Base.prototype');
    assert.ok(new Mixed({}) instanceof Model);
  });

  test('getter 保持为访问器，不会在混入时被求值', () => {
    let calls = 0;
    const WithGetter = { get lazy() { calls++; return calls; } };
    const Mixed = mixin(Model, WithGetter);
    assert.equal(calls, 0, '混入时不应调用 getter');
    const desc = Object.getOwnPropertyDescriptor(Mixed.prototype, 'lazy');
    assert.equal(typeof desc.get, 'function');
    const m = new Mixed({});
    assert.equal(m.lazy, 1);
    assert.equal(m.lazy, 2);
  });

  test('setter 也被保留', () => {
    const Mixed = mixin(Model, {
      set fullName(v) {
        [this.first, this.last] = v.split(' ');
      },
    });
    const m = new Mixed({});
    m.fullName = 'Ada Lovelace';
    assert.equal(m.first, 'Ada');
    assert.equal(m.last, 'Lovelace');
  });

  test('Symbol 属性与不可枚举属性也被复制', () => {
    const tag = Symbol('tag');
    const src = { [tag]: 'tagged' };
    Object.defineProperty(src, 'hidden', { value: () => 'hidden', enumerable: false });
    const Mixed = mixin(Model, src);
    const m = new Mixed({});
    assert.equal(m[tag], 'tagged');
    assert.equal(m.hidden(), 'hidden');
  });

  test('后面的 mixin 覆盖前面的同名属性', () => {
    const Mixed = mixin(Model, { who: () => 'A' }, { who: () => 'B' });
    assert.equal(new Mixed({}).who(), 'B');
  });

  test('新类的 name 便于调试', () => {
    assert.equal(mixin(Model, Timestamps, Serializable).name, 'ModelWith2Mixins');
  });
});

describe('Timestamps', () => {
  test('touch 更新 updatedAt 并返回 this', async () => {
    const u = new User({ id: 1, name: 'Tom' });
    const before = u.updatedAt;
    await sleep(5);
    assert.equal(u.touch(), u);
    assert.ok(u.updatedAt > before);
  });

  test('age 是动态计算的只读属性', async () => {
    const u = new User({ id: 1, name: 'Tom' });
    await sleep(20);
    assert.ok(u.age >= 15, `age 应约为 20ms，实际为 ${u.age}`);
    assert.ok(!Object.hasOwn(u, 'age'), 'age 应定义在原型上');
  });
});

describe('Serializable', () => {
  test('只输出 static fields 声明的字段', () => {
    const u = new User({ id: 1, name: 'Tom' });
    assert.equal(JSON.stringify(u), '{"id":1,"name":"Tom"}');
  });

  test('不同类使用各自的 fields', () => {
    class Order extends mixin(Model, Serializable) {
      static fields = ['orderNo', 'amount'];
    }
    const o = new Order({ orderNo: 'SO1', amount: 99, internalNote: 'x' });
    assert.deepEqual(JSON.parse(JSON.stringify(o)), { orderNo: 'SO1', amount: 99 });
  });
});
