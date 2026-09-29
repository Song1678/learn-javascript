/**
 * 练习 5-3：请求去重与缓存
 *
 * 【业务背景】
 * 商城首页有 5 个组件（顶栏头像、侧边栏会员卡、优惠券弹窗……）都需要「当前用户信息」。
 * 它们各自在挂载时调用 getUser(uid)，结果首页一打开就对同一个接口发了 5 次一模一样的请求。
 *
 * 需求：
 *  - 同一时刻对同一个 key 的多次请求，只真正发出一次，大家共享结果（in-flight 去重）
 *  - 请求成功后缓存 ttl 毫秒，期间的请求直接用缓存
 *  - 请求失败不缓存，下一次调用重新请求
 *  - 用户修改了资料后，业务方可以主动让缓存失效：invalidate(key)
 *  - 如果 invalidate 时恰好有一个请求正在进行中，那个请求的结果「不应」写入缓存（它可能是旧数据）
 *
 * 用法：
 *   const getUser = createCachedFetcher((uid) => api.get(`/users/${uid}`), { ttl: 60_000 });
 *   await getUser('u1');
 *   getUser.invalidate('u1');
 */

/**
 * @param {(key: string) => Promise<any>} fetcher
 * @param {{ ttl?: number }} options  ttl 默认 0，即只做 in-flight 去重，不缓存结果
 * @returns 一个函数 fetch(key)，另外带有 invalidate(key) 与 clear() 方法
 */
export function createCachedFetcher(fetcher, { ttl = 0 } = {}) {
  // TODO
  throw new Error('TODO: 实现 createCachedFetcher');
}
