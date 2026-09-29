/**
 * 练习 5-2：并发控制  ⭐⭐⭐ 选做
 *
 * 卡住时看同目录的 HINTS.md；[进阶] 要求可以第二遍再做（--basic 模式会跳过对应测试）。
 *
 * 【业务背景】
 * 商品批量导入功能：运营上传一个 Excel，里面有 500 个商品，每个商品都要把图片上传到 OSS。
 *   - 串行上传：500 × 1 秒 = 8 分钟，太慢
 *   - Promise.all 全部并行：瞬间 500 个请求，浏览器会排队，OSS 也会限流报 429
 *   - 正确做法：同时最多 N 个上传任务在跑，一个完成就补一个（「并发池」）
 */

/**
 * 以最多 limit 的并发度，对 items 中的每一项执行异步函数 iteratee
 *
 * @param {Array} items
 * @param {number} limit    最大并发数（>= 1）
 * @param {(item, index) => Promise<any>} iteratee
 * @returns {Promise<Array>} 结果数组，顺序与 items 一致
 *
 * 要求：
 *  1. 任意时刻正在执行的 iteratee 不超过 limit 个
 *  2. 一个完成后立即启动下一个（不是「每批 limit 个，整批完成再下一批」—— 那样会被最慢的拖累）
 *  3. 任意一个失败，返回的 Promise 立即以该错误失败，并且「不再启动」新的任务
 *     （已经在执行的任务无法取消，让它们自然结束即可）
 *  4. items 为空时返回 []
 *
 * 提示：一种优雅的思路是启动 limit 个「worker」，每个 worker 循环地从共享的索引中领取下一个任务。
 */
export async function mapLimit(items, limit, iteratee) {
  // TODO
  throw new Error('TODO: 实现 mapLimit');
}

/**
 * 任务队列：与 mapLimit 不同，任务是「陆续」加入的（例如用户不断点击上传按钮）
 *
 *   const queue = new TaskQueue({ concurrency: 3 });
 *   const url = await queue.add(() => uploadImage(file));   // add 返回该任务结果的 Promise
 *   await queue.onIdle();                                     // 等待所有任务完成
 *
 * 要求：
 *  1. 同时运行的任务数不超过 concurrency
 *  2. add(task) 返回 Promise，跟随 task() 的结果（成功/失败）；单个任务失败不影响队列中的其它任务
 *  3. 属性 pending：排队中（尚未开始）的任务数；属性 running：正在运行的任务数
 *  4. onIdle()：返回 Promise，在队列空闲（无排队、无运行）时 resolve；如果当前已经空闲，立即 resolve
 *  5. pause() 暂停启动新任务（运行中的不受影响）；resume() 恢复
 *  6. clear() 清空排队中的任务（它们返回的 Promise 以 new Error('任务已取消') 失败）
 */
export class TaskQueue {
  constructor({ concurrency = 1 } = {}) {
    // TODO
  }

  add(task) {
    // TODO
  }

  get pending() {
    // TODO
    return 0;
  }

  get running() {
    // TODO
    return 0;
  }

  onIdle() {
    // TODO
  }

  pause() {
    // TODO
  }

  resume() {
    // TODO
  }

  clear() {
    // TODO
  }
}
