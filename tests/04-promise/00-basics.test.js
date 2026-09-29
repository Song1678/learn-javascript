import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { load, sleep, codeOf, advancedTest } from '../_helpers.js';

const mod = await load('04-promise/00-basics.js');
const { delay, loadConfig, getUserDiscount, getNickname, loadHomePage } = mod;

test('不使用 async / await', () => {
  for (const fn of Object.values(mod)) {
    assert.doesNotMatch(codeOf(fn), /\b(async|await)\b/, `${fn.name} 中使用了 async/await，本练习请只用 Promise`);
  }
});

describe('任务 1：delay', () => {
  test('返回 Promise，指定时间后以 value 成功', async () => {
    const start = Date.now();
    const p = delay(30, 'ok');
    assert.ok(p instanceof Promise, 'delay 应该返回 Promise');
    assert.equal(await p, 'ok');
    assert.ok(Date.now() - start >= 25);
  });
});

describe('任务 2：loadConfig', () => {
  const files = { 'config.json': '{"theme":"dark","pageSize":20}', 'broken.json': '{oops' };
  const readFile = (path, callback) => {
    setTimeout(() => {
      if (path in files) callback(null, files[path]);
      else callback(new Error(`文件不存在：${path}`));
    }, 1);
  };

  test('读取并解析 JSON', async () => {
    assert.deepEqual(await loadConfig(readFile, 'config.json'), { theme: 'dark', pageSize: 20 });
  });

  test('读取失败时 Promise 失败', async () => {
    await assert.rejects(loadConfig(readFile, 'nope.json'), /文件不存在/);
  });

  advancedTest('文件内容不是合法 JSON 时 Promise 失败', async () => {
    await assert.rejects(loadConfig(readFile, 'broken.json'), SyntaxError);
  });
});

describe('任务 3：getUserDiscount', () => {
  test('先查用户，再查折扣', async () => {
    const calls = [];
    const api = {
      getUser: (id) => {
        calls.push(`getUser:${id}`);
        return delay(5, { id, level: 'gold' });
      },
      getDiscount: (level) => {
        calls.push(`getDiscount:${level}`);
        return delay(5, level === 'gold' ? 0.8 : 1);
      },
    };
    assert.equal(await getUserDiscount(api, 'u1'), 0.8);
    assert.deepEqual(calls, ['getUser:u1', 'getDiscount:gold']);
  });
});

describe('任务 4：getNickname', () => {
  test('成功时返回昵称', async () => {
    const api = { getUser: () => Promise.resolve({ name: '小明' }) };
    assert.equal(await getNickname(api, 'u1'), '小明');
  });

  test('失败时返回「游客」', async () => {
    const api = { getUser: () => Promise.reject(new Error('未登录')) };
    assert.equal(await getNickname(api, 'u1'), '游客');
  });
});

describe('任务 5：loadHomePage', () => {
  test('并行请求并组装结果', async () => {
    const api = {
      getBanners: () => sleep(30).then(() => ['banner1']),
      getProducts: () => sleep(30).then(() => ['p1', 'p2']),
    };
    const start = Date.now();
    assert.deepEqual(await loadHomePage(api), { banners: ['banner1'], products: ['p1', 'p2'] });
    assert.ok(Date.now() - start < 55, '两个请求应该同时发出（并行），而不是一个接一个');
  });
});
