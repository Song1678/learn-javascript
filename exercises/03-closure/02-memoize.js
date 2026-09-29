/**
 * 练习 3-2：带过期时间和容量上限的缓存函数 memoize  ⭐⭐
 *
 * 卡住时看同目录的 HINTS.md；[进阶] 要求可以第二遍再做（--basic 模式会跳过对应测试）。
 *
 * 【业务背景】
 * 商品详情页里，「计算会员价」和「查询商品库存」这两个函数调用非常频繁：
 *   - calcVipPrice(sku, level) 是纯计算，但比较耗时 → 结果可以永久缓存
 *   - fetchStock(sku) 是异步请求，库存会变化 → 结果缓存 5 秒即可；
 *     如果请求失败，不能把失败结果缓存下来，否则 5 秒内所有人都看到「查询失败」
 *   - 商品 SKU 有几十万个，缓存不能无限增长 → 需要容量上限，超出时淘汰「最久未使用」的（LRU）
 *
 * 【要求】memoize(fn, options) 返回 memoized 函数：
 *   options.resolver  (...args) => key，计算缓存 key。默认使用第一个参数作为 key
 *   options.ttl       缓存有效期（毫秒）。不传表示永不过期
 *   options.maxSize   最大缓存条数。不传表示不限制。超出时删除「最久未被访问」的条目
 *
 *  1. 相同 key 命中缓存时，不再调用 fn
 *  2. fn 调用时的 this 与 memoized 被调用时一致
 *  3. 如果 fn 返回 Promise 且该 Promise 被 reject，要把这个 key 从缓存中删除
 *     （注意：同一时刻并发的两次调用应该共享同一个 Promise —— 缓存的就是 Promise 本身）
 *  4. memoized.cache 暴露一个对象，至少支持：
 *        has(key)、delete(key)、clear()、size（属性，当前条数）
 *
 * 提示：Map 会按插入顺序迭代，map.keys().next().value 就是最早插入的 key。
 *       「访问」一个 key 时，先 delete 再 set，就能把它移到最后 —— 这就是最简单的 LRU。
 */
export function memoize(fn, options = {}) {
  // TODO
  throw new Error('TODO: 实现 memoize');
}
