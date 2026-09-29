import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { load, sleep, codeOf, advancedDescribe } from '../_helpers.js';

const { MyPromise } = await load('04-promise/05-my-promise.js');

advancedDescribe('MyPromise：基础', () => {
  test('实现中不使用原生 Promise', () => {
    assert.doesNotMatch(codeOf(MyPromise), /\bPromise\b(?!\/)/, '实现中出现了原生 Promise');
  });

  test('executor 同步执行', () => {
    let ran = false;
    new MyPromise(() => {
      ran = true;
    });
    assert.equal(ran, true);
  });

  test('resolve 后 then 拿到值', async () => {
    const v = await new Promise((done) => new MyPromise((r) => r(42)).then(done));
    assert.equal(v, 42);
  });

  test('异步 resolve', async () => {
    const v = await new Promise((done) => new MyPromise((r) => setTimeout(() => r('later'), 10)).then(done));
    assert.equal(v, 'later');
  });

  test('executor 抛错等同于 reject', async () => {
    const e = await new Promise((done) =>
      new MyPromise(() => {
        throw new Error('boom');
      }).then(null, done),
    );
    assert.equal(e.message, 'boom');
  });

  test('状态只能改变一次', async () => {
    const log = [];
    const p = new MyPromise((resolve, reject) => {
      resolve(1);
      reject(2);
      resolve(3);
    });
    p.then((v) => log.push(`ok:${v}`), (e) => log.push(`err:${e}`));
    await sleep(5);
    assert.deepEqual(log, ['ok:1']);
  });

  test('then 回调异步执行（即使已经 resolve）', async () => {
    const log = [];
    const p = new MyPromise((r) => r());
    p.then(() => log.push('then'));
    log.push('sync');
    await sleep(5);
    assert.deepEqual(log, ['sync', 'then']);
  });

  test('then 回调在微任务中执行（早于 setTimeout）', async () => {
    const log = [];
    setTimeout(() => log.push('timeout'), 0);
    MyPromise.resolve().then(() => log.push('then'));
    await sleep(10);
    assert.deepEqual(log, ['then', 'timeout']);
  });

  test('同一个 promise 多次 then，按注册顺序执行', async () => {
    const log = [];
    const p = new MyPromise((r) => setTimeout(() => r('v'), 5));
    p.then(() => log.push(1));
    p.then(() => log.push(2));
    await sleep(20);
    p.then(() => log.push(3));
    await sleep(5);
    assert.deepEqual(log, [1, 2, 3]);
  });
});

