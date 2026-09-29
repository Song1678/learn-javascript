import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { load, sleep, advancedTest } from '../_helpers.js';

const { createCachedFetcher } = await load('05-async-await/03-request-dedupe.js');

function createUserApi() {
  const api = {
    calls: 0,
    names: { u1: '张三', u2: '李四' },
    failNext: false,
    async getUser(uid) {
      api.calls++;
      const shouldFail = api.failNext;
      api.failNext = false;
      await sleep(10);
      if (shouldFail) throw new Error('服务繁忙');
      return { uid, name: api.names[uid] };
    },
  };
  return api;
}

describe('createCachedFetcher', () => {
  test('并发的相同请求只发出一次', async () => {
    const api = createUserApi();
    const getUser = createCachedFetcher(api.getUser);
    const results = await Promise.all([getUser('u1'), getUser('u1'), getUser('u1'), getUser('u2')]);
    assert.equal(api.calls, 2);
    assert.deepEqual(
      results.map((u) => u.name),
      ['张三', '张三', '张三', '李四'],
    );
  });

  test('ttl 为 0 时不缓存：请求完成后再次调用会重新请求', async () => {
    const api = createUserApi();
    const getUser = createCachedFetcher(api.getUser);
    await getUser('u1');
    await getUser('u1');
    assert.equal(api.calls, 2);
  });

  test('ttl 内使用缓存，过期后重新请求', async () => {
    const api = createUserApi();
    const getUser = createCachedFetcher(api.getUser, { ttl: 40 });
    await getUser('u1');
    await getUser('u1');
    assert.equal(api.calls, 1);
    await sleep(50);
    await getUser('u1');
    assert.equal(api.calls, 2);
  });

  test('缓存命中时也返回 Promise', async () => {
    const api = createUserApi();
    const getUser = createCachedFetcher(api.getUser, { ttl: 1000 });
    await getUser('u1');
    const result = getUser('u1');
    assert.equal(typeof result.then, 'function');
    assert.equal((await result).name, '张三');
  });

  advancedTest('失败不缓存，并发调用方都收到错误，下次重新请求', async () => {
    const api = createUserApi();
    const getUser = createCachedFetcher(api.getUser, { ttl: 1000 });
    api.failNext = true;
    const [a, b] = await Promise.allSettled([getUser('u1'), getUser('u1')]);
    assert.equal(a.status, 'rejected');
    assert.equal(b.status, 'rejected');
    assert.equal(api.calls, 1);
    assert.equal((await getUser('u1')).name, '张三');
    assert.equal(api.calls, 2);
  });

  test('invalidate 使缓存失效', async () => {
    const api = createUserApi();
    const getUser = createCachedFetcher(api.getUser, { ttl: 1000 });
    await getUser('u1');
    api.names.u1 = '张三（已改名）';
    getUser.invalidate('u1');
    assert.equal((await getUser('u1')).name, '张三（已改名）');
    assert.equal(api.calls, 2);
  });

  advancedTest('invalidate 时正在进行的旧请求不写入缓存', async () => {
    const api = createUserApi();
    const getUser = createCachedFetcher(api.getUser, { ttl: 1000 });
    const old = getUser('u1'); // 旧请求发出（此时拿到的是旧名字）
    getUser.invalidate('u1'); // 用户改名，缓存失效
    api.names.u1 = '新名字';
    await old;
    const fresh = await getUser('u1');
    assert.equal(fresh.name, '新名字', '旧请求的结果不应被缓存');
    assert.equal(api.calls, 2);
  });

  advancedTest('clear 清空所有缓存', async () => {
    const api = createUserApi();
    const getUser = createCachedFetcher(api.getUser, { ttl: 1000 });
    await Promise.all([getUser('u1'), getUser('u2')]);
    getUser.clear();
    await Promise.all([getUser('u1'), getUser('u2')]);
    assert.equal(api.calls, 4);
  });
});
