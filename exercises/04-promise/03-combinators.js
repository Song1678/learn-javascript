/**
 * 练习 4-3：手写 Promise 组合器 all / allSettled / race / any  ⭐⭐
 *
 * 卡住时看同目录的 HINTS.md；[进阶] 要求可以第二遍再做（--basic 模式会跳过对应测试）。
 *
 * 【业务背景】
 * 商品详情页打开时需要同时请求多个接口，不同模块对失败的容忍度不同：
 *
 *   - 核心信息（详情 + 价格 + 库存）缺一不可 → all：任何一个失败，整页展示错误
 *   - 首页推荐位（猜你喜欢、排行榜、新品）互相独立 → allSettled：失败的模块隐藏即可
 *   - 图片 CDN 有多个节点 → any：哪个节点先成功返回就用哪个，全部失败才报错
 *   - 接口超时控制 → race：请求与定时器赛跑
 *
 * 【要求】
 *  - 不允许使用原生 Promise.all / allSettled / race / any（测试会检查），可以使用 Promise.resolve 与 new Promise
 *  - 参数是任意「可迭代对象」（数组、Set、生成器……），元素可以是 Promise，也可以是普通值
 *  - 结果顺序与输入顺序一致，而不是完成顺序
 */

/**
 * 全部成功才成功，结果为值数组；任意一个失败立即以该错误失败。
 * 空迭代对象 → 立即 resolve([])
 */
export function all(iterable) {
  // TODO
  throw new Error('TODO: 实现 all');
}

/**
 * 等待全部完成（无论成功失败），结果形如：
 *   [{ status: 'fulfilled', value }, { status: 'rejected', reason }]
 * 永远不会 reject。
 */
export function allSettled(iterable) {
  // TODO
  throw new Error('TODO: 实现 allSettled');
}

/**
 * 以第一个「完成」（无论成功失败）的结果为准。
 * 空迭代对象 → 永远 pending。
 */
export function race(iterable) {
  // TODO
  throw new Error('TODO: 实现 race');
}

/**
 * 以第一个「成功」的结果为准；全部失败时以 AggregateError 失败，
 * 其 errors 属性按输入顺序包含所有失败原因。
 * 空迭代对象 → 立即以 AggregateError 失败。
 */
export function any(iterable) {
  // TODO
  throw new Error('TODO: 实现 any');
}