advancedDescribe('MyPromise：链式调用', () => {
  test('then 返回新 promise，值沿链传递', async () => {
    const p1 = MyPromise.resolve(1);
    const p2 = p1.then((v) => v + 1);
    assert.notEqual(p1, p2);
    const v = await new Promise((done) => p2.then((v) => v * 10).then(done));
    assert.equal(v, 20);
  });

  test('值穿透与错误穿透', async () => {
    const v = await new Promise((done) => MyPromise.resolve('v').then(null).then(undefined, null).then(done));
    assert.equal(v, 'v');
    const e = await new Promise((done) => MyPromise.reject('e').then((x) => x).then(null, done));
    assert.equal(e, 'e');
  });

  test('回调抛错会让下一个 promise 失败，catch 后可恢复', async () => {
    const v = await new Promise((done) =>
      MyPromise.resolve()
        .then(() => {
          throw new Error('库存不足');
        })
        .then(() => 'skipped')
        .catch((err) => `已处理：${err.message}`)
        .then(done),
    );
    assert.equal(v, '已处理：库存不足');
  });

  test('then 回调返回 MyPromise，会等待它完成', async () => {
    const v = await new Promise((done) =>
      MyPromise.resolve(1)
        .then((x) => new MyPromise((r) => setTimeout(() => r(x + 100), 10)))
        .then(done),
    );
    assert.equal(v, 101);
  });

  test('可以接管原生 Promise 与任意 thenable', async () => {
    const thenable = { then: (resolve) => setTimeout(() => resolve('thenable'), 5) };
    const results = await new Promise((done) => {
      const out = [];
      MyPromise.resolve()
        .then(() => Promise.resolve('native'))
        .then((v) => out.push(v))
        .then(() => thenable)
        .then((v) => out.push(v))
        .then(() => done(out));
    });
    assert.deepEqual(results, ['native', 'thenable']);
  });

  test('嵌套 thenable 会被递归解决', async () => {
    const v = await new Promise((done) =>
      MyPromise.resolve()
        .then(() => ({ then: (r) => r({ then: (r2) => r2('deep') }) }))
        .then(done),
    );
    assert.equal(v, 'deep');
  });

  test('thenable 多次调用回调只有第一次有效；调用后再抛错被忽略', async () => {
    const v = await new Promise((done) =>
      MyPromise.resolve()
        .then(() => ({
          then(resolve, reject) {
            resolve('first');
            reject('second');
            resolve('third');
            throw new Error('ignored');
          },
        }))
        .then(done, () => done('wrong')),
    );
    assert.equal(v, 'first');
  });

  test('读取 then 属性时抛错 → 失败', async () => {
    const bad = Object.defineProperty({}, 'then', {
      get() {
        throw new Error('getter error');
      },
    });
    const e = await new Promise((done) => MyPromise.resolve().then(() => bad).catch(done));
    assert.equal(e.message, 'getter error');
  });

  test('返回自身时以 TypeError 失败', async () => {
    const e = await new Promise((done) => {
      const p = MyPromise.resolve().then(() => p);
      p.catch(done);
    });
    assert.ok(e instanceof TypeError);
  });

  test('构造函数中 resolve 一个 promise 会等待它', async () => {
    const e = await new Promise((done) =>
      new MyPromise((resolve) => resolve(MyPromise.reject(new Error('inner')))).catch(done),
    );
    assert.equal(e.message, 'inner');
  });

  test('可以被原生 await', async () => {
    assert.equal(await new MyPromise((r) => setTimeout(() => r('awaited'), 5)), 'awaited');
    await assert.rejects(async () => {
      await MyPromise.reject(new Error('await rejected'));
    }, /await rejected/);
  });
});

advancedDescribe('MyPromise：finally 与静态方法', () => {
  test('finally 不改变原值 / 原错误', async () => {
    const log = [];
    const v = await MyPromise.resolve('v').finally((...args) => log.push(args.length));
    assert.equal(v, 'v');
    await assert.rejects(async () => MyPromise.reject(new Error('e')).finally(() => log.push('f')), /e/);
    assert.deepEqual(log, [0, 'f']);
  });

  test('finally 回调抛错会覆盖结果', async () => {
    await assert.rejects(
      async () =>
        MyPromise.resolve('v').finally(() => {
          throw new Error('cleanup failed');
        }),
      /cleanup failed/,
    );
  });

  test('finally 回调返回 promise 时会等待', async () => {
    const log = [];
    await MyPromise.resolve().finally(() => sleep(10).then(() => log.push('cleanup')));
    log.push('after');
    assert.deepEqual(log, ['cleanup', 'after']);
  });

  test('MyPromise.resolve 对 MyPromise 实例直接返回', () => {
    const p = new MyPromise(() => {});
    assert.equal(MyPromise.resolve(p), p);
    assert.ok(MyPromise.resolve(1) instanceof MyPromise);
    assert.ok(MyPromise.reject(1).catch(() => {}) instanceof MyPromise);
  });

  test('MyPromise.all', async () => {
    const r = await MyPromise.all([1, MyPromise.resolve(2), new MyPromise((res) => setTimeout(() => res(3), 5))]);
    assert.deepEqual(r, [1, 2, 3]);
    assert.deepEqual(await MyPromise.all([]), []);
    await assert.rejects(async () => MyPromise.all([MyPromise.reject(new Error('x')), 1]), /x/);
  });
});
