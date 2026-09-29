/**
 * 练习 5-4：竞态问题 —— 只保留最后一次请求的结果  ⭐⭐⭐ 选做
 *
 * 卡住时看同目录的 HINTS.md；[进阶] 要求可以第二遍再做（--basic 模式会跳过对应测试）。
 *
 * 【业务背景】
 * 订单列表页有一个筛选下拉框（全部 / 待付款 / 待发货 / 已完成）。用户快速切换：
 *   选「待付款」→ 发请求 A（很慢，800ms）
 *   选「已完成」→ 发请求 B（很快，100ms）
 * 结果：B 先返回，列表显示已完成订单；然后 A 返回，列表又被覆盖成待付款订单。
 * 而下拉框上显示的却是「已完成」—— 这就是经典的「竞态条件」（race condition）Bug。
 *
 * 解决方案：每次发起新请求时，取消上一次请求。
 * 浏览器和 Node.js 都提供了标准的取消机制：AbortController / AbortSignal
 *   const controller = new AbortController();
 *   fetch(url, { signal: controller.signal });
 *   controller.abort();   // fetch 会以 name 为 'AbortError' 的错误失败
 */

/**
 * 包装一个异步函数，使得「只有最后一次调用」的结果有效。
 *
 * @param {(...args, signal: AbortSignal) => Promise<any>} asyncFn
 *        被包装的函数，最后一个参数会收到一个 AbortSignal，它可以用来真正地取消请求（例如传给 fetch）
 * @returns 包装后的函数 latest(...args)
 *
 * 要求：
 *  1. 每次调用 latest(...args)，都会创建新的 AbortController，并调用 asyncFn(...args, signal)
 *  2. 发起新调用时，上一次（尚未完成的）调用的 signal 要被 abort
 *  3. 被取代的调用返回的 Promise，要以 name === 'AbortError' 的错误失败
 *     —— 即使 asyncFn 忽略了 signal、照常返回了结果，也不能把旧结果交给调用方
 *     提示：可以用 new DOMException('请求已被取消', 'AbortError') 创建这种错误
 *  4. latest.abort()：主动取消当前进行中的调用（例如组件卸载时）
 */
export function latestOnly(asyncFn) {
  // TODO
  throw new Error('TODO: 实现 latestOnly');
}

/**
 * 附加：让任意 Promise 可以被 AbortSignal 中断
 *  - signal 已经 aborted：立即以 AbortError 失败
 *  - signal 在 promise 完成前被 abort：以 AbortError 失败
 *  - 否则跟随 promise 的结果
 *  - 注意在 promise 完成后移除对 signal 的监听，避免内存泄漏
 */
export function abortable(promise, signal) {
  // TODO
  throw new Error('TODO: 实现 abortable');
}
