/**
 * 练习 6-3：用生成器构建惰性数据处理管道
 *
 * 【业务背景】
 * 线上订单服务变慢了，你需要从一个几 GB 的访问日志中找出「前 3 条访问 /api/order 且耗时超过 1000ms 的请求」。
 *
 * 如果用数组方法：
 *   text.split('\n').map(parse).filter(isSlowOrder).slice(0, 3)
 * 会把整个文件切成几千万行的数组，再 map 出几千万个对象，再 filter……内存直接爆掉，
 * 而实际上可能前 1000 行就已经找到 3 条了。
 *
 * 用生成器：每个环节都是「拉一个、处理一个、交出一个」，找到 3 条就立刻停止，前面的环节也随之停止。
 *
 *   const result = pipe(
 *     lines(logText),
 *     map(parseLogLine),
 *     filter((log) => log.path === '/api/order' && log.cost > 1000),
 *     limit(3),
 *   );
 *   [...result];
 *
 * 【要求】
 *  - map / filter / limit / chunk 都是「高阶函数」：接收配置，返回一个「生成器函数」(iterable) => iterator
 *  - 所有操作都必须是惰性的：不允许先把输入转成数组（测试会用无限序列来验证）
 */

/**
 * 逐行产出 text 中的每一行（以 '\n' 分隔），不允许使用 split（它会一次性创建整个数组）
 * 提示：indexOf('\n', fromIndex) + slice
 * 末尾如果是换行符，不产出最后的空行
 */
export function* lines(text) {
  // TODO
}

/** map(fn)：对每一项应用 fn(item, index) */
export function map(fn) {
  // TODO
  return function* (iterable) {};
}

/** filter(predicate)：只保留 predicate(item, index) 为真的项 */
export function filter(predicate) {
  // TODO
  return function* (iterable) {};
}

/** limit(n)：只取前 n 项；取够后立即结束（不再从上游拉取） */
export function limit(n) {
  // TODO
  return function* (iterable) {};
}

/** chunk(size)：每 size 项打包成一个数组产出，最后不足 size 的也要产出（用于分批写入数据库） */
export function chunk(size) {
  // TODO
  return function* (iterable) {};
}

/**
 * pipe(source, ...operators)：把 source 依次交给每个操作符处理，返回最终的可迭代对象
 * pipe(src, a, b, c) 等价于 c(b(a(src)))
 */
export function pipe(source, ...operators) {
  // TODO
}

/**
 * 解析一行日志，格式：`2026-09-29T10:00:00Z GET /api/order 1234ms 200`
 * 返回 { time, method, path, cost: number, status: number }
 */
export function parseLogLine(line) {
  const [time, method, path, cost, status] = line.trim().split(/\s+/);
  return { time, method, path, cost: parseInt(cost, 10), status: Number(status) };
}
