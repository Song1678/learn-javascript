/**
 * 练习 4-1：预测执行顺序（事件循环 / 微任务 / 宏任务）
 *
 * 规则：
 *  - 每题的 run() 会把事件依次 push 到 log 中，最后返回 log.join(',')。
 *  - 请把你预测的返回值（字符串）填到 answer。
 *  - 背景知识：同步代码 → 清空微任务队列（Promise.then / await 之后的代码 / queueMicrotask）
 *    → 取一个宏任务（setTimeout 等）执行 → 再清空微任务 → ……
 */
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

export const quiz = [
  {
    id: 1,
    title: '同步、微任务、宏任务',
    async run() {
      const log = [];
      setTimeout(() => log.push('timeout'), 0);
      Promise.resolve().then(() => log.push('then'));
      log.push('sync');
      await wait(10);
      return log.join(',');
    },
    answer: 'sync,then,timeout',
    // 💡 同步代码最先执行；本轮同步结束后先清空微任务（then），再执行宏任务（timeout）。
  },
  {
    id: 2,
    title: 'Promise 构造函数是同步执行的',
    async run() {
      const log = [];
      new Promise((resolve) => {
        log.push('executor');
        resolve();
        log.push('after-resolve');
      }).then(() => log.push('then'));
      log.push('main');
      await wait(10);
      return log.join(',');
    },
    answer: 'executor,after-resolve,main,then',
    // 💡 executor 会立即同步执行；resolve() 不会中断后续代码，只是改变状态并安排 then 回调进入微任务队列。
  },
  {
    id: 3,
    title: '两条 then 链交替执行',
    async run() {
      const log = [];
      Promise.resolve()
        .then(() => log.push('a1'))
        .then(() => log.push('a2'));
      Promise.resolve()
        .then(() => log.push('b1'))
        .then(() => log.push('b2'));
      await wait(10);
      return log.join(',');
    },
    answer: 'a1,b1,a2,b2',
    // 💡 a2 只有在 a1 执行完（其返回的 promise 完成）后才会进入微任务队列，此时 b1 已经排在前面了。
  },
  {
    id: 4,
    title: 'async 函数中 await 之前的代码是同步的',
    async run() {
      const log = [];
      async function loadUser() {
        log.push('load-start');
        await null;
        log.push('load-end');
      }
      loadUser();
      log.push('main');
      await wait(10);
      return log.join(',');
    },
    answer: 'load-start,main,load-end',
    // 💡 调用 async 函数会同步执行到第一个 await；await 之后的代码相当于放在 then 回调里。
  },
  {
    id: 5,
    title: '错误的传播与恢复',
    async run() {
      const log = [];
      await Promise.reject(new Error('网络错误'))
        .then(() => log.push('then1'))
        .catch((err) => {
          log.push('catch');
          return '默认值';
        })
        .then((v) => log.push(`then2:${v}`))
        .finally(() => log.push('finally'));
      return log.join(',');
    },
    answer: 'catch,then2:默认值,finally',
    // 💡 rejected 状态会跳过所有 onFulfilled 回调，直到遇到 catch；catch 返回普通值后链条恢复为 fulfilled。
  },
  {
    id: 6,
    title: '忘记 return 的 then',
    async run() {
      const log = [];
      await Promise.resolve()
        .then(() => {
          wait(5).then(() => log.push('save-done'));
        })
        .then(() => log.push('show-success'));
      await wait(20);
      return log.join(',');
    },
    answer: 'show-success,save-done',
    // 💡 第一个 then 回调没有 return 那个 promise，所以返回 undefined，下一个 then 不会等待保存完成。
    //    真实场景：「保存成功」提示比保存操作先出现，甚至保存失败了也提示成功。
  },
  {
    id: 7,
    title: '宏任务中产生的微任务',
    async run() {
      const log = [];
      setTimeout(() => {
        log.push('t1');
        Promise.resolve().then(() => log.push('p1'));
      }, 0);
      setTimeout(() => log.push('t2'), 0);
      await wait(20);
      return log.join(',');
    },
    answer: 't1,p1,t2',
    // 💡 每执行完一个宏任务，都会先清空微任务队列，再执行下一个宏任务。
  },
  {
    id: 8,
    title: 'Promise 状态只能改变一次',
    async run() {
      const log = [];
      const p = new Promise((resolve, reject) => {
        resolve('first');
        reject(new Error('ignored'));
        resolve('second');
      });
      await p.then((v) => log.push(v)).catch(() => log.push('error'));
      return log.join(',');
    },
    answer: 'first',
    // 💡 pending -> fulfilled / rejected 是单向且只发生一次的，后续的 resolve/reject 调用被静默忽略。
  },
  {
    id: 9,
    title: 'then 的回调不是函数',
    async run() {
      const v = await Promise.resolve(1)
        .then(2)
        .then(Promise.resolve(3))
        .then((x) => x);
      return v;
    },
    answer: 1,
    // 💡 then 的参数如果不是函数会被忽略（值穿透），相当于 .then(x => x)。
  },
];
