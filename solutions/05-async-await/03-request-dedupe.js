/**
 * 练习 5-3 参考答案：请求去重与缓存
 *
 * 两张表：
 *   inflight：key -> 正在进行中的 Promise（去重）
 *   cache：   key -> { value, expiresAt }（缓存成功结果）
 * 用一个自增的「版本号」来识别过期的请求：invalidate 时版本号 +1，旧请求完成时发现版本不一致，就不写缓存。
 */
export function createCachedFetcher(fetcher, { ttl = 0 } = {}) {
  const inflight = new Map();
  const cache = new Map();
  const versions = new Map();

  const versionOf = (key) => versions.get(key) ?? 0;

  function fetch(key) {
    const hit = cache.get(key);
    if (hit && hit.expiresAt > Date.now()) {
      return Promise.resolve(hit.value);
    }
    if (inflight.has(key)) {
      return inflight.get(key);
    }

    const version = versionOf(key);
    const promise = (async () => {
      try {
        const value = await fetcher(key);
        if (ttl > 0 && versionOf(key) === version) {
          cache.set(key, { value, expiresAt: Date.now() + ttl });
        }
        return value;
      } finally {
        // 成功失败都要移除 in-flight 记录；但只移除「自己」，避免误删 invalidate 后发起的新请求
        if (inflight.get(key) === promise) inflight.delete(key);
      }
    })();

    inflight.set(key, promise);
    return promise;
  }

  fetch.invalidate = (key) => {
    cache.delete(key);
    inflight.delete(key);
    versions.set(key, versionOf(key) + 1);
  };

  fetch.clear = () => {
    for (const key of new Set([...cache.keys(), ...inflight.keys()])) fetch.invalidate(key);
  };

  return fetch;
}
