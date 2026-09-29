/**
 * 练习 3-1：防抖 debounce  ⭐⭐
 *
 * 卡住时看同目录的 HINTS.md；[进阶] 要求可以第二遍再做（--basic 模式会跳过对应测试）。
 *
 * 【业务背景】
 * 商品搜索框需要「联想搜索」：用户每输入一个字都会触发 input 事件。
 * 如果每次都请求后端，一个 8 个字的搜索词就会打 8 次接口，后端扛不住。
 * 需求：用户停止输入 wait 毫秒后，才用「最后一次」的输入去请求。
 *
 *   input.addEventListener('input', debounce(function (e) {
 *     this.classList.add('loading');   // this 是 input 元素
 *     searchApi(e.target.value);
 *   }, 300));
 *
 * 【要求】debounce(fn, wait) 返回一个新函数 debounced：
 *  1. 每次调用 debounced 都重新计时，wait 毫秒内没有新调用时才执行 fn
 *  2. fn 执行时的 this 和参数，与「最后一次」调用 debounced 时的一致
 *  3. debounced.cancel()：取消尚未执行的调用
 *  4. debounced.flush()：如果有等待中的调用，立即执行它并返回 fn 的返回值；没有则返回 undefined
 *  5. 多个 debounce 出来的函数互不影响（每个都有自己的定时器 —— 这就是闭包的作用）
 */
export function debounce(fn, wait) {
  // TODO
  throw new Error('TODO: 实现 debounce');
}

/**
 * 附加题：节流 throttle
 *
 * 【业务背景】监听页面滚动来实现「回到顶部」按钮的显示/隐藏，scroll 事件每秒触发上百次。
 * 需求：保证 fn 最多每 wait 毫秒执行一次。
 *
 * 【要求】「首次立即执行 + 结尾补一次」：
 *  1. 第一次调用立即执行
 *  2. 在 wait 窗口期内的后续调用不会立即执行，但会记住「最后一次」的 this 和参数
 *  3. 窗口期结束时，如果期间有过调用，用最后一次的参数再执行一次（并开始新的窗口期）
 *  4. 同样提供 cancel()
 */
export function throttle(fn, wait) {
  // TODO
  throw new Error('TODO: 实现 throttle');
}
