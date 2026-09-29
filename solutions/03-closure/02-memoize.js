/**
 * 练习 3-2 参考答案：memoize
 */
export function memoize(fn, options = {}) {
  const { resolver = (first) => first, ttl = Infinity, maxSize = Infinity } = options;
  // 闭包中的私有状态：外部无法直接访问 store，只能通过我们暴露的 cache 接口操作
  const store = new Map(); // key -> { value, expiresAt }

  function memoized(...args) {
    const key = resolver.apply(this, args);
    const now = Date.now();

    if (store.has(key)) {
      const entry = store.get(key);
      if (entry.expiresAt > now) {
        // LRU：访问后移到末尾（最新）
        store.delete(key);
        store.set(key, entry);
        return entry.value;
      }
      store.delete(key);
    }

    const value = fn.apply(this, args);
    const entry = { value, expiresAt: now + ttl };
    store.set(key, entry);

    if (store.size > maxSize) {
      // Map 的第一个 key 就是最久未访问的
      store.delete(store.keys().next().value);
    }

    if (value && typeof value.then === 'function') {
      value.then(undefined, () => {
        // 只删除「自己」这一条：期间如果 key 已被新的调用覆盖，不能误删
        if (store.get(key) === entry) store.delete(key);
      });
    }
    return value;
  }

  memoized.cache = {
    has: (key) => store.has(key) && store.get(key).expiresAt > Date.now(),
    delete: (key) => store.delete(key),
    clear: () => store.clear(),
    get size() {
      return store.size;
    },
  };

  return memoized;
}
